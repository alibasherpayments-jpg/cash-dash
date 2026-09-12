"use client";

import React, { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { apiGet } from "@/lib/api-client";
import { Coins } from "lucide-react";
import type { ApiResponse, UserPublic } from "@cashdash/shared";

// Routes accessible by visitors when not logged in:
// - The home page ("/") is the only allowed public browsing page.
// - Essential auth routes so users can create an account, log in, or recover passwords.
const PUBLIC_ALLOWED_PATHS = [
  "/",
  "/register",
  "/login",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, setUser, setLoading } = useAuthStore();
  const [isClientReady, setIsClientReady] = useState(false);

  // Synchronously check if credentials exist in localStorage
  const checkStoredAuth = (): boolean => {
    if (typeof window === "undefined") return false;
    try {
      const raw = localStorage.getItem("cashdash-auth");
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return !!(parsed?.state?.accessToken && parsed?.state?.isAuthenticated);
    } catch {
      return false;
    }
  };

  useEffect(() => {
    setIsClientReady(true);
    const hasSession = checkStoredAuth();

    if (hasSession) {
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
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [setUser, setLoading]);

  // Route protection effect
  useEffect(() => {
    if (!isClientReady) return;

    const hasSession = isAuthenticated || checkStoredAuth();
    const normalizedPath = pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
    const isPublicAllowed = PUBLIC_ALLOWED_PATHS.includes(normalizedPath);

    // If NOT logged in and trying to access any page other than allowed public pages:
    if (!hasSession && !isPublicAllowed) {
      router.replace("/register");
      return;
    }

    // If already logged in and visiting login or register:
    if (hasSession && (normalizedPath === "/login" || normalizedPath === "/register")) {
      router.replace("/dashboard");
    }
  }, [isClientReady, isAuthenticated, pathname, router]);

  // If client is ready, user has no session, and current page is protected:
  // Render loading state while redirecting to avoid content flash
  const normalizedPath = pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  const isProtectedPath = !PUBLIC_ALLOWED_PATHS.includes(normalizedPath);

  if (isClientReady && !isAuthenticated && !checkStoredAuth() && isProtectedPath) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/25 animate-pulse">
            <Coins className="h-6 w-6" />
          </div>
          <p className="text-xs text-muted-foreground font-medium">Redirecting to register...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

