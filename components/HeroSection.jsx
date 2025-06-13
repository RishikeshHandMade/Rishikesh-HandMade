"use client";
import { useState, useEffect, useRef } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import toast from "react-hot-toast";
import { Skeleton } from "./ui/skeleton";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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

    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    onSelect(); // Set initial selectedIndex

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Sync carousel to selectedIndex when it changes (for pagination dots)
  useEffect(() => {
    if (api && typeof api.scrollTo === "function") {
      api.scrollTo(selectedIndex);
    }
  }, [selectedIndex, api]);

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
        // console.log(data)
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
    <section className="bg-[#fcf7f1] relative xl:h-screen h-full w-full px-2 overflow-hidden z-0 group">
      <div className="hidden xl:block w-full h-screen ">
        {/* Carousel for desktop: each slide shows front image, details, back image in a single row */}
        <div className="flex flex-col items-center justify-center h-screen w-full relative">
          <Carousel className="h-screen w-full" plugins={[plugin.current]} onMouseLeave={plugin.current.reset} setApi={setApi} >
            <CarouselContent className="h-screen">
              {banners.map((banner, index) => (
                <CarouselItem key={index} className="h-screen flex items-center">
                  <div className="flex flex-row items-center justify-center w-full mx-auto h-full">
                    {/* Front Image */}
                    <div className="flex-1 flex items-center justify-end h-full">
                      <img
                        src={banner.frontImg?.url || banner.frontImg?.url || "/placeholder.jpg"}
                        alt={banner.title ? `${banner.title} Front` : "Front"}
                        className="object-cover max-w-lg h-full shadow-lg"
                      />
                    </div>
                    {/* Details Centered */}
                    <div className="bg-[#4C8979] flex flex-col items-center justify-center flex-1 min-w-[300px] py-8 relative h-full">
                      <h1 className="text-5xl md:text-5xl font-bold text-white leading-tight mb-3 text-center px-2">
                        {banner.title || "No Title"}
                      </h1>
                      <div className="text-xl font-semibold text-white mb-2">Price</div>
                      <div className="text-3xl font-extrabold text-white mb-4 flex flex-row items-center gap-3">
                        {/* Discounted price logic: couponAmount > couponPercent > coupon (as number) > just price */}
                        {(() => {
                          // Remove ₹ and commas from price for calculation
                          const priceNum = Number((banner.price || '').replace(/[^\d.]/g, ''));
                          let discounted = priceNum;
                          let hasDiscount = false;
                          if (!isNaN(priceNum) && priceNum > 0) {
                            if (banner.couponAmount && !isNaN(Number(banner.couponAmount)) && Number(banner.couponAmount) > 0) {
                              discounted = priceNum - Number(banner.couponAmount);
                              hasDiscount = true;
                            } else if (banner.couponPercent && !isNaN(Number(banner.couponPercent)) && Number(banner.couponPercent) > 0) {
                              discounted = priceNum - (priceNum * Number(banner.couponPercent)) / 100;
                              hasDiscount = true;
                            }
                          }
                          if (hasDiscount && discounted < priceNum) {
                            return (
                              <span>
                                <del className="text-white font-bold text-3xl mr-2">₹{priceNum.toLocaleString()}</del>
                                <span className="font-bold text-3xl text-white px-2">₹{Math.round(discounted)}</span>
                              </span>
                            );
                          } else {
                            return (
                              <span className="font-bold text-3xl text-white">₹{priceNum ? priceNum.toLocaleString() : "0.00"}</span>
                            );
                          }
                        })()}
                      </div>
                      <div className="flex gap-3 mb-4 justify-center">
                        <a
                          href={banner.addtoCartLink || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`bg-white text-black px-5 py-2 font-bold ${!banner.addtoCartLink ? ' opacity-50 pointer-events-none' : ''}`}
                        >
                          ADD TO CART
                        </a>
                        <a
                          href={banner.viewDetailLink || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`bg-white text-black px-5 py-2 font-bold ${!banner.viewDetailLink ? ' opacity-50 pointer-events-none' : ''}`}
                        >
                          VIEW DETAIL
                        </a>
                      </div>
                      <div className="flex flex-col items-center gap-1 mt-1 mb-2">
                        <div className="text-lg font-bold text-white">{banner.subtitle || "No Subtitle"}</div>
                        <div className="text-base font-semibold text-white tracking-tight px-10 text-center">{banner.subDescription || "No Sub Description"}</div>
                      </div>
                      {/* More Category Circular Button */}
                      {/* <div className="absolute left-1/2 bottom-[-72px] -translate-x-1/2">
                  <button
                    className="relative flex items-center justify-center w-20 h-20 group focus:outline-none"
                    style={{ minWidth: '80px', minHeight: '80px' }}
                    aria-label="Explore More Category"
                  >
           
                    <svg
                      viewBox="0 0 100 100"
                      width="80"
                      height="80"
                      className="absolute top-0 left-0 animate-spin-slow"
                      style={{ animation: 'spin 8s linear infinite' }}
                    >
                      <defs>
                        <path id="circlePath" d="M50,10 a40,40 0 1,1 -0.01,0" />
                      </defs>
                      <text fontSize="11" fill="#222" fontWeight="bold" letterSpacing="2">
                        <textPath href="#circlePath" startOffset="0">
                          MORE CATEGORY • EXPLORE •
                        </textPath>
                      </text>
                    </svg>
             
                    <span className="z-10 flex items-center justify-center w-8 h-8 bg-[#222] rounded-full text-white shadow-lg">
                      <span className="flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <polygon points="6,4 20,12 6,20 6,4" fill="currentColor" />
                        </svg>
                      </span>
                    </span>
                  </button>
                  <style jsx>{`
                    @keyframes spin {
                      100% { transform: rotate(360deg); }
                    }
                    .animate-spin-slow {
                      animation: spin 8s linear infinite;
                    }
                  `}</style>
                </div> */}
                    </div>
                    {/* Back Image */}
                    <div className="flex-1 flex items-center justify-start h-screen">
                      <img
                        src={banner.backImg?.url || banner.backImg?.url || "/placeholder.jpg"}
                        alt={banner.title ? `${banner.title} Back` : "Back"}
                        className="object-cover max-w-lg h-screen shadow-lg"
                      />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          {/* Pagination dots */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === selectedIndex ? "bg-black w-6" : "bg-black/30"}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
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