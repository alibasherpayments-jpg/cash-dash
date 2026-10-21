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
  Zap,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface OfferwallItem {
  id: string;
  name: string;
  logo: string;
  url: string;
  badge: {
    ar: string;
    en: string;
    color: string;
  };
  rating: number;
  category: {
    ar: string;
    en: string;
  };
  description: {
    ar: string;
    en: string;
  };
  features: {
    ar: string[];
    en: string[];
  };
}

const OFFERWALLS: OfferwallItem[] = [
  {
    id: "taskwall",
    name: "Taskwall",
    logo: "/images/offerwalls/taskwall.png",
    url: "https://wall.taskwall.io/?app_id=6404e8a2318aa5f42725dd3c2cbc8d46",
    badge: {
      ar: "رصيد فوري ⚡",
      en: "Instant Credit ⚡",
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    },
    rating: 4.9,
    category: {
      ar: "استطلاعات ومهام رقمية",
      en: "Surveys & Micro-tasks",
    },
    description: {
      ar: "استطلاعات رأي سريعة، أبحاث سوقية، وتجارب استهلاكية موثوقة باحتساب فوري.",
      en: "Quick opinion surveys, consumer testing, and instant verified reward crediting.",
    },
    features: {
      ar: ["تأكيد تلقائي", "استطلاعات يومية", "متاح عالمياً"],
      en: ["Auto Verified", "Daily Surveys", "Global Access"],
    },
  },
  {
    id: "cpalead",
    name: "CPALead",
    logo: "/images/offerwalls/cpalead.png",
    url: "https://www.cdnnd.com/wall/MDUA3yf",
    badge: {
      ar: "الأعلى طلباً 🔥",
      en: "Most Popular 🔥",
      color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    },
    rating: 4.8,
    category: {
      ar: "ألعاب وتطبيقات جوال",
      en: "Apps & Mobile Games",
    },
    description: {
      ar: "تثبيت ألعاب وتطبيقات الجوال العالمية مع تجارب مجانية بعوائد نقدية ممتازة.",
      en: "Global mobile games, app installations, and verified trials with top payouts.",
    },
    features: {
      ar: ["ألعاب وتطبيقات", "تحديث مستمر", "دعم iOS وأندرويد"],
      en: ["Top Apps", "Daily Refresh", "iOS & Android"],
    },
  },
  {
    id: "clickwall",
    name: "ClickWall",
    logo: "/images/offerwalls/clickwall.png",
    url: "https://clickwall.net/app/iframe/10326",
    badge: {
      ar: "نقرات سريعة 🎯",
      en: "PTC & Clicks 🎯",
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
    rating: 4.8,
    category: {
      ar: "إعلانات ونقرات PTC",
      en: "PTC Ads & Quick Tasks",
    },
    description: {
      ar: "مشاهدة إعلانات، نقرات PTC سريعة، زيارة مواقع وتصفح بدون أي شروط معقدة.",
      en: "PTC clicks, simple ad views, website visits, and mini-tasks with instant tracking.",
    },
    features: {
      ar: ["مهام فورية", "سهل وسريع", "نقاط فورية"],
      en: ["Instant Tasks", "Easy & Fast", "Instant Points"],
    },
  },
  {
    id: "pixylabs",
    name: "PixyLabs",
    logo: "/images/offerwalls/pixylabs.png",
    url: "https://offerwall.pixylabs.co/362",
    badge: {
      ar: "مكافآت ضخمة 💎",
      en: "High Payouts 💎",
      color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    },
    rating: 5.0,
    category: {
      ar: "ألعاب كبرى وعروض VIP",
      en: "Tiered Games & VIP Offers",
    },
    description: {
      ar: "ألعاب فيديو شهيرة ومستويات متعددة تقدم أكبر عدد نقاط ممكن للمهمة الواحدة.",
      en: "Top mobile games with multi-tier milestones and premium high-point rewards.",
    },
    features: {
      ar: ["أعلى عائد", "ألعاب مشهورة", "مكافآت مستمرة"],
      en: ["Highest EPC", "Top Titles", "Milestone Rewards"],
    },
  },
  {
    id: "mooffers",
    name: "MoOffers",
    logo: "/images/offerwalls/mooffers.svg",
    url: "https://wall.mooffers.com/offerwall/app_9d4ef29931152938",
    badge: {
      ar: "شريك حصري ⭐",
      en: "Exclusive Partner ⭐",
      color: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    },
    rating: 4.9,
    category: {
      ar: "عروض مباشرة ومعلنون كبار",
      en: "Direct Advertiser Offers",
    },
    description: {
      ar: "حائط عروض عالمي مباشر مع كبار المعلنين العالميين، يتميز بتأكيد فوري عبر الـ Postback.",
      en: "Global offerwall direct from top advertisers with real-time postback confirmation.",
    },
    features: {
      ar: ["معلنون مباشرون", "عروض حصرية", "تأكيد آلي"],
      en: ["Direct Advertisers", "Exclusive Wall", "Auto Postback"],
    },
  },
];

export default function OfferwallsPage() {
  const { user } = useAuthStore();
  const { t, locale } = useTranslation();
  const [selectedWall, setSelectedWall] = useState<OfferwallItem | null>(null);

  const getWallUrl = (wall: OfferwallItem) => {
    const subId = user?.id || "guest";
    const separator = wall.url.includes("?") ? "&" : "?";
    if (wall.id === "mooffers") {
      return `https://wall.mooffers.com/offerwall/app_9d4ef29931152938?uid=${encodeURIComponent(subId)}`;
    }
    if (wall.id === "clickwall") {
      return `https://clickwall.net/app/iframe/10326/${encodeURIComponent(subId)}`;
    }
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

  const isAr = locale === "ar";

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center justify-center gap-3">
          <Layers className="h-8 w-8 text-primary" /> {t.offerwalls.title}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {t.offerwalls.subtitle}
        </p>

        {/* Micro Trust & Info Badges */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold text-[11px]">
            <Zap className="h-3 w-3" />
            {isAr ? "احتساب وتأكيد آلي فوري" : "Instant Postback Crediting"}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold text-[11px]">
            <ShieldCheck className="h-3 w-3" />
            {isAr ? "شركاء عالميون معتمدون 100%" : "100% Verified Partners"}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 font-semibold text-[11px]">
            <Sparkles className="h-3 w-3" />
            {isAr ? "أعلى عوائد للنقاط" : "Highest Payout Rates"}
          </span>
        </div>
      </div>

      {/* ─── Offerwalls Card Showcase (Balanced & Symmetrical on Desktop) ─── */}
      <div className="flex flex-wrap justify-center gap-5 sm:gap-6 pt-2">
        {OFFERWALLS.map((wall) => {
          const badgeText = isAr ? wall.badge.ar : wall.badge.en;
          const categoryText = isAr ? wall.category.ar : wall.category.en;
          const descText = isAr ? wall.description.ar : wall.description.en;
          const featuresList = isAr ? wall.features.ar : wall.features.en;

          return (
            <Card
              key={wall.id}
              onClick={() => handleOpenWall(wall)}
              className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-sm border-border hover:border-primary/60 bg-card hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 rounded-3xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer group hover:-translate-y-1.5"
            >
              <div className="space-y-4">
                {/* Header: Badge + Rating */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${wall.badge.color}`}>
                    {badgeText}
                  </span>
                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[11px] font-bold shrink-0">
                    <span>★</span>
                    <span>{wall.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Logo viewport with high contrast & proper aspect ratio */}
                <div className="w-full h-28 rounded-2xl bg-[#0c0f17] border border-border/80 p-4 flex items-center justify-center relative overflow-hidden shadow-inner group-hover:border-primary/50 group-hover:bg-[#0f1422] transition-all duration-300">
                  <img
                    src={wall.logo}
                    alt={wall.name}
                    className="max-h-16 max-w-[85%] object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Title & Category */}
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                    {wall.name}
                  </h3>
                  <p className="text-xs font-semibold text-primary">
                    {categoryText}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed pt-1">
                    {descText}
                  </p>
                </div>

                {/* Feature Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {featuresList.map((f, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-secondary/50 border border-border/60 text-[10px] font-medium text-muted-foreground"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons: Modal Viewer + Direct New Tab */}
              <div className="pt-5 flex items-center gap-2">
                <Button
                  variant="default"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenWall(wall);
                  }}
                  className="flex-1 font-bold text-xs sm:text-sm h-11 rounded-xl shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 group-hover:bg-primary group-hover:text-primary-foreground transition-all active:scale-[0.98]"
                >
                  <span>{t.offerwalls.openWall}</span>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="h-11 px-3 sm:px-3.5 rounded-xl border-border/80 hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-all shrink-0 active:scale-[0.98]"
                  title={t.offerwalls.openNewWindow}
                >
                  <a
                    href={getWallUrl(wall)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-4 w-4 rtl:rotate-180" />
                    <span className="text-xs font-semibold inline-block ms-1">
                      {isAr ? "تبويب" : "Tab"}
                    </span>
                  </a>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ─── Offerwall Viewer Modal Dialog ──────────────────────── */}
      <Dialog open={!!selectedWall} onOpenChange={(open) => !open && setSelectedWall(null)}>
        <DialogContent className="w-[96vw] max-w-5xl h-[92dvh] sm:h-[88vh] p-0 flex flex-col overflow-hidden border-border bg-card rounded-2xl">
          {selectedWall && (
            <>
              {/* Modal Header */}
              <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border flex flex-row items-center justify-between space-y-0 bg-card shrink-0">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-[#0c0f17] border border-border/60 p-1.5 flex items-center justify-center shrink-0">
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

                <div className="flex items-center gap-2 pe-10 sm:pe-12 shrink-0">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="text-xs font-semibold gap-1.5 h-8.5 rounded-lg border-border hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-all"
                  >
                    <a
                      href={getWallUrl(selectedWall)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3.5 w-3.5 rtl:rotate-180" />
                      <span>{t.offerwalls.openNewWindow}</span>
                    </a>
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
              <div className="px-4 sm:px-6 py-2.5 border-t border-border bg-card/60 flex items-center justify-between text-[11px] text-muted-foreground">
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
