// Example: app/api/products/related/route.js (Next.js 13+ with app directory)
import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Product from '@/models/Product';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('id');
  const category = searchParams.get('category');

  if (!productId || !category) {
    return NextResponse.json({ error: 'Missing id or category' }, { status: 400 });
  }
  await connectDB();

  // Find products in the same category, excluding the current product
  const relatedProducts = await Product.find({
    _id: { $ne: productId },
    category: category,
  }).limit(10);

  return NextResponse.json(relatedProducts);
}