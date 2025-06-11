"use client"
import React from "react";
import Image from "next/image";
import { useState } from "react"
import { Heart } from "lucide-react"
import { useCart } from "../context/CartContext";

export default function QuickViewProductCard({ product, onClose }) {
  if (!product) return null;
  const { addToCart, addToWishlist } = useCart();
  const [quantity, setQuantity] = useState(1);

  // Prepare images array for gallery, using mainImage and subImages
  const images = [
    product?.gallery?.mainImage?.url || "/placeholder.png",
    ...(Array.isArray(product?.gallery?.subImages) ? product.gallery.subImages.map(img => img.url) : [])
  ];
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const formatNumeric = (num) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };
  return (
    <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-lg p-1 max-w-5xl min-h-[400px]">
      {/* Left: Image Gallery */}
      <div className="flex flex-col items-center w-full md:w-1/2 relative h-full flex-1">
        {/* Main Image */}
        <div className="relative w-full h-full min-h-[400px] rounded-xl overflow-hidden flex-1">
          {/* Thumbnails overlayed in top-left, flex-col, z-10 */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                className={`relative w-14 h-14 border rounded-lg overflow-hidden focus:outline-none bg-white/80 ${activeImageIdx === idx ? 'ring-2 ring-black' : ''}`}
                onClick={() => setActiveImageIdx(idx)}
                aria-label={`Show image ${idx + 1}`}
                style={{ boxShadow: activeImageIdx === idx ? '0 0 0 2px #000' : undefined }}
              >
                <Image src={img} alt={`thumb-${idx}`} layout="fill" objectFit="cover" />
              </button>
            ))}
          </div>
          <Image
            src={images[activeImageIdx]}
            alt={product?.title || "Product"}
            layout="fill"
            objectFit="cover"
            className="rounded-xl"
          />
        </div>
      </div>

      {/* Right: Product Details */}
      <div className="flex-1 flex flex-col py-4 px-6">
        {/* SALE badge */}
        <span className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full w-max mb-2">SALE 20% OFF</span>
        {/* Title & Rating */}
        <h2 className="text-2xl font-bold mb-1">
          {/* Defensive: if title is object, stringify for debug */}
          {typeof product?.title === 'object' ? JSON.stringify(product.title) : (product?.title || "N/A")}
        </h2>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-yellow-500 text-lg">★</span>
          <span className="font-semibold">
            {/* Defensive: if rating is object, stringify for debug */}
            {typeof product?.rating === 'object' ? JSON.stringify(product.rating) : (product?.rating || "4.7")} Rating
          </span>
          <span className="text-sm text-gray-500">
            {/* Defensive: if reviewCount is object, stringify for debug */}
            ({typeof product?.reviewCount === 'object' ? JSON.stringify(product.reviewCount) : (product?.reviewCount || "5")} customer reviews)
          </span>
        </div>
        {/* Description */}
        <p className="text-gray-600 mb-4">
          {/* Defensive: if description is object, stringify for debug */}
          {typeof product?.description === 'object' ? JSON.stringify(product.description) : (product?.description || "No Description")}
        </p>
        {/* Price & Quantity */}
        <div className="flex flex-col gap-1 mb-2">
          {/* Coupon badge and price display */}
          {(() => {
            const coupon = product.coupon || product.coupons?.coupon;
            const originalPrice = product?.quantity?.variants[0].price;
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
              discountLabel = `-₹${formatNumeric(coupon.amount)}`;
            }
            if (couponApplied) {
              return (
                <>
                  <span className="inline-block border border-red-500 text-red-500 text-xs rounded px-2 py-0.5 font-semibold mb-1">
                    Coupon Applied: {couponCode} <span className="ml-1">({discountLabel})</span>
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-400 line-through text-lg">₹{formatNumeric(originalPrice)}</span>
                    <span className="text-2xl font-bold text-red-600">₹{formatNumeric(Math.round(discountedPrice))}</span>
                  </div>
                </>
              );
            } else {
              return (
                <span className="text-2xl font-bold">₹{formatNumeric(originalPrice)}</span>
              );
            }
          })()}
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex flex-col">
            <span className="font-bold">Quantity</span>
            <div className="flex gap-2 mt-1">
              <button className="border px-4 py-2 rounded-full text-xl" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
              <span className="px-4 py-2 rounded-md border">{quantity}</span>
              <button className="border px-4 py-2 rounded-full text-xl" onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>
          </div>
        </div>
        {/* Buttons */}
        <div className="flex gap-2 mb-4 w-full">
          <button
            className="bg-black text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 w-1/2"
            onClick={() => {
              const coupon = product.coupon || product.coupons?.coupon;
              const originalPrice = product?.quantity?.variants[0].price;
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
                image: product?.gallery?.mainImage || "/placeholder.png",
                price: couponApplied ? Math.round(discountedPrice) : originalPrice,
                originalPrice,
                couponApplied,
                couponCode,
              }, quantity);
            }}
          >ADD TO CART</button>
          <button
            className="border border-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 w-1/2 flex items-center gap-2"
            onClick={() => {
              const coupon = product.coupon || product.coupons?.coupon;
              const originalPrice = product?.quantity?.variants[0].price;
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
              addToWishlist({
                id: product._id,
                name: product.title,
                image: product?.gallery?.mainImage || "/placeholder.png",
                price: couponApplied ? Math.round(discountedPrice) : originalPrice,
                originalPrice,
                couponApplied,
                couponCode,
                qty: quantity
              });
            }}
          ><Heart />Add To Wishlist</button>
        </div>
        {/* Divider */}
        <hr className="my-1" />
        {/* Info Rows */}
        <div className="text-sm mb-1">
          <span className="font-bold">Category:</span>
          {Array.isArray(product.categoryTag?.tags) && product.categoryTag.tags.length > 0
            ? product.categoryTag.tags.join(', ')
            : (product.category || "Dresses, Jeans, Swimwear, Summer, Clothing")}
        </div>
        <div className="text-sm mb-1">
          <span className="font-bold">Tags:</span>
          {Array.isArray(product.categoryTag?.tags) && product.categoryTag.tags.length > 0 ? (
            product.categoryTag.tags.map((tag, idx) => (
              <span key={idx} className="ml-2">{tag}</span>
            ))
          ) : (
            <span className="ml-2 text-gray-500">N/A</span>
          )}
        </div>
      </div>
    </div>
  );
}
