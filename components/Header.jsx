"use client"
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ChevronDown, LogOutIcon, Mail, Phone, User2Icon } from "lucide-react"
import Link from "next/link"
import MenuBar from "./MenuBar"
import { Button } from "./ui/button"
import { signOut, useSession } from "next-auth/react"
import Image from "next/image"
import { Loader2 } from "lucide-react"
import LanguageSelector from "./LanguageSelector"
import SearchBar from "./SearchBar"
import Cart from "./Cart";
import { ShoppingCart, Heart } from "lucide-react"
import { useCart } from "../context/CartContext";
import { ArrowDown, Menu, X } from "lucide-react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
const Header = () => {
  const pathName = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [initialCartTab, setInitialCartTab] = useState('cart');
  const { data: session, status } = useSession();
  const { cart = [], wishlist = [] } = useCart();
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [openFixedMenu, setOpenFixedMenu] = useState(null);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    fetch("/api/getAllMenuItems")
      .then(res => res.json())
      .then(data => setMenuItems(data));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setShowHeader(true);
      } else if (window.scrollY > lastScrollY) {
        setShowHeader(false); // scrolling down
      } else {
        setShowHeader(true); // scrolling up
      }
      setLastScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Only render header after mount to avoid hydration mismatch
  if (!isMounted) return null;

  const isUser = session && !session.user.isAdmin;
  const staticMenuItems = [
    {
      catTitle: "About Us",
      subCat: [
        {
          subCatPackage: [
            { title: "About Us", url: "/about-us", active: true },
            { title: "Vision & Mission", url: "/vision-mission", active: true },
            { title: "Team", url: "/team", active: true },
            { title: "What We Do ", url: "/what-we-do", active: true }
          ],
          active: true,
        }
      ],
      active: true,
    },
    {
      catTitle: "Our Policy",
      subCat: [
        {
          subCatPackage: [
            { title: "Privacy Policy", url: "/privacy-policy", active: true },
            { title: "Refund & Cancellation", url: "/refund-cancellation", active: true },
            { title: "Shipping Policy", url: "/shipping-policy", active: true },
            { title: "Terms & Conditions", url: "/terms-condition", active: true }
          ],
          active: true,
        }
      ],
      active: true,
    },
    {
      catTitle: "Contact Us",
      subCat: [
        {
          subCatPackage: [
            { title: "", url: "", active: true }
          ],
          active: true,
        }
      ],
      active: true,
    }
  ];
  return (
    <header
      className={`print:hidden ${pathName.includes("admin") ||
        // pathName.includes("category") ||
        pathName.includes("page") ||
        // pathName.includes("about-us") ||
        // pathName.includes("contact") ||
        // pathName.includes("privacy-policy") ||
        // pathName.includes("refund-cancellation") ||
        // pathName.includes("terms-condition") ||
        // pathName.includes("shipping-policy") ||
        // pathName.includes("product") ||
        // pathName.includes("artisan") ||
        // pathName.includes("cartDetails") ||
        // pathName.includes("checkout") ||
        // pathName.includes("search") ||
        pathName.includes("sign-up") ||
        pathName.includes("sign-in") ||
        pathName.includes("customEnquiry")
        ? "hidden"
        : "block"
        } bg-[#fcf7f1] text-black border-b sticky top-0 left-0 right-0 transition-all duration-300 font-barlow tracking-wider ease-in-out z-50 mx-auto w-full py-2
         ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
    >
      <div className="md:flex hidden items-center justify-between gap-8 border-b py-1 border-gray-400 md:px-8 ">
        <p className="text-md">Crafted by Hand, Cherished by Heart</p>
          <div className="flex flex-row justify-center items-center gap-4">
          <NavigationMenu.Root>
            <NavigationMenu.List className="flex flex-row gap-2">
            {staticMenuItems.length > 0 && staticMenuItems.map((cat, index) => (
              <NavigationMenu.Item key={index} className="relative flex items-center justify-center">
                {cat.catTitle === "Contact Us" ? (
                  <Link href="/contact" className="flex items-center px-4 py-2 text-sm font-semibold hover:bg-blue-500 data-[state=open]:bg-blue-300 data-[state=open]:text-black rounded-md">
                    {cat.catTitle}
                  </Link>
                ) : (
                  <>
                    <NavigationMenu.Trigger className="flex items-center px-4 py-2 text-sm font-semibold hover:bg-blue-500 data-[state=open]:bg-blue-300 data-[state=open]:text-black rounded-md">
                      {cat.catTitle} <ArrowDown className="ml-2" size={12} />
                    </NavigationMenu.Trigger>
                    <AnimatePresence>
                      <NavigationMenu.Content asChild>
                        {(() => {
                          const activeSubCats = cat.subCat.filter(subCat => subCat.active);
                          const singleCategory = activeSubCats.length === 1;
                          return (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className={`absolute top-full mt-2 -translate-x-1/2 bg-white text-black shadow-lg rounded-md z-[9999] ${singleCategory ? 'w-48' : 'w-[400px] lg:w-[600px]'}`}
                            >
                              <div className={
                                singleCategory
                                  ? "flex flex-row gap-4 px-3 py-3"
                                  : "flex flex-row gap-4 p-6"
                              }>
                                {activeSubCats.map((category, idx) => (
                                  Array.isArray(category.subCatPackage) && category.subCatPackage.length > 0 ? (
                                    <div key={idx} className={singleCategory ? "flex flex-col items-center w-full" : "flex flex-col"}>
                                      <h3 className={singleCategory ? "font-medium text-gray-700 mb-2 text-start w-full px-2" : "font-medium text-gray-700 mb-2"}>{category.title}</h3>
                                      <ul className={singleCategory ? "space-y-1 flex flex-col items-start w-full px-2 " : "space-y-2"}>
                                        {category.subCatPackage
                                          .filter(pkg => pkg.active)
                                          .map((pkg, pkgIdx) => (
                                            <li key={pkgIdx} className={singleCategory ? "w-full" : undefined}>
                                              <Link href={pkg.url} className={singleCategory ? "text-gray-900 hover:text-blue-600 text-sm  text-start w-full block py-1" : "text-gray-600 hover:text-blue-600 text-sm"}>
                                                {pkg.title}
                                              </Link>
                                            </li>
                                          ))}
                                      </ul>
                                    </div>
                                  ) : null
                                ))}
                              </div>
                            </motion.div>
                          );
                        })()}
                      </NavigationMenu.Content>
                    </AnimatePresence>
                  </>
                )}
              </NavigationMenu.Item>
            ))}
            </NavigationMenu.List>
          </NavigationMenu.Root>
          </div>

      </div>
      <div className="lg:flex hidden items-center z-50 justify-center md:justify-between py-2 md:px-4 ">
        <Link href={"/"}>
          <img className="w-44 drop-shadow-xl" src="/logo.png" alt="YatraZone" />
        </Link>

        <div className="relative flex items-center">
          <MenuBar menuItems={menuItems.filter(item => item.active)} />
        </div>

        <div className="items-center z-50 gap-4 flex">
          <div className="flex items-center gap-3">
            <SearchBar placeholder={"Destination, Attraction"} />
            {/* Mobile Language Selector - only visible on small screens */}
            <div className="text-right">
              <LanguageSelector />
            </div>

            {/* Cart & Wishlist Icons */}
            <button
              className="relative p-2 rounded-full hover:bg-neutral-100 transition"
              onClick={() => { setInitialCartTab('cart'); setIsCartOpen(true); }}
              aria-label="Open Cart"
            >
              <ShoppingCart size={26} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
                  {cart.length}
                </span>
              )}
            </button>
            <button
              className="relative p-2 rounded-full hover:bg-neutral-100 transition"
              onClick={() => { setInitialCartTab('wishlist'); setIsCartOpen(true); }}
              aria-label="Open Wishlist"
            >
              <Heart size={26} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
                  {wishlist.length}
                </span>
              )}
            </button>
            <Cart open={isCartOpen} onClose={() => setIsCartOpen(false)} initialTab={initialCartTab} />
            <div className="relative">
              {status === "loading" ? (
                <Loader2 className="animate-spin text-blue-600" size={36} />
              ) : isUser ? (
                <>
                  {/* Profile Picture Button */}
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="focus:outline-none border-dashed border-4 border-blue-600 rounded-full"
                  >
                    <Image
                      src={session.user.image || "/user.png"}
                      alt="Profile"
                      width={44}
                      height={44}
                      className="rounded-full cursor-pointer"
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute top-14 right-0 mt-2 w-fit text-black bg-white shadow-lg rounded-lg border z-50">
                      <p className="px-4 pt-2 text-sm font-bold text-gray-700">{session.user.name}</p>
                      <p className="px-4 pb-2 text-sm text-gray-700">{session.user.email}</p>
                      <div className="h-px bg-gray-200" />
                      <Link
                        href="/profile"
                        className="flex items-center rounded-lg w-full text-left px-4 py-2 hover:bg-blue-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User2Icon size={20} className="mr-2" /> Profile
                      </Link>
                      <Link
                        href={`/account/${session.user.id}`}
                        className="flex items-center rounded-lg w-full text-left px-4 py-2 hover:bg-blue-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User2Icon size={20} className="mr-2" /> My Account
                      </Link>
                      <button
                        className="flex items-center rounded-lg w-full text-red-600 text-left px-4 py-2 hover:bg-blue-100"
                        onClick={() => signOut()}
                      >
                        <LogOutIcon size={20} className="mr-2" /> Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="relative">
                  <button onClick={() => setIsAuthDropdownOpen(!isAuthDropdownOpen)} className="font-medium flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-800">
                    Account <ChevronDown className="ml-2" size={16} />
                  </button>
                  {isAuthDropdownOpen && (
                    <div className="absolute top-12 right-0 mt-2 w-48 text-black bg-white shadow-lg rounded-lg border">
                      <Link href="/sign-in" onClick={() => setIsAuthDropdownOpen(false)} className="block px-4 py-2 hover:bg-blue-100">Sign In</Link>
                      <Link href="/sign-up" onClick={() => setIsAuthDropdownOpen(false)} className="block px-4 py-2 hover:bg-blue-100">Create Account</Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="lg:hidden flex items-center z-50 justify-center md:justify-between py-1 px-2 md:px-8">
        <div className="relative flex items-center">
          <MenuBar menuItems={menuItems.filter(item => item.active)} />
        </div>
        <Link href={"/"}>
          <img className="w-44 drop-shadow-xl" src="/logo.png" alt="YatraZone" />
        </Link>

        <div className="items-center gap-4 flex">
          <div className="flex items-center gap-3">
            {/* Mobile Language Selector - only visible on small screens */}
            <div className="text-right">
              <LanguageSelector />
            </div>
            <div className="relative">
              {status === "loading" ? (
                <Loader2 className="animate-spin text-blue-600" size={36} />
              ) : isUser ? (
                <>
                  {/* Profile Picture Button */}
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="focus:outline-none border-dashed border-4 border-blue-600 rounded-full"
                  >
                    <Image
                      src={session.user.image || "/user.png"}
                      alt="Profile"
                      width={44}
                      height={44}
                      className="rounded-full cursor-pointer"
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute top-14 right-0 mt-2 w-fit text-black bg-white shadow-lg rounded-lg border z-50">
                      <p className="px-4 pt-2 text-sm font-bold text-gray-700">{session.user.name}</p>
                      <p className="px-4 pb-2 text-sm text-gray-700">{session.user.email}</p>
                      <div className="h-px bg-gray-200" />
                      <Link
                        href="/profile"
                        className="flex items-center rounded-lg w-full text-left px-4 py-2 hover:bg-blue-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User2Icon size={20} className="mr-2" /> Profile
                      </Link>
                      <Link
                        href={`/account/${session.user.id}`}
                        className="flex items-center rounded-lg w-full text-left px-4 py-2 hover:bg-blue-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User2Icon size={20} className="mr-2" /> My Account
                      </Link>
                      <button
                        className="flex items-center rounded-lg w-full text-red-600 text-left px-4 py-2 hover:bg-blue-100"
                        onClick={() => signOut()}
                      >
                        <LogOutIcon size={20} className="mr-2" /> Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="relative">
                  <button onClick={() => setIsAuthDropdownOpen(!isAuthDropdownOpen)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-800">
                    Account <ChevronDown className="ml-2" size={16} />
                  </button>
                  {isAuthDropdownOpen && (
                    <div className="absolute top-12 right-0 mt-2 w-48 text-black bg-white shadow-lg rounded-lg border">
                      <Link href="/sign-in" onClick={() => setIsAuthDropdownOpen(false)} className="block px-4 py-2 hover:bg-blue-100">Sign In</Link>
                      <Link href="/sign-up" onClick={() => setIsAuthDropdownOpen(false)} className="block px-4 py-2 hover:bg-blue-100">Create Account</Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
