"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BellRing, BellOff, Volume2, VolumeX, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/use-notifications";
import { useTranslation } from "@/providers/i18n-provider";
import { localizeNotification } from "@/lib/localize-notification";
import apiClient from "@/lib/api-client";

// Synthesizer Web Audio API pleasant two-tone chime (zero external assets needed)
export function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // First tone - 523.25 Hz (C5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.45);

    // Second chime chord - 783.99 Hz (G5) for rewarding sparkle
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(783.99, now + 0.12);
    gain2.gain.setValueAtTime(0.18, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch {
    // AudioContext blocked by user agent policy
  }
}

export function OfferAlertsToggle() {
  const { t, locale } = useTranslation();
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [browserPerm, setBrowserPerm] = useState<NotificationPermission>("default");
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  const { notifications, refetch } = useNotifications();
  const lastKnownIdRef = useRef<string | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    setMounted(true);
    const storedAlerts = localStorage.getItem("cashdash_offer_alerts_enabled");
    const storedSound = localStorage.getItem("cashdash_offer_alerts_sound");
    const storedLastId = localStorage.getItem("cashdash_offer_alerts_last_id");

    if (storedAlerts !== null) {
      setAlertsEnabled(storedAlerts === "true");
    } else {
      localStorage.setItem("cashdash_offer_alerts_enabled", "true");
    }

    if (storedSound !== null) {
      setSoundEnabled(storedSound === "true");
    } else {
      localStorage.setItem("cashdash_offer_alerts_sound", "true");
    }

    if (storedLastId) {
      lastKnownIdRef.current = storedLastId;
    }

    if (typeof window !== "undefined" && "Notification" in window) {
      setBrowserPerm(Notification.permission);
    }
  }, []);

  // Request browser desktop/mobile notifications permission
  const requestBrowserPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      toast.info(t.offerAlerts.browserPermDesc);
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      setBrowserPerm(perm);
      if (perm === "granted") {
        toast.success(t.offerAlerts.enabledToast);
      } else {
        toast.error(t.offerAlerts.disabledToast);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAlerts = (checked: boolean) => {
    setAlertsEnabled(checked);
    localStorage.setItem("cashdash_offer_alerts_enabled", checked ? "true" : "false");
    if (checked) {
      toast.success(t.offerAlerts.enabledToast);
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
        requestBrowserPermission();
      }
    } else {
      toast.info(t.offerAlerts.disabledToast);
    }
  };

  const handleToggleSound = (checked: boolean) => {
    setSoundEnabled(checked);
    localStorage.setItem("cashdash_offer_alerts_sound", checked ? "true" : "false");
    if (checked) {
      playNotificationChime();
      toast.success(t.offerAlerts.soundLabel);
    }
  };

  // Watch for new notifications in real-time
  useEffect(() => {
    if (!mounted || !alertsEnabled || notifications.length === 0) return;

    const newest = notifications[0];
    if (!newest) return;

    if (!lastKnownIdRef.current) {
      lastKnownIdRef.current = newest.id;
      localStorage.setItem("cashdash_offer_alerts_last_id", newest.id);
      return;
    }

    if (newest.id !== lastKnownIdRef.current) {
      lastKnownIdRef.current = newest.id;
      localStorage.setItem("cashdash_offer_alerts_last_id", newest.id);

      if (newest.type === "REWARD_ADDED" || newest.title?.includes("احتساب") || newest.title?.includes("Offer") || newest.title?.includes("Reward")) {
        if (soundEnabled) {
          playNotificationChime();
        }

        const { title: locTitle, message: locMessage } = localizeNotification(newest, locale);

        toast.success(locTitle, {
          description: locMessage,
          duration: 9000,
          action: {
            label: t.common.wallet,
            onClick: () => {
              window.location.href = "/wallet";
            },
          },
        });

        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          try {
            new Notification(locTitle, {
              body: locMessage,
              icon: "/icon-192.png",
              badge: "/icon-192.png",
            });
          } catch (e) {
            console.warn("Browser notification error:", e);
          }
        }
      }
    }
  }, [notifications, alertsEnabled, soundEnabled, mounted, locale, t.common.wallet]);

  // Test notification button
  const handleTestAlert = async () => {
    setIsTesting(true);
    try {
      if (soundEnabled) {
        playNotificationChime();
      }

      try {
        await apiClient.post("/notifications/test-alert");
        refetch();
      } catch {
        // Fallback test
      }

      const sampleTitle = t.offerAlerts.testRewardTitle;
      const sampleMessage = t.offerAlerts.testRewardMessage;

      toast.success(sampleTitle, {
        description: sampleMessage,
        duration: 9000,
        action: {
          label: t.common.wallet,
          onClick: () => {
            window.location.href = "/wallet";
          },
        },
      });

      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        try {
          new Notification(sampleTitle, {
            body: sampleMessage,
            icon: "/icon-192.png",
          });
        } catch (e) {
          console.warn(e);
        }
      }
    } finally {
      setIsTesting(false);
    }
  };

  if (!mounted) return null;

  return (
    <Popover>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 rounded-lg hover:bg-accent/15 transition-all"
                aria-label={t.offerAlerts.buttonTitle}
              >
                {alertsEnabled ? (
                  <>
                    <BellRing className="h-4 w-4 text-emerald-400 animate-pulse" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                  </>
                ) : (
                  <BellOff className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">
              {alertsEnabled
                ? `${t.offerAlerts.buttonTitle}: ${t.common.active}`
                : `${t.offerAlerts.buttonTitle}: ${t.common.rejected}`}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent align="end" className="w-80 p-4 space-y-4 shadow-2xl border-border/80">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground leading-tight">{t.offerAlerts.popoverTitle}</h4>
              <p className="text-[10px] text-muted-foreground">Live Offer Credited Alerts</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={alertsEnabled ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px]" : "text-[10px] text-muted-foreground"}
          >
            {alertsEnabled ? t.common.active : t.common.rejected}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {t.offerAlerts.popoverDesc}
        </p>

        {/* Toggles */}
        <div className="space-y-3 pt-1 border-t border-border/40">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-xs font-semibold text-foreground cursor-pointer block">
                {t.offerAlerts.toggleLabel}
              </label>
              <span className="text-[10px] text-muted-foreground block">{t.offerAlerts.testNotice}</span>
            </div>
            <Switch checked={alertsEnabled} onCheckedChange={handleToggleAlerts} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-xs font-semibold text-foreground cursor-pointer block flex items-center gap-1.5">
                {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-emerald-500" /> : <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />}
                {t.offerAlerts.soundLabel}
              </label>
              <span className="text-[10px] text-muted-foreground block">{t.offerAlerts.soundDesc}</span>
            </div>
            <Switch checked={soundEnabled} onCheckedChange={handleToggleSound} disabled={!alertsEnabled} />
          </div>

          {/* Browser Notification Permission status */}
          <div className="pt-2 border-t border-border/40">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">{t.offerAlerts.browserPermAlert}:</span>
              <span className={browserPerm === "granted" ? "text-emerald-500 font-semibold" : "text-amber-500 font-medium"}>
                {browserPerm === "granted" ? "✓ Granted" : "Off"}
              </span>
            </div>
            {browserPerm !== "granted" && (
              <Button
                variant="outline"
                size="sm"
                onClick={requestBrowserPermission}
                className="w-full text-xs h-8 bg-secondary/40 hover:bg-secondary border-dashed"
              >
                <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-primary" />
                {t.offerAlerts.enableBrowserBtn}
              </Button>
            )}
          </div>
        </div>

        {/* Test Alert Button */}
        <div className="pt-1">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleTestAlert}
            disabled={isTesting}
            className="w-full text-xs font-semibold h-9 rounded-xl border border-border/60 hover:border-primary/50 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
            {isTesting ? t.offerAlerts.testing : t.offerAlerts.testButton}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
