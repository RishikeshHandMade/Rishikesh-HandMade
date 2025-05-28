// API Route for ProductProfile (Create Product)
import connectDB from "@/lib/connectDB";
import Product from '@/models/Product';
import Artisan from '@/models/Artisan';
import Size from '@/models/Size';
import Color from '@/models/Color';
import Gallery from '@/models/Gallery';
import Video from '@/models/Video';
import Description from '@/models/Description';
import Info from '@/models/Info';
import CategoryTag from '@/models/CategoryTag';
import ProductReview from '@/models/ProductReview';
import Quantity from '@/models/Quantity';
import ProductCoupons from '@/models/ProductCoupons';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    // Accept all relevant fields
    const { title, code, artisan, isDirect, categoryTag, ...rest } = body;
    if (!title || !code || !artisan) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }
    // If explicitly direct, ignore categoryTag
    let productData = {
      title,
      code,
      artisan,
      isDirect: true,
      ...rest
    };
    // If not direct, require categoryTag
    if (!isDirect) {
      if (!categoryTag) {
        return new Response(JSON.stringify({ error: 'categoryTag required for category products' }), { status: 400 });
      }
      productData.isDirect = false;
      productData.categoryTag = categoryTag;
    }
    // Create product with proper linkage
    const product = await Product.create(productData);
    // Add product ref to artisan
    await Artisan.findByIdAndUpdate(
      artisan,
      { $push: { products: product._id } },
      { new: true, upsert: false }
    );
    return new Response(JSON.stringify(product), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const name = searchParams.get('name');
    // Support direct products filter for ProductProfile page
    const isDirectParam = searchParams.get('isDirect');
    if (id) {
      // Find by MongoDB _id
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
        .populate('coupons');
      if (!product) {
        return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
      }
      return new Response(JSON.stringify(product), { status: 200 });
    } else if (name) {
      // Fallback to slug search
      const product = await Product.findOne({ slug: name })
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
        .populate('coupons');
      if (!product) {
        return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
      }
      return new Response(JSON.stringify(product), { status: 200 });
    } else {
      // Filter by isDirect if requested
      let filter = {};
      if (isDirectParam === 'true') filter.isDirect = true;
      if (isDirectParam === 'false') filter.isDirect = false;
      const products = await Product.find(filter)
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
        .populate('coupons');
      return new Response(JSON.stringify(products), { status: 200 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
