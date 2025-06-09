"use client"
import React, { useState } from 'react';
import { useCart } from "../context/CartContext";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

const shippingOptions = [
  { label: 'Free shipping', value: 'free', cost: 0 },
  { label: 'Flat Rate', value: 'flat', cost: 25.75 },
];

const paymentOptions = [
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
      image: 'https://rishikeshhandmade.com/logo.png',
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
    </div>
  </div>
</body>
</html>`
                });
              } catch (e) { /* handle email error */ }
              // Redirect to confirmation page with router
              const orderId = verificationResponse.data.orderId || verificationResponse.data._id;
              if (routerInstance && orderId) {
                routerInstance.push(`/dashboard?orderId=${orderId}`);
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
  const { cart: contextCart, setCart, updateCartQty, removeFromCart } = useCart();
  const [cart, setLocalCart] = useState([]);

  // On mount, get cart from localStorage if present, else use context
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("checkoutCart") : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setLocalCart(parsed);
        setCart(parsed); // set context cart ONCE if localStorage cart is used
      } catch {
        setLocalCart(contextCart);
      }
      localStorage.removeItem("checkoutCart");
    } else {
      setLocalCart(contextCart);
    }
  }, []);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("")
  // Handle coupon application
  const handleApplyCoupon = async () => {
    setLoadingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch('/api/discountCoupon/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim(), cart }),
      });
      const data = await res.json();
      if (!data.success || !data.coupon) {
        setCouponError(data.message || 'Invalid coupon code');
      } else {
        // Update cart with discounted prices
        const updatedCart = cart.map(item => ({
          ...item,
          couponApplied: true,
          couponCode: data.coupon.couponCode,
          price: Math.round(item.price - (data.coupon.percent ? (item.price * data.coupon.percent) / 100 : data.coupon.amount || 0)),
          originalPrice: item.originalPrice || item.price,
        }));
        setLocalCart(updatedCart);
        setCart(updatedCart); // keep context in sync
        localStorage.setItem("checkoutCart", JSON.stringify(updatedCart));
        setCouponInput("");
        setCouponError("");
        toast.success('Coupon applied successfully!', { style: { borderRadius: '10px', border: '2px solid green' } });
      }
    } catch (err) {
      setCouponError('Failed to apply coupon. Please try again.');
      console.error('Coupon apply error (frontend):', err);
    } finally {
      setLoadingCoupon(false);
    }
  };


  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [shipping, setShipping] = useState('free');
  const [payment, setPayment] = useState('bank');
  const [agree, setAgree] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
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
    let addressSaved = false;
    if (saveAddress) {
      const shippingData = {
        firstName, lastName,
        address: street,
        city, state,
        postalCode: zip,
        country,
        phone,
        email
      };
      const res = await fetch('/api/shippingAddress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shippingData)
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.message || "Failed to save shipping address");
        return;
      }
      addressSaved = true;
    }
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
          {/* <div>
            <label className="block text-sm mb-1">Company name (optional)</label>
            <input className="border rounded px-3 py-2 w-full" value={company} onChange={e => setCompany(e.target.value)} />
          </div> */}
          <div>
            <label className="block text-sm mb-1">Country</label>
            <select className="border rounded px-3 py-2 w-full" value={country} onChange={e => setCountry(e.target.value)}>
              <option value="">Select Country</option>
              <option value="India">India</option>
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
          {/* <div>
            <label className="block text-sm mb-1">Order notes (optional)</label>
            <textarea className="border rounded px-3 py-2 w-full" rows={3} placeholder="Notes about your order, e.g. special notes for delivery." value={orderNotes} onChange={e => setOrderNotes(e.target.value)} />
           </div>*/}
          <button className="w-full py-3 bg-black text-white rounded font-semibold text-sm mt-4" disabled={!agree || loading} type="submit"> 
            {loading ? "Processing..." : "PLACE ORDER"}
          </button>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        </form>
        {/* Save address checkbox */}
        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            id="saveAddress"
            checked={saveAddress}
            onChange={e => setSaveAddress(e.target.checked)}
            className="accent-black"
          />
          <label htmlFor="saveAddress" className="text-sm select-none">Save this address to my account</label>
        </div>
      </div>

      {/* Order Summary Card */}
      <div className="w-full md:w-[420px] bg-white rounded-lg shadow p-6 self-start">
        {/* Coupon Input - show only if cart has products and no coupon is applied */}
        {cart.length > 0 && !cart.some(item => item.couponApplied) && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Have a coupon?</label>
            <div className="flex gap-2">
              <input
                className="border rounded px-3 py-2 flex-1"
                placeholder="Enter coupon code"
                value={couponInput}
                onChange={e => setCouponInput(e.target.value)}
                disabled={loadingCoupon}
              />
              <button
                className="px-4 py-2 bg-black text-white rounded font-semibold disabled:opacity-60"
                onClick={handleApplyCoupon}
                disabled={loadingCoupon || !couponInput.trim()}
                type="button"
              >
                {loadingCoupon ? "Applying..." : "Apply"}
              </button>
            </div>
            {couponError && <div className="text-red-600 text-xs mt-1">{couponError}</div>}
          </div>
        )}
        <h3 className="text-lg font-bold mb-4">Your Order</h3>
        <div className="divide-y divide-neutral-200 mb-4">
          {cart.map(item => (
            <div key={item.id} className="flex items-center gap-3 py-3">
              <img src={item.image?.url} alt={item.name} className="w-12 h-12 rounded object-cover border" />
              <div className="flex-1">
                <div className="flex justify-between items-center w-full">
                  <div>
                    <div className="font-medium text-md leading-tight">{item.name}</div>
                    {/* <div className="text-xs text-gray-500">Base: ₹{item.originalPrice ?? item.price}</div> */}
                  </div>
                  {item.couponApplied ? (
                    <div className="text-md text-black font-semibold text-right min-w-[110px]">₹{item.price}</div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center font-bold text-base border-t pt-3 mb-1">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-sm mb-1">
          <span>CGST %</span>
          <span>{cart.map(item => item.cgst ?? 0).join(', ')}</span>
        </div>
        <div className="flex justify-between items-center text-sm mb-3">
          <span>SGST %</span>
          <span>{cart.map(item => item.sgst ?? 0).join(', ')}</span>
        </div>
        <div className="flex justify-between items-center font-bold text-base border-t pt-2 mb-3">
          <span>Total</span>
          <span>₹{cart.reduce((sum, item) => {
            const price = item.price;
            const cgst = item.cgst ? (price * item.cgst / 100) : 0;
            const sgst = item.sgst ? (price * item.sgst / 100) : 0;
            const qty = item.qty ?? 1;
            return sum + ((price + cgst + sgst) * qty);
          }, 0).toFixed(2)}</span>
        </div>
        
        <div className="mb-3">
          <div className="font-medium mb-1">Payment</div>
          {paymentOptions.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 text-sm mb-1">
              <input type="radio" name="payment" checked={payment === opt.value} onChange={() => setPayment(opt.value)} className="accent-black" />
              {opt.label}
            </label>
          ))}
        </div>
        <div className="flex items-start gap-2 mb-4">
          <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="accent-black mt-1" />
          <span className="text-s">I have read and agree to the website terms and conditions</span>
        </div>

      </div>
    </div>
  );
}
export default CheckOut;