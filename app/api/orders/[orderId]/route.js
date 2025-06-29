import Order from '../../../../models/Order';
import connectDB from '../../../../lib/connectDB';

export async function GET(req, { params }) {
  await connectDB();
  const { orderId } =await params;
  const order = await Order.findById(orderId);
  if (!order) {
    return new Response(JSON.stringify({ error: "Order not found" }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }
  return new Response(JSON.stringify({ order }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

// PUT /api/orders/[orderId] - update order fields (e.g., orderStatus)
export async function PUT(req, { params }) {
  await connectDB();
  try {
    const { orderId } =await params;
    const update = await req.json();
    const order = await Order.findByIdAndUpdate(orderId, update, { new: true });
    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found', success: false }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ order, success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message, success: false }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}