"use client"
import React, { useState } from 'react';
import { useCart } from "../context/CartContext";
import { useSession } from "next-auth/react";

const shippingOptions = [
  { label: 'Free shipping', value: 'free', cost: 0 },
  { label: 'Flat Rate', value: 'flat', cost: 25.75 },
];

const paymentOptions = [
  { label: 'Direct bank transfer', value: 'bank' },
  { label: 'Cash on delivery', value: 'cod' },
  { label: 'Online Payment', value: 'online' },
];
// Function to load Razorpay script on client
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) return resolve(true);
    const script = document.createElement("script");
    script.id = 'razorpay-script';
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Function to handle online payment with explicit backend order creation
import axios from 'axios';
import { toast } from 'react-hot-toast';

const handleOnlinePaymentWithOrder = async (total, cart, customer, setLoading, setError, routerInstance) => {
  setLoading(true);
  setError(null);
  try {
    // 1. Ensure Razorpay script is loaded
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError("Razorpay SDK failed to load.");
      setLoading(false);
      return;
    }
    // 2. Create order in backend
    const response = await fetch('/api/razorpay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: total,
        currency: "INR",
        receipt: "order_rcptid_" + Math.floor(Math.random() * 10000),
        products: cart,
        customer
      }),
    });
    if (!response.ok) {
      setError("Failed to create order. Please try again.");
      setLoading(false);
      return;
    }
    const data = await response.json();
    if (!data.id) {
      setError("Order creation failed. No order ID returned.");
      setLoading(false);
      return;
    }
    // 3. Call Razorpay checkout
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: data.amount,
      currency: data.currency,
      name: customer.name || 'Your Company Name',
      description: 'Order payment',
      image: 'https://example.com/your_logo',
      order_id: data.id,
      handler: function (response) {
        (async () => {
          try {
            // Verify payment (PUT for verification as in package checkout)
            const verificationResponse = await axios.put('/api/razorpay', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verificationResponse.data.success) {
              try {
                // Send confirmation email (POST as in package checkout)
                await axios.post('/api/brevo', {
                  to: customer.email,
                  subject: 'Order Confirmation',
                  htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
    <style type="text/css">
        body { font-family: Arial, sans-serif; background: #f8f9fa; }
        .container { background: #fff; border-radius: 8px; margin: 32px auto; max-width: 500px; padding: 32px 24px; }
        .header { text-align: center; }
        .footer { text-align: center; color: #888; font-size: 13px; margin-top: 32px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        td { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        th { text-align: left; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Thank you for your order!</h2>
      <p>Hello, ${customer.name}</p>
      <p>Your payment for order <b>${verificationResponse.data.orderId || verificationResponse.data._id || ''}</b> was successful.</p>
    </div>
    <table>
      <tr><th>Amount</th><td>₹${(verificationResponse.data.amount/100).toFixed(2)}</td></tr>
      <tr><th>Payment ID</th><td>${verificationResponse.data.paymentId || verificationResponse.data.razorpay_payment_id || ''}</td></tr>
      <tr><th>Order ID</th><td>${verificationResponse.data.orderId || verificationResponse.data._id || ''}</td></tr>
      <tr><th>Email</th><td>${customer.email}</td></tr>
      <tr><th>Mobile</th><td>${customer.phone}</td></tr>
      <tr><th>Date</th><td>${new Date().toLocaleString()}</td></tr>
    </table>
    <div style="margin-top: 24px; text-align:center;">
      <a href="https://yatrazone.vercel.app/profile/orders" style="display:inline-block;background:#10B981;color:#fff;text-decoration:none;padding:12px 25px;border-radius:4px;font-weight:bold;">View Your Account</a>
    </div>
    <div class="footer">
      <p>If you have any questions, email <a href="mailto:info@yatrazone.com">info@yatrazone.com</a></p>
      <p>&copy; ${new Date().getFullYear()} YatraZone. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
                });
              } catch (error) {
                console.error('Error sending email:', error);
              }
              // Redirect to confirmation page with router
              if (routerInstance && (verificationResponse.data.orderId || verificationResponse.data._id)) {
                routerInstance.push(`/checkout/orderConfirmed/${verificationResponse.data.orderId || verificationResponse.data._id}`);
              } else if (routerInstance) {
                routerInstance.push(`/checkout/orderConfirmed`);
              }
              toast.success('Payment successful! Check your email for details.', {
                style: { borderRadius: '10px', border: '2px solid green' },
              });
            }
          } catch (err) {
            setError('Payment verification failed!');
            if (typeof toast === 'function') {
              toast.error('Payment verification failed!');
            }
          }
        })();
        } 
    };
    if (typeof window !== "undefined" && typeof window.Razorpay === "function") {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      setError("Razorpay is not available on window. Check if SDK loaded correctly.");
    }
  } catch (error) {
    setError("Unexpected error: " + error.message);
  }
  setLoading(false);
};
import { useRouter } from 'next/navigation';

