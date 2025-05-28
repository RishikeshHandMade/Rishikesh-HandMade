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
        <div className="flex gap-8">
          {/* Left side - Products */}
          <div className="flex-1">
            <div className="grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 border-b pb-4 mb-4">
              <div className="font-medium">Product</div>
              <div className="font-medium text-center">Price</div>
              <div className="font-medium text-center">Quantity</div>
              <div className="font-medium text-center">Subtotal</div>
              <div></div> {/* Empty header for remove button */}
            </div>

            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 items-center">
                  <div className="flex items-center gap-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded object-cover" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-center">₹{item.price.toFixed(2)}</div>
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => updateCartQty(item.id, Math.max(1, item.qty - 1))} 
                      className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.qty}</span>
                    <button 
                      onClick={() => updateCartQty(item.id, item.qty + 1)} 
                      className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-center font-medium">₹{(item.price * item.qty).toFixed(2)}</div>
                  <button 
                    onClick={() => removeFromCart(item.id)} 
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <div className="border-t pt-6 mt-6">
                <div className="flex justify-between items-center mb-4">
                  <input 
                    type="text" 
                    placeholder="Coupon Code" 
                    className="border rounded px-4 py-2 w-48"
                  />
                  <button className="px-6 py-2 bg-black text-white rounded font-medium">
                    Apply Coupon
                  </button>
                  <button className="px-6 py-2 bg-black text-white rounded font-medium">
                    UPDATE CART
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Cart Total */}
          <div className="w-[400px]">
            <h3 className="text-xl font-bold mb-4">Cart Total</h3>
            <div className="bg-gray-50 p-6 rounded">
              <div className="border rounded-lg p-4 mb-4 bg-white">
                <div className="text-sm font-medium">Bank Offer 5% Cashback</div>
              </div>
              <div className="border rounded-lg p-4 mb-4 bg-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M15 9.5L11 13.5L9 11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div className="text-sm font-medium">Enjoy The Product</div>
                </div>
                <div className="text-sm">FREE</div>
              </div>
              <div className="border rounded-lg p-4 mb-4 bg-white">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 8v4l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div className="text-sm font-medium">Enjoy The Product</div>
                </div>
                <div className="text-sm text-gray-500 mt-2">Lorem ipsum is simply dummy text of the printing and typesetting</div>
              </div>
              <div className="flex items-center gap-2 mb-4 text-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>You will save ₹504 on this order</div>
              </div>
              <div className="flex justify-between items-center font-bold text-lg border-t pt-4">
                <div>Total</div>
                <div>₹{subtotal.toFixed(2)}</div>
              </div>
              <Link href="/checkout" className="block mt-4">
                <button className="w-full py-3 bg-black text-white rounded font-medium">
                  PLACE ORDER
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartDetails;
