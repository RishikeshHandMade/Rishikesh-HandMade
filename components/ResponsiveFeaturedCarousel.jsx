"use client";

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";


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
  // Use products if available and non-empty, otherwise fallback to 3 dummy products
  // console.log(products)
  const displayProducts = Array.isArray(products) && products.length > 0

    ? products.slice(0, 3)
    : dummyProducts.slice(0, 3);

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


  return (
    <div className=" rounded-2xl py-8 px-2 sm:px-4 md:px-8 flex flex-col gap-4 mt-8 w-full">
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between w-full">
        {/* Product Cards - Responsive Grid/Scroll */}
        <div className="w-full flex md:grid md:grid-cols-3 gap-4 overflow-x-auto md:overflow-visible pb-2">
          {displayProducts.map((product, idx) => (
            <React.Fragment key={product.id || product._id || idx}>
              <div className="rounded-2xl border-2 border-black p-5 flex flex-col w-64 min-w-[220px] justify-between mb-2 md:mb-0">
                <div>
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      checked={selected[idx]}
                      onChange={() => handleCheck(idx)}
                      className="accent-black mr-2 scale-125 cursor-pointer"
                    />
                  </div>
                  <div className="w-full h-60 relative mb-3 rounded-xl overflow-hidden flex items-center justify-center">
                    <Image
                      src={product.gallery?.mainImage || (product.image && product.image.url) || "/RandomTourPackageImages/u1.jpg"}
                      alt={ product.title || product.packageName || "Product image"}
                      width={220}
                      height={176}
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-base font-semibold truncate" title={product.name || product.title || product.packageName}>{product.name || product.title || product.packageName}</span>

                    <span className="text-lg font-bold ">
                    ₹{product.quantity?.variants[0].price || '00'}
                      {/* {product.quantity?.variants[0].price?.priceRange
                        ? `₹${product.quantity?.variants[0].price.minPrice?.toFixed(2)} - ₹${product.quantity?.variants[0].price.maxPrice?.toFixed(2)}`
                        : `₹${(product.quantity?.variants[0].price.price ?? product.quantity?.variants[0].price.minPrice ?? 0).toFixed(2)}`} */}
                    </span>
                  </div>
                </div>
                {/* <button className="mt-5 border border-black text-black py-2 rounded-lg w-full hover:bg-gray-100 text-sm font-bold transition-colors">
                  Choose Options
                </button> */}
              </div>
              {/* Plus sign except after last */}
              {idx < displayProducts.length - 1 && (
                <div className="hidden md:flex items-center justify-center h-full">
                  <span className="text-3xl font-bold text-gray-300 mx-2">+</span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        {/* Summary - Sticky on desktop */}
        <div className="flex flex-col gap-4 min-w-[200px] border rounded-2xl p-8 shadow-lg items-center md:sticky md:top-24 md:self-start w-full md:w-auto">
          <div className="text-base text-gray-700 font-semibold mb-1">Price Total:</div>
          <div className="flex gap-2 items-center mb-2">
            <span className="text-2xl font-bold text-black">₹{total.toFixed(2)}</span>
          </div>
          <button className="bg-black text-white w-full py-3 rounded-lg font-bold text-base mb-2 hover:bg-gray-900 transition">ADD ALL TO CART</button>
          <div className="text-xs text-center text-gray-700">Get a 10% discount buying these products together</div>
        </div>
      </div>
    </div>
  );
};
export default ResponsiveFeaturedCarousel;
