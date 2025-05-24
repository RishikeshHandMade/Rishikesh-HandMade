"use client"
import React, { useState } from 'react';
import { useCart } from "../context/CartContext";

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

// Function to handle online payment
const handleOnlinePayment = async (total, cart, customer) => {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    alert("Razorpay SDK failed to load.");
    return;
  }

  try {
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

    const data = await response.json();
    const options = {
      key: 'YOUR_RAZORPAY_KEY_ID', // Replace with your Razorpay key ID
      amount: data.amount,
      currency: data.currency,
      name: 'Your Company Name',
      description: 'Order payment',
      image: 'https://example.com/your_logo',
      order_id: data.id,
      handler: async (response) => {
        try {
          const paymentResponse = await fetch('/api/razorpay/success', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              signature: response.razorpay_signature,
            }),
          });

          const paymentData = await paymentResponse.json();
          if (paymentData.success) {
            alert('Payment successful!');
          } else {
            alert('Payment failed!');
          }
        } catch (error) {
          console.error(error);
        }
      },
      prefill: {
        name: 'John Doe',
        email: 'johndoe@example.com',
        contact: '9999999999',
      },
      notes: {
        address: 'Your Company Address',
      },
      theme: {
        color: '#3399cc',
      },
    };

    const rzp = new Razorpay(options);
    rzp.open();
  } catch (error) {
    console.error(error);
  }
};
const CheckOut = () => {
  const { cart, updateCartQty, removeFromCart } = useCart();
  const [shipping, setShipping] = useState('free');
  const [payment, setPayment] = useState('bank');
  const [agree, setAgree] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shippingCost = shippingOptions.find(opt => opt.value === shipping)?.cost || 0;
  const total = subtotal + shippingCost;

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full min-h-screen bg-[#fcf7f2] p-8">
      <div className="flex-1 bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Checkout</h2>
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
          </div>
        )}
      </div>
      <div className="w-full md:w-1/3 bg-white rounded-lg shadow p-6 flex flex-col gap-4">
        <h3 className="text-xl font-bold mb-2">Shipping Options</h3>
        {shippingOptions.map(opt => (
          <label key={opt.value} className="flex items-center gap-2 mb-2">
            <input type="radio" name="shipping" value={opt.value} checked={shipping === opt.value} onChange={() => setShipping(opt.value)} />
            {opt.label} {opt.cost > 0 && <span className="text-gray-500">(+₹{opt.cost})</span>}
          </label>
        ))}
        <h3 className="text-xl font-bold mt-4 mb-2">Payment Options</h3>
        {paymentOptions.map(opt => (
          <label key={opt.value} className="flex items-center gap-2 mb-2">
            <input type="radio" name="payment" value={opt.value} checked={payment === opt.value} onChange={() => setPayment(opt.value)} />
            {opt.label}
          </label>
        ))}
        <div className="flex justify-between text-lg font-semibold mt-6">
          <span>Total:</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
        <label className="flex items-center gap-2 mt-4">
          <input type="checkbox" checked={agree} onChange={() => setAgree(a => !a)} />
          I agree to the terms and conditions
        </label>
        <button
          className="w-full mt-4 py-2 bg-black text-white rounded-lg font-semibold disabled:opacity-50"
          disabled={!agree || cart.length === 0}
          onClick={async (e) => {
            e.preventDefault();
            if (payment === "online") {
              // Demo customer details, replace with real form data if available
              const customer = {
                name: "Demo User",
                email: "demo@email.com",
                phone: "9999999999",
                address: "Demo Address"
              };
              await handleOnlinePayment(total, cart, customer);
            } else {
              alert("Order placed with payment method: " + payment);
            }
          }}
        >
          Place Order
        </button>
      </div>
    </div>
  );
};
export default CheckOut;