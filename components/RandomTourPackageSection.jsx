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
import { useCart } from "../context/CartContext";
import { toast } from "react-hot-toast"
import { Star } from 'lucide-react';
import ReviewModal from "./ReviewModal";
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
  // ...existing state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const { addToCart, addToWishlist, removeFromWishlist, wishlist } = useCart();

  // State and effect for fetching all reviews
  const [allReviews, setAllReviews] = useState([]);
  useEffect(() => {
    fetch('/api/promotion')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.promotions)) {
          setAllReviews(data.promotions);
        }
      });
  }, []);
  const [customReview, setcustomReview] = useState([]);
  console.log(customReview)
  useEffect(() => {
    fetch('/api/saveReviews')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.reviews)) {
          setcustomReview(data.reviews);
        }
      });
  }, []);
  const artisanReviews = [...customReview, ...allReviews];
  console.log(allReviews)

  // Normalize reviews to a standard format
  function normalizeReview(review) {
    // Backend reviews (MongoDB)
    if (review.thumb || review.description) {
      return {
        _id: review._id || Math.random().toString(36).substr(2, 9),
        rating: review.rating,
        title: review.title || review.name || 'No Title',
        shortDescription: review.description || review.shortDescription || '',
        image: review.thumb?.url || '/placeholder-user.jpg',
        createdBy: review.name || review.title || 'Anonymous',
      };
    }
    // Static/dummy reviews or other format
    return {
      _id: review._id || Math.random().toString(36).substr(2, 9),
      rating: review.rating,
      title: review.title || 'No Title',
      shortDescription: review.shortDescription || '',
      image: review.image || '/placeholder-user.jpg',
      createdBy: review.createdBy || review.title || 'Anonymous',
    };
  }

  const normalizedReviews = artisanReviews.map(normalizeReview);

  const handleAddToCart = (item) => {
    addToCart({
      id: item._id,
      name: item.title,
      image: item?.gallery?.mainImage || "/RandomTourPackageImages/u1.jpg",
      price: item?.quantity?.variants[0].price,
    }, 1);
    toast.success("Added to cart!");
  };

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
  const [promotinalBanner, setPromotinalBanner] = useState([])
  const [featuredOffer, setFeaturedOffer] = useState([])
  // Prevent background scroll when Quick View is open
  useEffect(() => {
    if (quickViewProduct) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [quickViewProduct]);
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
        // console.log(data);
        // Ensure artisan is always an array
        if (Array.isArray(data)) {
          setArtisan(data);
        } else if (Array.isArray(data.artisans)) {
          setArtisan(data.artisans);
        } else {
          setArtisan([]);
        }
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
        console.log("Featured Offer API response:", data);
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

    fetchProducts();
    fetchBlogs();
    fetchPromotinalBanner();
    fetchFeaturedOffer();
  }, []);

  if (isLoading) {
    return (
      <section className="bg-[#fcf7f1] md:mt-19 w-full px-2 md:px-8 lg:px-16 overflow-hidden max-w-screen overflow-x-hidden">
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
    <section className="bg-[#fcf7f1] md:mt-19 w-full px-4 overflow-hidden max-w-screen overflow-x-hidden">
      <div className=" w-full h-full overflow-hidden max-w-screen ">
        <div className="w-full py-9 px-1 ">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mt-10">
            Trending Products: The Best, Today
          </h1>
          <p className=" text-gray-600 py-8 text-center font-barlow w-[50%] mx-auto">
            Discover the hottest deals with our Trending Products! Curated
            daily, these top-rated picks offer the best value and quality —
            handpicked for professionals who demand the best, today. Don’t miss
            out — elevate your experience now!
          </p>
          <Carousel
            className={`w-full md:w-[95%]  mx-auto my-4 ${products.length > 0 ? "block" : "hidden"}`}
          >
            <CarouselContent className="-ml-1 w-full gap-2">
              {products.length > 0 &&
                products.map((item, index) => (
                  <CarouselItem
                    key={index}
                    className="pl-1  md:basis-1/2 lg:basis-1/4 min-w-0 snap-start"
                  >
                    <div className="flex flex-col w-[290px]">
                      {/* Image Section */}
                      <div className="relative w-full h-96  rounded-3xl overflow-hidden flex items-center justify-center group/image">
                        {/* GET 10% OFF Tag */}
                        <div className="absolute top-6 left-4 z-10">
                          <div className="bg-white rounded-full px-4 py-1 text-sm font-bold shadow text-black tracking-tight" style={{ letterSpacing: 0 }}>
                            GET 10% OFF
                          </div>
                        </div>
                        {/* Heart/Wishlist & Cart Buttons - Top Right */}
                        <div className="absolute top-6 right-6 z-10 flex flex-col gap-4 items-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`rounded-full transition-colors duration-300 h-12 w-12 shadow-none ${wishlist.some(i => i.id === item._id) ? "bg-pink-600 hover:bg-pink-700" : "bg-white hover:bg-[#b3a7a3]"}`}
                            onClick={() => {
                              if (wishlist.some(i => i.id === item._id)) {
                                removeFromWishlist(item._id);
                                toast.success("Removed from wishlist!");
                              } else {
                                addToWishlist({
                                  id: item._id,
                                  name: item.title,
                                  image: item?.gallery?.mainImage || "/RandomTourPackageImages/u1.jpg",
                                  price: item?.quantity?.variants[0].price,
                                  qty: 1
                                });
                                toast.success("Added to wishlist!");
                              }
                            }}
                          >
                            <Heart size={28} className={wishlist.some(i => i.id === item._id) ? "text-white" : "text-pink-600"} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full bg-[#b3a7a3]/80 hover:bg-[#b3a7a3] transition-colors duration-300 h-12 w-12 shadow-none"
                            onClick={() => handleAddToCart(item)}
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
                        <div className="absolute left-0 right-0 bottom-0 flex items-center justify-center translate-y-10 opacity-0 group-hover/image:translate-y-0 group-hover/image:opacity-100 transition-all duration-300 py-4 ">
                          <Button
                            className="bg-black text-white hover:bg-gray-800 transition-colors duration-300 uppercase text-sm font-bold px-8 py-3 rounded-full shadow-lg border border-2 border-white"
                            onClick={() => setQuickViewProduct(item)}
                          >
                            QUICK VIEW
                          </Button>

                        </div>
                      </div>
                      {/* Name and Price Section */}
                      <div className="flex items-center justify-between px-2 pt-4 pb-2  mt-0">
                        <Link
                          href={`/product/${item._id}`}
                          className="font-bold hover:underline text-xl text-gray-900 leading-tight max-w-[200px] truncate cursor-pointer"
                        >
                          {item?.title}
                        </Link>
                        <span className="font-bold text-xl text-gray-900"> ₹{formatNumeric(item?.quantity?.variants[0].price)}</span>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
            </CarouselContent>
            {/* <CarouselPrevious /> */}
            {/* <CarouselNext /> */}
          </Carousel>
          {/* Promotional Banner Section */}
          {promotinalBanner.length > 0 && (
            <div className="w-full my-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {promotinalBanner.map((item, idx) => (
                  <div key={idx} className="rounded-2xl flex flex-col h-[350px] md:h-[400px] p-0 overflow-hidden relative group">
                    <img src={item?.image?.url} alt={item?.title} className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute z-10 flex flex-col justify-between gap-2 px-10 p-6 h-full items-start">
                      <span className="inline-block bg-white text-black px-3 py-1 rounded text-xs font-bold w-fit mb-2 shadow">{item?.coupon ? `GET ${item?.coupon}% OFF` : ''}</span>
                      <span className="text-2xl md:text-3xl font-extrabold text-black mb-2 leading-tight w-1/2">{item?.title}</span>
                      <Link href={item?.buttonLink || '#'} target="_blank" rel="noopener noreferrer" className="mt-4 px-5 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition w-fit">View Now</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Featured Offer For You Section */}
          {featuredOffer.length > 0 && (
            <div className="w-full my-8">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-5">Featured Offer For You</h2>
              <Carousel className=" w-full max-w-full">
                <CarouselContent>
                  {featuredOffer.map((item, idx) => (
                    <CarouselItem key={idx} className="px-2 md:basis-1/3 lg:basis-1/4 ml-5">
                      <div className="rounded-2xl flex flex-col h-[340px] p-0 overflow-hidden relative bg-white group">
                        <img src={item.image?.url} alt={item.title} className="absolute inset-0 w-full h-full object-cover object-center opacity-80 transition-transform duration-300 group-hover:scale-105" />
                        <div className="relative z-10 flex flex-col justify-between items-start h-full p-6">
                          <span className="inline-block bg-white text-black px-3 py-1 rounded text-xs font-bold w-fit mb-2 shadow">{item.coupon ? `GET ${item.coupon}% OFF` : ''}</span>
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

          {/* Reviews Section */}
          <div className="w-full mx-auto mb-10 relative min-h-[600px] flex items-center justify-end relative">
            {/* Background Image */}
            <div className="absolute inset-0 w-full h-full z-0">
              <img
                src="/blogs.jpg"
                alt="Happy client"
                className="w-full h-full object-cover bg-[#FCEED5]"
                style={{ objectPosition: 'top' }}
              />
            </div>

            {/* Review Card Overlay */}
            <div className="absolute right-1 gap-2 top-[30%] z-10 flex flex-col justify-start w-full md:w-1/2 items-end pr-1">
              <div className="button px-10">
                <Button className="bg-white text-black hover:bg-black hover:text-white transition-colors duration-300" onClick={() => setShowReviewModal(true)}>Write Reviews</Button>
              </div>
              <Carousel className="w-full md:w-[600px]"
                plugins={[Autoplay({ delay: 4000 })]}>

                <CarouselContent className="w-full">
                  {(normalizedReviews && normalizedReviews.length > 0 ? normalizedReviews : [
                    {
                      _id: 1,
                      rating: 3,
                      title: 'Joe Doe',
                      subtitle: 'Undergraduate Student',
                      shortDescription: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquam aut ipsa corrupti, laudantium eos assumenda sed qui vitae ut. Aut mollitia obcaecati rerum optio repellendus reiciendis, accusamus, dignissimos impedit quisquam in molestias, voluptates voluptatem expedita. Nisi eligendi excepturi, optio ipsam, porro dolore perspiciatis corrupti atque animi ipsa architecto eum laboriosam.architecto eum laboriosam.architecto eum laboriosam.",
                      image: '/placeholder.jpeg',
                    },
                  ].map(normalizeReview)).map((review, idx) => (
                    <CarouselItem
                      key={review._id}
                      className="min-w-0 snap-center w-full"
                    >
                      <div className="bg-white rounded-3xl px-8 py-5 flex flex-col justify-between h-full min-h-[320px] relative overflow-visible">
                        {/* Review text */}
                        <div className="text-md md:text-2xl text-gray-800 font-bold leading-relaxed mb-2 text-left">
                          {review.title || 'No review text.'}
                        </div>
                        <div className="absolute right-4 top-4 flex items-center gap-1">
                          {review.rating && (
                            <>
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} size={22} className="text-yellow-400 fill-yellow-400" />
                              ))}
                            </>
                          )}
                        </div>


                        <div className="text-md md:text-md text-gray-800 font-medium leading-relaxed mb-2 text-left">
                          {review.shortDescription || 'No review text.'}
                        </div>
                        {/* Bottom row: avatar, name, subtitle, nav buttons */}
                        <div className="flex items-center justify-between w-full mt-auto">
                          {/* Avatar, Name, Subtitle */}
                          <div className="flex items-center">
                            <img
                              src={review.image || "/placeholder-user.jpg"}
                              alt={review.createdBy || 'Anonymous'}
                              className="w-14 h-14 rounded-full border-4 border-white shadow object-cover"
                            />
                            <div className="ml-4 text-left">
                              <div className="font-bold text-xl text-black">{review.createdBy || review.title || 'Anonymous'}</div>
                            </div>
                          </div>

                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {/* Carousel navigation styled as in screenshot */}
                <div className="flex items-center gap-3">
                  <CarouselPrevious className="absolute top-[85%] left-[65%] bg-[#f7eedd] !rounded-full !w-12 !h-12 !flex !items-center !justify-center transition" />
                  <CarouselNext className="absolute top-[85%] left-[80%] bg-[#f7eedd] !rounded-full !w-12 !h-12 !flex !items-center !justify-center transition" />
                </div>
              </Carousel>
            </div>
          </div>

          {/* Artisan Carousel Section */}
          <div className="w-full mt-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8">Meet Our Artisans</h2>
            <div className="w-full max-w-[90%] mx-auto mb-16 mt-16">
              <div className="flex flex-col md:flex-row items-start gap-5 ">
                {/* Left: Heading and description */}
                <div className="flex-1 flex flex-col justify-center md:pr-8">
                  <h2 className="text-4xl md:text-4xl font-bold  mb-4">Celebrating the Art of Craftsmanship. Honoring the Hands That Shape Beauty</h2>
                  <div className="text-lg md:text-md text-gray-700 text-justify mb-6">
                    We are proud to recognize and celebrate your exceptional talent and dedication as a skilled handicraft artisan. Your ability to transform raw materials into beautiful, meaningful works of art speaks to your creativity, precision, and passion for the craft. Each piece you create is a testament to the enduring value of handmade artistry and the cultural richness it preserves. With deep appreciation, we commend you for achieving this milestone and look forward to witnessing your continued journey of artistic excellence.
                  </div>
                  <Link href="/contact" className="bg-black text-white py-3 px-6 rounded-lg font-semibold text-lg w-fit mb-6">Join Our Team</Link>
                </div>
                {/* Right: Top 2 artisan cards in new style */}
                <div className="flex flex-row  gap-4 justify-end">
                  {(artisan && artisan.slice(0, 2).map((item, idx) => {
                    const card = {
                      id: item._id || idx,
                      name: `${item.title ? item.title + " " : ""}${item.firstName || ''} ${item.lastName || ''}`.trim() || "Unknown Artisan",
                      date: item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase() : "N/A",
                      image: item.profileImage?.url || item.image || "/bg-custom-1.jpg",
                      title: item.specializations && item.specializations.length > 0 ? item.specializations.join(", ") : "Artisan",
                      subtitle: item.shgName || "",
                      experience: item.yearsOfExperience ? `${item.yearsOfExperience} years experience` : "",
                      location: item.address ? `${item.address.city}, ${item.address.state}` : "",
                      socials: [
                        { icon: "/fb.png", url: item.socialPlugin?.facebook || "#" },
                        { icon: "/insta-Tranparent.webp", url: item.socialPlugin?.instagram || "#" },
                        { icon: "/youtube.webp", url: item.socialPlugin?.youtube || "#" },
                        { icon: "/google.png", url: item.socialPlugin?.google || "#" },
                        { icon: "/website.png", url: item.socialPlugin?.website || "#" }
                      ],
                    };
                    return (
                      <div key={card.id} className="relative rounded-2xl overflow-hidden shadow-md group transition-all h-full w-[340px] flex flex-col bg-[#fbeff2] ">
                        {/* Date Badge */}
                        <div className="absolute top-5 left-5 z-20 flex items-center gap-2">
                          <span className="bg-white rounded px-3 py-1 text-md font-bold shadow text-gray-800">{card.subtitle}</span>
                        </div>
                        {/* Card Image */}
                        <div className="relative w-full h-96">
                          <img
                            src={card.image}
                            alt={card.name}
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        {/* Card Content Overlay */}
                        <div className="absolute left-0 bottom-0 w-full flex justify-between items-end p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                          <div>
                            <Link
                              href={`/artisan/${card.id}`}
                              className="font-bold text-2xl text-white mb-3 leading-tight drop-shadow-md hover:underline hover:decoration-2 hover:underline-offset-4 transition cursor-pointer"
                              title={card.name}
                            >
                              {card.name}
                            </Link>
                            <div className="text-md text-white drop-shadow-md">{card.title}</div>
                          </div>
                          {/* Arrow Button with Socials on Hover */}
                          <div className="relative group/arrow">
                            <button className="bg-white text-black rounded-full w-12 h-12 flex items-center justify-center shadow transition group-hover/arrow:bg-[#e84393] group-hover/arrow:text-white">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                            {/* Social Icons: show on arrow hover */}
                            <div className="absolute bottom-12 right-0 flex flex-col gap-4 opacity-0 group-hover/arrow:opacity-100 transition-opacity duration-300 z-30 items-center">
                              {card.socials.slice(0, 6).map((s, i) => (
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
                                  <img src={s.icon} alt="social" className="w-7 h-7 object-contain" />
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }))}
                </div>
              </div>
              {/* Carousel for remaining artisans in new style */}
              {artisan && artisan.length > 2 && (
                <div className="mt-10">
                  <Carousel className="w-full">
                    <CarouselContent className="flex gap-6">
                      {artisan.slice(2).map((item, idx) => {
                        const card = {
                          id: item._id || idx,
                          name: `${item.title ? item.title + " " : ""}${item.firstName || ''} ${item.lastName || ''}`.trim() || "Unknown Artisan",
                          date: item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase() : "N/A",
                          image: item.profileImage?.url || item.image || "/bg-custom-1.jpg",
                          title: item.specializations && item.specializations.length > 0 ? item.specializations.join(", ") : "Artisan",
                          subtitle: item.shgName || "",
                          experience: item.yearsOfExperience ? `${item.yearsOfExperience} years experience` : "",
                          location: item.address ? `${item.address.city}, ${item.address.state}` : "",
                          socials: [
                            { icon: "/fb.png", url: item.socialPlugin?.facebook || "#" },
                            { icon: "/insta-Tranparent.webp", url: item.socialPlugin?.instagram || "#" },
                            { icon: "/youtube.webp", url: item.socialPlugin?.youtube || "#" },
                            { icon: "/google.png", url: item.socialPlugin?.google || "#" },
                            { icon: "/website.png", url: item.socialPlugin?.website || "#" }
                          ],
                        };
                        return (
                          <CarouselItem key={card.id} className="pl-5 md:basis-1/2 lg:basis-1/4 min-w-0 snap-start">
                            <div className="relative rounded-2xl overflow-hidden shadow-md group transition-all h-full flex flex-col bg-[#fbeff2]">
                              {/* Date Badge */}
                              <div className="absolute top-5 left-5 z-20 flex items-center gap-2">
                                <span className="bg-white rounded px-3 py-1 text-md font-bold shadow text-gray-800">{card.subtitle}</span>
                              </div>
                              {/* Card Image */}
                              <div className="relative w-full h-96">
                                <img
                                  src={card.image}
                                  alt={card.name}
                                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                  style={{ objectFit: 'cover' }}
                                />
                              </div>
                              {/* Card Content Overlay */}
                              <div className="absolute left-0 bottom-0 w-full flex justify-between items-end p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                                <div>
                                  <Link
                                    href={`/artisan/${card.id}`}
                                    className="font-bold text-2xl text-white mb-3 leading-tight drop-shadow-md hover:underline hover:decoration-2 hover:underline-offset-4 transition cursor-pointer"
                                    title={card.name}
                                  >
                                    {card.name}
                                  </Link>
                                  <div className="text-md text-white drop-shadow-md">{card.title}</div>
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
                                    {card.socials.slice(0, 6).map((s, i) => (
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
                        );
                      })}
                    </CarouselContent>
                    <div className="flex items-center gap-3 mt-4 justify-center">
                      <CarouselPrevious className="bg-[#f7eedd] !rounded-full !w-12 !h-12 !flex !items-center !justify-center transition" />
                      <CarouselNext className="bg-[#f7eedd] !rounded-full !w-12 !h-12 !flex !items-center !justify-center transition" />
                    </div>
                  </Carousel>
                </div>
              )}
            </div>
          </div>
          <div className="w-full flex flex-col items-center mb-12">
            <div className="w-full flex flex-col md:flex-row gap-8 min-h-[300px]">
              {/* News/Announcement Section */}
              <div className="flex flex-row w-full gap-8">
                <div className="flex-1 bg-white rounded-lg shadow p-8 flex flex-col justify-between min-h-[400px]">
                  <h2 className="text-3xl font-bold mb-4">Upcoming News, Blog and Events</h2>
                  <p className="text-gray-800 mb-8 text-lg font-medium">
                    "We're preparing exciting new content and updates for our users, including upcoming news and events. We’re working behind the scenes to bring you fresh news, upcoming events, and new features to enhance your experience.
                    <br /><br />
                    Stay connected — great things are coming soon!"
                  </p>
                  <button className="w-full bg-black text-white py-4 font-bold rounded hover:bg-gray-800 transition-colors text-lg">
                    View More
                  </button>
                </div>
                {/* News box */}
                <div className="flex-1 bg-white rounded-lg shadow p-6 flex flex-col min-h-[400px]">
                  <div className="font-bold text-2xl mb-4">Upcoming.....</div>
                  <div className="flex-1 overflow-y-auto pr-2 mb-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="bg-gray-100 rounded-lg p-4 mb-4 text-base font-medium">
                        Exciting updates are on the way! We're working behind the scenes. Something great is coming soon!
                      </div>
                    ))}
                  </div>
                  <button className="w-full bg-lime-400 text-black font-bold py-3 rounded hover:bg-lime-500 transition-colors text-lg">
                    Get Connected
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Blog Section with full-width background */}
          {!isBlogsLoading && blogs && blogs.length > 0 && (
            <div className="w-full flex flex-col items-center mt-12">
              <Carousel className="w-full">
  <CarouselContent className="px-1 sm:px-0">
    {Array.from({ length: Math.ceil(blogs.length / 2) }).map((_, pairIdx) => (
      <CarouselItem key={pairIdx} className="w-full">
        <div className="flex flex-col md:flex-row gap-6">
          {[0, 1].map((offset) => {
            const blog = blogs[pairIdx * 2 + offset];
            if (!blog) return null;
            return (
              <div
                key={blog._id || offset}
                className="flex bg-[#fcf3d7] rounded-2xl shadow-lg overflow-hidden w-full md:w-1/2 min-h-[180px]"
              >
                {/* Left: Video or Image */}
                <div className="w-2/5 min-w-[160px] bg-black flex items-center justify-center">
                  {blog.youtubeUrl ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={blog.youtubeUrl}
                      title={blog.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="aspect-video w-full h-full"
                    />
                  ) : (
                    <img
                      src={blog.image || "https://images.unsplash.com/photo-1506744038136-46273834b3fb"}
                      alt={blog.title}
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
                {/* Right: Text */}
                <div className="flex-1 flex flex-col justify-center px-6 py-4">
                  <div className="font-bold text-2xl mb-2">{blog.title}</div>
                  <div className="text-gray-700 mb-4 line-clamp-3">
                    {blog.shortDesc}
                  </div>
                  <a
                    href={blog.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-gray-700 hover:text-black"
                  >
                    Read More &gt;
                  </a>
                </div>
              </div>
            );
          })}
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
          <ReviewModal
            open={showReviewModal}
            onClose={() => setShowReviewModal(false)}
            onSubmit={(data) => { setShowReviewModal(false); toast.success('Review submitted!'); }}
          />
        </div>
      </div>
    </section>

  );
};



export default RandomTourPackageSection;
