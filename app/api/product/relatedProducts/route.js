// Example: app/api/products/related/route.js (Next.js 13+ with app directory)
import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Product from '@/models/Product';
import MenuBar from '@/models/MenuBar';
import mongoose from 'mongoose';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('id');
  const category = searchParams.get('category');

  if (!productId || !category) {
    return NextResponse.json({ error: 'Missing id or category' }, { status: 400 });
  }

  try {
    await connectDB();
    
    // First find the MenuBar document containing this category in its subMenu
    const menuBar = await MenuBar.findOne({
      'subMenu._id': new mongoose.Types.ObjectId(category)
    });

    if (!menuBar) {
      return NextResponse.json([]);
    }

    // Find the specific submenu
    const submenu = menuBar.subMenu.find(sub => 
      sub._id.toString() === category
    );

    if (!submenu || !submenu.products || submenu.products.length === 0) {
      return NextResponse.json([]);
    }

    // Get related products from this submenu's products array
    const relatedProducts = await Product.find({
      _id: { 
        $in: submenu.products,
        $ne: new mongoose.Types.ObjectId(productId)
      },
      active: true,
      isDirect: false
    })
    .populate([
      'gallery',
      'color',
      'size',
      'price',
      'video',
      'description',
      'info',
      'categoryTag',
      'quantity',
      'coupons',
      'artisan'
    ])
    .limit(12)
    .sort({ createdAt: -1 })
    .lean()
    .exec();

    return NextResponse.json(relatedProducts);
  } catch (error) {
    console.error('Error fetching related products:', error);
    return NextResponse.json({ error: 'Failed to fetch related products' }, { status: 500 });
  }
}