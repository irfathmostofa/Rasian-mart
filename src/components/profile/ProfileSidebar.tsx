"use client";
import { User, LogOut, Camera } from "lucide-react";

import { useAppStore } from "@/app/store/useAppStore";
import { useRouter } from "next/navigation";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { useUserStore } from "@/app/store/useUserStore";

export default function ProfileSidebar() {
  const router = useRouter();
  const { user, clearSession } = useUserStore();

  const handleLogout = () => {
    clearSession();
    router.push("/account/login");
  };

  return (
    <div className="flex flex-col gap-4 md:w-1/4">
      <Card className="p-4 flex flex-col items-center text-center">
        <div className="relative group w-24 h-24 ">
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold uppercase shadow-md transition-all duration-300 group-hover:scale-105">
            {user?.full_name
              ? user.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
              : "?"}
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
