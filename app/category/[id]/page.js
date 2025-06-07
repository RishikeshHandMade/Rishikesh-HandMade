import { Suspense } from "react"

import CategoryBanner from "@/components/Category/category-banner"
import PackageCard from "@/components/Category/package-card"
import { Skeleton } from "@/components/ui/skeleton"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import CategoryCard from "@/components/Category/category-card";
import { Heart } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
const formatCategoryId = (categoryId) => {
  return categoryId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
    .join(' '); // Join words with space
};
const formatNumeric = (num) => {
  return new Intl.NumberFormat("en-IN").format(num);
};

export async function generateMetadata({ params }) {
  const { id } = await params
  return {
    title: `${formatCategoryId(id)}`,
  };
}

// Get category information
const getCategoryInfo = async (categoryId) => {
  return (
    {
      title: `${(categoryId?.title)} Products`,
      bannerImage: `${(categoryId?.banner?.url) || `${process.env.NEXT_PUBLIC_BASE_URL}/categoryBanner.jpg`}`,
    }
  )
}

const CategoryPage = async ({ params }) => {
  const { id } = await params;
  const categoryRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/getCategoryBanner/${id}`);
  let categoryData;
  try {
    categoryData = await categoryRes.json();
  } catch {
    categoryData = {};
  }
  // products is now an array of full product objects
  const products = Array.isArray(categoryData.products) ? categoryData.products : [];
  const visibleProducts = products.filter(prod => prod.active !== false);
  console.log(visibleProducts)
  const categoryInfo = await getCategoryInfo(categoryData);

  // Fetch category advertisement banner

  const adRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/categoryAdvertisment`, { cache: 'no-store' });
  const categoryAds = await adRes.json();
  const categoryAdList = Array.isArray(categoryAds) && categoryAds.length > 0 ? categoryAds : [];

  // Fetch all categories for the category cards row
  const allCategoriesRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/getAllMenuItems`, { cache: 'no-store' });
  const allCategories = await allCategoriesRes.json();
  // console.log(allCategories)

  return (
    <SidebarInset>
      <div className="min-h-screen p-2 bg-[#fcf7f1]">
        {/* Category Banner at the top */}
        <CategoryBanner title={categoryInfo.title} bannerImage={categoryInfo.bannerImage} />

        <div className="flex flex-col md:flex-row gap-6 w-full mt-4">
          {/* Left Image Section */}
          <div className="hidden md:flex flex-col w-full max-w-xs justify-start items-center">
            {/* Category Advertisement Banner */}
            {categoryAdList.length > 0 ? (
              <>
                {categoryAdList.map((ad, idx) => (
                  <div key={ad._id || idx} className="w-full max-w-xl rounded-2xl overflow-hidden shadow mb-4 flex flex-col items-center">
                    {ad.image && ad.buttonLink ? (
                      <a href={ad.buttonLink} target="_blank" rel="noopener noreferrer">
                        <img
                          src={ad.image?.url || ad.image}
                          alt={"Category Advertisement"}
                          className="object-contain w-full max-h-[500px] cursor-pointer hover:opacity-90 transition"
                          style={{ height: "auto", maxHeight: "500px" }}
                        />
                      </a>
                    ) : ad.image ? (
                      <img
                        src={ad.image?.url || ad.image}
                        alt={"Category Advertisement"}
                        className="object-contain w-full max-h-[500px]"
                        style={{ height: "auto", maxHeight: "500px" }}
                      />
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
            )}
          </div>

          {/* Middle Section: Category Cards + Package Cards */}
          <div className="flex-1 gap-4">
            <div>
              <h2 className="text-2xl font-bold px-4">Category</h2>
              {/* Category Cards Row */}
              <Carousel className="w-full mx-auto my-4">
                <CarouselContent className=" w-full gap-2">
                  {Array.isArray(allCategories) && allCategories.flatMap(cat =>
                    Array.isArray(cat.subMenu) ? cat.subMenu.map((sub, idx) => (
                      <CarouselItem key={`${cat._id || cat.title || idx}-${sub._id || sub.url || idx}`} className="md:basis-1/5 lg:basis-1/5 min-w-0 snap-start">
                        <CategoryCard category={{
                          title: sub.title,
                          profileImage: sub.profileImage,
                          url: `/category/${sub.url}`
                        }} />
                      </CarouselItem>
                    )) : []
                  )}
                </CarouselContent>
                {/* <CarouselPrevious /> */}
                {/* <CarouselNext /> */}
              </Carousel>
            </div>
            < div className="h-[1px] bg-gray-300"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-4">
              {/* Package Cards Row */}
              {visibleProducts.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <h3 className="text-xl font-medium text-gray-600">No products found for this category</h3>
                  <p className="mt-2 text-gray-500">Please try another category</p>
                </div>
              ) : (
                <Suspense fallback={<PackageCardSkeleton count={3} />}>
                  {visibleProducts.map((item, index) => (
                    <PackageCard
                      key={index}
                      pkg={{
                        ...item,
                        name: item.title,
                        image: item.gallery?.mainImage.url,
                        price: (item.quantity && Array.isArray(item.quantity.variants) && item.quantity.variants.length > 0 ? item.quantity.variants[0].price : 0),
                        originalPrice: item.quantity?.originalPrice,
                        coupon: item.coupon,
                      }}
                    />
                  ))}
                </Suspense>
              )}

            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  )

}

const PackageCardSkeleton = ({ count = 3 }) => {
  return (
    <>
      {Array(count)
        .fill(0)
        .map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-5">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-10 w-1/3 rounded-full" />
              </div>
            </div>
          </div>
        ))}
    </>
  )
}

export default CategoryPage

