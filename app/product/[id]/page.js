// 👇 Add this at the top to force server-side rendering
export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SidebarInset } from "@/components/ui/sidebar";
import ResponsiveFeaturedCarousel from "@/components/ResponsiveFeaturedCarousel";
import StickyAddToCartBar from "@/components/StickyAddToCartBar";
import ProductDetailView from "@/components/ProductDetailView";
import ProductInfoTabs from "@/components/ProductInfoTabs";
import ProductVideo from "@/components/ProductVideo";
import { CategoryCarousel } from "@/components/Category/category-card";

const ProductDetailPage = async ({ params }) => {
  // ✅ No await here
  const id = decodeURIComponent(params.id);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const apiUrl = `${baseUrl}/api/product/${id}`;
  console.log("[ProductDetailPage] Fetching product from:", apiUrl);

  let product = null;

  try {
    const res = await fetch(apiUrl, { cache: "no-store" });
    // console.log(apiUrl)

    if (!res.ok) {
      throw new Error(`Product fetch failed: ${res.status}`);
    }

    product = await res.json();
  } catch (error) {
    console.error("Failed to load product:", error.message);
  }

  // ✅ Fallback if product not found
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

  // ✅ Frequently Bought Together
  let frequentlyBoughtTogether = [];
  try {
    const fbtRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/product/frequentlyBoughtTogether?id=${product._id}`,
      { cache: 'no-store' }
    );
    if (fbtRes.ok) {
      frequentlyBoughtTogether = await fbtRes.json();
    }
  } catch (error) {
    console.error("Error fetching FBT:", error.message);
  }

  // ✅ Fetch Categories
  let allCategories = [];
  try {
    if (product.category) {
      const allCategoriesRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/getAllMenuItems`,
        { cache: 'no-store' }
      );
      if (!allCategoriesRes.ok) throw new Error("Categories fetch failed");
      allCategories = await allCategoriesRes.json();
    }
  } catch (error) {
    console.error("Error fetching categories:", error.message);
  }

  // ✅ Render Product Detail Page
  return (
    <SidebarInset>
      <div className="w-full py-8 flex flex-col">
        <div className="space-y-4 px-4">
          {/* ✅ Force rerender when navigating between products */}
          <ProductDetailView key={product._id} product={product} />
        </div>
        <div className="space-y-4">
          <ProductVideo product={product} />
        </div>
        <div className="space-y-4">
          <ProductInfoTabs product={product} />
        </div>

        {frequentlyBoughtTogether.length > 0 && (
          <div className="mt-8 px-4 py-10 bg-blue-100">
            <h2 className="text-2xl md:text-3xl font-semibold px-10">Frequently Bought Together</h2>
            <ResponsiveFeaturedCarousel products={frequentlyBoughtTogether} />
          </div>
        )}

        {allCategories.length > 0 && (
          <div className="mt-8 px-4 py-5">
            <h2 className="text-2xl md:text-3xl font-semibold px-10">Categories</h2>
            <CategoryCarousel
              categories={allCategories.flatMap(cat =>
                Array.isArray(cat.subMenu)
                  ? cat.subMenu.map(sub => ({
                      title: sub.title,
                      profileImage: sub.profileImage,
                      url: `/category/${sub.url}`
                    }))
                  : []
              )}
            />
          </div>
        )}

        <StickyAddToCartBar product={product} />
      </div>
    </SidebarInset>
  );
};

export default ProductDetailPage;
