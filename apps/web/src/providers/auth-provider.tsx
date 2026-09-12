"use client";
import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/store/auth-store";
import { apiGet } from "@/lib/api-client";
import type { ApiResponse, UserPublic } from "@cashdash/shared";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    apiGet<ApiResponse<UserPublic>>("/auth/me")
      .then((res) => {
        if (res.success && res.data) {
          setUser(res.data);
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        setUser(null);
      });
  }, [setUser, setLoading]);

  return <>{children}</>;
}
