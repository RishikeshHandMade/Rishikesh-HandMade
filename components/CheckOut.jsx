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

const handleOnlinePaymentWithOrder = async (finalAmount, cart, customer, setLoading, setError, routerInstance, checkoutData) => {
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
        amount: Math.round(finalAmount), // Amount in paise (already converted)
        currency: "INR",
        receipt: "order_rcptid_" + Math.floor(Math.random() * 10000),
        products: cart,
        customer,
        checkoutData
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
    <div class="footer">
      <p>Order ID: ${orderId}</p>
      <p>Order Date: ${new Date().toLocaleDateString()}</p>
    </div>
  </div>
</body>
</html>`
                });
              } catch (e) { /* handle email error */ }
              // Redirect to confirmation page with router
              const orderId = verificationResponse.data.orderId || verificationResponse.data._id;
              if (routerInstance && orderId) {
                routerInstance.push("/dashboard?orderId=" + orderId);
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
  const [checkoutData, setCheckoutData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load cart data from localStorage and handle authentication state
  useEffect(() => {
    const loadCartData = () => {
      const stored = typeof window !== "undefined" ? localStorage.getItem("checkoutCart") : null;
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCheckoutData(parsed);
          setCart(parsed.cart); // Update cart context
        } catch (error) {
          console.error("Error parsing cart data:", error);
          setCheckoutData(null);
        }
      } else if (contextCart?.length > 0) {
        // If no localStorage but we have cart in context, use that
        setCheckoutData({
          cart: contextCart,
          subTotal: contextCart.reduce((sum, item) => sum + (item.price * item.qty), 0),
          // Add other required checkout data with defaults if needed
        });
      }
      setIsLoading(false);
    };

    // Load cart data when component mounts or when auth status changes
    loadCartData();
  }, [status]); // Re-run when auth status changes

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("")
  // Handle coupon application
  const cart = React.useMemo(() => {
    // First try checkoutData, then contextCart, then empty array
    const items = (checkoutData?.cart || contextCart || []).filter(Boolean);

    // If we have items but no checkoutData, update it
    if (items.length > 0 && !checkoutData) {
      setCheckoutData({
        cart: items,
        subTotal: items.reduce((sum, item) => sum + (item.price * item.qty), 0),
      });
    }

    return items;
  }, [checkoutData, contextCart]);
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
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError('Failed to apply coupon');
    } finally {
      setLoadingCoupon(false);
    }
  };
  // const [error, setError] = useState(null);

  const [shipping, setShipping] = useState('free');
  const paymentOptions = [
    { value: 'online', label: 'Online Payment' },
    { value: 'cod', label: 'Cash on Delivery (COD)' }
  ];
  const [payment, setPayment] = useState('online');
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
  const [district, setDistrict] = useState("");
  React.useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  // Calculate cart totals safely

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
    district,
  });

  // Handle COD order creation
  const handleCreateOrder = async (paymentMethod) => {
    setLoading(true);
    setError(null);

    try {
      const orderData = {
        items: cart.map(item => ({
          productId: item._id || item.id,
          name: item.name,
          price: item.price,
          quantity: item.qty,
          image: item.image?.url || '',
          discount: item.discountAmount || 0,
          tax: ((item.cgst || 0) + (item.sgst || 0)) / 100 * item.price
        })),
        shippingInfo: {
          address: street,
          city,
          state,
          postalCode: zip,
          country,
          phone,
          district,
        },
        paymentInfo: {
          method: paymentMethod,
          status: paymentMethod === 'cod' ? 'pending' : 'completed',
          amount: subtotal,
          tax: 0, // Calculate if needed
          shipping: shippingCost
        },
        user: session?.user?.id || null,
        status: 'processing',
        totalAmount: subtotal + shippingCost,
        email,
        name: `${firstName} ${lastName}`.trim()
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }

      // Clear cart after successful order
      setCart([]);

      // Redirect to order confirmation page
      router.push(`/order-confirmation/${data.order._id}`);

      return data.order;
    } catch (error) {
      console.error('Order creation error:', error);
      setError(error.message || 'Failed to create order');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Validate all required form fields
  const validateForm = () => {
    if (!firstName.trim()) return 'First name is required.';
    if (!lastName.trim()) return 'Last name is required.';
    if (!email.trim()) return 'Email is required.';
    if (!phone.trim()) return 'Phone number is required.';
    if (!street.trim()) return 'Address is required.';
    if (!city.trim()) return 'City is required.';
    if (!district.trim()) return 'District is required.';
    if (!state.trim()) return 'State is required.';
    if (!zip || !/^[0-9]{5,6}$/.test(zip)) return 'A valid PIN code is required.';
    return '';
  };

  // Place Order handler
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Validate required fields
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    let addressSaved = false;

    // Save address if requested
    if (saveAddress) {
      const shippingData = {
        firstName,
        lastName,
        address: street,
        city,
        state,
        postalCode: zip,
        country,
        phone,
        email,
        district,
      };

      try {
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
      } catch (err) {
        console.error('Error saving address:', err);
        setError("Failed to save shipping address");
        return;
      }
    }

    // Handle payment based on selected method
    if (payment === "online") {
      if (!checkoutData) {
        setError("Checkout data not found. Please refresh the page.");
        return;
      }
      const customer = getCustomerInfo();
      const finalAmount = checkoutData.cartTotal;
      await handleOnlinePaymentWithOrder(finalAmount, checkoutData.cart, customer, setLoading, setError, router, checkoutData);
    } else if (payment === "cod") {
      // Handle Cash on Delivery
      setLoading(true);
      try {
        const order = await handleCreateOrder('cod');
        if (order) {
          // Send order confirmation email
          try {
            await fetch('/api/send-order-confirmation', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email,
                orderId: order._id,
                orderNumber: order.orderNumber,
                amount: order.totalAmount,
                items: order.items,
                shippingAddress: order.shippingInfo,
                paymentMethod: 'Cash on Delivery'
              })
            });
          } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
            // Don't fail the order if email fails
          }
          // Redirect to order confirmation page
          router.push(`/order-confirmation/${order._id}`);
        }
      } catch (error) {
        console.error('Error creating COD order:', error);
        setError(error.message || 'Failed to create order');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-10 w-full min-h-screen bg-[#fcf7f2] p-10">
      {/* Billing Details Form */}
      <div className="flex-1 bg-white rounded-lg shadow p-8">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h2 className="text-lg font-bold">Dear Customer,</h2>
          <p className="text-gray-700">To proceed with your order and ensure smooth delivery, we kindly request you to provide the following basic information:</p>
        </div>

        <form className="space-y-6" onSubmit={handlePlaceOrder}>
          <div>
            <h3 className="text-md font-semibold mb-4">Basic Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm mb-1 text-gray-600">First Name</label>
                <input
                  className="w-full py-2 px-3 bg-gray-100 rounded-md border-0"
                  required
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600">Last Name</label>
                <input
                  className="w-full py-2 px-3 bg-gray-100 rounded-md border-0"
                  required
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600">Email</label>
                <input
                  className="w-full py-2 px-3 bg-gray-100 rounded-md border-0"
                  type="email"
                  placeholder="@domain.com"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 text-gray-600">Call No.</label>
                  <input
                    className="w-full py-2 px-3 bg-gray-100 rounded-md border-0"
                    type="tel"
                    placeholder="Type Number"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-600">Alt. Call No.</label>
                  <input
                    className="w-full py-2 px-3 bg-gray-100 rounded-md border-0"
                    type="tel"
                    placeholder="Type Number"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-md font-semibold mb-4">Shipping Address</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-600">Address</label>
                <input
                  className="w-full py-2 px-3 bg-gray-100 rounded-md border-0"
                  required
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm mb-1 text-gray-600">City</label>
                  <input
                    className="w-full py-2 px-3 bg-gray-100 rounded-md border-0"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-600">Distt.</label>
                  <input
                    className="w-full py-2 px-3 bg-gray-100 rounded-md border-0"
                    required
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-600">State</label>
                  <input
                    className="w-full py-2 px-3 bg-gray-100 rounded-md border-0"
                    required
                    value={state}
                    onChange={e => setState(e.target.value)}
                  />
                </div>
              </div>
              <div className="text-center text-sm text-red-500">
                Check Delivery to Your Area – Enter Your PIN Code
              </div>
            </div>
          </div>

          {/* <div>
            <h3 className="text-md font-semibold mb-4">Ship to a different address?</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-600">Address</label>
                <input
                  className="w-full py-2 px-3 bg-gray-100 rounded-md border-0"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm mb-1 text-gray-600">City</label>
                  <input
                    className="w-full py-2 px-3 bg-gray-100 rounded-md border-0"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-600">Distt.</label>
                  <input
                    className="w-full py-2 px-3 bg-gray-100 rounded-md border-0"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-600">State</label>
                  <input
                    className="w-full py-2 px-3 bg-gray-100 rounded-md border-0"
                  />
                </div>
              </div>
              <div className="text-center text-sm text-red-500">
                Check Delivery to Your Area – Enter Your PIN Code
              </div>
            </div>
          </div> */}

          <div className="text-center text-gray-700 text-sm">
            This helps us serve you better and keep you updated on your order status.
          </div>

          {/* <button
            className="w-full py-3 bg-black text-white rounded-md font-semibold text-sm"
            type="submit"
            disabled={!agree || loading}
          >
            {loading ? "Processing..." : "Looks Good? Keep Going!"}
          </button>

          {error && <div className="text-red-600 text-sm mt-2">{error}</div>} */}
        </form>

        <div className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            id="saveAddress"
            checked={saveAddress}
            onChange={e => setSaveAddress(e.target.checked)}
            className="accent-pink-600 w-4 h-4"
          />
          <label htmlFor="saveAddress" className="text-sm select-none">Save this address to my account</label>
        </div>
      </div>
      {/* Order Summary Card */}
      <div className="w-full md:w-[420px] bg-white rounded-lg shadow p-6 self-start">
        {/* Coupon Input - show only if cart has products and no coupon is applied */}
        {checkoutData ? (
          <>
            <div className="divide-y divide-neutral-200 mb-4">
              {checkoutData.cart.map(item => (
                <div key={item.id} className="flex items-center gap-3 py-3 relative">
                  <img src={item.image?.url} alt={item.name} className="w-16 h-16 rounded object-cover border" />
                  <div className="flex-1">
                    <div className="font-medium text-sm leading-tight mb-1">{item.name}</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border rounded-md">
                        <button
                          className="px-2 py-1 text-gray-500 hover:text-black"
                          type="button"
                          onClick={() => updateCartQty(item.id, Math.max(1, item.qty - 1))}
                          disabled={item.qty <= 1}
                        >-</button>
                        <span className="px-2 py-1 text-sm">{item.qty}</span>
                        <button
                          className="px-2 py-1 text-gray-500 hover:text-black"
                          type="button"
                          onClick={() => updateCartQty(item.id, item.qty + 1)}
                        >+</button>
                      </div>
                      <div className="text-md text-black font-semibold">₹{item.afterDiscount?.toFixed(2) ?? item.price?.toFixed(2)}</div>
                    </div>
                  </div>
                  <button
                    className="absolute top-3 right-0 text-gray-400 hover:text-red-500"
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    aria-label="Remove"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 p-3 rounded-md mb-4">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-gray-600">Subtotal <span className="text-xs text-gray-400">(MRP)</span></span>
                <span>₹{checkoutData.subTotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-gray-600">Discount Amount</span>
                <span className="text-green-600">-₹{checkoutData.totalDiscount?.toFixed(2)}</span>
              </div>
              {checkoutData.promo && (
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-gray-600">Promo Code <span className="text-xs text-green-600">({checkoutData.promo.code})</span></span>
                  <span className="text-green-600">-₹{checkoutData.promo.discount?.toFixed(2)}</span>
                </div>
              )}
              <div className="text-xs text-gray-500 mb-2">Note: If discount code is already applied, it cannot be combined with other codes.</div>
              <div className="border-t border-gray-200 my-2"></div>
              <div className="flex justify-between items-center font-medium">
                <span>Next: You spend ₹ 1000.00 on your order:</span>
              </div>
            </div>



            <div className="mb-4">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-gray-600">Shipping Charges</span>
                <span>₹{checkoutData.finalShipping?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-gray-600">Total CGST %</span>
                <span>₹{(checkoutData.taxTotal / 2)?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-gray-600">Total SGST %</span>
                <span>₹{(checkoutData.taxTotal / 2)?.toFixed(2)}</span>
              </div>
              <div className="text-xs text-gray-500 mb-2">Search Available Pin Code For Confirm Shipment</div>
            </div>

            <div className="border-t border-gray-200 pt-3 mb-4">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Final Amount</span>
                <span>₹{checkoutData.cartTotal?.toFixed(2)}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Have a promo code?</label>
              <div className="flex gap-2">
                <input
                  className="border rounded px-3 py-2 flex-1 text-sm"
                  placeholder="PROMOCODE001"
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value)}
                  disabled={loadingCoupon}
                />
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded font-semibold text-sm disabled:opacity-60"
                  onClick={handleApplyCoupon}
                  disabled={loadingCoupon || !couponInput.trim()}
                  type="button"
                >
                  {loadingCoupon ? "Applying..." : "Apply"}
                </button>
              </div>
              {couponError && <div className="text-red-600 text-xs mt-1">{couponError}</div>}
            </div>
            <div className="mb-6">
              <h3 className="font-medium mb-3">Payment Method</h3>
              <div className="space-y-3 mb-4">
                {paymentOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-3 border rounded-md cursor-pointer ${payment === option.value ? 'border-black' : 'border-gray-200'}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={option.value}
                      checked={payment === option.value}
                      onChange={(e) => setPayment(e.target.value)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{option.label}</div>
                      {option.value === 'cod' && (
                        <p className="text-sm text-gray-500 mt-1">Pay when you receive your order</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-4">
                {/* <img src="/images/razorpay.svg" alt="Razorpay" className="h-6" /> */}
                <span className="text-sm text-gray-600">100% Secure Payment</span>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <img src="/visa-img.png" alt="Visa" className="h-4" />
                <img src="/master-card.png" alt="Mastercard" className="h-4" />
                <img src="/rupay.png" alt="Rupay" className="h-4" />
                <img src="/upi.png" alt="UPI" className="h-4" />
              </div>
              <p className="text-xs text-gray-500 mt-2">We accept all major credit/debit cards, UPI, and Netbanking.</p>
            </div>
          </>
        ) : (
          <div className="text-red-600">No checkout data found.</div>
        )}

        <div className="flex items-start gap-2 mt-6 mb-4">
          <input
            type="checkbox"
            id="terms"
            checked={agree}
            onChange={e => setAgree(e.target.checked)}
            className="accent-pink-600 w-4 h-4 mt-1"
          />
          <label htmlFor="terms" className="text-xs text-gray-600">
            I have read and agree to the website terms and conditions
          </label>
        </div>

        <button
          className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded font-semibold text-sm transition-colors"
          disabled={!agree || loading || !firstName || !lastName || !email || !phone || !street || !city || !state || !zip || !payment}
          type="submit"
        >
          {loading ? "Processing..." : `Pay ₹${checkoutData?.cartTotal?.toFixed(2) || '0.00'}`}
        </button>
      </div>
    </div>
  );
}
export default CheckOut;