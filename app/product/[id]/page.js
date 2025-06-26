import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SidebarInset } from "@/components/ui/sidebar"
import ResponsiveFeaturedCarousel from "@/components/ResponsiveFeaturedCarousel"
import StickyAddToCartBar from "@/components/StickyAddToCartBar"
import ProductDetailView from "@/components/ProductDetailView";
import ProductInfoTabs from "@/components/ProductInfoTabs";
import ProductVideo from "@/components/ProductVideo";
import CategoryCard from "@/components/Category/category-card";
import { CategoryCarousel } from "@/components/Category/category-card";
const ProductDetailPage = async ({ params }) => {
    // Get the product slug from the URL and decode it
    const id = decodeURIComponent(params.id); 
    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/product/${id}`;
    // Fetch the product by its slug using the API route
    let product = null;

    try {
        const res = await fetch(apiUrl, { cache: "no-store" });

        if (!res.ok) {
            throw new Error(`Product fetch failed: ${res.status}`);
        }

        product = await res.json();
    } catch (error) {
        console.error("Failed to load product:", error.message);
    }



    // console.log('Fetched product:', product);

    // If product not found, show not found message
    if (!product || !product._id) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="text-3xl font-bold mb-4">Product Not Available</h1>
                <p className="mb-8">This product is either not found or has been disabled by the admin.</p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/">Back to Home</Link>
                </Button>
            </div>
        );
    }
    // Fetch frequently bought together products
    let frequentlyBoughtTogether = [];
    try {
        const fbtRes = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/product/frequentlyBoughtTogether?id=${product._id}`,
            { cache: 'no-store' }
        );
        if (fbtRes.ok) {
            frequentlyBoughtTogether = await fbtRes.json();
            //    console.log('Fetched frequently bought together products:', frequentlyBoughtTogether);
        }
    } catch (error) {
        //    console.error('Error fetching frequently bought together products:', error);
    }

    // Fetch related products only if we have a valid product
    let allCategories = [];
    try {
        if (product.category) {  // Only fetch if category exists
            const allCategoriesRes = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/getAllMenuItems`,
                {
                    cache: 'no-store',
                }
            );
            if (!allCategoriesRes.ok) {
                throw new Error(`Failed to fetch all categories: ${allCategoriesRes.status}`);
            }
            allCategories = await allCategoriesRes.json();
            // console.log('Fetched all categories:', allCategories);
        }
    } catch (error) {
    }
    // Render the product details page
    return (
        <SidebarInset>
            <div className="w-full py-8 flex flex-col">
                <div className="space-y-4 px-4">
                <ProductDetailView key={product._id} product={product} />
                </div>
                <div className="space-y-4">
                    <ProductVideo product={product} />
                </div>
                <div className="space-y-4">
                    <ProductInfoTabs product={product} />
                </div>
                {/* <ResponsiveFeaturedCarousel /> */}
                {frequentlyBoughtTogether && frequentlyBoughtTogether.length > 0 && (
                    <div className="mt-8 px-4 py-10 bg-blue-100">
                        <h2 className=" text-2xl md:text-3xl font-semibold px-10">Frequently Bought Together</h2>
                        <ResponsiveFeaturedCarousel products={frequentlyBoughtTogether} />
                    </div>
                )}
                {/* Category Cards Row */}
                {allCategories && allCategories.length > 0 && (
                    <div className="mt-8 px-4 py-5">
                        <h2 className=" text-2xl md:text-3xl font-semibold px-10">Categories</h2>
                        <CategoryCarousel
                            categories={
                                Array.isArray(allCategories)
                                    ? allCategories.flatMap(cat =>
                                        Array.isArray(cat.subMenu)
                                            ? cat.subMenu.map(sub => ({
                                                title: sub.title,
                                                profileImage: sub.profileImage,
                                                url: `/category/${sub.url}`
                                            }))
                                            : []
                                    )
                                    : []
                            }
                        />
                    </div>
                )}
                <StickyAddToCartBar product={product} />
            </div>
        </SidebarInset>
    )
}

export default ProductDetailPage