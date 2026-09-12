"use client";

import React from "react";
import { usePlatformSettings } from "@/hooks/use-platform-settings";
import { AlertTriangle } from "lucide-react";

export function MaintenanceBanner() {
  const { settings } = usePlatformSettings();

  if (!settings?.maintenanceMode) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 font-bold text-xs py-2 px-4 shadow-md sticky top-0 z-50 flex items-center justify-center gap-2">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>
        System Notice: Cash Dash is currently in scheduled maintenance mode. Earning offers and cashouts are temporarily paused.
      </span>
    </div>
  );
}