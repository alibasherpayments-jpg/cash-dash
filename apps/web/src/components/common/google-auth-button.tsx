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
          prompt: (notification?: (notification: any) => void) => void;
          cancel: () => void;
        };
        oauth2: {
          initTokenClient: (config: any) => {
            requestAccessToken: (options?: any) => void;
          };
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
  const [buttonRendered, setButtonRendered] = useState(false);
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
    if (!scriptLoaded || typeof window === "undefined" || !window.google?.accounts?.id) {
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

      if (buttonRef.current) {
        buttonRef.current.innerHTML = "";
        const targetWidth = Math.min(
          Math.max(buttonRef.current.offsetWidth || 340, 240),
          380
        );

        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: resolvedTheme === "dark" ? "filled_black" : "outline",
          size: "large",
          text: mode === "signup" ? "signup_with" : "signin_with",
          shape: "pill",
          logo_alignment: "left",
          width: targetWidth,
        });

        // Check if button actually injected iframe
        setTimeout(() => {
          if (buttonRef.current && buttonRef.current.children.length > 0) {
            setButtonRendered(true);
          }
        }, 300);
      }
    } catch (err) {
      console.error("Error rendering Google button:", err);
    }
  }, [scriptLoaded, resolvedTheme, mode]);

  // Fallback OAuth2 popup click handler
  const handleCustomClick = () => {
    if (typeof window === "undefined") return;

    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;

    setIsLoading(true);

    if (window.google?.accounts?.oauth2) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "email profile openid",
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.access_token) {
              await handleCredentialResponse({ credential: tokenResponse.access_token });
            } else if (tokenResponse?.error) {
              setIsLoading(false);
              toast.error(`Google sign-in error: ${tokenResponse.error}`);
            } else {
              setIsLoading(false);
            }
          },
          error_callback: (err: any) => {
            setIsLoading(false);
            console.error("Token client error:", err);
            toast.error("Google sign-in popup error. Please verify Authorized Origins in Google Console.");
          },
        });
        tokenClient.requestAccessToken({ prompt: "select_account" });
        return;
      } catch (e) {
        console.warn("initTokenClient failed, falling back to prompt:", e);
      }
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setIsLoading(false);
          toast.error("Google prompt could not be displayed. Please check your browser popup settings.");
        }
      });
      return;
    }

    setIsLoading(false);
    toast.error("Google Services are loading, please try again in a moment.");
  };

  return (
    <div className={`w-full flex flex-col items-center justify-center relative min-h-[44px] ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-card/80 backdrop-blur-xs rounded-full flex items-center justify-center z-20">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}

      {/* Official Google Button Render Mount Target */}
      <div
        ref={buttonRef}
        className={`w-full flex justify-center items-center overflow-hidden rounded-full transition-all ${
          buttonRendered ? "block" : "hidden"
        }`}
      />

      {/* Interactive Fallback/Custom Google Button when native button is loading or not yet rendered */}
      {!buttonRendered && (
        <button
          type="button"
          onClick={handleCustomClick}
          disabled={isLoading}
          className="w-full h-11 px-4 rounded-full border border-border bg-card hover:bg-muted/40 cursor-pointer flex items-center justify-center gap-3 text-xs font-semibold text-foreground transition-all shadow-xs hover:shadow-md active:scale-[0.99]"
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
