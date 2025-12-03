import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Product from '@/models/Product';
import Size from '@/models/Size';
import Color from '@/models/Color';
import mongoose from 'mongoose';
import Artisan from '@/models/Artisan';
import Gallery from '@/models/Gallery';
import Video from '@/models/Video';
import Description from '@/models/Description';
import Info from '@/models/Info';
import CategoryTag from '@/models/CategoryTag';
import ProductReview from '@/models/ProductReview';
import Quantity from '@/models/Quantity';
import ProductCoupons from '@/models/ProductCoupons';
import ProductTax from '@/models/ProductTax';
import ProductTagLine from '@/models/ProductTagLine';
// Ensure models are registered
import '@/models/Artisan';
import '@/models/Gallery';
import '@/models/Video';
import '@/models/Description';
import '@/models/Info';
import '@/models/CategoryTag';
import '@/models/ProductReview';
import '@/models/Quantity';
import '@/models/ProductCoupons';
import '@/models/ProductTax';
import '@/models/ProductTagLine';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('id');

  if (!productId) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    await connectDB();
    const currentProduct = await Product.findById(new mongoose.Types.ObjectId(productId));
    if (!currentProduct || !currentProduct.category) {
      return NextResponse.json({ error: 'Product not found or missing category' }, { status: 404 });
    }
    const fbtProducts = await Product.find({
      _id: { $ne: new mongoose.Types.ObjectId(productId) },
      category: currentProduct.category,
      isDirect: false,
      active: true
    })
      .populate([
        'gallery',
        { path: 'color', model: 'Color' },
        { path: 'size', model: 'Size' },
        'price',
        'video',
        'description',
        'info',
        'categoryTag',
        'quantity',
        'coupons',
        'artisan'
      ])
      .limit(8)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return NextResponse.json(fbtProducts);
  } catch (error) {
    console.error('Error fetching frequently bought together products:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
