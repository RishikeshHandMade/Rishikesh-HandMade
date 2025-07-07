import User from "@/models/User";
import CartList from "@/models/CartList";
import mongoose from "mongoose";

// POST: Sync cart with database
export async function POST(req) {
  try {
    const { userId, cart } = await req.json();
    if (!userId || !Array.isArray(cart)) {
      return new Response(JSON.stringify({ error: "Missing userId or cart" }), { status: 400 });
    }
    // Find user by id or email (robust to ObjectId)
    const userQuery = mongoose.Types.ObjectId.isValid(userId)
      ? { $or: [{ _id: userId }, { email: userId }] }
      : { email: userId };
    const user = await User.findOne(userQuery);
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

// DELETE: Clear cart from database
export async function DELETE(req) {
  try {
    const { userId } = await req.json();
    console.log('DELETE request received with userId:', userId);
    
    if (!userId) {
      console.error('No userId provided');
      return new Response(JSON.stringify({ error: "Missing userId" }), { status: 400 });
    }

    // Find user by id or email
    const userQuery = mongoose.Types.ObjectId.isValid(userId)
      ? { $or: [{ _id: userId }, { email: userId }] }
      : { email: userId };
    
    console.log('Searching for user with query:', userQuery);
    const user = await User.findOne(userQuery);
    if (!user) {
      console.error('User not found for query:', userQuery);
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    console.log('Found user:', user._id);
    
    // Clear cart from User model
    user.cart = [];
    await user.save();
    console.log('Successfully cleared cart from User model');

    // Clear cart from CartList model
    const cartList = await CartList.findOne({ user: user._id });
    if (cartList) {
      console.log('Found cartList:', cartList._id);
      cartList.items = [];
      await cartList.save();
      console.log('Successfully cleared cart from CartList model');
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}