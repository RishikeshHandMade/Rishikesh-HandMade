"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

const CartContext = createContext();

function getInitial(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function getAvailableQty(item) {
  if (item?.totalQuantity !== undefined) return item.totalQuantity;
  return 1; // fallback if nothing present
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => getInitial("cart", []));
  const [wishlist, setWishlist] = useState(() => getInitial("wishlist", []));

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Cart functions
  const addToCart = (item, qty = 1) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.id === item.id);
      const maxQty = getAvailableQty(item);
      if (idx > -1) {
        const updated = [...prev];
        const newQty = Math.min(updated[idx].qty + qty, maxQty);
        if (updated[idx].qty + qty > maxQty) {
          toast.error(`Only ${maxQty} left in stock!`);
        }
        updated[idx] = {
          ...updated[idx],
          ...item,
          qty: newQty,
        };
        return updated;
      }
      if (qty > maxQty) {
        toast.error(`Only ${maxQty} left in stock!`);
      }
      return [...prev, { ...item, qty: Math.min(qty, maxQty) }];
    });
  };
  const removeFromCart = id => setCart(prev => prev.filter(i => i.id !== id));
  const updateCartQty = (id, qty) => setCart(prev => prev.map(i => {
    if (i.id === id) {
      const maxQty = getAvailableQty(i);
      if (qty > maxQty) {
        toast.error(`Only ${maxQty} left in stock!`);
        return { ...i, qty: maxQty };
      }
      return { ...i, qty: Math.max(1, qty) };
    }
    return i;
  }));
  const clearCart = () => setCart([]);

  // Wishlist functions
  const addToWishlist = item => {
    setWishlist(prev => prev.some(i => i.id === item.id) ? prev : [...prev, item]);
  };
  const removeFromWishlist = id => setWishlist(prev => prev.filter(i => i.id !== id));
  const clearWishlist = () => setWishlist([]);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        setCart,
        setWishlist,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
