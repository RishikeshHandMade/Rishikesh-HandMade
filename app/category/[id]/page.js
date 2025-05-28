import { Suspense } from "react"

import CategoryBanner from "@/components/Category/category-banner"
import PackageCard from "@/components/Category/package-card"
import { Skeleton } from "@/components/ui/skeleton"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

import { Heart } from "lucide-react";
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
    // console.log(visibleProducts)
    const categoryInfo = await getCategoryInfo(categoryData);

    return (
        <SidebarInset>
            <div className="min-h-screen p-2 bg-[#fcf7f1]">
                {/* Fixed Banner Section */}
                <CategoryBanner title={categoryInfo.title} bannerImage={categoryInfo.bannerImage} />

                {/* Products Section */}
                <div className="container w-full px-10 md:px-4 py-5">
                    {visibleProducts.length === 0 ? (
                        <div className="text-center py-8">
                            <h3 className="text-xl font-medium text-gray-600">No products found for this category</h3>
                            <p className="mt-2 text-gray-500">Please try another category</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-5 xl:grid-cols-5 gap-10 justify-center items-center ">
                            <Suspense fallback={<PackageCardSkeleton count={3} />}>
                                {visibleProducts.map((item, index) => (
                                    <PackageCard
                                        key={item._id || index}
                                        pkg={{
                                            ...item,
                                            name: item.title,
                                            image: item.gallery?.mainImage,
                                        }}
                                        // addToWishlist={addToWishlist}
                                        // addToCart={addToCart}
                                        // setQuickViewProduct={setQuickViewProduct}
                                    />
                                ))}
                            </Suspense>
                        </div>
                    )}
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

