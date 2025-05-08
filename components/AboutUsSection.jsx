"use client";

import { ChevronsLeft, ChevronsRight, MapPinIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";

const AboutUsSection = () => {
    const [featuredPackages, setFeaturedPackages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const dummyPackages = [
        {
            _id: "1",
            link: "#",
            image: { url: "https://dummyimage.com/1280x720/000/fff" },
            headerText: "Spiritual Retreat",
            title: "Himalayan Pilgrimage",
            subTitle: "Find peace in the mountains",
            location: "Uttarakhand, India",
            footertext: "A journey to rejuvenate your soul",
        },
        {
            _id: "2",
            link: "#",
            image: { url: "https://dummyimage.com/1280x720/333/fff" },
            headerText: "Divine Experience",
            title: "Temple Tour",
            subTitle: "Sacred sites across India",
            location: "Varanasi, India",
            footertext: "Explore the roots of spirituality",
        },
        {
            _id: "3",
            link: "#",
            image: { url: "https://dummyimage.com/1280x720/666/fff" },
            headerText: "Cultural Journey",
            title: "Ancient Wonders",
            subTitle: "Historical & spiritual landmarks",
            location: "Rajasthan, India",
            footertext: "Step into history and faith",
        },
    ];

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const response = await fetch('/api/featured-packages');
                const data = await response.json();
                // console.log(data);
                setFeaturedPackages(data.length ? data : dummyPackages); // Use dummy data if API returns empty
            } catch (error) {
                console.error('Error fetching data:', error);
                setFeaturedPackages(dummyPackages); // Use dummy data on error
            } finally {
                setIsLoading(false);
            }
        };
        fetchPackages();
    }, []);

    if (isLoading) {
        return (
            <section className="py-14 md:py-36 xl:py-20">
                <div className="relative">
                    <img className="absolute -top-32 left-0 -z-10 lg:scale-[2]" src="/bg-shape.png" alt="background gradient shape" />
                </div>
                <div className="max-w-[22rem] md:max-w-[45rem] lg:max-w-[60rem] xl:max-w-7xl mx-auto">
                    <h2 className="font-bold text-2xl md:text-4xl">
                        <Skeleton className="w-3/4 h-8" />
                    </h2>
                    <div className="text-gray-600 py-8 text-justify font-barlow">
                        <Skeleton className="w-full h-24" />
                    </div>
                    <h4 className="flex items-center text-gray-600 font-barlow font-bold text-sm md:text-lg xl:text-xl mb-4">
                        <Skeleton className="w-10 h-6" />
                        <Skeleton className="w-32 h-6" />
                        <Skeleton className="w-10 h-6" />
                    </h4>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, index) => (
                            <div key={index} className="rounded-2xl group flex flex-col justify-between relative overflow-hidden w-full h-96 p-8">
                                {/* Skeleton for image */}
                                <Skeleton className="w-full h-96 rounded-2xl" />
                                <div className="bg-gradient-to-r from-black/80 via-black/30 to-transparent absolute inset-0"></div>
                                <div className="z-10">
                                    <Skeleton className="w-3/4 h-8 bg-white" />
                                    <Skeleton className="w-2/3 h-6 bg-white mt-2" />
                                    <Skeleton className="w-1/2 h-6 bg-white mt-2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        );
    }

    return (
        <section className="relative py-1 w-full px-10 md:px-8 lg:px-16 overflow-hidden max-w-screen overflow-x-hidden bg-repeat-y bg-[url('/bg-custom-1.jpg')] brightness-145">
            <div className="w-full">
   
                <h2 className="font-bold text-2xl md:text-4xl text-center mt-7">Be a part of a spiritual journey.</h2>
                <p className="text-gray-600 py-8 text-center font-barlow  w-[80%] mx-auto">
                    YatraZone is more than just a travel company; we are facilitators of spiritual exploration and cultural immersion tailored for Indian pilgrims and global adventurers. With years of expertise in pilgrimage tourism within India, we curate authentic and meaningful journeys that resonate with every spiritual seeker.
                    From holy treks in the Himalayas to pilgrimages to ancient temples and sacred sites, we ensure transformative experiences.
                </p>
                <p className="flex items-center text-gray-600 font-barlow font-bold text-sm md:text-lg xl:text-xl mb-4">

                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {featuredPackages.map((item) => (
                        <div key={item._id} className="rounded-2xl group flex flex-col justify-between relative overflow-hidden w-full h-96 p-0">
                            <Image
                                src={item.image.url}
                                width={1280}
                                height={720}
                                priority
                                quality={25}
                                alt={item.title}
                                className="object-cover absolute inset-0 w-full h-96 group-hover:scale-105 transition-transform duration-500 ease-in-out"
                                style={{ width: '100%', height: '100%' }}
                            />
                            {/* Overlay for lighter, full black shade on hover */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                            {/* Text slides up on hover */}
                            <div className="absolute bottom-0 left-0 text-center w-full z-20 translate-y-full group-hover:translate-y-[-30%] opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out">
                                <h1 className="text-white text-xl xl:text-2xl mt-2 font-bold">{item.title}</h1>
                                <Link key={item._id} href={item.link}>
                                    <button className="hover:bg-white hover:text-black text-white font-bold px-4 py-2 rounded-full mt-4 transition duration-300 ease-in-out">
                                        View More
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AboutUsSection;
