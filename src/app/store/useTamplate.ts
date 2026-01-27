import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "@/lib/api";

interface Template {
  id: number;
  group_name: string;
  key_name: string;
  value: string;
  status: string;
  created_by: number;
  created_at: string;
  updated_by: number | null;
  updated_at: string | null;
  code: string;
}

interface TemplateState {
  Template: Template[];
  loading: boolean;
  hydrated: boolean;
  setHydrated: (state: boolean) => void;
  fetchTemplate: () => Promise<void>;
  setTemplate: (Template: Template[]) => void;
}

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      Template: [],
      loading: false,
      hydrated: false,

      setHydrated: (state) => set({ hydrated: state }),

      setTemplate: (Template) => set({ Template }),

      fetchTemplate: async () => {
        set({ loading: true });
        try {
          const response = await api.post("/setup/get-setup-data-by-key", {
            key_name: "Template",
          });

          if (response.data.length > 0) {
            const templates = Array.isArray(response.data.data)
              ? response.data.data
              : [response.data.data];
            set({ Template: templates, loading: false });
          }
        } catch (error) {
          console.error("Error fetching template:", error);
          set({ loading: false });
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "template-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
