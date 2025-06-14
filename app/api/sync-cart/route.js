import User from "@/models/User";
import CartList from "@/models/CartList";

export async function POST(req) {
  try {
    const { userId, cart } = await req.json();
    if (!userId || !Array.isArray(cart)) {
      return new Response(JSON.stringify({ error: "Missing userId or cart" }), { status: 400 });
    }
    // Find user by id or email
    const user = await User.findOne({ $or: [{ _id: userId }, { email: userId }] });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    // If cart is empty, treat as fetch (do not overwrite existing cart)
    if (cart.length === 0) {
      // Optionally: fetch from CartList collection as well
      let cartList = await CartList.findOne({ user: user._id });
      return new Response(JSON.stringify({
        success: true,
        cart: user.cart || [],
        cartList: cartList ? cartList.items : []
      }), { status: 200 });
    }

    // Otherwise, update cart as usual
    user.cart = cart;
    await user.save();

    // Update CartList collection
    let cartList = await CartList.findOne({ user: user._id });
    if (!cartList) {
      cartList = new CartList({ user: user._id, items: cart });
    } else {
      cartList.items = cart;
    }
    await cartList.save();

    return new Response(JSON.stringify({ success: true, cart: user.cart }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
