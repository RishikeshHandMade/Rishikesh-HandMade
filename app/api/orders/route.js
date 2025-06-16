import { NextResponse } from 'next/server';
import Order from '../../../models/Order';
import connectDB from '@/lib/connectDB';

export async function POST(req) {
  await connectDB();
  try {
    const body = await req.json();
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
