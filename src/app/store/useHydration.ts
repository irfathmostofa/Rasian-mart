// app/store/useHydration.ts
"use client";
import { useEffect, useState } from "react";
import { useSettings } from "./useSettings";
import { useAppStore } from "./useAppStore";
import { useCategoryStore } from "./useCatrgoryStore";

export const useHydrationReady = () => {
  const [hydrated, setHydrated] = useState(false);

  const settingsReady = useSettings((state) => state.hydrated);
  // const userReady = useAppStore((state) => state.hydrated);
  const catReady = useCategoryStore((state) => state.hydrated);

  useEffect(() => {
    if (settingsReady && catReady) {
      setHydrated(true);
    }
  }, [settingsReady, catReady]);

  return hydrated;
};
