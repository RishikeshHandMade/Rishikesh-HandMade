"use client";
import { useEffect, useState } from "react";
import { CalendarClock, MapPin, Heart, Bookmark } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "./ui/skeleton";
import Autoplay from "embla-carousel-autoplay";
import QuickViewProductCard from "./QuickViewProductCard";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/\-+/g, '-');
}

const RandomTourPackageSection = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [blogs, setBlogs] = useState([]);
  const [isBlogsLoading, setIsBlogsLoading] = useState(true);
  const [instagramPosts, setInstagramPosts] = useState([]);
  const [isInstaLoading, setIsInstaLoading] = useState(true);
  const [isartisanLoading, setIsArtisanLoading] = useState(true);
  const [facebookPosts, setFacebookPosts] = useState([]);
  const [isFbLoading, setIsFbLoading] = useState(true);
  const [artisan, setArtisan] = useState([])
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  useEffect(() => {
    const fetchInstagramPosts = async () => {
      try {
        const res = await fetch("/api/instagram-posts");
        const data = await res.json();
        // console.log(data);
        setInstagramPosts(data);
      } catch (error) {
        setInstagramPosts([]);
      } finally {
        setIsInstaLoading(false);
      }
    };
    fetchInstagramPosts();
  }, []);
  useEffect(() => {
    const fetchArtisan = async () => {
      try {
        const res = await fetch("/api/createArtisan");
        const data = await res.json();
        console.log(data);
        setArtisan(data);
      } catch (error) {
        setArtisan([]);
      } finally {
        setIsArtisanLoading(false);
      }
    };
    fetchArtisan();
  }, []);
  useEffect(() => {
    const fetchFacebookPosts = async () => {
      try {
        const res = await fetch("/api/facebook-posts");
        const data = await res.json();
        // console.log(data);
        setFacebookPosts(data);
      } catch (error) {
        setFacebookPosts([]);
      } finally {
        setIsFbLoading(false);
      }
    };
    fetchFacebookPosts();
  }, []);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/product");
        const data = await res.json();
        // console.log("Product API response:", data);

        if (data && data.length > 0) {
          setProducts(data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        // console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchBlogs = async () => {
      try {
        const res = await fetch("/api/blogs");
        const data = await res.json();
        // console.log(data);
        if (Array.isArray(data)) {
          setBlogs(data);
        } else if (Array.isArray(data.blogs)) {
          setBlogs(data.blogs);
        } else {
          setBlogs([]);
        }
      } catch (error) {
        // console.error("Error fetching blogs:", error);
        setBlogs([]);
      } finally {
        setIsBlogsLoading(false);
      }
    };

    fetchProducts();
    fetchBlogs();
  }, []);

  if (isLoading) {
    return (
      <section className="md:mt-19 w-full px-2 md:px-8 lg:px-16 overflow-hidden max-w-screen overflow-x-hidden">
        <div className=" w-full h-full overflow-hidden max-w-screen overflow-x-hidden">
          <div className="w-full py-10">
            <h2 className="flex items-center text-sm md:text-md lg:text-lg uppercase font-barlow font-semibold"></h2>
            <h1 className="font-bold text-xl md:text-3xl lg:text-4xl uppercase text-center">
              Trending Products: The Best, Today
            </h1>
            <Carousel className="w-[75%] md:w-[95%] drop-shadow-xl mx-auto xl:w-full my-6 md:my-12">
              <CarouselContent className="-ml-1">
                {[...Array(4)].map((_, index) => (
                  <CarouselItem
                    key={index}
                    className="pl-1 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                  >
                    <div className="p-1">
                      <Card>
                        <CardContent className="p-0 rounded-xl flex flex-col aspect-video object-cover justify-between">
                          <Skeleton className="rounded-t-xl w-full h-[200px]" />
                          <div className="p-4 flex flex-col gap-2 h-36">
                            <div className="flex items-center justify-between font-barlow">
                              <Skeleton className="w-1/2 h-4" />
                              <Skeleton className="w-1/3 h-4" />
                            </div>
                            <Skeleton className="w-2/3 h-6" />
                          </div>
                          <div className="h-px bg-gray-200" />
                          <div className="p-4 flex items-center justify-between gap-2 font-barlow">
                            <div>
                              <Skeleton className="w-1/2 h-4" />
                              <Skeleton className="w-1/3 h-4" />
                            </div>
                            <Skeleton className="w-[80px] h-[30px] rounded-sm" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>
      </section>
    );
  }

  const formatNumeric = (num) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  // Combine both Instagram and Facebook posts for the card section
  const allPosts = [...instagramPosts, ...facebookPosts];

  // Determine card width based on number of posts
  const cardBasis =
    allPosts.length <= 3 ? `basis-1/${allPosts.length}` : "md:basis-1/5";

  return (
    <section className=" md:mt-19 w-full px-4 overflow-hidden max-w-screen overflow-x-hidden">
      <div className=" w-full h-full overflow-hidden max-w-screen ">
        <div className="w-full py-9 px-1 ">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mt-10">
            Trending Products: The Best, Today
          </h1>
          <p className=" text-gray-600 py-8 text-center font-barlow w-[80%] mx-auto">
            Discover the hottest deals with our Trending Products! Curated
            daily, these top-rated picks offer the best value and quality —
            handpicked for professionals who demand the best, today. Don’t miss
            out — elevate your experience now!
          </p>
          <Carousel
            className={`w-full md:w-[90%]  mx-auto my-4 ${products.length > 0 ? "block" : "hidden"}`}
          >
            <CarouselContent className="-ml-1 w-full gap-4">
              {products.length > 0 &&
                products.map((item, index) => (
                  <CarouselItem
                    key={index}
                    className="pl-1  md:basis-1/2 lg:basis-1/4 min-w-0 snap-start"
                  >
                    <div className="flex flex-col">
                      {/* Image Section */}
                      <div className="relative w-full h-96 rounded-3xl overflow-hidden flex items-center justify-center group/image">
                        {/* GET 10% OFF Tag */}
                        <div className="absolute top-6 left-6 z-10">
                          <div className="bg-white rounded-full px-5 py-2 text-sm font-bold shadow text-black tracking-tight" style={{ letterSpacing: 0 }}>
                            GET 10% OFF
                          </div>
                        </div>
                        {/* Heart/Wishlist & Cart Buttons - Top Right */}
                        <div className="absolute top-6 right-6 z-10 flex flex-col gap-4 items-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full bg-[#b3a7a3]/80 hover:bg-[#b3a7a3] transition-colors duration-300 h-12 w-12 shadow-none"
                          >
                            <Heart size={28} className="text-white" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full bg-[#b3a7a3]/80 hover:bg-[#b3a7a3] transition-colors duration-300 h-12 w-12 shadow-none"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="28"
                              height="28"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-white"
                            >
                              <circle cx="8" cy="21" r="1" />
                              <circle cx="19" cy="21" r="1" />
                              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                            </svg>
                          </Button>
                        </div>
                        <Image
                          src={item?.gallery?.mainImage || "/RandomTourPackageImages/u1.jpg"}
                          alt={item?.title || "Tour package image"}
                          width={400}
                          height={500}
                          quality={60}
                          className="object-cover w-full h-full rounded-3xl transition-transform duration-300 group-hover/image:scale-105"
                        />
                        {/* Quick View Button - Slide Up from Bottom on Hover (image only) */}
                        <div className="absolute left-0 right-0 bottom-0 flex items-center justify-center translate-y-12 opacity-0 group-hover/image:translate-y-0 group-hover/image:opacity-100 transition-all duration-300 py-4">
                          <Button
                            className="bg-black text-white hover:bg-gray-800 transition-colors duration-300 uppercase text-sm font-bold px-8 py-3 rounded-full shadow-lg"
                            onClick={() => setQuickViewProduct(item)}
                          >
                            QUICK VIEW
                          </Button>
                        </div>
                      </div>
                      {/* Name and Price Section */}
                      <div className="flex items-center justify-between px-2 pt-4 pb-2 bg-white rounded-b-3xl mt-0">
                        <Link
                          href={`/product/${item._id}`}
                          className="font-bold text-xl text-gray-900 leading-tight max-w-[200px] truncate cursor-pointer"
                        >
                          {item?.title}
                        </Link>
                        <span className="font-bold text-xl text-gray-900">${formatNumeric(item?.quantity?.variants[0].price)}</span>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          {/* Promotional Banner Section */}
          <div className="w-full flex flex-col md:flex-row h-[350px] md:h-[400px] gap-0 md:gap-4 my-8">
            {/* Left Side - Summer 2024 */}
            <div className="flex-1 bg-pink-100 flex items-center justify-center relative overflow-hidden">
              <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80" alt="Summer 2024" className="absolute inset-0 w-full h-full object-cover object-center opacity-90" />
              <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="rounded-full bg-white/90 border-2 border-black shadow-lg w-64 h-64 flex flex-col items-center justify-center text-center p-6">
                  <span className="text-xs font-semibold tracking-widest text-gray-700 mb-2">SALE UP TO 50% OFF</span>
                  <span className="text-2xl md:text-3xl font-bold tracking-wide mb-1">SUMMER</span>
                  <span className="text-5xl md:text-6xl font-extrabold mb-2">2024</span>
                  <button className="mt-2 px-5 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition">SHOP NOW</button>
                </div>
              </div>
            </div>
            {/* Right Side - New Summer Collection */}
            <div className="flex-1 bg-yellow-300 flex items-center justify-center relative overflow-hidden">
              <img src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80" alt="New Summer Collection" className="absolute inset-0 w-full h-full object-cover object-center opacity-90" />
              <div className="relative z-10 flex flex-col items-start justify-center pl-8 md:pl-16">
                <span className="text-xs font-semibold tracking-widest text-black mb-2">SALE UP TO 50% OFF</span>
                <span className="text-3xl md:text-4xl font-bold text-black mb-2">NEW SUMMER</span>
                <span className="text-3xl md:text-4xl font-bold text-black mb-4">COLLECTION</span>
                <button className="px-5 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition">SHOP NOW</button>
              </div>
            </div>
          </div>
          {/* Featured Offer For You Section */}
          <div className="w-full my-8">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-5">Featured Offer For You</h2>
            <Carousel className="w-full max-w-full">
              <CarouselContent>
                {/* Static featured offers */}
                {[
                  {
                    img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
                    badge: "20% OFF",
                    title: "SWIMWEAR SALE",
                    button: "Collect Now",
                    bg: "bg-[#FBE7DD]"
                  },
                  {
                    img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80",
                    badge: "20% OFF",
                    title: "LUXURY BRAS",
                    button: "Collect Now",
                    bg: "bg-[#F3F3F3]"
                  },
                  {
                    img: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80",
                    badge: "SALE UP TO 50% OFF",
                    title: "SUMMER 2024",
                    button: "Collect Now",
                    bg: "bg-[#EBC7D9]"
                  }
                ].map((item, idx) => (
                  <CarouselItem key={idx} className="px-2 md:basis-1/3 lg:basis-1/4">
                    <div className={`rounded-2xl flex flex-col h-[340px] p-0 overflow-hidden relative ${item.bg}`}>
                      <img src={item.img} alt={item.title} className="absolute inset-0 w-full h-full object-cover object-center opacity-80" />
                      <div className="relative z-10 flex flex-col justify-between h-full p-6">
                        <div className="flex flex-col gap-2">
                          <span className="inline-block bg-white text-black px-3 py-1 rounded text-xs font-bold w-fit mb-2 shadow">{item.badge}</span>
                          <span className="text-2xl md:text-3xl font-extrabold text-black mb-2 leading-tight">{item.title}</span>
                        </div>
                        <button className="mt-4 px-5 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition w-fit">{item.button}</button>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
          {/* Artisan Carousel Section */}
          <div className="w-full mt-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8">Meet Our Artisans</h2>
            <Carousel
              className="w-full  mx-auto my-4"
              plugins={[Autoplay({ delay: 4000 })]}
            >
              <CarouselContent className="-ml-1 w-full gap-4">
                {
                  (artisan.length > 0
                    ? artisan.map((item, idx) => ({
                      id: item._id || idx,
                      name: `${item.title ? item.title + " " : ""}${item.firstName || ''} ${item.lastName || ''}`.trim() || "Unknown Artisan",
                      date: item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()
                        : "N/A",
                      image: item.profileImage?.url || "/bg-custom-1.jpg",
                      title: item.specializations && item.specializations.length > 0
                        ? item.specializations.join(", ")
                        : "Artisan",
                      subtitle: item.shgName || "",
                      experience: item.yearsOfExperience ? `${item.yearsOfExperience} years experience` : "",
                      location: item.address ? `${item.address.city}, ${item.address.state}` : "",
                      socials: [
                        { icon: "/insta-Tranparent.webp", url: "#" },
                        { icon: "/fb.png", url: "#" },
                        { icon: "/google.png", url: "#" },
                        { icon: "/website.png", url: "#" }
                      ],
                    }))
                    : [
                      {
                        id: 1,
                        name: "Aanya Sharma",
                        date: "17 FEB 2025",
                        image: "/bg-custom-1.jpg",
                        title: "Chic & Unique: Personalized Fashion Finds",
                        socials: [
                          { icon: "/insta-Tranparent.webp", url: "#" },
                          { icon: "/facebook.png", url: "#" },
                          { icon: "/google.png", url: "#" },
                        ],
                      },
                      {
                        id: 2,
                        name: "Riya & Meera",
                        date: "19 FEB 2025",
                        image: "/bg-custom-2.jpg",
                        title: "Dress to Impress: Elevate Your Everyday Style",
                        socials: [
                          { icon: "/insta-Tranparent.webp", url: "#" },
                          { icon: "/facebook.png", url: "#" },
                          { icon: "/google.png", url: "#" },
                        ],
                      },
                      {
                        id: 3,
                        name: "Kabir & Tara",
                        date: "21 FEB 2025",
                        image: "/bg-custom-3.jpg",
                        title: "Street Style Safari: Global Fashion Influences",
                        socials: [
                          { icon: "/insta-Tranparent.webp", url: "#" },
                          { icon: "/facebook.png", url: "#" },
                          { icon: "/google.png", url: "#" },
                        ],
                      },
                      {
                        id: 4,
                        name: "Priya Kapoor",
                        date: "25 FEB 2025",
                        image: "/bg-custom-4.jpg",
                        title: "Fashion & Beauty: The Ultimate Style Guide",
                        socials: [
                          { icon: "/insta-Tranparent.webp", url: "#" },
                          { icon: "/facebook.png", url: "#" },
                          { icon: "/google.png", url: "#" },
                        ],
                      },
                    ]
                  ).map((artisan, idx) => (
                    <CarouselItem
                      key={artisan.id}
                      className="pl-1 md:basis-1/2 lg:basis-1/4 min-w-0 snap-start"
                    >
                      <div className="relative rounded-2xl overflow-hidden shadow-md group transition-all h-full flex flex-col bg-[#fbeff2]">
                        {/* Date Badge */}
                        <div className="absolute top-5 left-5 z-20 flex items-center gap-2">
                          <span className="w-4 h-4 bg-white border-2 border-[#e84393] rounded-full flex items-center justify-center"><span className="w-2 h-2 bg-black rounded-full"></span></span>
                          <span className="bg-white rounded px-3 py-1 text-xs font-bold shadow text-gray-800">{artisan.date}</span>
                        </div>
                        {/* Card Image */}
                        <div className="relative w-full h-96">
                          <Image
                            src={artisan.image}
                            alt={artisan.name}
                            fill
                            className="object-cover w-full h-full"
                          />
                        </div>
                        {/* Card Content Overlay */}
                        <div className="absolute left-0 bottom-0 w-full flex justify-between items-end p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                          <div>
                            <h3 className="font-bold text-2xl text-white mb-3 leading-tight drop-shadow-md">
                              {artisan.name}
                            </h3>
                          </div>
                          {/* Arrow Button with Socials on Hover */}
                          <div className="relative group/arrow">
                            <button className="bg-white text-black rounded-full w-12 h-12 flex items-center justify-center shadow transition group-hover/arrow:bg-[#e84393] group-hover/arrow:text-white">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                            {/* Social Icons: show on arrow hover */}
                            <div className="absolute bottom-14 right-0 flex flex-col gap-4 opacity-0 group-hover/arrow:opacity-100 transition-opacity duration-300 z-30 items-center">
                              {artisan.socials.slice(0, 5).map((s, i) => (
                                <a
                                  key={i}
                                  href={s.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`
        bg-white rounded-full w-12 h-12 flex items-center justify-center shadow hover:bg-gray-100 transition
        transform translate-y-5 group-hover/arrow:translate-y-0
      `}
      style={{
        transitionProperty: 'transform, opacity, background-color, box-shadow',
        transitionDuration: '0.6s',
        transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)',
        transitionDelay: `${i * 60}ms`
      }}  
                                >
                                  <img src={s.icon} alt="social" className="w-7 h-7" />
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
              </CarouselContent>
              {/* <CarouselPrevious /> */}
              {/* <CarouselNext /> */}
            </Carousel>
          </div>

          {/* Blog Section with full-width background */}
          {!isBlogsLoading && blogs && blogs.length > 0 && (
            <div className="w-full flex flex-col items-center mt-12">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold w-full text-center md:pt-10">
                Our Blog
              </h1>
              <p className="text-gray-600 py-8 text-center font-barlow w-[80%] mx-auto">
                Stay ahead of the curve with Trending Packages – The Best,
                Today. We bring you a curated selection of the most popular,
                high-value deals and experiences that are capturing attention
                right now. From must-have products to top-rated services, each
                package is handpicked for quality, relevance, and impact.
                Updated daily to reflect what’s hot and happening, it’s your
                go-to source for discovering what’s trending – and making the
                most of it. Don’t just follow the trend, be part of it.
              </p>
              {/* Two Promotional Banners */}
              <div className="w-full flex flex-col md:flex-row gap-4 mb-8">
                {/* First Banner */}
                {blogs.length > 0 && (
                  <div className="w-full md:w-1/2 bg-amber-100 rounded-lg overflow-hidden relative">
                    <div className="flex h-[250px]">
                      {/* <div className="text-sm font-semibold mb-1">STAY 4 NIGHTS</div> */}
                      <div className="w-1/2 p-4 flex flex-col justify-center">
                        <div className="absolute top-2 left-2 text-gray-700 bg-yellow-400 text-xs font-bold px-2 py-1 rounded">
                          {blogs?.[0]?.date?.slice(0, 10) || ""}
                        </div>
                        {/* NameCode and Role in one row, spaced between */}
                        <div className="flex flex-row items-center justify-between mb-1">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">
                            {blogs?.[0]?.nameCode}
                          </span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">
                            {blogs?.[0]?.role}
                          </span>
                        </div>
                        <div className="text-2xl md:text-3xl font-black mb-2">
                          {blogs?.[0]?.title}
                        </div>
                        <p className="text-xs md:text-sm mb-4">
                          {blogs?.[0]?.shortDesc?.split(" ").length > 18
                            ? blogs?.[0]?.shortDesc
                              .split(" ")
                              .slice(0, 18)
                              .join(" ") + "..."
                            : blogs?.[0]?.shortDesc}
                        </p>
                        <a
                          href={blogs?.[0]?.url ? blogs?.[0].url : "#"}
                          className="bg-black text-white text-xs font-bold py-2 px-4 inline-block w-fit rounded"
                        >
                          Read More
                        </a>
                      </div>
                      <div className="w-1/2 relative">
                        <Image
                          src={
                            blogs?.[0]?.image
                              ? blogs?.[0].image
                              : "https://images.unsplash.com/photo-1506744038136-46273834b3fb"
                          }
                          alt={
                            blogs?.[0]?.title
                              ? blogs?.[0].title
                              : "Promotional offer"
                          }
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {/* Second Banner */}
                {blogs.length > 1 && (
                  <div className="w-full md:w-1/2 bg-gray-900 text-white rounded-lg overflow-hidden relative">
                    <div className="flex h-[250px]">
                      <div className="w-1/2 p-4 flex flex-col justify-center">
                        {/* <div className="text-sm font-semibold mb-1">MEMBER GET</div> */}
                        <div className="absolute top-2 left-2 text-gray-700 bg-yellow-400 text-xs font-bold px-2 py-1 rounded">
                          {blogs?.[1]?.date?.slice(0, 10) || ""}
                        </div>
                        {/* NameCode and Role in one row, spaced between */}
                        <div className="flex flex-row items-center justify-between mb-1">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">
                            {blogs?.[1]?.nameCode}
                          </span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">
                            {blogs?.[1]?.role}
                          </span>
                        </div>
                        <div className="text-2xl md:text-3xl font-black text-amber-400 mb-2">
                          {blogs?.[1]?.title}
                        </div>
                        <p className="text-xs md:text-sm mb-4">
                          {blogs?.[1]?.shortDesc?.split(" ").length > 18
                            ? blogs?.[1]?.shortDesc
                              .split(" ")
                              .slice(0, 18)
                              .join(" ") + "..."
                            : blogs?.[1]?.shortDesc}
                        </p>
                        <a
                          href={blogs?.[1]?.url ? blogs?.[1].url : "#"}
                          className="border border-white text-white text-xs font-bold py-2 px-4 inline-block w-fit rounded"
                        >
                          Read More
                        </a>
                      </div>
                      <div className="w-1/2 relative">
                        <Image
                          src={
                            blogs?.[1]?.image
                              ? blogs?.[1].image
                              : "https://images.unsplash.com/photo-1506744038136-46273834b3fb"
                          }
                          alt={
                            blogs?.[1]?.title
                              ? blogs?.[1].title
                              : "Member discount"
                          }
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <Carousel className="w-full">
                <CarouselContent className="sm:-ml-4 flex  px-1 sm:px-0">
                  {blogs.slice(2).map((blog, idx) => (
                    <CarouselItem
                      key={blog._id || idx}
                      className="basis-[85vw] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 max-w-xs sm:max-w-sm md:max-w-md flex-shrink-0"
                    >
                      <div className="bg-white rounded-xl shadow p-4 flex flex-col h-full relative overflow-y-auto max-h-[90vh]">
                        <div className="relative w-full h-40 sm:h-48 mb-3 rounded-lg overflow-hidden">
                          <Image
                            src={
                              blog.image ||
                              "https://images.unsplash.com/photo-1506744038136-46273834b3fb"
                            }
                            alt={blog.title}
                            fill
                            className="object-cover w-full h-full"
                          />
                          <div className="absolute top-2 left-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded">
                            {blog.date?.slice(0, 10) || ""}
                          </div>
                        </div>
                        {/* NameCode and Role in one row, spaced between */}
                        <div className="flex flex-row items-center justify-between mb-1">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">
                            {blog.nameCode}
                          </span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">
                            {blog.role}
                          </span>
                        </div>
                        {/* Title below */}
                        <div className="font-semibold text-lg md:text-xl mb-1 line-clamp-2">
                          {blog.title}
                        </div>
                        {/* shortDesc limited to 18 words */}
                        <div className="text-xs text-gray-600 mb-2 flex-grow">
                          {blog.shortDesc &&
                            blog.shortDesc.split(" ").length > 18
                            ? blog.shortDesc.split(" ").slice(0, 18).join(" ") +
                            "..."
                            : blog.shortDesc}
                        </div>
                        <a
                          href={blog.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-yellow-400 text-white px-4 py-2 rounded text-xs font-bold w-fit mt-auto"
                        >
                          READ MORE
                        </a>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          )}
          {/* Instagram-like Image Carousel using Carousel classes */}
          {!isInstaLoading && !isFbLoading && allPosts.length > 0 && (
            <div className="w-full flex flex-col items-center mt-12">
              <h2 className="text-center font-bold text-2xl md:text-3xl lg:text-4xl">
                Don’t just watch the trends — live them!
              </h2>
              <p className="text-gray-600 py-8 text-center font-barlow w-[80%] mx-auto">
                Follow us on social media for your daily dose of Trending
                Packages, exclusive offers, behind-the-scenes peeks, and
                real-time updates. Join our community of trendsetters and be the
                first to explore what’s new, what’s hot, and what everyone’s
                talking about. Your next favorite find is just a follow away!
              </p>
              <Carousel>
                <CarouselContent>
                  {allPosts.map((post, idx) => (
                    <CarouselItem
                      key={post._id || idx}
                      className={`pl-1 ${allPosts.length <= 3 ? cardBasis : "md:basis-1/5"
                        }`}
                      style={
                        allPosts.length <= 3
                          ? { minWidth: `calc(100%/${allPosts.length})` }
                          : {}
                      }
                    >
                      <div className="relative group rounded-lg overflow-hidden w-full h-60  md:h-52 bg-gray-100">
                        <Image
                          src={post.image}
                          alt={`${post.type === "facebook" ? "Facebook" : "Instagram"
                            } ${idx}`}
                          width={400}
                          height={400}
                          className="object-cover md:object-cover w-full h-full"
                        />
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                        >
                          {post.type === "facebook" ? (
                            <img
                              src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
                              alt="Facebook"
                              className="w-10 h-10 opacity-80"
                            />
                          ) : (
                            <img
                              src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
                              alt="Instagram"
                              className="w-10 h-10 opacity-80"
                            />
                          )}
                        </a>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          )}
          {/* Quick View Modal */}
          {quickViewProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setQuickViewProduct(null)}>
              <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full relative overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                {/* Close Button */}
                <button
                  className="absolute top-4 right-4 text-2xl font-bold text-gray-500 hover:text-black focus:outline-none"
                  onClick={() => setQuickViewProduct(null)}
                  aria-label="Close quick view"
                >
                  &times;
                </button>
                <QuickViewProductCard product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RandomTourPackageSection;
