"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: () => void;
          cancel: () => void;
        };
      };
    };
  }
}

const DEFAULT_GOOGLE_CLIENT_ID =
  "219845067052-r4t9s9qfor0bi7q46etc01fejtps4q2r.apps.googleusercontent.com";

interface GoogleAuthButtonProps {
  mode?: "signin" | "signup";
  referralCode?: string;
  onSuccess?: () => void;
  className?: string;
}

export function GoogleAuthButton({
  mode = "signin",
  referralCode,
  onSuccess,
  className = "",
}: GoogleAuthButtonProps) {
  const router = useRouter();
  const { loginWithGoogle } = useAuthStore();
  const { resolvedTheme } = useTheme();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [effectiveRefCode, setEffectiveRefCode] = useState<string | undefined>(referralCode);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const code = referralCode || params.get("ref") || params.get("referral") || undefined;
      setEffectiveRefCode(code);
    }
  }, [referralCode]);

  const handleCredentialResponse = async (response: { credential?: string }) => {
    if (!response?.credential) {
      toast.error("Google sign-in was cancelled or failed");
      return;
    }

    setIsLoading(true);
    try {
      await loginWithGoogle(response.credential, effectiveRefCode);
      toast.success(
        mode === "signup" ? "Account created successfully with Google!" : "Signed in with Google!"
      );
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("Google login error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Could not authenticate with Google. Please try again.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Load GIS Script
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      return;
    }

    const existingScript = document.getElementById("google-gsi-client");
    if (existingScript) {
      existingScript.addEventListener("load", () => setScriptLoaded(true));
      return;
    }

    const script = document.createElement("script");
    script.id = "google-gsi-client";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      console.warn("Failed to load Google Identity Services SDK");
    };
    document.body.appendChild(script);
  }, []);

  // Initialize and Render Button
  useEffect(() => {
    if (!scriptLoaded || !buttonRef.current || typeof window === "undefined" || !window.google?.accounts?.id) {
      return;
    }

    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      buttonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: resolvedTheme === "dark" ? "filled_black" : "outline",
        size: "large",
        text: mode === "signup" ? "signup_with" : "signin_with",
        shape: "pill",
        logo_alignment: "left",
        width: buttonRef.current.offsetWidth || 360,
      });
    } catch (err) {
      console.error("Error rendering Google button:", err);
    }
  }, [scriptLoaded, resolvedTheme, mode]);

  return (
    <div className={`w-full flex flex-col items-center justify-center relative min-h-[44px] ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-card/80 backdrop-blur-xs rounded-full flex items-center justify-center z-10">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}

      {/* Official Google Button Render Mount Target */}
      <div
        ref={buttonRef}
        className="w-full flex justify-center items-center overflow-hidden rounded-full shadow-xs hover:shadow-md transition-shadow"
      />

      {/* Fallback button while Google script loads or renders */}
      {!scriptLoaded && (
        <button
          type="button"
          disabled
          className="w-full h-11 px-4 rounded-full border border-border bg-card/60 flex items-center justify-center gap-3 text-xs font-semibold text-muted-foreground transition-all opacity-80"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{mode === "signup" ? "Sign up with Google" : "Sign in with Google"}</span>
        </button>
      )}
    </div>
  );
}
