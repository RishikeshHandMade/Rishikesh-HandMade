import "./globals.css";
import Header from "@/components/Header";
import SessionWrapper from "@/components/SessionWrapper";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import NextTopLoader from "nextjs-toploader";
import { SearchProvider } from "@/context/SearchContext";
import OverlayButton from "@/components/OverlayButton";
import GoogleTranslate from "@/components/GoogleTranslate";


export const metadata = {
  metadataBase: new URL("https://rishikeshhandmade.com/"),
  title: {
    default: "Rishikesh Handmade - Your Spiritual Travel Solution",
    template: "%s | Rishikesh Handmade",
  },
  description:
    "Experience the essence of spirituality with Rishikesh Handmade, offering enriching spiritual journeys across India. Explore the rich heritage of Rishikesh with our expert guidance.",
  keywords:
    "rishikeshhandmade, rishikesh, handmade, travel, website, rishikesh handmade, travel website, tour website, tour, tour package, package, india, India",
  icons: { apple: "/apple-touch-icon.png" },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Rishikesh Handmade - Your Spiritual Travel Solution",
    description:
      "Embark on a transformative voyage with Rishikesh Handmade, offering enriching spiritual journeys across India.",
    images: ["/logo.png"],
    url: "https://rishikeshhandmade.com/",
    site_name: "Rishikesh Handmade",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rishikesh Handmade - Your Spiritual Travel Solution",
    description:
      "Embark on a transformative voyage with Rishikesh Handmade, offering enriching spiritual journeys across India.",
    images: ["/logo.png"],
  },
  other: {
    "author": "Rishikesh Handmade",
    "robots": "index, follow",
    "viewport": "width=device-width, initial-scale=1",
  },
};

import { CartProvider } from "../context/CartContext";

export default function RootLayout({ children }) {
  const isPaid = process.env.NEXT_PUBLIC_IS_PAID === "true";

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-gilda`}>
        {isPaid ? (
          <CartProvider>
            <NextTopLoader color="#006eff" height={3} showSpinner={false} zIndex={1600} />
            <Toaster position="top-center" reverseOrder={false} toastOptions={{ duration: 3000 , style: { fontFamily: "var(--font-GildaDisplay)" } }} />
            <SessionWrapper>
              <SearchProvider>
                <Header />
                <GoogleTranslate />
                <main>
                  <OverlayButton />
                  {children}
                </main>
                <Footer />
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
