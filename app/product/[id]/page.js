import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SidebarInset } from "@/components/ui/sidebar"
import ResponsiveFeaturedCarousel from "@/components/ResponsiveFeaturedCarousel"
// import ProductInfoTabs from "@/components/ProductInfoTabs";
import RelatedProductsCarousel from "@/components/RelatedProductsCarousel";
import StickyAddToCartBar from "@/components/StickyAddToCartBar"
import ProductDetailView from "@/components/ProductDetailView";
import ProductInfoTabs from "@/components/ProductInfoTabs";
import ProductVideo from "@/components/ProductVideo";
import CategoryCard from "@/components/Category/category-card";
const ProductDetailPage = async ({ params }) => {
    // Get the product slug from the URL and decode it
    let { id } = await params;
    const decodedSlug = decodeURIComponent(id);
    // console.log(decodedSlug)
    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/product/${decodedSlug}`;
    // console.log('Fetching product with slug:', decodedSlug, 'API URL:', apiUrl);
    // Fetch the product by its slug using the API route
    const res = await fetch(apiUrl, { cache: 'no-store' });
    const product = await res.json();
    // console.log('Fetched product:', product);

    // If product not found, show not found message
    if (!product || product.error) {
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
            // console.log('Fetched related products:', relatedProducts);
        }
    } catch (error) {
    }




    // Render the product details page
    return (
        <SidebarInset>
            <div className="w-full px-4 py-8 flex flex-col">
                <div className="space-y-4">
                    <ProductDetailView product={product} />
                </div>
                <div className="space-y-4">
                    <ProductVideo productData={product} productId={product._id} />
                </div>
                <div className="space-y-4">
                    <ProductInfoTabs product={product} />
                </div>
                {/* <ResponsiveFeaturedCarousel /> */}
                {frequentlyBoughtTogether && frequentlyBoughtTogether.length > 0 && (
                    <div className="mt-8 px-4 py-2 bg-[#fafafa]">
                        <h2 className=" text-2xl md:text-4xl font-semibold px-4">Frequently Bought Together</h2>
                        <ResponsiveFeaturedCarousel products={frequentlyBoughtTogether} />
                    </div>
                )}
                {/* Category Cards Row */}
                {allCategories && allCategories.length > 0 && (
                    <div className="mt-8 px-4 py-2">
                        <h2 className="text-2xl md:text-4xl font-semibold px-4">Category</h2>
                            <div>
                                <Carousel className="w-full mx-auto my-4">
                                    <CarouselContent className="w-full gap-5">
                                        {Array.isArray(allCategories) && allCategories.flatMap(cat =>
                                            Array.isArray(cat.subMenu) ? cat.subMenu.map((sub, idx) => (
                                                <CarouselItem key={`${cat._id || cat.title || idx}-${sub._id || sub.url || idx}`} className="basis-1/2 md:basis-1/5 lg:basis-1/5 min-w-0 snap-start">
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
                        
                        {/* <RelatedProductsCarousel products={relatedProducts} /> */}
                    </div>
                )}
                <StickyAddToCartBar product={product} />
            </div>
        </SidebarInset>
    )
}

export default ProductDetailPage