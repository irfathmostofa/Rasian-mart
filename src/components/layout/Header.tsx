"use client";

import Link from "next/link";
import { ShoppingCart, User, Search } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-primary">
          RasianMart
        </Link>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 mx-6">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
          />
          <button className="ml-2 bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary/90">
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4">
          <Link href="/account/login">
            <User className="w-5 h-5" />
          </Link>
          <Link href="/cart" className="relative">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full px-1">
              2
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
