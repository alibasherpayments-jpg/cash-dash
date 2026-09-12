"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowUpRight,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { formatPoints, formatCash, formatDateTime } from "@/lib/formatters";

interface AdminWithdrawalRow {
  id: string;
  user: string;
  method: string;
  points: number;
  cashValue: number;
  status: "PENDING" | "PROCESSING" | "PAID" | "REJECTED";
  riskScore: number;
  destination: string;
  date: string;
}

const INITIAL_WITHDRAWALS: AdminWithdrawalRow[] = [
  { id: "WDR-81005", user: "ryan_hustle", method: "PayPal", points: 10000, cashValue: 1.0, status: "PENDING", riskScore: 10, destination: "ryan@example.com", date: "Today at 2:30 PM" },
  { id: "WDR-80988", user: "emma_quest", method: "Crypto (USDT)", points: 25000, cashValue: 2.46, status: "PROCESSING", riskScore: 8, destination: "TV7k...88k1", date: "Today at 9:00 AM" },
  { id: "WDR-80921", user: "alex_dash", method: "PayPal", points: 482000, cashValue: 48.2, status: "PAID", riskScore: 5, destination: "alex@example.com", date: "Sep 10, 2026" },
  { id: "WDR-80890", user: "mia_rewards", method: "Crypto (USDT)", points: 451000, cashValue: 45.1, status: "PAID", riskScore: 6, destination: "0x71...392F", date: "Sep 8, 2026" },
  { id: "WDR-80712", user: "suspicious_bot", method: "PayPal", points: 80000, cashValue: 8.0, status: "REJECTED", riskScore: 88, destination: "bot99@tempmail.com", date: "Sep 2, 2026" },
];

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawalRow[]>(INITIAL_WITHDRAWALS);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [actionItem, setActionItem] = useState<{ row: AdminWithdrawalRow; action: string } | null>(null);
  const [adminNote, setAdminNote] = useState("");

  const filtered = withdrawals.filter((w) => {
    if (filterStatus === "ALL") return true;
    return w.status === filterStatus;
  });

  const handleExecuteStatusChange = () => {
    if (!actionItem) return;
    const { row, action } = actionItem;

    let nextStatus: "PENDING" | "PROCESSING" | "PAID" | "REJECTED" = row.status;
    if (action === "APPROVE") nextStatus = "PROCESSING";
    if (action === "MARK_PAID") nextStatus = "PAID";
    if (action === "REJECT") nextStatus = "REJECTED";

    setWithdrawals((prev) =>
      prev.map((item) => (item.id === row.id ? { ...item, status: nextStatus } : item))
    );

    setActionItem(null);
    setAdminNote("");
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <ArrowUpRight className="h-7 w-7 text-amber-500" /> Withdrawal Queue & Approvals
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Review submitted payouts, inspect risk telemetry, and trigger gateway disbursements
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          {["ALL", "PENDING", "PROCESSING", "PAID", "REJECTED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                filterStatus === st ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Table ───────────────────────────────────────────────── */}
      <Card className="bg-[#12141d] border-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider bg-slate-900/40">
                <tr>
                  <th className="py-3.5 px-5 font-semibold">Ref ID</th>
                  <th className="py-3.5 px-5 font-semibold">User</th>
                  <th className="py-3.5 px-5 font-semibold">Method</th>
                  <th className="py-3.5 px-5 font-semibold">Points / USD</th>
                  <th className="py-3.5 px-5 font-semibold">Destination</th>
                  <th className="py-3.5 px-5 font-semibold">Risk Score</th>
                  <th className="py-3.5 px-5 font-semibold">Status</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-[11px] font-bold text-white">{w.id}</td>
                    <td className="py-3.5 px-5 font-bold text-white">{w.user}</td>
                    <td className="py-3.5 px-5">{w.method}</td>
                    <td className="py-3.5 px-5">
                      <span className="font-bold text-white">{formatPoints(w.points)}</span>
                      <span className="text-[10px] text-emerald-400 block font-semibold">
                        ≈ {formatCash(w.cashValue)}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[11px] text-slate-400">{w.destination}</td>
                    <td className="py-3.5 px-5">
                      <Badge
                        className={`text-[10px] font-bold ${
                          w.riskScore > 50
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        }`}
                      >
                        Score: {w.riskScore}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          w.status === "PAID"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : w.status === "PROCESSING"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : w.status === "PENDING"
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {w.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1">
                      {w.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setActionItem({ row: w, action: "APPROVE" })}
                            className="h-7 px-2 text-xs text-emerald-400 hover:text-emerald-300"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setActionItem({ row: w, action: "REJECT" })}
                            className="h-7 px-2 text-xs text-rose-400 hover:text-rose-300"
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {w.status === "PROCESSING" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setActionItem({ row: w, action: "MARK_PAID" })}
                          className="h-7 px-2 text-xs text-amber-400 hover:text-amber-300 font-bold"
                        >
                          Mark Paid
                        </Button>
                      )}

                      <Button size="sm" variant="ghost" asChild className="h-7 px-2 text-xs text-slate-400 hover:text-white">
                        <Link href={`/admin/withdrawals/${w.id}`}>
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ─── Status Confirmation Action Modal ────────────────────── */}
      <Dialog open={!!actionItem} onOpenChange={(open) => !open && setActionItem(null)}>
        <DialogContent className="max-w-md bg-[#12141d] border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" /> Confirm Status Change: {actionItem?.action}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Updating payout {actionItem?.row.id} will update the user's timeline and dispatch an automated notification.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">User</span>
                <strong className="text-white">{actionItem?.row.user}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount</span>
                <strong className="text-emerald-400">{formatCash(actionItem?.row.cashValue || 0)} USD</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Destination</span>
                <span className="font-mono text-slate-300">{actionItem?.row.destination}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-200">Admin Audit Note (Required)</Label>
              <Textarea
                rows={3}
                required
                placeholder="Reason for approval/rejection..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="bg-slate-900 border-slate-800 text-xs text-slate-200"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setActionItem(null)} className="border-slate-800 text-slate-300">
              Cancel
            </Button>
            <Button size="sm" onClick={handleExecuteStatusChange} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold">
              Execute Status Transition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
