"use client";
import { useAuthStore } from "@/store/auth-store";
import { useCallback } from "react";
import { logout as apiLogout } from "@/lib/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, logout: storeLogout } = useAuthStore();
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (_) {}
    storeLogout();
    router.push("/login");
    toast.success("Logged out successfully");
  }, [storeLogout, router]);

  return { user, isAuthenticated, isLoading, logout };
}
