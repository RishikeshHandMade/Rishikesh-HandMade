// Handles syncing cart/wishlist from localStorage to backend on user login
"use client"
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "./CartContext";

export default function CartSyncOnLogin() {
  const { data: session, status } = useSession();
  const { setCart, setWishlist, clearCart, clearWishlist } = useCart();

  useEffect(() => {
    // Only run in browser, when authenticated, and userId is present
    if (typeof window === "undefined" || status !== "authenticated" || !session?.user) return;
    const userId = session.user.id || session.user.email;
    if (!userId) return;

    // Get cart and wishlist from localStorage
    const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const localWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");

    // Sync cart if present
    if (localCart.length > 0) {
      fetch("/api/sync-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, cart: localCart }),
      })
        .then(res => res.json())
        .then(() => {
          // console.log('[CartSyncOnLogin] Cart sync successful, clearing localStorage and setting context to localCart');
          localStorage.removeItem("cart");
          setCart(localCart); // Set context to localCart, not []
        })
        .catch(err => {
          // console.warn('[CartSyncOnLogin] Cart sync failed:', err);
        });
    } else {
      // If no local cart, fetch from backend and set context
      fetch("/api/sync-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, cart: [] }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.cart) {
            // console.log('[CartSyncOnLogin] Setting cart context from backend', data.cart);
            setCart(data.cart);
          }
        })
        .catch(err => {
          // console.warn('[CartSyncOnLogin] Cart fetch failed:', err);
        });
    }
    // Sync wishlist if present
    if (localWishlist.length > 0) {
      fetch("/api/sync-wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, wishlist: localWishlist }),
      })
        .then(res => res.json())
        .then(() => {
          // console.log('[CartSyncOnLogin] Wishlist sync successful, clearing localStorage and setting context to localWishlist');
          localStorage.removeItem("wishlist");
          setWishlist(localWishlist);
        })
        .catch(err => {
          // console.warn('[CartSyncOnLogin] Wishlist sync failed:', err);
        });
    } else {
      // If no local wishlist, fetch from backend and set context
      fetch("/api/sync-wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, wishlist: [] }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.wishlist) {
            // console.log('[CartSyncOnLogin] Setting wishlist context from backend', data.wishlist);
            setWishlist(data.wishlist);
          }
        })
        .catch(err => {
          // console.warn('[CartSyncOnLogin] Wishlist fetch failed:', err);
        });
    }
  }, [status, session, setCart, setWishlist]);

  return null;
}
