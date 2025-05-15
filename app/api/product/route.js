// API Route for ProductProfile (Create Product)
import connectDB from "@/lib/connectDB";
import Product from '@/models/Product';
import Artisan from '@/models/Artisan';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    // Accept ProductProfile fields (require price as well)
    const { title, code, artisan, price } = body;
    if (!title || !code || !artisan || price === undefined) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }
    // Create product
    const product = await Product.create({ title, code, artisan, price });
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

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({}, 'title code artisan'); // Only profile fields
    return new Response(JSON.stringify(products), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
