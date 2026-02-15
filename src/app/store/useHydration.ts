// app/store/useHydration.ts
"use client";
import { useEffect, useState } from "react";
import { useSettings } from "./useSettings";
import { useCategoryStore } from "./useCatrgoryStore";
import { useThemeStore } from "./useThemeData";

export const useHydrationReady = () => {
  const [hydrated, setHydrated] = useState(false);

  const settingsReady = useSettings((state) => state.hydrated);
  // const productReady = useProductStore((state) => state.hydrated);
  const catReady = useCategoryStore((state) => state.hydrated);
  // const templateReady = useTemplateStore((state) => state.hydrated);
  const themeReady = useThemeStore((state) => !state.loading && state.data);

  useEffect(() => {
    useThemeStore.getState().fetchThemeData();
  }, []);
  useEffect(() => {
    if (settingsReady && catReady && themeReady) {
      setHydrated(true);
    }
  }, [settingsReady, catReady, themeReady]);

  return hydrated;
};
