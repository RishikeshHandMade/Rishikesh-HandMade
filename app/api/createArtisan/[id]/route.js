import connectDB from "@/lib/connectDB";
import mongoose from 'mongoose';
let Artisan;
try {
  Artisan = mongoose.model('Artisan');
} catch {
  Artisan = require('@/models/Artisan');
}

export async function GET(req, { params }) {
  await connectDB();
  const { id } =await params;
  const artisan = await Artisan.findById(id)
    .populate('promotions')
    .populate('artisanBlogs')
    .populate('artisanStories')
    .populate('certificates')
    .populate('socialPlugin')
    .populate({
      path: 'products',
      populate: [
        { path: 'gallery' },
        { path: 'size' },
        { path: 'color' },
        { path: 'price' },
        { path: 'video' },
        { path: 'description' },
        { path: 'info' },
        { path: 'categoryTag' },
        { path: 'review' },
        { path: 'quantity' },
        { path: 'coupons' }
      ]
    })
  if (!artisan || artisan.active !== true) {
    return new Response(JSON.stringify({ message: 'Artisan not found' }), { status: 404 });
  }
  return new Response(JSON.stringify(artisan), { status: 200 });
}