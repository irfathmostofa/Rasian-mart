// app/store/useSettings.ts
"use client";

import { create } from "zustand";

interface SettingsState {
  headerStyle: number;
  heroStyle: number;
  setHeaderStyle: (style: number) => void;
  setHeroStyle: (style: number) => void;
}

export const useSettings = create<SettingsState>((set) => ({
  headerStyle: 1,
  heroStyle: 1,
  setHeaderStyle: (style) => set({ headerStyle: style }),
  setHeroStyle: (style) => set({ heroStyle: style }),
}));
