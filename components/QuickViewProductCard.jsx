import React from "react";
import Image from "next/image";
import { useState } from "react"
export default function QuickViewProductCard({ product, onClose }) {
  if (!product) return null;
  const [quantity, setQuantity] = useState(1)
  console.log(product)
  return (
    <div className="flex flex-col md:flex-row gap-8 p-6 md:p-10 min-w-[320px] max-w-2xl">
      {/* Image */}
      <div className="flex-shrink-0 flex justify-center items-center w-1/2">
        <div className="relative w-[100%] h-[100%] bg-gray-100 rounded-2xl overflow-hidden border">
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
        <h2 className="text-2xl font-bold mb-1">{product?.title || "N/A"}</h2>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-yellow-500 text-lg">★</span>
          <span className="font-semibold">{product?.reviews?.rating || 0} Rating</span>
          <span className="text-gray-500 text-sm">(50 reviews)</span>
        </div>
        <p className="text-gray-700 mb-2 line-clamp-3">{product?.description || "No description available."}</p>
        <div className="flex items-center gap-4 mb-3">
          <span className="font-bold text-xl">₹{Array.isArray(product?.quantity?.variants) && product.quantity.variants.length > 0
            ? product.quantity.variants[0].price
            : (product?.price || "N/A")}</span>

          {/* Quantity Controls */}
          <div className="flex items-center gap-2 ml-4">
            <button
              className="w-8 h-8 border rounded-full flex items-center justify-center font-bold text-lg hover:bg-gray-100"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="w-8 text-center font-semibold">{quantity}</span>
            <button
              className="w-8 h-8 border rounded-full flex items-center justify-center font-bold text-lg hover:bg-gray-100"
              onClick={() => setQuantity(q => q + 1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <button className="bg-black text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800">Add to Cart</button>
          <button className="border border-black px-6 py-2 rounded-lg font-semibold hover:bg-gray-100">Buy Now</button>
        </div>


        {/* <button onClick={onClose} className="mt-4 text-gray-500 hover:text-black underline self-start">Close</button> */}

        {/* Product Info */}
        <div className="mt-4 text-sm">
          <div className="mb-1"><span className="font-bold">SKU:</span> PRT584E63A</div>
          <div className="mb-1"><span className="font-bold">Category:</span> Dresses, Jeans, Swimwear, Summer, Clothing</div>
          <div>Tags:
            {/* {product.length > 0 ? (
            product.categoryTag?.map((item, idx) => ( 3n.;'
              4'
                <div key={idx}>
                  {item.tags?.map((tag, tagIdx) => (
                    <span key={tagIdx} className="font-bold mr-2">
                      Tags: {tag}
                    </span>
                  ))}
                </div>
              ))
            ) : (
              "N/A"
            )} */}




          </div>
        </div>
      </div>
    </div>
  );
}
