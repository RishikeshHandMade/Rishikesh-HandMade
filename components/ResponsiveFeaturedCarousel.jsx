"use client";

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "../context/CartContext";
import { toast } from "react-hot-toast"

const dummyProducts = [
  {
    id: 1,
    name: "Loremour De Saliduar Cosmopolis",
    image: "/RandomTourPackageImages/u1.jpg",
    oldPrice: 140.0,
    price: 126.0,
    checked: true,
  },
  {
    id: 2,
    name: "Dinterdum Condiment Milancelos",
    image: "/RandomTourPackageImages/u2.jpg",
    oldPrice: 139.0,
    price: 89.0,
    checked: true,
    priceRange: true,
    minPrice: 89.0,
    maxPrice: 139.0,
  },
  {
    id: 3,
    name: "Magnis Durtarien Aldo Lacinado Pharetas",
    image: "/RandomTourPackageImages/u3.jpg",
    oldPrice: 90.0,
    price: 80.0,
    checked: true,
  },
  {
    id: 4,
    name: "Dempus Dortis Delios Nullam Sapiendo",
    image: "/RandomTourPackageImages/u1.jpg",
    price: 89.0,
    checked: true,
  },
];

const discountPercent = 10;

const ResponsiveFeaturedCarousel = ({ products }) => {
  const { addToCart, addToWishlist, removeFromWishlist, wishlist } = useCart();
  // Use products if available and non-empty, otherwise fallback to 3 dummy products
  // console.log(products)
  const displayProducts = Array.isArray(products) && products.length > 0

    ? products.slice(0, 4)
    : dummyProducts.slice(0, 4);

  const [selected, setSelected] = React.useState(displayProducts.map((p) => p.checked ?? true));

  React.useEffect(() => {
    setSelected(displayProducts.map((p) => p.checked ?? true));
  }, [products]);

  const handleCheck = (idx) => {
    setSelected((prev) => {
      const copy = [...prev];
      copy[idx] = !copy[idx];
      return copy;
    });
  };

  // Calculate totals
  const total = displayProducts.reduce(
    (sum, p, i) => (selected[i] ? sum + (p.quantity?.variants[0].price || p.minPrice || 0) : sum),
    0
  );
  const chunkArray = (arr, size) =>
    Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size)
    );


  return (
    <div className="rounded-2xl py-8 px-2 sm:px-4 md:px-4 flex mt-8 w-full">
      <div className="flex flex-row items-start justify-between w-full">
        {/* Left: Carousel with 4 products per slide */}
        <div className="flex">
          <Carousel>
            <CarouselContent >
              {chunkArray(displayProducts, 4).map((row, rowIdx) => (
                <CarouselItem key={rowIdx} className="flex gap-2 justify-start" >
                  {row.map((product, idx) => (
                    <React.Fragment key={product.id || product._id || idx}>
                      <div className="rounded-2xl border-2 border-black p-5 flex flex-col w-64 min-w-[220px] justify-between mb-2 md:mb-0">
                        <div>
                          <div className="flex items-center mb-3">
                            <input
                              type="checkbox"
                              checked={selected[rowIdx * 4 + idx]}
                              onChange={() => handleCheck(rowIdx * 4 + idx)}
                              className="accent-black mr-2 scale-125 cursor-pointer"
                            />
                          </div>
                          <div className="w-full h-64 relative mb-3 rounded-xl overflow-hidden flex items-center justify-center">
                            <Image
                              src={product.gallery?.mainImage?.url || (product.image && product.image.url) || "/product.jpeg"}
                              alt={product.title || product.packageName || "Product image"}
                              width={220}
                              height={200}
                              className="object-contain w-full h-full hover:scale-105 transition-all duration-300"
                            />
                          </div>
                          <div className="flex flex-col items-start justify-between gap-1">
                            <Link
                              href={`/product/${product._id}`}
                              className="font-bold hover:underline text-md text-gray-900 leading-tight max-w-[200px] truncate cursor-pointer"
                            >
                              {product?.title}
                            </Link>
                            {/* <span className="text-base font-semibold truncate" title={product.name || product.title}>{product.name || product.title}</span> */}
                            {(() => {
                              const price = product.quantity?.variants?.[0]?.price || product.price || product.minPrice || 0;
                              const coupon = product.coupon || product.coupons?.coupon;
                              let discountedPrice = price;
                              let couponApplied = false;
                              let couponCode = '';
                              let discountLabel = '';
                              if (coupon && typeof coupon.percent === 'number' && coupon.percent > 0) {
                                discountedPrice = price - (price * coupon.percent) / 100;
                                couponApplied = true;
                                couponCode = coupon.couponCode;
                                discountLabel = `-${coupon.percent}%`;
                              } else if (coupon && typeof coupon.amount === 'number' && coupon.amount > 0) {
                                discountedPrice = price - coupon.amount;
                                couponApplied = true;
                                couponCode = coupon.couponCode;
                                discountLabel = `-₹${coupon.amount?.toLocaleString('en-IN')}`;
                              }
                              if (couponApplied) {
                                return (
                                  <div className="flex items-center gap-1">
                                    <span className="text-gray-600 line-through text-md mr-2">₹{price?.toLocaleString('en-IN')}</span>
                                    <span className="text-md font-bold text-black">₹{Math.round(discountedPrice)?.toLocaleString('en-IN')}</span>
                                  </div>
                                );
                              } else {
                                return <span className="text-md font-bold text-black">₹{price?.toLocaleString('en-IN')}</span>;
                              }
                            })()}
                          </div>
                        </div>
                      </div>
                      {/* Plus sign except after last */}
                      {idx < row.length - 1 && (
                        <div className="hidden md:flex items-center justify-center h-full">
                          <span className="text-3xl font-bold text-gray-300 mx-2">+</span>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          {/* Summary - Sticky on desktop */}
          <div className="mx-5 flex flex-col gap-4 min-w-[230px] border rounded-2xl p-10 shadow-lg items-center md:sticky md:top-24 md:self-start w-full md:w-auto">
            <div className="text-base text-gray-700 font-semibold mb-1">Price Total:</div>
            {(() => {
              let originalTotal = 0;
              let discountedTotal = 0;
              let anyDiscount = false;
              displayProducts.forEach((product, idx) => {
                if (!selected[idx]) return;
                const price = product.quantity?.variants?.[0]?.price || product.price || product.minPrice || 0;
                const coupon = product.coupon || product.coupons?.coupon;
                let discountedPrice = price;
                if (coupon && typeof coupon.percent === 'number' && coupon.percent > 0) {
                  discountedPrice = price - (price * coupon.percent) / 100;
                  anyDiscount = true;
                } else if (coupon && typeof coupon.amount === 'number' && coupon.amount > 0) {
                  discountedPrice = price - coupon.amount;
                  anyDiscount = true;
                }
                originalTotal += price;
                discountedTotal += discountedPrice;
              });
              if (anyDiscount) {
                return (
                  <div className="flex gap-2 items-center mb-2">
                    <span className="text-gray-600 line-through text-lg">₹{originalTotal.toLocaleString('en-IN')}</span>
                    <span className="text-2xl font-bold text-black">₹{Math.round(discountedTotal).toLocaleString('en-IN')}</span>
                  </div>
                );
              } else {
                return (
                  <div className="flex gap-2 items-center mb-2">
                    <span className="text-2xl font-bold text-black">₹{originalTotal.toLocaleString('en-IN')}</span>
                  </div>
                );
              }
            })()}

            <button
              className="bg-black text-white w-full py-3 rounded-lg font-bold text-base mb-2 hover:bg-gray-900 transition"
              onClick={() => {
                // Add all selected products to cart
                let added = 0;
                displayProducts.forEach((p, i) => {
                  if (selected[i]) {
                    // Use similar logic as ProductDetailView
                    const price = p.quantity?.variants?.[0]?.price || p.price || p.minPrice || 0;
                    const coupon = p.coupon || p.coupons?.coupon;
                    let discountedPrice = price;
                    let couponApplied = false;
                    let couponCode = '';
                    if (coupon && typeof coupon.percent === 'number' && coupon.percent > 0) {
                      discountedPrice = price - (price * coupon.percent) / 100;
                      couponApplied = true;
                      couponCode = coupon.couponCode;
                    } else if (coupon && typeof coupon.amount === 'number' && coupon.amount > 0) {
                      discountedPrice = price - coupon.amount;
                      couponApplied = true;
                      couponCode = coupon.couponCode;
                    }
                    addToCart({
                      id: p._id || p.id,
                      name: p.title || p.name,
                      image: (p.gallery?.mainImage) || (p.image?.url) || p.image || "/RandomTourPackageImages/u1.jpg",
                      price: Math.round(discountedPrice),
                      originalPrice: price,
                      couponApplied,
                      couponCode: couponApplied ? couponCode : undefined
                    }, 1);
                    added++;
                  }
                });
                if (added > 0) {
                  toast.success(`${added} product${added > 1 ? 's' : ''} added to cart!`);
                } else {
                  toast.error("Please select at least one product.");
                }
              }}
            >ADD ALL TO CART</button>
            {/* <div className="text-xs text-center text-gray-700">Get a 10% discount buying these products together</div> */}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ResponsiveFeaturedCarousel;
