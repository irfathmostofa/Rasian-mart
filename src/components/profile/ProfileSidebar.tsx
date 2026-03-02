"use client";
import { User, LogOut, Settings, Heart, Package, MapPin } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { useUserStore } from "@/app/store/useUserStore";

type TabType = "profile" | "orders" | "wishlist" | "settings" | "addresses";

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
  activeTab = "profile",
  onTabChange,
}: ProfileSidebarProps) {
  const router = useRouter();
  const { clearSession } = useUserStore();
  const [currentTab, setCurrentTab] = useState<TabType>(activeTab);

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
      id: "settings",
      label: "Settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const handleTabClick = (tab: TabType) => {
    setCurrentTab(tab);
    onTabChange?.(tab);
  };

  const handleLogout = () => {
    clearSession();
    router.push("/account/login");
  };

  return (
    <div className="flex flex-col gap-4 md:w-1/4">
      {/* Tabs Menu */}
      <Card className="p-0 overflow-hidden rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 border-l-4 ${
                currentTab === tab.id
                  ? "bg-indigo-50 border-l-gray-500 text-gray-600 font-medium"
                  : "bg-white border-l-transparent text-gray-700 hover:bg-gray-50 hover:text-gray-600"
              }`}
            >
              {tab.icon}
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Logout Button */}
      <Card className="p-4 flex flex-col rounded-xl shadow-sm border border-gray-100">
        <Button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 text-red-600 border-red-600 hover:bg-red-50"
          variant="outline"
        >
          <LogOut className="w-5 h-5" /> Logout
        </Button>
      </Card>
    </div>
  );
}
