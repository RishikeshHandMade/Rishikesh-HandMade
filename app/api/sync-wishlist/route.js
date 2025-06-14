import User from "@/models/User";
import Wishlist from "@/models/Wishlist";

export async function POST(req) {
  try {
    const { userId, wishlist } = await req.json();
    if (!userId || !Array.isArray(wishlist)) {
      return new Response(JSON.stringify({ error: "Missing userId or wishlist" }), { status: 400 });
    }
    // Find user by id or email
    const user = await User.findOne({ $or: [{ _id: userId }, { email: userId }] });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }
    user.wishlist = wishlist;
    await user.save();

    // Update Wishlist collection
    let wishlistDoc = await Wishlist.findOne({ user: user._id });
    if (!wishlistDoc) {
      wishlistDoc = new Wishlist({ user: user._id, items: wishlist });
    } else {
      wishlistDoc.items = wishlist;
    }
    await wishlistDoc.save();

    return new Response(JSON.stringify({ success: true, wishlist: user.wishlist }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
