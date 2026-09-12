"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Wallet,
  CheckSquare,
  Square,
  Sparkles,
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
  rawDestination?: any;
  walletKey: string;
  date: string;
  externalTxId?: string;
}

/**
 * Extracts a normalized wallet/account identifier from withdrawal destination details.
 * Ensures all requests directed to the same phone/wallet/UID share the same key.
 */
function extractWalletKey(raw: any, destStr?: string): string {
  if (raw && typeof raw === "object") {
    const priorityKeys = [
      "phone",
      "mobile",
      "mobile_number",
      "wallet",
      "wallet_number",
      "vodafone_cash",
      "orange_money",
      "etisalat_cash",
      "instapay",
      "ipa",
      "account",
      "address",
      "crypto_address",
      "binance_id",
      "binance_pay_id",
      "pay_id",
      "uid",
      "email",
      "number",
    ];
    for (const key of priorityKeys) {
      if (raw[key]) {
        return String(raw[key]).trim().toLowerCase();
      }
    }
    for (const [k, v] of Object.entries(raw)) {
      const kl = k.toLowerCase();
      if (
        (kl.includes("phone") ||
          kl.includes("mobile") ||
          kl.includes("wallet") ||
          kl.includes("address") ||
          kl.includes("account") ||
          kl.includes("binance") ||
          kl.includes("uid")) &&
        v
      ) {
        return String(v).trim().toLowerCase();
      }
    }
    const vals = Object.values(raw).filter(Boolean);
    if (vals.length > 0) return String(vals[0]).trim().toLowerCase();
  }

  const s = String(destStr || raw || "").trim().toLowerCase();
  if (s.includes(":")) {
    const parts = s.split("|").map((p) => p.trim());
    for (const part of parts) {
      const [k, v] = part.split(":").map((x) => x.trim());
      if (v && v.length >= 2) return v;
    }
  }
  return s || "unknown";
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Single action state
  const [actionItem, setActionItem] = useState<{
    row: AdminWithdrawalRow;
    action: "APPROVE" | "MARK_PAID" | "REJECT";
  } | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [externalTxId, setExternalTxId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Batch action state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchAction, setBatchAction] = useState<"APPROVE" | "MARK_PAID" | "REJECT" | null>(null);
  const [batchNote, setBatchNote] = useState("");
  const [batchExternalTxId, setBatchExternalTxId] = useState("");
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  // Feedback message
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch real withdrawals from API
  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterStatus !== "ALL") params.status = filterStatus;
      const res = await apiClient.get("/admin/withdrawals", { params });
      const rawList = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      const mapped: AdminWithdrawalRow[] = rawList.map((w: any) => {
        let destStr = "";
        if (typeof w.destination === "object" && w.destination !== null) {
          destStr = Object.entries(w.destination)
            .map(([k, v]) => `${k}: ${v}`)
            .join(" | ");
        } else {
          destStr = String(w.destination || "N/A");
        }

        const walletKey = extractWalletKey(w.destination, destStr);

        return {
          id: w.id,
          user: w.user?.username || w.userId || "User",
          userId: w.userId,
          method: w.method?.name || "Payment",
          points: w.points,
          cashValue: w.cashValue || w.points / 1000,
          status: w.status,
          riskScore: w.user?.riskAssessment?.riskScore ?? 10,
          destination: destStr,
          rawDestination: w.destination,
          walletKey,
          date: new Date(w.createdAt).toLocaleString(),
          externalTxId: w.externalTxId,
        };
      });
      setWithdrawals(mapped);
    } catch (err) {
      console.error("Failed to load withdrawals:", err);
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [filterStatus]);

  // Compute how many withdrawals exist for each wallet
  const walletCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const w of withdrawals) {
      if (w.walletKey) {
        counts[w.walletKey] = (counts[w.walletKey] || 0) + 1;
      }
    }
    return counts;
  }, [withdrawals]);

  // Filtered rows
  const filtered = withdrawals.filter((w) => {
    if (filterStatus !== "ALL" && w.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        w.id.toLowerCase().includes(q) ||
        w.user.toLowerCase().includes(q) ||
        w.destination.toLowerCase().includes(q) ||
        w.walletKey.toLowerCase().includes(q) ||
        w.method.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Multi-selection helpers
  const allFilteredIds = useMemo(() => filtered.map((w) => w.id), [filtered]);
  const isAllSelected =
    allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedIds.includes(id));
  const isSomeSelected =
    allFilteredIds.some((id) => selectedIds.includes(id)) && !isAllSelected;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  /**
   * Selects all requests sharing the exact same wallet destination.
   * If already all selected, toggles them off.
   */
  const handleSelectSameWallet = (targetWalletKey: string) => {
    if (!targetWalletKey) return;
    const matching = withdrawals.filter((w) => w.walletKey === targetWalletKey);
    const actionable = matching.filter(
      (w) => w.status === "PENDING" || w.status === "PROCESSING"
    );
    const toSelect = actionable.length > 0 ? actionable : matching;
    const targetIds = toSelect.map((w) => w.id);

    setSelectedIds((prev) => {
      const allSelected = targetIds.every((id) => prev.includes(id));
      if (allSelected) {
        return prev.filter((id) => !targetIds.includes(id));
      } else {
        return Array.from(new Set([...prev, ...targetIds]));
      }
    });
  };

  /**
   * One-click shortcut: selects all pending/processing requests on this wallet and immediately opens Batch Approve modal.
   */
  const handleQuickApproveWallet = (targetWalletKey: string) => {
    const matching = withdrawals.filter(
      (w) => w.walletKey === targetWalletKey && (w.status === "PENDING" || w.status === "PROCESSING")
    );
    if (matching.length === 0) return;
    setSelectedIds(matching.map((w) => w.id));
    setBatchAction("APPROVE");
  };

  // Selected summaries
  const selectedRows = useMemo(() => {
    return withdrawals.filter((w) => selectedIds.includes(w.id));
  }, [withdrawals, selectedIds]);

  const selectedTotalPoints = useMemo(() => {
    return selectedRows.reduce((acc, curr) => acc + curr.points, 0);
  }, [selectedRows]);

  const selectedTotalCash = useMemo(() => {
    return selectedRows.reduce((acc, curr) => acc + curr.cashValue, 0);
  }, [selectedRows]);

  const selectedUniqueWallets = useMemo(() => {
    const set = new Set(selectedRows.map((r) => r.walletKey).filter(Boolean));
    return Array.from(set);
  }, [selectedRows]);

  // Handle single item status change
  const handleExecuteStatusChange = async () => {
    if (!actionItem) return;
    const { row, action } = actionItem;

    let nextStatus: "PENDING" | "PROCESSING" | "PAID" | "REJECTED" = row.status;
    if (action === "APPROVE") nextStatus = "PROCESSING";
    if (action === "MARK_PAID") nextStatus = "PAID";
    if (action === "REJECT") nextStatus = "REJECTED";

    setIsProcessing(true);
    try {
      await apiClient.patch(`/admin/withdrawals/${row.id}/status`, {
        status: nextStatus,
        note: adminNote || (action === "REJECT" ? "Request rejected by admin" : "Approved by administrator"),
        ...(action === "MARK_PAID" && externalTxId ? { externalTxId } : {}),
      });

      await fetchWithdrawals();

      const msg =
        action === "APPROVE"
          ? `Withdrawal ${row.id} moved to Processing.`
          : action === "MARK_PAID"
          ? `Withdrawal ${row.id} marked as Paid (${externalTxId || "disbursed"}).`
          : `Withdrawal ${row.id} rejected and points refunded to ${row.user}.`;

      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update withdrawal status");
    } finally {
      setIsProcessing(false);
      setActionItem(null);
      setAdminNote("");
      setExternalTxId("");
    }
  };

  // Handle batch status change for all selected withdrawals
  const handleExecuteBatchStatus = async () => {
    if (!batchAction || selectedIds.length === 0) return;

    let nextStatus: "PENDING" | "PROCESSING" | "PAID" | "REJECTED" = "PROCESSING";
    if (batchAction === "APPROVE") nextStatus = "PROCESSING";
    if (batchAction === "MARK_PAID") nextStatus = "PAID";
    if (batchAction === "REJECT") nextStatus = "REJECTED";

    setIsBatchProcessing(true);
    try {
      const res = await apiClient.post("/admin/withdrawals/batch-status", {
        withdrawalIds: selectedIds,
        status: nextStatus,
        note:
          batchNote ||
          (batchAction === "REJECT"
            ? "Batch rejected by admin"
            : `Batch approved for wallet ${selectedUniqueWallets.join(", ")}`),
        ...(batchAction === "MARK_PAID" && batchExternalTxId ? { externalTxId: batchExternalTxId } : {}),
      });

      await fetchWithdrawals();

      const successCount = res.data?.data?.succeeded ?? selectedIds.length;
      const msg =
        batchAction === "APPROVE"
          ? `تم قبول ${successCount} طلب سحب بنجاح ونقلها إلى قيد التنفيذ (Processing).`
          : batchAction === "MARK_PAID"
          ? `تم تأكيد دفع ${successCount} طلب سحب كمدفوع (Paid) بنجاح.`
          : `تم رفض ${successCount} طلب واسترجاع النقاط للمستخدمين.`;

      setSuccessMsg(msg);
      setSelectedIds([]);
      setBatchAction(null);
      setBatchNote("");
      setBatchExternalTxId("");
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error("Batch update error, attempting sequential execution:", err);
      try {
        for (const id of selectedIds) {
          await apiClient.patch(`/admin/withdrawals/${id}/status`, {
            status: nextStatus,
            note: batchNote || "Batch updated by admin",
            ...(batchAction === "MARK_PAID" && batchExternalTxId ? { externalTxId: batchExternalTxId } : {}),
          });
        }
        await fetchWithdrawals();
        setSuccessMsg(`تم تحديث ${selectedIds.length} طلب بنجاح.`);
        setSelectedIds([]);
        setBatchAction(null);
        setTimeout(() => setSuccessMsg(null), 5000);
      } catch (fallbackErr: any) {
        alert(fallbackErr.response?.data?.message || err.response?.data?.message || "فشل تنفيذ التحديث الجماعي");
      }
    } finally {
      setIsBatchProcessing(false);
    }
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
            Review submitted payouts, batch-approve payments for same wallets, or issue automated refunds
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
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* ─── Batch Actions Toolbar (Appears when any rows are selected) ─── */}
      {selectedIds.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-indigo-950/40 border border-amber-500/40 shadow-xl shadow-amber-500/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1">
              تم تحديد {selectedIds.length} طلب سحب
            </Badge>

            {selectedUniqueWallets.length === 1 && (
              <span className="text-xs text-slate-300 font-mono bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5">
                <Wallet className="h-3.5 w-3.5 text-amber-400" />
                المحفظة المشتركة: <strong className="text-white">{selectedUniqueWallets[0]}</strong>
              </span>
            )}

            <div className="text-xs text-slate-300">
              الإجمالي:{" "}
              <strong className="text-emerald-400 font-bold">
                {formatPoints(selectedTotalPoints)} نقطة
              </strong>{" "}
              <span className="text-slate-400">
                (≈ ${selectedTotalCash.toFixed(2)} USD)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => setBatchAction("APPROVE")}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold h-8 px-3.5 shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              قبول الكل دفعة واحدة ({selectedIds.length})
            </Button>
            <Button
              size="sm"
              onClick={() => setBatchAction("MARK_PAID")}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold h-8 px-3 flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              تحديد كمدفوع ({selectedIds.length})
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setBatchAction("REJECT")}
              className="border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs h-8 px-3 flex items-center gap-1.5"
            >
              <XCircle className="h-3.5 w-3.5" />
              رفض واسترجاع
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedIds([])}
              className="text-slate-400 hover:text-white text-xs h-8"
            >
              إلغاء التحديد
            </Button>
          </div>
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
        <div className="text-xs text-slate-400 px-3 py-2 bg-[#12141d] border border-slate-800 rounded-lg whitespace-nowrap">
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
                  <th className="py-3.5 px-4 w-10 text-center">
                    <button
                      type="button"
                      onClick={handleToggleSelectAll}
                      className="text-slate-400 hover:text-white focus:outline-none"
                      title={isAllSelected ? "إلغاء تحديد الكل" : "تحديد الكل"}
                    >
                      {isAllSelected ? (
                        <CheckSquare className="h-4 w-4 text-amber-500" />
                      ) : isSomeSelected ? (
                        <CheckSquare className="h-4 w-4 text-amber-500/70" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-600 hover:text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-5 font-semibold">Ref ID</th>
                  <th className="py-3.5 px-5 font-semibold">User</th>
                  <th className="py-3.5 px-5 font-semibold">Method</th>
                  <th className="py-3.5 px-5 font-semibold">Points / USD</th>
                  <th className="py-3.5 px-5 font-semibold">Destination & Wallet Actions</th>
                  <th className="py-3.5 px-5 font-semibold">Risk Score</th>
                  <th className="py-3.5 px-5 font-semibold">Status</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      No withdrawal requests matching your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((w) => {
                    const isRowSelected = selectedIds.includes(w.id);
                    const walletCount = walletCounts[w.walletKey] || 1;

                    return (
                      <tr
                        key={w.id}
                        className={`transition-colors ${
                          isRowSelected
                            ? "bg-amber-500/10 border-l-2 border-l-amber-500"
                            : "hover:bg-slate-800/30"
                        }`}
                      >
                        {/* Row Checkbox */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleRow(w.id)}
                            className="text-slate-400 hover:text-white focus:outline-none"
                          >
                            {isRowSelected ? (
                              <CheckSquare className="h-4 w-4 text-amber-500" />
                            ) : (
                              <Square className="h-4 w-4 text-slate-600 hover:text-slate-400" />
                            )}
                          </button>
                        </td>

                        {/* Ref ID */}
                        <td className="py-3.5 px-5 font-mono text-[11px] font-bold text-white">
                          {w.id}
                        </td>

                        {/* User */}
                        <td className="py-3.5 px-5">
                          <span className="font-bold text-white block">{w.user}</span>
                          <span className="text-[10px] text-slate-500">{w.date}</span>
                        </td>

                        {/* Method */}
                        <td className="py-3.5 px-5">
                          <span className="font-semibold text-white">{w.method}</span>
                        </td>

                        {/* Points / USD */}
                        <td className="py-3.5 px-5">
                          <span className="font-bold text-white">{formatPoints(w.points)}</span>
                          <span className="text-[10px] text-emerald-400 block font-semibold">
                            ≈ {formatCash(w.cashValue)} USD
                          </span>
                        </td>

                        {/* Destination & Dedicated 'Select Same Wallet' Button */}
                        <td className="py-3.5 px-5">
                          <div className="space-y-1.5">
                            <span
                              className="font-mono text-[11px] text-slate-300 block max-w-xs truncate"
                              title={w.destination}
                            >
                              {w.destination}
                            </span>
                            {w.externalTxId && (
                              <span className="text-[10px] text-emerald-400 font-mono block">
                                TxID: {w.externalTxId}
                              </span>
                            )}

                            {/* زر التحديد لكل طرق السحب على نفس المحفظة */}
                            <div className="flex items-center gap-1.5 pt-0.5">
                              <Button
                                size="sm"
                                variant="outline"
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectSameWallet(w.walletKey);
                                }}
                                className={`h-6 px-2 text-[10px] font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                                  isRowSelected && selectedUniqueWallets.includes(w.walletKey)
                                    ? "bg-amber-500 text-slate-950 border-amber-400 font-black hover:bg-amber-400"
                                    : "bg-slate-900/90 border-slate-700 hover:border-amber-500/60 hover:bg-amber-500/10 text-slate-300 hover:text-amber-300"
                                }`}
                                title={`تحديد كل طلبات السحب على المحفظة: ${w.walletKey}`}
                              >
                                <Wallet className="h-3 w-3 text-amber-400 shrink-0" />
                                <span>تحديد نفس المحفظة</span>
                                {walletCount > 1 && (
                                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-200 text-[9px] font-black">
                                    {walletCount}
                                  </span>
                                )}
                              </Button>

                              {/* زر قبول سريع لنفس المحفظة إذا كان هناك أكثر من طلب معلق */}
                              {walletCount > 1 && w.status === "PENDING" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickApproveWallet(w.walletKey);
                                  }}
                                  className="h-6 px-1.5 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                                  title={`قبول كل سحوبات هذه المحفظة (${walletCount}) فوراً`}
                                >
                                  ⚡ قبول الكل ({walletCount})
                                </Button>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Risk Score */}
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

                        {/* Status */}
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

                        {/* Actions */}
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

                          <Button
                            size="sm"
                            variant="ghost"
                            asChild
                            className="h-7 px-2 text-xs text-slate-400 hover:text-white"
                          >
                            <Link href={`/admin/withdrawals/${w.id}`}>
                              <Eye className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
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

      {/* ─── Batch Status Confirmation Modal ─────────────────────── */}
      <Dialog open={!!batchAction} onOpenChange={(open) => !open && setBatchAction(null)}>
        <DialogContent className="max-w-lg bg-[#12141d] border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              {batchAction === "REJECT" ? (
                <XCircle className="h-5 w-5 text-rose-500" />
              ) : batchAction === "MARK_PAID" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <ShieldAlert className="h-5 w-5 text-amber-500" />
              )}
              {batchAction === "APPROVE" && `قبول ${selectedIds.length} طلبات سحب دفعة واحدة`}
              {batchAction === "MARK_PAID" && `تأكيد دفع ${selectedIds.length} طلبات سحب`}
              {batchAction === "REJECT" && `رفض واسترجاع ${selectedIds.length} طلبات سحب`}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              {batchAction === "REJECT"
                ? "سيتم رفض كافة الطلبات المحددة واسترجاع النقاط بالكامل إلى أرصدة المستخدمين فورًا."
                : `تأكيد تحديث الحالة لعدد ${selectedIds.length} طلبات سحب دفعة واحدة.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            {/* Summary statistics */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">عدد الطلبات المحددة</span>
                <strong className="text-white">{selectedIds.length} طلب</strong>
              </div>
              {selectedUniqueWallets.length === 1 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">المحفظة المستهدفة</span>
                  <span className="font-mono text-amber-400 font-bold">{selectedUniqueWallets[0]}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">إجمالي النقاط</span>
                <strong className="text-emerald-400 font-bold">
                  {formatPoints(selectedTotalPoints)} نقطة
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">القيمة بالدولار</span>
                <strong className="text-white font-bold">
                  ${selectedTotalCash.toFixed(2)} USD
                </strong>
              </div>
            </div>

            {/* List of selected requests */}
            <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-800/80 divide-y divide-slate-800/60 bg-slate-950/40">
              {selectedRows.map((r) => (
                <div key={r.id} className="p-2.5 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="font-mono font-bold text-white block">{r.id}</span>
                    <span className="text-slate-400">
                      {r.user} • {r.method}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-400">{formatPoints(r.points)} pts</span>
                    <span className="text-[10px] text-slate-500 block">${r.cashValue.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* External TxID input for Mark Paid */}
            {batchAction === "MARK_PAID" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-200">
                  معرف المعاملة الخارجي (Gateway TxID / Reference - اختياري)
                </Label>
                <Input
                  placeholder="e.g. Binance TxID or Vodafone Batch Ref"
                  value={batchExternalTxId}
                  onChange={(e) => setBatchExternalTxId(e.target.value)}
                  className="bg-slate-900 border-slate-800 text-xs font-mono text-slate-200"
                />
              </div>
            )}

            {/* Audit / Reason Note */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-200">
                {batchAction === "REJECT" ? "سبب الرفض (يصل للمستخدمين)" : "ملاحظة المسؤول (Admin Audit Note)"}
              </Label>
              <Textarea
                rows={2}
                placeholder={
                  batchAction === "REJECT"
                    ? "مثال: عدم تطابق بيانات المحفظة أو تم الرفض بواسطة الإدارة..."
                    : "ملاحظات الفحص والقبول الجماعي..."
                }
                value={batchNote}
                onChange={(e) => setBatchNote(e.target.value)}
                className="bg-slate-900 border-slate-800 text-xs text-slate-200"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              disabled={isBatchProcessing}
              onClick={() => setBatchAction(null)}
              className="border-slate-800 text-slate-300"
            >
              إلغاء
            </Button>
            <Button
              size="sm"
              disabled={isBatchProcessing}
              onClick={handleExecuteBatchStatus}
              className={`font-bold ${
                batchAction === "REJECT"
                  ? "bg-rose-600 hover:bg-rose-500 text-white"
                  : batchAction === "APPROVE"
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : "bg-amber-500 hover:bg-amber-600 text-slate-950"
              }`}
            >
              {isBatchProcessing && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
              {batchAction === "APPROVE" && `تأكيد قبول الكل (${selectedIds.length})`}
              {batchAction === "MARK_PAID" && `تأكيد الدفع للكل (${selectedIds.length})`}
              {batchAction === "REJECT" && `تأكيد الرفض والاسترجاع (${selectedIds.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Single Item Status Confirmation Action Modal ─────────── */}
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
