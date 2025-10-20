"use client";

import { useEffect } from "react";
import { useUserStore } from "@/app/store/useUserStore";
import { useRouter } from "next/navigation";

export const useLogedAuth = () => {
  const router = useRouter();
  const { user, loading } = useUserStore();

  useEffect(() => {
    if (user) {
      router.push("/profile");
    }
  }, [user, loading, router]);
};
