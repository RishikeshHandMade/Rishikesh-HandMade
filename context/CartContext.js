"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

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
      if (idx > -1) {
        // Already in cart, update qty and all fields
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          ...item,
          qty: updated[idx].qty + qty,
        };
        return updated;
      }
      return [...prev, { ...item, qty }];
    });
  };
  const removeFromCart = id => setCart(prev => prev.filter(i => i.id !== id));
  const updateCartQty = (id, qty) => setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
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
