"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Coins,
  ArrowUpRight,
  Gift,
  ShieldAlert,
  Clock,
  ArrowRight,
  Layers,
  CreditCard,
  CheckCircle2,
  Inbox,
  Loader2,
} from "lucide-react";
import { formatPoints, formatCash } from "@/lib/formatters";
import apiClient from "@/lib/api-client";
import { WalletCopyBadge } from "@/components/admin/wallet-display";

interface StatData {
  usersCount: number;
  activeUsersCount: number;
  pointsInCirculation: number;
  pendingWithdrawalsCount: number;
  pendingWithdrawalsCash: number;
  completedWithdrawalsCash: number;
  activeOfferwallsCount: number;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<StatData>({
    usersCount: 0,
    activeUsersCount: 0,
    pointsInCirculation: 0,
    pendingWithdrawalsCount: 0,
    pendingWithdrawalsCash: 0,
    completedWithdrawalsCash: 0,
    activeOfferwallsCount: 3,
  });
  const [recentWithdrawals, setRecentWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [statsRes, providersRes, withdrawalsRes] = await Promise.allSettled([
          apiClient.get("/admin/stats"),
          apiClient.get("/admin/providers"),
          apiClient.get("/admin/withdrawals?limit=5"),
        ]);

        let activeProvidersCount = 3;
        if (providersRes.status === "fulfilled" && providersRes.value.data?.data) {
          activeProvidersCount = providersRes.value.data.data.filter((p: any) => p.isActive).length;
        }

        if (statsRes.status === "fulfilled" && statsRes.value.data?.data) {
          const s = statsRes.value.data.data;
          setStats({
            usersCount: s.users?.total ?? 0,
            activeUsersCount: s.users?.active ?? 0,
            pointsInCirculation: s.points?.inCirculation ?? 0,
            pendingWithdrawalsCount: s.withdrawals?.pending ?? 0,
            pendingWithdrawalsCash: (s.withdrawals?.pendingCash ?? 0),
            completedWithdrawalsCash: (s.points?.totalWithdrawn ?? 0) / 1000,
            activeOfferwallsCount: activeProvidersCount,
          });
        }

        if (withdrawalsRes.status === "fulfilled" && withdrawalsRes.value.data) {
          const list = Array.isArray(withdrawalsRes.value.data.data)
            ? withdrawalsRes.value.data.data
            : [];
          setRecentWithdrawals(list);
        }
      } catch (err) {
        console.error("Failed to load admin stats", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            Platform Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Cash Dash management hub: Offerwall networks, Vodafone Cash & Binance payouts, and user controls
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs font-semibold">
            ● 1,000 pts = $1.00 USD Standard
          </Badge>
          <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs font-semibold">
            ● Automated Postbacks Active
          </Badge>
        </div>
      </div>

      {/* ─── Quick Admin Navigation Cards ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/admin/offerwalls"
          className="group p-5 rounded-2xl bg-card border border-border hover:border-primary/50 hover:bg-muted/30 transition-all space-y-2 block shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Layers className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
            Offerwalls & Networks Hub
          </h3>
          <p className="text-xs text-muted-foreground">
            Manage BitLabs, AdGem, RevU, CPALead, Timewall. Configure webhooks, secrets, and test simulators.
          </p>
        </Link>

        <Link
          href="/admin/withdrawal-methods"
          className="group p-5 rounded-2xl bg-card border border-border hover:border-primary/50 hover:bg-muted/30 transition-all space-y-2 block shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              <CreditCard className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-base font-bold text-foreground group-hover:text-emerald-500 transition-colors">
            Payment & Payout Methods
          </h3>
          <p className="text-xs text-muted-foreground">
            Vodafone Cash & Binance (100 pts / $0.10 min). Add InstaPay, Orange Cash, and dynamic form inputs.
          </p>
        </Link>

        <Link
          href="/admin/withdrawals"
          className="group p-5 rounded-2xl bg-card border border-border hover:border-primary/50 hover:bg-muted/30 transition-all space-y-2 block shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
              <ArrowUpRight className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-base font-bold text-foreground group-hover:text-indigo-500 transition-colors">
            Withdrawal Approvals Queue
          </h3>
          <p className="text-xs text-muted-foreground">
            Process pending cashouts, enter gateway TxIDs, or trigger automated balance refund on rejection.
          </p>
        </Link>
      </div>

      {/* ─── Top Stats Grid (4 key metrics) ──────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border text-card-foreground p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Registered Users</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-foreground">
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.usersCount}
          </div>
          <span className="text-[11px] text-emerald-500 mt-1 block font-medium">
            {stats.activeUsersCount} active accounts
          </span>
        </Card>

        <Card className="bg-card border-border text-card-foreground p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Active Offerwalls</span>
            <Layers className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-foreground">
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${stats.activeOfferwallsCount} Networks`}
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">Taskwall, CPALead, ClickWall</span>
        </Card>

        <Card className="bg-card border-border text-card-foreground p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Pending Withdrawals</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-500">
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${stats.pendingWithdrawalsCount} Requests`}
          </div>
          <span className="text-[11px] text-amber-500/80 mt-1 block">
            Awaiting admin clearance
          </span>
        </Card>

        <Card className="bg-card border-border text-card-foreground p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Points in Circulation</span>
            <Coins className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-500">
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : formatPoints(stats.pointsInCirculation)}
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            ≈ ${(stats.pointsInCirculation / 1000).toFixed(2)} USD Available
          </span>
        </Card>
      </div>

      {/* ─── Risk & Pending Queue Alert Box ───────────────────────── */}
      {stats.pendingWithdrawalsCount > 0 && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">Withdrawals Awaiting Admin Clearance</h4>
              <p className="text-xs text-muted-foreground">
                {stats.pendingWithdrawalsCount} payout request(s) submitted and waiting for disbursement.
              </p>
            </div>
          </div>

          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shrink-0" asChild>
            <Link href="/admin/withdrawals">
              Review Queue <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}

      {/* ─── Recent Withdrawals Real Table ───────────────────────── */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-foreground">Recent Payout Activity</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Live requests and disbursements from the database (1,000 points = $1.00 USD)
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-xs text-primary hover:text-primary/80">
            <Link href="/admin/withdrawals">View All</Link>
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" /> Loading recent withdrawals...
              </div>
            ) : recentWithdrawals.length > 0 ? (
              <table className="w-full text-left text-xs text-foreground">
                <thead className="border-b border-border text-muted-foreground text-[10px] uppercase tracking-wider bg-muted/30">
                  <tr>
                    <th className="py-3 px-5 font-semibold">User</th>
                    <th className="py-3 px-5 font-semibold">Method</th>
                    <th className="py-3 px-5 font-semibold">Target Wallet / المحفظة</th>
                    <th className="py-3 px-5 font-semibold">Points</th>
                    <th className="py-3 px-5 font-semibold">USD Value</th>
                    <th className="py-3 px-5 font-semibold">Status</th>
                    <th className="py-3 px-5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentWithdrawals.map((row: any) => (
                    <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-foreground">{row.user?.username || "User"}</td>
                      <td className="py-3.5 px-5 text-muted-foreground">{row.method?.name || "Payout"}</td>
                      <td className="py-3.5 px-5 min-w-[200px] max-w-xs">
                        <WalletCopyBadge
                          destination={row.destination}
                          methodName={row.method?.name}
                        />
                      </td>
                      <td className="py-3.5 px-5 font-mono">{formatPoints(row.points || 0)}</td>
                      <td className="py-3.5 px-5 font-bold text-emerald-500">
                        ${((row.points || 0) / 1000).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            row.status === "PAID"
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                              : row.status === "PROCESSING"
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-primary hover:text-primary/80" asChild>
                          <Link href={`/admin/withdrawals`}>Manage</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-muted-foreground space-y-2">
                <Inbox className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2" />
                <p className="font-semibold text-foreground">No Payout Activity Yet</p>
                <p className="text-xs text-muted-foreground">
                  When users request withdrawals via Vodafone Cash or Binance, they will appear here live.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
