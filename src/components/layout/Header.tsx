"use client";

import Link from "next/link";
import { ShoppingCart, User, Search } from "lucide-react";
import { useCart } from "@/app/store/useCart"; // ✅ import Zustand store
import { useMemo } from "react";

export default function Header() {
  const { cart } = useCart();

  // 🧮 total items count
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // 🧮 total price (not displayed but available if needed)
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // ⏰ Greeting based on time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  // 🧑 Example: you can replace with actual user name from auth store/session
  const userName = "Joy";

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
          {/* Account with Greeting */}
          <Link
            href="/account/login"
            className="flex items-center gap-2 hover:text-primary transition"
          >
            <span className="hidden sm:inline font-medium">
              {greeting}, {userName}
            </span>
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
    </header>
  );
}
