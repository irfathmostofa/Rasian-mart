// app/store/useHydration.ts
"use client";
import { useEffect, useState } from "react";
import { useSettings } from "./useSettings";
import { useAppStore } from "./useAppStore";
import { useCategoryStore } from "./useCatrgoryStore";
import { useProductStore } from "./useProductStore";
import { useTemplateStore } from "./useTamplate";
import { useUserStore } from "./useUserStore";

export const useHydrationReady = () => {
  const [hydrated, setHydrated] = useState(false);

  const settingsReady = useSettings((state) => state.hydrated);
  const productReady = useProductStore((state) => state.hydrated);
  const catReady = useCategoryStore((state) => state.hydrated);
  const templateReady = useTemplateStore((state) => state.hydrated);

  useEffect(() => {
    if (settingsReady && catReady && productReady && templateReady) {
      setHydrated(true);
    }
  }, [settingsReady, catReady, productReady, templateReady]);

  return hydrated;
};
