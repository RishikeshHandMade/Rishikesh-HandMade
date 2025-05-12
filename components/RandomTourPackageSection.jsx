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

const RandomTourPackageSection = () => {
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [blogs, setBlogs] = useState([]);
  const [isBlogsLoading, setIsBlogsLoading] = useState(true);
  const [instagramPosts, setInstagramPosts] = useState([]);
  const [isInstaLoading, setIsInstaLoading] = useState(true);
  const [facebookPosts, setFacebookPosts] = useState([]);
  const [isFbLoading, setIsFbLoading] = useState(true);

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
    const fetchPackages = async () => {
      try {
        const res = await fetch("/api/getRandomPackages");
        const data = await res.json();
        // console.log(data.packages);

        if (data.packages && data.packages.length > 0) {
          setPackages(data.packages);
        } else {
          setPackages([]);
        }
      } catch (error) {
        // console.error("Error fetching packages:", error);
        setPackages([]);
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

    fetchPackages();
    fetchBlogs();
  }, []);

  if (isLoading) {
    return (
      <section className="md:mt-19 w-full px-2 md:px-8 lg:px-16 bg-[url('/bg-custom-3.jpg')] overflow-hidden max-w-screen overflow-x-hidden">
        <div className=" w-full h-full overflow-hidden max-w-screen overflow-x-hidden">
          <div className="w-full py-10">
            <h2 className="flex items-center text-sm md:text-md lg:text-lg uppercase font-barlow font-semibold"></h2>
            <h1 className="font-bold text-xl md:text-3xl lg:text-4xl uppercase text-center">
              {" "}
              Trending Packages: The Best, Today
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
    <section className=" md:mt-19 w-full px-8 md:px-8 lg:px-16 overflow-hidden max-w-screen overflow-x-hidden">
      <div className=" w-full h-full overflow-hidden max-w-screen ">
        <div className="w-full py-9 px-1 md:px-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mt-10">
            Trending Packages: The Best, Today
          </h1>
          <p className=" text-gray-600 py-8 text-center font-barlow w-[80%] mx-auto">
            Discover the hottest deals with our Trending Packages! Curated
            daily, these top-rated picks offer the best value and quality —
            handpicked for professionals who demand the best, today. Don’t miss
            out — elevate your experience now!
          </p>
          <Carousel
            className={`w-full md:w-[95%]  mx-auto my-4 ${packages.length > 0 ? "block" : "hidden"}`}
          >
            <CarouselContent className="-ml-1 w-full ">
              {packages.length > 0 &&
                packages.map((item, index) => (
                  <CarouselItem
                    key={index}
                    className="pl-1 md:basis-1/2 lg:basis-1/4 min-w-0 snap-start"
                  >
                    <div className="p-1">
                      <Card>
                        <CardContent className=" rounded-2xl p-0 flex flex-col justify-between relative overflow-hidden group transition-all">
                          {/* 20% OFF Tag */}
                          <div className="absolute top-4 left-4 z-10">
                            <div className="bg-transparent rounded-full px-4 py-1 text-xs font-bold shadow">
                              GET 20% OFF
                            </div>
                          </div>
                          {/* Heart/Wishlist Button - Top Right */}
                          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full bg-transparent hover:bg-gray-100 transition-colors duration-300 h-9 w-9 shadow"
                            >
                              <Heart size={20} className="text-gray-700" />
                            </Button>
                            {/* Shopping Cart Button - Below Heart */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full bg-transparent hover:bg-gray-100 transition-colors duration-300 h-9 w-9 shadow"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-gray-700"
                              >
                                <circle cx="8" cy="21" r="1" />
                                <circle cx="19" cy="21" r="1" />
                                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                              </svg>
                            </Button>
                          </div>
                          {/* Main Image */}
                          <div className="relative w-full h-72 md:h-80 rounded-xl overflow-hidden flex items-center justify-center">
                            <Image
                              src={item?.basicDetails?.thumbnail?.url || "/RandomTourPackageImages/u1.jpg"}
                              alt={item?.packageName || "Tour package image"}
                              width={400}
                              height={400}
                              quality={60}
                              className="object-cover w-full h-full rounded-xl transition-transform duration-300 group-hover:scale-105"
                            />
                            {/* Quick View Button - Slide Up from Bottom on Hover */}
                            <div className="absolute left-0 right-0 bottom-0 flex items-center justify-center translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 py-4">
                              <Button
                                onClick={() => (window.location.href = `/package/${item._id}`)}
                                className="bg-black text-white hover:bg-gray-800 transition-colors duration-300 uppercase text-sm font-bold px-8 py-3 rounded-full shadow-lg"
                              >
                                QUICK VIEW
                              </Button>
                            </div>
                          </div>
                          {/* Bottom Info Section */}
                          <div className="flex items-center justify-between px-4 pt-2 pb-0 mb-0 bg-transparent">
                            <div className="flex flex-col">
                              <span className="font-bold text-base md:text-lg text-gray-900 leading-tight max-w-[160px] truncate">
                                {item?.packageName}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-lg text-gray-900">₹{formatNumeric(item?.price)}</span>
                            </div>
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
                      <div className="bg-white rounded-xl shadow p-4 flex flex-col h-full relative overflow-hidden group">
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
                      className={`pl-1 ${
                        allPosts.length <= 3 ? cardBasis : "md:basis-1/5"
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
                          alt={`${
                            post.type === "facebook" ? "Facebook" : "Instagram"
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
        </div>
      </div>
    </section>
  );
};

export default RandomTourPackageSection;
