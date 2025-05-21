import React from "react";
import Image from "next/image";
import { useState } from "react"
import { Heart } from "lucide-react"
export default function QuickViewProductCard({ product, onClose }) {
  if (!product) return null;
  console.log(product)
  const [quantity, setQuantity] = useState(1);

  // Prepare images array for gallery, using mainImage and subImages
  const images = [
    product?.gallery?.mainImage || "/placeholder.png",
    ...(Array.isArray(product?.gallery?.subImages) ? product.gallery.subImages : [])
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
        <h2 className="text-2xl font-bold mb-1">{product?.title || "N/A"}</h2>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-yellow-500 text-lg">★</span>
          <span className="font-semibold">{product.rating || "4.7"} Rating</span>
          <span className="text-sm text-gray-500">({product.reviewCount || "5"} customer reviews)</span>
        </div>
        {/* Description */}
        <p className="text-gray-600 mb-4">{product.description || "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has."}</p>
        {/* Price & Quantity */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex flex-col">
            <span className="font-bold">Price</span>
            <span className="text-2xl font-bold mr-2"> ₹{formatNumeric(product?.quantity?.variants[0].price) || "N/A"}</span>
            {/* <span className="text-gray-400 line-through">${product.originalPrice || "132.17"}</span> */}
          </div>
          <div className="flex items-center gap-2 flex-col">
            <span className="font-bold">Quantity</span>
            <div className="flex gap-2">
              <button className="border px-4 py-2 rounded-full text-xl" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
              <span className="px-4 py-2 rounded-md border">{quantity}</span>
              <button className="border px-4 py-2 rounded-full text-xl" onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>
          </div>
        </div>
        {/* Buttons */}
        <div className="flex gap-2 mb-4">
          <button className="bg-black text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800">ADD TO CART</button>
          <button className="border border-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 "><Heart />Add To Wishlist</button>
        </div>
        {/* Divider */}
        <hr className="my-1" />
        {/* Info Rows */}
        <div className="text-sm mb-1"><span className="font-bold">SKU:</span> {product.sku || "PRT584E63A"}</div>
        <div className="text-sm mb-1"><span className="font-bold">Category:</span> {product.category || "Dresses, Jeans, Swimwear, Summer, Clothing"}</div>
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
