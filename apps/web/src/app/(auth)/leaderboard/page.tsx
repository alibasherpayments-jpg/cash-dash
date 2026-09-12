"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/providers/i18n-provider";
import { AvatarWithFallback } from "@/components/common/avatar-with-fallback";
import { Trophy, Medal, Crown, TrendingUp, Users, ShieldCheck } from "lucide-react";
import { formatCash, formatPoints, formatPointsAsCash } from "@/lib/formatters";

interface LeaderboardUser {
  rank: number;
  username: string;
  avatarUrl?: string;
  withdrawn: number;
  earned: number;
  country: string;
}

const TOP_USERS: LeaderboardUser[] = [
  { rank: 1, username: "alex_dash", withdrawn: 482000, earned: 964000, country: "US" },
  { rank: 2, username: "mia_rewards", withdrawn: 451000, earned: 902000, country: "UK" },
  { rank: 3, username: "sam_earner", withdrawn: 412000, earned: 824000, country: "CA" },
  { rank: 4, username: "elena_crypto", withdrawn: 375000, earned: 750000, country: "DE" },
  { rank: 5, username: "david_surveys", withdrawn: 340000, earned: 680000, country: "FR" },
  { rank: 6, username: "sarah_gamer", withdrawn: 310000, earned: 620000, country: "AU" },
  { rank: 7, username: "marcus_tech", withdrawn: 285000, earned: 570000, country: "US" },
  { rank: 8, username: "yuki_tokyo", withdrawn: 260000, earned: 520000, country: "JP" },
  { rank: 9, username: "lucas_saopaulo", withdrawn: 235000, earned: 470000, country: "BR" },
  { rank: 10, username: "chloe_points", withdrawn: 210000, earned: 420000, country: "NL" },
];

export default function LeaderboardPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"WITHDRAWALS" | "EARNERS">("WITHDRAWALS");

  const top3 = TOP_USERS.slice(0, 3);
  const remaining = TOP_USERS.slice(3);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <Trophy className="h-7 w-7 text-amber-500" /> {t.leaderboard.title}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {t.leaderboard.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-card border border-border rounded-xl">
          <Button
            size="sm"
            variant={activeTab === "WITHDRAWALS" ? "default" : "ghost"}
            onClick={() => setActiveTab("WITHDRAWALS")}
            className="text-xs font-semibold h-8"
          >
            {t.leaderboard.tabs.withdrawn}
          </Button>
          <Button
            size="sm"
            variant={activeTab === "EARNERS" ? "default" : "ghost"}
            onClick={() => setActiveTab("EARNERS")}
            className="text-xs font-semibold h-8"
          >
            {t.leaderboard.tabs.earners}
          </Button>
        </div>
      </div>

      {/* ─── Top 3 Podium Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 items-end">
        {/* #2 Silver */}
        <div className="order-2 md:order-1 p-6 rounded-2xl bg-card border border-slate-700/60 shadow-lg text-center space-y-3 relative">
          <div className="mx-auto h-8 w-8 rounded-full bg-slate-400/20 text-slate-300 font-black text-sm flex items-center justify-center">
            2
          </div>
          <AvatarWithFallback username={top3[1].username} size="lg" className="mx-auto" />
          <div>
            <h4 className="font-bold text-base text-foreground">{top3[1].username}</h4>
            <span className="text-xs text-muted-foreground uppercase">{top3[1].country}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-accent/5 border border-border">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              {activeTab === "WITHDRAWALS" ? t.leaderboard.totalWithdrawn : t.leaderboard.totalEarned}
            </span>
            <span className="text-lg font-black text-foreground">
              {activeTab === "WITHDRAWALS"
                ? formatPointsAsCash(top3[1].withdrawn)
                : formatPoints(top3[1].earned)}
            </span>
          </div>
        </div>

        {/* #1 Gold (Elevated) */}
        <div className="order-1 md:order-2 p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-amber-500/15 via-card to-card border-amber-500/40 shadow-xl shadow-amber-500/10 text-center space-y-4 relative md:-translate-y-4">
          <div className="mx-auto h-10 w-10 rounded-full bg-amber-500 text-slate-950 font-black text-base flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Crown className="h-5 w-5" />
          </div>
          <AvatarWithFallback username={top3[0].username} size="lg" className="mx-auto ring-4 ring-amber-500/30" />
          <div>
            <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 text-[10px] font-bold mb-1">
              #1 CHAMPION
            </Badge>
            <h3 className="font-black text-lg text-foreground">{top3[0].username}</h3>
            <span className="text-xs text-muted-foreground uppercase">{top3[0].country}</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span className="text-[10px] uppercase font-bold text-amber-500 block">
              {activeTab === "WITHDRAWALS" ? t.leaderboard.totalWithdrawn : t.leaderboard.totalEarned}
            </span>
            <span className="text-2xl font-black text-emerald-500">
              {activeTab === "WITHDRAWALS"
                ? formatPointsAsCash(top3[0].withdrawn)
                : formatPoints(top3[0].earned)}
            </span>
          </div>
        </div>

        {/* #3 Bronze */}
        <div className="order-3 md:order-3 p-6 rounded-2xl bg-card border border-amber-800/40 shadow-lg text-center space-y-3 relative">
          <div className="mx-auto h-8 w-8 rounded-full bg-amber-800/20 text-amber-600 font-black text-sm flex items-center justify-center">
            3
          </div>
          <AvatarWithFallback username={top3[2].username} size="lg" className="mx-auto" />
          <div>
            <h4 className="font-bold text-base text-foreground">{top3[2].username}</h4>
            <span className="text-xs text-muted-foreground uppercase">{top3[2].country}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-accent/5 border border-border">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              {activeTab === "WITHDRAWALS" ? t.leaderboard.totalWithdrawn : t.leaderboard.totalEarned}
            </span>
            <span className="text-lg font-black text-foreground">
              {activeTab === "WITHDRAWALS"
                ? formatPointsAsCash(top3[2].withdrawn)
                : formatPoints(top3[2].earned)}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Ranks 4 - 10 Table ───────────────────────────────────── */}
      <Card className="border-border">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-base font-bold">{t.leaderboard.title}</CardTitle>
          <CardDescription className="text-xs">
            {t.leaderboard.subtitle}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {remaining.map((user) => (
              <div key={user.rank} className="p-4 flex items-center justify-between hover:bg-accent/5 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <span className="font-mono text-sm font-bold text-muted-foreground w-6 text-center">
                    #{user.rank}
                  </span>
                  <AvatarWithFallback username={user.username} size="sm" />
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-foreground truncate">{user.username}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{user.country}</p>
                  </div>
                </div>

                <div className="text-end">
                  <span className="font-bold text-sm text-foreground block">
                    {activeTab === "WITHDRAWALS"
                      ? formatPointsAsCash(user.withdrawn)
                      : formatPoints(user.earned)}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {formatPoints(user.withdrawn)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
