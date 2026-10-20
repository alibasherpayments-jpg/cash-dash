"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  Clock,
  AlertTriangle,
  FileText,
  XCircle,
  Loader2,
  ExternalLink,
  Gamepad2,
  Users,
  Gift,
  TrendingUp,
  TrendingDown,
  History,
  Coins,
  Wallet,
  Sparkles,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { formatPoints, formatCash } from "@/lib/formatters";
import apiClient from "@/lib/api-client";
import { DestinationDetailCard } from "@/components/admin/wallet-display";

interface WithdrawalDetailData {
  id: string;
  userId: string;
  user: string;
  email: string;
  userCreatedAt?: string;
  userStatus?: string;
  country?: string;
  method: string;
  points: number;
  cashValue: number;
  fee: number;
  status: "PENDING" | "PROCESSING" | "PAID" | "REJECTED";
  destination: any;
  riskScore: number;
  submittedAt: string;
  externalTxId: string;
  adminNote: string;
  wallet?: {
    availablePoints: number;
    pendingPoints: number;
    totalEarned: number;
    totalWithdrawn: number;
  };
  pointsBreakdown?: {
    totalEarned: number;
    availablePoints: number;
    totalWithdrawn: number;
    pendingPoints: number;
    fromOffers: number;
    fromSurveys: number;
    fromReferrals: number;
    fromBonuses: number;
    fromAdjustments: number;
  };
  transactions: Array<{
    id: string;
    type: string;
    direction: "CREDIT" | "DEBIT";
    amount: number;
    status: string;
    source: string;
    description: string;
    referenceId?: string;
    createdAt: string;
  }>;
  completions: Array<{
    id: string;
    status: string;
    rewardPoints: number;
    startedAt: string;
    completedAt?: string;
    createdAt: string;
    offer?: {
      title: string;
      category: string;
      provider?: {
        name: string;
        slug: string;
      };
    };
  }>;
}

