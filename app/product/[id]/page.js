import Image from "next/image"
import {
    MapPin,
    Calendar,
    Clock,
    Tag,
    Star,
    Check,
    X,
    AlertTriangle,
    Calculator,
    MessageSquare,
    ShoppingCart,
    PhoneCall,
    MessageCircle,
    CalendarClock,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import ReviewForm from "@/components/Category/review-form"
import PackageGallery from "@/components/Category/package-gallery"
import PackageMap from "@/components/Category/package-map"
import Link from "next/link"
import { SidebarInset } from "@/components/ui/sidebar"
import User from "@/models/User"
import { getReviewsById } from "@/actions/GetReviewsById"
import { Card, CardContent } from "@/components/ui/card"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { DismissableInfoBox } from "@/components/Package/NoticeBox"
import connectDB from "@/lib/connectDB"
import Package from "@/models/Package"
import PackageCarouselWrapper from "@/components/PackageCarouselWrapper";
import FeaturedCarouselWrapper from "@/components/FeaturedCarouselWrapper";
import ComingSoon from "@/models/ComingSoon";
import ComingSoonEnquiryForm from "@/components/ComingSoonEnquiryForm";
import ImportantNotice from "@/components/ImportantNotice"
import  ResponsiveFeaturedCarousel from "@/components/ResponsiveFeaturedCarousel"
import ProductInfoTabs from "@/components/ProductInfoTabs";
import RelatedProductsCarousel from "@/components/RelatedProductsCarousel";
import StickyAddToCartBar from "@/components/StickyAddToCartBar"
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
    let { id } = params;
    const decodedSlug = decodeURIComponent(id);
    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/product/${decodedSlug}`;
    console.log('Fetching product with slug:', decodedSlug, 'API URL:', apiUrl);
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

    // Render the product details page
    return (
        <SidebarInset>
            <div className="container mx-auto px-4 py-12">
                {/* Frequently Bought Together Section */}
          
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* LEFT: Main Image + Gallery */}
                    <div className="flex-1 flex flex-col items-center">
                        <div className="w-full flex justify-center mb-4">
                            <Image
                                src={product.gallery?.mainImage || '/placeholder.png'}
                                alt={product.title}
                                width={400}
                                height={400}
                                className="rounded-lg object-contain max-h-[420px]"
                            />
                        </div>
                        {/* Gallery Thumbnails */}
                        {product.gallery?.subImages && product.gallery.subImages.length > 0 && (
                            <>
                                <div className="flex gap-2 mt-2">
                                    {product.gallery.subImages.map((img, idx) => (
                                        <Image
                                            key={idx}
                                            src={img}
                                            alt={`${product.title} ${idx + 1}`}
                                            width={64}
                                            height={64}
                                            className="rounded-lg object-cover w-16 h-16 border hover:ring-2 hover:ring-blue-500 cursor-pointer"
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* RIGHT: Product Details */}
                    <div className="flex-1 max-w-xl mx-auto">
                        {/* Badges */}
                        <div className="flex flex-col gap-2 mb-2">
                            {/* <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">Sale</span>
                            <span className="bg-yellow-400 text-white text-xs px-2 py-1 rounded">Must Have</span> */}
                            Color Options
                            <div className="mb-2">
                                <div className="font-semibold mb-1">Color:</div>
                                <div className="flex gap-2">
                                    {["#eab1b1", "#e1eab1", "#6ecb8c", "#3b6eea", "#eacb3b"].map((color, idx) => (
                                        <button key={idx} className="w-7 h-7 rounded-full border-2 border-gray-300" style={{ background: color }}></button>
                                    ))}
                                </div>
                            </div>
                            {/* Size Options */}
                            <div className="mb-2">
                                <div className="font-semibold mb-1">Size:</div>
                                <div className="flex gap-2">
                                    {["XS", "S", "M", "L"].map((size, idx) => (
                                        <button key={idx} className="px-3 py-1 border rounded-lg bg-white hover:bg-gray-100">{size}</button>
                                    ))}
                                </div>
                            </div>
                            {/* Material Options */}
                            <div className="mb-2">
                                <div className="font-semibold mb-1">Material:</div>
                                <div className="flex gap-2">
                                    {["Option 1", "Option 2", "Option 3"].map((mat, idx) => (
                                        <button key={idx} className="px-3 py-1 border rounded-lg bg-white hover:bg-gray-100">{mat}</button>
                                    ))}
                                </div>
                            </div>
                            {/* Quantity Selector */}
                            <div className="mb-4 flex items-center gap-2">
                                <span className="font-semibold">Quantity:</span>
                                <button className="w-8 h-8 border rounded flex items-center justify-center">-</button>
                                <span className="w-8 text-center">1</span>
                                <button className="w-8 h-8 border rounded flex items-center justify-center">+</button>
                            </div>
                            {/* Subtotal */}
                            <div className="mb-4 text-lg font-bold">Subtotal: ₹100</div>

                            <div className="mb-4 flex items-center gap-2">
                                <button className="">Size Guide</button>
                                <span className="w-8 text-center">1</span>
                                <button className="">Ask a Expert</button>
                            </div>


                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3 mb-4">
                                <div className="flex w-full gap-3 ">
                                    <button className="bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 w-2/3">ADD TO CART</button>
                                    <div className="flex items-center gap-3 mt-2">
                                <button className="p-2 border rounded-full"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 0 1 6.364 0L12 7.636l1.318-1.318a4.5 4.5 0 1 1 6.364 6.364L12 21.682l-7.682-7.682a4.5 4.5 0 0 1 0-6.364z" /></svg></button>
                                <button className="p-2 border rounded-full"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 12v1a8 8 0 0 0 8 8v0a8 8 0 0 0 8-8v-1" /><polyline points="16 6 12 2 8 6" /></svg></button>
                            </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="terms" className="accent-black" />
                                    <label htmlFor="terms" className="text-xs">I agree with the Terms & Conditions</label>
                                </div>
                                <button className="border border-black py-3 rounded-lg font-semibold hover:bg-gray-100">BUY IT NOW</button>
                            </div>
                            {/* Additional Info */}
                            <div className="flex flex-col gap-2 text-xs text-gray-700 mb-2">
                                <div className="flex items-center gap-2"><span>👁️</span> 200 customers are viewing this product</div>
                                <div className="flex items-center gap-2 text-green-700"><Check className="h-4 w-4" /> PICKUP AVAILABLE AT <span className="font-semibold">LOS ANGELES</span> <span className="ml-1">Usually ready in 24 hours</span></div>
                                <a href="#" className="underline text-blue-700">Check availability at other stores</a>
                            </div>
                            {/* Share/Wishlist */}
                           
                        </div>
                    </div>
                </div>
                {/* Product Info Tabs Section */}
                <ProductInfoTabs product={product} />
                <ResponsiveFeaturedCarousel />
                <RelatedProductsCarousel />
                <StickyAddToCartBar product={product} />
                
            </div>
        </SidebarInset>
    )
}



export default ProductDetailPage