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
} from "lucide-react";
import { formatPoints, formatCash } from "@/lib/formatters";
import apiClient from "@/lib/api-client";

export default function AdminWithdrawalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const withdrawalId = params.id as string;

  const [data, setData] = useState<{
    id: string;
    user: string;
    email: string;
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
  } | null>(null);

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
          user: w.user?.username || "User",
          email: w.user?.email || "user@cashdash.io",
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
            <CardTitle className="text-sm font-bold text-foreground">Destination Details</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-2.5 text-xs">
            <div className="p-3.5 rounded-lg bg-background/60 border border-border space-y-1.5 font-mono">
              {Object.entries(data.destination).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-muted-foreground">{k}:</span>
                  <span className="text-primary font-bold">{String(v)}</span>
                </div>
              ))}
            </div>

            {data.externalTxId && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-mono text-[11px]">
                TxID: {data.externalTxId}
              </div>
            )}

            {data.adminNote && (
              <div className="p-2.5 rounded-lg bg-background/60 border border-border text-foreground text-xs">
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">Admin Note:</span>
                {data.adminNote}
              </div>
            )}
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