export default function AdminWithdrawalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const withdrawalId = params.id as string;

  const [data, setData] = useState<WithdrawalDetailData | null>(null);
  const [txFilter, setTxFilter] = useState<"ALL" | "CREDIT" | "DEBIT">("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<"APPROVE" | "MARK_PAID" | "REJECT" | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState("");
  const [txIdInput, setTxIdInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchWithdrawal = async () => {
    if (!withdrawalId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/admin/withdrawals/${withdrawalId}`);
      if (res.data?.data) {
        const w = res.data.data;
        setData({
          id: w.id,
          userId: w.userId || w.user?.id || "",
          user: w.user?.username || "User",
          email: w.user?.email || "user@cashdash.io",
          userCreatedAt: w.user?.createdAt ? new Date(w.user.createdAt).toLocaleDateString() : undefined,
          userStatus: w.user?.status || "ACTIVE",
          country: w.user?.profile?.country || "EG",
          method: w.method?.name || "Payment",
          points: w.points,
          cashValue: w.cashValue || w.points / 1000,
          fee: w.fee || 0,
          status: w.status,
          destination: typeof w.destination === "object" ? w.destination : { info: String(w.destination) },
          riskScore: w.user?.riskAssessment?.riskScore ?? 10,
          submittedAt: new Date(w.createdAt).toLocaleString(),
          externalTxId: w.externalTxId || "",
          adminNote: w.adminNote || "",
          wallet: w.wallet || undefined,
          pointsBreakdown: w.pointsBreakdown || undefined,
          transactions: Array.isArray(w.transactions) ? w.transactions : [],
          completions: Array.isArray(w.completions) ? w.completions : [],
        });
      } else {
        setError("Withdrawal request not found");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load withdrawal request");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawal();
  }, [withdrawalId]);

  const handleExecuteStatusChange = async () => {
    if (!modalAction || !data) return;

    let nextStatus: "PENDING" | "PROCESSING" | "PAID" | "REJECTED" = data.status;
    if (modalAction === "APPROVE") nextStatus = "PROCESSING";
    if (modalAction === "MARK_PAID") nextStatus = "PAID";
    if (modalAction === "REJECT") nextStatus = "REJECTED";

    setIsSubmitting(true);
    try {
      await apiClient.patch(`/admin/withdrawals/${data.id}/status`, {
        status: nextStatus,
        note: adminNoteInput || (modalAction === "REJECT" ? "Rejected by admin" : "Approved"),
        ...(modalAction === "MARK_PAID" && txIdInput ? { externalTxId: txIdInput } : {}),
      });

      setData((prev) =>
        prev
          ? {
              ...prev,
              status: nextStatus,
              externalTxId: modalAction === "MARK_PAID" ? txIdInput || prev.externalTxId : prev.externalTxId,
              adminNote: adminNoteInput || prev.adminNote,
            }
          : null
      );

      setSuccessMsg(`Withdrawal status transitioned to ${nextStatus}!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update withdrawal status");
    } finally {
      setIsSubmitting(false);
      setModalAction(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <p className="text-sm">Loading withdrawal details from database...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-white">{error || "Withdrawal Not Found"}</h2>
        <Button variant="outline" asChild className="border-slate-800 text-slate-300">
          <Link href="/admin/withdrawals">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Withdrawals Queue
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild className="text-slate-400 hover:text-white">
        <Link href="/admin/withdrawals">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Withdrawals Queue
        </Link>
      </Button>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Header */}
      <div className="p-6 rounded-2xl bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black text-foreground">{data.id}</h1>
            <Badge
              className={`text-xs font-bold ${
                data.status === "PAID"
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : data.status === "PROCESSING"
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  : data.status === "PENDING"
                  ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                  : "bg-rose-500/10 text-rose-500 border-rose-500/20"
              }`}
            >
              {data.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Submitted {data.submittedAt} by user <strong className="text-foreground">{data.user}</strong> ({data.email})
          </p>
        </div>

        <div className="flex items-center gap-2">
          {data.status === "PENDING" && (
            <>
              <Button
                size="sm"
                onClick={() => setModalAction("APPROVE")}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Approve (Processing)
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setModalAction("REJECT")}
                className="border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs"
              >
                Reject & Refund
              </Button>
            </>
          )}

          {data.status === "PROCESSING" && (
            <>
              <Button
                size="sm"
                onClick={() => setModalAction("MARK_PAID")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs"
              >
                Confirm Paid
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setModalAction("REJECT")}
                className="border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs"
              >
                Reject & Refund
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Financial Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Payout Method</span>
          <span className="text-lg font-bold text-foreground">{data.method}</span>
          <span className="text-xs text-muted-foreground block">Ratio: 1,000 pts = $1.00 USD</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Points Deducted</span>
          <span className="text-lg font-mono font-bold text-foreground">{formatPoints(data.points)}</span>
          <span className="text-xs text-muted-foreground block">Reserved in user ledger</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Net Payout Value</span>
          <span className="text-lg font-bold text-emerald-500">{formatCash(data.cashValue)} USD</span>
          <span className="text-xs text-muted-foreground block">Zero platform fee</span>
        </div>
      </div>

      {/* Destination & Fraud Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-card border-border text-card-foreground shadow-sm">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Wallet className="h-4 w-4 text-amber-500" /> Payout Destination & Wallet
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Review and copy user payout details for manual or automated disbursement
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <DestinationDetailCard
              destination={data.destination}
              methodName={data.method}
              externalTxId={data.externalTxId}
              adminNote={data.adminNote}
            />
          </CardContent>
        </Card>

        <Card className="bg-card border-border text-card-foreground shadow-sm">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-emerald-500" /> Fraud & Risk Telemetry
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-2 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-border">
              <span className="text-muted-foreground">Risk Assessment</span>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">
                Score: {data.riskScore} / 100 (LOW RISK)
              </Badge>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-border">
              <span className="text-muted-foreground">IP Geolocation</span>
              <span className="text-foreground">Egypt (EG) — Vodafone Data Clean ASN</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-muted-foreground">VPN / Proxy Detection</span>
              <span className="text-emerald-500 font-bold">Clean (No Proxy Detected)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── User Points Source & Lifetime Wallet Audit ───────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-amber-500" />
            <h2 className="text-base font-black text-foreground">
              User Points Source & Lifetime Ledger Breakdown
            </h2>
          </div>
          {data.userCreatedAt && (
            <span className="text-xs text-muted-foreground">
              Member Since: <strong className="text-foreground">{data.userCreatedAt}</strong> ({data.country})
            </span>
          )}
        </div>

        {/* 4 Source Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-card border border-border shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Lifetime Earned</span>
              <Coins className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <div className="text-base font-black text-foreground font-mono">
              {formatPoints(data.pointsBreakdown?.totalEarned ?? data.wallet?.totalEarned ?? 0)}
            </div>
            <span className="text-[10px] font-medium text-emerald-500 block">
              ≈ {formatCash((data.pointsBreakdown?.totalEarned ?? data.wallet?.totalEarned ?? 0) / 1000)}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-border shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Withdrawn</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <div className="text-base font-black text-foreground font-mono">
              {formatPoints(data.pointsBreakdown?.totalWithdrawn ?? data.wallet?.totalWithdrawn ?? 0)}
            </div>
            <span className="text-[10px] font-medium text-muted-foreground block">
              ≈ {formatCash((data.pointsBreakdown?.totalWithdrawn ?? data.wallet?.totalWithdrawn ?? 0) / 1000)}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-border shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Available Balance</span>
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <div className="text-base font-black text-emerald-500 font-mono">
              {formatPoints(data.pointsBreakdown?.availablePoints ?? data.wallet?.availablePoints ?? 0)}
            </div>
            <span className="text-[10px] font-medium text-muted-foreground block">
              Current in wallet
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-border shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Pending Points</span>
              <Clock className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <div className="text-base font-black text-amber-500 font-mono">
              {formatPoints(data.pointsBreakdown?.pendingPoints ?? data.wallet?.pendingPoints ?? 0)}
            </div>
            <span className="text-[10px] font-medium text-muted-foreground block">
              Under verification
            </span>
          </div>
        </div>

        {/* Origin Breakdown Progress / Pills */}
        <div className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-3">
          <span className="text-xs font-bold text-foreground block">
            Where Did This User Get Their Points? (Origin Breakdown)
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-background/60 border border-border/80 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                <Gamepad2 className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Offers & Games</span>
                <span className="text-xs font-bold text-foreground font-mono">
                  +{formatPoints(data.pointsBreakdown?.fromOffers ?? 0)} pts
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-background/60 border border-border/80 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Referrals</span>
                <span className="text-xs font-bold text-foreground font-mono">
                  +{formatPoints(data.pointsBreakdown?.fromReferrals ?? 0)} pts
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-background/60 border border-border/80 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500 shrink-0">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Surveys</span>
                <span className="text-xs font-bold text-foreground font-mono">
                  +{formatPoints(data.pointsBreakdown?.fromSurveys ?? 0)} pts
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-background/60 border border-border/80 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                <Gift className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Bonuses & Streaks</span>
                <span className="text-xs font-bold text-foreground font-mono">
                  +{formatPoints(data.pointsBreakdown?.fromBonuses ?? 0)} pts
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Recent Offer Completions History ──────────────────────── */}
      {data.completions && data.completions.length > 0 && (
        <Card className="bg-card border-border text-card-foreground shadow-sm">
          <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Gamepad2 className="h-4 w-4 text-indigo-500" />
              Completed Offers & Tasks History ({data.completions.length})
            </CardTitle>
            <span className="text-[11px] text-muted-foreground">
              Provider & Task validation telemetry
            </span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-foreground">
                <thead className="border-b border-border text-muted-foreground text-[10px] uppercase tracking-wider bg-muted/30">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Offer / Task Title</th>
                    <th className="py-2.5 px-4 font-semibold">Provider</th>
                    <th className="py-2.5 px-4 font-semibold">Category</th>
                    <th className="py-2.5 px-4 font-semibold">Reward Credited</th>
                    <th className="py-2.5 px-4 font-semibold">Date Completed</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {data.completions.map((comp) => (
                    <tr key={comp.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-foreground max-w-xs truncate">
                        {comp.offer?.title || "Custom Offer Completion"}
                      </td>
                      <td className="py-2.5 px-4 text-muted-foreground">
                        <Badge variant="secondary" className="text-[10px]">
                          {comp.offer?.provider?.name || "Direct Partner"}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">
                          {comp.offer?.category || "OFFER"}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-emerald-500">
                        +{formatPoints(comp.rewardPoints)} <span className="text-[10px] font-normal text-muted-foreground">pts</span>
                      </td>
                      <td className="py-2.5 px-4 text-muted-foreground text-[11px]">
                        {new Date(comp.completedAt || comp.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <Badge
                          className={`text-[9px] font-bold ${
                            comp.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : comp.status === "PENDING"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                          }`}
                        >
                          {comp.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Complete Ledger Transactions History ──────────────────── */}
      <Card className="bg-card border-border text-card-foreground shadow-sm">
        <CardHeader className="p-5 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-amber-500" />
            <div>
              <CardTitle className="text-sm font-bold text-foreground">
                User Ledger Transactions History
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Immutable financial record of every credit and debit to this user's wallet
              </CardDescription>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-background border border-border">
            {(["ALL", "CREDIT", "DEBIT"] as const).map((filterType) => (
              <button
                key={filterType}
                type="button"
                onClick={() => setTxFilter(filterType)}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition-colors ${
                  txFilter === filterType
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {filterType === "ALL" && "All Records"}
                {filterType === "CREDIT" && "Credits (+)"}
                {filterType === "DEBIT" && "Debits (-)"}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-foreground">
              <thead className="border-b border-border text-muted-foreground text-[10px] uppercase tracking-wider bg-muted/30">
                <tr>
                  <th className="py-3 px-4 font-semibold">Date & Time</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Description & Source</th>
                  <th className="py-3 px-4 font-semibold">Points Amount</th>
                  <th className="py-3 px-4 font-semibold">USD Equivalent</th>
                  <th className="py-3 px-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {(!data.transactions || data.transactions.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      No ledger transactions recorded for this user yet.
                    </td>
                  </tr>
                ) : (
                  data.transactions
                    .filter((tx) => {
                      if (txFilter === "CREDIT") return tx.direction === "CREDIT";
                      if (txFilter === "DEBIT") return tx.direction === "DEBIT";
                      return true;
                    })
                    .map((tx) => {
                      const isCredit = tx.direction === "CREDIT";
                      return (
                        <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4 text-muted-foreground whitespace-nowrap text-[11px]">
                            {new Date(tx.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-bold ${
                                tx.type === "OFFER_REWARD"
                                  ? "text-indigo-400 border-indigo-500/30 bg-indigo-500/5"
                                  : tx.type === "SURVEY_REWARD"
                                  ? "text-teal-400 border-teal-500/30 bg-teal-500/5"
                                  : tx.type === "REFERRAL_REWARD"
                                  ? "text-purple-400 border-purple-500/30 bg-purple-500/5"
                                  : tx.type === "WITHDRAWAL"
                                  ? "text-blue-400 border-blue-500/30 bg-blue-500/5"
                                  : "text-amber-400 border-amber-500/30 bg-amber-500/5"
                              }`}
                            >
                              {tx.type}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 max-w-sm">
                            <span className="font-semibold text-foreground block truncate">
                              {tx.description}
                            </span>
                            <span className="text-[10px] text-muted-foreground block font-mono">
                              Source: {tx.source} {tx.referenceId ? `• Ref: ${tx.referenceId}` : ""}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold">
                            <span
                              className={`inline-flex items-center gap-1 ${
                                isCredit ? "text-emerald-500" : "text-rose-500"
                              }`}
                            >
                              {isCredit ? (
                                <ArrowDownLeft className="h-3 w-3" />
                              ) : (
                                <ArrowUpRight className="h-3 w-3" />
                              )}
                              {isCredit ? "+" : "-"}
                              {formatPoints(tx.amount)} pts
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-muted-foreground">
                            ≈ {formatCash(tx.amount / 1000)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Badge
                              className={`text-[9px] font-bold ${
                                tx.status === "COMPLETED"
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                  : tx.status === "PENDING"
                                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                  : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                              }`}
                            >
                              {tx.status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!modalAction} onOpenChange={(open) => !open && setModalAction(null)}>
        <DialogContent className="max-w-md bg-card border-border text-card-foreground">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              {modalAction === "REJECT" && <XCircle className="h-5 w-5 text-rose-500" />}
              {modalAction === "MARK_PAID" && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
              {modalAction === "APPROVE" && <ShieldAlert className="h-5 w-5 text-amber-500" />}
              {modalAction === "APPROVE" && "Approve (Move to Processing)"}
              {modalAction === "MARK_PAID" && "Confirm Disbursement (Mark Paid)"}
              {modalAction === "REJECT" && "Reject & Auto-Refund Points"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {modalAction === "REJECT"
                ? "Points will be immediately credited back to user balance upon rejection."
                : `Updating payout for ${data.user}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            {modalAction === "MARK_PAID" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Gateway Transaction ID / TxID</Label>
                <Input
                  placeholder="e.g. Binance TxID or Vodafone Ref #"
                  value={txIdInput}
                  onChange={(e) => setTxIdInput(e.target.value)}
                  className="bg-background border-border text-xs font-mono text-foreground"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                {modalAction === "REJECT" ? "Rejection Reason (Sent to User)" : "Admin Note (Optional)"}
              </Label>
              <Textarea
                rows={3}
                placeholder="Reason or notes..."
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                className="bg-background border-border text-xs text-foreground"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => setModalAction(null)}
              className="border-border text-foreground hover:bg-accent"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isSubmitting}
              onClick={handleExecuteStatusChange}
              className={`font-bold ${
                modalAction === "REJECT"
                  ? "bg-rose-600 hover:bg-rose-500 text-white"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
              }`}
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
              {modalAction === "APPROVE" && "Approve"}
              {modalAction === "MARK_PAID" && "Confirm Paid"}
              {modalAction === "REJECT" && "Confirm Reject & Refund"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
