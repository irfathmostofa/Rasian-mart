import { useCart } from "@/app/store/useCart";
import { Search, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import CategoryNav from "./navigation/CategoryNav";

export default function HeaderThree() {
  const { cart } = useCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
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

      {/* Category Navigation */}
      <CategoryNav />
    </header>
  );
}
