"use client";

import Link from "next/link";
import { ShoppingCart, User, Search, Heart, X, Menu } from "lucide-react";
import { useCart } from "@/app/store/useCart";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { demoProducts } from "@/components/dummyData/demoProducts";
import CategoryNav from "./navigation/CategoryNav";
import { motion, AnimatePresence } from "framer-motion";

export default function HeaderTwo() {
  const { cart } = useCart();
  const router = useRouter();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const filteredProducts = useMemo(() => {
    if (query.length < 3) return [];
    return demoProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  return (
    <header className="sticky top-0 z-50 bg-white shadow">
      {/* Topbar */}
      <div className="bg-primary text-white text-xs md:text-sm">
        <div className="container mx-auto flex justify-between items-center px-4 py-2">
          <span>📦 Free delivery on orders over $50</span>
          <nav className="hidden sm:flex gap-4">
            <Link href="/" className="hover:underline">
              Help
            </Link>
            <Link href="/" className="hover:underline">
              Track Order
            </Link>
            <Link href="/" className="hover:underline">
              Offers
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Row */}
      <div className="container mx-auto flex items-center justify-between px-4 py-4 relative">
        {/* Mobile Hamburger */}
        <div className="flex items-center gap-4">
          <button
            className="md:hidden p-2 rounded hover:bg-gray-100"
            onClick={() => setMobileMenu(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary">
            RasianMart
          </Link>
        </div>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 mx-6 max-w-2xl relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder="Search for products, brands, categories..."
            className="flex-1 rounded-l-full border px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
          />
          <button className="bg-primary text-white px-4 rounded-r-full hover:bg-primary/90">
            <Search className="w-4 h-4" />
          </button>

          {/* Search Results */}
          {focused && filteredProducts.length > 0 && (
            <div className="absolute top-12 left-0 w-full bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto z-50">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => router.push(`/product/${product.id}`)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-gray-500">৳ {product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4">
          {/* Mobile Search Toggle */}
          <button
            className="md:hidden p-2 rounded hover:bg-gray-100"
            onClick={() => setMobileSearch(true)}
          >
            <Search className="w-5 h-5" />
          </button>
          <Link href="/" className="hover:text-primary relative">
            <Heart className="w-5 h-5" />
          </Link>
          <Link href="/account/login" className="hover:text-primary">
            <User className="w-5 h-5" />
          </Link>
          <Link href="/cart" className="relative hover:text-primary">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full px-1">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Search Overlay */}
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
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
              />
            </div>
            {filteredProducts.length > 0 && (
              <div className="overflow-y-auto max-h-[60vh]">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      router.push(`/product/${product.id}`);
                      setMobileSearch(false);
                    }}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-gray-500">৳ {product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Categories Sheet */}
      <AnimatePresence>
        {mobileMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setMobileMenu(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 w-80 max-w-full h-full bg-white z-50 shadow-lg overflow-y-auto"
            >
              <div className="flex justify-between items-center px-4 py-4 border-b">
                <span className="text-lg font-semibold">Categories</span>
                <button onClick={() => setMobileMenu(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4">
                <CategoryNav mobile />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Categories */}
      <div className="hidden md:block">
        <CategoryNav />
      </div>
    </header>
  );
}
