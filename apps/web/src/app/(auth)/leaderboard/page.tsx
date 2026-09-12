"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AvatarWithFallback } from "@/components/common/avatar-with-fallback";
import { Trophy, Medal, Crown, TrendingUp, Users, ShieldCheck } from "lucide-react";
import { formatCash, formatPoints } from "@/lib/formatters";

interface LeaderboardUser {
  rank: number;
  username: string;
  avatarUrl?: string;
  withdrawn: number;
  earned: number;
  referrals: number;
  country: string;
}

const TOP_USERS: LeaderboardUser[] = [
  { rank: 1, username: "alex_dash", withdrawn: 482000, earned: 964000, referrals: 42, country: "US" },
  { rank: 2, username: "mia_rewards", withdrawn: 451000, earned: 902000, referrals: 35, country: "UK" },
  { rank: 3, username: "sam_earner", withdrawn: 412000, earned: 824000, referrals: 29, country: "CA" },
  { rank: 4, username: "elena_crypto", withdrawn: 375000, earned: 750000, referrals: 24, country: "DE" },
  { rank: 5, username: "david_surveys", withdrawn: 340000, earned: 680000, referrals: 18, country: "FR" },
  { rank: 6, username: "sarah_gamer", withdrawn: 310000, earned: 620000, referrals: 16, country: "AU" },
  { rank: 7, username: "marcus_tech", withdrawn: 285000, earned: 570000, referrals: 14, country: "US" },
  { rank: 8, username: "yuki_tokyo", withdrawn: 260000, earned: 520000, referrals: 12, country: "JP" },
  { rank: 9, username: "lucas_saopaulo", withdrawn: 235000, earned: 470000, referrals: 9, country: "BR" },
  { rank: 10, username: "chloe_points", withdrawn: 210000, earned: 420000, referrals: 7, country: "NL" },
];

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<"WITHDRAWALS" | "EARNERS" | "REFERRERS">("WITHDRAWALS");

  const top3 = TOP_USERS.slice(0, 3);
  const remaining = TOP_USERS.slice(3);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <Trophy className="h-7 w-7 text-amber-500" /> Platform Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Recognizing our top platform achievers based strictly on completed, verified activity
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-card border border-border rounded-xl">
          <Button
            size="sm"
            variant={activeTab === "WITHDRAWALS" ? "default" : "ghost"}
            onClick={() => setActiveTab("WITHDRAWALS")}
            className="text-xs font-semibold h-8"
          >
            Top Withdrawn
          </Button>
          <Button
            size="sm"
            variant={activeTab === "EARNERS" ? "default" : "ghost"}
            onClick={() => setActiveTab("EARNERS")}
            className="text-xs font-semibold h-8"
          >
            Top Earners
          </Button>
          <Button
            size="sm"
            variant={activeTab === "REFERRERS" ? "default" : "ghost"}
            onClick={() => setActiveTab("REFERRERS")}
            className="text-xs font-semibold h-8"
          >
            Top Referrers
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
              {activeTab === "WITHDRAWALS" ? "Total Withdrawn" : activeTab === "EARNERS" ? "Total Earned" : "Referrals"}
            </span>
            <span className="text-lg font-black text-foreground">
              {activeTab === "WITHDRAWALS"
                ? formatCash(top3[1].withdrawn / 10000)
                : activeTab === "EARNERS"
                ? formatPoints(top3[1].earned)
                : `${top3[1].referrals} Friends`}
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
              CHAMPION #1
            </Badge>
            <h3 className="font-black text-lg text-foreground">{top3[0].username}</h3>
            <span className="text-xs text-muted-foreground uppercase">{top3[0].country}</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span className="text-[10px] uppercase font-bold text-amber-500 block">
              {activeTab === "WITHDRAWALS" ? "Total Withdrawn" : activeTab === "EARNERS" ? "Total Earned" : "Referrals"}
            </span>
            <span className="text-2xl font-black text-emerald-500">
              {activeTab === "WITHDRAWALS"
                ? formatCash(top3[0].withdrawn / 10000)
                : activeTab === "EARNERS"
                ? formatPoints(top3[0].earned)
                : `${top3[0].referrals} Friends`}
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
              {activeTab === "WITHDRAWALS" ? "Total Withdrawn" : activeTab === "EARNERS" ? "Total Earned" : "Referrals"}
            </span>
            <span className="text-lg font-black text-foreground">
              {activeTab === "WITHDRAWALS"
                ? formatCash(top3[2].withdrawn / 10000)
                : activeTab === "EARNERS"
                ? formatPoints(top3[2].earned)
                : `${top3[2].referrals} Friends`}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Ranks 4 - 10 Table ───────────────────────────────────── */}
      <Card className="border-border">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-base font-bold">Top 10 Rankings</CardTitle>
          <CardDescription className="text-xs">
            Refreshed daily from confirmed ledger transactions
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

                <div className="text-right">
                  <span className="font-bold text-sm text-foreground block">
                    {activeTab === "WITHDRAWALS"
                      ? formatCash(user.withdrawn / 10000)
                      : activeTab === "EARNERS"
                      ? formatPoints(user.earned)
                      : `${user.referrals} referrals`}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {formatPoints(user.withdrawn)} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── User's Own Position Card ─────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-card to-accent/10 border border-primary/30 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm">
            #127
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Your Position</span>
            <h4 className="font-bold text-sm text-foreground">You are ranked #127 on CashDash</h4>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-muted-foreground block">Points to Rank #100</span>
          <span className="text-sm font-bold text-primary">+85,500 pts needed</span>
        </div>
      </div>
    </div>
  );
}
