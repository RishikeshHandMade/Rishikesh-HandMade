"use client"
import React, { useState } from 'react';
import { useCart } from "../context/CartContext";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";
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


// Function to handle online payment with explicit backend order creation
import axios from 'axios';
import { toast } from 'react-hot-toast';

// --- Centralized Order/Transaction ID Generators ---
function generateOrderId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ORD-${result}`;
}
function generateTransactionId() {
  return `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
}
// --- Centralized Order Payload Builder ---
function buildOrderPayload({
  cart,
  checkoutData,
  street, city, district, state, pincode,
  firstName, lastName, email, phone, altPhone,
  payment, transactionId, orderId, agree, paymentMethodValue, statusValue
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
    payment: paymentMethodValue, // 'cod', 'online', 'direct'
    paymentMethod: paymentMethodValue,
    status: statusValue || 'Pending',
    agree,
    datePurchased: new Date(),
  };
}

// Unified Handler for Online Payment with Order Creation



import CheckOutOverview from './CheckOutOverview';
import { usePathname, useRouter } from "next/navigation"


// Debug: Log modal state changes
const CheckOut = () => {
  // --- Buy Now Mode Detection ---
  const [buyNowMode, setBuyNowMode] = useState(false);

  // State for address fields
  const [pincode, setPincode] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [recentOrderId, setRecentOrderId] = useState(null);

  useEffect(() => {
    // console.log('[CheckOut] showConfirmationModal:', showConfirmationModal, 'recentOrderId:', recentOrderId);
  }, [showConfirmationModal, recentOrderId]);

  useEffect(() => {
    // Load checkout data from localStorage
    const data = localStorage.getItem("checkoutCart");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        // console.log(city)
        setPincode(parsed.pincode || "");
        setCity(parsed.city || "");
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
  console.log(checkoutData)
  const [couponInput, setCouponInput] = useState("");
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedPromo, setAppliedPromo] = useState("");
  const [appliedPromoDetails, setAppliedPromoDetails] = useState(null);
  const [showOverview, setShowOverview] = useState(false);
  const [confirmedPaymentMethod, setConfirmedPaymentMethod] = useState(null);
  const [shipping, setShipping] = useState('free');
  // Load cart data from localStorage and handle authentication state

  const handleOnlinePaymentWithOrder = async (finalAmount, cart, customer, setLoading, setError, routerInstance, checkoutData, formFields, user) => {
    setLoading(true);
    setError(null);
    try {
      // Build a robust payload for Razorpay order creation (and DB save)
      const payload = {
        userId: user?._id,
        name: formFields.fullName || (formFields.firstName ? `${formFields.firstName} ${formFields.lastName}` : undefined),
        email: formFields.email,
        phone: formFields.mobile || formFields.phone,
        address: formFields.address || [formFields.street, formFields.city, formFields.district, formFields.state, formFields.pincode].filter(Boolean).join(', '),
        apartment: formFields.apartment,
        city: formFields.city,
        state: formFields.state,
        pincode: formFields.pincode,
        products: cart,
        amount: finalAmount, // in rupees
        currency: "INR",
        receipt: `order_${Date.now()}`,
        agree: true, // Always set agree true for online orders
        orderId: checkoutData?.orderId, // pass consistent orderId
        transactionId: checkoutData?.transactionId // pass consistent transactionId
      };
      let orderResponse;
      try {
        orderResponse = await axios.post("/api/razorpay", payload);
      } catch (error) {
        // console.error('Order creation error:', error, error?.response?.data);
        setError(error?.response?.data?.error || error.message || 'Order creation failed.');
        setLoading(false);
        return;
      }
      // console.log('Backend response for order creation:', orderResponse.data);
      if (orderResponse.data.error) {
        setError(orderResponse.data.error);
        setLoading(false);
        return;
      }
      const { id: razorpayOrderId, orderId } = orderResponse.data;
      if (!razorpayOrderId) {
        setError('Order creation failed. No order ID returned.');
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
        order_id: razorpayOrderId,
        handler: async (response) => {
          // Always pass the same orderId/transactionId as generated above
          response.orderId = checkoutData?.orderId;
          response.transactionId = checkoutData?.transactionId;
          // console.log("Razorpay handler called", response);

          // Update quantities after successful payment by creating a temporary order
          // This reuses the same logic as the COD flow
          try {
            const tempOrderId = `online-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
            const tempTransactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

            // Create a temporary order payload with the same structure as COD
            const tempOrderPayload = {
              products: cart.map(item => {
                // Extract product ID from either direct property, quantity object, or _id
                const productId = item.id || item._id || (item.quantity?.product ? item.quantity.product.toString() : null);

                if (!productId) {
                  console.error('Cannot determine product ID for item:', item);
                  return null;
                }

                return {
                  ...item,
                  quantity: item.quantity || item.qty || 1,
                  // Ensure we have the required fields for the order
                  productId: productId,
                  _id: productId, // Also set _id for backward compatibility
                  variantId: item.variantId || 0,
                  price: item.price || 0,
                  name: item.name || 'Product',
                  image: item.image?.url || item.image || ''
                };
              }).filter(Boolean), // Remove any null items
              cartTotal: finalAmount,
              subTotal: finalAmount,
              totalTax: 0,
              shippingCost: 0,
              // Customer details
              firstName: customer.name.split(' ')[0] || '',
              lastName: customer.name.split(' ').slice(1).join(' ') || '',
              email: customer.email,
              phone: customer.phone,
              // Address details
              street: formFields.street || '',
              city: formFields.city || '',
              district: formFields.district || '',
              state: formFields.state || '',
              pincode: formFields.pincode || '',
              // Payment details
              payment: 'online',
              paymentMethod: 'online',
              orderId: tempOrderId,
              transactionId: tempTransactionId,
              agree: true,
              status: 'Paid'
            };

            // Call the orders API which will handle the quantity updates
            const res = await fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(tempOrderPayload)
            });

            if (!res.ok) {
              const errorData = await res.json().catch(() => ({}));
              console.error('Failed to update quantities via order API:', errorData);
            }
          } catch (error) {
            console.error('Error updating quantities after payment:', error);
            // Don't fail the payment if quantity update fails, just log it
          }
          toast.dismiss();
          try {
            // 5. Verify payment and update order in DB
            try {
              const verificationResponse = await axios.put("/api/razorpay", {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                // Send all order/cart/form details for backend merge
                cart,
                checkoutData,
                formFields,
                user,
                agree: true, // Always set agree true for online orders
                // You can add any other info needed for a complete order
              });

              if (verificationResponse.data && verificationResponse.data.success) {
                setError(null);
                // const cartCleared = await clearCart();
                // Explicitly clear all cart and checkout data from localStorage
                localStorage.removeItem("cart");
                localStorage.removeItem("checkoutCart");
                localStorage.removeItem("checkoutData");
                Object.keys(localStorage).forEach(key => {
                  if (key.startsWith('cart_')) {
                    localStorage.removeItem(key);
                  }
                });
                // if (cartCleared) {
                //   toast.success('Payment successful! Check your email for details.', {
                //     style: { borderRadius: '10px', border: '2px solid green' },
                //   });
                // } else {
                //   toast.error('Payment successful, but there was an issue clearing your cart.');
                // }
                // Send order confirmation email using /api/brevo
                try {
                  const orderData = verificationResponse.data.order || {};
                  const customerEmail = (formFields && formFields.email) || (user && user.email) || (customer && customer.email);
                  const firstName = (formFields && formFields.firstName) || (user && user.firstName) || '';
                  await fetch('/api/brevo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      to: customerEmail,
                      subject: 'Order Confirmation',
                      htmlContent: `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
      <style type="text/css">
        body { font-family: Arial, sans-serif; background: #f8f9fa; }
        .container { background: #fff; border-radius: 8px; margin: 32px auto; max-width: 600px; padding: 32px 24px; }
        .header { text-align: center; }
        .summary-table { width: 100%; border-collapse: collapse; margin: 24px 0; }
        .summary-table th, .summary-table td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; font-size: 14px; }
        .summary-table th { background: #f3f4f6; }
        .product-img { width: 48px; height: 48px; object-fit: cover; border-radius: 6px; border: 1px solid #e5e7eb; }
        .dashboard-btn { display: block; width: 100%; margin: 32px 0 0 0; text-align: center; background: #f97316; color: #fff; padding: 12px 0; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; }
      </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>Thank you for your order!</h2>
        <p>Hello, ${firstName}</p>
      </div>
      <div class="footer">
        <p>Order ID: ${orderId}</p>
        <p>Order Date: ${new Date().toLocaleDateString()}</p>
      </div>
      <h3 style="margin-top:32px; font-size:18px;">Order Summary</h3>
      <table class="summary-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Qty</th>
            <th>Size</th>
            <th>Weight</th>
            <th>Shipping Charge</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          ${Array.isArray(checkoutData?.cart) ? checkoutData.cart.map(item => `
            <tr>
              <td><img src="${item.image?.url || item.image || ''}" class="product-img" alt="${item.name || ''}" /></td>
              <td>${item.name || ''}</td>
              <td>${item.qty || 1}</td>
              <td>${item.size || '-'}</td>
              <td>${typeof item.weight !== 'undefined' && item.weight !== null ? item.weight + 'g' : '-'}</td>
<td>${typeof item.finalShipping !== 'undefined' && item.finalShipping !== null ? item.finalShipping + '₹' : '-'}</td>
<td>₹${typeof item.price !== 'undefined' && item.price !== null ? Number(item.price).toFixed(2) : '-'}</td>
            </tr>
          `).join('') : ''}
        </tbody>
      </table>
      <div style="text-align:right; font-size:16px; margin-top:12px;">
        <strong>Total: ₹${checkoutData?.cartTotal ? Number(checkoutData.cartTotal).toFixed(2) : '-'}</strong>
      </div>
      <a href="https://rishikeshhandmade.com/dashboard?section=orders" class="dashboard-btn">Go to Dashboard</a>
    </div>
  </body>
  </html>`
                    })
                  });
                } catch (emailError) {
                  // Don't block order completion if email fails
                }
                if (routerInstance && orderId) {
                  // Clear localStorage after successful payment
                  let isBuyNow = false;
                  if (typeof window !== 'undefined') {
                    const params = new URLSearchParams(window.location.search);
                    isBuyNow = params.get('mode') === 'buy-now';
                    if (isBuyNow) {
                      localStorage.removeItem('buyNowProduct');
                    } else {
                      localStorage.removeItem('checkoutCart');
                      localStorage.removeItem('cart');
                    }
                  }
                  setShowConfirmationModal(true);
                  setRecentOrderId(orderId);
                  console.log('[Razorpay Handler] Modal set: showConfirmationModal = true, recentOrderId =', orderId);
                  return;
                }
              } else {
                setError(verificationResponse.data?.error || 'Payment verification or order update failed!');
                toast.error(verificationResponse.data?.error || 'Payment verification or order update failed!');
                return;
              }
            } catch (err) {
              setError('Payment verification or order update failed!');
              toast.error('Payment verification or order update failed!');
            }
          } catch (error) {
            setError(error.message || 'Payment failed. Please try again.');
            setLoading(false);
          }
        },
        prefill: {
          name: payload.name,
          email: payload.email,
          contact: payload.phone,
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

  }


  useEffect(() => {
    // Detect buy-now mode from URL
    let isBuyNow = false;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      isBuyNow = params.get('mode') === 'buy-now';
      setBuyNowMode(isBuyNow);
    }
    const loadCartData = async () => {
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
            const qty = Number(buyNowProduct.qty) || 1;
            const discountedUnitPrice = Number(buyNowProduct.price) || 0;
            const cgstRate = Number(buyNowProduct.cgst) || 0;
            const sgstRate = Number(buyNowProduct.sgst) || 0;

            // Calculate shipping based on quantity (or weight if available)
            let shippingCost = 0;
            let shippingTierLabel = '';
            let shippingPerUnit = null;
            let totalWeight = 0;
            if (buyNowProduct.weight) {
              totalWeight = Number(buyNowProduct.weight) * qty;
            }
            // Prefer weight-based shipping if weight exists, else per-qty
            if (totalWeight > 0) {
              try {
                const res = await fetch('/api/checkShipping', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ weight: totalWeight }),
                });
                const data = await res.json();
                if (data && data.available && data.shippingCharge != null && !isNaN(Number(data.shippingCharge))) {
                  shippingCost = Number(data.shippingCharge);
                  shippingTierLabel = data.tierLabel || '';
                  shippingPerUnit = data.perUnitCharge || null;
                } else {
                  shippingCost = 0;
                }
              } catch (e) {
                shippingCost = 0;
              }
            } else {
              // fallback: simple per-qty flat rate (e.g., 200 per item)
              shippingCost = qty * 200;
              if (isNaN(shippingCost)) shippingCost = 0;
              shippingTierLabel = `Flat Rate x${qty}`;
            }

            const totalDiscount = buyNowProduct.originalPrice && buyNowProduct.price
              ? (Number(buyNowProduct.originalPrice) - discountedUnitPrice) * qty
              : 0;

            const promoCode = buyNowProduct.couponApplied ? buyNowProduct.couponCode : '';
            const promoDiscount = buyNowProduct.couponApplied ? totalDiscount : 0;

            const subTotal = discountedUnitPrice * qty;
            const cgstTotal = (discountedUnitPrice * cgstRate / 100) * qty;
            const sgstTotal = (discountedUnitPrice * sgstRate / 100) * qty;
            const totalTax = cgstTotal + sgstTotal;
            const cartTotal = subTotal + totalTax + shippingCost;

            setCheckoutData({
              cart: [{ ...buyNowProduct, cgstTotal, sgstTotal }],
              subTotal,
              cartTotal: Number(subTotal) + Number(totalTax) + Number(shippingCost),
              shippingCost: Number(shippingCost),
              shippingTierLabel,
              shippingPerUnit,
              totalTax: Number(totalTax),
              totalDiscount: Number(totalDiscount),
              promoCode,
              promoDiscount: Number(promoDiscount),
            });
            // Set address fields from buyNowProduct if present
            if (buyNowProduct.pincode) setPincode(buyNowProduct.pincode);
            if (buyNowProduct.state) setState(buyNowProduct.state);
            if (buyNowProduct.district) setDistrict(buyNowProduct.district);
          } catch (err) {
            // fallback: shippingCost = 0
            // Recalculate all values safely for fallback
            const qty = Number(buyNowProduct?.qty) || 1;
            const discountedUnitPrice = Number(buyNowProduct?.price) || 0;
            const cgstRate = Number(buyNowProduct?.cgst) || 0;
            const sgstRate = Number(buyNowProduct?.sgst) || 0;
            const subTotal = discountedUnitPrice * qty;
            const cgstTotal = (discountedUnitPrice * cgstRate / 100) * qty;
            const sgstTotal = (discountedUnitPrice * sgstRate / 100) * qty;
            const totalTax = cgstTotal + sgstTotal;
            const totalDiscount = buyNowProduct?.originalPrice && buyNowProduct?.price
              ? (Number(buyNowProduct.originalPrice) - discountedUnitPrice) * qty
              : 0;
            const promoCode = buyNowProduct?.couponApplied ? buyNowProduct.couponCode : '';
            const promoDiscount = buyNowProduct?.couponApplied ? totalDiscount : 0;
            const shippingCost = 0;
            const cartTotal = subTotal + totalTax + shippingCost;
            setCheckoutData({
              cart: [buyNowProduct],
              subTotal,
              cartTotal,
              shippingCost,
              shippingTierLabel: '',
              shippingPerUnit: null,
              totalTax,
              totalDiscount,
              promoCode,
              promoDiscount,
            });
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
          // console.error("Error parsing cart data:", error);
          setCheckoutData(null);
        }
      } else if (contextCart?.length > 0) {
        // If no localStorage but we have cart in context, use that
        // --- Improved Cart Calculation Logic ---
        const updatedCart = contextCart.map(item => {
          // Calculate discounted price per item
          let discountedUnitPrice = Number(item.price) || 0;
          if (item.discountPercent) {
            discountedUnitPrice = discountedUnitPrice * (1 - Number(item.discountPercent) / 100);
          } else if (item.discountAmount) {
            discountedUnitPrice = discountedUnitPrice - Number(item.discountAmount);
          }
          // If coupon applied, override with coupon price/discount
          if (item.couponApplied && item.couponDiscount) {
            discountedUnitPrice = discountedUnitPrice - Number(item.couponDiscount);
          }
          // Clamp to >= 0
          discountedUnitPrice = Math.max(0, discountedUnitPrice);

          const qty = Number(item.qty) || 1;
          const cgstRate = Number(item.cgst) || 0;
          const sgstRate = Number(item.sgst) || 0;
          const cgstTotal = (discountedUnitPrice * cgstRate / 100) * qty;
          const sgstTotal = (discountedUnitPrice * sgstRate / 100) * qty;

          return { ...item, discountedUnitPrice, cgstTotal, sgstTotal };
        });

        // Calculate original MRP subtotal (before any discount)
        const mrpSubTotal = updatedCart.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.qty) || 1), 0);
        const subTotal = updatedCart.reduce((sum, i) => sum + i.discountedUnitPrice * (Number(i.qty) || 1), 0);
        const totalCGST = updatedCart.reduce((sum, i) => sum + (i.cgstTotal || 0), 0);
        const totalSGST = updatedCart.reduce((sum, i) => sum + (i.sgstTotal || 0), 0);
        const totalTax = totalCGST + totalSGST;
        const totalDiscount = contextCart.reduce((sum, i) => {
          let discount = 0;
          if (i.discountPercent) {
            discount = Number(i.price) * (Number(i.discountPercent) / 100) * (Number(i.qty) || 1);
          } else if (i.discountAmount) {
            discount = Number(i.discountAmount) * (Number(i.qty) || 1);
          }
          if (i.couponApplied && i.couponDiscount) {
            discount += Number(i.couponDiscount) * (Number(i.qty) || 1);
          }
          return sum + discount;
        }, 0);
        // Only allow promo if no item-level coupon/discount
        const hasProductDiscount = updatedCart.some(i => i.discountPercent || i.discountAmount || i.couponApplied);
        const promoCode = !hasProductDiscount && appliedPromo ? appliedPromo : '';
        const promoDiscount = !hasProductDiscount && appliedPromoDetails?.discount ? appliedPromoDetails.discount : 0;

        // Shipping cost logic (reuse your existing/fallback logic)
        const shippingCost = checkoutData?.shippingCost || 0;
        // Final amount: subtotal after discount + taxes + shipping - promo discount
        const cartTotal = subTotal + totalTax + shippingCost - promoDiscount;

        setCheckoutData({
          cart: updatedCart,
          mrpSubTotal, // original MRP subtotal
          subTotal,    // subtotal after discount
          cartTotal,   // final amount
          shippingCost,
          shipping,
          totalTax,
          totalDiscount,
          promoCode,
          promoDiscount,
          totalCGST,
          totalSGST,
          // ...other fields as needed
        });
      }
      setIsLoading(false);
    };

    // Load cart/buy-now data when component mounts or when auth status changes
    loadCartData();
  }, [status]); // Re-run when auth status changes
  // --- PINCODE CHECK STATE ---
  const [isPincodeConfirmModalOpen, setIsPincodeConfirmModalOpen] = useState(false);
  const [statesList, setStatesList] = useState([]);
  const [pincodeChecked, setPincodeChecked] = useState(false);

  // Fetch states/districts for dropdowns on mount
  useEffect(() => {
    fetch('/api/zipcode')
      .then(res => res.json())
      .then(data => setStatesList(Array.isArray(data) ? data : []));
  }, []);

  const handleApplyPincode = () => {
    setPincodeChecked(true);
    setIsPincodeConfirmModalOpen(false);
  };

  // Promo code apply handler (modeled after CartDetails)
  const handleApplyPromo = async () => {
    if (!Array.isArray(checkoutData.cart)) {
      setCouponError("Cart is not loaded. Please refresh the page.");
      return;
    }
    setCouponError("");
    // Block if any product-level discount/coupon
    const hasDiscountedItem = checkoutData.cart.some(
      item => item.discountPercent || item.discountAmount || item.couponApplied
    );
    if (hasDiscountedItem) {
      setCouponError("A product-level discount or coupon is already applied. Promo code cannot be used.");
      return;
    }
    if (!couponInput.trim()) {
      setCouponError("Please enter a promo code.");
      return;
    }
    if (appliedPromo) {
      setCouponError(`Promo code "${appliedPromo}" is already applied.`);
      return;
    }
    setLoadingCoupon(true);
    // Calculate total before promo
    const totalAfterDiscount = checkoutData.cart.reduce(
      (sum, item) => sum + (item.price * item.qty),
      0
    );
    const cartTotalBeforePromo = totalAfterDiscount + (checkoutData.totalTax || 0) + (checkoutData.shippingCost || 0);

    try {
      const res = await fetch("/api/validatePromo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promoCode: couponInput.trim(), cartTotal: cartTotalBeforePromo }),
      });
      const data = await res.json();
      if (!data.valid) {
        setCouponError(data.error || "Invalid promo code.");
        setLoadingCoupon(false);
        return;
      }
      if (data.discount >= cartTotalBeforePromo) {
        setCouponError("Discount cannot exceed or equal cart total.");
        setLoadingCoupon(false);
        return;
      }
      setAppliedPromo(couponInput.trim());
      setAppliedPromoDetails(data.coupon);
      setCheckoutData(prev => ({
        ...prev,
        cartTotal: prev.cartTotal - data.discount,
        promoCode: couponInput.trim(),
        promoDiscount: data.discount,
      }));
      setCouponInput("");
      setCouponError("");
    } catch (err) {
      setCouponError("Failed to validate promo code. Please try again.");
    } finally {
      setLoadingCoupon(false);
    }
  };

  // Handle coupon application
  const cart = React.useMemo(() => {
    // First try checkoutData, then contextCart, then empty array
    const items = (checkoutData?.cart || contextCart || []).filter(Boolean);

    // If we have items but no checkoutData, update it
    if (items.length > 0 && !checkoutData) {
      setCheckoutData({
        cart: items,
        subTotal: items.reduce((sum, item) => sum + item.price * item.qty, 0),
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
      // console.error('Error applying coupon:', error);
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
  const [payment, setPayment] = useState('cod');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [agree, setAgree] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const [mounted, setMounted] = React.useState(false);
  // Billing form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [street, setStreet] = useState("");

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
    // Set email from session when component mounts
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [session, status, router, pathname, mounted]);

  if (!mounted || isLoadingOrUnauth) {
    // Optionally render a spinner or nothing while redirecting
    return null;
  }
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
    console.log('🔄 [handleCreateOrder] Starting order creation');
    setLoading(true);

    // Check for buy-now mode
    let isBuyNow = false;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      isBuyNow = params.get('mode') === 'buy-now';
      console.log('📦 Order mode:', isBuyNow ? 'Buy Now' : 'Regular Cart');
    }

    setError(null);

    // Clear cart data once
    // await clearCart();

    try {
      // Calculate totals
      const subTotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);
      const totalTax = cart.reduce(
        (sum, item) => sum + (((item.cgst || 0) + (item.sgst || 0)) / 100) * (item.price || 0) * (item.qty || 1),
        0
      );
      const shippingCost = subTotal >= 500 ? 0 : 50; // Example shipping logic
      const totalAmount = subTotal + totalTax + shippingCost;

      // Generate a unique order ID for COD
      const orderId = generateOrderId();
      const transactionId = orderId; // For COD, transactionId is same as orderId

      // Prepare products array in the same format as the online payment flow
      const productsPayload = cart.map(item => {
        // Get the product ID - check multiple possible locations
        const productId = item._id || item.id || (item.product ? (item.product._id || item.product.id) : null);
        if (!productId) {
          console.error('Could not determine product ID for item:', item);
          throw new Error('Invalid product: missing ID');
        }

        // Find the variant - use the same logic as online payment
        let variant = null;
        let variantId = item.variantId ?? item.variantIndex ?? 0;

        // Try to find the variant by ID or size
        if (item.quantity?.variants?.length > 0) {
          variant = item.quantity.variants.find(v =>
            v._id === variantId || v.size === variantId || v.size === item.size
          ) || item.quantity.variants[0];
        }

        // Build the order item in the same format as online payment
        return {
          ...item,
          quantity: item.quantity || item.qty || 1,
          productId: productId,
          _id: productId, // Also set _id for backward compatibility
          variantId: variantId,
          price: item.price || 0,
          name: item.name || 'Product',
          image: typeof item.image === 'string' ? item.image : item.image?.url || ''
        };
      });

      // Build the order data in the format expected by the backend
      const orderData = {
        // Order details
        products: productsPayload,
        cartTotal: totalAmount,
        subTotal: subTotal,
        totalTax: totalTax,
        shippingCost: shippingCost,
        payment: 'cod',
        paymentMethod: 'cod',
        orderId: orderId,
        transactionId: transactionId,
        status: 'Processing',
        agree: true,

        // Customer details
        firstName: firstName,
        lastName: lastName,
        email: user?.email || email,
        phone: phone,

        // Address details
        street: street,
        city: city,
        district: district || '',
        state: state,
        pincode: pincode,

        // Items for quantity updates - format exactly as expected by the backend
        items: productsPayload.map(item => {
          // Find the variant by size if available
          let variant = null;
          let variantIndex = 0;

          if (item.quantity?.variants?.length > 0) {
            // First try to find by size
            variant = item.quantity.variants.find(v => v.size === item.size);

            // If not found by size, use the first variant
            if (!variant) {
              variant = item.quantity.variants[0];
            }

            // Get the index of the variant
            variantIndex = item.quantity.variants.findIndex(v => v._id === variant._id);
            if (variantIndex === -1) variantIndex = 0;
          }

          // Create the item in the exact format the backend expects
          const orderItem = {
            _id: item._id || item.id,
            productId: item._id || item.id,
            variantId: variantIndex,
            quantity: item.quantity,  // The full quantity object
            qty: item.qty || 1,       // The quantity being ordered
            size: item.size,
            // Include the variant data for reference
            variant: variant || {
              size: item.size,
              qty: item.qty || 1
            }
          };

          console.log('Order item being sent:', JSON.stringify(orderItem, null, 2));
          return orderItem;
        })
      };

      // Log the order data being sent
      console.log('Sending order data:', {
        products: orderData.products?.map(p => ({
          _id: p._id,
          name: p.name,
          qty: p.qty,
          variantId: p.variantId,
          size: p.size,
          price: p.price
        })),
        items: orderData.items,
        shippingInfo: orderData.shippingInfo,
        paymentInfo: orderData.paymentInfo,
        user: orderData.user,
        status: orderData.status,
        totalAmount: orderData.totalAmount
      });

      console.log('Sending request to /api/orders with body:', JSON.stringify({
        ...orderData,
        products: orderData.products?.map(p => ({
          _id: p._id,
          name: p.name,
          qty: p.qty,
          variantId: p.variantId,
          size: p.size,
          price: p.price
        })),
        items: orderData.items
      }, null, 2));

      let response;
      let data;

      try {
        response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        });

        data = await response.json().catch(() => ({}));

        console.log('Order API response:', {
          status: response.status,
          statusText: response.statusText,
          data
        });

        if (!response.ok) {
          throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error creating order:', {
          error: error.message,
          response: {
            status: response?.status,
            statusText: response?.statusText,
            data: data || 'No data'
          },
          request: {
            url: '/api/orders',
            method: 'POST',
            body: JSON.stringify({
              ...orderData,
              products: orderData.products?.map(p => ({
                _id: p._id,
                name: p.name,
                qty: p.qty,
                variantId: p.variantId,
                size: p.size
              })),
              items: orderData.items
            })
          }
        });
        throw error;
      }

      if (!response.ok) {
        console.error('❌ Order creation failed:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        throw new Error(data.message || `Failed to create order: ${response.status} ${response.statusText}`);
      }

      console.log('✅ Order created successfully:', data);

      // Clear cart after successful order
      // console.log('🔄 Starting cart cleanup after successful order...');
      // const cleanupSuccess = await clearCart();

      // if (cleanupSuccess) {
      //   toast.success('Order placed successfully!', {
      //     position: 'top-center',
      //     duration: 3000
      //   });
      // } else {
      //   toast.warning('Order placed, but there was an issue clearing your cart.', {
      //     position: 'top-center',
      //     duration: 5000
      //   });
      // }

      // Show confirmation and set order ID
      setShowConfirmationModal(true);
      setRecentOrderId(data.order?._id);

      // Log the order creation for debugging
      console.log('Order created with ID:', data.order?._id);

      // Show success message to session?.user
      toast.success('Order placed successfully!', {
        position: 'top-center',
        style: {
          borderRadius: '10px',
          background: '#4CAF50',
          color: 'white',
          padding: '16px',
          fontSize: '16px',
          fontWeight: 'bold'
        }
      });

      return data.order;
    } catch (error) {
      // console.error('Order creation error:', error);
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

  // Debug function to log cart and storage state
  const logCartState = (context) => {
    console.group(`🛒 Cart State - ${context}`);
    console.log('📦 Cart Context:', contextCart);

    console.log('💾 Local Storage:');
    Object.keys(localStorage).forEach(key => {
      if (key === 'cart' || key === 'checkoutCart' || key.startsWith('cart_')) {
        try {
          const value = localStorage.getItem(key);
          console.log(`  ${key}:`, JSON.parse(value));
        } catch (e) {
          console.log(`  ${key}:`, localStorage.getItem(key));
        }
      }
    });

    if (typeof sessionStorage !== 'undefined') {
      console.log('💿 Session Storage:');
      try {
        const sessionCart = sessionStorage.getItem('cart');
        console.log('  cart:', sessionCart ? JSON.parse(sessionCart) : 'empty');
      } catch (e) {
        console.log('  cart:', sessionStorage.getItem('cart'));
      }
    }

    console.groupEnd();
  };

  // Place Order handler
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Log initial cart state
    if (typeof window !== 'undefined') {
      logCartState('Before Order Processing');
    }

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
        // console.error('Error saving address:', err);
        setError("Failed to save shipping address");
        return;
      }
    }

    // Handle payment based on selected method
    // Check for buy-now mode from URL
    let isBuyNow = false;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      isBuyNow = params.get('mode') === 'buy-now';
    }

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
          console.group('🔄 Clearing Cart Data (COD)');

          // Log state before clearing (COD flow)
          console.log('📦 Before clearing - cart items (COD):', {
            cart: localStorage.getItem('cart'),
            checkoutCart: localStorage.getItem('checkoutCart'),
            cartKeys: Object.keys(localStorage).filter(k => k === 'cart' || k.startsWith('cart_'))
          });

          // Clean up based on buy-now or cart flow
          if (typeof window !== 'undefined') {
            if (isBuyNow) {
              console.log('🛍️ Clearing buyNowProduct from localStorage (COD)');
              console.log('Before removal - buyNowProduct:', localStorage.getItem('buyNowProduct'));
              localStorage.removeItem('buyNowProduct');
              console.log('After removal - buyNowProduct:', localStorage.getItem('buyNowProduct'));
            } else {
              console.log('🛒 Clearing cart data from storage (COD)');

              // await clearCart();
            }

            // Clear session storage as well
            if (typeof sessionStorage !== 'undefined') {
              console.log('🗑️ Clearing session storage cart (COD)');
              console.log('Before session clear - cart (COD):', sessionStorage.getItem('cart'));
              sessionStorage.removeItem('cart');
              console.log('After session clear - cart (COD):', sessionStorage.getItem('cart'));
            }
          }

          // Clear the cart in context
          if (setCart) {
            console.log('🧹 Clearing cart context (COD)');
            console.log('Before context clear - cart (COD):', contextCart);
            setCart([]);
            console.log('After context clear - cart should be empty (COD)');
          }

          console.groupEnd(); // End clearing group (COD)
        }

        setShowConfirmationModal(true);
        setRecentOrderId(order._id);

      } catch (error) {
        // console.error('Error creating COD order:', error);
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
  // Handle order confirmation and cart clearing
  const handleOrderConfirm = async () => {
    setLoading(true);
    try {
      // Build form fields from state for payload
      const formFields = {
        street, city, district, state, pincode, firstName, lastName, email, phone, altPhone
      };
      let orderId = checkoutData?.orderId;
      let transactionId = checkoutData?.transactionId;

      if (confirmedPaymentMethod === 'cod') {
        // Always generate unique orderId for COD using shared generator
        orderId = generateOrderId();
        transactionId = orderId; // For COD, transactionId is same as orderId
        setPaymentMethod('cod');
        const orderPayload = buildOrderPayload({
          cart: contextCart,
          checkoutData,
          ...formFields,
          payment: 'cod',
          paymentMethod: 'cod',
          paymentMethodValue: 'cod',
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
        .container { background: #fff; border-radius: 8px; margin: 32px auto; max-width: 600px; padding: 32px 24px; }
        .header { text-align: center; }
        .summary-table { width: 100%; border-collapse: collapse; margin: 24px 0; }
        .summary-table th, .summary-table td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; font-size: 14px; }
        .summary-table th { background: #f3f4f6; }
        .product-img { width: 48px; height: 48px; object-fit: cover; border-radius: 6px; border: 1px solid #e5e7eb; }
        .dashboard-btn { display: block; width: 100%; margin: 32px 0 0 0; text-align: center; background: #f97316; color: #fff; padding: 12px 0; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; }
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
      <h3 style="margin-top:32px; font-size:18px;">Order Summary</h3>
      <table class="summary-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Qty</th>
            <th>Size</th>
            <th>Weight</th>
            <th>Shipping Charge</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          ${Array.isArray(checkoutData?.cart) ? checkoutData.cart.map(item => `
            <tr>
              <td><img src="${item.image?.url || item.image || ''}" class="product-img" alt="${item.name || ''}" /></td>
              <td>${item.name || ''}</td>
              <td>${item.qty || 1}</td>
              <td>${item.size || '-'}</td>
              <td>${typeof item.weight !== 'undefined' && item.weight !== null ? item.weight + 'g' : '-'}</td>
<td>${typeof item.shipping !== 'undefined' && item.shipping !== null ? item.shipping + 'g' : '-'}</td>
<td>₹${typeof item.price !== 'undefined' && item.price !== null ? Number(item.price).toFixed(2) : '-'}</td>
            </tr>
          `).join('') : ''}
        </tbody>
      </table>
      <div style="text-align:right; font-size:16px; margin-top:12px;">
        <strong>Total: ₹${checkoutData?.cartTotal ? Number(checkoutData.cartTotal).toFixed(2) : '-'}</strong>
      </div>
      <a href="https://rishikeshhandmade.com/dashboard?section=orders" class="dashboard-btn">Go to Dashboard</a>
    </div>
  </body>
  </html>`
            })
          });
        } catch (e) { /* handle email error */ }
        setRecentOrderId(orderId);
        setShowConfirmationModal(true);
        // await clearCart();
        // Explicitly clear all cart and checkout data from localStorage
        localStorage.removeItem("cart");
        localStorage.removeItem("checkoutCart");
        localStorage.removeItem("checkoutData");
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('cart_')) {
            localStorage.removeItem(key);
          }
        });
        setLoading(false);
        return;
      }
      // For online, always go through Razorpay handler
      if (confirmedPaymentMethod === 'online') {
        setPaymentMethod('online');
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
          { ...checkoutData, orderId: generateOrderId(), transactionId: generateTransactionId() }, // pass IDs
          { ...formFields, paymentMethod: 'online' },
          session?.user
        );
        return;
      }
      setLoading(false);
    } catch (error) {
      setError(error.message || 'Order creation failed.');
      setLoading(false);
    }
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
        // Always generate unique orderId for COD using shared generator
        orderId = generateOrderId();
        transactionId = orderId; // For COD, transactionId is same as orderId
        setPaymentMethod('cod');
        const orderPayload = buildOrderPayload({
          cart: contextCart,
          checkoutData,
          ...formFields,
          payment: 'cod',
          paymentMethod: 'cod',
          paymentMethodValue: 'cod',
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
      .container { background: #fff; border-radius: 8px; margin: 32px auto; max-width: 600px; padding: 32px 24px; }
      .header { text-align: center; }
      .summary-table { width: 100%; border-collapse: collapse; margin: 24px 0; }
      .summary-table th, .summary-table td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; font-size: 14px; }
      .summary-table th { background: #f3f4f6; }
      .product-img { width: 48px; height: 48px; object-fit: cover; border-radius: 6px; border: 1px solid #e5e7eb; }
      .dashboard-btn { display: block; width: 100%; margin: 32px 0 0 0; text-align: center; background: #f97316; color: #fff; padding: 12px 0; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; }
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
    <h3 style="margin-top:32px; font-size:18px;">Order Summary</h3>
    <table class="summary-table">
      <thead>
        <tr>
          <th>Image</th>
          <th>Name</th>
          <th>Qty</th>
          <th>Size</th>
          <th>Weight</th>
          <th>Shipping Charge</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        ${Array.isArray(checkoutData?.cart) ? checkoutData.cart.map(item => `
          <tr>
            <td><img src="${item.image?.url || item.image || ''}" class="product-img" alt="${item.name || ''}" /></td>
            <td>${item.name || ''}</td>
            <td>${item.qty || 1}</td>
            <td>${item.size || '-'}</td>
            <td>${typeof item.weight !== 'undefined' && item.weight !== null ? item.weight + 'g' : '-'}</td>
<td>${typeof item.shipping !== 'undefined' && item.shipping !== null ? item.shipping + 'g' : '-'}</td>
<td>₹${typeof item.price !== 'undefined' && item.price !== null ? Number(item.price).toFixed(2) : '-'}</td>
          </tr>
        `).join('') : ''}
      </tbody>
    </table>
    <div style="text-align:right; font-size:16px; margin-top:12px;">
      <strong>Total: ₹${checkoutData?.cartTotal ? Number(checkoutData.cartTotal).toFixed(2) : '-'}</strong>
    </div>
    <a href="https://rishikeshhandmade.com/dashboard?section=orders" class="dashboard-btn">Go to Dashboard</a>
  </div>
</body>
</html>`
            })
          });
        } catch (e) { /* handle email error */ }
        setRecentOrderId(orderId); // orderId should be the Razorpay/order DB ID you get back
        setShowConfirmationModal(true);
        // router.push(`/dashboard?orderId=${data.orderId}`);
        await clearCart();
        setLoading(false);
        return;
      }
      // For online, always go through Razorpay handler
      if (confirmedPaymentMethod === 'online') {
        setPaymentMethod('online');
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
          { ...checkoutData, orderId: generateOrderId(), transactionId: generateTransactionId() }, // pass IDs
          { ...formFields, paymentMethod: 'online' },
          session?.user
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
        showConfirmationModal={showConfirmationModal}
        orderId={recentOrderId}
        onGoToDashboard={() => { window.location.href = `/dashboard?orderId=${recentOrderId}`; }}
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

        <form className="space-y-6" onSubmit={(e) => {
          e.preventDefault();
          handlePlaceOrder(e);
        }}>
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
                  className="w-full py-2 px-3 bg-gray-100 rounded-md border-0 cursor-not-allowed"
                  type="email"
                  placeholder="example@gmail.com"
                  required
                  value={checkoutData?.email || email}
                  onChange={e => setEmail(e.target.value)}
                  disabled
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
            </div>
          </div>
          <div className="text-center text-gray-700 text-sm">
            This helps us serve you better and keep you updated on your order status.
          </div>
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
                  <img src={item.image?.url || item.image} alt={item.name} className="w-16 h-16 rounded object-cover border" />
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
                      <span>₹{((item.price * item.cgst / 100) * item.qty).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-gray-600">SGST ({item.sgst}%)</span>
                      <span>₹{((item.price * item.sgst / 100) * item.qty).toFixed(2)}</span>
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
            {checkoutData?.shippingCost !== undefined && (
              <div className="flex justify-between items-center mt-2">
                <span className="font-semibold">
                  Shipping Charges{checkoutData.shippingTierLabel ? ` (${checkoutData.shippingTierLabel})` : ''}
                </span>
                <span className="font-semibold">
                  ₹{Number(checkoutData.shippingCost).toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-gray-600">Shipping Charges</span>
              <span>₹{Number(checkoutData?.shipping || 0).toFixed(2)}</span>
            </div>
            {(() => {
              const totalCGST = checkoutData.cart.reduce(
                (sum, item) => sum + ((item.price * item.cgst / 100) * item.qty),
                0
              );
              const totalSGST = checkoutData.cart.reduce(
                (sum, item) => sum + ((item.price * item.sgst / 100) * item.qty),
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

            <div className="border-t border-gray-200 pt-3 mb-4">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Final Amount</span>
                <span>₹{checkoutData.cartTotal?.toFixed(2)}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Have a promo code?</label>
              {appliedPromo && (
                <div className="text-green-700 text-xs mt-1">
                  Promo code "{appliedPromo}" applied successfully!
                </div>
              )}
              <div className="flex gap-2">
                <input
                  className="border rounded px-3 py-2 flex-1 text-sm bg-blue-50"
                  placeholder="Apply Promo Code"
                  value={couponInput}
                  onChange={e => {
                    setCouponInput(e.target.value);
                    setCouponError("");
                  }}
                  disabled={loadingCoupon || !!appliedPromo}
                />
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded font-semibold text-sm disabled:opacity-60"
                  onClick={handleApplyPromo}
                  disabled={loadingCoupon || !couponInput.trim() || !!appliedPromo}
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
                      onChange={(e) => {
                        const method = e.target.value;
                        setPayment(method);
                        setPaymentMethod(method);
                      }}
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
        <div className="mt-4 mb-4">
          {/* <pre className="bg-gray-100 p-4 rounded overflow-auto">
           {JSON.stringify({
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
              payment,
              paymentMethod,
              checkoutData: {
                cart: checkoutData?.cart?.map(item => ({
                  id: item.id,  
                  name: item.name,
                  price: item.price,
                  qty: item.qty,
                  cgst: item.cgst,
                  sgst: item.sgst
                })) || [],
                subTotal: checkoutData?.subTotal,
                totalTax: checkoutData?.totalTax,
                cartTotal: checkoutData?.cartTotal,
                shippingCost: checkoutData?.shippingCost
              }
            }, null, 2)} 
          </pre> */}
        </div>
        <button
          className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded font-semibold text-sm transition-colors"
          disabled={!agree || loading || isProcessingPayment || !firstName || !lastName || !email || !phone || !street || !city || !state || !pincode || !payment}
          type="button"
          onClick={async (e) => {
            e.preventDefault();
            if (loading || isProcessingPayment) return;

            // Validate form first
            const validationError = validateForm();
            if (validationError) {
              setError(validationError);
              toast.error(validationError);
              return;
            }

            // For both COD and online, show the overview first
            setShowOverview(true);

            // Store the payment method for later use
            setConfirmedPaymentMethod(payment);
          }}
        >
          {loading ? (
            <>
              <span className="animate-spin inline-block mr-2">🔄</span> Processing...
            </>
          ) : payment === 'cod' ? (
            `Place Order (₹${checkoutData?.cartTotal?.toFixed(2) || '0.00'})`
          ) : (
            `Pay ₹${checkoutData?.cartTotal?.toFixed(2) || '0.00'}`
          )}
        </button>

      </div>
    </div>

  );
}

export default CheckOut;