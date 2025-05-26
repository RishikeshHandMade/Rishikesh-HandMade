"use client";
import React from "react";
import Image from "next/image";

const relatedProducts = [
  {
    id: 1,
    name: "ANNA",
    title: "Naminos Lorem A Dincidunto - Blue",
    price: "$89.00 – $139.00",
    image: "/RandomTourPackageImages/u1.jpg",
    colors: ["#1e90ff", "#000", "#fff", "#ffe4b5"],
    badges: [],
    sale: false,
    mustHave: false,
    soldOut: false,
    oldPrice: null,
    showDiscount: false,
  },
  {
    id: 2,
    name: "BENJAMIN BUTTON",
    title: "Dinterdum Pretium Condimento - Blue",
    price: "$89.00 – $139.00",
    image: "/RandomTourPackageImages/u2.jpg",
    colors: ["#228b22", "#1e90ff", "#000", "#fff"],
    badges: ["Sale", "Must Have"],
    sale: true,
    mustHave: true,
    soldOut: false,
    oldPrice: "$66.00",
    showDiscount: true,
    discountPrice: "$68.80",
  },
  {
    id: 3,
    name: "BURBERRY",
    title: "Magnis Darturten Meros Lacinado - Green",
    price: "$89.00 – $139.00",
    image: "/RandomTourPackageImages/u3.jpg",
    colors: ["#228b22", "#000", "#ffe4b5", "#1e90ff"],
    badges: ["Sold Out"],
    sale: false,
    mustHave: false,
    soldOut: true,
    oldPrice: null,
    showDiscount: false,
  },
  {
    id: 4,
    name: "DAVENTRY MEERS",
    title: "Loremous Saliduar A Cosmopalis - Black",
    price: "$286.00",
    image: "/RandomTourPackageImages/u1.jpg",
    colors: ["#000", "#1e90ff", "#228b22", "#ffe4b5"],
    badges: [],
    sale: false,
    mustHave: false,
    soldOut: false,
    oldPrice: null,
    showDiscount: false,
  },
];

function RelatedProductsCarousel({ products=[] }) {
  return (
    <div className="w-full py-12">
      <h2 className="text-xl font-bold mb-8 text-center">Related Products</h2>
      <div className="relative">
        {/* Carousel content */}
        <div className="flex gap-6 overflow-x-auto scrollbar-hide px-4">
          {products.map((p, idx) => (
            <div
              key={p.id}
              className="bg-white border rounded-lg shadow-sm flex flex-col items-center w-72 min-w-[270px] p-4 relative"
            >
              {/* Badges */}
              <div className="absolute left-3 top-3 flex flex-col gap-1 z-10">
                {p.badges.includes("Sale") && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded mb-1">Sale</span>
                )}
                {p.badges.includes("Must Have") && (
                  <span className="bg-yellow-400 text-white text-xs px-2 py-0.5 rounded">Must Have</span>
                )}
                {p.badges.includes("Sold Out") && (
                  <span className="bg-gray-400 text-white text-xs px-2 py-0.5 rounded">Sold Out</span>
                )}
              </div>
              {/* Heart icon top right */}
              <button className="absolute right-3 top-3 p-1 rounded-full hover:bg-gray-100">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 0 1 6.364 0L12 7.636l1.318-1.318a4.5 4.5 0 1 1 6.364 6.364L12 21.682l-7.682-7.682a4.5 4.5 0 0 1 0-6.364z" />
                </svg>
              </button>
              {/* Image */}
              <Image
                src={p.image}
                alt={p.name}
                width={200}
                height={220}
                className="object-contain w-full h-56 mb-2"
              />
              {/* Name and Title */}
              <div className="text-xs text-gray-400 font-medium text-center uppercase mt-2">{p.name}</div>
              <div className="text-sm font-normal text-center mb-2">{p.title}</div>
              {/* Price */}
              <div className="flex flex-col items-center mb-2">
                {p.showDiscount && (
                  <span className="text-xs line-through text-gray-400">{p.oldPrice}</span>
                )}
                <span className={`font-bold text-base ${p.showDiscount ? "text-red-600" : "text-black"}`}>
                  {p.showDiscount ? p.discountPrice : p.price}
                </span>
              </div>
              {/* Color Swatches */}
              <div className="flex gap-3 justify-center mt-2 mb-2">
                {p.colors.map((color, i) => (
                  <span
                    key={i}
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{ background: color }}
                  ></span>
                ))}
              </div>
              {/* Sold Out/Notify Me */}
              {p.soldOut && (
                <button className="w-full border border-gray-400 text-gray-700 py-1 rounded mt-2">NOTIFY ME</button>
              )}
            </div>
          ))}
        </div>
        {/* Carousel arrows (optional, for now just placeholders) */}
        {/*
        <button className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow">&#8592;</button>
        <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow">&#8594;</button>
        */}
      </div>
    </div>
  );
}

export default RelatedProductsCarousel;
