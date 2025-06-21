"use client"
import { useEffect, useRef, useState } from "react";
import { useCart } from "../context/CartContext";
import { toast } from "react-hot-toast";

function hexToColorName(hex) {
  if (!hex) return '';
  const map = {
    "#FF0000": "Red",
    "#00FF00": "Green",
    "#0000FF": "Blue",
    "#FFFF00": "Yellow",
    "#FFC0CB": "Pink",
    "#FFA500": "Orange",
    "#800080": "Purple",
    "#000000": "Black",
    "#FFFFFF": "White",
    // Add more as needed
  };
  return map[hex.toUpperCase()] || hex;
}

function StickyAddToCartBar({ product }) {
  const { addToCart } = useCart();
  // Extract sizes from variants
  const variants = Array.isArray(product?.quantity?.variants) ? product.quantity.variants : [];
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const selectedVariant = variants[selectedVariantIdx] || variants[0];
  const [quantity, setQuantity] = useState(1);

  // Reset quantity to 1 when variant changes
  useEffect(() => { setQuantity(1); }, [selectedVariantIdx]);
  const [showBar, setShowBar] = useState(false);
  const lastScroll = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > 50 && currentScroll > lastScroll.current) {
        // Scrolling down, show bar
        setShowBar(true);
      } else if (currentScroll < lastScroll.current) {
        // Scrolling up, hide bar
        setShowBar(false);
      }
      lastScroll.current = currentScroll;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed left-0 bottom-0 w-full bg-white shadow-xl z-50 transition-transform duration-300 ${showBar ? "translate-y-0" : "translate-y-full"
        }`}
    >
      <div className="flex items-center justify-end md:justify-between px-4 py-4 max-w-6xl mx-auto">
        {/* Product Info */}
        <div className="hidden md:flex items-center gap-4">
          <img src={product?.gallery?.mainImage?.url || "/placeholder.png"} alt={product?.title} className="w-16 h-16 object-cover rounded" />
          <div>
            <div className="font-semibold text-xl">{product?.title}</div>
            {(() => {
              const coupon = product.coupon || product.coupons?.coupon;
              const originalPrice = selectedVariant ? selectedVariant.price : product?.price;
              let discountedPrice = originalPrice;
              let couponApplied = false;
              let couponCode = '';
              let discountLabel = '';
              if (coupon && typeof coupon.percent === 'number' && coupon.percent > 0) {
                discountedPrice = originalPrice - (originalPrice * coupon.percent) / 100;
                couponApplied = true;
                couponCode = coupon.couponCode;
                discountLabel = `-${coupon.percent}%`;
              } else if (coupon && typeof coupon.amount === 'number' && coupon.amount > 0) {
                discountedPrice = originalPrice - coupon.amount;
                couponApplied = true;
                couponCode = coupon.couponCode;
                discountLabel = `-₹${coupon.amount?.toLocaleString('en-IN')}`;
              }
              if (couponApplied) {
                return (
                  <>
                    <span className="inline-block border border-green-500 text-green-500 text-xs rounded px-2 py-0.5 font-semibold mb-1">
                      Coupon Applied: {couponCode} <span className="ml-1">({discountLabel})</span>
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-gray-600 line-through text-lg">₹{originalPrice?.toLocaleString('en-IN')}</span>
                      <span className="text-xl font-bold text-black">₹{Math.round(discountedPrice)?.toLocaleString('en-IN')}</span>
                    </div>
                  </>
                );
              } else {
                return <span className="text-xl font-bold">₹{originalPrice?.toLocaleString('en-IN')}</span>;
              }
            })()}
          </div>
        </div>
        {/* Options, Quantity, Add to Cart */}
        <div className="flex items-center gap-3">
          {/* Size Selector */}
          {variants.length > 0 && (
            <>
              <select
                className="border border-black px-4 py-2 rounded"
                value={selectedVariantIdx}
                onChange={e => setSelectedVariantIdx(Number(e.target.value))}
              >
                {variants.map((v, idx) => (
                  <option
                    key={v._id || idx}
                    value={idx}
                    disabled={v.qty === 0}
                  >
                    {`${hexToColorName(v.color) || 'Color'} / ${v.size || 'Size'}`}{v.qty === 0 ? ' (Sold out)' : ''}
                  </option>
                ))}
              </select>
              {selectedVariant?.color && (
                <span
                  className="inline-block w-5 h-5 rounded-full border ml-2 align-middle"
                  style={{ background: selectedVariant.color }}
                  title={hexToColorName(selectedVariant.color)}
                ></span>
              )}
            </>
          )}
          {/* Quantity Selector */}
          <div className="hidden md:flex items-center gap-1">
            <button
              className="w-8 h-8 border border-black rounded flex items-center justify-center font-bold text-lg hover:bg-gray-100"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
            >
              -
            </button>
            <span className="w-8 text-center font-semibold">{quantity}</span>
            <button
              className="w-8 h-8 border border-black rounded flex items-center justify-center font-bold text-lg hover:bg-gray-100"
              onClick={() => setQuantity(q => selectedVariant ? Math.min(selectedVariant.qty, q + 1) : q + 1)}
              aria-label="Increase quantity"
              disabled={!selectedVariant || quantity >= (selectedVariant?.qty || 1)}
            >
              +
            </button>
          </div>
          <button
            className="bg-blue-600 text-white px-8 py-2 rounded-md font-bold"
            onClick={() => {
              if (!selectedVariant) {
                toast.error("Please select a variant.");
                return;
              }
              // Calculate discount and coupon info
              const coupon = product.coupon || product.coupons?.coupon;
              const originalPrice = selectedVariant.price;
              let discountedPrice = originalPrice;
              let couponApplied = false;
              let couponCode = '';
              if (coupon && typeof coupon.percent === 'number' && coupon.percent > 0) {
                discountedPrice = originalPrice - (originalPrice * coupon.percent) / 100;
                couponApplied = true;
                couponCode = coupon.couponCode;
              } else if (coupon && typeof coupon.amount === 'number' && coupon.amount > 0) {
                discountedPrice = originalPrice - coupon.amount;
                couponApplied = true;
                couponCode = coupon.couponCode;
              }
              addToCart({
                id: product._id,
                name: product.title,
                image: product.gallery?.mainImage || "/placeholder.png",
                price: Math.round(discountedPrice),
                originalPrice: originalPrice,
                size: selectedVariant.size,
                color: selectedVariant.color,
                couponApplied,
                couponCode: couponApplied ? couponCode : undefined
              }, quantity);
              toast.success("Added to cart!");
            }}
          >ADD TO CART</button>
        </div>
      </div>
    </div>
  );
}

export default StickyAddToCartBar;