// app/store/useHydration.ts
"use client";
import { useEffect, useState } from "react";
import { useSettings } from "./useSettings";
import { useAppStore } from "./useAppStore";
import { useCategoryStore } from "./useCatrgoryStore";
import { useProductStore } from "./useProductStore";

export const useHydrationReady = () => {
  const [hydrated, setHydrated] = useState(false);

  const settingsReady = useSettings((state) => state.hydrated);
  const productReady = useProductStore((state) => state.hydrated);
  const catReady = useCategoryStore((state) => state.hydrated);

  useEffect(() => {
    if (settingsReady && catReady && productReady) {
      setHydrated(true);
    }
  }, [settingsReady, catReady, productReady]);

  return hydrated;
};
