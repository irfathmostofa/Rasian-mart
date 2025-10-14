// src/lib/useRequireAuth.ts
"use client"; // ⚠️ Must be at the very top

import { useEffect } from "react";
import { useUserStore } from "@/app/store/useUserStore";
import { useRouter } from "next/navigation";

export const useRequireAuth = () => {
  const router = useRouter();
  const { user, loading } = useUserStore();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/account/login");
    }
  }, [user, loading, router]);
};
