import { NextResponse } from 'next/server';
import Order from '../../../models/Order';
import connectDB from '@/lib/connectDB';

export async function POST(req) {
  await connectDB();
  try {
    const body = await req.json();

    // Generate unique orderId and transactionId for COD
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

    // Only apply for COD orders
    if (body.payment === 'cod') {
      body.orderId = generateOrderId(6);
      body.transactionId = generateTransactionId();
    }

    // Save all checkoutData as received
    const order = await Order.create(body);
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
