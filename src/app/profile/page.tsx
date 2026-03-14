"use client";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import ProfileInfo from "@/components/profile/ProfileInfo";
import AddressManager from "@/components/profile/AddressManager";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProfileOrders from "@/components/profile/ProfileOrders";
import Wishlist from "@/components/profile/WishList";
import ProductReviews from "@/components/profile/ProductReviews";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Home,
  ShoppingBag,
  Heart,
  Star,
  MapPin,
  User,
} from "lucide-react";

type TabType = "profile" | "orders" | "wishlist" | "reviews" | "addresses";

const TAB_CONFIG = {
  profile: {
    label: "Profile",
    icon: User,
    component: ProfileInfo,
    description: "Manage your personal information",
  },
  orders: {
    label: "Orders",
    icon: ShoppingBag,
    component: ProfileOrders,
    description: "Track and manage your orders",
  },
  wishlist: {
    label: "Wishlist",
    icon: Heart,
    component: Wishlist,
    description: "Your saved items",
  },
  reviews: {
    label: "Reviews",
    icon: Star,
    component: ProductReviews,
    description: "Reviews you've written",
  },
  addresses: {
    label: "Addresses",
    icon: MapPin,
    component: AddressManager,
    description: "Manage your shipping addresses",
  },
} as const;

const TABS = Object.entries(TAB_CONFIG) as [
  TabType,
  (typeof TAB_CONFIG)[TabType],
][];

export default function UserProfile() {
  useRequireAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const t = searchParams.get("tab") as TabType;
    return t && t in TAB_CONFIG ? t : "profile";
  });

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`/profile?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const t = searchParams.get("tab") as TabType;
    if (t && t !== activeTab && t in TAB_CONFIG) setActiveTab(t);
  }, [searchParams]);

  // Scroll active tab pill into view on mobile
  useEffect(() => {
    const el = document.getElementById(`tab-pill-${activeTab}`);
    el?.scrollIntoView({
      inline: "center",
      behavior: "smooth",
      block: "nearest",
    });
  }, [activeTab]);

  const ActiveComponent = TAB_CONFIG[activeTab].component;
  const ActiveIcon = TAB_CONFIG[activeTab].icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Breadcrumb (desktop only) ──────────────────────────────────────── */}
      <div className="hidden lg:block bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Home className="w-3.5 h-3.5" />
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Profile</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-medium text-primary">
              {TAB_CONFIG[activeTab].label}
            </span>
          </div>
        </div>
      </div>

      {/* ── Mobile: sticky scrollable tab bar ─────────────────────────────── */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div
          className="flex overflow-x-auto gap-1 px-3 py-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {TABS.map(([key, cfg]) => {
            const Icon = cfg.icon;
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                id={`tab-pill-${key}`}
                onClick={() => handleTabChange(key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-white shadow-sm shadow-primary/30 scale-[1.03]"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Page layout ────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar — desktop only */}
          <aside className="hidden lg:block lg:w-72 xl:w-80 shrink-0">
            <div className="sticky top-20">
              <ProfileSidebar
                activeTab={activeTab}
                onTabChange={handleTabChange}
              />
            </div>
          </aside>

          {/* Content area */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {/* Content card */}
                <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Card header */}
                  <div className="flex items-center gap-3 px-4 py-3.5 sm:px-6 sm:py-4 border-b border-gray-100 bg-gray-50/60">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <ActiveIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">
                        {TAB_CONFIG[activeTab].label}
                      </h1>
                      <p className="text-xs sm:text-sm text-gray-500 truncate hidden sm:block">
                        {TAB_CONFIG[activeTab].description}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-5 lg:p-6">
                    <ActiveComponent />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
