"use client"
import React from 'react';
import Image from 'next/image';

const CheckOutOverview = ({ checkoutData, paymentMethod, onEdit, onConfirm, loading, error }) => {
  if (!checkoutData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">Loading order summary...</div>
      </div>
    );
  }

  // Dummy/fallbacks for demonstration; replace with real data as needed
  const {
    cart: items = [],
    subTotal = 0,
    totalDiscount = 0,
    promo,
    finalShipping = 0,
    taxTotal = 0,
    cartTotal = 0,
    firstName = '',
    lastName = '',
    email = '',
    phone = '',
    altPhone = '',
    street = '',
    city = '',
    district = '',
    state = '',
    pincode = '',
    address = '',
  } = checkoutData;

  // Calculate total quantity
  const totalQty = items.reduce((sum, item) => sum + (item.qty || 0), 0);

  return (
    <div className="min-h-screen bg-[#fcf7f2] flex items-start justify-center py-10 px-2 md:px-10">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8">
        {/* LEFT: Billing/Shipping Summary */}
        <div className="flex-1 bg-[#fcf7f2] p-0">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Checkout: <span className="font-normal">Quick Overview</span></h2>
            <hr className="my-4 border-gray-300" />
          </div>

          {/* Basic Billing Information */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-base text-[#8b6f63]">Basic Billing Information</span>
              <span className="text-teal-600 flex items-center gap-1 text-sm">✓</span>
              <button className="ml-1 text-sm text-black underline hover:text-orange-500" onClick={onEdit}>Edit</button>
            </div>
            <table className="w-full text-sm">
              <tbody>
                <tr><td className="py-1 w-32 text-gray-700">Name</td><td>{firstName} {lastName}</td></tr>
                <tr><td className="py-1 text-gray-700">Email</td><td>{email}</td></tr>
                <tr><td className="py-1 text-gray-700">Call No.</td><td>{phone}</td></tr>
                <tr><td className="py-1 text-gray-700">Alt. Call No.</td><td>{altPhone}</td></tr>
              </tbody>
            </table>
          </div>

          {/* Shipping Address */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-base text-[#8b6f63]">Shipping Address</span>
              <span className="text-teal-600 flex items-center gap-1 text-sm">✓</span>
              <button className="ml-1 text-sm text-black underline hover:text-orange-500" onClick={onEdit}>Edit</button>
            </div>
            <div className="pl-1 text-gray-800 text-sm">{address || `${street}, ${city}, ${district}, ${state} ${pincode}`}</div>
          </div>

          {/* Shipping Availability */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-base text-[#8b6f63]">Shipping Availability</span>
              <span className="text-teal-600 flex items-center gap-1 text-sm">✓</span>
              <button className="ml-1 text-sm text-black underline hover:text-orange-500" onClick={onEdit}>Edit</button>
            </div>
            <table className="w-full text-sm">
              <tbody>
                <tr><td className="py-1 w-32 text-gray-700">State</td><td>{state}</td></tr>
                <tr><td className="py-1 text-gray-700">Dist.</td><td>{district}</td></tr>
                <tr><td className="py-1 text-gray-700">Available Pin Code</td><td>{pincode}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: Order Summary Card */}
        <div className="w-full md:w-[390px] flex-shrink-0">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">Order Summary</h3>
              <span className="text-sm text-gray-600">{items.length} Item{items.length !== 1 ? 's' : ''}</span>
              <span className="text-sm text-gray-600">Qty {totalQty}</span>
              <button className="text-black underline text-sm ml-2" onClick={onEdit}>Edit Order</button>
            </div>
            <hr className="mb-4" />
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="underline cursor-pointer">GST and Fees</span>
                <span>₹{taxTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold mt-3">
                <span>Total (INR)</span>
                <span className="text-green-700 text-lg">₹{cartTotal.toFixed(2)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="text-green-700 text-xs mt-2">Nice! You saved ₹{totalDiscount.toFixed(2)} on your order.</div>
              )}
            </div>
            <button
              className="w-full py-3 bg-black text-white rounded font-semibold text-base mt-2 mb-4 flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? 'Processing...' : (
                <>
                  Make Confirm Order
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </>
              )}
            </button>
            {error && <div className="text-red-600 text-xs text-center mb-2">{error}</div>}
            <div className="text-xs text-gray-600 mt-2">
              Thank you for choosing to shop with us!<br />
              To complete your purchase, please confirm your order by selecting a payment method below. You can choose <span className="underline">Cash on Delivery (COD)</span> for a safe and convenient payment at your doorstep, or opt for <span className="underline">Online Payment</span> for faster processing and instant confirmation.<br /><br />
              Once your payment option is selected, we will begin preparing your order for dispatch. Your satisfaction is our priority – shop confidently with us!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckOutOverview;
//             </div>
//             <div className="flex-1">
//               <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
//                 {item.name}
//               </h3>
//               <p className="mt-1 text-sm text-gray-500">Qty: {item.qty}</p>
//               <div className="mt-1">
//                 <span className="font-medium text-gray-900">
//                   ₹{item.afterDiscount?.toFixed(2) || item.price?.toFixed(2)}
//                 </span>
//                 {item.originalPrice && item.originalPrice > (item.afterDiscount || item.price) && (
//                   <span className="ml-2 text-sm text-gray-500 line-through">
//                     ₹{item.originalPrice.toFixed(2)}
//                   </span>
//                 )}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Order Totals */}
//       <div className="p-6 border-t border-gray-200">
//         <div className="space-y-3">
//           <div className="flex justify-between text-sm">
//             <span className="text-gray-600">Subtotal</span>
//             <span>₹{subTotal.toFixed(2)}</span>
//           </div>

//           {totalDiscount > 0 && (
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-600">Discount</span>
//               <span className="text-green-600">-₹{totalDiscount.toFixed(2)}</span>
//             </div>
//           )}

//           {promo && (
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-600">
//                 Promo Code <span className="text-green-600">({promo.code})</span>
//               </span>
//               <span className="text-green-600">-₹{promo.discount?.toFixed(2)}</span>
//             </div>
//           )}

//           <div className="flex justify-between text-sm">
//             <span className="text-gray-600">Shipping</span>
//             <span>
//               {finalShipping === 0 ? 'Free' : `₹${finalShipping.toFixed(2)}`}
//             </span>
//           </div>

//           <div className="flex justify-between text-sm">
//             <span className="text-gray-600">Tax (GST)</span>
//             <span>₹{taxTotal.toFixed(2)}</span>
//           </div>

//           <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between font-medium">
//             <span>Total</span>
//             <span className="text-lg font-semibold">₹{cartTotal.toFixed(2)}</span>
//           </div>
//         </div>

//         {/* Payment Method */}
//         {paymentMethod && (
//           <div className="mt-6 pt-6 border-t border-gray-200">
//             <h3 className="text-sm font-medium text-gray-900 mb-2">Payment Method</h3>
//             <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
//               {paymentMethod === 'cod' ? (
//                 <>
//                   <div className="p-2 bg-white rounded-md border">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
//                     </svg>
//                   </div>
//                   <div>
//                     <p className="font-medium">Cash on Delivery</p>
//                     <p className="text-sm text-gray-500">Pay when you receive your order</p>
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   <div className="p-2 bg-white rounded-md border">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
//                     </svg>
//                   </div>
//                   <div>
//                     <p className="font-medium">Online Payment</p>
//                     <p className="text-sm text-gray-500">Pay securely with Razorpay</p>
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Edit Cart Button */}
//         <div className="flex flex-col gap-3 mt-6">
//           <button
//             type="button"
//             onClick={onEdit}
//             className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//           >
//             Edit Cart
//           </button>
//           <button
//             type="button"
//             onClick={onConfirm}
//             className="w-full py-2 px-4 rounded-md shadow-sm text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-60"
//             disabled={loading}
//           >
//             {loading ? 'Processing...' : 'Confirm & Pay'}
//           </button>
//           {error && (
//             <div className="text-red-600 text-xs mt-2 text-center">{error}</div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CheckOutOverview;