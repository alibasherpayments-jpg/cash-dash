"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, CheckCircle2, Lock, Sparkles, Award } from "lucide-react";

interface AchievementItem {
  id: string;
  name: string;
  desc: string;
  xp: number;
  unlocked: boolean;
  progress: number;
  total: number;
  color: string;
}

const ACHIEVEMENTS: AchievementItem[] = [
  { id: "ach-1", name: "First Reward", desc: "Complete your first offer and earn points", xp: 50, unlocked: true, progress: 1, total: 1, color: "bg-indigo-500" },
  { id: "ach-2", name: "Offer Master I", desc: "Complete 10 eligible offers or surveys", xp: 150, unlocked: true, progress: 10, total: 10, color: "bg-purple-500" },
  { id: "ach-3", name: "First Cashout", desc: "Request your first reward payout", xp: 100, unlocked: true, progress: 1, total: 1, color: "bg-emerald-500" },
  { id: "ach-4", name: "Week Warrior", desc: "Maintain a 7-day active earning streak", xp: 200, unlocked: false, progress: 5, total: 7, color: "bg-amber-500" },
  { id: "ach-5", name: "Offer Master II", desc: "Complete 50 eligible offers or surveys", xp: 500, unlocked: false, progress: 12, total: 50, color: "bg-pink-500" },
  { id: "ach-6", name: "Century Club", desc: "Withdraw over $100 equivalent in rewards", xp: 500, unlocked: false, progress: 15, total: 100, color: "bg-cyan-500" },
  { id: "ach-7", name: "Social Butterfly", desc: "Invite your first friend who earns points", xp: 100, unlocked: true, progress: 4, total: 1, color: "bg-orange-500" },
  { id: "ach-8", name: "Offer Legend", desc: "Complete 100 offers on CashDash", xp: 1000, unlocked: false, progress: 12, total: 100, color: "bg-rose-500" },
];

export default function AchievementsPage() {
  const unlockedCount = ACHIEVEMENTS.filter((a) => a.unlocked).length;
  const totalXp = ACHIEVEMENTS.filter((a) => a.unlocked).reduce((sum, a) => sum + a.xp, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* ─── Header & Progress Hero ───────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-primary/15 via-card to-accent/10 border border-primary/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-7 w-7 text-amber-500" />
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Achievements & Badges
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
            Unlock prestige trophies and bonus XP as you complete earning milestones
          </p>
        </div>

        <div className="flex items-center gap-4 bg-background/60 p-4 rounded-xl border border-border">
          <div className="text-center">
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Unlocked</span>
            <span className="text-xl font-black text-foreground">{unlockedCount} / {ACHIEVEMENTS.length}</span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Prestige XP</span>
            <span className="text-xl font-black text-amber-500">{totalXp} XP</span>
          </div>
        </div>
      </div>

      {/* ─── Achievements Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ACHIEVEMENTS.map((ach) => {
          const pct = Math.min(100, Math.round((ach.progress / ach.total) * 100));
          return (
            <Card
              key={ach.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                ach.unlocked
                  ? "bg-card border-border shadow-sm"
                  : "bg-card/40 border-border/40 opacity-70"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`h-10 w-10 rounded-xl ${ach.color} flex items-center justify-center text-white shadow-md`}
                  >
                    <Award className="h-5 w-5" />
                  </div>
                  {ach.unlocked ? (
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-bold">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Unlocked
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground text-[10px]">
                      <Lock className="h-3 w-3 mr-1" /> Locked
                    </Badge>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-sm text-foreground">{ach.name}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{ach.desc}</p>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-border/60">
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-mono text-foreground font-semibold">
                    {ach.progress} / {ach.total}
                  </span>
                </div>
                <Progress value={pct} className="h-1.5" />
                <span className="text-[10px] font-bold text-accent block text-right pt-0.5">
                  +{ach.xp} XP
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
