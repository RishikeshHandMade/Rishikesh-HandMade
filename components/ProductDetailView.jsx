"use client";
import React from "react";
import Image from "next/image";
import { Heart, Share2 } from "lucide-react"
import { useCart } from "../context/CartContext";
import { Star } from 'lucide-react';
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
export default function ProductDetailView({ product }) {
  const router = useRouter();
  const [showShareBox, setShowShareBox] = React.useState(false);
  const [productUrl, setProductUrl] = React.useState("");

  React.useEffect(() => {
    if (typeof window !== "undefined" && product && product._id) {
      setProductUrl(window.location.origin + "/product/" + product._id);
    } else if (product && product._id) {
      setProductUrl("/product/" + product._id);
    }
  }, [product]);

  // Close share box when clicking outside
  React.useEffect(() => {
    if (!showShareBox) return;
    function handleClick(e) {
      const pop = document.getElementById("share-popover");
      if (pop && !pop.contains(e.target)) {
        setShowShareBox(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showShareBox]);

  // console.log(product)
  const [selectedImage, setSelectedImage] = React.useState(product?.gallery?.mainImage || []);
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
  const coupon = product.coupon || product.coupons?.coupon;
  let discountedPrice = selectedVariant ? selectedVariant.price : 0;
  let hasDiscount = false;
  let couponText = '';
  if (coupon && typeof coupon.percent === 'number' && coupon.percent > 0) {
    discountedPrice = selectedVariant.price - (selectedVariant.price * coupon.percent) / 100;
    hasDiscount = true;
    couponText = `${coupon.couponCode || ''} (${coupon.percent}% OFF)`;
  } else if (coupon && typeof coupon.amount === 'number' && coupon.amount > 0) {
    discountedPrice = selectedVariant.price - coupon.amount;
    hasDiscount = true;
    couponText = `${coupon.couponCode || ''} (₹${coupon.amount} OFF)`;
  }
  const price = selectedVariant ? formatNumeric(selectedVariant.price) : 0;
  const total = hasDiscount ? (discountedPrice * quantity).toFixed(2) : (selectedVariant ? (selectedVariant.price * quantity).toFixed(2) : 0);

  const { addToCart, addToWishlist, removeFromWishlist, wishlist } = useCart();
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* LEFT: Product Images */}
      <div className="w-full lg:w-1/3 flex flex-col items-center">
        {/* Main Image */}
        <div className="w-full flex justify-center mb-4">
          <div className="relative w-[400px] h-[400px] flex items-center justify-center rounded-xl overflow-hidden">
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
          <div className="w-full max-w-[400px] mx-auto px-2">
            <div className="relative">
              <Carousel className="w-full">
                <CarouselContent>
                  {[product.gallery.mainImage, ...product.gallery.subImages].filter(Boolean).map((img, idx) => (
                    <CarouselItem key={idx} className="flex justify-center basis-1/5 max-w-[20%] min-w-0">
                      <button
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
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </div>
        )}
      </div>

      {/* CENTER: Product Details/Description/Selectors */}
      <div className="w-full lg:w-1/3 max-w-xl mx-auto flex flex-col">
        {/* Badges and Title */}
        {/* <div className="flex items-center gap-3 mb-2">
          <span className="bg-black text-white text-xs px-3 py-1 rounded font-bold">SALE 20% OFF</span>
        </div> */}
        <h1 className="text-3xl font-bold mb-1">{product.title}</h1>
        <div className="flex items-center gap-2 mb-3">
          <span className="font-semibold flex items-center">
            {product?.reviews?.rating && (
              <>
                {[...Array(product.reviews?.rating)].map((_, i) => (
                  <Star key={i} size={20} className="text-yellow-400 fill-yellow-400" />
                ))}
              </>
            )}Rating</span>
          <span className="text-gray-700 text-sm">({product.reviews?.length || 0} customer reviews)</span>
        </div>
        <p className="text-gray-700 mb-6 max-w-lg">{product.description?.overview || "No Description"}</p>
        {/* Selectors */}
        {/* Price and Coupon Section */}
        <div className="mb-4">
          {hasDiscount && (
            <div className="flex items-center gap-2 mb-1">
              <del className="text-gray-400 text-lg mr-2">₹{formatNumeric(selectedVariant.price)}</del>
              <span className="font-bold text-xl text-red-600">₹{formatNumeric(Math.round(discountedPrice))}</span>
              <span className="border border-green-500 text-green-700 px-2 py-0.5 rounded text-xs font-semibold bg-green-50">Coupon Applied: {couponText}</span>
            </div>
          )}
          {!hasDiscount && (
            <span className="font-bold text-xl text-black">₹{price}</span>
          )}
        </div>
        <div className="flex flex-col gap-4 mb-6">
          {/* Quantity */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-md">Quantity:</span>
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
          </div>
          {/* Size */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-md">Size:</span>
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
            <span className="font-bold text-md">Color:</span>
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
          <div className="text-md mb-1"><span className="font-bold text-md">Category:</span> Dresses, Jeans, Summer, Clothing</div>
          <div className="text-md"><span className="font-bold ">Tags:</span> {(product?.categoryTag?.tags && product?.categoryTag?.tags.length > 0) ? product.categoryTag.tags.join(', ') : 'No tags'}</div>
        </div>
      </div>

      {/* RIGHT: Price/Offers/Add to Cart Box */}
      <div className="w-full lg:w-1/3 flex flex-col">
        <div className="border rounded-xl p-6">
          {/* Total Price */}
          <div className="flex items-center justify-between gap-4 mb-3">
            <span className="font-bold text-xl">Total</span>
            <span className="font-bold text-2xl">₹ {total}</span>
          </div>
          {/* Offers/Info Boxes */}
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
          </div>
          {/* Action Buttons */}
          <div className="flex gap-4 mb-6 items-center">
            <button
              className="bg-black text-white py-3 px-8 rounded-lg font-semibold hover:bg-gray-800 w-full"
              onClick={() => {
                if (!selectedVariant) return;
                addToCart({
                  id: product._id,
                  name: product.title,
                  image: selectedImage || product.gallery?.mainImage || '/placeholder.png',
                  price: hasDiscount ? Math.round(discountedPrice) : selectedVariant.price,
                  originalPrice: selectedVariant.price,
                  couponApplied: hasDiscount,
                  couponCode: coupon ? coupon.couponCode : '',
                  size: selectedSize,
                  color: selectedColor,
                  uploaderCode: product.uploaderCode || '',
                }, quantity);
                toast.success("Added to cart!");
              }}
            >
              ADD TO CART
            </button>
            <button
              className={`p-2 rounded-full border hover:bg-gray-50 ${wishlist && wishlist.some(i => i.id === product._id) ? "bg-pink-600 border-pink-600" : ""}`}
              onClick={() => {
                if (!selectedVariant) return;
                if (wishlist && wishlist.some(i => i.id === product._id)) {
                  removeFromWishlist(product._id);
                  toast.success("Removed from wishlist!");
                } else {
                  addToWishlist({
                    id: product._id,
                    name: product.title,
                    image: selectedImage || product.gallery?.mainImage || '/placeholder.png',
                    price: hasDiscount ? Math.round(discountedPrice) : selectedVariant.price,
                    originalPrice: selectedVariant.price,
                    couponApplied: hasDiscount,
                    couponCode: coupon ? coupon.couponCode : '',
                    size: selectedSize,
                    color: selectedColor,
                  });
                  toast.success("Added to wishlist!");
                }
              }}
              aria-label="Add to Wishlist"
            >
              <Heart className={wishlist && wishlist.some(i => i.id === product._id) ? "text-white" : "text-pink-600"} />
            </button>
            {/* Share Button with Popover */}
            <div className="relative">
              <button
                className="p-2 rounded-full border hover:bg-gray-50"
                onClick={() => setShowShareBox((prev) => !prev)}
                aria-label="Share Product"
                type="button"
              >
                <Share2 />
              </button>
              {showShareBox && (
                <div id="share-popover" className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-base">Share Product</span>
                    <button className="text-gray-400 hover:text-black text-xl" onClick={() => setShowShareBox(false)} aria-label="Close share box">&times;</button>
                  </div>
                  <div className="mb-2">
                    <span className="text-sm font-semibold text-gray-700">Share via...</span>
                    <div className="flex gap-4 mt-2">
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#3b5998] hover:bg-[#334f88] rounded-full w-12 h-12 flex items-center justify-center transition-colors"
                        title="Share on Facebook"
                      >
                        <svg width="26" height="26" fill="white" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.326 24h11.495v-9.294H9.691V11.01h3.13V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.31h3.587l-.467 3.696h-3.12V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0" /></svg>
                      </a>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(productUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#25D366] hover:bg-[#1da851] rounded-full w-12 h-12 flex items-center justify-center transition-colors"
                        title="Share on WhatsApp"
                      >
                        <svg width="26" height="26" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.151-.174.2-.298.3-.497.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.207-.242-.58-.487-.501-.669-.51-.173-.007-.372-.009-.571-.009-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.099 3.2 5.077 4.366.709.306 1.262.489 1.694.626.712.227 1.36.195 1.87.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.617h-.001a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.999-3.646-.235-.374a9.86 9.86 0 0 1-1.51-5.204c.001-5.455 4.436-9.89 9.892-9.89 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.896 6.991c-.003 5.456-4.437 9.891-9.892 9.891m8.413-18.304A11.815 11.815 0 0 0 12.05.001C5.495.001.06 5.436.058 11.992c0 2.115.553 4.178 1.602 5.993L.057 24l6.184-1.646a11.94 11.94 0 0 0 5.809 1.479h.005c6.555 0 11.892-5.437 11.893-11.994a11.86 11.86 0 0 0-3.487-8.413" /></svg>
                      </a>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 mt-2">Or copy link</span>
                  <div className="flex gap-2 mt-1">
                    <input
                      id="share-url"
                      type="text"
                      className="border rounded px-2 py-1 flex-1 text-sm bg-[#f5f6fa]"
                      value={productUrl}
                      readOnly
                    />
                    <button
                      className="bg-[#6c47ff] text-white px-4 py-1.5 rounded font-semibold text-sm hover:bg-[#4f2eb8]"
                      onClick={() => {
                        navigator.clipboard.writeText(productUrl);
                        toast.success('Copied to clipboard!');
                      }}
                      type="button"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Buy Now Button */}
          <button
            className="border border-black py-3 rounded-lg font-semibold hover:bg-gray-100 w-full"
            onClick={() => {
              if (!selectedVariant) return;
              router.push("/checkout");
            }}
          >
            BUY IT NOW
          </button>
        </div>
      </div>
    </div>
  );
}
