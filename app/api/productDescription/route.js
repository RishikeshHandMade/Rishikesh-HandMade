import connectDB from "@/lib/connectDB";
import Description from '@/models/Description';
import Product from '@/models/Product';
// POST: Add or update a description for a product
export async function POST(req) {
  await connectDB();
  try {
    const { productId, description, titleTag } = await req.json();
    if (!productId || !description || !titleTag) {
      return Response.json({ error: 'Missing productId or description or titleTag' }, { status: 400 });
    }
    let descDoc = await Description.findOne({ product: productId });

    if (descDoc) {
      descDoc.titleTag = titleTag;
      descDoc.description = description;
      await descDoc.save();
    } else {
      descDoc = await Description.create({ product: productId, description, titleTag });
    }
    // Optionally link Description to Product
    await Product.findByIdAndUpdate(productId, { description: descDoc._id });
    return Response.json({ success: true, description: descDoc });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// GET: Get description for a product
export async function GET(req) {
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    if (!productId) {
      return Response.json({ error: 'Missing productId' }, { status: 400 });
    }
    const descDoc = await Description.findOne({ product: productId });
    return Response.json({ description: descDoc });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: Update description
export async function PATCH(req) {
  await connectDB();
  try {
    const { productId, description, titleTag } = await req.json();
    if (!productId || !description || !titleTag) {
      return Response.json({ error: 'Missing productId or description or titleTag' }, { status: 400 });
    }
    const descDoc = await Description.findOneAndUpdate(
      { product: productId },
      { description, titleTag },
      { new: true }
    );
    return Response.json({ description: descDoc });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Remove description by productId
export async function DELETE(req) {
  await connectDB();
  try {
    const { productId } = await req.json();
    if (!productId) {
      return Response.json({ error: 'Missing productId' }, { status: 400 });
    }
    await Description.findOneAndDelete({ product: productId });
    await Product.findByIdAndUpdate(productId, { description: null });
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
