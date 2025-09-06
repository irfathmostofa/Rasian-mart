// components/headers/HeaderTwo.tsx
"use client";

import Link from "next/link";
import { ShoppingCart, User, Search, Heart, X } from "lucide-react";
import { useCart } from "@/app/store/useCart";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { demoProducts } from "@/components/dummyData/demoProducts";

export default function HeaderTwo() {
  const { cart } = useCart();
  const router = useRouter();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (query.length < 3) return [];
    return demoProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      {/* 🔹 Topbar */}
      <div className="bg-primary text-white text-xs md:text-sm">
        <div className="container mx-auto flex justify-between items-center px-4 py-2">
          <span>📦 Free delivery on orders over $50</span>
          <nav className="flex gap-4">
            <Link href="/help" className="hover:underline">
              Help
            </Link>
            <Link href="/track-order" className="hover:underline">
              Track Order
            </Link>
            <Link href="/offers" className="hover:underline">
              Offers
            </Link>
          </nav>
        </div>
      </div>

      {/* 🔹 Main Row */}
      <div className="container mx-auto flex items-center justify-between px-4 py-4 relative">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-primary">
          RasianMart
        </Link>

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
            onClick={() => setMobileSearch(!mobileSearch)}
          >
            {mobileSearch ? (
              <X className="w-5 h-5" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>

          <Link href="/wishlist" className="hover:text-primary relative">
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

      {/* 🔹 Mobile Search */}
      {mobileSearch && (
        <div className="md:hidden px-4 pb-3 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
          />
          {filteredProducts.length > 0 && (
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
                    <span className="text-sm font-medium">{product.name}</span>
                    <span className="text-xs text-gray-500">
                      ${product.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 🔹 Categories Nav */}
      <div className="bg-gray-50 border-t border-b">
        <div className="container mx-auto flex gap-6 px-4 py-2 text-sm font-medium text-gray-700 overflow-x-auto">
          <Link href="/category/groceries" className="hover:text-primary">
            Groceries
          </Link>
          <Link href="/category/electronics" className="hover:text-primary">
            Electronics
          </Link>
          <Link href="/category/fashion" className="hover:text-primary">
            Fashion
          </Link>
          <Link href="/category/home" className="hover:text-primary">
            Home
          </Link>
          <Link href="/category/beauty" className="hover:text-primary">
            Beauty
          </Link>
          <Link href="/category/sports" className="hover:text-primary">
            Sports
          </Link>
        </div>
      </div>
    </header>
  );
}
