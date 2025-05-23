import MenuBar from '@/models/MenuBar';
import connectDB from '@/utils/connectDB';

export async function POST(req) {
    await connectDB();
    const { subMenuId, productId } = await req.json();
    console.log(subMenuId,productId)
    if (!subMenuId || !productId) {
        return new Response(JSON.stringify({ error: 'Missing subMenuId or productId' }), { status: 400 });
    }
    // Find the menu containing this subMenu
    // 1. Link product to submenu
    const mongoose = (await import('mongoose')).default;
    const subMenuObjectId = mongoose.Types.ObjectId(subMenuId);
    const productObjectId = mongoose.Types.ObjectId(productId);
    // Use positional operator to update the correct subMenu
    const menu = await MenuBar.findOneAndUpdate(
        { "subMenu._id": subMenuObjectId },
        { $push: { "subMenu.$.products": productObjectId } },
        { new: true }
    );
    console.log("MenuBar update result:", menu);
    if (!menu) {
        console.error('MenuBar update failed for subMenuId:', subMenuId, 'productId:', productId);
    }
    if (!menu) {
        return new Response(JSON.stringify({ error: 'SubMenu not found' }), { status: 404 });
    }
    // 2. Update the Product's category field
    const Product = (await import('@/models/Product')).default;
    await Product.findByIdAndUpdate(productId, { category: subMenuId });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
}