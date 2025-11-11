"use client"
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import TopAdvertisementMarquee from "./TopAdvertisementMarquee";
import { ChevronDown, LogOutIcon, Mail, Phone, Truck, User2Icon, Handshake } from "lucide-react"
import Link from "next/link"
import MenuBar from "./MenuBar"
import { Button } from "./ui/button"
import { signOut, useSession } from "next-auth/react"
import Image from "next/image"
import { Loader2 } from "lucide-react"
import LanguageSelector from "./LanguageSelector"
import SearchBar from "./SearchBar"
import Cart from "./Cart";
import { ShoppingCart, Heart, User } from "lucide-react"
import { useCart } from "../context/CartContext";
import { ArrowDown, Menu, X } from "lucide-react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
const Header = () => {
  const authDropdownRef = useRef(null);
  const profileMenuRef = useRef(null);
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
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Close auth dropdown if open and click is outside
      if (isAuthDropdownOpen && authDropdownRef.current && !authDropdownRef.current.contains(e.target)) {
        // Check if the click is not on the profile menu
        if (!profileMenuRef.current || !profileMenuRef.current.contains(e.target)) {
          setIsAuthDropdownOpen(false);
        }
      }

      // Close profile menu if open and click is outside
      if (isProfileOpen && profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        // Check if the click is not on the auth dropdown
        if (!authDropdownRef.current || !authDropdownRef.current.contains(e.target)) {
          setIsProfileOpen(false);
        }
      }
    };

    // Add event listeners
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isAuthDropdownOpen, isProfileOpen]);
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

  return (
    <>
      <header
        className={`print:hidden ${pathName.includes("admin") ||
          pathName.includes("page") ||
          pathName.includes("sign-up") ||
          pathName.includes("sign-in") ||
          pathName.includes("vendor/login") ||
          pathName.includes("customEnquiry")
          ? "hidden"
          : "block"
          } bg-[#fcf7f1] text-black border-b font-barlow tracking-wider w-full`}
      >
        <div className="hidden md:flex items-center">

          <TopAdvertisementMarquee />
          {/* Login/Cart section on the right */}

          <div className="flex items-center justify-between gap-2 bg-black w-[35%] py-[10px]">
            <div className="text-white px-2 h-full flex items-center gap-2">
              <p className="text-sm">Follow</p>
              <Link
                target="_blank"
                className="hover:scale-110 transition-all duration-300"
                href={'https://share.google/RwYRUNBjlwGlwTxfL'}>
                <Image
                  priority
                  src="/GoogleLogo.png"
                  alt="Logo"
                  width={23}
                  height={23}
                />
              </Link>
              <Link
                className="hover:scale-110 transition-all duration-300"
                target="_blank"
                href={'https://www.instagram.com/rishikeshhandmade09/'}
              >
                <Image
                  priority
                  src="/instaLogo.png"
                  alt="Logo"
                  width={23}
                  height={23}
                />
              </Link>
              <Link
                href={'https://www.facebook.com/profile.php?id=100076229983946'}
                target="_blank"
                className="hover:scale-110 transition-all duration-300"
              >
                <Image
                  src="/FbLogo.png"
                  priority
                  alt="Logo"
                  width={23}
                  height={23}
                />
              </Link>
            </div>
            <div className="w-[2px] bg-white h-6"></div>
            <div className="flex items-center justify-between gap-5 px-5">
              <Link
                target="_blank"
                href="https://rishikeshnaturalhandicrafts.com/"
                className="text-white text-sm hover:underline  hover:scale-105 transition-all duration-300 text-nowrap"
              >
                Producer Company
              </Link>
              <div className="w-[2px] bg-white h-6"></div>
              <a
                href="/RNFHPC_Share_Holders_PDF.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-sm hover:underline hover:scale-105 transition-all duration-300 text-nowrap">
                List of Members
              </a>
            </div>
          </div>
        </div>
        <div className="md:flex hidden items-center justify-between gap-8 border-b border-gray-400 md:px-8 ">
          <div className="flex flex-row justify-between w-full items-center px-8">
            {/* Logo on the left */}
            <div className="flex-shrink-0">
              <Link href={"/"}>
                <img className="w-80 h-24 object-contain" src="/NewLogo.png" alt="Rishikesh Handmade" />
              </Link>
            </div>

            {/* Login/Cart section on the right */}
            <div className="flex items-center gap-3">
              <div className="relative" ref={profileMenuRef}>
                {status === "loading" ? (
                  <Loader2 className="animate-spin text-blue-600" size={36} />
                ) : isUser ? (
                  <>
                    {/* Profile Picture Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsProfileOpen(!isProfileOpen);
                      }}
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
                      <div
                        className="absolute top-14 right-0 mt-2 w-fit text-black bg-white shadow-lg rounded-lg border z-[999]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <p className="px-4 pt-2 text-sm font-bold text-gray-700">{session.user.name}</p>
                        <p className="px-4 pb-2 text-sm text-gray-700">{session.user.email}</p>
                        <div className="h-px bg-gray-200" />
                        <Link
                          href="/dashboard?section=orders"
                          className="flex items-center rounded-lg w-full text-left px-4 py-2 hover:bg-blue-100"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <User2Icon size={20} className="mr-2" /> Dashboard
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
                  <div className="relative" ref={authDropdownRef}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsAuthDropdownOpen(!isAuthDropdownOpen);
                      }}
                      className="flex flex-col items-center py-2 p-2 rounded-lg hover:bg-gray-200"
                    >
                      <User className="ml-2" size={20} />
                      <h2 className="text-xs font-semibold">Sign In / Login</h2>
                    </button>
                    <AnimatePresence>
                      {isAuthDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-12 right-0 w-48 text-black bg-white shadow-lg rounded-lg border z-[9999]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link
                            href="/sign-in"
                            onClick={() => setIsAuthDropdownOpen(false)}
                            className="block px-4 py-2 hover:bg-blue-100 text-sm"
                          >
                            Sign In
                          </Link>
                          <Link
                            href="/sign-up"
                            onClick={() => setIsAuthDropdownOpen(false)}
                            className="block px-4 py-2 hover:bg-blue-100 text-sm border-t border-gray-100"
                          >
                            Create Account
                          </Link>
                          <Link
                            href="/vendor/login"
                            onClick={() => setIsAuthDropdownOpen(false)}
                            className="block px-4 py-2 hover:bg-blue-100 text-sm border-t border-gray-100"
                          >
                            Vendor Login
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
              {/* Wishlist Button */}
              <div className="relative group">
                <button
                  onClick={() => { setInitialCartTab('wishlist'); setIsCartOpen(true); }}
                  className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-200 transition-colors"
                  aria-label="Wishlist"
                >
                  <div className="relative">
                    <Heart size={20} />
                    {wishlist.length > 0 && (
                      <span className="absolute -top-3 -right-3 bg-pink-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
                        {wishlist.length}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium mt-1">Wishlist</span>
                </button>
              </div>

              {/* Cart Button */}
              <div className="relative group">
                <button
                  onClick={() => { setInitialCartTab('cart'); setIsCartOpen(true); }}
                  className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-200 transition-colors"
                  aria-label="Cart"
                >
                  <div className="relative">
                    <ShoppingCart size={20} />
                    {cart.length > 0 && (
                      <span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
                        {cart.length}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium mt-1">Cart</span>
                </button>
              </div>

              {/* Track Order Button */}
              <div className="group">
                <Link
                  href="/dashboard?section=track"
                  className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Truck size={20} />
                  <span className="text-xs font-medium mt-1">Track Order</span>
                </Link>
              </div>
              <div className="flex items-center flex-col">
                <Link
                  href="/become_partner"
                  className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Handshake />
                  <span className="text-xs font-medium">Become Partner</span>
                </Link>
              </div>
              <SearchBar />
            </div>
          </div>
        </div>
      </header>
      {/* Show only on md and larger screens, and only if not in admin section */}
      <div className="hidden md:block sticky top-0 z-50">
        {pathName.includes("admin") ||
          pathName.includes("vendor/login") ||
          pathName.includes("sign-in") ||
          pathName.includes("sign-up") ||
          pathName.includes("customEnquiry") || (
            <div className="w-full print:hidden">
              <div className={`bg-white py-2 border-b border-gray-200 transition-all duration-300 ${showHeader ? "translate-y-0" : "-translate-y-full"}`}>
                <div className="container mx-auto px-4">
                  <MenuBar menuItems={menuItems} />
                </div>
              </div>
            </div>
          )}
      </div>

      <div className="lg:hidden flex items-center justify-between md:justify-between py-1 px-2">
        <div className="relative flex items-center">
          {/* <MenuBar menuItems={menuItems.filter(item => item.active)} /> */}
          <MenuBar menuItems={menuItems} />
        </div>
        <Link href={"/"}>
          <img className="w-32 object-contain drop-shadow-xl" src="/logo.png" alt="Rishikesh Handmade" />
        </Link>

        <div className="flex items-center gap-2">
          <button
            className="relative p-2 rounded-full hover:bg-gray-200 transition"
            onClick={() => { setInitialCartTab('wishlist'); setIsCartOpen(true); }}
            aria-label="Open Wishlist"
          >
            <Heart size={20} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
                {wishlist.length}
              </span>
            )}
          </button>
          {/* Cart & Wishlist Icons */}
          <button
            className="relative p-2 rounded-full hover:bg-gray-200 transition"
            onClick={() => { setInitialCartTab('cart'); setIsCartOpen(true); }}
            aria-label="Open Cart"
          >
            <ShoppingCart size={20} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
                {cart.length}
              </span>
            )}
          </button>

          <Cart open={isCartOpen} onClose={() => setIsCartOpen(false)} initialTab={initialCartTab} />
          {/* <Truck /> */}

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
                    width={36}
                    height={36}
                    className="rounded-full cursor-pointer"
                  />
                </button>
                <SearchBar />

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute top-14 right-0 mt-2 w-fit text-black bg-white shadow-lg rounded-lg border z-100">
                    <p className="px-4 pt-2 text-sm font-bold text-gray-700">{session.user.name}</p>
                    <p className="px-4 pb-2 text-sm text-gray-700">{session.user.email}</p>
                    <div className="h-px bg-gray-200" />
                    <Link
                      href="/dashboard?section=orders"
                      className="flex items-center rounded-lg w-full text-left px-4 py-2 hover:bg-blue-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User2Icon size={20} className="mr-2" /> Dashboard
                    </Link>
                    {/* <Link
                        href={`/account/${session.user.id}`}
                        className="flex items-center rounded-lg w-full text-left px-4 py-2 hover:bg-blue-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User2Icon size={20} className="mr-2" /> My Account
                      </Link> */}
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
              <div className="relative" ref={authDropdownRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAuthDropdownOpen(!isAuthDropdownOpen);
                  }}
                  className="flex items-center px-4 py-2"
                >
                  <User className="ml-2" size={20} />
                </button>
                {isAuthDropdownOpen && (
                  <div
                    className="absolute top-10 right-0 mt-2 w-48 text-black bg-white shadow-lg rounded-lg border z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      href="/sign-in"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsAuthDropdownOpen(false);
                      }}
                      className="block px-4 py-2 hover:bg-blue-100"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/sign-up"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsAuthDropdownOpen(false);
                      }}
                      className="block px-4 py-2 hover:bg-blue-100"
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

    </>
  )
}

export default Header
