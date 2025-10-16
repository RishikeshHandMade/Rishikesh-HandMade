"use client";

import { ChevronsLeft, ChevronsRight, MapPinIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";

const AboutUsSection = () => {
    const [featuredPackages, setFeaturedPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loading1, setLoading1] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [bannerSection1st, setBannerSection1st] = useState([]);

    const fetchPackages = async () => {
        try {
            const response = await fetch('/api/featured-packages');
            const data = await response.json();
            // console.log(data);
            setFeaturedPackages(data.data || []); // Use dummy data if API returns empty
        } catch (error) {
            // console.error('Error fetching data:', error);
            setFeaturedPackages([]); // Use dummy data on error
        } finally {
            setIsLoading(false);
            setLoading(false);
        }
    };
    const fetchBannerSection1st = async () => {
        try {
            const response = await fetch('/api/bannerSection1st');
            const data = await response.json();
            // console.log(data);
            setBannerSection1st(data); // Use dummy data if API returns empty
        } catch (error) {
            // console.error('Error fetching data:', error);
            setBannerSection1st([]); // Use dummy data on error
        } finally {
            setIsLoading(false);
            setLoading1(false);
        }
    };
    useEffect(() => {
        fetchPackages();
        fetchBannerSection1st();
    }, []);
    return (
        <>
            <section className="bg-[#ededed] relative py-5 w-full px-5 overflow-hidden max-w-screen overflow-x-hidden">
                <div className="w-full">
                    <h2 className="font-bold text-2xl md:text-4xl text-center mt-7 uppercase">Crafted by Hand, Cherished by Heart.

                    </h2>
                    <p className=" text-xl font-lg md:text-xl text-center mt-2">
                        emphasizes uniqueness, tradition, artistry, and authentic
                    </p>
                    <hr className="h-[2px] w-full md:w-[50%] mx-auto bg-black" />

                    <p className="text-gray-600 py-8 text-center font-barlow  w-full px-2 md:w-[50%] mx-auto">
                        Welcome to Rishikesh Handmade — your gateway to the soulful artistry of the Himalayan foothills. Rooted in the spiritual heart of India, our collection brings together timeless handicrafts handcrafted by local artisans of Rishikesh. Every item is a reflection of our rich cultural heritage, made with love, care, and generations of tradition. From eco-friendly décor and handwoven textiles to sacred spiritual items and unique wooden carvings, each piece tells a story of craftsmanship and connection. By supporting Rishikesh Handmade,
                        <br />
                        you’re not just buying a product — you’re preserving tradition, empowering local artisans, and bringing home a piece of authentic India.
                    </p>
                    <p className="flex items-center text-gray-600 font-barlow font-bold text-sm md:text-lg xl:text-xl mb-4">

                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mx-auto">
                        {loading ? (
                            // Loading skeletons
                            Array.from({ length: 5 }).map((_, idx) => (
                                <div
                                    key={idx}
                                    className="flex flex-col items-center w-42 rounded-3xl animate-pulse"
                                    style={{ padding: "1rem 0 0.5rem 0" }}
                                >
                                    <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden flex items-end justify-center bg-gray-200" />
                                    <div className="mt-4 text-center px-2 w-full flex justify-start">
                                        <span className="block h-6 w-32 rounded bg-gray-200" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            featuredPackages.map((item) => (
                                <div
                                    key={item._id}
                                    className="flex flex-col items-center w-42 mx-auto md:w-80 rounded-3xl group"
                                    style={{ padding: "1rem 0 0.5rem 0" }}
                                >
                                    <div className="relative w-full aspect-[4/5] rounded-2xl border overflow-hidden">
                                        <img
                                            src={item.image.url}
                                            alt={item.title}
                                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <Link
                                            href={item.link}
                                            className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        >
                                            <span className="bg-white text-black font-medium px-4 py-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                View Product
                                            </span>
                                        </Link>
                                    </div>
                                    <div className="mt-4 text-center px-2 w-full flex justify-start">
                                        <Link key={item._id} href={item.link}>
                                            <div className="font-bold text-md md:text-xl text-black hover:underline transition cursor-pointer">{item.title}</div>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>
            <section className="bg-[#ededed] relative w-full">
                {loading1 ? (
                    // Skeleton loader
                    <div className="w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-4">
                            {[...Array(2)].map((_, idx) => (
                                <div
                                    key={idx}
                                    className="h-[220px] md:h-[400px] rounded-2xl overflow-hidden bg-gray-200 animate-pulse"
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    // Actual content
                    bannerSection1st.map((item, idx) => (
                        <div className="w-full" key={item._id}>
                            <div className="grid grid-cols-1 gap-4 md:gap-5 overflow-hidden">
                                <div className="hidden md:flex flex-col h-[430px] overflow-hidden relative group">
                                    <Link
                                        href={item.buttonLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute inset-0 flex items-center justify-center group-hover:opacity-100 transition-opacity duration-300"
                                    >
                                        <img
                                            src={item.image?.url}
                                            alt={item.title}
                                            className="absolute inset-0 w-full h-full md:object-contain object-contain object-center transition-transform duration-300 group-hover:scale-105"
                                        />
                                    </Link>
                                </div>
                                <div className="md:hidden flex flex-col h-[450px] overflow-hidden relative group">
                                    <Link
                                        href={item.buttonLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute inset-0 flex items-center justify-center group-hover:opacity-100 transition-opacity duration-300"
                                    >
                                        <img
                                            src={item.mobileImage?.url}
                                            alt={item.title}
                                            className="absolute inset-0 w-full h-full md:object-contain object-contain object-center transition-transform duration-300 group-hover:scale-105"
                                        />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </section>
        </>
    );
};

export default AboutUsSection;
