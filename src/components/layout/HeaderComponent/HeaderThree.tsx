// components/headers/HeaderThree.tsx
"use client";

import Link from "next/link";
import { ShoppingCart, User, Search } from "lucide-react";
import { useCart } from "@/app/store/useCart";

export default function HeaderThree() {
  const { cart } = useCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      {/* Top bar */}
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-2xl font-bold text-primary">
          RasianMart
        </Link>

        {/* Search */}
        <div className="hidden md:flex flex-1 mx-6">
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-l-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
          />
          <button className="bg-primary text-white px-4 py-2 rounded-r-lg hover:bg-primary/90">
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4">
          <Link href="/account/login" className="hover:text-primary">
            <User className="w-5 h-5" />
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

      {/* Category Nav */}
      <div className="bg-gray-50 border-t">
        <div className="container mx-auto px-4 py-2 flex gap-6 text-sm font-medium">
          <Link href="/category/groceries" className="hover:text-primary">
            Groceries
          </Link>
          <Link href="/category/electronics" className="hover:text-primary">
            Electronics
          </Link>
          <Link href="/category/fashion" className="hover:text-primary">
            Fashion
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
