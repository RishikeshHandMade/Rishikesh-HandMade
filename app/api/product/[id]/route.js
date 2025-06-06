// API Route for fetching, updating, and deleting a product by ID
import connectDB from "@/lib/connectDB";
import Product from '@/models/Product';
import '@/models/Artisan';
import '@/models/Price';
import '@/models/Gallery';
import '@/models/Video';
import '@/models/Description';
import '@/models/Info';
import '@/models/CategoryTag';
import '@/models/ProductReview';
import '@/models/ProductTax';
import '@/models/ProductCoupons';
import '@/models/Quantity';

export async function GET(req, { params }) {
  try {
    await connectDB();
    let { id } = await params;
    try {
      id = decodeURIComponent(id);
    } catch (e) {}
    // Strictly fetch by MongoDB _id
    const product = await Product.findById(id)
      .populate('artisan')
      // .populate('size')
      // .populate('color')
      .populate('price')
      .populate('gallery')
      .populate('video')
      .populate('description')
      .populate('info')
      .populate('categoryTag')
      .populate('reviews')
      .populate('quantity')
      .populate('coupons')
      .populate('taxes');
    if (!product || !product.active) {
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
    const { id } = await params;
    // Find the product to get the artisan reference before deleting
    const product = await Product.findById(id).populate('artisan');
    if (!product || !product.active) {
      return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
    }
    // Remove the product reference from the artisan's products array
    if (product.artisan) {
      const Artisan = require('@/models/Artisan');
      await Artisan.findByIdAndUpdate(
        product.artisan,
        { $pull: { products: product._id } }
      );
    }
    // Delete all color and size docs for this product
    const Color = require('@/models/Color');
    const Size = require('@/models/Size');
    await Color.deleteMany({ product: id });
    await Size.deleteMany({ product: id });

    // Now delete the product
    await Product.findByIdAndDelete(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
// PATCH: Update any part of the product (sizes, colors, gallery, etc.)
export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    // PATCH can update url, title, artisan, etc.
    const updated = await Product.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}