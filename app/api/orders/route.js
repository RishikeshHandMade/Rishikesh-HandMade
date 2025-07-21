import { NextResponse } from 'next/server';
import Order from '../../../models/Order';
import connectDB from '@/lib/connectDB';

export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();
    const isOnline = body.payment === 'online' || body.paymentMethod === 'online';
    if (isOnline && !body.transactionId) {
      body.transactionId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    } else if (!isOnline) {
      delete body.transactionId;
    }

    // Normalize products array to always include all fields and ensure image is a string
    if (Array.isArray(body.products)) {
      body.products = body.products.map(product => ({
        ...product,
        image: typeof product.image === 'string'
          ? product.image
          : (product.image && typeof product.image === 'object' && product.image
              ? product.image
              : ''),
        _id: product.productId || product._id || product.id
      }));
    }

    // ✅ Save the order
    body.agree = true; // Always set agree true for all new orders
    const order = await Order.create(body);

    // ✅ Update quantities using the updateQuantities endpoint
    const products = Array.isArray(body.products) ? body.products : [];
    const items = Array.isArray(body.items) ? body.items : [];
    
    const itemsToUpdate = [];
    
    // First, process the items array if it exists (for quantity updates)
    for (const item of items) {
      try {
        const productId = item.productId || item._id;
        if (!productId) {
          // console.warn('Skipping item with no product ID:', JSON.stringify(item, null, 2));
          continue;
        }
        
        itemsToUpdate.push({
          productId,
          variantId: item.variantId || 0,
          quantity: item.qty || 1,
          size: item.size,
          price: item.price,
          discount: item.discount,
          total: item.total,
          image:item.image
        });
      } catch (error) {
        // console.error('Error processing item:', error, 'Item:', JSON.stringify(item, null, 2));
      }
    }
    
    // If no items were found in the items array, try to extract from products
    if (itemsToUpdate.length === 0) {
      for (const product of products) {
        try {
          const productId = product._id || product.id;
          if (!productId) {
            // console.warn('Skipping product with no ID:', JSON.stringify(product, null, 2));
            continue;
          }
          
          // If we have variants, find the matching one
          if (product.quantity?.variants?.length > 0) {
            let variantIndex = 0;
            
            // If variant is specified, find its index
            if (product.variantId !== undefined) {
              variantIndex = product.quantity.variants.findIndex(
                v => v._id === product.variantId || v.size === product.size
              );
              if (variantIndex === -1) variantIndex = 0;
            }
            // Otherwise try to find by size
            else if (product.size) {
              variantIndex = product.quantity.variants.findIndex(
                v => v.size === product.size
              );
              if (variantIndex === -1) variantIndex = 0;
            }
            
            itemsToUpdate.push({
              productId,
              variantId: variantIndex,
              quantity: product.qty || 1,
              size: product.size,
              price: product.price,
              discount: product.discount,
              total: product.total,
              image: product.image
            });
          } 
          // No variants, just use the product
          else {
            itemsToUpdate.push({
              productId,
              variantId: 0,
              quantity: product.qty || 1,
              size: product.size,
              price: product.price,
              discount: product.discount,
              total: product.total,
              image: product.image
            });
          }
        } catch (error) {
          console.error('Error processing product:', error, 'Product:', JSON.stringify(product, null, 2));
        }
      }
    }

    // console.log('Attempting to update quantities for items:', JSON.stringify(itemsToUpdate, null, 2));

    if (itemsToUpdate.length > 0) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/product/updateQuantities`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ items: itemsToUpdate })
        });

        const responseData = await response.json().catch(() => ({}));
        
        if (!response.ok) {
          // console.error('Failed to update quantities. Status:', response.status);
          // console.error('Response:', responseData);
          // Continue with order creation even if quantity update fails
        } else {
          // console.log('Successfully updated quantities:', responseData);
          if (responseData.results) {
            responseData.results.forEach(result => {
              if (result.success) {
                // console.log(`Updated product ${result.productId}, variant ${result.variantId}: ${result.previousQty} → ${result.newQty}`);
              } else {
                // console.error(`Failed to update product ${result.productId}, variant ${result.variantId}:`, result.error);
              }
            });
          }
        }
      } catch (error) {
        // console.error('Error in quantity update process:', {
          // error: error.message,
        //   stack: error.stack,
        //   name: error.name
        // });
      }
    }

    return NextResponse.json({ 
      orderId: order._id, 
      success: true 
    }, { status: 200 });
  } catch (error) {
    // console.error('Error creating order:', error);
    return NextResponse.json({ 
      error: error.message, 
      success: false 
    }, { status: 500 });
  }
}

import { getServerSession } from "next-auth/next";

// GET /api/orders - fetch only orders for the current user with agree === true
export async function GET(req) {
  await connectDB();
  const session = await getServerSession();
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
  }
  try {
    const orders = await Order.find({ agree: true, email: session.user.email }).sort({ createdAt: -1 });
    return NextResponse.json({ orders, success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 });
  }
}


