"use client";
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
// const AccordionItem = ({ title, children }) => {
//   const [open, setOpen] = React.useState(false);
//   return (
//     <div className="border-b">
//       <button
//         className="w-full flex justify-between items-center py-4 px-6 text-lg font-medium focus:outline-none hover:bg-gray-50 transition"
//         onClick={() => setOpen(o => !o)}
//       >
//         <span>{title}</span>
//         <span className="ml-2 text-xl">{open ? '-' : '+'}</span>
import QuickViewProductCard from "./QuickViewProductCard";

const ArtisanDetails = ({ artisan }) => {
  console.log(artisan)
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  // Prevent background scroll when Quick View is open
  useEffect(() => {
    if (quickViewProduct) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [quickViewProduct]);
  // Sample carousel data for products if not present
  const products = artisan.products && artisan.products.length > 0 ? artisan.products : [
    { _id: 1, title: 'Sample Product 1', image: 'https://via.placeholder.com/120x120?text=Product+1' },
    { _id: 2, title: 'Sample Product 2', image: 'https://via.placeholder.com/120x120?text=Product+2' },
    { _id: 3, title: 'Sample Product 3', image: 'https://via.placeholder.com/120x120?text=Product+3' },
  ];
  const blogs = artisan.blogs && artisan.blogs.length > 0 ? artisan.blogs : [
    { _id: 1, title: 'No Blogs Available', content: '' },
  ];

  return (
    <div className=" relative min-h-screen bg-gradient-to-br from-amber-50 to-white flex flex-col items-center px-2 md:px-0">
      {/* Top section: Image left, details right */}
      <div className="relative w-full overflow-visible shadow-xl mb-10 bg-[#f9f6f1]">
  {/* Banner Background Image */}
  <div className="inset-0 h-[300px] w-full object-cover object-center grayscale-[0.8] brightness-100 z-0 overflow-hidden">
    <img src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80" className="w-full h-full object-cover grayscale-[0.8] brightness-100 " alt="Office" />
  </div>
  {/* Overlay Content */}
  <div className="relative  flex flex-row items-start pt-0 px-0 pb-8 ">
    {/* Profile Image: Overlapping Banner */}
    <div className="absoute 0 flex-shrink-0 -mt-32 ml-12 mr-10">
      <div className="bg-white rounded-lg shadow-xl border-4 border-white overflow-hidden w-72 h-[350px] flex items-center justify-center">
        <img src={artisan.image || artisan.profileImage?.url || 'https://randomuser.me/api/portraits/men/32.jpg'} alt={artisan.firstName + ' ' + artisan.lastName} className="object-cover w-full h-full" />
      </div>
    </div>
    {/* Details Card */}
    <div className="flex-1 flex flex-col gap-2 mt-8 md:mt-8 md:ml-0 bg-transparent">
      <div className="flex flex-col gap-2">
        <div className="text-3xl font-bold leading-tight flex items-center">Name: <span className="font-bold text-2xl md:text-3xl text-gray-800 align-middle"> {artisan.firstName} {artisan.lastName}</span></div>
        <div className="font-bold text-2xl mt-1 mb-1 text-xl flex items-center">SHG : <span className="font-normal text-md ">{artisan.shgName || 'No SHG Name Avaiable'}</span></div>
        <div  className="font-bold text-2xl mt-1 mb-1 text-xl flex items-center"> Artisan Number: <span className="font-normal text-md">{artisan.artisanNumber || 'Artisan Number Not Available'}</span></div>
      </div>
      <div className="mt-2 text-xl md:text-2xl font-bold text-black">{artisan.experience || '10'} Years of Experience</div>
      <div className="font-bold text-lg mt-2">Specializations</div>
      <div className="flex gap-3 flex-wrap mb-2">
        {(artisan.specializations || ['Jute Fiber', 'Bhimal Fiber', 'Jute Handbag']).map((spec, i) => (
          <span key={i} className="bg-gray-200 rounded-full px-5 py-1 text-base font-semibold tracking-tight border border-gray-300">{spec}</span>
        ))}
      </div>
      <div className="font-bold mt-2">Address: <span className="font-normal">{artisan.address?.fullAddress || 'Yamkeshwar, Mohan Chatti, Bairagarh, Uttarakhand'}</span></div>
      {/* Social Icons Row */}
      <div className="flex items-center gap-2 mt-2 mb-2">
        {artisan.facebook && <a href={artisan.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-600"><i className="fab fa-facebook-f"></i></a>}
        {artisan.instagram && <a href={artisan.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-pink-500"><i className="fab fa-instagram"></i></a>}
        {artisan.twitter && <a href={artisan.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-400"><i className="fab fa-twitter"></i></a>}
        {artisan.youtube && <a href={artisan.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-red-600"><i className="fab fa-youtube"></i></a>}
        {artisan.google && <a href={artisan.google} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-red-500"><i className="fab fa-google"></i></a>}
        {artisan.linkedin && <a href={artisan.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-700"><i className="fab fa-linkedin-in"></i></a>}
      </div>
      <div className="flex flex-row items-center justify-between mt-2">
        <div></div>
        <button className="bg-black text-white font-bold px-8 py-2 rounded-full shadow hover:bg-gray-900 transition-all text-base">Ask An Expert</button>
      </div>
    </div>
  </div>
</div>

      {/* Products Carousel */}
      <div className="w-full max-w-7xl mb-10">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">Products</h3>
        <Carousel className="w-full md:w-[100%] mx-auto my-4">
          <CarouselContent className="-ml-1 w-full gap-2">
            {products.map((product) => (
              <CarouselItem
                key={product._id}
                className="pl-1 md:basis-1/4 min-w-0 snap-start"
              >
                <div className="max-w-[250px] flex flex-col items-center p-0 relative shadow-none">
                  {/* Image Section (rounded only) */}
                  <div className="relative w-full h-72 rounded-3xl overflow-hidden flex items-center justify-center group/image shadow-lg bg-white">
                    {/* Discount Badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <div className="bg-white rounded-full px-4 py-1 text-xs font-bold shadow text-black tracking-tight">
                        GET 20% OFF
                      </div>
                    </div>
                    {/* Wishlist/Cart buttons */}
                    <div className="absolute top-4 right-4 z-10 flex flex-col gap-3 items-end">
                      <button className="rounded-full bg-[#b3a7a3]/80 hover:bg-[#b3a7a3] transition-colors duration-300 h-10 w-10 shadow-none flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                      </button>
                      <button className="rounded-full bg-[#b3a7a3]/80 hover:bg-[#b3a7a3] transition-colors duration-300 h-10 w-10 shadow-none flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
                      </button>
                    </div>
                    {/* Main Product Image */}
                    <img
                      src={Array.isArray(product.gallery) ? product.gallery[0]?.mainImage : product.gallery?.mainImage || "/placeholder-product.jpg"}
                      alt={product.title}
                      className="object-cover w-full h-full rounded-3xl transition-transform duration-300 group-hover/image:scale-105"
                    />
                    {/* Quick View Button - Slide Up from Bottom on Hover */}
                    <div className="absolute left-0 right-0 bottom-0 flex items-center justify-center translate-y-12 opacity-0 group-hover/image:translate-y-0 group-hover/image:opacity-100 transition-all duration-300 py-4">
                      <Button
                        className="bg-black text-white hover:bg-gray-800 transition-colors duration-300 uppercase text-sm font-bold px-8 py-3 rounded-full shadow-lg"
                        onClick={() => setQuickViewProduct(product)}
                      >
                        QUICK VIEW
                      </Button>
                    </div>
                  </div>
                  {/* Name and Price Section (plain, separate box) */}
                  <div className="w-full flex flex-col items-start px-5 py-4 mt-0 bg-transparent">
                    <span className="font-semibold text-base leading-tight max-w-[180px] truncate cursor-pointer mb-1" style={{ color: 'inherit' }}>
                      {product.title}
                    </span>
                    {product.quantity?.variants?.[0]?.price && (
                      <span className="font-medium text-base mt-0" style={{ color: 'inherit' }}>
                        ₹{product.quantity.variants[0].price}
                      </span>
                    )}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      {/* Blogs Section */}
      <div className="w-full max-w-7xl mb-10">
        <h3 className="text-3xl font-bold mb-4 text-gray-800 ">Blogs</h3>
        <Carousel className="w-full md:w-[100%] mx-auto my-4 ">
          <CarouselContent className="-ml-1 w-full gap-4 m-1">
            {blogs.map((blog) => {
              const firstImage = Array.isArray(blog.images) && blog.images.length > 0 ? blog.images[0].url || blog.images[0] : undefined;
              return (
                <CarouselItem
                  key={blog._id}
                  className="pl-1 md:basis-1/4 min-w-0 snap-start"
                >
                  <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-col min-h-[300px] max-w-md mx-auto transition hover:shadow-xl ">
                    {firstImage && (
                      <img src={firstImage} alt={blog.title} className="w-full rounded-t-2xl object-cover" />
                    )}
                    <div className="flex flex-col flex-1 p-4">
                      <div className="font-bold text-lg text-black uppercase tracking-wider line-clamp-2 mb-2">{blog.title || 'No title available.'}</div>
                      <div className="text-gray-500 text-base mt-2 line-clamp-2 max-h-16 overflow-y-auto mb-2">{blog.shortDescription || 'No description available.'}</div>
                      <div className="flex gap-3 mt-auto">
                        <a href={`/blogs/${blog._id}`} className="text-gray-600 hover:underline rounded-lg font-semibold text-base transition flex items-center">READ MORE <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg></a>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      {/* Reviews Section */}
      <div className="w-full max-w-4xl mx-auto mb-10">
        <Carousel className="w-full">
          <CarouselContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(artisan.promotions && artisan.promotions.length > 0 ? artisan.promotions : [
              {
                _id: 1,
                rating: 3,
                title: 'Kenneth Fong',
                subtitle: 'Postgraduate Student',
                shortDescription: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.",
                image: '/placeholder-user.jpg',
              },
            ]).map((review, idx) => (
              <CarouselItem
                key={review._id}
                className="min-w-0 snap-center w-full md:w-1/2"
              >
                <div className="bg-white rounded-3xl shadow-xl border border-[#f7eedd] p-8 flex flex-col justify-between h-full min-h-[320px] relative overflow-visible">
                  {/* Review text */}
                  <div className="text-lg md:text-xl text-gray-800 font-medium leading-relaxed mb-8 text-left">
                    {review.shortDescription || 'No review text.'}
                  </div>
                  {/* Bottom row: avatar, name, subtitle, nav buttons */}
                  <div className="flex items-center justify-between w-full mt-auto pt-2">
                    {/* Avatar, Name, Subtitle */}
                    <div className="flex items-center">
                      <img
                        src={review.image || "/placeholder-user.jpg"}
                        alt={review.createdBy || review.title || 'Anonymous'}
                        className="w-16 h-16 rounded-full border-4 border-white shadow object-cover"
                      />
                      <div className="ml-4 text-left">
                        <div className="font-bold text-xl text-black">{review.createdBy || review.title || 'Anonymous'}</div>
                        <div className="text-gray-400 text-base font-medium mt-1">{review.subtitle || 'Postgraduate Student'}</div>
                      </div>
                    </div>
                    {/* Carousel navigation (absolute, styled like screenshot) */}
                    {/* <div className="flex items-center gap-4">
                      <CarouselPrevious className="!static !relative !shadow-none !bg-[#f7eedd] !rounded-full !w-12 !h-12 !flex !items-center !justify-center hover:!bg-[#f3e3c6] transition" />
                      <CarouselNext className="!static !relative !shadow-none !bg-[#f7eedd] !rounded-full !w-12 !h-12 !flex !items-center !justify-center hover:!bg-[#f3e3c6] transition" />
                    </div> */}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

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
  );
};

export default ArtisanDetails;