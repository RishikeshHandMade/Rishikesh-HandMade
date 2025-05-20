"use client";
import React from "react";
import Image from "next/image";

export default function ProductDetailView({ product }) {
  const [selectedImage, setSelectedImage] = React.useState(product?.gallery?.mainImage);
  const [quantity, setQuantity] = React.useState(1);

  // Calculate total price
  const price = Number(product.price) || 0;
  const total = (price * quantity).toFixed(2);

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      {/* LEFT: Main Image + Sub-Image Carousel */}
      <div className="flex-1 flex flex-col items-center">
        {/* Main Image */}
        <div className="w-full flex justify-center mb-4">
          <div className="relative w-[400px] h-[420px] flex items-center justify-center bg-white border rounded-2xl overflow-hidden">
            <Image
              src={selectedImage || product.gallery?.mainImage || '/placeholder.png'}
              alt={product.title}
              fill
              style={{objectFit: 'contain'}}
              className="object-contain w-full h-full"
            />
          </div>
        </div>
        {/* Sub-Images Carousel */}
        {product.gallery?.subImages && product.gallery.subImages.length > 0 && (
          <div className="w-full max-w-[420px] mx-auto">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {[product.gallery.mainImage, ...product.gallery.subImages].filter(Boolean).map((img, idx) => (
                <button
                  key={idx}
                  className={`rounded-lg border-2 ${selectedImage === img ? 'border-black' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-black`}
                  onClick={() => setSelectedImage(img)}
                  style={{ minWidth: 64, minHeight: 64 }}
                >
                  <Image
                    src={img}
                    alt={`${product.title} ${idx + 1}`}
                    width={64}
                    height={64}
                    className="rounded-lg object-cover w-16 h-16"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: Product Details */}
      <div className="flex-1 max-w-xl mx-auto">
        {/* Badges and Title */}
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-black text-white text-xs px-3 py-1 rounded font-bold">SALE 20% OFF</span>
        </div>
        <h1 className="text-3xl font-bold mb-1">{product.title}</h1>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-yellow-500 text-lg">★</span>
          <span className="font-semibold">4.7 Rating</span>
          <span className="text-gray-500 text-sm">(50 customer reviews)</span>
        </div>
        <p className="text-gray-700 mb-6 max-w-lg">{product.description || "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book."}</p>
        {/* Selectors */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Quantity */}
          <div className="flex items-center gap-2">
            <span className="font-semibold">Quantity:</span>
            <button
              className="w-8 h-8 border rounded flex items-center justify-center font-bold text-lg hover:bg-gray-100"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="w-8 text-center font-semibold">{quantity}</span>
            <button
              className="w-8 h-8 border rounded flex items-center justify-center font-bold text-lg hover:bg-gray-100"
              onClick={() => setQuantity(q => q + 1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          {/* Size */}
          <div className="flex items-center gap-2">
            <span className="font-semibold">Size:</span>
            {['XS','S','M','L'].map((size, idx) => (
              <button key={idx} className="px-3 py-1 border rounded-lg bg-white hover:bg-gray-100">{size}</button>
            ))}
          </div>
          {/* Color */}
          <div className="flex items-center gap-2">
            <span className="font-semibold">Color:</span>
            {['#eab1b1','#e1eab1','#6ecb8c','#3b6eea','#eacb3b'].map((color, idx) => (
              <button key={idx} className="w-7 h-7 rounded-full border-2 border-gray-300" style={{ background: color }}></button>
            ))}
          </div>
        </div>
        {/* SKU, Tags, etc. */}
        <div className="mb-4">
          <div className="text-sm mb-1"><span className="font-bold">SKU:</span> {product.sku || 'PRT584E63A'}</div>
          <div className="text-sm mb-1"><span className="font-bold">Category:</span> Dresses, Jeans, Summer, Clothing</div>
          <div className="text-sm"><span className="font-bold">Tags:</span> Casual, Athletic, Accessories</div>
        </div>
            {/* Total Price */}
            <div className="flex items-center justify-start gap-4 mb-3">
          <span className="font-bold text-xl">Total</span>
          <span className="font-bold text-2xl">${total}</span>
        </div>
        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <button className="bg-black text-white py-3 px-8 rounded-lg font-semibold hover:bg-gray-800">ADD TO CART</button>
          <button className="p-3 border rounded-full"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 0 1 6.364 0L12 7.636l1.318-1.318a4.5 4.5 0 1 1 6.364 6.364L12 21.682l-7.682-7.682a4.5 4.5 0 0 1 0-6.364z" /></svg></button>
          <button className="p-3 border rounded-full"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 12v1a8 8 0 0 0 8 8v0a8 8 0 0 0 8-8v-1" /><polyline points="16 6 12 2 8 6" /></svg></button>
        </div>
        {/* Info Boxes */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="border rounded-lg p-3 flex items-center justify-between">
            <span className="font-semibold">Bank Offer 5% Cashback</span>
          </div>
          <div className="border rounded-lg p-3 flex items-center justify-between">
            <span className="font-semibold">Easy Returns</span>
            <span className="text-gray-500">30 Days</span>
          </div>
          <div className="border rounded-lg p-3 flex items-center gap-2">
            <span className="font-semibold">Enjoy The Product</span>
            <span className="text-gray-500 text-xs">Lorem Ipsum is simply dummy text of the printing and typesetting</span>
          </div>
          <div className="flex items-center gap-2 text-green-700 text-sm">
            <span>✔</span>
            <span>You will save ₹504 on this order</span>
          </div>
        </div>
    
        {/* Buy Now Button */}
        <button className="border border-black py-3 rounded-lg font-semibold hover:bg-gray-100 w-full">BUY IT NOW</button>
      </div>
    </div>
  );
}
