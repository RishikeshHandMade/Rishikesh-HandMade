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
            title: `${(categoryId?.title)} Tours`,
            bannerImage: `${(categoryId?.banner?.url) || `${process.env.NEXT_PUBLIC_BASE_URL}/categoryBanner.jpg`}`,
        }
    )
}

const CategoryPage = async ({ params }) => {
    const { id } = await params
    const { packages } = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/getPackages/byId/${id}`).then(res => res.json())
    const getCategory = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/getCategoryBanner/${id}`).then(res => res.json())

    const categoryInfo = await getCategoryInfo(getCategory)

    // Only show packages that are active
    const visiblePackages = packages.filter(pkg => pkg.active);

    return (
        <SidebarInset>
            <div className="min-h-screen p-2">
                {/* Fixed Banner Section */}
                <CategoryBanner title={categoryInfo.title} bannerImage={categoryInfo.bannerImage} />

                {/* <div className="container mx-auto px-1 md:px-4 py-4">
                    <h2 className="text-2xl xl:text-4xl font-semibold text-black">{categoryInfo.title}</h2>
                </div> */}

                {/* Packages Section */}
                <div className="container mx-auto px-1 md:px-4 py-5 md:py-12">

                    {visiblePackages.length === 0 ? (
                        <div className="text-center py-8">
                            <h3 className="text-xl font-medium text-gray-600">No packages found for this category</h3>
                            <p className="mt-2 text-gray-500">Please try another category</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            <Suspense fallback={<PackageCardSkeleton count={3} />}>
                                {visiblePackages.map((pkg) => (
                                    <PackageCard key={pkg._id} pkg={pkg} />
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