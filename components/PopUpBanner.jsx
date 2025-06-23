"use client"
import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const PopUpBanner = () => {
  const [banner, setBanner] = useState(null);
  const [open, setOpen] = useState(false); // Initially closed
  const [showAnim, setShowAnim] = useState(false);

  useEffect(() => {
    fetch('/api/popupBanner')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setBanner(data[0]);
        }
      });
  }, []);

  useEffect(() => {
    if (banner) {
      // Delay popup open by 2 seconds
      const timer = setTimeout(() => {
        setOpen(true);
        // Animate in after open
        setTimeout(() => setShowAnim(true), 10);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [banner]);

  const handleClose = () => {
    setShowAnim(false);
    setTimeout(() => setOpen(false), 200); // Wait for animation out
  };

  if (!banner || !open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 transition-opacity duration-300">
      <div
        className={`relative bg-white max-w-[95vw] w-full sm:w-[400px] md:w-[500px] flex flex-col items-center
        transform transition-all duration-500
        ${showAnim ? 'translate-x-0 opacity-100 transition-all duration-500' : '-translate-x-[40vw] opacity-0 transition-all duration-500'}`}
        style={{ transitionProperty: 'transform, opacity' }}
      >
        {/* Close button top left */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 bg-gray-200 rounded-full w-12 h-12 flex items-center justify-center text-black hover:text-white text-2xl font-bold focus:outline-none"
          aria-label="Close popup"
        >
          <X/>
        </button>
        {/* Banner image as clickable link */}
        <a href={banner.buttonLink || '#'} target="_blank" rel="noopener noreferrer" className="block w-full">
          <img
            src={banner.image?.url || '/placeholder.jpeg'}
            alt="Popup Banner"
            className="w-full h-auto object-contain max-h-[60vh] transition cursor-pointer"
            style={{ maxHeight: '350px', margin: '0 auto' }}
          />
        </a>
      </div>
    </div>
  );
};

export default PopUpBanner;