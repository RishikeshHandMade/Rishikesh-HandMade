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

  // Helper for discount calculation
  const getDiscount = (item) => {
    if (item.discountPercent) return `${item.discountPercent}%`;
    if (item.discountAmount) return `${item.discountAmount} Rs`;
    return '-';
  };
  const getAfterDiscount = (item) => {
    if (item.discountPercent) return (item.price * (1 - item.discountPercent / 100));
    if (item.discountAmount) return (item.price - item.discountAmount);
    return item.price;
  };
  const getAmount = (item) => getAfterDiscount(item) * item.qty;

  // UI
  return (
    <div className="w-full px-10 mx-auto p-4 bg-white">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold">Add To Cart</h2>
        {/* <Link href="/shop" className="text-green-700 font-semibold text-sm">Continuew Shopping &gt;&gt;</Link> */}
      </div>
      {cart.length === 0 ? (
        <div className="text-center text-gray-500 py-8">Your cart is empty.</div>

      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left: Product Table */}
          <div className="w-full md:w-3/2">
            <table className="w-full border-collapse rounded overflow-hidden shadow text-xs md:text-base">
              <thead>
                <tr className="bg-blue-200 text-black">
                  <th className="border p-2">Product Image</th>
                  <th className="border p-2">Product Name / Code</th>
                  <th className="border p-2">Base Price</th>
                  <th className="border p-2">Discount</th>
                  <th className="border p-2">After Discount</th>
                  <th className="border p-2">Qty</th>
                  <th className="border p-2">Amount</th>
                  <th className="border p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, idx) => (
                  <tr key={item.id} className={idx % 2 === 0 ? "bg-orange-100" : "bg-gray-100"}>
                    <td className="border p-2 text-center">
                      <img src={item.image?.url} alt={item.name} className="w-20 h-20 rounded object-cover mx-auto" />
                    </td>
                    <td className="border p-2 text-center align-top">
                      <div className="font-bold text-base leading-tight">{item.name}</div>
                      <div className="italic text-xs text-black/70">Product Code</div>
                    </td>
                    <td className="border p-2 text-center">{item.price}</td>
                    <td className="border p-2 text-center">{getDiscount(item)}</td>
                    <td className="border p-2 text-center">{getAfterDiscount(item)}</td>
                    <td className="border p-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => updateCartQty(item.id, Math.max(1, item.qty - 1))}
                          className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center"
                        >-</button>
                        <span className="w-7 text-center font-semibold">{item.qty}</span>
                        <button
                          onClick={() => updateCartQty(item.id, item.qty + 1)}
                          className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center"
                        >+</button>
                      </div>
                    </td>
                    <td className="border p-2 text-center font-bold">{getAmount(item)}</td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 text-xl flex items-center justify-center"
                        title="Remove"
                      >&#10006;</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right: Order Summary Card */}
          <div className="w-full md:w-1/2 flex flex-col gap-2 mt-8 md:mt-0">
            <div className="border border-gray-300 rounded-lg shadow p-6 bg-white">
              <div className="font-semibold mb-2 text-base">Subtotal</div>
              <div className="flex flex-col gap-2 mb-2">
                <input type="text" placeholder="Apply Promo Code" className="w-full border border-blue-400 bg-blue-100 px-3 py-2 rounded" />
              </div>
              <div className="flex justify-between items-center mb-1 text-sm">
                <span>CGST %</span>
                <span></span>
              </div>
              <div className="flex justify-between items-center mb-1 text-sm">
                <span>SGST %</span>
                <span></span>
              </div>
              <div className="text-xs text-red-600 mb-2">Note : If discount promo code already applied extra additional coupon not applicable</div>
              <div className="flex justify-between items-center mb-1 text-sm">
                <span>Shipping Charges</span>
                <span></span>
              </div>
              <div className="font-bold text-base flex justify-between items-center border-t pt-3 mt-2 mb-3">
                <span>Final Amount</span>
                <span>{subtotal}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <input type="checkbox" id="terms" className="accent-black" />
                <label htmlFor="terms" className="text-xs">I have read and agree to the website terms and conditions</label>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <button className="w-full py-3 bg-orange-500 text-white rounded font-bold text-base hover:bg-orange-600">Cash On Delivery</button>
                <button className="w-full py-3 bg-black text-white rounded font-bold text-base hover:bg-gray-800">I'm Ready To Pay</button>
              </div>
              <div className="text-xs text-gray-500 mt-3">Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our privacy policy.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartDetails;
