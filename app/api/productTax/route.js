import ProductTax from '@/models/ProductTax';
import Product from '@/models/Product';
import connectDB from '@/lib/connectDB';

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const product = searchParams.get('product');
  try {
    if (product) {
      const data = await ProductTax.findOne({ product });
      return Response.json({ data });
    } else {
      const data = await ProductTax.find({});
      return Response.json({ data });
    }
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  await connectDB();
  try {
    const { product, cgst = 0, sgst = 0 } = await req.json();
    if (!product) return Response.json({ error: 'Product is required' }, { status: 400 });
    let doc = await ProductTax.findOne({ product });
    if (doc) {
      doc.cgst = cgst;
      doc.sgst = sgst;
      await doc.save();
    } else {
      doc = await ProductTax.create({ product, cgst, sgst });
    }
    return Response.json({ data: doc });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  await connectDB();
  try {
    const { product, cgst = 0, sgst = 0 } = await req.json();
    if (!product) return Response.json({ error: 'Product is required' }, { status: 400 });
    const doc = await ProductTax.findOneAndUpdate(
      { product },
      { cgst, sgst },
      { new: true }
    );
    return Response.json({ data: doc });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  await connectDB();
  try {
    const { product, tax } = await req.json();
    if (!product) return Response.json({ error: 'Product is required' }, { status: 400 });
    if (tax === '__all__') {
      // Remove all taxes for product
      await ProductTax.deleteOne({ product });
      return Response.json({ success: true });
    } else {
      // Remove a single tax from the array
      const doc = await ProductTax.findOneAndUpdate(
        { product },
        { $pull: { taxes: tax } },
        { new: true }
      );
      return Response.json({ data: doc });
    }
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
