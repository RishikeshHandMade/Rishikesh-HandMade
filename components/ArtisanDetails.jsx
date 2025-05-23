"use client"
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
//       </button>
//       <div className={`px-6 pb-4 text-gray-700 transition-all duration-300 ${open ? 'block' : 'hidden'}`}>{children}</div>
//     </div>
//   );
// };
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white flex flex-col items-center py-12 px-2 md:px-0">
      {/* Top section: Image left, details right */}
      <div className="w-full max-w-7xl bg-white rounded-3xl shadow-xl flex flex-col md:flex-row overflow-hidden mb-10">
        {/* Left: Full-height, full-width image container */}
        <div className="md:w-1/3 w-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 p-0 md:p-0" style={{ minHeight: '340px' }}>
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={artisan.image || artisan.profileImage?.url || 'https://via.placeholder.com/400x500'}
              alt={artisan.firstName + ' ' + artisan.lastName}
              className="w-full h-full object-cover rounded-3xl border-8 border-white shadow-2xl"
              style={{ maxHeight: 400, maxWidth: 320 }}
            />
          </div>
        </div>
        {/* Right: Name and accordion */}
        <div className="md:w-2/3 w-full flex flex-col justify-center px-6 py-8">
          {/* Small container for name, number, status */}
          <div className="mb-6 bg-gray-50 rounded-xl p-4 shadow ">
            <div className="flex items-center gap-2 justify-between">
              <h2 className="text-3xl font-bold text-gray-900 mb-1">{artisan.firstName} {artisan.lastName}</h2>
              <p className="text-lg text-gray-600 mb-1">Artisan Number: <span className="font-semibold">{artisan.artisanNumber}</span></p>
            </div>
            {/* <p className="text-md text-gray-500">Active: <span className={artisan.active ? 'text-green-600' : 'text-red-600'}>{artisan.active ? 'Yes' : 'No'}</span></p> */}
            {/* Social Links */}
            <div className="flex space-x-4 mt-2">
              {artisan.instagram && (
                <a href={artisan.instagram} target="_blank" rel="noopener noreferrer" title="Instagram">
                  <svg className="w-6 h-6 text-pink-500 hover:text-pink-700" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5zm5.13.62a1.13 1.13 0 1 1-2.26 0 1.13 1.13 0 0 1 2.26 0z" /></svg>
                </a>
              )}
              {artisan.facebook && (
                <a href={artisan.facebook} target="_blank" rel="noopener noreferrer" title="Facebook">
                  <svg className="w-6 h-6 text-blue-600 hover:text-blue-800" fill="currentColor" viewBox="0 0 24 24"><path d="M17.525 8.998h-2.025v-1.3c0-.474.312-.585.532-.585h1.455V5.081l-2.004-.008c-2.226 0-2.728 1.667-2.728 2.735v1.19H9v2.51h1.755V21h3.13v-9.492h2.025l.275-2.51z" /></svg>
                </a>
              )}
              {artisan.website && (
                <a href={artisan.website} target="_blank" rel="noopener noreferrer" title="Website">
                  <svg className="w-6 h-6 text-gray-700 hover:text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20" /></svg>
                </a>
              )}
              {artisan.google && (
                <a href={artisan.google} target="_blank" rel="noopener noreferrer" title="Google">
                  <svg className="w-6 h-6 text-red-500 hover:text-red-700" fill="currentColor" viewBox="0 0 24 24"><path d="M21.35 11.1h-9.18v2.92h5.5c-.24 1.38-1.65 4.06-5.5 4.06-3.3 0-6-2.73-6-6.09s2.7-6.09 6-6.09c1.88 0 3.15.8 3.87 1.5l2.64-2.58C17.27 3.59 15.36 2.5 12.99 2.5 7.73 2.5 3.5 6.73 3.5 12s4.23 9.5 9.49 9.5c5.48 0 9.01-3.85 9.01-9.28 0-.62-.07-1.09-.15-1.62z" /></svg>
                </a>
              )}
            </div>
          </div>
          {/* Details section (no accordion) */}
          <div className="rounded-xl border bg-white overflow-hidden mb-2 p-4 flex flex-col gap-3">
            <div>
              <span className="font-semibold text-gray-700">Contact Information:</span>
              <div className="ml-2">
                <div className="mb-1">Phone: <a href={`tel:${artisan.contact?.callNumber}`} className="text-blue-600 hover:underline">{artisan.contact?.callNumber || 'N/A'}</a></div>
                <div className="mb-1">WhatsApp: <a href={`https://wa.me/${artisan.contact?.whatsappNumber}`} className="text-green-600 hover:underline">{artisan.contact?.whatsappNumber || 'N/A'}</a></div>
                <div>Email: <a href={`mailto:${artisan.contact?.email}`} className="text-blue-600 hover:underline">{artisan.contact?.email || 'N/A'}</a></div>
              </div>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Address:</span>
              <div className="ml-2">{artisan.address?.fullAddress || 'N/A'}</div>
              <div className="ml-2">{artisan.address?.city}, {artisan.address?.state}</div>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Family:</span>
              <div className="ml-2">{artisan.fatherHusbandTitle} {artisan.fatherHusbandName} {artisan.fatherHusbandLastName} ({artisan.fatherHusbandType})</div>
            </div>
            {/* <div>
              <span className="font-semibold text-gray-700">Certificates:</span>
              <div className="ml-2">{artisan.certificates && artisan.certificates.length > 0 ? artisan.certificates.join(', ') : 'No certificates'}</div>
            </div> */}
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
      <div className="w-full max-w-7xl mb-10">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">Reviews</h3>
        <Carousel className="w-full md:w-[100%] mx-auto my-4">
          <CarouselContent className="-ml-1 w-full gap-4">
            {(artisan.promotions && artisan.promotions.length > 0 ? artisan.promotions : [
              {
                _id: 1,
                rating: 3,
                title: 'JOHN DOE',
                shortDescription: "This podcast is amazing! The storytelling and production quality are top-notch. I can't wait for the next episode!",
              },
            ]).map((review, idx) => (
              <CarouselItem
                key={review._id}
                className="pl-1 md:basis-1/3 min-w-0 snap-start"
              >
                <div className="bg-white border rounded-xl shadow px-4 py-2 flex flex-col items-center text-center max-w-2xl mx-auto relative">
                  {/* Avatar and Name Row */}
                  <div className="flex items-center justify-start w-full mb-2 mt-2 gap-3">
                    <div className="relative">
                      <img
                        src={review.image || "/placeholder-user.jpg"}
                        alt={review.createdBy || review.title || 'Anonymous'}
                        className="w-24 h-24 rounded-full border-4 border-white shadow"
                      />
                    </div>
                    <div className="font-bold text-xl text-black text-left">{review.createdBy || review.title || 'Anonymous'}</div>
                  </div>
                  {/* Stars */}
                  <div className="flex justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-6 h-6 mx-0.5 ${i < (review.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 0 0 .95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 0 0-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 0 0-1.176 0l-3.38 2.454c-.785.57-1.84-.196-1.54-1.118l1.287-3.966a1 1 0 0 0-.364-1.118L2.049 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 0 0 .95-.69l1.286-3.967z" /></svg>
                    ))}
                  </div>
                  {/* Review text (Description Row) */}
                  <div className="text-start px-2 italic text-lg text-gray-700 mb-2 whitespace-pre-line w-full mt-2 max-h-24 overflow-y-auto">{review.shortDescription || 'No review text.'}</div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
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