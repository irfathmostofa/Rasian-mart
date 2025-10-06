// app/store/useHydration.ts
"use client";
import { useEffect, useState } from "react";
import { useSettings } from "./useSettings";

export const useHydrationReady = () => {
  const [hydrated, setHydrated] = useState(false);

  const settingsReady = useSettings((state) => state.hydrated);
  //   const userReady = useAppStore((state) => state.hydrated);
  //   const cartReady = useCart((state) => state.hydrated);

  useEffect(() => {
    if (settingsReady) {
      setHydrated(true);
    }
  }, [settingsReady]);

  return hydrated;
};
