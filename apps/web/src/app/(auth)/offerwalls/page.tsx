"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useTranslation } from "@/providers/i18n-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Layers,
  ExternalLink,
  Coins,
  ShieldCheck,
} from "lucide-react";

interface OfferwallItem {
  id: string;
  name: string;
  logo: string;
  url: string;
}

const OFFERWALLS: OfferwallItem[] = [
  {
    id: "taskwall",
    name: "Taskwall.io",
    logo: "/images/offerwalls/taskwall.png",
    url: "https://wall.taskwall.io/?app_id=6404e8a2318aa5f42725dd3c2cbc8d46",
  },
  {
    id: "cpalead",
    name: "CPALead",
    logo: "/images/offerwalls/cpalead.png",
    url: "https://www.cdnnd.com/wall/MDUA3yf",
  },
  {
    id: "clickwall",
    name: "ClickWall.io",
    logo: "/images/offerwalls/clickwall.png",
    url: "https://clickwall.io/wall?app_id=cashdash",
  },
  {
    id: "pixylabs",
    name: "PixyLabs",
    logo: "/images/offerwalls/pixylabs.png",
    url: "https://offerwall.pixylabs.co/362",
  },
];

export default function OfferwallsPage() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [selectedWall, setSelectedWall] = useState<OfferwallItem | null>(null);

  const getWallUrl = (wall: OfferwallItem) => {
    const subId = user?.id || "guest";
    const separator = wall.url.includes("?") ? "&" : "?";
    if (wall.id === "taskwall") {
      return `${wall.url}${separator}userid=${encodeURIComponent(subId)}`;
    }
    if (wall.id === "cpalead") {
      return `${wall.url}${separator}subid=${encodeURIComponent(subId)}`;
    }
    if (wall.id === "pixylabs") {
      return `https://offerwall.pixylabs.co/362?uid=${encodeURIComponent(subId)}`;
    }
    return `${wall.url}${separator}user_id=${encodeURIComponent(subId)}&sub_id=${encodeURIComponent(subId)}&subid=${encodeURIComponent(subId)}`;
  };

  const handleOpenWall = (wall: OfferwallItem) => {
    setSelectedWall(wall);
  };

  const handleOpenExternal = (wall: OfferwallItem) => {
    window.open(getWallUrl(wall), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center justify-center gap-3">
          <Layers className="h-8 w-8 text-primary" /> {t.offerwalls.title}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {t.offerwalls.subtitle}
        </p>
      </div>

      {/* ─── Offerwalls 4-Card Grid (Only Logo + Name) ──────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 pt-4">
        {OFFERWALLS.map((wall) => (
          <Card
            key={wall.id}
            onClick={() => handleOpenWall(wall)}
            className="border-border hover:border-primary/60 bg-card hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 rounded-3xl p-6 flex flex-col items-center justify-between text-center cursor-pointer group hover:-translate-y-1"
          >
            <div className="w-full flex flex-col items-center space-y-5">
              {/* Sleek dark-contrast logo viewport */}
              <div className="w-full h-36 rounded-2xl bg-[#0c0f17] border border-border/70 p-6 flex items-center justify-center shadow-inner group-hover:border-primary/50 group-hover:shadow-lg transition-all duration-300">
                <img
                  src={wall.logo}
                  alt={wall.name}
                  className="max-h-20 max-w-[85%] object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Company Name */}
              <h3 className="text-xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                {wall.name}
              </h3>
            </div>

            {/* Launch Button */}
            <div className="w-full pt-6">
              <Button
                variant="default"
                className="w-full font-bold text-xs h-10 rounded-xl shadow-md shadow-primary/20 flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-primary-foreground"
              >
                <span>{t.offerwalls.openWall} ({wall.name})</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* ─── Offerwall Viewer Modal Dialog ──────────────────────── */}
      <Dialog open={!!selectedWall} onOpenChange={(open) => !open && setSelectedWall(null)}>
        <DialogContent className="w-[96vw] max-w-4xl h-[92dvh] sm:h-[85vh] p-0 flex flex-col overflow-hidden border-border bg-card rounded-2xl">
          {selectedWall && (
            <>
              {/* Modal Header */}
              <DialogHeader className="px-3.5 sm:px-6 py-3 sm:py-4 border-b border-border flex flex-row items-center justify-between space-y-0 bg-card shrink-0">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-[#0c0f17] border border-border/60 p-1 flex items-center justify-center shrink-0">
                    <img
                      src={selectedWall.logo}
                      alt={selectedWall.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <DialogTitle className="text-sm sm:text-base font-bold flex items-center gap-2 truncate">
                      {selectedWall.name}
                    </DialogTitle>
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground flex items-center gap-1.5 truncate">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      {user?.username ? `@${user.username}` : "Member"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pr-6 sm:pr-8 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenExternal(selectedWall)}
                    className="text-xs font-semibold gap-1.5 h-8"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t.offerwalls.openNewWindow}</span>
                  </Button>
                </div>
              </DialogHeader>

              {/* Embedded Offerwall Container */}
              <div className="flex-1 w-full bg-[#0b0c10] relative flex items-center justify-center">
                <iframe
                  src={getWallUrl(selectedWall)}
                  title={selectedWall.name}
                  className="w-full h-full border-0"
                  allow="camera; microphone; geolocation"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                />
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-2.5 border-t border-border bg-card/60 flex items-center justify-between text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Coins className="h-3.5 w-3.5 text-accent" />
                  <span>{t.offerwalls.instructions}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedWall(null)}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  {t.offerwalls.close}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