const CheckOut = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  // const { cart, updateCartQty, removeFromCart } = useCart();
  // const [shipping, setShipping] = useState('free');
  // const [payment, setPayment] = useState('bank');
  // const [agree, setAgree] = useState(false);
  // const [mounted, setMounted] = useState(false);
  // Billing form state
  // const [firstName, setFirstName] = useState("");
  // const [lastName, setLastName] = useState("");
  // const [company, setCompany] = useState("");
  // const [country, setCountry] = useState("");
  // const [street, setStreet] = useState("");
  // const [apartment, setApartment] = useState("");
  // const [city, setCity] = useState("");
  // const [state, setState] = useState("");
  // const [zip, setZip] = useState("");
  // const [phone, setPhone] = useState("");
  // const [email, setEmail] = useState("");
  // const [orderNotes, setOrderNotes] = useState("");
  // Loading and error state for payment
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { cart, updateCartQty, removeFromCart } = useCart();
  const [shipping, setShipping] = useState('free');
  const [payment, setPayment] = useState('bank');
  const [agree, setAgree] = useState(false);
  const [mounted, setMounted] = React.useState(false);

  // Billing form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [country, setCountry] = useState("");
  const [street, setStreet] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [orderNotes, setOrderNotes] = useState("");

  React.useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  // Require login
  if (status === "loading") return null;
  if (!session) {
    if (typeof window !== 'undefined') {
      window.location.href = '/sign-in?callbackUrl=' + encodeURIComponent(window.location.pathname);
    }
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white shadow-lg rounded-lg p-8 text-center">
          <h2 className="text-xl font-bold mb-4">Please log in to continue</h2>
          <a href="/sign-in" className="text-blue-600 underline">Go to Login</a>
        </div>
      </div>
    );
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shippingCost = shippingOptions.find(opt => opt.value === shipping)?.cost || 0;
  const total = subtotal + shippingCost;

  // Collect customer info for Razorpay
  const getCustomerInfo = () => ({
    name: `${firstName} ${lastName}`.trim(),
    email,
    phone,
    address: `${street}${apartment ? ", " + apartment : ""}, ${city}, ${state}, ${zip}, ${country}`,
    company,
    orderNotes
  });

  // Place Order handler
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (payment === "online") {
      const customer = getCustomerInfo();
      await handleOnlinePaymentWithOrder(total, cart, customer, setLoading, setError, router);
    } else {
      alert(`Order placed with payment method: ${payment}`);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-10 w-full min-h-screen bg-[#fcf7f2] p-10">
      {/* Billing Details Form */}
      <div className="flex-1 bg-white rounded-lg shadow p-8">
        <h2 className="text-xl font-bold mb-6">Billing details</h2>
        <form className="space-y-4" onSubmit={handlePlaceOrder}>
          <div className="flex flex-col md:flex-row gap-4">
            <select className="border rounded px-3 py-2 w-full">
              <option>Returning customer? Click here to login</option>
            </select>
            <select className="border rounded px-3 py-2 w-full">
              <option>Have a coupon? Click here to enter your code</option>
            </select>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm mb-1">First Name</label>
              <input className="border rounded px-3 py-2 w-full" required value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-1">Last Name</label>
              <input className="border rounded px-3 py-2 w-full" required value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Company name (optional)</label>
            <input className="border rounded px-3 py-2 w-full" value={company} onChange={e => setCompany(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Country / Region *</label>
            <select className="border rounded px-3 py-2 w-full" value={country} onChange={e => setCountry(e.target.value)}>
              <option value="">Open this select menu</option>
              <option value="India">India</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              {/* Add more countries as needed */}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Street address *</label>
            <input className="border rounded px-3 py-2 w-full mb-2" placeholder="House number and street name" required value={street} onChange={e => setStreet(e.target.value)} />
            <input className="border rounded px-3 py-2 w-full" placeholder="Apartment, suite, unit, etc. (optional)" value={apartment} onChange={e => setApartment(e.target.value)} />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm mb-1">Town / City *</label>
              <input className="border rounded px-3 py-2 w-full" required value={city} onChange={e => setCity(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-1">State *</label>
              <input className="border rounded px-3 py-2 w-full" required value={state} onChange={e => setState(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-1">ZIP Code *</label>
              <input className="border rounded px-3 py-2 w-full" required value={zip} onChange={e => setZip(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm mb-1">Phone *</label>
              <input className="border rounded px-3 py-2 w-full" required value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-1">Email address *</label>
              <input className="border rounded px-3 py-2 w-full" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-6 items-center">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="accent-black" />
              Create an account?
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="accent-black" />
              Ship to different address?
            </label>
          </div>
          <div>
            <label className="block text-sm mb-1">Order notes (optional)</label>
            <textarea className="border rounded px-3 py-2 w-full" rows={3} placeholder="Notes about your order, e.g. special notes for delivery." value={orderNotes} onChange={e => setOrderNotes(e.target.value)} />
          </div>
          <button className="w-full py-3 bg-black text-white rounded font-semibold text-sm mt-4" disabled={!agree || loading} type="submit">
            {loading ? "Processing..." : "PLACE ORDER"}
          </button>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        </form>
      </div>

      {/* Order Summary Card */}
      <div className="w-full md:w-[420px] bg-white rounded-lg shadow p-6 self-start">
        <h3 className="text-lg font-bold mb-4">Your Order</h3>
        <div className="divide-y divide-neutral-200 mb-4">
          {cart.map(item => (
            <div key={item.id} className="flex items-center gap-3 py-3">
              <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover border" />
              <div className="flex-1">
                <div className="font-medium text-sm leading-tight">{item.name}</div>
              </div>
              <div className="text-sm font-semibold">₹{(item.price * item.qty).toFixed(2)}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="mb-2">
          <div className="font-medium mb-1">Shipping</div>
          {shippingOptions.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 text-sm mb-1">
              <input type="radio" name="shipping" checked={shipping === opt.value} onChange={() => setShipping(opt.value)} className="accent-black" />
              {opt.label} {opt.cost > 0 && (<span className="ml-1">₹{opt.cost}</span>)}
            </label>
          ))}
        </div>
        <div className="flex justify-between items-center font-bold text-base border-t pt-3 mb-3">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
        <div className="mb-3">
          <div className="font-medium mb-1">Payment</div>
          {paymentOptions.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 text-sm mb-1">
              <input type="radio" name="payment" checked={payment === opt.value} onChange={() => setPayment(opt.value)} className="accent-black" />
              {opt.label}
            </label>
          ))}
          {/* <label className="flex items-center gap-2 text-sm mb-1">
            <input type="radio" name="payment" className="accent-black" disabled />
            <span className="flex items-center gap-1">Paypal <img src="https://www.paypalobjects.com/webstatic/icon/pp258.png" alt="Paypal" className="w-8 inline" /> <span className="text-neutral-400">What's Paypal?</span></span>
          </label> */}
        </div>
        <div className="flex items-start gap-2 mb-4">
          <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="accent-black mt-1" />
          <span className="text-xs">I have read and agree to the website terms and conditions</span>
        </div>

      </div>
    </div>
  );
  //                 </div>
  //                 <div className="flex flex-col items-end gap-2">
  //                   <span className="font-semibold">₹{(item.price * item.qty).toFixed(2)}</span>
  //                   <button onClick={() => removeFromCart(item.id)} className="text-neutral-400 hover:text-red-500">Remove</button>
  //                 </div>
  //               </div>
  //             ))}
  //             <div className="flex justify-between text-lg font-semibold mt-6">
  //               <span>Subtotal:</span>
  //               <span>₹{subtotal.toFixed(2)}</span>
  //             </div>
  //           </div>
  //         )}
  //       </div>
  //       <div className="w-full md:w-1/3 bg-white rounded-lg shadow p-6 flex flex-col gap-4">
  //         <h3 className="text-xl font-bold mb-2">Shipping Options</h3>
  //         {shippingOptions.map(opt => (
  //           <label key={opt.value} className="flex items-center gap-2 mb-2">
  //             <input type="radio" name="shipping" value={opt.value} checked={shipping === opt.value} onChange={() => setShipping(opt.value)} />
  //             {opt.label} {opt.cost > 0 && <span className="text-gray-500">(+₹{opt.cost})</span>}
  //           </label>
  //         ))}
  //         <h3 className="text-xl font-bold mt-4 mb-2">Payment Options</h3>
  //         {paymentOptions.map(opt => (
  //           <label key={opt.value} className="flex items-center gap-2 mb-2">
  //             <input type="radio" name="payment" value={opt.value} checked={payment === opt.value} onChange={() => setPayment(opt.value)} />
  //             {opt.label}
  //           </label>
  //         ))}
  //         <div className="flex justify-between text-lg font-semibold mt-6">
  //           <span>Total:</span>
  //           <span>₹{total.toFixed(2)}</span>
  //         </div>
  //         <label className="flex items-center gap-2 mt-4">
  //           <input type="checkbox" checked={agree} onChange={() => setAgree(a => !a)} />
  //           I agree to the terms and conditions
  //         </label>
  //         <button
  //           className="w-full mt-4 py-2 bg-black text-white rounded-lg font-semibold disabled:opacity-50"
  //           disabled={!agree || cart.length === 0}
  //           onClick={async (e) => {
  //             e.preventDefault();
  //             if (payment === "online") {
  //               // Demo customer details, replace with real form data if available
  //               const customer = {
  //                 name: "Demo User",
  //                 email: "demo@email.com",
  //                 phone: "9999999999",
  //                 address: "Demo Address"
  //               };
  //               await handleOnlinePayment(total, cart, customer);
  //             } else {
  //               alert("Order placed with payment method: " + payment);
  //             }
  //           }}
  //         >
  //           Place Order
  //         </button>
  //       </div>
  //     </div>
  //   );
};
export default CheckOut;