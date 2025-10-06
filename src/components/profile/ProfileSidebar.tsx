"use client";
import { User, LogOut } from "lucide-react";

import { useAppStore } from "@/app/store/useAppStore";
import { useRouter } from "next/navigation";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

export default function ProfileSidebar() {
  const router = useRouter();
  const { user, logout } = useAppStore();

  const handleLogout = () => {
    logout();
    router.push("/account/login");
  };

  return (
    <div className="flex flex-col gap-4 md:w-1/4">
      <Card className="p-4 flex flex-col items-center text-center">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-primary mb-3">
          <img
            src="https://picsum.photos/100"
            alt="User Avatar"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1 cursor-pointer">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
        <h2 className="font-bold text-lg">{user?.full_name}</h2>
        <p className="text-sm text-gray-500">{user?.email}</p>
      </Card>

      <Card className="p-4 flex flex-col gap-2">
        <Button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2"
          variant="outline"
        >
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </Card>
    </div>
  );
}
