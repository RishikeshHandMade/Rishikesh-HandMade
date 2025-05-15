// API Route for updating and deleting a product by ID
import connectDB from "@/lib/connectDB";
import Product from '@/models/Product';

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

// DELETE: Remove the product
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
    return new Response(JSON.stringify({ message: 'Product deleted' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
