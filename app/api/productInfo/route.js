import { NextResponse } from 'next/server';
import connectDB from "@/lib/connectDB";
import Info from '@/models/Info';
import Product from '@/models/Product';
// POST: Add or update overview for a product
export async function POST(req) {
  await connectDB();
  try {
    const { productId, overview } = await req.json();
    if (!productId || !overview) {
      return NextResponse.json({ error: 'Missing productId or overview' }, { status: 400 });
    }
    let infoDoc = await Info.findOne({ product: productId });
    if (infoDoc) {
      infoDoc.info = overview;
      await infoDoc.save();
    } else {
      infoDoc = await Info.create({ product: productId, info: overview });
    }
    // Optionally link Info to Product
    await Product.findByIdAndUpdate(productId, { info: infoDoc._id });
    return NextResponse.json({ success: true, info: infoDoc });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET: Get info for a product
export async function GET(req) {
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }
    const infoDoc = await Info.findOne({ product: productId });
    return NextResponse.json({ info: infoDoc });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: Update overview
export async function PATCH(req) {
  await connectDB();
  try {
    const { productId, overview } = await req.json();
    if (!productId || !overview) {
      return NextResponse.json({ error: 'Missing productId or overview' }, { status: 400 });
    }
    const infoDoc = await Info.findOneAndUpdate(
      { product: productId },
      { info: overview },
      { new: true }
    );
    return NextResponse.json({ info: infoDoc });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Remove info by productId
export async function DELETE(req) {
  await connectDB();
  try {
    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }
    await Info.findOneAndDelete({ product: productId });
    await Product.findByIdAndUpdate(productId, { info: null });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
