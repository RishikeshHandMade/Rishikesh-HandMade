import { Suspense } from "react"

import CategoryBanner from "@/components/Category/category-banner"
import PackageCard from "@/components/Category/package-card"
import { Skeleton } from "@/components/ui/skeleton"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

const formatCategoryId = (categoryId) => {
    return categoryId
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
        .join(' '); // Join words with space
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

    return (
        <SidebarInset>
            <div className="min-h-screen p-2">
                {/* Fixed Banner Section */}
                <CategoryBanner title={categoryInfo.title} bannerImage={categoryInfo.bannerImage} />

                {/* Products Section */}
                <div className="container w-full px-1 md:px-4 py-5">
                    {visibleProducts.length === 0 ? (
                        <div className="text-center py-8">
                            <h3 className="text-xl font-medium text-gray-600">No products found for this category</h3>
                            <p className="mt-2 text-gray-500">Please try another category</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-5 xl:grid-cols-5 gap-1 justify-items-center items-center">
                            <Suspense fallback={<PackageCardSkeleton count={3} />}>
                                {visibleProducts.map((prod, idx) => {
                                    const imageUrl = prod.gallery?.mainImage || '';
                                    return (
                                        <div
                                            key={prod._id || idx}
                                            className="flex flex-col items-center justify-center w-60 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-4 mb-2 group cursor-pointer border border-gray-200 text-center"
                                            style={{ minHeight: '340px' }}
                                        >
                                            <div className="w-full aspect-[4/5] rounded-xl overflow-hidden mb-4 bg-gray-100 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                                                {imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={prod.title}
                                                        className="object-cover w-full h-full rounded-xl group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                                )}
                                            </div>
                                            <a
                                                href={`/product/${prod._id}`}
                                                className="block w-full text-center font-semibold text-lg text-gray-800 hover:text-blue-600 transition-colors duration-200 mb-2 truncate"
                                                style={{ letterSpacing: '.02em' }}
                                                title={prod.title}
                                            >
                                                {prod.title}
                                            </a>
                                            <a
                                                href={`/product/${prod._id}`}
                                                className="inline-block mt-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm shadow hover:bg-blue-700 transition-colors duration-200"
                                            >
                                                View Details
                                            </a>
                                        </div>
                                    );
                                })}
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

