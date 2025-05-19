// API Route for fetching, updating, and deleting a product by ID
import connectDB from "@/lib/connectDB";
import Product from '@/models/Product';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const product = await Product.findById(id);
    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(product), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
    }
    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
// PATCH: Update any part of the product (sizes, colors, gallery, etc.)
export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();
    const updated = await Product.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}