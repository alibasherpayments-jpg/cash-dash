"use client";

import React from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { useWallet } from "@/hooks/use-wallet";
import { useOffers } from "@/hooks/use-offers";
import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/common/stat-card";
import { OfferCard } from "@/components/common/offer-card";
import { TransactionItem } from "@/components/common/transaction-item";
import { DailyGoal } from "@/components/common/daily-goal";
import {
  Coins,
  ArrowUpRight,
  Gift,
  Flame,
  Users,
  Trophy,
  Bell,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { formatPoints, formatCash } from "@/lib/formatters";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { summary: wallet, transactions } = useWallet();
  const { offers, isLoading: offersLoading } = useOffers();
  const { notifications } = useNotifications();

  const featuredOffers = offers?.filter((o) => o.isFeatured).slice(0, 3) || offers?.slice(0, 3) || [];
  const recommendedOffers = offers?.filter((o) => o.isRecommended).slice(0, 3) || offers?.slice(3, 6) || [];
  const recentTransactions = transactions?.slice(0, 4) || [];
  const recentNotifications = notifications?.slice(0, 3) || [];

  return (
    <div className="space-y-8">
      {/* ─── Top Welcome & Hero Balance Card ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Main Balance Hero Card */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-primary/15 via-card to-accent/10 border border-primary/25 shadow-xl relative flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Available Rewards Balance
                </span>
                <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
                  Instant Cashout Ready
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                <Flame className="h-3.5 w-3.5 fill-amber-500" />
                <span>5-Day Earning Streak</span>
              </div>
            </div>

            <div>
              <div className="text-4xl sm:text-5xl font-black text-foreground flex items-baseline gap-2">
                <span>{formatPoints(wallet?.availablePoints || 0)}</span>
                <span className="text-base font-bold text-accent">Points</span>
              </div>
              <p className="text-lg font-bold text-emerald-500 mt-1">
                ≈ {formatCash((wallet?.availablePoints || 0) / 10000)} USD
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
                <strong className="text-foreground">{formatCash((wallet?.totalWithdrawn || 0) / 10000)}</strong>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-6 mt-4 border-t border-border/60">
            <Button asChild size="lg" className="font-bold shadow-lg shadow-primary/20">
              <Link href="/withdraw">
                <ArrowUpRight className="mr-2 h-4 w-4" /> Withdraw Rewards
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-semibold">
              <Link href="/offers">
                <Gift className="mr-2 h-4 w-4" /> Complete Offers
              </Link>
            </Button>
          </div>
        </div>

        {/* Daily Goal Card */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-card border border-border shadow-md flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Daily Goal Progress
              </span>
              <Sparkles className="h-4 w-4 text-accent" />
            </div>

            <DailyGoal current={1250} goal={2000} />

            <div className="p-3.5 rounded-xl bg-accent/5 border border-accent/20 text-xs space-y-1">
              <p className="font-bold text-foreground">Next Milestone Bonus</p>
              <p className="text-muted-foreground text-[11px]">
                Earn 750 more points today to unlock your +250 streak bonus multiplier!
              </p>
            </div>
          </div>

          <div className="pt-4 mt-2">
            <Button asChild variant="ghost" size="sm" className="w-full text-xs text-primary font-semibold">
              <Link href="/offers">Earn 750 points now <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Quick Stats Grid ────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Offers Completed"
          value="12"
          subtitle="2 under review"
          icon={<Gift className="h-5 w-5" />}
        />
        <StatCard
          title="Lifetime Earned"
          value={formatPoints(wallet?.totalEarned || 24950)}
          subtitle={formatCash((wallet?.totalEarned || 24950) / 10000)}
          icon={<Coins className="h-5 w-5 text-accent" />}
        />
        <StatCard
          title="Withdrawn Cash"
          value={formatCash((wallet?.totalWithdrawn || 15000) / 10000)}
          subtitle="Paid successfully"
          icon={<ArrowUpRight className="h-5 w-5 text-emerald-500" />}
        />
        <StatCard
          title="Referral Earnings"
          value="3,200 pts"
          subtitle="4 active friends"
          icon={<Users className="h-5 w-5 text-indigo-400" />}
        />
      </div>

      {/* ─── Featured Offers ─────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black tracking-tight">Featured High-Reward Offers</h3>
            <p className="text-xs text-muted-foreground">Highest points per minute tested by staff</p>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-xs">
            <Link href="/offers">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredOffers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </div>

      {/* ─── Recommended For You & Recent Activity ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recommended Offers */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Recommended For You</h3>
            <Link href="/offers" className="text-xs text-primary font-semibold hover:underline">
              Browse More
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recommendedOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </div>

        {/* Recent Activity & Notifications Card */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recent Activity */}
          <Card className="border-border">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold">Recent Activity</CardTitle>
                <Link href="/wallet" className="text-xs text-muted-foreground hover:text-foreground">
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
                <div className="p-4 rounded-lg bg-accent/5 text-center text-xs text-muted-foreground">
                  No recent activity recorded yet.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Notifications Preview */}
          <Card className="border-border">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" /> Notifications
                </CardTitle>
                <Link href="/notifications" className="text-xs text-muted-foreground hover:text-foreground">
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
                <p className="text-xs text-muted-foreground text-center py-2">
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
