"use client"
import React from 'react'
import Image from "next/image";

const CategoryAds = ({ categoryAdList }) => {
  if (!categoryAdList) return null;
  return (
    categoryAdList.length > 0 ? (
      <>
        {categoryAdList.map((ad, idx) => (
          <div key={ad._id || idx} className="hidden md:flex w-full max-w-xl overflow-hidden mb-4 flex-col items-center">
            {ad.image && ad.buttonLink ? (
              <a href={ad.buttonLink} target="_blank" rel="noopener noreferrer">
                <div className="relative group">
                  <Image
                    src={ad.image?.url || ad.image || "/placeholder.jpeg"}
                    alt={"Category Advertisement"}
                    width={600}
                    height={400}
                    className="object-contain w-full max-h-[500px] cursor-pointer transition-transform duration-300 group-hover:scale-110 relative z-10"
                    style={{ height: "auto", maxHeight: "500px" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none"></div>
                </div>
              </a>
            ) : ad.image ? (
              <div className="relative group">
                <Image
                  src={ad.image?.url || ad.image || "/placeholder.jpeg"}
                  alt={"Category Advertisement"}
                  width={600}
                  height={400}
                  className="object-contain w-full max-h-[500px] transition-transform duration-300 group-hover:scale-110 relative z-10"
                  style={{ height: "auto", maxHeight: "500px" }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none"></div>
              </div>
            ) : (
              <div className="w-full flex-1 flex items-center justify-center text-gray-400" style={{ minHeight: "120px" }}>No Image</div>
            )}
          </div>
        ))}
      </>
    ) : (
      <div className="w-full max-w-xl h-full rounded-2xl overflow-hidden shadow flex items-center justify-center text-gray-400">
        No Advertisement
      </div>
    )
  );
};

export default CategoryAds;