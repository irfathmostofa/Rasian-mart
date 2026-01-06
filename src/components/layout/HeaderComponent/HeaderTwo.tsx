"use client";

import Link from "next/link";
import { ShoppingCart, Search, Heart, X, Menu } from "lucide-react";
import { useCart } from "@/app/store/useCart";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import CategoryNav from "./navigation/CategoryNav";
import { motion, AnimatePresence } from "framer-motion";
import LiveNewsTicker from "./LiveNewsTicker";
import { useUserStore } from "@/app/store/useUserStore";
import { useProductStore } from "@/app/store/useProductStore";
import { useWishlist } from "@/app/store/useWishlist";

export default function HeaderTwo() {
  const { cart } = useCart();
  const { items } = useWishlist();
  const { user, clearSession } = useUserStore();
  const { products, fetchProducts } = useProductStore();

  const router = useRouter();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* 🔍 Search redirect handler */
  const handleSearch = () => {
    if (query.trim().length < 2) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setFocused(false);
    setMobileSearch(false);
  };

  /* 🔍 Search suggestions */
  const filteredProducts = useMemo(() => {
    if (query.length < 3) return [];
    return products.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, products]);

  return (
    <header className="sticky top-0 z-50 bg-white shadow">
      {/* 🔹 Topbar */}
      <div className="bg-primary text-white text-xs md:text-sm overflow-hidden">
        <div className="container mx-auto flex justify-between items-center px-4 py-2">
          {/* Live Ticker */}
          <div>
            <LiveNewsTicker />
          </div>

          {/* Desktop Links */}
          <nav className="hidden sm:flex gap-4 whitespace-nowrap ml-4">
            <Link href="/">Help</Link>
            <Link href="/track-order">Track Order</Link>
            {user ? (
              <Link href="/profile">{user.full_name}</Link>
            ) : (
              <>
                <Link href="/account/login">Login</Link>
                <Link href="/account/signup">Signup</Link>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* 🔹 Main Header */}
      <div className="container mx-auto flex items-center justify-between px-4 py-4 relative">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            className="md:hidden p-2 rounded hover:bg-gray-100"
            onClick={() => setMobileMenu(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link href="/" className="text-2xl font-bold text-primary">
            BizzHut
          </Link>
        </div>

        {/* 🔍 Desktop Search */}
        <div className="hidden md:flex flex-1 mx-6 max-w-2xl relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder="Search for products, brands, categories..."
            className="flex-1 rounded-l-full border px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
          />
          <button
            onClick={handleSearch}
            className="bg-primary text-white px-4 rounded-r-full hover:bg-primary/90"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* 🔽 Suggestions */}
          {focused && query.length >= 3 && (
            <div className="absolute top-12 left-0 w-full bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto z-50">
              {filteredProducts.length === 0 ? (
                <div className="flex items-center justify-center gap-3 p-4">
                  <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <span className="text-sm text-gray-600">Searching...</span>
                </div>
              ) : (
                <>
                  {filteredProducts.map((product) => {
                    const imgSrc =
                      product.images?.[0]?.url || "/placeholder.png";
                    return (
                      <div
                        key={product.id}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          router.push(`/product/${product.id}`);
                          setFocused(false);
                        }}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <img
                          src={imgSrc}
                          alt={product.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <p className="text-sm font-medium truncate">
                          {product.name}
                        </p>
                      </div>
                    );
                  })}

                  {/* View all results */}
                  <div
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleSearch}
                    className="px-4 py-2 text-sm text-primary hover:bg-gray-100 cursor-pointer border-t"
                  >
                    View all results for “{query}”
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-4">
          <button
            className="md:hidden p-2 rounded hover:bg-gray-100"
            onClick={() => setMobileSearch(true)}
          >
            <Search className="w-5 h-5" />
          </button>

          <Link href="/wishlist" className="relative">
            <Heart className="w-5 h-5" />
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full px-1">
                {items.length}
              </span>
            )}
          </Link>

          <Link href="/cart" className="relative">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full px-1">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* 🔹 Mobile Search */}
      <AnimatePresence>
        {mobileSearch && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            className="fixed inset-0 z-50 bg-white p-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setMobileSearch(false)}>
                <X className="w-6 h-6" />
              </button>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search products..."
                className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔹 Mobile Menu */}
      <AnimatePresence>
        {mobileMenu && (
          <>
            <motion.div
              className="fixed inset-0 bg-black z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenu(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed top-0 right-0 w-80 h-full bg-white z-50 shadow-lg overflow-y-auto"
            >
              <div className="flex justify-between items-center px-4 py-4 border-b">
                <span className="text-lg font-semibold">
                  {user ? "Welcome" : "Menu"}
                </span>
                <button onClick={() => setMobileMenu(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-4 space-y-6">
                <CategoryNav mobile />

                <div className="flex flex-col gap-3">
                  <Link href="/track-order">Track Order</Link>
                  {user ? (
                    <>
                      <Link href="/profile">{user.full_name}</Link>
                      <p
                        onClick={clearSession}
                        className="cursor-pointer text-red-500"
                      >
                        Logout
                      </p>
                    </>
                  ) : (
                    <>
                      <Link href="/account/login">Login</Link>
                      <Link href="/account/signup">Signup</Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 🔹 Desktop Categories */}
      <div className="hidden md:block">
        <CategoryNav />
      </div>
    </header>
  );
}
