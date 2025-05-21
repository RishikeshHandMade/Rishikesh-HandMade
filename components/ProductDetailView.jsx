"use client";
import React from "react";
import Image from "next/image";
import {Heart,Share2} from "lucide-react"
export default function ProductDetailView({ product }) {
  console.log(product)
  const [selectedImage, setSelectedImage] = React.useState(product?.gallery?.mainImage);
  const [quantity, setQuantity] = React.useState(1);
  const [showSizeChart, setShowSizeChart] = React.useState(false);
  const [selectedSize, setSelectedSize] = React.useState(null);
  const [selectedColor, setSelectedColor] = React.useState(null);

  // Extract variants
  const variants = Array.isArray(product?.quantity?.variants) ? product.quantity.variants : [];

  // Get all unique sizes and colors from variants
  const availableSizes = [...new Set(variants.map(v => v.size))];
  const allColors = [...new Set(variants.map(v => v.color))];

  // For disabling color buttons: only enable if that color exists for selectedSize
  const colorIsEnabled = (color) => {
    if (!selectedSize) return true;
    return variants.some(v => v.size === selectedSize && v.color === color);
  };
  // For disabling size buttons: only enable if that size exists for selectedColor
  const sizeIsEnabled = (size) => {
    if (!selectedColor) return true;
    return variants.some(v => v.color === selectedColor && v.size === size);
  };

  // Find the selected variant
  const selectedVariant = variants.find(v => {
    return (
      (selectedSize ? v.size === selectedSize : true) &&
      (selectedColor ? v.color === selectedColor : true)
    );
  });

  // Set default selection on mount or when variants change
  React.useEffect(() => {
    if (variants.length && !selectedSize && !selectedColor) {
      setSelectedSize(variants[0].size);
      setSelectedColor(variants[0].color);
    }
  }, [variants]);

  // Cap quantity to available stock
  React.useEffect(() => {
    if (selectedVariant && quantity > selectedVariant.qty) {
      setQuantity(selectedVariant.qty);
    }
  }, [selectedVariant, quantity]);

  // Calculate total price
  const formatNumeric = (num) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };
  const price = selectedVariant ? formatNumeric(selectedVariant.price) : 0;
  const total = selectedVariant ? (selectedVariant.price * quantity).toFixed(2) : 0;

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* LEFT: Main Image + Sub-Image Carousel */}
      <div className="flex-1 flex flex-col items-center">
        {/* Main Image */}
        <div className="w-full flex justify-center mb-4">
          <div className="relative w-[400px] h-[420px] flex items-center justify-center bg-white border rounded-2xl overflow-hidden">
            <Image
              src={selectedImage || product.gallery?.mainImage || '/placeholder.png'}
              alt={product.title}
              fill
              style={{ objectFit: 'contain' }}
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
              disabled={quantity <= 1}
            >
              -
            </button>
            <span className="w-8 text-center font-semibold">{quantity}</span>
            <button
              className="w-8 h-8 border rounded flex items-center justify-center font-bold text-lg hover:bg-gray-100"
              onClick={() => setQuantity(q => selectedVariant ? Math.min(selectedVariant.qty, q + 1) : q + 1)}
              aria-label="Increase quantity"
              disabled={!selectedVariant || quantity >= (selectedVariant?.qty || 1)}
            >
              +
            </button>
            {selectedVariant && <span className="ml-2 text-xs text-gray-500">({selectedVariant.qty} in stock)</span>}
          </div>
          {/* Size */}
          <div className="flex items-center gap-2">
            <span className="font-semibold">Size:</span>
            {availableSizes.map((size, idx) => (
              <button
                key={size || idx}
                className={`px-3 py-1 border rounded-lg bg-white hover:bg-gray-100 ${selectedSize === size ? 'border-black font-semibold' : ''}`}
                onClick={() => {
                  setSelectedSize(size);
                  setQuantity(1);
                  // If current color is not available for this size, pick the first available color for this size
                  const colorForSize = variants.find(v => v.size === size && v.color === selectedColor);
                  if (!colorForSize) {
                    const firstColor = variants.find(v => v.size === size)?.color;
                    setSelectedColor(firstColor);
                  }
                }}
                disabled={!allColors.some(color => variants.find(v => v.size === size && v.color === color))}
              >
                {size}
              </button>
            ))}
            {/* Size Chart Link/Button */}
            {product?.size?.sizeChartUrl && (
              <>
                <span
                  className="ml-3 underline text-blue-600 cursor-pointer hover:text-blue-800 text-sm"
                  onClick={() => setShowSizeChart(true)}
                >
                  Size Chart
                </span>
                {/* Modal for Size Chart */}
                {showSizeChart && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowSizeChart(false)}>
                    <div className="bg-white rounded-lg p-4 shadow-xl max-w-md w-full relative" onClick={e => e.stopPropagation()}>
                      <button
                        className="absolute top-2 right-4 text-2xl font-bold text-gray-500 hover:text-black focus:outline-none"
                        onClick={() => setShowSizeChart(false)}
                        aria-label="Close size chart"
                      >
                        &times;
                      </button>
                      <img src={product?.size?.sizeChartUrl} alt="Size Chart" className="w-full h-auto rounded-lg" />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          {/* Color */}
          <div className="flex items-center gap-2">
            <span className="font-semibold">Color:</span>
            {allColors.map((color, idx) => (
              <button
                key={color || idx}
                className={`w-7 h-7 rounded-full border-2 ${selectedColor === color ? 'border-black ring-2 ring-black' : 'border-gray-300'}`}
                style={{ background: color }}
                title={color}
                onClick={() => {
                  setSelectedColor(color);
                  setQuantity(1);
                  // If current size is not available for this color, pick first available size for this color
                  const sizeForColor = variants.find(v => v.color === color && v.size === selectedSize);
                  if (!sizeForColor) {
                    const firstSize = variants.find(v => v.color === color)?.size;
                    setSelectedSize(firstSize);
                  }
                }}
                disabled={!colorIsEnabled(color)}
              ></button>
            ))}
          </div>
        </div>
        {/* SKU, Tags, etc. */}
        <div className="mb-4">
          {/* <div className="text-sm mb-1"><span className="font-bold">SKU:</span> {product.sku || 'PRT584E63A'}</div> */}
          <div className="text-sm mb-1"><span className="font-bold">Category:</span> Dresses, Jeans, Summer, Clothing</div>
          <div className="text-sm"><span className="font-bold">Tags:</span> {(product?.categoryTag?.tags && product?.categoryTag?.tags.length > 0) ? product.categoryTag.tags.join(', ') : 'No tags'}</div>
        </div>
        {/* Total Price */}
        <div className="flex items-center justify-start gap-4 mb-3">
          <span className="font-bold text-xl">Total</span>
          <span className="font-bold text-2xl">₹ {total}</span>
        </div>
        {/* Action Buttons */}
        <div className="flex gap-4 mb-6 items-center">
          <button className="bg-black text-white py-3 px-8 rounded-lg font-semibold hover:bg-gray-800">ADD TO CART</button>
          <Heart />
          <Share2 />
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
          {/* <div className="flex items-center gap-2 text-green-700 text-sm">
            <span>✔</span>
            <span>You will save ₹504 on this order</span>
          </div> */}
        </div>

        {/* Buy Now Button */}
        <button className="border border-black py-3 rounded-lg font-semibold hover:bg-gray-100 w-full">BUY IT NOW</button>
      </div>
    </div>
  );
}
