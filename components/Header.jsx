"use client"

import { ChevronDown, LogOutIcon, Mail, Phone, User2Icon } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import MenuBar from "./MenuBar"
import { Button } from "./ui/button"
import { signOut, useSession } from "next-auth/react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"
import LanguageSelector from "./LanguageSelector"
import SearchBar from "./SearchBar"

const Header = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false)
  const [menuItems, setMenuItems] = useState([])
  const { data: session, status } = useSession()
  const pathName = usePathname()

  useEffect(() => {
    fetch("/api/getAllMenuItems")
      .then(res => res.json())
      .then(data => setMenuItems(data));
  }, [])

  const isUser = session && !session.user.isAdmin

  return (
    <header
      className={`print:hidden ${pathName.includes("admin") ||
        pathName.includes("category") ||
        pathName.includes("page") ||
        pathName.includes("package") ||
        pathName.includes("checkout") ||
        pathName.includes("search") ||
        pathName.includes("sign-up") ||
        pathName.includes("sign-in") ||
        pathName.includes("customEnquiry")
        ? "hidden"
        : "block"
        } ${pathName === "/" ? `text-white backdrop-blur-md` : `bg-white text-black drop-shadow-lg`} 
         absolute top-0 transition-all duration-300 font-barlow tracking-wider ease-in-out left-0 right-0 z-50 mx-auto w-full py-2`}
    >
      <div className="md:flex hidden items-center justify-between gap-8 border-b py-1 border-gray-400 md:px-8">
        <p className="text-sm">Crafted by Hand, Cherished by Heart</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <Mail size={20} />
            <Link href={"mailto:info@rishikeshhandmade.com"}>
              <p className="text-sm font-semibold hover:underline">info@rishikeshhandmade.com</p>
            </Link>
          </div>

          <div className="h-4 w-0.5 bg-white rounded-full"></div>

          <div className="flex items-center gap-4">
            <Phone size={20}/>
            <Link href={"tel:+917351009107"}>
              <p className="text-sm font-semibold tracking-widest hover:underline">+91 7351009107 </p>
            </Link>
          </div>  
        </div>
      </div>
      <div className="lg:flex hidden items-center z-50 justify-center md:justify-between py-1 md:px-8">
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
