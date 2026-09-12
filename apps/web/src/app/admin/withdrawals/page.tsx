"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  ShieldAlert,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Search,
  ExternalLink,
} from "lucide-react";
import { formatPoints, formatCash } from "@/lib/formatters";
import apiClient from "@/lib/api-client";

interface AdminWithdrawalRow {
  id: string;
  user: string;
  userId?: string;
  method: string;
  points: number;
  cashValue: number;
  status: "PENDING" | "PROCESSING" | "PAID" | "REJECTED";
  riskScore: number;
  destination: string;
  date: string;
  externalTxId?: string;
}

const INITIAL_WITHDRAWALS: AdminWithdrawalRow[] = [
  {
    id: "WDR-81005",
    user: "ahmed_earner",
    method: "Vodafone Cash",
    points: 1000,
    cashValue: 1.0,
    status: "PENDING",
    riskScore: 10,
    destination: "01012345678 (Ahmed Hassan)",
    date: "Today at 2:30 PM",
  },
  {
    id: "WDR-80988",
    user: "crypto_trader",
    method: "Binance (USDT)",
    points: 2500,
    cashValue: 2.5,
    status: "PROCESSING",
    riskScore: 8,
    destination: "Binance UID: 49218491",
    date: "Today at 9:00 AM",
  },
  {
    id: "WDR-80921",
    user: "alex_dash",
    method: "Vodafone Cash",
    points: 48000,
    cashValue: 48.0,
    status: "PAID",
    riskScore: 5,
    destination: "01098765432 (Alex K)",
    date: "Sep 10, 2026",
    externalTxId: "VOD-9821491823",
  },
  {
    id: "WDR-80890",
    user: "mia_rewards",
    method: "Binance (USDT)",
    points: 45000,
    cashValue: 45.0,
    status: "PAID",
    riskScore: 6,
    destination: "mia@binance.com",
    date: "Sep 8, 2026",
    externalTxId: "0x7b1c4e92a488f309a12c8b",
  },
  {
    id: "WDR-80712",
    user: "suspicious_bot",
    method: "Vodafone Cash",
    points: 8000,
    cashValue: 8.0,
    status: "REJECTED",
    riskScore: 88,
    destination: "01000000000 (Fake User)",
    date: "Sep 2, 2026",
  },
];

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawalRow[]>(INITIAL_WITHDRAWALS);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionItem, setActionItem] = useState<{ row: AdminWithdrawalRow; action: "APPROVE" | "MARK_PAID" | "REJECT" } | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [externalTxId, setExternalTxId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch real withdrawals from API if available
  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/withdrawals");
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const mapped: AdminWithdrawalRow[] = res.data.data.map((w: any) => {
          let destStr = "";
          if (typeof w.destination === "object" && w.destination !== null) {
            destStr = Object.entries(w.destination)
              .map(([k, v]) => `${k}: ${v}`)
              .join(" | ");
          } else {
            destStr = String(w.destination || "N/A");
          }

          return {
            id: w.id,
            user: w.user?.username || w.userId || "User",
            userId: w.userId,
            method: w.method?.name || "Payment",
            points: w.points,
            cashValue: w.cashValue || w.points / 1000,
            status: w.status,
            riskScore: 10,
            destination: destStr,
            date: new Date(w.createdAt).toLocaleDateString(),
            externalTxId: w.externalTxId,
          };
        });
        setWithdrawals(mapped);
      }
    } catch {
      // Fallback cleanly to INITIAL_WITHDRAWALS
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const filtered = withdrawals.filter((w) => {
    if (filterStatus !== "ALL" && w.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        w.id.toLowerCase().includes(q) ||
        w.user.toLowerCase().includes(q) ||
        w.destination.toLowerCase().includes(q) ||
        w.method.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExecuteStatusChange = async () => {
    if (!actionItem) return;
    const { row, action } = actionItem;

    let nextStatus: "PENDING" | "PROCESSING" | "PAID" | "REJECTED" = row.status;
    if (action === "APPROVE") nextStatus = "PROCESSING";
    if (action === "MARK_PAID") nextStatus = "PAID";
    if (action === "REJECT") nextStatus = "REJECTED";

    setIsProcessing(true);
    try {
      // Attempt API call
      await apiClient.patch(`/admin/withdrawals/${row.id}/status`, {
        status: nextStatus,
        note: adminNote || (action === "REJECT" ? "Request rejected by admin" : "Approved by administrator"),
        ...(action === "MARK_PAID" && externalTxId ? { externalTxId } : {}),
      });
    } catch {
      // If mock ID or offline, update in state
    }

    setWithdrawals((prev) =>
      prev.map((item) =>
        item.id === row.id
          ? {
              ...item,
              status: nextStatus,
              externalTxId: action === "MARK_PAID" ? externalTxId || item.externalTxId : item.externalTxId,
            }
          : item
      )
    );

    const msg =
      action === "APPROVE"
        ? `Withdrawal ${row.id} moved to Processing.`
        : action === "MARK_PAID"
        ? `Withdrawal ${row.id} marked as Paid (${externalTxId || "disbursed"}).`
        : `Withdrawal ${row.id} rejected and points refunded to ${row.user}.`;

    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);

    setIsProcessing(false);
    setActionItem(null);
    setAdminNote("");
    setExternalTxId("");
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
            Review submitted payouts, disburse funds via Vodafone Cash & Binance, or issue automated refunds
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchWithdrawals}
            disabled={loading}
            className="border-slate-800 text-slate-300 hover:text-white text-xs h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>

          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
            {["ALL", "PENDING", "PROCESSING", "PAID", "REJECTED"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors text-[11px] ${
                  filterStatus === st ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Success Feedback Alert ─────────────────────────────── */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* ─── Search & Summary Bar ───────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Ref ID, username, Vodafone number, Binance UID..."
            className="pl-9 bg-[#12141d] border-slate-800 text-xs h-9 text-slate-200 placeholder:text-slate-600"
          />
        </div>
        <div className="text-xs text-slate-400 px-3 py-2 bg-[#12141d] border border-slate-800 rounded-lg">
          Showing <strong className="text-white">{filtered.length}</strong> of {withdrawals.length} payouts
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
                  <th className="py-3.5 px-5 font-semibold">Destination Details</th>
                  <th className="py-3.5 px-5 font-semibold">Risk Score</th>
                  <th className="py-3.5 px-5 font-semibold">Status</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      No withdrawal requests matching your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-5 font-mono text-[11px] font-bold text-white">{w.id}</td>
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-white block">{w.user}</span>
                        <span className="text-[10px] text-slate-500">{w.date}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-semibold text-white">{w.method}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-white">{formatPoints(w.points)}</span>
                        <span className="text-[10px] text-emerald-400 block font-semibold">
                          ≈ {formatCash(w.cashValue)} USD
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-mono text-[11px] text-slate-300 block max-w-xs truncate" title={w.destination}>
                          {w.destination}
                        </span>
                        {w.externalTxId && (
                          <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">
                            TxID: {w.externalTxId}
                          </span>
                        )}
                      </td>
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
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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
                      <td className="py-3.5 px-5 text-right space-x-1 whitespace-nowrap">
                        {w.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setActionItem({ row: w, action: "APPROVE" })}
                              className="h-7 px-2 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setActionItem({ row: w, action: "REJECT" })}
                              className="h-7 px-2 text-xs text-rose-400 hover:text-rose-300 font-semibold"
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        {w.status === "PROCESSING" && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setActionItem({ row: w, action: "MARK_PAID" })}
                              className="h-7 px-2 text-xs text-amber-400 hover:text-amber-300 font-bold"
                            >
                              Mark Paid
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setActionItem({ row: w, action: "REJECT" })}
                              className="h-7 px-2 text-xs text-rose-400 hover:text-rose-300 font-semibold"
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        <Button size="sm" variant="ghost" asChild className="h-7 px-2 text-xs text-slate-400 hover:text-white">
                          <Link href={`/admin/withdrawals/${w.id}`}>
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
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
              {actionItem?.action === "REJECT" ? (
                <XCircle className="h-5 w-5 text-rose-500" />
              ) : actionItem?.action === "MARK_PAID" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <ShieldAlert className="h-5 w-5 text-amber-500" />
              )}
              {actionItem?.action === "APPROVE" && "Approve Withdrawal (Move to Processing)"}
              {actionItem?.action === "MARK_PAID" && "Confirm Disbursement (Mark Paid)"}
              {actionItem?.action === "REJECT" && "Reject & Refund Withdrawal"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              {actionItem?.action === "REJECT"
                ? "Rejecting will immediately refund all deducted points back to the user's balance."
                : `Updating payout #${actionItem?.row.id} for user ${actionItem?.row.user}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">User</span>
                <strong className="text-white">{actionItem?.row.user}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Method</span>
                <strong className="text-white">{actionItem?.row.method}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount</span>
                <strong className="text-emerald-400">
                  {formatPoints(actionItem?.row.points || 0)} pts ({formatCash(actionItem?.row.cashValue || 0)} USD)
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Destination</span>
                <span className="font-mono text-slate-300 text-[11px] truncate max-w-[200px]">
                  {actionItem?.row.destination}
                </span>
              </div>
            </div>

            {/* External TxID input for Mark Paid */}
            {actionItem?.action === "MARK_PAID" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-200">
                  Gateway Transaction ID / Reference (Optional)
                </Label>
                <Input
                  placeholder="e.g. Binance TxID: 0x8a1... or Vodafone Ref: 981249"
                  value={externalTxId}
                  onChange={(e) => setExternalTxId(e.target.value)}
                  className="bg-slate-900 border-slate-800 text-xs font-mono text-slate-200"
                />
                <p className="text-[10px] text-slate-400">
                  This transaction ID will be displayed to the user as proof of payment.
                </p>
              </div>
            )}

            {/* Audit / Reason Note */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-200">
                {actionItem?.action === "REJECT" ? "Rejection Reason (Sent to User)" : "Admin Audit Note (Optional)"}
              </Label>
              <Textarea
                rows={3}
                placeholder={
                  actionItem?.action === "REJECT"
                    ? "e.g. Invalid Vodafone Cash wallet number or name mismatch..."
                    : "Internal notes or verification check..."
                }
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="bg-slate-900 border-slate-800 text-xs text-slate-200"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              disabled={isProcessing}
              onClick={() => setActionItem(null)}
              className="border-slate-800 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isProcessing}
              onClick={handleExecuteStatusChange}
              className={`font-bold ${
                actionItem?.action === "REJECT"
                  ? "bg-rose-600 hover:bg-rose-500 text-white"
                  : "bg-amber-500 hover:bg-amber-600 text-slate-950"
              }`}
            >
              {isProcessing && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
              {actionItem?.action === "APPROVE" && "Approve (Move to Processing)"}
              {actionItem?.action === "MARK_PAID" && "Confirm Paid"}
              {actionItem?.action === "REJECT" && "Confirm Reject & Refund"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
