"use client"
import React from 'react';
import Image from 'next/image';
import { useCart } from '../context/CartContext';

const CheckOutOverview = ({ checkoutData, paymentMethod, onEdit }) => {
  const { cart } = useCart();

  if (!checkoutData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">Loading order summary...</div>
      </div>
    );
  }

  const {
    cart: items = [],
    subTotal = 0,
    totalDiscount = 0,
    promo,
    finalShipping = 0,
    taxTotal = 0,
    cartTotal = 0,
  } = checkoutData;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Order Summary Header */}
      <div className="bg-gray-50 px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">Order Summary</h2>
      </div>

      {/* Order Items */}
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="p-4 flex items-start gap-4">
            <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
              <Image
                src={item.image?.url || '/placeholder-product.jpg'}
                alt={item.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                {item.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500">Qty: {item.qty}</p>
              <div className="mt-1">
                <span className="font-medium text-gray-900">
                  ₹{item.afterDiscount?.toFixed(2) || item.price?.toFixed(2)}
                </span>
                {item.originalPrice && item.originalPrice > (item.afterDiscount || item.price) && (
                  <span className="ml-2 text-sm text-gray-500 line-through">
                    ₹{item.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Totals */}
      <div className="p-6 border-t border-gray-200">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span>₹{subTotal.toFixed(2)}</span>
          </div>

          {totalDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount</span>
              <span className="text-green-600">-₹{totalDiscount.toFixed(2)}</span>
            </div>
          )}

          {promo && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Promo Code <span className="text-green-600">({promo.code})</span>
              </span>
              <span className="text-green-600">-₹{promo.discount?.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span>
              {finalShipping === 0 ? 'Free' : `₹${finalShipping.toFixed(2)}`}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (GST)</span>
            <span>₹{taxTotal.toFixed(2)}</span>
          </div>

          <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between font-medium">
            <span>Total</span>
            <span className="text-lg font-semibold">₹{cartTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method */}
        {paymentMethod && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Payment Method</h3>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
              {paymentMethod === 'cod' ? (
                <>
                  <div className="p-2 bg-white rounded-md border">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-gray-500">Pay when you receive your order</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 bg-white rounded-md border">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Online Payment</p>
                    <p className="text-sm text-gray-500">Pay securely with Razorpay</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Edit Cart Button */}
        <button
          type="button"
          onClick={onEdit}
          className="mt-6 w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Edit Cart
        </button>
      </div>
    </div>
  );
};

export default CheckOutOverview;