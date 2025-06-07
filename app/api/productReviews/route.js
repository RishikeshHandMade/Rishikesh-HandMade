import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import ProductReview from '@/models/ProductReview';
import Product from "@/models/Product"
// POST: Add a new product review
export async function POST(req) {
  await connectDB();
  try {
    const { productId, rating, title, review, createdBy } = await req.json();
    if (!productId || !rating || !review || !createdBy) {
      return NextResponse.json({ error: 'Missing productId, rating, review, or createdBy' }, { status: 400 });
    }
    // Create the review
    const reviewDoc = await ProductReview.create({ product: productId, rating, title, review, createdBy });
    // Push review _id to Product's reviews array
    await Product.findByIdAndUpdate(productId, { $push: { reviews: reviewDoc._id } });
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
    const { reviewId, productId, rating, title, review } = await req.json();
    if (!reviewId || !productId) {
      return NextResponse.json({ error: 'Missing reviewId or productId' }, { status: 400 });
    }
    // Update the review
    const updatedReview = await ProductReview.findByIdAndUpdate(
      reviewId,
      { rating, title, review },
      { new: true }
    );
    // Ensure the reviewId is in the Product's reviews array (add if not present)
    await Product.findByIdAndUpdate(productId, { $addToSet: { reviews: reviewId } });
    return NextResponse.json({ success: true, review: updatedReview });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Delete a review by reviewId
export async function DELETE(req) {
  await connectDB();
  try {
    const { reviewId, productId } = await req.json();
    if (!reviewId || !productId) {
      return NextResponse.json({ error: 'Missing reviewId or productId' }, { status: 400 });
    }
    // Remove review reference from Product
    await Product.findByIdAndUpdate(productId, { $pull: { reviews: reviewId } });
    // Delete the review itself
    await ProductReview.findByIdAndDelete(reviewId);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });  
  }
}
