"use client"
import { useEffect, useRef, useState } from "react";

function StickyAddToCartBar({ product }) {
  const [showBar, setShowBar] = useState(false);
  const lastScroll = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > 100 && currentScroll > lastScroll.current) {
        // Scrolling down, show bar
        setShowBar(true);
      } else if (currentScroll < lastScroll.current) {
        // Scrolling up, hide bar
        setShowBar(false);
      }
      lastScroll.current = currentScroll;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed left-0 bottom-0 w-full bg-white shadow-xl z-50 transition-transform duration-300 ${
        showBar ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center justify-between px-6 py-3 max-w-6xl mx-auto">
        {/* Product Info */}
        <div className="flex items-center gap-4">
          <img src={product?.gallery?.mainImage || "/placeholder.png"} alt={product?.title} className="w-12 h-12 object-cover rounded" />
          <div>
            <div className="font-semibold text-sm">{product?.title}</div>
            <div className="font-bold text-base">₹{product?.price}</div>
          </div>
        </div>
        {/* Options, Quantity, Add to Cart */}
        <div className="flex items-center gap-3">
          {/* Add your size/color/quantity selectors here */}
          <button className="bg-black text-white px-8 py-3 rounded-full font-bold">ADD TO CART</button>
        </div>
      </div>
    </div>
  );
}

export default StickyAddToCartBar;