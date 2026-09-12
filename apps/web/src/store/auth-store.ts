"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { login as apiLogin, register as apiRegister } from "@/lib/auth";
import type { UserPublic } from "@cashdash/shared";

interface AuthState {
  user: UserPublic | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: UserPublic | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, referralCode?: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(persist(
  (set) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
    setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
    setToken: (accessToken) => set({ accessToken }),
    setLoading: (isLoading) => set({ isLoading }),
    login: async (email, password) => {
      const res = await apiLogin({ email: email.trim().toLowerCase(), password });
      if (res.data?.user) {
        set({
          user: res.data.user,
          accessToken: (res.data as any).accessToken || null,
          refreshToken: (res.data as any).refreshToken || null,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    },
    register: async (username, email, password, referralCode) => {
      const res = await apiRegister({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        referralCode: referralCode?.trim(),
      });
      if (res.data?.user) {
        set({
          user: res.data.user,
          accessToken: (res.data as any).accessToken || null,
          refreshToken: (res.data as any).refreshToken || null,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    },
    logout: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false }),
  }),
  {
    name: "cashdash-auth",
    partialize: (state) => ({
      user: state.user,
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
      isAuthenticated: state.isAuthenticated,
    }),
  },
));
