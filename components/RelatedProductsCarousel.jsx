"use client";
import React from "react";
import Image from "next/image";
import { Heart, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { toast } from "react-hot-toast";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "./ui/carousel";
import { Button } from "./ui/button";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
function RelatedProductsCarousel({ products }) {
  // Ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : [];
  const { addToCart, addToWishlist, removeFromWishlist, wishlist } = useCart();
  const handleAddToCart = (p) => {
    addToCart({
      id: p._id,
      name: p.title,
      image: p?.gallery?.mainImage || "/RandomTourPackageImages/u1.jpg",
      price: p?.quantity?.variants[0].price,
    }, 1);
    toast.success("Added to cart!");
  };
  // If no products, don't render the component
  if (safeProducts.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-10 px-5">
      {/* <h2 className="text-xl font-bold mb-8 text-center">Related Products</h2> */}
      <div className="relative">
        <Carousel className="w-full" plugins={[Autoplay({ delay: 4000 })]}>
          <CarouselContent>
            {safeProducts.map((p, idx) => (
              <CarouselItem key={p._id || idx} className="w-72 min-w-[270px]">
                <div
                  className="rounded-2xl flex flex-col justify-between w-72 min-w-[270px] p-0 relative overflow-hidden"
                >
                  {/* Discount badge */}
                  <div className="absolute left-4 top-4 z-20">
                    <span className="bg-white text-black font-semibold text-xs px-4 py-1 rounded-full shadow">
                      GET 20% OFF
                    </span>
                  </div>
                  {/* Icons top right, stacked */}
                  <div className="absolute top-6 right-6 z-10 flex flex-col gap-4 items-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`rounded-full transition-colors duration-300 h-12 w-12 shadow-none ${wishlist.some(i => i.id === p._id) ? "bg-pink-600 hover:bg-pink-700" : "bg-white hover:bg-[#b3a7a3]"}`}
                      onClick={() => {
                        if (wishlist.some(i => i.id === p._id)) {
                          removeFromWishlist(p._id);
                          toast.success("Removed from wishlist!");
                        } else {
                          addToWishlist({
                            id: p._id,
                            name: p.title,
                            image: p?.gallery?.mainImage || "/RandomTourPackageImages/u1.jpg",
                            price: p?.quantity?.variants[0].price,
                            qty: 1
                          });
                          toast.success("Added to wishlist!");
                        }
                      }}
                    >
                      <Heart size={28} className={wishlist.some(i => i.id === p._id) ? "text-white" : "text-pink-600"} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full bg-[#b3a7a3]/80 hover:bg-[#b3a7a3] transition-colors duration-300 h-12 w-12 shadow-none"
                      onClick={() => handleAddToCart(p)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-white"
                      >
                        <circle cx="8" cy="21" r="1" />
                        <circle cx="19" cy="21" r="1" />
                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                      </svg>
                    </Button>
                  </div>
                  {/* Image */}
                  <div className="w-full aspect-[3/4] relative bg-[#f6eaea] flex items-center justify-center">
                    <Image
                      src={p.gallery?.mainImage || '/placeholder-image.jpg'}
                      alt={p.title || 'Product Image'}
                      fill
                      className="object-cover rounded-2xl"
                      sizes="(max-width: 768px) 100vw, 300px"
                      priority={idx === 0}
                    />
                  </div>
                  {/* Bottom section: name and price */}
                  <div className="flex flex-row items-center justify-between w-full px-5 py-4">
                    <div className="flex-1 min-w-0">
                    <Link
                          href={`/product/${p._id}`}
                          className="font-bold hover:underline text-xl text-gray-900 leading-tight max-w-[200px] truncate cursor-pointer"
                        >
                          {p?.title}
                        </Link>
                    </div>
                    <div className="ml-4 text-xl font-bold text-black whitespace-nowrap">
                      ₹{p.quantity?.variants[0].price || '00'}
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* <CarouselPrevious /> */}
          {/* <CarouselNext /> */}
        </Carousel>
      </div>
    </div>
  );
}

export default RelatedProductsCarousel;
