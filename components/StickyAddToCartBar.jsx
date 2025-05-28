"use client"
import { useEffect, useRef, useState } from "react";
import { useCart } from "../context/CartContext";
import { toast } from "react-hot-toast";

function hexToColorName(hex) {
  if (!hex) return '';
  const map = {
    "#FF0000": "Red",
    "#00FF00": "Green",
    "#0000FF": "Blue",
    "#FFFF00": "Yellow",
    "#FFC0CB": "Pink",
    "#FFA500": "Orange",
    "#800080": "Purple",
    "#000000": "Black",
    "#FFFFFF": "White",
    // Add more as needed
  };
  return map[hex.toUpperCase()] || hex;
}

function StickyAddToCartBar({ product }) {
   const { addToCart} = useCart();
  // Extract sizes from variants
  const variants = Array.isArray(product?.quantity?.variants) ? product.quantity.variants : [];
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const selectedVariant = variants[selectedVariantIdx] || variants[0];
  const [quantity, setQuantity] = useState(1);

  // Reset quantity to 1 when variant changes
  useEffect(() => { setQuantity(1); }, [selectedVariantIdx]);
  const [showBar, setShowBar] = useState(false);
  const lastScroll = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > 50 && currentScroll > lastScroll.current) {
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
      <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        {/* Product Info */}
        <div className="flex items-center  gap-4">
          <img src={product?.gallery?.mainImage || "/placeholder.png"} alt={product?.title} className="w-16 h-16 object-cover rounded" />
          <div>
            <div className="font-semibold text-xl">{product?.title}</div>
            <div className="font-bold text-md">₹{selectedVariant ? selectedVariant.price : product?.price}</div>
          </div>
        </div>
        {/* Options, Quantity, Add to Cart */}
        <div className="flex items-center gap-3">
          {/* Size Selector */}
          {variants.length > 0 && (
            <>
              <select
                className="border border-black px-4 py-2 rounded"
                value={selectedVariantIdx}
                onChange={e => setSelectedVariantIdx(Number(e.target.value))}
              >
                {variants.map((v, idx) => (
                  <option
                    key={v._id || idx}
                    value={idx}
                    disabled={v.qty === 0}
                  >
                    {`${hexToColorName(v.color) || 'Color'} / ${v.size || 'Size'}`}{v.qty === 0 ? ' (Sold out)' : ''}
                  </option>
                ))}
              </select>
              {selectedVariant?.color && (
                <span
                  className="inline-block w-5 h-5 rounded-full border ml-2 align-middle"
                  style={{ background: selectedVariant.color }}
                  title={hexToColorName(selectedVariant.color)}
                ></span>
              )}
            </>
          )}
          {/* Quantity Selector */}
          <div className="flex items-center gap-1">
            <button
              className="w-8 h-8 border border-black rounded flex items-center justify-center font-bold text-lg hover:bg-gray-100"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
            >
              -
            </button>
            <span className="w-8 text-center font-semibold">{quantity}</span>
            <button
              className="w-8 h-8 border border-black rounded flex items-center justify-center font-bold text-lg hover:bg-gray-100"
              onClick={() => setQuantity(q => selectedVariant ? Math.min(selectedVariant.qty, q + 1) : q + 1)}
              aria-label="Increase quantity"
              disabled={!selectedVariant || quantity >= (selectedVariant?.qty || 1)}
            >
              +
            </button>
          </div>
          <button
            className="bg-blue-600 text-white px-8 py-2 rounded-md font-bold"
            onClick={() => {
              if (!selectedVariant) {
                toast.error("Please select a variant.");
                return;
              }
              // Add to cart with relevant details
              addToCart({
                id: product._id,
                name: product.title,
                image: product.gallery?.mainImage || "/placeholder.png",
                price: selectedVariant.price,
                size: selectedVariant.size,
                color: selectedVariant.color,
              }, quantity);
              toast.success("Added to cart!");
            }}
          >ADD TO CART</button>
        </div>
      </div>
    </div>
  );
}

export default StickyAddToCartBar;