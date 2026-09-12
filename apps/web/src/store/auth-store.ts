"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { login as apiLogin, register as apiRegister } from "@/lib/auth";
import type { UserPublic } from "@cashdash/shared";

interface AuthState {
  user: UserPublic | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: UserPublic | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, referralCode?: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(persist(
  (set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
    setLoading: (isLoading) => set({ isLoading }),
    login: async (email, password) => {
      const res = await apiLogin({ email, password });
      if (res.data?.user) {
        set({ user: res.data.user, isAuthenticated: true, isLoading: false });
      }
    },
    register: async (username, email, password, referralCode) => {
      const res = await apiRegister({ username, email, password, referralCode });
      if (res.data?.user) {
        set({ user: res.data.user, isAuthenticated: true, isLoading: false });
      }
    },
    logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
  }),
  {
    name: "cashdash-auth",
    partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
  },
));
