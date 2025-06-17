"use client";
import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import Link from "next/link";
import toast from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";
import { useRouter } from "next/navigation";
const CartDetails = () => {
  // 2. Get price after discount
  const getAfterDiscount = (item) => {
    const base = item.originalPrice ?? item.price;
    if (item.discountPercent) return base * (1 - item.discountPercent / 100);
    if (item.discountAmount) return base - item.discountAmount;
    return base;
  };
  const { cart: rawCart, updateCartQty, removeFromCart } = useCart();
  const cart = Array.isArray(rawCart) ? rawCart : [];
  // console.log(cart);

  const router = useRouter();

  // Handler for checkout navigation
  const handleCheckout = () => {
    if (!termsChecked) return;

    // First, ensure we have the latest cart data
    const currentCart = Array.isArray(rawCart) ? rawCart : [];

    // Collect all relevant cart data for checkout
    const checkoutData = {
      cart: currentCart.map((item) => ({
        ...item,
        // include all important fields
        discountPercent: item.discountPercent || null,
        discountAmount: item.discountAmount || null,
        cgst: item.cgst || 0,
        sgst: item.sgst || 0,
        originalPrice: item.originalPrice ?? item.price,
        afterDiscount: getAfterDiscount(item),
      })),
      subTotal: currentCart.reduce((sum, item) => sum + (item.originalPrice ?? item.price) * item.qty, 0),
      totalDiscount: currentCart.reduce((sum, item) => {
        const discount = item.discountPercent ?
          (item.originalPrice ?? item.price) * (item.discountPercent / 100) :
          (item.discountAmount || 0);
        return sum + (discount * item.qty);
      }, 0),
      taxTotal: currentCart.reduce((sum, item) => {
        const price = getAfterDiscount(item);
        const tax = ((item.cgst || 0) + (item.sgst || 0)) / 100 * price * item.qty;
        return sum + tax;
      }, 0),
      finalShipping: FinalShipping || 0,
      promo: appliedPromoDetails
        ? {
          code: appliedPromoDetails.couponCode,
          percent: appliedPromoDetails.percent || null,
          amount: appliedPromoDetails.amount || null,
          discount: promoDiscount,
        }
        : null,
      cartTotal: currentCart.reduce((sum, item) => {
        const price = getAfterDiscount(item);
        const tax = ((item.cgst || 0) + (item.sgst || 0)) / 100 * price;
        return sum + (price + tax) * item.qty;
      }, 0) + (FinalShipping || 0) - (promoDiscount || 0),
    };

    // Save to localStorage before navigation
    localStorage.setItem("checkoutCart", JSON.stringify(checkoutData));

    // Redirect to checkout
    router.push("/checkout");
  };

  const [promoCode, setPromoCode] = React.useState("");
  const [promoError, setPromoError] = React.useState("");
  const [termsChecked, setTermsChecked] = React.useState(false);
  // Calculate total cart weight in grams
  // Calculate total cart weight in grams (weight is number from DB)
  const totalWeight = cart.reduce((sum, item) => sum + ((typeof item.weight === "number" ? item.weight : 0) * item.qty), 0);


  const [pincode, setPincode] = React.useState("");
  const [pincodeResult, setPincodeResult] = React.useState(null);
  const [pincodeError, setPincodeError] = React.useState("");
  const [isCheckingPincode, setIsCheckingPincode] = React.useState(false);
  const [appliedPromo, setAppliedPromo] = React.useState(null); // to track applied promo
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalAfterDiscount = Array.isArray(cart)
    ? cart.reduce((sum, item) => sum + getAfterDiscount(item) * item.qty, 0)
    : 0;

  const [isPincodeModalOpen, setIsPincodeModalOpen] = React.useState(false);
  const [isPincodeConfirmModalOpen, setIsPincodeConfirmModalOpen] =
    React.useState(false);
  const [stateInput, setStateInput] = React.useState("");
  const [districtInput, setDistrictInput] = React.useState("");
  const [pincodeInput, setPincodeInput] = React.useState("");
  const [loadingShipping, setLoadingShipping] = useState(false);  
  const [FinalShipping, setFinalShipping] = useState(0);
  const [shippingTierLabel, setShippingTierLabel] = useState("");
  const [shippingPerUnit, setShippingPerUnit] = useState(null);
  const [statesList, setStatesList] = useState([]);
  // console.log(shippingPerUnit)
  // cons.ole.log("Cart:", cart);
  // console.log("Total weight:", totalWeight);
  // console.log("Final shipping:",   FinalShipping);
  // Fetch shipping charge whenever cart changes
  const finalAmount = totalAfterDiscount + FinalShipping;

  useEffect(() => {
    const fetchShippingCharge = async () => {
      if (totalWeight === 0) {
        setFinalShipping(0);
        setShippingTierLabel("");
        setShippingPerUnit(null);
        return;
      }
      setLoadingShipping(true);
      try {
        const res = await fetch('/api/checkShipping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weight: totalWeight }),
        });
        const data = await res.json();
        // console.log(data);
        if (data.available && data.shippingCharge != null) {
          setFinalShipping(Number(data.shippingCharge));
          setShippingTierLabel(data.tierLabel || "");
          setShippingPerUnit(data.perUnitCharge || null);
        } else {
          setFinalShipping(0);
          setShippingTierLabel("");
          setShippingPerUnit(null);
        }
      } catch (e) {
        setFinalShipping(0);
        setShippingTierLabel("");
        setShippingPerUnit(null);
      }
      setLoadingShipping(false);
    };
    fetchShippingCharge();
  }, [cart, totalWeight]);

  useEffect(() => {
    // Fetch states/districts from API on mount
    const fetchStates = async () => {
      try {
        const res = await fetch('/api/zipcode');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setStatesList(data.data);
        }
      } catch (e) {
        setStatesList([]);
      }
    };

    fetchStates();
  }, []);

  const handleApplyPincode = () => {
    setIsPincodeConfirmModalOpen(false);
    // The pincodeResult is already set, so shipping charges will be updated
  };
  // Coupon apply handler
  const handleApplyPromo = async () => {
    // Defensive: ensure cart is defined and is an array
    if (!Array.isArray(cart)) {
      setPromoError("Cart is not loaded. Please refresh the page.");
      return;
    }
    setPromoError("");

    // If any cart item has a discount or coupon, block promo code
    const hasDiscountedItem = cart.some(
      (item) =>
        item.discountPercent || item.discountAmount || item.couponApplied
    );
    if (hasDiscountedItem) {
      setPromoError(
        "A product-level discount or coupon is already applied. Promo code cannot be used."
      );
      return;
    }

    if (!promoCode) {
      setPromoError("Please enter a promo code.");
      return;
    }

    if (appliedPromo) {
      setPromoError(`Promo code "${appliedPromo}" is already applied.`);
      return;
    }
    const totalAfterDiscount = Array.isArray(cart)
      ? cart.reduce((sum, item) => sum + getAfterDiscount(item) * item.qty, 0)
      : 0;

    // Calculate cart total (before promo)
    const cartTotalBeforePromo = totalAfterDiscount + taxTotal + finalShipping;

    try {
      const res = await fetch("/api/validatePromo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promoCode, cartTotal: cartTotalBeforePromo }),
      });
      const data = await res.json();
      if (!data.valid) {
        setPromoError(data.error || "Invalid promo code.");
        return;
      }
      // Check if discount is not greater than cart total (should be handled by API, but double check)
      if (data.discount >= cartTotalBeforePromo) {
        setPromoError("Discount cannot exceed or equal cart total.");
        return;
      }
      setAppliedPromo(promoCode);
      setAppliedPromoDetails(data.coupon); // store full coupon details
      localStorage.setItem("appliedPromoCode", promoCode); // store for checkout
      localStorage.setItem("appliedPromoDetails", JSON.stringify(data.coupon));
      setPromoCode(""); // clear input
    } catch (err) {
      setPromoError("Failed to validate promo code. Please try again.");
    }
  };

  const getDiscount = (item) => {
    if (item.discountPercent) return `${item.discountPercent}%`;
    if (item.discountAmount) return `${item.discountAmount} Rs`;
    return "-";
  };
  // Promo discount logic
  const [appliedPromoDetails, setAppliedPromoDetails] = React.useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("appliedPromoDetails");
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });
  const getAmount = (item) => {
    const afterDiscount = getAfterDiscount(item);
    const cgstPercent = Number(item.cgst) || 0;
    const sgstPercent = Number(item.sgst) || 0;

    const cgstAmount = (afterDiscount * cgstPercent) / 100;
    const sgstAmount = (afterDiscount * sgstPercent) / 100;

    const totalPerItem = afterDiscount + cgstAmount + sgstAmount;
    return totalPerItem * item.qty;
  };

  // 1. Get original price before any discount
  const getOriginalPrice = (item) => item.originalPrice ?? item.price;

  // 3. Calculate tax
  const getTaxAmount = (price, percent) => (price * percent) / 100;

  // 5. For entire cart
  const subTotal = Array.isArray(cart)
    ? cart.reduce(
      (sum, item) => sum + (item.originalPrice ?? item.price) * item.qty,
      0
    )
    : 0;
  const totalDiscount = Array.isArray(cart)
    ? cart.reduce(
      (sum, item) =>
        sum +
        (item.discountPercent
          ? (item.originalPrice ?? item.price) * (item.discountPercent / 100)
          : item.discountAmount || 0) *
        item.qty,
      0
    )
    : 0;
  const taxTotal = Array.isArray(cart)
    ? cart.reduce(
      (sum, item) =>
        sum +
        ((getAfterDiscount(item) *
          ((Number(item.cgst) || 0) + (Number(item.sgst) || 0))) /
          100) *
        item.qty,
      0
    )
    : 0;
  const finalShipping = pincodeResult?.price || FinalShipping || 0;

  // Remove promo if a discounted/coupon item is present
  const hasDiscountedItem = cart.some(
    (item) => item.discountPercent || item.discountAmount || item.couponApplied
  );
  React.useEffect(() => {
    if (hasDiscountedItem && (appliedPromo || appliedPromoDetails)) {
      setAppliedPromo(null);
      setAppliedPromoDetails(null);
      localStorage.removeItem("appliedPromoCode");
      localStorage.removeItem("appliedPromoDetails");
    }
  }, [cart]);

  let promoDiscount = 0;
  if (appliedPromoDetails && !hasDiscountedItem) {
    if (appliedPromoDetails.percent) {
      promoDiscount = Math.round(
        (totalAfterDiscount + taxTotal + finalShipping) *
        (appliedPromoDetails.percent / 100)
      );
    } else if (appliedPromoDetails.amount) {
      promoDiscount = appliedPromoDetails.amount;
    }
    // Ensure discount doesn't exceed total
    const maxDiscount = totalAfterDiscount + taxTotal + finalShipping;
    if (promoDiscount > maxDiscount) promoDiscount = maxDiscount;
  }

  const cartTotal =
    totalAfterDiscount + taxTotal + finalShipping - promoDiscount;

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  // UI
  return (
    <div className="w-full px-5 mx-auto p-4 bg-white">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold">Add To Cart</h2>
        {/* <Link href="/shop" className="text-green-700 font-semibold text-sm">Continuew Shopping &gt;&gt;</Link> */}
      </div>
      {cart.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <Link href="/" className="text-green-700 font-semibold text-sm">Continue Shopping &gt;&gt;</Link>
          Your cart is empty.
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left: Product Table */}
          <div className="w-full md:w-3/2">
            <table className="w-full border-collapse rounded overflow-hidden shadow text-xs md:text-base">
              <thead>
                <tr className="bg-blue-200 text-black text-sm">
                  <th className="border p-2">Image</th>
                  <th className="border p-2">Name / Code</th>
                  <th className="border p-2">Base Price</th>
                  <th className="border p-2">Discount</th>
                  <th className="border p-2">After Discount</th>
                  <th className="border p-2">Weight</th>
                  <th className="border p-2">CGST %</th>
                  <th className="border p-2">SGST %</th>
                  <th className="border p-2">Qty</th>
                  <th className="border p-2">Amount</th>
                  <th className="border p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={idx % 2 === 0 ? "bg-orange-100" : "bg-gray-100"}
                  >
                    <td className="border p-2 text-center">
                      <img
                        src={item.image?.url || item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded object-cover mx-auto"
                      />
                    </td>
                    <td className="border p-2 text-center align-center gap-2">
                      <div className="font-bold text-base leading-tight">
                        {item.name}
                      </div>
                      <div className="italic text-base text-black">
                        {item.productCode || "N/A"}
                      </div>
                    </td>
                    <td className="border p-2 text-center">
                      ₹{item.originalPrice ?? item.price}
                    </td>
                    <td className="border p-2 text-center">
                      {getDiscount(item)}
                    </td>
                    <td className="border p-2 text-center">
                      ₹{getAfterDiscount(item)}
                    </td>
                    <td className="border p-2 text-center">{item.weight ?? 0}g</td>
                    <td className="border p-2 text-center">{item.cgst ?? 0}</td>
                    <td className="border p-2 text-center">{item.sgst ?? 0}</td>
                    <td className="border p-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() =>
                            updateCartQty(item.id, Math.max(1, item.qty - 1))
                          }
                          className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-7 text-center font-semibold">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.id, item.qty + 1)}
                          className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="border p-2 text-center font-bold">
                      ₹{getAmount(item)}
                    </td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 text-xl flex items-center justify-center"
                        title="Remove"
                      >
                        &#10006;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right: Order Summary Card */}
          <div className="w-full md:w-1/2 flex flex-col gap-2 mt-8 md:mt-0">
            <div className="border border-gray-300 rounded-lg shadow p-6 bg-white">
              {/* Subtotal */}
              <div className="flex justify-between items-center mb-0">
                <span className="font-semibold text-base">
                  Subtotal{" "}
                  <span className="text-xs text-gray-500 font-normal">
                    (INR)
                  </span>
                </span>
                <span className="font-semibold text-base">
                  {subTotal.toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-red-600 mb-2 -mt-1">
                Subtotal does not include applicable taxes
              </div>

              {/* Discount Amount */}
              <div className="flex justify-between items-center mt-2 mb-1">
                <span className="font-bold text-base">Discount Amount</span>
                <span className="font-bold text-base">
                  ₹{Math.max(0, totalDiscount).toFixed(2)}
                </span>
              </div>
              {appliedPromoDetails && (
                <div className="flex justify-between items-center mb-1 text-green-700">
                  <span className="font-bold text-base">
                    Promo Code ({appliedPromoDetails.couponCode})
                  </span>
                  <span className="font-bold text-base">
                    -₹{promoDiscount.toFixed(2)}
                  </span>
                </div>
              )}
              <hr className="my-2" />

              {/* Promo Code Section */}
              <div className="text-center font-semibold text-lg mb-2">
                Have a promo code?
              </div>
              {appliedPromo && (
                <div className="text-green-700 text-xs mt-1">
                  Promo code "{appliedPromo}" applied successfully!
                </div>
              )}
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Apply Promo Code"
                  className="w-full border border-blue-400 bg-blue-100 px-3 py-2 rounded text-gray-700"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value);
                    setPromoError("");
                  }}
                  disabled={!!appliedPromo}
                />

                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700"
                  onClick={handleApplyPromo}
                  disabled={!promoCode || !!appliedPromo}
                >
                  Apply
                </button>
              </div>

             
              {/* Note about coupons */}
              <div className="text-xs text-red-600 mb-2">
                Note : If discount promo code already applied extra additional
                coupon not applicable
              </div>
              {/* Nice! You saved... */}
              {totalDiscount > 0 && (
                <div className="bg-gray-100 rounded px-2 py-1 text-center text-sm font-semibold text-black mb-2">
                  🎉 Nice! You saved{" "}
                  <span className="font-bold">₹{totalDiscount.toFixed(2)}</span>{" "}
                  on your order.
                </div>
              )}
               {promoError && (
                <div className="text-xs text-red-600 mt-1">{promoError}</div>
              )}
              {/* Shipping Charges */}
              <div className="flex justify-between items-center mt-2">
                <span className="font-semibold">
                  Shipping Charges{shippingTierLabel ? ` (${shippingTierLabel})` : ''}
                </span>
                <span className="font-semibold">
                  ₹{FinalShipping.toFixed(2)}
                </span>
              </div>
              {/* Pincode check UI */}
              <div className="flex flex-col gap-1 mt-2 mb-2">
                <div className="flex gap-2 items-center">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                      Check if we deliver to your area:
                    </span>
                    <button
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium underline focus:outline-none"
                      onClick={() => setIsPincodeModalOpen(true)}
                    >
                      {pincodeResult ? `${pincode} ✓` : "Check Pincode"}
                    </button>
                  </div>
                </div>
                {pincodeResult && (
                  <div className="text-green-700 text-xs mt-1">
                    Delivery available! Shipping Price: ₹{pincodeResult.price}
                  </div>
                )}
                {pincodeError && (
                  <div className="text-red-600 text-xs mt-1">
                    {pincodeError}
                  </div>
                )}
              </div>
              <Dialog
                open={isPincodeModalOpen}
                onOpenChange={setIsPincodeModalOpen}
              >
                <DialogContent className="bg-white rounded-lg max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-center text-xl font-bold">
                      We'll instantly let you know if delivery is available,
                      along with estimated delivery time.
                    </DialogTitle>
                  </DialogHeader>

                  <div className="mt-4 space-y-4">
                    {/* Dynamic State Dropdown from API */}
                    <div className="w-full">
                      <label className="sr-only">Enter your State</label>
                      <select
                        className="w-full py-3 px-4 rounded-md bg-green-100 border-0 focus:ring-2 focus:ring-green-400"
                        value={stateInput}
                        onChange={e => {
                          setStateInput(e.target.value);
                          setDistrictInput(""); // reset district when state changes
                        }}
                      >
                        <option value="">Select State</option>
                        {statesList.map((s) => (
                          <option key={s.state} value={s.state}>{s.state}</option>
                        ))}
                      </select>
                    </div>

                    {/* Dynamic District Dropdown from API */}
                    <div className="w-full">
                      <select
                        className="w-full py-3 px-4 rounded-md bg-yellow-100 border-0 focus:ring-2 focus:ring-yellow-400"
                        value={districtInput}
                        onChange={e => setDistrictInput(e.target.value)}
                        disabled={!stateInput}
                      >
                        <option value="">Select Distt.</option>
                        {(() => {
                          const stateObj = statesList.find(s => s.state === stateInput);
                          if (!stateObj) {
                            return (
                              <option disabled value="">State not found in database</option>
                            );
                          }
                          if (!Array.isArray(stateObj.districts) || stateObj.districts.length === 0) {
                            return (
                              <option disabled value="">No districts found for this state</option>
                            );
                          }
                          return stateObj.districts.map(d => (
                            <option key={d.district} value={d.district}>{d.district}</option>
                          ));
                        })()}
                      </select>
                    </div>

                    <div className="w-full">
                      <input
                        type="text"
                        placeholder="Type PIN Code"
                        className="w-full py-3 px-4 rounded-md bg-blue-100 border-0 focus:ring-2 focus:ring-blue-400"
                        value={pincodeInput}
                        onChange={(e) => setPincodeInput(e.target.value)}
                        maxLength={6}
                      />
                    </div>

                    <button
                      className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-md transition-colors"
                      onClick={async (e) => {
                        e.preventDefault();
                        setPincodeError("");
                        setPincodeResult(null);
                        setLoadingShipping(true);
                        // Defensive check before API request
                        if (!stateInput || !districtInput || !pincodeInput || pincodeInput.trim().length !== 6) {
                          setPincodeError("Please select state, district, and enter a valid 6-digit pincode.");
                          setLoadingShipping(false);
                          return;
                        }
                        try {
                          const res = await fetch('/api/zipcode/checkZip', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              state: stateInput,
                              district: districtInput,
                              pincode: pincodeInput
                            })
                          });
                          // console.log('Shipping API status:', res.status);
                          const data = await res.json();
                          // console.log('Shipping API response:', data);
                          if (data.success) {
                            setPincodeResult({
                              state: data.state,
                              district: data.district,
                              pincode: data.pincode
                            });
                            setIsPincodeModalOpen(false);
                            setIsPincodeConfirmModalOpen(true);
                          } else {
                            setPincodeError(data.message || 'Delivery not available');
                          }
                        } catch (err) {
                          setPincodeError('Server error. Please try again.');
                        } finally {
                          setLoadingShipping(false);
                        }
                      }}
                      disabled={!pincodeInput || pincodeInput.length !== 6 || !stateInput || !districtInput || loadingShipping}
                    >
                      {loadingShipping ? 'Checking...' : 'SEARCH'}
                    </button>
                    {/* {pincodeResult && (
                      <div className="text-green-700 text-xs mt-1">
                        Delivery available!<br/>
                        <span>State: <b>{pincodeResult.state}</b></span><br/>
                        <span>District: <b>{pincodeResult.district}</b></span><br/>
                        <span>Pincode: <b>{pincodeResult.pincode}</b></span>
                      </div>
                    )} */}
                    {pincodeError && (
                      <div className="text-red-600 text-xs mt-1">
                        {pincodeError}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {/* PIN Code Confirmation Modal */}
              <Dialog
                open={isPincodeConfirmModalOpen}
                onOpenChange={setIsPincodeConfirmModalOpen}
              >
                <DialogContent className="bg-white rounded-lg max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-center text-xl font-bold">
                      Yes, we've confirmed!
                    </DialogTitle>
                  </DialogHeader>

                  <div className="mt-4 space-y-4">
                    <p className="text-center">
                      Your area PIN code is available for shipping.
                      <br />
                      You can proceed with your order, and we'll
                      <br />
                      ensure a smooth and timely delivery.
                    </p>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-right font-semibold">State</div>
                      <div className="col-span-2 border-b border-gray-300">
                        {stateInput}
                      </div>

                      <div className="text-right font-semibold">Distt.</div>
                      <div className="col-span-2 border-b border-gray-300">
                        {districtInput}
                      </div>

                      <div className="text-right font-semibold">PIN Code</div>
                      <div className="col-span-2 border-b border-gray-300">
                        {pincodeInput}
                      </div>
                    </div>

                    <button
                      className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-md transition-colors"
                      onClick={handleApplyPincode}
                    >
                      Apply Now
                    </button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* <div className="text-xs text-red-600 mb-2 text-right">Search Available Pin Code For Confirm Shipment.</div> */}

              {/* CGST/SGST */}
              <div className="flex justify-between items-center mt-1">
                <span className="font-semibold">Total CGST %</span>
                <span className="font-semibold">
                  {cart.reduce(
                    (sum, item) => sum + (Number(item.cgst) || 0),
                    0
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1 mb-1">
                <span className="font-semibold">Total SGST %</span>
                <span className="font-semibold">
                  {cart.reduce(
                    (sum, item) => sum + (Number(item.sgst) || 0),
                    0
                  )}
                </span>
              </div>
              <hr className="my-2" />

              {/* Final Amount */}
              <div className="flex justify-between items-center font-bold text-lg mb-2">
                <span>Final Amount</span>
                <span>₹{finalAmount.toFixed(2)}</span>
              </div>

              {/* Terms and Pay Button */}
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="accent-black"
                  checked={termsChecked}
                  onChange={(e) => setTermsChecked(e.target.checked)}
                />
                <label htmlFor="terms" className="text-xs">
                  I have read and agree to the website terms and conditions
                </label>
              </div>
              <button
                className="w-full py-3 bg-orange-500 text-white font-bold text-base hover:bg-orange-600 mb-2"
                disabled={!termsChecked || !pincodeResult}
                onClick={() => {
                  if (!pincodeResult) {
                    toast.error('Please check your pincode before proceeding.');
                    return;
                  }
                  handleCheckout();
                }}
              >
                Continue
              </button>

              {/* Secure Payment and Card Icons */}
              <div className="flex flex-col items-center gap-1 my-2">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="inline-flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 11c0-1.104.896-2 2-2s2 .896 2 2-.896 2-2 2-2-.896-2-2zm0 0V7m0 4v4m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Secure Payment
                  </span>
                  <img
                    src="/visa-img.png"
                    alt="Visa"
                    className="w-8 h-6 object-contain"
                  />
                  <img
                    src="/master-card.png"
                    alt="Mastercard"
                    className="w-8 h-6 object-contain"
                  />
                  {/* <img src="/amex.png" alt="Amex" className="w-8 h-6 object-contain" /> */}
                  <img
                    src="/rupay.png"
                    alt="Rupay"
                    className="w-8 h-6 object-contain"
                  />
                  <img
                    src="/upi.png"
                    alt="UPI"
                    className="w-8 h-6 object-contain"
                  />
                </div>
                <div className="text-xs text-gray-700">
                  We also accept Indian Debit Cards, UPI and Netbanking.
                </div>
              </div>

              {/* Continue Shopping Button */}
              <button
                className="w-full py-3 bg-green-700 text-white font-bold text-base hover:bg-green-800 my-2"
                onClick={() => (window.location.href = "/")}
              >
                Continue Shopping
              </button>

              {/* Info Footer */}
              <div className="text-xs text-gray-700 mt-4 text-center">
                Your personal data will be used to process your order, support
                your experience throughout this website, and for other purposes
                described in our privacy policy.
              </div>
            </div>
            <div className="flex flex-col items-center mt-3">
              <div className="flex items-center gap-1 text-gray-800 text-sm">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16v-4m0 0V8m0 4h4m-4 0H8"
                  />
                </svg>
                <span className="font-semibold">Quality You Can Trust</span>
              </div>
              <div className="text-xs text-gray-600 mt-1 max-w-xs text-center">
                Your Rishikesh Handmade Guides are available 24/7/365 to answer
                your question and help you better understand your purchase.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartDetails;
