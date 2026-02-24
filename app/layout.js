import "./globals.css";
import Header from "@/components/Header";
import SessionWrapper from "@/components/SessionWrapper";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import NextTopLoader from "nextjs-toploader";
import { SearchProvider } from "@/context/SearchContext";
import OverlayButton from "@/components/OverlayButton";
import GoogleTranslate from "@/components/GoogleTranslate";
import { MenuProvider } from "@/context/MenuProvider";


export const metadata = {
  metadataBase: new URL("https://rishikeshhandmade.com"),
  title: {
    default: "Rishikesh Handmade - Jute Fiber, Bhimal Fiber, Natural Fiber, Handicraft Product",
    template: "%s | Rishikesh Handmade",
  },
  description:
    "Rishikesh Handmade:It showcases eco-friendly, handcrafted items like wooden carvings, paintings, jewelry, and home decor made by skilled local artisans. By supporting this platform, you help preserve age-old crafts and empower local communitiess. For more info call +91 7351009107, Info@rishikeshhandmade.com rishikeshhandmade@gmail.com Our website is your gateway to the heart of Rishikesh, offering rich and soulful handmade creations crafted by local artisans.",
  keywords:
    "rishikeshhandmade, rishikesh, handmade, website, rishikesh handmade, india, India",
  icons: { apple: "/apple-touch-icon.png" },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Rishikesh Handmade - Jute Fiber, Bhimal Fiber, Natural Fiber, Handicraft Product",
    description:
      "Rishikesh Handmade Craft is a platform that celebrates the traditional art and culture of Rishikesh. It showcases eco-friendly, handcrafted items like wooden carvings, paintings, jewelry, and home decor made by skilled local artisans. By supporting this platform, you help preserve age-old crafts and empower local communities.",
    images: ["/logo.png"],
    url: "https://rishikeshhandmade.com",
    site_name: "Rishikesh Handmade",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rishikesh Handmade - Jute Fiber, Bhimal Fiber, Natural Fiber, Handicraft Product",
    description:
      "Our website is your gateway to the heart of Rishikesh, offering rich and soulful handmade creations crafted by local artisans.",
    images: ["/logo.png"],
  },
  other: {
    "author": "Rishikesh Handmade",
    "robots": "index, follow",
    "viewport": "width=device-width, initial-scale=1",
  },
};

export const revalidate = 3600;

async function getMenuItems() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/getMenuCategories`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("MenuItems Fetch Error:", error);
    return [];
  }
}
import { CartProvider } from "../context/CartContext";
// import CartSyncOnLogin from "../context/CartSyncOnLogin";

export default async function RootLayout({ children }) {
  const isPaid = process.env.NEXT_PUBLIC_IS_PAID === "true";
  const menuItems = await getMenuItems();
  // console.log(menuItems)
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-gilda`}>
        {isPaid ? (
          <CartProvider>
            <NextTopLoader color="#006eff" height={3} showSpinner={false} zIndex={1600} />
            <Toaster position="top-center" reverseOrder={false} toastOptions={{ duration: 2500, style: { fontFamily: "var(--font-GildaDisplay)" } }} />
            <SessionWrapper>
              {/* <CartSyncOnLogin /> */}
              <SearchProvider>
                <MenuProvider menuItems={menuItems}>
                  <Header menuItems={menuItems} />
                  {/* <GoogleTranslate /> */}
                  <main>
                    <OverlayButton />
                    {children}
                  </main>
                  <Footer />
                </MenuProvider>
              </SearchProvider>
            </SessionWrapper>
          </CartProvider>
        ) : (
          <div className="flex items-center justify-center h-screen">
            <h1 className="text-2xl font-bold text-black text-center">
              Payment Pending. Please Contact Admin.
            </h1>
          </div>
        )}
      </body>
    </html>
  );
}
