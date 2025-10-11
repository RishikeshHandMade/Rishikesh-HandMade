"use client"
import React, { useState } from "react";
import PackageCard from "@/components/Category/package-card"

export default function CategoryProductsGrid({ visibleProducts }) {

  return (
    <>
      <div className="flex items-center flex-wrap md:px-10 gap-2 md:gap-10 md:m-4 m-1 md:py-8 py-2">
        {visibleProducts.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <h3 className="text-xl font-medium text-gray-600">No products found for this category</h3>
            <p className="mt-2 text-gray-500">Please try another category</p>
          </div>
        ) : (
          visibleProducts.map((item, index) => (
            <PackageCard
              key={index}
              pkg={{
                ...item,
                name: item.title,
                image: item.gallery?.mainImage.url,
                price: (item.quantity && Array.isArray(item.quantity.variants) && item.quantity.variants.length > 0 ? item.quantity.variants[0].price : 0),
                originalPrice: item.quantity?.originalPrice,
                coupon: item.coupon,
                description: item.description,
              }}
            />
          ))
        )}
      </div>

  
    </>
  );
}