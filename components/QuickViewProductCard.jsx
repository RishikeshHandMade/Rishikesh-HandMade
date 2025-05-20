import React from "react";
import Image from "next/image";

export default function QuickViewProductCard({ product, onClose }) {
  if (!product) return null;
  return (
    <div className="flex flex-col md:flex-row gap-8 p-6 md:p-10 min-w-[320px] max-w-2xl">
      {/* Image */}
      <div className="flex-shrink-0 flex justify-center items-center">
        <div className="relative w-[220px] h-[300px] bg-gray-100 rounded-2xl overflow-hidden border">
          <Image
            src={product?.gallery?.mainImage || "/placeholder.png"}
            alt={product?.title || "Product image"}
            fill
            className="object-contain"
          />
        </div>
      </div>
      {/* Details */}
      <div className="flex flex-col gap-2 flex-1">
        <h2 className="text-2xl font-bold mb-1">{product?.title}</h2>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-yellow-500 text-lg">★</span>
          <span className="font-semibold">4.7 Rating</span>
          <span className="text-gray-500 text-sm">(50 reviews)</span>
        </div>
        <p className="text-gray-700 mb-2 line-clamp-3">{product?.description || "No description available."}</p>
        <div className="flex items-center gap-4 mb-3">
          <span className="font-bold text-xl">${product?.price || "--"}</span>
          {product?.oldPrice && (
            <span className="text-gray-400 line-through">${product.oldPrice}</span>
          )}
        </div>
        <div className="flex gap-2 mt-2">
          <button className="bg-black text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800">Add to Cart</button>
          <button className="border border-black px-6 py-2 rounded-lg font-semibold hover:bg-gray-100">Buy Now</button>
        </div>
        <button onClick={onClose} className="mt-4 text-gray-500 hover:text-black underline self-start">Close</button>
      </div>
    </div>
  );
}
