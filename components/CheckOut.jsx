"use client"
import React, { useState } from 'react';
import { useCart } from "../context/CartContext";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

const shippingOptions = [
  { label: 'Free shipping', value: 'free', cost: 0 },
  { label: 'Flat Rate', value: 'flat', cost: 25.75 },
];
// Function to load Razorpay script on client
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-sdk')) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Function to trigger Razorpay payment modal
const triggerRazorpay = async ({ cartTotal, orderId, firstName, lastName, email, phone }) => {
  // 1. Load Razorpay script
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    alert('Failed to load Razorpay SDK. Please try again.');
    return;
  }

  // 2. Create Razorpay order via backend
  const response = await fetch('/api/razorpay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: cartTotal, // Send in rupees, backend will multiply by 100
      currency: 'INR',
      receipt: orderId,
    }),
  });
  const data = await response.json();
  if (!data.id) {
    alert('Failed to create Razorpay order.');
    return;
  }

  // 3. Open Razorpay checkout
  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount: data.amount, // in paise
    currency: data.currency,
    name: 'Rishikesh Handmade',
    description: 'Order Payment',
    order_id: data.id, // Use Razorpay's order id here!
    handler: function (response) {
      // Payment success handler
      window.location.href = `/dashboard?orderId=${data.userOrderId}`;
      // Clear buyNowProduct after successful payment (Buy Now mode)
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.get('mode') === 'buy-now') {
          localStorage.removeItem('buyNowProduct');
        }
      }
    },
    prefill: {
      name: `${firstName || ''} ${lastName || ''}`.trim(),
      email: email || '',
      contact: phone || '',
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};


// Function to handle online payment with explicit backend order creation
import axios from 'axios';
import { toast } from 'react-hot-toast';

// --- Centralized Order Payload Builder ---
function buildOrderPayload({
  cart,
  checkoutData,
  street, city, district, state, pincode,
  firstName, lastName, email, phone, altPhone,
  payment, transactionId, orderId, agree
}) {
  const fullAddress = [street, city, district, state, pincode].filter(Boolean).join(', ');
  return {
    products: cart,
    cartTotal: checkoutData?.cartTotal,
    subTotal: checkoutData?.subTotal,
    totalDiscount: checkoutData?.totalDiscount,
    totalTax: checkoutData?.totalTax,
    shippingCost: checkoutData?.shippingCost,
    promoCode: checkoutData?.promoCode,
    promoDiscount: checkoutData?.promoDiscount,
    // Billing/shipping info
    firstName,
    lastName,
    email,
    phone,
    altPhone,
    street,
    city,
    district,
    state,
    pincode,
    address: fullAddress,
    // Payment/order info
    orderId,
    transactionId,
    payment,
    paymentMethod: payment,
    status: 'Pending',
    agree,
    datePurchased: new Date(),
  };
}

