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
  Menu,
  X,
} from "lucide-react";

type TabType = "profile" | "orders" | "wishlist" | "reviews" | "addresses";

// Define TAB_CONFIG here
const TAB_CONFIG = {
  profile: {
    label: "Profile Info",
    icon: User,
    component: ProfileInfo,
    description: "Manage your personal information",
  },
  orders: {
    label: "My Orders",
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
    label: "My Reviews",
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

export default function UserProfile() {
  useRequireAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get tab from URL or default to "profile"
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const tabFromUrl = searchParams.get("tab") as TabType;
    return tabFromUrl && tabFromUrl in TAB_CONFIG ? tabFromUrl : "profile";
  });

  // Update URL when tab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`/profile?${params.toString()}`, { scroll: false });
  };

  // Sync tab state with URL params
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") as TabType;
    if (tabFromUrl && tabFromUrl !== activeTab && tabFromUrl in TAB_CONFIG) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
  //     </div>
  //   );
  // }

  const ActiveComponent = TAB_CONFIG[activeTab].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm">
              <Home className="w-4 h-4 text-gray-400" />
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Profile</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-indigo-600">
                {TAB_CONFIG[activeTab].label}
              </span>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop */}
          <div className="hidden lg:block lg:w-80">
            <div className="sticky top-20">
              <ProfileSidebar
                activeTab={activeTab}
                onTabChange={handleTabChange}
              />
            </div>
          </div>

          {/* Mobile Menu Overlay */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                />
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "tween", duration: 0.3 }}
                  className="fixed top-0 left-0 bottom-0 w-80 bg-white z-50 lg:hidden overflow-y-auto"
                >
                  <div className="p-4">
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 rounded-lg hover:bg-gray-100"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <ProfileSidebar
                      activeTab={activeTab}
                      onTabChange={handleTabChange}
                    />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Main Content Area */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Tab Header - Desktop */}
              <div className="hidden lg:block border-b border-gray-200 bg-gray-50/50 px-6 py-4">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = TAB_CONFIG[activeTab].icon;
                    return <Icon className="w-6 h-6 text-indigo-600" />;
                  })()}
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                      {TAB_CONFIG[activeTab].label}
                    </h1>
                    <p className="text-sm text-gray-500">
                      {TAB_CONFIG[activeTab].description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6">
                <ActiveComponent />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
