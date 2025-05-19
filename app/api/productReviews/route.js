import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import ProductReview from '@/models/ProductReview';

// POST: Add a new product review
export async function POST(req) {
  await connectDB();
  try {
    const { productId, rating, title, review, createdBy } = await req.json();
    if (!productId || !rating || !review || !createdBy) {
      return NextResponse.json({ error: 'Missing productId, rating, review, or createdBy' }, { status: 400 });
    }
    const reviewDoc = await ProductReview.create({ product: productId, rating, title, review, createdBy });
    return NextResponse.json({ success: true, review: reviewDoc });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
      
// GET: Get reviews for a product
export async function GET(req) {
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }
    const reviews = await ProductReview.find({ product: productId }).sort({ createdAt: -1 });
    return NextResponse.json({ reviews });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: Update a review by reviewId
export async function PATCH(req) {
  await connectDB();
  try {
    const { reviewId, rating, title, review,createdBy } = await req.json();
    if (!reviewId) {
      return NextResponse.json({ error: 'Missing reviewId' }, { status: 400 });
    }
    const updated = await ProductReview.findByIdAndUpdate(
      reviewId,
      { rating, title, review,createdBy },
      { new: true }
    );
    return NextResponse.json({ review: updated });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Delete a review by reviewId
export async function DELETE(req) {
  await connectDB();
  try {
    const { reviewId } = await req.json();
    if (!reviewId) {
      return NextResponse.json({ error: 'Missing reviewId' }, { status: 400 });
    }
    await ProductReview.findByIdAndDelete(reviewId);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
