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
import ProductDetailView from "@/components/ProductDetailView";
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
                {/* --- Product Details Section (New) --- */}
                <ProductDetailView product={product} />
                <ResponsiveFeaturedCarousel />
                <RelatedProductsCarousel />
                <StickyAddToCartBar product={product} />
                
            </div>
        </SidebarInset>
    )
}



export default ProductDetailPage