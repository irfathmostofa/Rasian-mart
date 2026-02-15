// app/store/useThemeStore.ts
"use client";
import { create } from "zustand";
import api from "@/lib/api";

interface ThemeStore {
  // Store parsed data by key_name for O(1) access
  data: Record<string, any>;
  loading: boolean;
  error: string | null;
  fetchThemeData: () => Promise<void>;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  data: {},
  loading: false,
  error: null,

  fetchThemeData: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get("/setup/get-setup-data");
      const items = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      // Convert array to object with key_name as property (O(1) lookup)
      const dataMap: Record<string, any> = {};
      items.forEach((item: any) => {
        try {
          // Parse JSON value once and store
          dataMap[item.key_name] = JSON.parse(item.value);
        } catch {
          dataMap[item.key_name] = item.value; // Fallback to raw value
        }
      });

      set({ data: dataMap, loading: false });
    } catch (error) {
      set({ error: "Failed to load theme", loading: false });
    }
  },
}));

// Simple selector hook for O(1) access
export const useThemeData = (key: string) => {
  return useThemeStore((state) => state.data[key]);
};
