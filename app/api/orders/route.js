import { NextResponse } from 'next/server';
import Order from '../../../models/Order';
import connectDB from '@/lib/connectDB';
import Product from '@/models/Product';
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

    // ✅ Update quantity of each product
    const products = body.products || body.items || [];
    for (const item of products) {
      const productId = item.productId;
      const variantId = item.variantId; // This should be passed in the frontend
      const qtyOrdered = item.quantity || 1;
    
      if (!productId || !variantId || !qtyOrdered) {
        console.error('Invalid product data:', { productId, variantId, qtyOrdered });
        continue;
      }
    
      try {
        // Step 1: Load the product
        const product = await Product.findById(productId);
        if (!product) {
          console.error('Product not found:', productId);
          continue;
        }
    
        // Step 2: Find the variant
        const variant = product.variants.find(v => v._id.toString() === variantId);
        if (!variant) {
          console.error('Variant not found:', variantId, 'in product:', productId);
          continue;
        }
    
        // Step 3: Reduce the quantity
        variant.qty = variant.qty - qtyOrdered;
        
        // Step 4: Save the product
        await product.save();
        console.log('Successfully updated quantity for product:', productId, 'variant:', variantId);
      } catch (error) {
        console.error('Error updating quantity for product:', productId, 'variant:', variantId, error);
      }
    }

    return NextResponse.json({ orderId: order._id, success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 });
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


