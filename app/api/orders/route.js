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
    const order = await Order.create(body);

    // ✅ Update quantity of each product
    const products = body.products || body.items || [];
    for (const item of body.products || body.items || []) {
      const productId = item.productId || item._id || item.id;
      const variantId = item.variantId || item.variant?._id; // Pass variant ID in frontend
      const qtyOrdered = item.qty || item.quantity || 1;
    
      if (!productId || !variantId || !qtyOrdered) continue;
    
      // Step 1: Load the product
      const product = await Product.findById(productId);
      if (!product) continue;
    
      // Step 2: Find the variant
      const variantIndex = product.variants.findIndex(
        (v) => v._id.toString() === variantId.toString()
      );
      if (variantIndex === -1) continue;
    
      // Step 3: Reduce the quantity
      product.variants[variantIndex].qty -= qtyOrdered;
    
      // Step 4: Save the product
      await product.save();
    }

    return NextResponse.json({ orderId: order._id, success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 });
  }
}

// GET /api/orders - fetch only orders with agree === true
export async function GET(req) {
  await connectDB();
  try {
    const orders = await Order.find({ agree: true }).sort({ createdAt: -1 });
    return NextResponse.json({ orders, success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 });
  }
}


