"use client";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import Link from "next/link";

const Banner = () => {
    const [promotinalBanner, setPromotinalBanner] = useState([])
    const [featuredOffer, setFeaturedOffer] = useState([])
    const [isLoading, setIsLoading] = useState(true);
  
    const fetchPromotinalBanner = async () => {
        try {
            const res = await fetch("/api/addPromotinalBanner");
            const data = await res.json();
            // console.log("Promotinal Banner API response:", data);
            if (data && data.length > 0) {
                setPromotinalBanner(data);
            } else {
                setPromotinalBanner([]);
            }
        } catch (error) {
            // console.error("Error fetching products:", error);
            setPromotinalBanner([]);
        } finally {
            setIsLoading(false);
        }
    };
    const fetchFeaturedOffer = async () => {
        try {
            const res = await fetch("/api/addFeaturedOffer");
            const data = await res.json();
            // console.log("Featured Offer API response:", data);
            if (data && data.length > 0) {
                setFeaturedOffer(data);
            } else {
                setFeaturedOffer([]);
            }
        } catch (error) {
            // console.error("Error fetching products:", error);
            setFeaturedOffer([]);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchPromotinalBanner();
        fetchFeaturedOffer();
    }, [])
    return (
        <div className="bg-[#fcf7f1] md:mt-19 w-full px-4 overflow-hidden max-w-screen overflow-x-hidden">
            {/* Promotional Banner Section */}
            {promotinalBanner.length > 0 && (
                <div className="w-full my-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {promotinalBanner.map((item, idx) => (
                            <div key={idx} className="rounded-2xl flex flex-col h-[350px] md:h-[400px] p-0 overflow-hidden relative group">
                                <img src={item?.image?.url} alt={item?.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                <div className="absolute z-10 flex flex-col justify-between gap-2 px-10 p-6 h-full items-start">
                                    {(() => {
                                        const coupon = item.coupon || item.coupons?.coupon;
                                        if (!coupon?.couponCode) return null;

                                        const { percent, amount, couponCode } = coupon;

                                        let offerText;
                                        if (typeof percent === 'number' && percent > 0) {
                                            offerText = <>GET {percent}% OFF</>;
                                        } else if (typeof amount === 'number' && amount > 0) {
                                            offerText = <>GET ₹{amount} OFF</>;
                                        } else {
                                            offerText = <>Special Offer</>;
                                        }

                                        return (
                                            <div className="absolute top-6 left-4 z-10 bg-white rounded-full px-4 py-1 text-sm font-bold shadow text-black tracking-tight" style={{ letterSpacing: 0 }}>
                                                {offerText}
                                            </div>
                                        );
                                    })()}
                                    <span className="text-2xl md:text-5xl font-bold text-black mb-2 leading-tight w-1/2">{item?.title}</span>
                                    <Link href={item?.buttonLink || '#'} target="_blank" rel="noopener noreferrer" className="mt-4 px-10 text-md py-2 bg-black text-white hover:bg-gray-800 transition w-fit">View Now</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Featured Offer For You Section */}
            {featuredOffer.length > 0 && (
                <div className="w-full my-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-5 uppercase">Featured Offer For You</h2>
                    <Carousel className=" w-full max-w-full">
                        <CarouselContent>
                            {featuredOffer.map((item, idx) => (
                                <CarouselItem key={idx} className="px-2 md:basis-1/3 lg:basis-1/4 ml-5">
                                    <div className="rounded-2xl flex flex-col h-[340px] p-0 overflow-hidden relative bg-white group">
                                        <img src={item.image?.url} alt={item.title} className="absolute inset-0 w-full h-full object-cover object-center opacity-80 transition-transform duration-300 group-hover:scale-105" />
                                        <div className="relative z-10 flex flex-col justify-between items-start h-full p-6">
                                            {(() => {
                                                const coupon = item.coupon || item.coupons?.coupon;
                                                if (!coupon?.couponCode) return null;

                                                const { percent, amount, couponCode } = coupon;

                                                let offerText;
                                                if (typeof percent === 'number' && percent > 0) {
                                                    offerText = <>GET {percent}% OFF</>;
                                                } else if (typeof amount === 'number' && amount > 0) {
                                                    offerText = <>GET ₹{amount} OFF</>;
                                                } else {
                                                    offerText = <>Special Offer</>;
                                                }

                                                return (
                                                    <div className="absolute top-6 left-4 z-10 bg-white rounded-full px-4 py-1 text-sm font-bold shadow text-black tracking-tight" style={{ letterSpacing: 0 }}>
                                                        {offerText}
                                                    </div>
                                                );
                                            })()}
                                            <span className="text-2xl md:text-3xl font-extrabold text-black mb-2 leading-tight w-1/2">{item.title}</span>
                                            <Link href={item.buttonLink || '#'} target="_blank" rel="noopener noreferrer" className="mt-4 px-5 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition w-fit">View Now</Link>
                                        </div>
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
    )
}

export default Banner