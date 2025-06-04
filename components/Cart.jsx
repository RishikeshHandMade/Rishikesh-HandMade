import React, { useState } from "react";
import { ShoppingCart, Heart, X, Minus, Plus, Ship } from "lucide-react";
import ReactDOM from "react-dom";

const mockCart = [
  {
    id: 1,
    name: "Sophisticated Swagger Suit",
    price: 45.0,
    image: "/cart1.png",
    qty: 1,
  },
  {
    id: 2,
    name: "Cozy Knit Cardigan Sweater",
    price: 95.0,
    image: "/cart2.png",
    qty: 1,
  },
  {
    id: 3,
    name: "Athletic Mesh Sports Leggings",
    price: 56.0,
    image: "/cart3.png",
    qty: 1,
  },
];

const mockWishlist = [
  {
    id: 4,
    name: "Trendy Blazer Dress",
    price: 70.0,
    image: "/cart4.png",
    qty: 1,
  },
  {
    id: 5,
    name: "Classic Denim Jacket",
    price: 60.0,
    image: "/cart5.png",
    qty: 1,
  },
];

import { useCart } from "../context/CartContext";

import Link from "next/link";

export default function Cart({ open, onClose, initialTab = "cart" }) {
  const [tab, setTab] = useState(initialTab);
  const [show, setShow] = React.useState(open);
  const { cart, wishlist, updateCartQty, removeFromCart, removeFromWishlist } = useCart();
  React.useEffect(() => {
    if (open) {
      setShow(true);
      setTab(initialTab);
      document.body.classList.add('overflow-hidden');
    } else {
      // Wait for animation before unmounting
      const timer = setTimeout(() => setShow(false), 300);
      document.body.classList.remove('overflow-hidden');
      return () => clearTimeout(timer);
    }
    // Clean up in case component is unmounted while open
    return () => document.body.classList.remove('overflow-hidden');
  }, [open, initialTab]);

  const handleQty = (id, delta) => {
    setCart(cart =>
      cart.map(item =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
    );
  };
  const handleRemove = id => {
    setCart(cart => cart.filter(item => item.id !== id));
  };
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const freeShipping = subtotal >= 150;
  const shippingProgress = Math.min(1, subtotal / 150);

  if ((!show && !open) || typeof window === "undefined") return null;
  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-[2147483647] flex">
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-[2147483647] transition-all duration-300 ease-in-out ${open ? 'opacity-100' : 'opacity-0'}`}
          aria-hidden="true"
          onClick={onClose}
        />
        {/* Cart Sidebar */}
        <div
          className={`fixed top-0 right-0 h-full w-[370px] bg-[#fcf7f1] shadow-lg z-[2147483647] flex flex-col border-l border-neutral-200 transition-all duration-300 ease-in-out ${open ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
          style={{ maxWidth: "100vw" }}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          onClick={e => e.stopPropagation()}
        >
      <div className="flex justify-between items-center px-6 pt-6 pb-2 border-b border-neutral-200">
        <div className="flex gap-7 text-lg font-semibold">
          <button
            className={`flex items-center gap-2 pb-2 border-b-2 ${tab === "cart" ? "border-black" : "border-transparent"}`}
            onClick={() => setTab("cart")}
          >
            Shopping Cart <span className="ml-1 text-xs bg-black text-white rounded-full px-2">{cart.length}</span>
          </button>
          <button
            className={`flex items-center gap-2 pb-2 border-b-2 ${tab === "wishlist" ? "border-black" : "border-transparent"}`}
            onClick={() => setTab("wishlist")}
          >
            Wishlist <span className="ml-1 text-xs bg-black text-white rounded-full px-2">{wishlist.length}</span>
          </button>
        </div>
        <button onClick={onClose} aria-label="Close"><X size={24} /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-2">
        {(tab === "cart" ? cart : wishlist).map(item => (
          <div key={item.id} className="flex items-center gap-4 py-4 border-b border-neutral-200 last:border-b-0">
            <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover border" />
            <div className="flex-1">
              <div className="font-semibold text-base leading-tight mb-1">{item.name}</div>
              <div className="flex items-center gap-2 mt-2">
                {tab === "cart" ? (
                  <>
                    <button onClick={() => updateCartQty(item.id, Math.max(1, item.qty - 1))} className="w-8 h-8 rounded-full border flex items-center justify-center"><Minus size={18} /></button>
                    <span className="mx-2 font-medium">{item.qty}</span>
                    <button onClick={() => updateCartQty(item.id, item.qty + 1)} className="w-8 h-8 rounded-full border flex items-center justify-center"><Plus size={18} /></button>
                  </>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="font-semibold">₹{(item.price * (item.qty || 1)).toFixed(2)}</span>
              {tab === "cart" ? (
                <button onClick={() => removeFromCart(item.id)} className="text-neutral-400 hover:text-red-500"><X size={18} /></button>
              ) : (
                <button onClick={() => { removeFromWishlist(item.id); removeFromCart(item.id); }} className="text-neutral-400 hover:text-red-500"><X size={18} /></button>
              )}
            </div>
          </div>
        ))}
      </div>
      {tab === "cart" && (
        <div className="px-6 pt-2 pb-6 border-t border-neutral-200">
          <div className="flex justify-between text-lg font-semibold mb-2">
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <Ship size={36} />
            <div className="flex-1">
              <div className="text-sm font-medium mb-1">Congratulations , you've got free shipping!</div>
              <div className="w-full h-1 bg-neutral-200 rounded-full overflow-hidden">
                <div className="h-full bg-black" style={{ width: `${shippingProgress * 100}%` }}></div>
              </div>
            </div>
          </div>
          <Link href="/checkout" className="block w-full">
            <button
              className="w-full py-2 border border-black rounded-lg font-semibold mb-3 hover:bg-black hover:text-white transition"
              onClick={onClose}
              type="button"
            >Checkout</button>
          </Link>
          <Link href="/cartDetails" className="block w-full">
            <button
              className="w-full py-2 bg-black text-white rounded-lg font-semibold"
              onClick={onClose}
              type="button"
            >View Cart</button>
          </Link>
        </div>
      )}
        </div>
      </div>
    </>,
    document.body
  );
}
