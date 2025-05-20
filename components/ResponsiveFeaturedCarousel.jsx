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

const ResponsiveFeaturedCarousel = () => {
  const [selected, setSelected] = React.useState(dummyProducts.map((p) => p.checked));

  const handleCheck = (idx) => {
    setSelected((prev) => {
      const copy = [...prev];
      copy[idx] = !copy[idx];
      return copy;
    });
  };

  // Calculate totals
  const totalOld = dummyProducts.reduce(
    (sum, p, i) => (selected[i] ? sum + (p.oldPrice || p.price) : sum),
    0
  );
  const total = dummyProducts.reduce(
    (sum, p, i) => (selected[i] ? sum + (p.price || p.minPrice) : sum),
    0
  );
  const totalDiscount = totalOld - total;

  return (
    <div className="bg-[#fafafa] rounded-xl py-8 px-4 md:px-8 flex flex-col gap-2 mt-8 ">
      <h2 className="font-bold text-lg mb-4">Frequently Bought Together</h2>
      <div className="flex flex-col md:flex-row gap-2 items-start justify-between w-full">
        {/* Product Cards */}
        <div className="flex flex-row gap-2 items-stretch w-full max-w-7xl">
          {dummyProducts.map((product, idx) => (
            <React.Fragment key={product.id}>
              <div className="bg-white border rounded-lg p-4 flex flex-col w-52 min-w-[150px] shadow-sm justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={selected[idx]}
                      onChange={() => handleCheck(idx)}
                      className="accent-black mr-2"
                    />
                    <span className="text-xs font-medium">{product.name}</span>
                  </div>
                  <div className="w-full h-40 relative mb-2">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={200}
                      height={200}
                      className="object-contain w-full h-full rounded"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    {product.oldPrice && (
                      <span className="text-xs line-through text-gray-400">
                        ${product.oldPrice.toFixed(2)}
                      </span>
                    )}
                    <span className="text-sm font-bold text-red-600">
                      {product.priceRange
                        ? `$${product.minPrice.toFixed(2)} - $${product.maxPrice.toFixed(2)}`
                        : `$${product.price.toFixed(2)}`}
                    </span>
                  </div>
                </div>
                <button className="mt-4 border border-black text-black py-1 rounded w-full hover:bg-gray-100 text-xs font-semibold">
                  Choose Options
                </button>
              </div>
              {/* Plus sign except after last */}
              {idx < dummyProducts.length - 1 && (
                <div className="flex  items-center justify-center h-full">
                  <span className="text-2xl font-bold text-gray-400">+</span>
                </div>
              )}
            </React.Fragment>
          ))}
        
        </div>  
        {/* Summary */}
         <div className="flex flex-col gap-3 min-w-[120px] bg-white border rounded-lg p-6 shadow-sm items-center">
          <div className="text-sm text-gray-500 font-medium mb-2">Price Total:</div>
          <div className="flex gap-2 items-center mb-2">
            <span className="line-through text-gray-400 text-base">${totalOld.toFixed(2)}</span>
            <span className="text-lg font-bold text-red-600">${total.toFixed(2)}</span>
          </div>
          <button className="bg-black text-white w-full py-2 rounded font-semibold mb-2 hover:bg-gray-900 transition">ADD ALL TO CART</button>
          <div className="text-xs text-center text-gray-500">Get a 10% discount buying these products together</div>
        </div> 
      </div>
    </div>
  );
};
//     const [featuredPackages, setFeaturedPackages] = useState(packages || []);
//     const [isLoading, setIsLoading] = useState(true);

//     // Get sidebar state from the sidebar context
//     const sidebarContext = useSidebar();
//     const sidebarOpen = sidebarContext?.open ?? false;

//     // Item width classes based on sidebar state
//     const itemWidthClasses = sidebarOpen 
//         ? "md:basis-1/3 lg:basis-1/3 xl:basis-1/3" 
//         : "md:basis-1/2 lg:basis-1/3 xl:basis-1/4";

//     // Container width based on sidebar state
//     const containerWidth = sidebarOpen ? 'xl:max-w-5xl' : 'xl:max-w-7xl';

//     useEffect(() => {
//         if (!packages || packages.length === 0) {
//             const fetchFeaturedPackages = async () => {
//                 try {
//                     const res = await fetch("/api/featured-packages");
//                     const data = await res.json();
//                     let pkgs = Array.isArray(data) ? data : [];
//                     setFeaturedPackages(pkgs.length ? pkgs : dummyPackages);
//                 } catch (error) {
//                     // Fallback to dummy packages on error
//                     setFeaturedPackages(dummyPackages);
//                 } finally {
//                     setIsLoading(false);
//                 }
//             };
//             fetchFeaturedPackages();
//         } else {
//             setIsLoading(false);
//         }
//     }, [packages]);

//     if (isLoading) {
//         // Render skeleton or loading state
//         return (
//             <div className="flex justify-center">
//                 <div className="flex gap-4 max-w-xl lg:max-w-3xl xl:max-w-5xl mx-auto my-6 md:my-10 w-full md:w-full">
//                     {dummyPackages.map((item) => (
//                         <div key={item._id} className="rounded-xl w-full h-64 bg-gray-200 animate-pulse" />
//                     ))}
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="flex flex-col items-center">
//             <Carousel className={`max-w-2xl lg:max-w-3xl ${containerWidth} mx-auto my-6 md:my-10 w-full`}>
//                 <CarouselContent className="-ml-1 w-full">
//                     {(Array.isArray(featuredPackages) ? featuredPackages : []).map((item) => (
//                         <CarouselItem key={item._id} className={`pl-1 ${itemWidthClasses}`}>
//                             <div className="p-1">
//                                 <Card>
//                                     <CardContent className="p-0 rounded-xl flex flex-col h-[420px] justify-between bg-white rounded-xl shadow flex flex-col relative overflow-hidden group">
//                                         <div className="relative w-full h-full rounded-lg overflow-hidden">
//                                             <Image
//                                                 src={item?.image?.url || item?.basicDetails?.thumbnail?.url || "/RandomTourPackageImages/u1.jpg"}
//                                                 alt={item?.title || item?.packageName || "Tour package image"}
//                                                 width={1280}
//                                                 height={720}
//                                                 quality={50}
//                                                 className="rounded-t-xl w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
//                                             />
//                                             {/* Overlay for lighter, full black shade on hover */}
//                                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 z-10"></div>
//                                             {/* Text slides up on hover */}
//                                             <div className="absolute bottom-0 left-0 text-center w-full z-20 translate-y-full group-hover:translate-y-[-25%] opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out">
//                                                 <h1 className="text-white text-xl xl:text-2xl mt-2 font-bold">{item?.title || item?.packageName}</h1>
//                                                 <Link href={item?.link || `/package/${item._id}`}>
//                                                     <button className="hover:bg-white hover:text-black text-white font-bold px-4 py-2 rounded-full mt-4 transition duration-300 ease-in-out">
//                                                         View More
//                                                     </button>
//                                                 </Link>
//                                             </div>
//                                         </div>
//                                     </CardContent>
//                                 </Card>
//                             </div>
//                         </CarouselItem>
//                     ))}
//                 </CarouselContent>
//                 <CarouselPrevious />
//                 <CarouselNext />
//             </Carousel>
//         </div>
//     );
// };

export default ResponsiveFeaturedCarousel;