// Unified Handler for Online Payment with Order Creation
const handleOnlinePaymentWithOrder = async (finalAmount, cart, customer, setLoading, setError, routerInstance, checkoutData, formFields) => {
  setLoading(true);
  setError(null);
  try {
    // 1. Gather all form fields and order data
    const {
      firstName, lastName, email, phone, altPhone,
      street, city, district, state, pincode,
    } = formFields;
    const address = [street, city, district, state, pincode].filter(Boolean).join(', ');
    // 2. Create Razorpay order and save in DB
    const orderResponse = await axios.post("/api/razorpay", {
      amount: finalAmount, // in rupees
      currency: "INR",
      receipt: `order_${Date.now()}`,
      products: cart,
      customer: {
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone,
        address,
      },
      // Optionally include any other fields you want to persist
    });
    const { id: orderId } = orderResponse.data;
    if (!orderId) {
      setError('Failed to create Razorpay order.');
      setLoading(false);
      return;
    }
    // 3. Load Razorpay script
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError('Failed to load Razorpay SDK.');
      setLoading(false);
      return;
    }
    // 4. Open Razorpay modal
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: finalAmount * 100,
      currency: "INR",
      name: "Rishikesh Handmade",
      description: "Order Payment",
      order_id: orderId,
      handler: async (response) => {
        try {
          // 5. Verify payment and update order in DB
          await axios.put("/api/razorpay", {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });
          toast.success('Payment successful! Check your email for details.', {
            style: { borderRadius: '10px', border: '2px solid green' },
          });
          if (routerInstance && orderId) {
            routerInstance.push(`/dashboard?orderId=${orderId}`);
          }
        } catch (err) {
          setError('Payment verification or order update failed!');
          toast.error('Payment verification or order update failed!');
        }
      },
      prefill: {
        name: `${firstName} ${lastName}`.trim(),
        email,
        contact: phone,
      },
      theme: { color: "#3399cc" },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
    setLoading(false);
  } catch (error) {
    setError(error.message || 'Payment failed. Please try again.');
    setLoading(false);
  }



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
    // 2. Create order in backend (only ONCE, before payment)
    // 1. Create Razorpay order to get a unique orderId
    const razorpayOrderRes = await fetch('/api/razorpay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: checkoutData?.cartTotal || finalAmount,
        currency: 'INR',
        receipt: 'order_rcptid_' + Date.now(),
      }),
    });
    const razorpayOrderData = await razorpayOrderRes.json();
    if (!razorpayOrderData.id) {
      setError('Failed to create Razorpay order.');
      setLoading(false);
      return;
    }
    const orderPayload = {
      products: cart, // full cart array
      cartTotal: checkoutData?.cartTotal || finalAmount,
      subTotal: checkoutData?.subTotal,
      totalDiscount: checkoutData?.totalDiscount,
      totalTax: checkoutData?.totalTax,
      shippingCost: checkoutData?.shippingCost,
      promoCode: checkoutData?.promoCode,
      promoDiscount: checkoutData?.promoDiscount,
      // Billing/shipping info
      firstName: checkoutData?.firstName,
      lastName: checkoutData?.lastName,
      email: checkoutData?.email,
      phone: checkoutData?.phone,
      street: checkoutData?.street,
      city: checkoutData?.city,
      state: checkoutData?.state,
      pincode: checkoutData?.pincode,
      address: checkoutData?.address || '', // Ensure address is sent
      // Payment/order info
      orderId: razorpayOrderData.id, // Save Razorpay order ID
      transactionId: checkoutData?.transactionId || '',
      payment: checkoutData?.payment || 'online',
      status: checkoutData?.status || 'Pending',
      paymentMethod: checkoutData?.paymentMethod || 'online',
      bank: checkoutData?.bank,
      cardType: checkoutData?.cardType,
      // Misc
      notes: checkoutData?.notes,
      agree: checkoutData?.agree,
      datePurchased: new Date(),
    };
    console.log('Order Payload:', orderPayload);
    console.log('Order Payload:', orderPayload);
    // POST order (save in DB)
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });
    if (!response.ok) {
      setError("Failed to create order. Please try again.");
      setLoading(false);
      return;
    }
    const data = await response.json();
    const orderId = data.orderId || data.id || data._id;
    if (!orderId) {
      setError("Order creation failed. No order ID returned.");
      setLoading(false);
      return;
    }
    // 3. Call Razorpay checkout
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: checkoutData?.cartTotal ? Math.round(checkoutData.cartTotal * 100) : Math.round(finalAmount * 100),
      currency: 'INR',
      name: customer.name || 'Your Company Name',
      description: 'Order payment',
      image: 'https://rishikeshhandmade.com/logo.png',
      order_id: orderId, // Use your DB orderId or Razorpay orderId if you use a backend Razorpay order creation
      handler: async function (response) {
        try {
          // Only update the existing order (do NOT create a new one)
          const verificationResponse = await axios.put(`/api/orders/${orderId}`, {
            status: 'Paid',
            transactionId: response.razorpay_payment_id,
            payment: 'online',
            paymentMethod: 'online',
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          if (verificationResponse.data.success) {
            try {
              await axios.post('/api/brevo', {
                to: customer.email,
                subject: 'Order Confirmation',
                htmlContent: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Order Confirmation</title></head><body><div class="container"><div class="header"><h2>Thank you for your order!</h2><p>Hello, ${customer.name}</p></div><div class="footer"><p>Order ID: ${orderId}</p><p>Order Date: ${new Date().toLocaleDateString()}</p></div></div></body></html>`
              });
            } catch (e) { /* handle email error */ }
            if (routerInstance && orderId) {
              routerInstance.push("/dashboard?orderId=" + orderId);
            }
            toast.success('Payment successful! Check your email for details.', {
              style: { borderRadius: '10px', border: '2px solid green' },
            });
          } else {
            setError('Order update failed after payment.');
            toast.error('Order update failed after payment!');
          }
        } catch (err) {
          setError('Payment verification or order update failed!');
          if (typeof toast === 'function') {
            toast.error('Payment verification or order update failed!');
          }
        }
      },
      prefill: {
        name: customer.name,
        email: customer.email,
        contact: customer.phone,
      },
      theme: { color: '#3399cc' },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
    setLoading(false);
  } catch (error) {
    setError(error.message || 'Payment failed. Please try again.');
    setLoading(false);
  }

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
    // Build complete order payload
    const orderPayload = {
      products: cart, // array of product objects
      cartTotal: checkoutData?.cartTotal || finalAmount,
      subTotal: checkoutData?.subTotal,
      totalDiscount: checkoutData?.totalDiscount,
      totalTax: checkoutData?.totalTax,
      shippingCost: checkoutData?.shippingCost,
      promoCode: checkoutData?.promoCode,
      promoDiscount: checkoutData?.promoDiscount,
      // Billing/shipping info
      firstName: checkoutData?.firstName,
      lastName: checkoutData?.lastName,
      email: checkoutData?.email,
      phone: checkoutData?.phone,
      street: checkoutData?.street,
      city: checkoutData?.city,
      state: checkoutData?.state,
      pincode: checkoutData?.pincode,
      // Payment/order info
      orderId: checkoutData?.orderId || '', // Razorpay or internal order id
      transactionId: checkoutData?.transactionId || '',
      payment: checkoutData?.payment || 'online',
      status: checkoutData?.status || 'Pending',
      paymentMethod: checkoutData?.paymentMethod || 'online',
      bank: checkoutData?.bank,
      cardType: checkoutData?.cardType,
      // Misc
      agree: checkoutData?.agree,
      datePurchased: new Date(),
    };

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    });
    if (!response.ok) {
      setError("Failed to create order. Please try again.");
      setLoading(false);
      return;
    }
    const data = await response.json();
    const orderId = data.orderId || data.id || data._id;
    if (!orderId) {
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
      order_id: data.razorpayOrderId || data.orderId || data.id,
      handler: function (response) {
        (async () => {
          try {
            // Verify payment (PUT for verification as in package checkout)
            const verificationResponse = await axios.put(`/api/orders/${orderId}`, {
              status: 'Paid',
              transactionId: response.razorpay_payment_id,
              payment: 'online',
              paymentMethod: 'online',
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
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
              if (routerInstance && orderId) {
                routerInstance.push("/dashboard?orderId=" + orderId);
              }
              toast.success('Payment successful! Check your email for details.', {
                style: { borderRadius: '10px', border: '2px solid green' },
              });
            } else {
              setError('Order update failed after payment.');
              toast.error('Order update failed after payment!');
            }
          } catch (err) {
            setError('Payment verification or order update failed!');
            if (typeof toast === 'function') {
              toast.error('Payment verification or order update failed!');
            }
          }
        })();
      }
    };
    if (typeof window !== "undefined" && typeof window.Razorpay === "function") {
      try {
        const rzp = new window.Razorpay(options);
        console.log('[Razorpay] Opening payment modal...');
        rzp.open();
      } catch (modalErr) {
        setError('Failed to open Razorpay payment modal.');
        console.error('[Razorpay] Error opening modal:', modalErr);
      }
    } else {
      setError("Razorpay is not available on window. Check if SDK loaded correctly.");
      console.error('[Razorpay] Razorpay is not a function on window:', window?.Razorpay);
    }
  } catch (error) {
    setError("Unexpected error: " + error.message);
  }
  setLoading(false);
}


import CheckOutOverview from './CheckOutOverview';
import { usePathname, useRouter } from "next/navigation"



const CheckOut = () => {
  // State for address fields
  const [pincode, setPincode] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");

  useEffect(() => {
    // Load checkout data from localStorage
    const data = localStorage.getItem("checkoutCart");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        console.log(parsed)
        setPincode(parsed.pincode || "");
        setState(parsed.state || "");
        setDistrict(parsed.district || "");
      } catch (e) {
        // Optionally handle error
      }
    }
  }, []);

  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { cart: contextCart, setCart, removeFromCart } = useCart();
  const [checkoutData, setCheckoutData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false); // Prevents double payment attempts
  const [error, setError] = useState(null);
  // Coupon state
  // console.log(checkoutData)
  const [couponInput, setCouponInput] = useState("");
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("")
  const [showOverview, setShowOverview] = useState(false);
  const [confirmedPaymentMethod, setConfirmedPaymentMethod] = useState(null);
  const [shipping, setShipping] = useState('free');
  // Load cart data from localStorage and handle authentication state
  useEffect(() => {
    const loadCartData = () => {
      // Check for buy-now mode in URL
      let isBuyNow = false;
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        isBuyNow = params.get('mode') === 'buy-now';
      }
      if (isBuyNow) {
        // Load buyNowProduct from localStorage
        const buyNowRaw = typeof window !== "undefined" ? localStorage.getItem('buyNowProduct') : null;
        if (buyNowRaw) {
          try {
            const buyNowProduct = JSON.parse(buyNowRaw);
            // Wrap as array for cart compatibility
            setCheckoutData({
              cart: [buyNowProduct],
              subTotal: buyNowProduct.price * (buyNowProduct.qty || 1),
              // Add other fields if needed
            });
            setCart([buyNowProduct]); // Update context for downstream compatibility
          } catch (error) {
            console.error("Error parsing buyNowProduct:", error);
            setCheckoutData(null);
          }
        } else {
          setCheckoutData(null);
        }
        setIsLoading(false);
        return;
      }
      // Fallback to normal cart flow
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

    // Load cart/buy-now data when component mounts or when auth status changes
    loadCartData();
  }, [status]); // Re-run when auth status changes
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
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  // const [state, setState] = useState("");
  // const [pincode, setpincode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  // const [district, setDistrict] = useState("");
  const [altPhone, setAltPhone] = useState("");

  React.useEffect(() => { setMounted(true); }, []);
  const isLoadingOrUnauth = status === 'loading' || !session;

  React.useEffect(() => {
    if (!mounted) return;
    if (status === 'loading') return;
    if (!session) {
      router.replace(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [session, status, router, pathname, mounted]);

  if (!mounted || isLoadingOrUnauth) {
    // Optionally render a spinner or nothing while redirecting
    return null;
  }

  // Calculate cart totals safely
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shippingCost = shippingOptions.find(opt => opt.value === shipping)?.cost || 0;
  const total = subtotal + shippingCost;

  // Collect customer info for Razorpay
  const getCustomerInfo = () => ({
    name: `${firstName} ${lastName}`.trim(),
    email,
    phone,
    altPhone,
    address: `${street}, ${city}, ${state}, ${pincode}`,
    district,
  });
  const updateCartQty = (id, qty) => {
    setCheckoutData(prev => {
      const updated = prev.cart.map(item =>
        item.id === id ? { ...item, qty, afterDiscount: (item.price - (item.discountAmount || 0)) * qty } : item
      );
      const subTotal = updated.reduce((sum, item) => sum + item.price * item.qty, 0);
      const totalDiscount = updated.reduce((sum, item) => sum + (item.discountAmount || 0) * item.qty, 0);
      const cartTotal = updated.reduce((sum, item) => sum + item.afterDiscount, 0) + prev.taxTotal + prev.finalShipping;
      return { ...prev, cart: updated, subTotal, totalDiscount, cartTotal };
    });
  };
  // Handle COD order creation
  const handleCreateOrder = async (paymentMethod) => {
    setLoading(true);
    // If buy-now mode, clear buyNowProduct after order
    let isBuyNow = false;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      isBuyNow = params.get('mode') === 'buy-now';
    }
    // ... rest of function ...
    // After successful order/payment:
    if (isBuyNow) {
      localStorage.removeItem('buyNowProduct');
    }

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
          postalCode: pincode,
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

      console.log('Order Payload:', orderData);

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
      router.push(`/dashboard?orderId=${data.order._id}`);

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
    if (!altPhone.trim()) return 'Alt Phone number is required.';
    if (!pincode || !/^[0-9]{5,6}$/.test(pincode)) return 'A valid PIN code is required.';
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
        postalCode: pincode,
        phone,
        email,
        district,
        altPhone,
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
          router.push(`/dashboard?orderId=${order._id}`);
        }
      } catch (error) {
        console.error('Error creating COD order:', error);
        setError(error.message || 'Failed to create order');
      } finally {
        setLoading(false);
      }
    }
  };


  // Handler for form submission (step 1 → step 2)
  const handleShowOverview = (e) => {
    // e.preventDefault();
    if (loading) return;
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    // console.log("Setting showOverview to true");
    setShowOverview(true);
    setConfirmedPaymentMethod(payment); // Save chosen payment method
  };

  // Handler for confirming payment on overview (step 2 → step 3)
  const handleConfirmAndPay = async () => {
    setLoading(true);
    try {
      // Build form fields from state for payload
      const formFields = {
        street, city, district, state, pincode, firstName, lastName, email, phone, altPhone
      };
      let orderId = checkoutData?.orderId;
      let transactionId = checkoutData?.transactionId;

      if (confirmedPaymentMethod === 'cod') {
        // Always generate unique orderId and transactionId for COD
        orderId = `COD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        if (!transactionId) transactionId = orderId;
        const orderPayload = buildOrderPayload({
          cart: contextCart,
          checkoutData,
          ...formFields,
          payment: 'cod',
          transactionId,
          orderId,
          agree,
        });
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload)
        });
        const data = await res.json();
        if (!data.orderId) {
          setError('Order creation failed.');
          setLoading(false);
          return;
        }
        // Optionally send confirmation email here
        try {
          await fetch('/api/brevo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: email,
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
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Thank you for your order!</h2>
          <p>Hello, ${firstName} ${lastName}</p>
        </div>
        <div class="footer">
          <p>Order ID: ${orderId}</p>
          <p>Order Date: ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </body>
    </html>`
            })
          });
        } catch (e) { /* handle email error */ }
        router.push(`/dashboard?orderId=${data.orderId}`);
        setLoading(false);
        return;
      }
      // For online, always go through Razorpay handler
      if (confirmedPaymentMethod === 'online') {
        const customer = {
          name: `${firstName} ${lastName}`.trim(),
          email,
          phone
        };
        await handleOnlinePaymentWithOrder(
          checkoutData?.cartTotal,
          contextCart,
          customer,
          setLoading,
          setError,
          router,
          checkoutData,
          formFields
        );
        return;
      }
      setLoading(false);
    } catch (error) {
      setError(error.message || 'Order creation failed.');
      setLoading(false);
    }
  }


  if (showOverview) {
    // console.log("Rendering overview");
    return (
      <CheckOutOverview
      checkoutData={{
        ...checkoutData,
        firstName,
        lastName,
        email,
        phone,
        altPhone,
        street,
        city,
        district,
        state,
        pincode,
        address: [street, city, district, state, pincode].filter(Boolean).join(', '),
      }}
      paymentMethod={confirmedPaymentMethod}
      onEdit={() => setShowOverview(false)}
      onConfirm={handleConfirmAndPay}
      loading={loading}
      error={error}
    />
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-10 w-full min-h-screen bg-[#fcf7f2] p-10">
      {/* Billing Details Form */}
      <div className="flex-1 bg-white rounded-lg shadow p-8">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <p className="text-xl font-bold">Thanks for being a loyal customer, Your cart is ready. Rishkish Handmade is a trusted growth partner to millions of everyday entrepreneurs.</p>
          <br />
          <p className="text-lg font-bold">Dear Customer,To proceed with your order and ensure smooth delivery, we kindly request you to provide the following basic information:</p>
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
                  type="text"
                  placeholder="Enter First Name"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600">Last Name</label>
                <input
                  className="w-full py-2 px-3 bg-gray-100 rounded-md border-0"
                  required
                  type="text"
                  placeholder="Enter Last Name"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600">Email</label>
                <input
                  className="w-full py-2 px-3 bg-gray-100 rounded-md border-0"
                  type="email"
                  placeholder="example@gmail.com"
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
                    maxLength={10}
                    pattern="[0-9]{10}"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-600">Alt. Call No.</label>
                  <input
                    className="w-full py-2 px-3 bg-gray-100 rounded-md border-0"
                    type="tel"
                    maxLength={10}
                    placeholder="Type Number"
                    pattern="[0-9]{10}"
                    value={altPhone}
                    onChange={e => setAltPhone(e.target.value)}
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
                  type="text"
                  placeholder="Enter Address"
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600">Pincode</label>
                <input
                  className="w-fit py-2 px-3 bg-gray-100 rounded-md border-0"
                  required
                  type="number"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  placeholder='Enter Pincode'
                  value={pincode}
                  onChange={e => setPincode(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm mb-1 text-gray-600">City</label>
                  <input
                    className="w-full py-2 px-3 bg-gray-100 rounded-md border-0"
                    required
                    type="text"
                    placeholder="Enter City"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-600">Distt.</label>
                  <input
                    className="w-full py-2 px-3 bg-gray-100 rounded-md border-0"
                    required
                    type="text"
                    placeholder="Enter District"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-600">State</label>
                  <input
                    className="w-full py-2 px-3 bg-gray-100 rounded-md border-0"
                    required
                    type="text"
                    placeholder="Enter State"
                    value={state}
                    onChange={e => setState(e.target.value)}
                  />
                </div>
              </div>
              {/* <div className="text-center text-sm text-red-500">
                Check Delivery to Your Area – Enter Your PIN Code
              </div> */}
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
                      <div className="flex items-center border rounded-md bg-gray-100">
                        <button
                          className="px-2 py-1 text-gray-500 hover:text-black"
                          type="button"
                          onClick={() => updateCartQty(item.id, Math.max(1, item.qty - 1))}
                          disabled={item.qty <= 1}
                        >-</button>
                        <span className="px-3 py-1 text-base font-semibold">{item.qty}</span>
                        <button
                          className="px-2 py-1 text-gray-500 hover:text-black"
                          type="button"
                          onClick={() => updateCartQty(item.id, item.qty + 1)}
                        >+</button>
                      </div>
                      <div className="text-md text-black font-semibold whitespace-nowrap">₹{(item.originalPrice).toFixed(2)}</div>
                    </div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-gray-600">CGST ({item.cgst}%)</span>
                      <span>₹{((item.afterDiscount * item.cgst / 100) * item.qty).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-gray-600">SGST ({item.sgst}%)</span>
                      <span>₹{((item.afterDiscount * item.sgst / 100) * item.qty).toFixed(2)}</span>
                    </div>
                    {item.couponApplied && (
                      <div className="mt-2">
                        <span className="bg-cyan-500 text-white text-xs rounded px-2 py-1 font-semibold">
                          Applied Coupon{" "}
                          {item.discountPercent
                            ? `${item.discountPercent}% off`
                            : `₹${item.discountAmount} off`}
                        </span>
                      </div>
                    )}


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
              <div className="text-xs text-red-500 mb-1">Subtotal does not include applicable taxes</div>
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-gray-600">Discount Amount</span>
                <span className="text-green-600">-₹{checkoutData.totalDiscount?.toFixed(2)}</span>
              </div>
              {checkoutData.couponApplied && (
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-gray-600">Coupon <span className="text-xs text-green-600">({checkoutData.coupon.code})</span></span>
                  <span className="text-green-600">-₹{checkoutData.coupon.discount?.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 my-2"></div>
              {(checkoutData.totalDiscount > 0 || (checkoutData.promo && checkoutData.promo.discount > 0)) && (
                <div className="flex items-center text-green-700 font-semibold text-base mb-2">
                  Nice! You saved <span className="mx-1">₹ {checkoutData.totalDiscount?.toFixed(2)}</span> on your order.
                </div>
              )}
              <div className="text-xs text-gray-500 mb-2">Note : If discount promo code already applied extra additional coupon not applicable</div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-gray-600">Shipping Charges</span>
                <span>₹{checkoutData.finalShipping?.toFixed(2)}</span>
              </div>
              {(() => {
                const totalCGST = checkoutData.cart.reduce(
                  (sum, item) => sum + ((item.afterDiscount * item.cgst / 100) * item.qty),
                  0
                );
                const totalSGST = checkoutData.cart.reduce(
                  (sum, item) => sum + ((item.afterDiscount * item.sgst / 100) * item.qty),
                  0
                );
                return (
                  <>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-gray-600">Total CGST</span>
                      <span>₹{totalCGST.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-gray-600">Total SGST</span>
                      <span>₹{totalSGST.toFixed(2)}</span>
                    </div>
                  </>
                );
              })()}
              {/* <div className="text-xs text-red-500 mb-2">Search Available Pin Code For Confirm Shipment.</div> */}
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
                  className="border rounded px-3 py-2 flex-1 text-sm bg-blue-50"
                  placeholder="Apply Promo Code"
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value)}
                  disabled={loadingCoupon}
                />
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded font-semibold text-sm disabled:opacity-60"
                  onClick={() => {
                    if (couponInput.trim().toLowerCase() === 'hello') {
                      setCheckoutData(prev => ({
                        ...prev,
                        cartTotal: prev.cartTotal - 20
                      }));
                      setCouponError('');
                    } else {
                      setCouponError('Invalid promo code');
                    }
                  }}
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

        <pre style={{ fontSize: '12px', background: '#f5f5f5', padding: '8px', borderRadius: '6px', marginBottom: '8px' }}>
          {JSON.stringify({
            agree, loading, isProcessingPayment, firstName, lastName, email, phone, street, city, state, pincode, payment
          }, null, 2)}
        </pre>
        <button
          className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded font-semibold text-sm transition-colors"
          disabled={!agree || loading || isProcessingPayment || !firstName || !lastName || !email || !phone || !street || !city || !state || !pincode || !payment}
          type="button"
          onClick={async () => {
            if (isProcessingPayment) return;
            setIsProcessingPayment(true);
            setError(null);
            try {
              await handleShowOverview();
            } catch (err) {
              setError(err?.message || 'Unexpected error during payment.');
            } finally {
              setIsProcessingPayment(false);
            }
          }}
        >
          {isProcessingPayment ? (
            <>
              <span className="animate-spin inline-block mr-2">🔄</span> Processing Payment...
            </>
          ) : loading ? "Processing..." : `Pay ₹${checkoutData?.cartTotal?.toFixed(2) || '0.00'}`}

        </button>

      </div>
    </div>

  );
}

export default CheckOut;