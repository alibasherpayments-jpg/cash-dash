"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  sidebarOpen: boolean;
  theme: "light" | "dark" | "system";
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useUIStore = create<UIState>()(persist(
  (set) => ({
    sidebarOpen: true,
    theme: "dark",
    setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setTheme: (theme) => set({ theme }),
  }),
  {
    name: "cashdash-ui",
    partialize: (state) => ({ theme: state.theme, sidebarOpen: state.sidebarOpen }),
  },
));
