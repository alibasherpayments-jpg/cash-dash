"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
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
    url: "https://cpalead.com/offerwall?id=cashdash",
  },
  {
    id: "clickwall",
    name: "ClickWall.io",
    logo: "/images/offerwalls/clickwall.png",
    url: "https://clickwall.io/wall?app_id=cashdash",
  },
];

export default function OfferwallsPage() {
  const { user } = useAuthStore();
  const [selectedWall, setSelectedWall] = useState<OfferwallItem | null>(null);

  const getWallUrl = (wall: OfferwallItem) => {
    const subId = user?.id || "guest";
    const separator = wall.url.includes("?") ? "&" : "?";
    // Taskwall uses "userid"; CPALead & ClickWall use "user_id"/"sub_id"/"subid"
    if (wall.id === "taskwall") {
      return `${wall.url}${separator}userid=${encodeURIComponent(subId)}`;
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
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center justify-center gap-3">
          <Layers className="h-8 w-8 text-primary" /> Offerwalls
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Select an offerwall network below to start completing offers and earning Cash Dash points
        </p>
      </div>

      {/* ─── Offerwalls 3-Card Grid (Only Logo + Name) ──────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 pt-4">
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
                <span>Open {wall.name}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* ─── Offerwall Viewer Modal Dialog ──────────────────────── */}
      <Dialog open={!!selectedWall} onOpenChange={(open) => !open && setSelectedWall(null)}>
        <DialogContent className="max-w-4xl h-[85vh] p-0 flex flex-col overflow-hidden border-border bg-card">
          {selectedWall && (
            <>
              {/* Modal Header */}
              <DialogHeader className="px-6 py-4 border-b border-border flex flex-row items-center justify-between space-y-0 bg-card shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-[#0c0f17] border border-border/60 p-1 flex items-center justify-center">
                    <img
                      src={selectedWall.logo}
                      alt={selectedWall.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-bold flex items-center gap-2">
                      {selectedWall.name}
                    </DialogTitle>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      Synchronized with user account @{user?.username || "member"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pr-6">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenExternal(selectedWall)}
                    className="text-xs font-semibold gap-1.5"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Open in New Window</span>
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
                  <span>Points credited automatically upon offer completion (1,000 pts = $1.00 USD)</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedWall(null)}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
