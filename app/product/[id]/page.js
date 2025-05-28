import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SidebarInset } from "@/components/ui/sidebar"
import ResponsiveFeaturedCarousel from "@/components/ResponsiveFeaturedCarousel"
// import ProductInfoTabs from "@/components/ProductInfoTabs";
import RelatedProductsCarousel from "@/components/RelatedProductsCarousel";
import StickyAddToCartBar from "@/components/StickyAddToCartBar"
import ProductDetailView from "@/components/ProductDetailView";
import ProductInfoTabs from "@/components/ProductInfoTabs";
// Fetch featured packages from the API
// const getFeaturedPackages = async () => {
//     try {
//         const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/featured-packages`);

//         if (!res.ok) return [];
//         const data = await res.json();
//         // console.log(data);
//         return data || [];
//     } catch (error) {
//         console.error('Error fetching featured packages:', error);
//         return [];
//     }
// };

const ProductDetailPage = async ({ params }) => {
    // Get the product slug from the URL and decode it
    let { id } = await params;
    const decodedSlug = decodeURIComponent(id);
    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/product/${decodedSlug}`;
    // console.log('Fetching product with slug:', decodedSlug, 'API URL:', apiUrl);
    // Fetch the product by its slug using the API route
    const res = await fetch(apiUrl, { cache: 'no-store' });
    const product = await res.json();
    console.log('Fetched product:', product);

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

    // Fetch related products only if we have a valid product
    let relatedProducts = [];
    try {
        const relatedRes = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/product/relatedProducts?id=${id}&category=${product.category}`,
            { cache: 'no-store' }   
        );
        if (relatedRes.ok) {
            relatedProducts = await relatedRes.json();
            console.log('Fetched related products:', relatedProducts);
        }
    } catch (error) {
        console.error('Error fetching related products:', error);
    }

    // Render the product details page
    return (
        <SidebarInset>
            <div className="w-full px-4 py-8 flex flex-col">
                <div className="space-y-4">
                    <ProductDetailView product={product} />
                </div>
                <div className="space-y-4">
                        <ProductInfoTabs product={product} />
                    </div>
                {/* Related Products */}
                {relatedProducts && relatedProducts.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-2xl font-semibold mb-8">Related Products</h2>
                        <RelatedProductsCarousel products={relatedProducts} />
                    </div>
                )}
                <ResponsiveFeaturedCarousel />
                <StickyAddToCartBar product={product} />
            </div>
        </SidebarInset>
    )
}

export default ProductDetailPage