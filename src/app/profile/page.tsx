"use client";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import ProfileInfo from "@/components/profile/ProfileInfo";
import AddressManager from "@/components/profile/AddressManager";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { useUserStore } from "../store/useUserStore";
import { useState, useMemo } from "react";

type TabType = "profile" | "orders" | "wishlist" | "settings" | "addresses";

export default function UserProfile() {
  useRequireAuth();
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    console.log("Active tab:", tab);
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Greeting */}
      <div className="px-6 py-2 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">
          {greeting}, {user?.full_name || "Guest"}
        </h2>
        <p className="text-sm md:text-base text-gray-600">
          Welcome back! Here’s your profile overview and quick access to your
          account.
        </p>
      </div>

      {/* Main Profile Section */}
      <div className="flex flex-col md:flex-row gap-6 p-6">
        {/* Sidebar */}
        <ProfileSidebar activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6">
          {activeTab === "profile" && <ProfileInfo />}
          {activeTab === "addresses" && <AddressManager />}
          {/* Add future tabs here */}
        </div>
      </div>
    </div>
  );
}
