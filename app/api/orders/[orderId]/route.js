import Order from '../../../../models/Order';
import connectDB from '../../../../lib/connectDB';

export async function GET(req, { params }) {
  await connectDB();
  const { orderId } = params;
  const order = await Order.findById(orderId);
  if (!order) {
    return new Response(JSON.stringify({ error: "Order not found" }), { status: 404 });
  }
  return new Response(JSON.stringify({ order }), { status: 200 });
}