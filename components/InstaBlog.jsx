"use client"
import React from 'react'
import Link from "next/link";
import { useEffect, useState } from "react"
import ViewNews from "./ViewNews";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
const InstaBlog = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [blogs, setBlogs] = useState([]);
    const [isBlogsLoading, setIsBlogsLoading] = useState(true);
    const [instagramPosts, setInstagramPosts] = useState([]);
    const [isInstaLoading, setIsInstaLoading] = useState(true);
    const [facebookPosts, setFacebookPosts] = useState([]);
    const [isFbLoading, setIsFbLoading] = useState(true);
    const [news, setNews] = useState([])
    const [quickViewNews, setQuickViewNews] = useState(null); // For news modal
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
    const fetchNews = async () => {
        try {
            const res = await fetch("/api/addNews");
            const data = await res.json();
            // console.log("News API response:", data);
            if (data && data.length > 0) {
                setNews(data);
            } else {
                setNews([]);
            }
        } catch (error) {
            // console.error("Error fetching products:", error);
            setNews([]);
        } finally {
            setIsLoading(false);
        }
    };
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
    useEffect(() => {
        fetchBlogs();
        fetchFacebookPosts();
        fetchNews();
        fetchInstagramPosts();
    }, [])

    // Combine both Instagram and Facebook posts for the card section
    const allPosts = [...instagramPosts, ...facebookPosts];

    // Determine card width based on number of posts
    const cardBasis =
        allPosts.length <= 3 ? `basis-1/${allPosts.length}` : "md:basis-1/5";

    return (
        <div className='bg-[#fcf7f1] md:mt-19 w-full px-4 overflow-hidden max-w-screen overflow-x-hidden py-9'>
            {/*Blogs /  News & Announcement Section */}
            <div className="w-full flex flex-col items-center mb-12">
                <div className="w-full flex flex-col md:flex-row gap-8 min-h-[350px]">
                    <div className="flex flex-col md:flex-row w-full gap-8">
                        {/* Blogs Section */}

                        {!isBlogsLoading && blogs && blogs.length > 0 && (
                            <div className="flex-1 bg-[#fcf7f1] rounded-lg flex flex-col justify-between min-h-[350px] px-5 md:px-10">
                                <h2 className="text-3xl font-bold mb-4 uppercase">Upcoming News, Blog and Events</h2>
                                <p className="text-gray-800 mb-8 text-lg md:text-md font-medium">
                                    "We're preparing exciting new content and updates for our users, including upcoming news and events. We’re working behind the scenes to bring you fresh news, upcoming events, and new features to enhance your experience.
                                    <br /><br />
                                    Stay connected — great things are coming soon!"
                                </p>
                                <div className="w-full mx-auto md:max-w-7xl mb-8 p-1 md:p-2">
                                    <Carousel className="w-full" plugins={[Autoplay({ delay: 4000 })]}>
                                        <CarouselContent className="">
                                            {blogs.map((blog, idx) => {
                                                // Determine media (YouTube or image)
                                                let mediaUrl = blog.image || (Array.isArray(blog.images) && blog.images.length > 0 ? blog.images[0].url || blog.images[0] : undefined) || blog.youtubeUrl;
                                                let isYoutube = false;
                                                let embedUrl = '';
                                                if (mediaUrl && /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(mediaUrl)) {
                                                    isYoutube = true;
                                                    embedUrl = mediaUrl;
                                                    if (embedUrl.includes('youtube.com/watch?v=')) {
                                                        const videoId = embedUrl.split('v=')[1].split('&')[0];
                                                        embedUrl = `https://www.youtube.com/embed/${videoId}`;
                                                    } else if (embedUrl.includes('youtu.be/')) {
                                                        const videoId = embedUrl.split('youtu.be/')[1].split(/[?&]/)[0];
                                                        embedUrl = `https://www.youtube.com/embed/${videoId}`;
                                                    }
                                                }
                                                return (
                                                    <CarouselItem key={blog._id || idx} className="w-full">
                                                        <div className="flex flex-col md:flex-row bg-[#FFF3C9] rounded-xl min-h-[220px] w-full overflow-hidden">
                                                            {/* Image/Video section */}
                                                            <div className="w-full h-40 md:w-2/5 md:h-auto flex items-center justify-center rounded-t-xl md:rounded-l-xl md:rounded-t-none overflow-hidden">
                                                                {isYoutube ? (
                                                                    <div className="w-full h-full aspect-video overflow-hidden flex items-center justify-center">
                                                                        <iframe
                                                                            src={embedUrl}
                                                                            title={blog.title}
                                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                            allowFullScreen
                                                                            className="w-full h-full min-h-[160px] max-h-[220px] border-0"
                                                                        />
                                                                    </div>
                                                                ) : mediaUrl ? (
                                                                    <img
                                                                        src={mediaUrl}
                                                                        alt={blog.title}
                                                                        className="object-cover w-full h-full max-h-[220px]"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                                                                        No Image
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {/* Content section */}
                                                            <div className="flex flex-col justify-between p-2 md:p-4 flex-1 rounded-b-xl md:rounded-r-xl md:rounded-b-none">
                                                                <div>
                                                                    <div className="font-bold text-base md:text-xl text-black mb-2 leading-snug">{blog.title || 'No title available.'}</div>
                                                                    <div className="text-gray-800 text-sm md:text-base mb-1 md:mb-2 line-clamp-3 min-h-[48px] overflow-y-auto">{blog.shortDescription || blog.shortDesc || 'No description available.'}</div>
                                                                </div>
                                                                <div className="flex items-center mt-auto">
                                                                    <Link
                                                                        href={`/blogs/${blog._id}`}
                                                                        rel="noopener noreferrer"
                                                                        className="text-gray-700 font-semibold hover:underline flex items-center group transition focus:outline-none text-sm md:text-base"
                                                                    >
                                                                        Read More  &gt;
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CarouselItem>
                                                );
                                            })}
                                        </CarouselContent>
                                        <div className="flex items-center gap-2 mt-2 md:mt-0 justify-center md:justify-end">
                                            <CarouselPrevious className="bg-black text-white py-2 px-3 font-bold rounded hover:bg-gray-800 transition-colors text-base md:text-lg" />
                                            <CarouselNext className="bg-black text-white py-2 px-3 font-bold rounded hover:bg-gray-800 transition-colors text-base md:text-lg" />
                                        </div>
                                    </Carousel>
                                </div>
                                <Link href="/blogs">
                                    <button className="w-full bg-black text-white py-3 font-bold rounded hover:bg-gray-800 transition-colors text-lg">
                                        Read More
                                    </button>
                                </Link>
                            </div>
                        )}
                        {/* News box */}
                        {news && news.length > 0 && (
                            <div className="flex-1 bg-[#fcf7f1] rounded-lg p-4 flex flex-col min-h-[350px] border border-black">
                                <div className="flex-1 pr-2 mb-4">
                                    <div className="font-bold text-2xl mb-4 px-2">Latest News</div>
                                    <div className="h-[400px] overflow-y-auto p-0 border-none rounded-xl">
                                        {news && news.length > 0 ? (
                                            <>
                                                {/* First News - plain heading and description, not in a box */}
                                                <div className="mb-4 px-2">
                                                    <div className="font-bold text-lg md:text-xl mb-1">{news[0].title || 'News'}</div>
                                                    <div className="text-gray-700 mb-1">
                                                        {(() => {
                                                            const desc = news[0].description ?? "";
                                                            const words = desc.trim().split(/\s+/);
                                                            return words.slice(0, 24).join(" ") + (words.length > 24 ? " ..." : "");
                                                        })()} &nbsp;
                                                        <button
                                                            onClick={() => setQuickViewNews(news[0])}
                                                            className="inline-block text-purple-700 hover:underline font-bold mt-1"
                                                        >
                                                            See more
                                                        </button>
                                                    </div>
                                                </div>
                                                {/* Remaining News - alternating color cards */}
                                                <div className="flex flex-col gap-3">
                                                    {news.slice(1).map((item, idx) => {
                                                        const colorClasses = [
                                                            'bg-[#fff7eb] border-[#ffe7c7]', // light orange
                                                            'bg-[#f2fff6] border-[#c7ffe6]', // light green
                                                            'bg-[#f2f6ff] border-[#c7d6ff]'  // light blue
                                                        ];
                                                        const colorIdx = idx % 3;
                                                        return (
                                                            <div
                                                                key={item._id}
                                                                className={`rounded-xl border font-barlow px-4 py-3 ${colorClasses[colorIdx]} shadow-md`}
                                                            >
                                                                <div className="font-bold text-base md:text-lg mb-1">{item.title || 'News'}</div>
                                                                <div className="text-gray-700 mb-2">
                                                                    {(() => {
                                                                        const desc = item.description ?? "";
                                                                        const words = desc.trim().split(/\s+/);
                                                                        return words.slice(0, 30).join(" ") + (words.length > 30 ? " ..." : "");
                                                                    })()}&nbsp;
                                                                    <button
                                                                        onClick={() => setQuickViewNews(item)}
                                                                        className="inline-block text-blue-600 hover:underline font-semibold my-1"
                                                                    >
                                                                        See more
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-gray-500 text-center py-8">No news available at the moment.</div>
                                        )}
                                    </div>
                                </div>
                                <Link href="/contact">
                                    <button className="w-full bg-lime-400 text-black font-bold py-3 rounded hover:bg-lime-500 transition-colors text-lg mt-2">
                                        Get Connected
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Instagram-like Image Carousel using Carousel classes */}
            {!isInstaLoading && !isFbLoading && allPosts.length > 0 && (
                <div className="w-full flex flex-col items-center mt-12">
                    <h2 className="text-center font-bold text-2xl md:text-3xl lg:text-4xl uppercase">
                        Don’t just watch the trends — live them!
                    </h2>
                    <p className="text-gray-600 py-4 text-center font-barlow w-full md:w-[90%] mx-auto">
                        Follow us on social media for your daily dose of Trending
                        Packages, exclusive offers, behind-the-scenes peeks, and
                        real-time updates. Join our community of trendsetters and be the
                        first to explore what’s new, what’s hot, and what everyone’s
                        talking about. Your next favorite find is just a follow away!
                    </p>
                    <div className="w-full px-3">
                        <Carousel className="w-full" plugins={[Autoplay({ delay: 4000 })]}>
                            <CarouselContent >
                                {allPosts.map((post, idx) => (
                                    <CarouselItem
                                        key={post._id || idx}
                                        className={`pl-5 ${allPosts.length <= 3 ? cardBasis : "md:basis-1/5"}`}
                                        style={
                                            allPosts.length <= 3
                                                ? { minWidth: `calc(100%/${allPosts.length})` }
                                                : {}
                                        }
                                    >
                                        <div className="relative group rounded-lg overflow-hidden w-full h-60 md:h-52 bg-gray-100">
                                            <Image
                                                src={post.image}
                                                alt={`${post.type === "facebook" ? "Facebook" : "Instagram"} ${idx}`}
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
                            </CarouselContent >
                            <CarouselPrevious className="absolute left-1 top-1/2 -translate-y-1/2 p-5" />
                            <CarouselNext className="absolute right-1 top-1/2 -translate-y-1/2 p-5" />
                        </Carousel>
                    </div>
                </div>
            )}
            {/* News Quick View Modal */}
            {quickViewNews && (
                <ViewNews news={quickViewNews} onClose={() => setQuickViewNews(null)} />
            )}

        </div>
    )
}

export default InstaBlog