"use client"

import { useState, useEffect } from 'react'
import Image from "next/image"
import Link from "next/link"
import { MapPin, Calendar, Star, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getReviewsById } from "@/actions/GetReviewsById"
import { useCart } from "@/context/CartContext"

const PackageCard = ({ pkg }) => {
  const { addToWishlist, addToCart } = useCart()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)





  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-IN').format(number)
  }

  // if (loading) {
  //   return (
  //     <div className="w-[300px] h-[500px] bg-gray-100 rounded-3xl animate-pulse" />
  //   )
  // }

  return (
    <div className="flex flex-col max-w-[300px]  rounded-3xl mb-2 group cursor-pointer ">
      {/* Image Section */}
      <div className="relative w-full h-[50%] rounded-3xl overflow-hidden flex items-center justify-center group/image">
        {/* GET 10% OFF Tag */}
        <div className="absolute top-6 left-6 z-10">
          <div className="bg-white rounded-full px-5 py-2 text-sm font-bold shadow text-black tracking-tight" style={{ letterSpacing: 0 }}>
            GET 10% OFF
          </div>
        </div>

        {/* Heart/Wishlist & Cart Buttons - Top Right */}
        <div className="absolute top-6 right-6 z-10 flex flex-col gap-4 items-end">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-[#b3a7a3]/80 hover:bg-[#b3a7a3] transition-colors duration-300 h-12 w-12 shadow-none"
            onClick={() => addToWishlist({
              id: pkg._id,
              name: pkg.title,
              image: (pkg?.gallery?.mainImage ? pkg.gallery.mainImage : "/RandomTourPackageImages/u1.jpg"),
              price: pkg?.quantity?.variants[0].price,
              qty: 1
            })}
          >
            <Heart size={28} className="text-white" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-[#b3a7a3]/80 hover:bg-[#b3a7a3] transition-colors duration-300 h-12 w-12 shadow-none"
            onClick={() => addToCart({
              id: pkg._id,
              name: pkg.title,
              image: (pkg?.gallery?.mainImage ? pkg.gallery.mainImage : "/RandomTourPackageImages/u1.jpg"),
              price: pkg?.quantity?.variants[0].price,
            }, 1)}
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
          src={(pkg?.gallery?.mainImage ? pkg.gallery.mainImage : "/RandomTourPackageImages/u1.jpg")}
          alt={pkg?.title || "Tour package image"}
          width={400}
          height={500}
          quality={60}
          className="object-cover w-full h-full rounded-3xl transition-transform duration-300 group-hover/image:scale-105"
        />
      </div>

      {/* Name and Price Section */}
      <div className="flex items-center justify-between px-6 pt-4 pb-2">
        <h3 className="font-bold text-lg text-gray-900 truncate max-w-[180px]">
          {pkg?.title}
        </h3>
        <span className="font-bold text-lg text-gray-900">
          ₹{formatNumber((pkg?.quantity?.variants && pkg.quantity.variants.length > 0 ? pkg.quantity.variants[0].price : 0) || 0)}
        </span>
      </div>

    </div>
  )
}

export default PackageCard