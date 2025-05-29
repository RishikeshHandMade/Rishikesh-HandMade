"use client"

import { useState, useEffect } from 'react'
import Image from "next/image"
import Link from "next/link"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/CartContext"
import toast from "react-hot-toast"

const PackageCard = ({ pkg }) => {
  console.log(pkg)
  const { addToWishlist, addToCart } = useCart()





  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-IN').format(number)
  }
  // if (loading) {
  return (
    <div className="flex flex-col w-[290px] rounded-3xl mb-2 group cursor-pointer">
      {/* Image Section */}
      <div className="relative w-full h-96 rounded-3xl overflow-hidden flex items-center justify-center group/image">
        {/* GET 10% OFF Tag */}
        <div className="absolute top-6 left-4 z-10">
          <div className="bg-white rounded-full px-4 py-1 text-sm font-bold shadow text-black tracking-tight" style={{ letterSpacing: 0 }}>
            GET 10% OFF
          </div>
        </div>
        {/* Heart/Wishlist & Cart Buttons - Top Right */}
        <div className="absolute top-6 right-6 z-10 flex flex-col gap-4 items-end">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full transition-colors duration-300 h-12 w-12 shadow-none bg-white hover:bg-[#b3a7a3]"
            onClick={() => {
              addToWishlist({
                id: pkg._id,
                name: pkg.title,
                image: (pkg?.gallery?.mainImage ? pkg.gallery.mainImage : "/RandomTourPackageImages/u1.jpg"),
                price: pkg.price || 0,
                qty: 1
              });
              toast.success("Added to wishlist!");
            }}
          >
            <Heart size={28} className="text-pink-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-[#b3a7a3]/80 hover:bg-[#b3a7a3] transition-colors duration-300 h-12 w-12 shadow-none"
            onClick={() => {
              addToCart({
                id: pkg._id,
                name: pkg.title,
                image: (pkg?.gallery?.mainImage ? pkg.gallery.mainImage : "/RandomTourPackageImages/u1.jpg"),
                price: pkg.price || 0,
              }, 1);
              toast.success("Added to cart!");
            }}
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
        <Image
          src={pkg?.gallery?.mainImage || "/RandomTourPackageImages/u1.jpg"}
          alt={pkg?.title || "Tour package image"}
          width={400}
          height={500}
          quality={60}
          className="object-cover w-full h-full rounded-3xl transition-transform duration-300 group-hover/image:scale-105"
        />
      </div>
      {/* Name and Price Section */}
      <div className="flex items-center justify-between px-2 pt-4 pb-2 mt-0">
        <Link
          href={`/product/${pkg._id}`}
          className="font-bold hover:underline text-xl text-gray-900 leading-tight max-w-[200px] truncate cursor-pointer"
        >
          {pkg?.title}
        </Link>
        <span className="font-bold text-xl text-gray-900">
          ₹{formatNumber(pkg.price || 0)}
        </span>
      </div>
    </div>
  )
}

export default PackageCard