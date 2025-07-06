import { NextResponse } from 'next/server';
import Order from '../../../models/Order';
import connectDB from '@/lib/connectDB';

export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();

    // 🔐 Generate unique IDs for COD orders only
    function generateOrderId(length = 6) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }

    function generateTransactionId() {
      return `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    if (body.payment === 'cod') {
      body.orderId = generateOrderId(6);
      body.transactionId = generateTransactionId();
    }

    // ✅ Save the order
    body.agree = true; // Always set agree true for all new orders
    const order = await Order.create(body);

    // ✅ Update quantities using the updateQuantities endpoint
    const products = body.products || body.items || [];
    
    // Debug log the raw products
    console.log('Raw products array:', JSON.stringify(products, null, 2));
    
    const itemsToUpdate = [];
    
    // Process each product in the cart
    for (const item of products) {
      try {
        // Skip if no product ID
        if (!item.productId && !item._id) {
          console.warn('Skipping item with no product ID:', JSON.stringify(item, null, 2));
          continue;
        }
        
        const productId = item.productId || item._id;
        
        // If we have a quantity object with variants, find the matching variant
        if (item.quantity?.variants?.length > 0) {
          // If variantId is provided, use it
          if (item.variantId !== undefined) {
            itemsToUpdate.push({
              productId,
              variantId: item.variantId,
              quantity: item.qty || item.quantity || 1
            });
          } 
          // Otherwise try to find the variant by size
          else if (item.size) {
            const variantIndex = item.quantity.variants.findIndex(
              v => v.size === item.size
            );
            
            if (variantIndex !== -1) {
              itemsToUpdate.push({
                productId,
                variantId: variantIndex,
                quantity: item.qty || item.quantity || 1
              });
            } else {
              console.warn(`Could not find matching variant for size ${item.size} in product ${productId}`);
            }
          }
        } 
        // Fallback to simple product with no variants
        else {
          itemsToUpdate.push({
            productId,
            variantId: 0,
            quantity: item.qty || item.quantity || 1
          });
        }
      } catch (error) {
        console.error('Error processing item:', error, 'Item:', JSON.stringify(item, null, 2));
      }
    }

    console.log('Attempting to update quantities for items:', JSON.stringify(itemsToUpdate, null, 2));

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
          console.error('Failed to update quantities. Status:', response.status);
          console.error('Response:', responseData);
          // Continue with order creation even if quantity update fails
        } else {
          console.log('Successfully updated quantities:', responseData);
          if (responseData.results) {
            responseData.results.forEach(result => {
              if (result.success) {
                console.log(`Updated product ${result.productId}, variant ${result.variantId}: ${result.previousQty} → ${result.newQty}`);
              } else {
                console.error(`Failed to update product ${result.productId}, variant ${result.variantId}:`, result.error);
              }
            });
          }
        }
      } catch (error) {
        console.error('Error in quantity update process:', {
          error: error.message,
          stack: error.stack,
          name: error.name
        });
      }
    }

    return NextResponse.json({ 
      orderId: order._id, 
      success: true 
    }, { status: 200 });
  } catch (error) {
    console.error('Error creating order:', error);
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


