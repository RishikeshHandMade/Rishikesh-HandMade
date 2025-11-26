import CategoryBanner from "@/components/Category/category-banner";
import CategoryProducts from "@/components/CategoryProducts";
import CategoryAds from "@/components/CategoryAds";
import { SidebarInset } from "@/components/ui/sidebar";

import CategoryMenuBar from "./CategoryMenuBar";

// Format "trekking_shoes" → "Trekking Shoes"
const formatCategoryId = (categoryId) => {
  return categoryId
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

export async function generateMetadata({ params }) {
  const { id } = await params;
  return { title: `${formatCategoryId(id)}` };
}

const getCategoryInfo = async (categoryData) => ({
  title: categoryData?.title || "Category Title",
  bannerImage:
    categoryData?.banner?.url ||
    `${process.env.NEXT_PUBLIC_BASE_URL}/bg1.webp`,
});

export default async function CategoryPage({ params }) {
  const { id } = await params;

  // 🔥 Parallel fetching for maximum speed
  const [categoryRes, adsRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/getCategoryBanner/${id}`, {
      next: { revalidate: 600 }, // cache for 10 minutes
    }),
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/categoryAdvertisment`, {
      next: { revalidate: 600 }, // not no-store
    }),
  ]);

  const categoryData = await categoryRes.json();
  const categoryAds = await adsRes.json();

  // Only active products
  const products = Array.isArray(categoryData.products)
    ? categoryData.products.filter((prod) => prod?.active !== false)
    : [];

  const categoryInfo = await getCategoryInfo(categoryData);

  return (
    <SidebarInset>
      <div>
        <div className="w-full bg-[url('/categoryBack.jpg')] bg-no-repeat bg-contain bg-center text-white h-[80px] md:h-[300px] flex justify-center items-center">
          <h1 className="text-xl md:text-5xl font-extrabold drop-shadow">{categoryData.title}</h1>
        </div>
        <div className="min-h-screen bg-[#fcf7f1]">



          <div className="flex flex-col md:flex-row w-full mt-4 px-2">

            {/* 🔥 Left advertisement panel */}
            <div className="hidden md:flex flex-col w-72 max-w-xs flex-shrink-0 justify-start items-center">
              <CategoryAds
                categoryAdList={
                  Array.isArray(categoryAds) && categoryAds.length > 0
                    ? categoryAds
                    : []
                }
              />
            </div>

            {/* 🔥 Middle Section */}
            <div className="flex-1 min-w-0 gap-2 px-2">
              {/* 🔥 Category Banner */}
              <CategoryBanner
                title={categoryData.title}
                bannerImage={categoryInfo.bannerImage}
                mainCategory={categoryData.title}
              />
              {/* Product grid */}
              <CategoryProducts visibleProducts={products} />

              <div className="h-[1px] bg-gray-300 my-6"></div>

              {/* 🔥 FAST Category Menu from GLOBAL context */}
              <CategoryMenuBar />
            </div>
          </div>
        </div>
      </div>

    </SidebarInset>
  );
}
