import connectDB from "@/lib/connectDB";
import Product from '@/models/Product';
import Gallery from '@/models/Gallery';

export async function POST(req) {
  await connectDB();
  try {
    const { productId, mainImage, subImages } = await req.json();
    console.log('API DEBUG received subImages:', subImages);
    if (!productId || !mainImage) {
      return new Response(JSON.stringify({ error: 'Missing or invalid productId/mainImage' }), { status: 400 });
    }
    // Create the gallery
    const gallery = await Gallery.create({ product: productId, mainImage, subImages });
    // Push gallery reference to product
    await Product.findByIdAndUpdate(productId, { gallery: gallery._id }, { new: true });
    return new Response(JSON.stringify(gallery), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function GET() {
  await connectDB();
  try {
    const galleries = await Gallery.find().populate('product');
    return new Response(JSON.stringify(galleries), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// PATCH: Update a gallery
export async function PATCH(req) {
  await connectDB();
  try {
    const { galleryId, images } = await req.json();
    if (!galleryId || !images || !Array.isArray(images)) {
      return new Response(JSON.stringify({ error: 'Missing or invalid galleryId/images' }), { status: 400 });
    }
    const gallery = await Gallery.findByIdAndUpdate(galleryId, { images }, { new: true });
    if (!gallery) {
      return new Response(JSON.stringify({ error: 'Gallery not found' }), { status: 404 });
    }
    // No need to update Product as gallery ref remains same
    return new Response(JSON.stringify(gallery), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// DELETE: Delete a gallery and remove ref from Product
export async function DELETE(req) {
  await connectDB();
  try {
    const { galleryId } = await req.json();
    if (!galleryId) {
      return new Response(JSON.stringify({ error: 'Missing galleryId' }), { status: 400 });
    }
    const gallery = await Gallery.findById(galleryId);
    if (!gallery) {
      return new Response(JSON.stringify({ error: 'Gallery not found' }), { status: 404 });
    }
    // Remove gallery reference from Product
    await Product.findByIdAndUpdate(gallery.product, { $unset: { gallery: '' } });
    // Delete the gallery
    await Gallery.findByIdAndDelete(galleryId);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

