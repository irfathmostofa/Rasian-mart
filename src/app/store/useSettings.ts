// app/store/useSettings.ts
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SettingsState {
  headerStyle: number;
  heroStyle: number;
  hydrated: boolean;
  setHeaderStyle: (style: number) => void;
  setHeroStyle: (style: number) => void;
  setHydrated: (state: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      headerStyle: 1,
      heroStyle: 1,
      hydrated: false,
      setHeaderStyle: (style) => set({ headerStyle: style }),
      setHeroStyle: (style) => set({ heroStyle: style }),
      setHydrated: (state) => set({ hydrated: state }),
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
