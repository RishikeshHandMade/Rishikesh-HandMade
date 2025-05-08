"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkle, ChevronLeft, ChevronRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import toast from "react-hot-toast";
import { Skeleton } from "./ui/skeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSearch } from "@/context/SearchContext";
import { CalendarClock, MapPin, Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const HeroSection = () => {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [api, setApi] = useState();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: false }));

  const dummyBanners = [
    {
      title: "Welcome",
      subTitle: "Explore Our Collection",
      image: { url: "https://dummyimage.com/1280x720/000/fff" },
      link: "/"
    },
    {
      title: "Discover",
      subTitle: "Find Amazing Deals",
      image: { url: "https://dummyimage.com/1280x720/333/fff" },
      link: "/products"
    },
    {
      title: "Shop Now",
      subTitle: "Limited Time Offers",
      image: { url: "https://dummyimage.com/1280x720/666/fff" },
      link: "/offers"
    },
  ];

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch("/api/addBanner");
        const data = await response.json();
        setBanners(data.length ? data : dummyBanners);
      } catch (error) {
        toast.error("Failed to fetch banners");
        setBanners(dummyBanners);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setSelectedIndex(api.selectedScrollSnap());
    });
  }, [api]);

  const [query, setQuery] = useState("");
  const [relatedPackages, setRelatedPackages] = useState([]);
  const [packages, setPackages] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const { isSearchOpen, setIsSearchOpen } = useSearch();
  const router = useRouter();

  useEffect(() => {
    const storedSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
    setRecentSearches(storedSearches);

    const fetchPackages = async () => {
      try {
        const res = await fetch("/api/getSearchPackages");
        const data = await res.json();
        if (data.packages && data.packages.length > 0) {
          setPackages(data.packages);
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
      }
    };

    fetchPackages();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "k") {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearch = async (event) => {
    const value = event.target.value;
    setQuery(value);

    if (value.trim().length < 2) {
      setRelatedPackages([]);
      return;
    }

    try {
      const res = await fetch(`/api/packages/search?q=${value}`);
      if (res.ok) {
        const data = await res.json();
        setRelatedPackages(data);
      } else {
        setRelatedPackages([]);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      setRelatedPackages([]);
    }
  };

  const handlePackageClick = (id, name) => {
    const updatedSearches = [{ id, name }, ...recentSearches.filter(item => item.id !== id)].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));

    router.push(`/package/${encodeURIComponent(id)}`);
    setIsSearchOpen(false);
  };

  const handleSubmit = () => {
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setIsSearchOpen(false);
  };

  const clearRecentSearches = () => {
    localStorage.removeItem("recentSearches");
    setRecentSearches([]);
  };

  if (isLoading) {
    return (
      <section className="relative xl:h-screen w-full overflow-hidden z-[160]">
        <Carousel className="h-full w-full" plugins={[plugin.current]} onMouseLeave={plugin.current.reset}>
          <CarouselContent className="h-full">
            {[...Array(4)].map((_, index) => (
              <CarouselItem key={index} className="h-[100vh] md:h-full">
                <div className="relative h-full w-full">
                  <Skeleton className="h-[100vh] w-full" />
                  <div className="absolute translate-y-1/2 top-1/3 translate-x-1/2 right-1/2 z-20 w-full">
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                  </div>
                  <div className="absolute translate-y-1/2 bottom-1/2 translate-x-1/2 right-1/2 z-20 w-full">
                    <Skeleton className="h-12 w-3/4 mx-auto" />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>
    );
  }

  return (
    <section className="relative xl:h-screen w-full overflow-hidden z-0 group">
      <div className="hidden xl:block w-full h-full">
        <Carousel
          className="h-full w-full"
          plugins={[plugin.current]}
          onMouseLeave={plugin.current.reset}
          setApi={setApi}
        >
          <CarouselContent className="h-full">
            {banners.map((item, index) => (
              <CarouselItem key={index} className="h-[100vh] md:h-full">
                <Link href={item.link || "#"} className="block h-full w-full">
                  <div className="relative h-full w-full">
                    <Image
                      src={item?.image?.url}
                      alt={item?.title || "Banner Image"}
                      width={1280}
                      height={720}
                      quality={100}
                      priority
                      className="h-[100vh] w-full object-cover"
                    />
                    {item.subTitle || item.title ? (
                      <>
                        <div className="absolute translate-y-1/2 top-1/3 translate-x-1/2 right-1/2 z-20">
                          <h2 className="flex items-center gap-4 text-white text-lg md:text-xl lg:text-2xl text-center">
                            <Sparkle className="hidden md:block size-4 md:size-6" />
                            {item.subTitle}
                            <Sparkle className="hidden md:block size-4 md:size-6" />
                          </h2>
                        </div>
                        <div className="absolute translate-y-1/2 bottom-1/2 translate-x-1/2 right-1/2 z-20 w-full">
                          <h2 className="text-white font-bold text-3xl md:text-5xl lg:text-7xl text-center">
                            {item.title}
                          </h2>
                        </div>
                      </>
                    ) : null}
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation Arrows */}
          <CarouselPrevious className="left-4 md:left-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CarouselNext className="right-4 md:right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Carousel>

        {/* Custom Pagination Dots */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${index === selectedIndex ? "bg-white w-6" : "bg-white/50"
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

      </div>

      <div className="block xl:hidden w-full h-full px-4 mt-[20%] relative max-h-[90vh]">
      <h2 className="text-2xl font-bold text-center mb-1">Search Where to Go</h2>
            <p className="text-gray-600 text-center w-[80%] mx-auto mb-4">Every soul has a path—find yours. From sacred mountains to hidden shrines, your spiritual journey begins with a single search. Discover destinations that inspire, heal, and uplift. Start now—your path to peace and purpose awaits.</p>
        <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <DialogTrigger asChild>
            
            <div
              className="w-full border-2 border-blue-600 rounded-full px-6 py-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer text-left text-gray-700 flex items-center gap-2"
              onClick={() => setIsSearchOpen(true)}
            >
            
              <Search className="h-6 w-6 text-gray-600" />
              <span className={query ? "text-gray-900" : "text-gray-400"}>
                {query ? query : "Destination, Attraction"}
              </span>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[60vh] font-barlow p-4 overflow-y-auto">
            <div className="relative mt-6">
              <Search className="absolute left-3 top-4 h-6 w-6 text-gray-600" />
              <Input
                type="text"
                value={query}
                onChange={handleSearch}
                placeholder="Destination, Attraction"
                className="px-10 !py-6 flex-1 w-full placeholder:font-normal placeholder:text-gray-600 border-2 border-blue-600  focus-visible:ring-0 rounded-full shadow-none focus:ring-0 outline-none"
              />
            </div>

            {/* Show Search Results first if available */}
            {query && relatedPackages.length > 0 && (
              <>
                <h2 className="mt-4 text-xl font-medium mb-2 font-barlow">Search Results: {query}</h2>
                <ul className="mt-2 border rounded-md shadow-sm bg-white max-h-[25rem] overflow-y-auto">
                  {relatedPackages.map((pkg, index) => (
                    <li
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-4"
                      onClick={() => handlePackageClick(pkg?._id, pkg?.packageName)}
                    >
                      <Image
                        src={typeof pkg?.basicDetails?.thumbnail?.url === "string" && pkg.basicDetails.thumbnail.url.trim() !== "" ? pkg.basicDetails.thumbnail.url : "/placeholder.jpg"}
                        width={1280} height={720} quality={50}
                        alt={pkg?.packageName}
                        className="w-24 h-24 rounded-md object-cover"
                      />
                      <div>
                        <p className="font-medium">{pkg?.packageName}</p>
                        <p className="text-xs flex items-center font-medium text-gray-500">
                          <MapPin className="h-4 w-4 mr-1 mt-1 " />
                          {pkg?.basicDetails?.location}
                        </p>
                        
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {/* Show You Might Also Like only if there are packages and either no search or no results */}
            {(!query || relatedPackages.length === 0) && packages && packages.length > 0 && (
              <>
                <h2 className="mt-4 text-xl font-medium mb-2 font-barlow">You Might Also Like</h2>
                <ul className="border rounded-md shadow-sm bg-white max-h-[25rem] overflow-y-auto">
                  {packages.map((pkg, index) => (
                    <li
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-4"
                      onClick={() => handlePackageClick(pkg?._id, pkg?.packageName)}
                    >
                      <Image
                        src={typeof pkg?.basicDetails?.thumbnail?.url === "string" && pkg.basicDetails.thumbnail.url.trim() !== "" ? pkg.basicDetails.thumbnail.url : "/placeholder.jpg"}
                        width={1280} height={720} quality={50}
                        alt={pkg?.packageName}
                        className="w-20 h-20 rounded-md object-cover"
                      />
                      <div className="flex items-end gap-4 w-full">
                        <div>
                          <p className="font-semibold text-lg">{pkg?.packageName}</p>
                          <p className="flex flex-row items-center justify-between gap-2 font-barlow text-blue-600 text-sm font-semibold">
                            <span className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {pkg?.basicDetails?.location}
                            </span>
                            <span className="flex items-center gap-2">
                              <CalendarClock className="h-4 w-4" />
                              {pkg?.basicDetails?.duration} Days {pkg?.basicDetails?.duration - 1} Nights
                            </span>
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500">Recent Packages</p>
                <ul className="mt-2 border rounded-md shadow-sm bg-white">
                  {recentSearches.map((search, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handlePackageClick(search.id, search.name)}
                    >
                      <span>{search.name}</span>
                      <X className="h-4 w-4 text-gray-400 hover:text-red-500" onClick={(e) => {
                        e.stopPropagation();
                        const filteredSearches = recentSearches.filter(item => item.id !== search.id);
                        setRecentSearches(filteredSearches);
                        localStorage.setItem("recentSearches", JSON.stringify(filteredSearches));
                      }} />
                    </li>
                  ))}
                </ul>
                <button onClick={clearRecentSearches} className="text-sm text-red-500 mt-2 hover:underline">
                  Clear recent searches
                </button>
              </div>
            )}
            <div className="sticky bottom-4 pb-4 translate-y-1/2  w-full bg-white">
              <Button onClick={handleSubmit} className="w-full uppercase text-base mt-4 bg-blue-600 hover:bg-blue-700 mx-auto">Search</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

    </section>
  );
};

export default HeroSection;