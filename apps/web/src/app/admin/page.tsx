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
          className="group p-5 rounded-2xl bg-[#12141d] border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900/60 transition-all space-y-2 block"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <Layers className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
            Offerwalls & Networks Hub
          </h3>
          <p className="text-xs text-slate-400">
            Manage BitLabs, AdGem, RevU, CPALead, Timewall. Configure webhooks, secrets, and test simulators.
          </p>
        </Link>

        <Link
          href="/admin/withdrawal-methods"
          className="group p-5 rounded-2xl bg-[#12141d] border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900/60 transition-all space-y-2 block"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <CreditCard className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
            Payment & Payout Methods
          </h3>
          <p className="text-xs text-slate-400">
            Vodafone Cash & Binance (100 pts / $0.10 min). Add InstaPay, Orange Cash, and dynamic form inputs.
          </p>
        </Link>

        <Link
          href="/admin/withdrawals"
          className="group p-5 rounded-2xl bg-[#12141d] border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900/60 transition-all space-y-2 block"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
              <ArrowUpRight className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
            Withdrawal Approvals Queue
          </h3>
          <p className="text-xs text-slate-400">
            Process pending cashouts, enter gateway TxIDs, or trigger automated balance refund on rejection.
          </p>
        </Link>
      </div>

      {/* ─── Top Stats Grid (4 key metrics) ──────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#12141d] border-slate-800 text-slate-100 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Registered Users</span>
            <Users className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.usersCount}
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block font-medium">
            {stats.activeUsersCount} active accounts
          </span>
        </Card>

        <Card className="bg-[#12141d] border-slate-800 text-slate-100 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Active Offerwalls</span>
            <Layers className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${stats.activeOfferwallsCount} Networks`}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Taskwall, CPALead, ClickWall</span>
        </Card>

        <Card className="bg-[#12141d] border-slate-800 text-slate-100 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Pending Withdrawals</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${stats.pendingWithdrawalsCount} Requests`}
          </div>
          <span className="text-[11px] text-amber-400/80 mt-1 block">
            Awaiting admin clearance
          </span>
        </Card>

        <Card className="bg-[#12141d] border-slate-800 text-slate-100 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Points in Circulation</span>
            <Coins className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : formatPoints(stats.pointsInCirculation)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            ≈ ${(stats.pointsInCirculation / 1000).toFixed(2)} USD Available
          </span>
        </Card>
      </div>

      {/* ─── Risk & Pending Queue Alert Box ───────────────────────── */}
      {stats.pendingWithdrawalsCount > 0 && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Withdrawals Awaiting Admin Clearance</h4>
              <p className="text-xs text-slate-400">
                {stats.pendingWithdrawalsCount} payout request(s) submitted and waiting for disbursement.
              </p>
            </div>
          </div>

          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shrink-0" asChild>
            <Link href="/admin/withdrawals">
              Review Queue <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}

      {/* ─── Recent Withdrawals Real Table ───────────────────────── */}
      <Card className="bg-[#12141d] border-slate-800">
        <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-white">Recent Payout Activity</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Live requests and disbursements from the database (1,000 points = $1.00 USD)
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-xs text-amber-400 hover:text-amber-300">
            <Link href="/admin/withdrawals">View All</Link>
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading recent withdrawals...
              </div>
            ) : recentWithdrawals.length > 0 ? (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider bg-slate-900/40">
                  <tr>
                    <th className="py-3 px-5 font-semibold">User</th>
                    <th className="py-3 px-5 font-semibold">Method</th>
                    <th className="py-3 px-5 font-semibold">Points</th>
                    <th className="py-3 px-5 font-semibold">USD Value</th>
                    <th className="py-3 px-5 font-semibold">Status</th>
                    <th className="py-3 px-5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentWithdrawals.map((row: any) => (
                    <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-white">{row.user?.username || "User"}</td>
                      <td className="py-3.5 px-5">{row.method?.name || "Payout"}</td>
                      <td className="py-3.5 px-5 font-mono">{formatPoints(row.points || 0)}</td>
                      <td className="py-3.5 px-5 font-bold text-emerald-400">
                        ${((row.points || 0) / 1000).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            row.status === "PAID"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : row.status === "PROCESSING"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-amber-400" asChild>
                          <Link href={`/admin/withdrawals`}>Manage</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Inbox className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                <p className="font-semibold text-white">No Payout Activity Yet</p>
                <p className="text-xs text-slate-500">
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
