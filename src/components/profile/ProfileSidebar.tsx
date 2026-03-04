"use client";
import { User, LogOut, Heart, Package, MapPin, Star } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { useUserStore } from "@/app/store/useUserStore";

type TabType = "profile" | "orders" | "wishlist" | "reviews" | "addresses";

interface Tab {
  id: TabType;
  label: string;
  icon: React.ReactNode;
}

interface ProfileSidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function ProfileSidebar({
  activeTab,
  onTabChange,
}: ProfileSidebarProps) {
  const router = useRouter();
  const { user, clearSession } = useUserStore();

  const tabs: Tab[] = [
    { id: "profile", label: "Profile", icon: <User className="w-5 h-5" /> },
    { id: "orders", label: "Orders", icon: <Package className="w-5 h-5" /> },
    { id: "wishlist", label: "Wishlist", icon: <Heart className="w-5 h-5" /> },
    {
      id: "addresses",
      label: "Addresses",
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      id: "reviews",
      label: "Reviews",
      icon: <Star className="w-5 h-5" />,
    },
  ];

  const handleTabClick = (tab: TabType) => {
    onTabChange(tab);
  };

  const handleLogout = () => {
    clearSession();
    router.push("/account/login");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* User Info Card */}
      <Card className="p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
            <User className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {user?.full_name || "User"}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {user?.email || "user@example.com"}
            </p>
          </div>
        </div>
      </Card>

      {/* Tabs Menu */}
      <Card className="p-2 overflow-hidden rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span
                className={
                  activeTab === tab.id ? "text-indigo-600" : "text-gray-500"
                }
              >
                {tab.icon}
              </span>
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Logout Button */}
      <Card className="p-4 rounded-xl shadow-sm border border-gray-100">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
      </Card>
    </div>
  );
}
