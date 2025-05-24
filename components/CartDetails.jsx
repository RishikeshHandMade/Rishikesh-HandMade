"use client";
import React from "react";
import { useCart } from "../context/CartContext";
import Link from "next/link";

const CartDetails = () => {
  const { cart, updateCartQty, removeFromCart } = useCart();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
      {cart.length === 0 ? (
        <div className="text-center text-gray-500">Your cart is empty.</div>
      ) : (
        <div>
          {cart.map(item => (
            <div key={item.id} className="flex items-center gap-4 py-4 border-b border-neutral-200 last:border-b-0">
              <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover border" />
              <div className="flex-1">
                <div className="font-semibold text-base leading-tight mb-1">{item.name}</div>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => updateCartQty(item.id, Math.max(1, item.qty - 1))} className="w-8 h-8 rounded-full border flex items-center justify-center">-</button>
                  <span className="mx-2 font-medium">{item.qty}</span>
                  <button onClick={() => updateCartQty(item.id, item.qty + 1)} className="w-8 h-8 rounded-full border flex items-center justify-center">+</button>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="font-semibold">₹{(item.price * item.qty).toFixed(2)}</span>
                <button onClick={() => removeFromCart(item.id)} className="text-neutral-400 hover:text-red-500">Remove</button>
              </div>
            </div>
          ))}
          <div className="flex justify-between text-lg font-semibold mt-6">
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <Link href="/checkout">
            <button className="w-full mt-6 py-2 bg-black text-white rounded-lg font-semibold">Proceed to Checkout</button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CartDetails;
