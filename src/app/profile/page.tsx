"use client";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import ProfileInfo from "@/components/profile/ProfileInfo";
import AddressManager from "@/components/profile/AddressManager";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { useState, useMemo } from "react";
import ProfileOrders from "@/components/profile/ProfileOrders";
import Wishlist from "@/components/profile/WishList";

type TabType = "profile" | "orders" | "wishlist" | "settings" | "addresses";

export default function UserProfile() {
  useRequireAuth();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Profile Section */}
      <div className="flex flex-col md:flex-row gap-6 ">
        {/* Sidebar */}
        <ProfileSidebar activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6">
          {activeTab === "profile" && <ProfileInfo />}
          {activeTab === "addresses" && <AddressManager />}
          {activeTab === "wishlist" && <Wishlist />}
          {activeTab === "orders" && <ProfileOrders />}
          {/* Add future tabs here */}
        </div>
      </div>
    </div>
  );
}
