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

  try {
    // Find products in the same category, excluding the current product
    const relatedProducts = await Product.find({
      _id: { $ne: productId },
      category: category,
      active: true // Only show active products
    })
    .populate('gallery')
    .populate('size')
    .populate('color')
    .populate('price')
    .populate('video')
    .populate('description')
    .populate('info')
    .populate('categoryTag')
    .populate('review')
    .populate('quantity')
    .populate('coupons')
    .limit(10);

    return NextResponse.json(relatedProducts);
  } catch (error) {
    console.error('Error fetching related products:', error);
    return NextResponse.json({ error: 'Failed to fetch related products' }, { status: 500 });
  }
}