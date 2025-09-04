"use client";

import Link from "next/link";
import { ShoppingCart, User, Search, X } from "lucide-react";
import { useCart } from "@/app/store/useCart";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { demoProducts } from "../dummyData/demoProducts";

export default function Header() {
  const { cart } = useCart();
  const router = useRouter();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false); // 📱 mobile toggle

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const userName = "Joy";

  const filteredProducts = useMemo(() => {
    if (query.length < 3) return [];
    return demoProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-4 py-3 relative">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-primary">
          RasianMart
        </Link>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 mx-6 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder="Search products..."
            className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none focus:border-none"
          />
          <button className="ml-2 bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary/90">
            <Search className="w-4 h-4" />
          </button>

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
                  <div className="flex flex-col">
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

          {/* Account with Greeting */}
          <Link
            href="/account/login"
            className="flex items-center gap-2 hover:text-primary transition"
          >
            <span className="hidden sm:inline font-medium">{greeting}</span>
            <User className="w-5 h-5" />
          </Link>

          {/* Cart */}
          <Link href="/cart" className="relative flex items-center gap-1">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full px-1">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Search Input */}
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
                  <div className="flex flex-col">
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
    </header>
  );
}
