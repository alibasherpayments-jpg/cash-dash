"use client";

import React from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { useWallet } from "@/hooks/use-wallet";
import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/common/stat-card";
import { TransactionItem } from "@/components/common/transaction-item";
import {
  Coins,
  ArrowUpRight,
  Gift,
  Bell,
  ArrowRight,
  Layers,
  ExternalLink,
} from "lucide-react";
import { formatPoints, formatCash, formatPointsAsCash } from "@/lib/formatters";

const FEATURED_OFFERWALLS = [
  {
    id: "taskwall",
    name: "Taskwall.io",
    logo: "/images/offerwalls/taskwall.png",
  },
  {
    id: "cpalead",
    name: "CPALead",
    logo: "/images/offerwalls/cpalead.png",
  },
  {
    id: "clickwall",
    name: "ClickWall.io",
    logo: "/images/offerwalls/clickwall.png",
  },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { summary: wallet, transactions } = useWallet();
  const { notifications } = useNotifications();

  const recentTransactions = transactions?.slice(0, 5) || [];
  const recentNotifications = notifications?.slice(0, 3) || [];

  return (
    <div className="space-y-8">
      {/* ─── Top Welcome & Hero Balance Card ─────────────────────── */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-primary/15 via-card to-accent/10 border border-primary/25 shadow-xl relative flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Available Rewards Balance
            </span>
            <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
              Instant Cashout Ready
            </Badge>
          </div>

          <div>
            <div className="text-4xl sm:text-5xl font-black text-foreground flex items-baseline gap-2">
              <span>{formatPoints(wallet?.availablePoints || 0)}</span>
              <span className="text-base font-bold text-accent">Points</span>
            </div>
            <p className="text-lg font-bold text-emerald-500 mt-1">
              ≈ {formatPointsAsCash(wallet?.availablePoints || 0)} USD
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-muted-foreground">
            <div>
              <span>Pending Points: </span>
              <strong className="text-foreground">{formatPoints(wallet?.pendingPoints || 0)}</strong>
            </div>
            <div>
              <span>Lifetime Earned: </span>
              <strong className="text-foreground">{formatPoints(wallet?.totalEarned || 0)}</strong>
            </div>
            <div>
              <span>Total Withdrawn: </span>
              <strong className="text-foreground">{formatPointsAsCash(wallet?.totalWithdrawn || 0)}</strong>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-border/60">
          <Button asChild size="lg" className="font-bold shadow-lg shadow-primary/20">
            <Link href="/withdraw">
              <ArrowUpRight className="mr-2 h-4 w-4" /> Withdraw Rewards
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="font-semibold">
            <Link href="/offerwalls">
              <Layers className="mr-2 h-4 w-4 text-primary" /> Browse Offerwalls
            </Link>
          </Button>
        </div>
      </div>

      {/* ─── Quick Stats Grid ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Offers Completed"
          value={wallet?.totalEarned ? "Active" : "0"}
          subtitle="Ready to earn"
          icon={<Gift className="h-5 w-5 text-accent" />}
        />
        <StatCard
          title="Lifetime Earned"
          value={formatPoints(wallet?.totalEarned || 0)}
          subtitle={formatPointsAsCash(wallet?.totalEarned || 0)}
          icon={<Coins className="h-5 w-5 text-accent" />}
        />
        <StatCard
          title="Withdrawn Cash"
          value={formatPointsAsCash(wallet?.totalWithdrawn || 0)}
          subtitle="Cleared to date"
          icon={<ArrowUpRight className="h-5 w-5 text-emerald-500" />}
        />
      </div>

      {/* ─── Offerwalls Hub Direct Access ────────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-black tracking-tight">Partner Offerwalls</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Complete surveys, test applications, and click tasks to earn verified rewards
            </p>
          </div>
          <Button variant="outline" size="sm" asChild className="text-xs font-semibold">
            <Link href="/offerwalls">
              View All Walls <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FEATURED_OFFERWALLS.map((wall) => (
            <Card
              key={wall.id}
              className="border-border hover:border-primary/50 transition-all duration-200 group overflow-hidden relative flex flex-col justify-between p-5 rounded-2xl bg-card hover:shadow-lg"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-full h-24 rounded-xl bg-[#0c0f17] border border-border/70 p-4 flex items-center justify-center">
                  <img
                    src={wall.logo}
                    alt={wall.name}
                    className="max-h-14 max-w-[85%] object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <span className="font-bold text-base text-foreground tracking-tight group-hover:text-primary transition-colors">
                  {wall.name}
                </span>
              </div>

              <div className="pt-4">
                <Button size="sm" asChild className="w-full font-bold text-xs h-9 rounded-xl">
                  <Link href="/offerwalls">
                    Open {wall.name} <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ─── Recent Activity & Notifications ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-7">
          <Card className="border-border">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Coins className="h-4 w-4 text-accent" /> Recent Activity
                </CardTitle>
                <Link href="/wallet" className="text-xs text-muted-foreground hover:text-foreground font-semibold">
                  View Ledger
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-2">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx: any) => (
                  <TransactionItem key={tx.id} transaction={tx} />
                ))
              ) : (
                <div className="p-6 rounded-lg bg-accent/5 text-center text-xs text-muted-foreground">
                  No recent activity recorded yet. Launch an offerwall to get started!
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Notifications Preview */}
        <div className="lg:col-span-5">
          <Card className="border-border">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" /> Notifications
                </CardTitle>
                <Link href="/notifications" className="text-xs text-muted-foreground hover:text-foreground font-semibold">
                  View All
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3">
              {recentNotifications.length > 0 ? (
                recentNotifications.map((n) => (
                  <div key={n.id} className="p-3 rounded-lg bg-accent/5 border border-border/50 text-xs space-y-1">
                    <p className="font-bold text-foreground">{n.title}</p>
                    <p className="text-muted-foreground text-[11px] line-clamp-2">{n.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  You're all caught up! No unread notifications.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
