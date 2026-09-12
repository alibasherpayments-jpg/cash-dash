"use client";

import React from "react";
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
  TrendingUp,
  Activity,
  DollarSign,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { formatPoints, formatCash, formatDateTime } from "@/lib/formatters";

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            Platform Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time analytics, withdrawal processing pipelines, and system activity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs font-semibold">
            ● Automated Processing Active
          </Badge>
        </div>
      </div>

      {/* ─── Top Stats Grid (8 key metrics) ──────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#12141d] border-slate-800 text-slate-100 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Total Registered Users</span>
            <Users className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">25</div>
          <span className="text-[11px] text-emerald-400 mt-1 block font-medium">+4 new users today</span>
        </Card>

        <Card className="bg-[#12141d] border-slate-800 text-slate-100 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Points Distributed</span>
            <Coins className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{formatPoints(4520000)}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">≈ $452.00 USD value</span>
        </Card>

        <Card className="bg-[#12141d] border-slate-800 text-slate-100 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Pending Withdrawals</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">2 Requests</div>
          <span className="text-[11px] text-amber-400/80 mt-1 block">$3.50 pending clearance</span>
        </Card>

        <Card className="bg-[#12141d] border-slate-800 text-slate-100 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Completed Withdrawals</span>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">$3,425.00</div>
          <span className="text-[11px] text-slate-400 mt-1 block">18 paid out successfully</span>
        </Card>
      </div>

      {/* ─── Platform Revenue & Conversion Section ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-[#12141d] border-slate-800 text-slate-100 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Estimated Network Margin</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">$1,840.00 USD</div>
          <p className="text-xs text-slate-400">
            Publisher revenue share from AdVenture & RewardHub postbacks
          </p>
        </Card>

        <Card className="bg-[#12141d] border-slate-800 text-slate-100 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Offer Completions</span>
            <Gift className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">48 Completions</div>
          <p className="text-xs text-slate-400">Average reward: 35,400 pts ($3.54)</p>
        </Card>

        <Card className="bg-[#12141d] border-slate-800 text-slate-100 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Click-to-Completion Ratio</span>
            <TrendingUp className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">18.4%</div>
          <p className="text-xs text-slate-400">High engagement across gaming category</p>
        </Card>
      </div>

      {/* ─── Risk & Pending Queue Alert Box ───────────────────────── */}
      <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">2 Withdrawals Awaiting Review</h4>
            <p className="text-xs text-slate-400">
              PayPal ($1.00) and Crypto ($2.46) requests submitted in the last 12 hours.
            </p>
          </div>
        </div>

        <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shrink-0" asChild>
          <Link href="/admin/withdrawals">
            Review Queue <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* ─── Recent Withdrawals Quick Table ───────────────────────── */}
      <Card className="bg-[#12141d] border-slate-800">
        <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-white">Recent Payout Activity</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Latest requested and cleared payouts across all providers
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-xs text-amber-400 hover:text-amber-300">
            <Link href="/admin/withdrawals">View All</Link>
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider bg-slate-900/40">
                <tr>
                  <th className="py-3 px-5 font-semibold">User</th>
                  <th className="py-3 px-5 font-semibold">Method</th>
                  <th className="py-3 px-5 font-semibold">Points</th>
                  <th className="py-3 px-5 font-semibold">USD Equivalent</th>
                  <th className="py-3 px-5 font-semibold">Status</th>
                  <th className="py-3 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {[
                  { user: "ryan_hustle", method: "PayPal", pts: 10000, usd: "$1.00", status: "PENDING", id: "WDR-81005" },
                  { user: "emma_quest", method: "Crypto (USDT)", pts: 25000, usd: "$2.46", status: "PROCESSING", id: "WDR-80988" },
                  { user: "alex_dash", method: "PayPal", pts: 482000, usd: "$48.20", status: "PAID", id: "WDR-80921" },
                  { user: "mia_rewards", method: "Crypto (USDT)", pts: 451000, usd: "$45.10", status: "PAID", id: "WDR-80890" },
                ].map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-white">{row.user}</td>
                    <td className="py-3.5 px-5">{row.method}</td>
                    <td className="py-3.5 px-5 font-mono">{formatPoints(row.pts)}</td>
                    <td className="py-3.5 px-5 font-bold text-emerald-400">{row.usd}</td>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
