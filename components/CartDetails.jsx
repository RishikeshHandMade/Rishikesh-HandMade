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
    <div className="max-w-7xl mx-auto p-6 bg-white">
      {cart.length === 0 ? (
        <div className="text-center text-gray-500 py-8">Your cart is empty.</div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left side - Cart Table */}
          <div className="w-full md:w-2/3">
            <h2 className="text-2xl font-bold mb-2">Cart</h2>
            <table className="w-full border-collapse rounded-lg overflow-hidden shadow text-xs md:text-base">
              <thead>
                <tr className="bg-blue-200 text-black">
                  <th className="p-2 border">Product</th>
                  <th className="p-2 border">Price</th>
                  <th className="p-2 border">Quantity</th>
                  <th className="p-2 border">Subtotal</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, idx) => (
                  <tr key={item.id} className={idx % 2 === 0 ? "bg-orange-100" : "bg-gray-100"}>
                    <td className="p-2 border text-center">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded object-cover" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </td>
                    <td className="p-2 border text-center">₹{item.price.toFixed(2)}</td>
                    <td className="p-2 border text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => updateCartQty(item.id, Math.max(1, item.qty - 1))}
                          className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center"
                        >-</button>
                        <span className="w-8 text-center">{item.qty}</span>
                        <button
                          onClick={() => updateCartQty(item.id, item.qty + 1)}
                          className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center"
                        >+</button>
                      </div>
                    </td>
                    <td className="p-2 border text-center font-medium">₹{(item.price * item.qty).toFixed(2)}</td>
                    <td className="p-2 border text-center">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 text-xl flex items-center justify-center"
                      >×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex flex-col md:flex-row gap-4 mt-4 items-center">
              <input
                type="text"
                placeholder="Coupon Code"
                className="border border-blue-400 bg-blue-100 px-4 py-2 rounded w-48"
              />
              <button className="px-6 py-2 bg-blue-500 text-white rounded font-bold text-xs">Apply Coupon</button>
              <button className="px-6 py-2 bg-black text-white rounded font-bold text-xs">UPDATE CART</button>
              <Link href="/shop" className="ml-auto text-green-700 font-semibold">Continue Shopping &gt;&gt;</Link>
            </div>
          </div>

          {/* Right side - Cart Summary */}
          <div className="w-full md:w-1/3 bg-white border border-gray-300 rounded-lg shadow p-6 flex flex-col gap-4 mt-8 md:mt-0">
            <h3 className="text-lg font-bold mb-2">Order Summary</h3>
            <div className="border rounded-lg p-4 mb-2 bg-blue-50 text-blue-900 font-medium text-sm">Bank Offer: 5% Cashback</div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Shipping</span>
              <span>FREE</span>
            </div>
            <div className="flex items-center gap-2 mb-2 text-xs text-green-700">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>You will save ₹504 on this order</div>
            </div>
            <div className="flex justify-between items-center font-bold text-base border-t pt-3 mb-3">
              <span>Total</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <Link href="/checkout" className="block">
              <button className="w-full py-3 bg-black text-white rounded font-bold text-base">
                PLACE ORDER
              </button>
            </Link>
            <div className="text-xs text-gray-500 mt-2">Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our privacy policy.</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartDetails;
