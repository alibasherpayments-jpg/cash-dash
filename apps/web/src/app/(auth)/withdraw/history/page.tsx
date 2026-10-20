"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "@/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Loader2,
  Coins,
} from "lucide-react";
import { formatPoints, formatCash, formatDateTime } from "@/lib/formatters";
import apiClient from "@/lib/api-client";

interface WithdrawalRecord {
  id: string;
  methodName: string;
  points: number;
  netPoints: number;
  cashValue: number;
  status: "PENDING" | "PROCESSING" | "PAID" | "REJECTED";
  destinationMasked: string;
  externalTxId?: string;
  createdAt: string;
  adminNote?: string;
}

function StatusBadge({ status }: { status: WithdrawalRecord["status"] }) {
  const { t } = useTranslation();
  switch (status) {
    case "PAID":
      return (
        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs font-semibold">
          <CheckCircle2 className="h-3 w-3 mr-1" /> {t.common.paid}
        </Badge>
      );
    case "PROCESSING":
      return (
        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs font-semibold">
          <Clock className="h-3 w-3 mr-1" /> {t.common.processing}
        </Badge>
      );
    case "PENDING":
      return (
        <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs font-semibold">
          <Clock className="h-3 w-3 mr-1" /> {t.common.pending}
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs font-semibold">
          <XCircle className="h-3 w-3 mr-1" /> {t.common.rejected}
        </Badge>
      );
  }
}

export default function WithdrawalHistoryPage() {
  const { t } = useTranslation();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<WithdrawalRecord | null>(null);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/withdrawals/mine");
      if (res.data?.data && Array.isArray(res.data.data)) {
        const mapped: WithdrawalRecord[] = res.data.data.map((w: any) => {
          let destStr = "";
          if (typeof w.destination === "object" && w.destination !== null) {
            destStr = Object.entries(w.destination)
              .map(([_, v]) => String(v))
              .join(" | ");
          } else {
            destStr = String(w.destination || "N/A");
          }

          return {
            id: w.id,
            methodName: w.method?.name || "Payout",
            points: w.points,
            netPoints: w.netPoints || w.points,
            cashValue: w.cashValue || w.points / 1000,
            status: w.status,
            destinationMasked: destStr,
            externalTxId: w.externalTxId,
            createdAt: w.createdAt,
            adminNote: w.adminNote,
          };
        });
        setWithdrawals(mapped);
      } else {
        setWithdrawals([]);
      }
    } catch {
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/withdraw">
              <ArrowLeft className="mr-2 h-4 w-4" /> {t.withdrawHistory.backToWithdraw}
            </Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{t.withdrawHistory.title}</h1>
          <p className="text-xs text-muted-foreground">
            {t.withdrawHistory.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchWithdrawals}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button asChild size="sm" className="font-bold">
            <Link href="/withdraw">
              <ArrowUpRight className="mr-2 h-4 w-4" /> {t.common.withdraw}
            </Link>
          </Button>
        </div>
      </div>

      {/* Desktop Table & Mobile Cards */}
      <Card className="border-border">
        <CardHeader className="p-6 pb-3">
          <CardTitle className="text-base font-bold">{t.withdrawHistory.title}</CardTitle>
          <CardDescription className="text-xs">
            {t.withdrawHistory.subtitle}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">{t.common.loading}</p>
            </div>
          ) : withdrawals.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="pb-3 font-semibold">{t.withdrawHistory.table.id}</th>
                      <th className="pb-3 font-semibold">{t.withdrawHistory.table.method}</th>
                      <th className="pb-3 font-semibold">{t.withdrawHistory.table.amount}</th>
                      <th className="pb-3 font-semibold">Destination</th>
                      <th className="pb-3 font-semibold">{t.withdrawHistory.table.date}</th>
                      <th className="pb-3 font-semibold">{t.withdrawHistory.table.status}</th>
                      <th className="pb-3 font-semibold text-right">{t.common.viewAll}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {withdrawals.map((row) => (
                      <tr key={row.id} className="hover:bg-accent/5 transition-colors">
                        <td className="py-3.5 font-mono text-[11px] font-bold text-foreground">
                          {row.id}
                        </td>
                        <td className="py-3.5 font-semibold text-foreground">{row.methodName}</td>
                        <td className="py-3.5">
                          <span className="font-bold text-foreground">{formatPoints(row.points)}</span>
                          <span className="text-[10px] text-emerald-500 block font-semibold">
                            ≈ {formatCash(row.cashValue)} USD
                          </span>
                        </td>
                        <td className="py-3.5 font-mono text-[11px] text-muted-foreground">
                          {row.destinationMasked}
                        </td>
                        <td className="py-3.5 text-muted-foreground">{formatDateTime(row.createdAt)}</td>
                        <td className="py-3.5">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="py-3.5 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedRecord(row)}
                            className="h-7 px-2 text-xs text-primary font-semibold"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" /> View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List */}
              <div className="md:hidden space-y-3">
                {withdrawals.map((row) => (
                  <div
                    key={row.id}
                    onClick={() => setSelectedRecord(row)}
                    className="p-4 rounded-xl bg-card border border-border space-y-3 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-foreground">{row.id}</span>
                      <StatusBadge status={row.status} />
                    </div>

                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-bold text-foreground">{row.methodName}</span>
                      <div className="text-right">
                        <span className="font-mono font-bold text-foreground">{formatPoints(row.points)}</span>
                        <span className="text-xs text-emerald-500 block font-semibold">
                          ≈ {formatCash(row.cashValue)} USD
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{formatDateTime(row.createdAt)}</span>
                      <span className="text-primary font-semibold flex items-center gap-1">
                        View Details <Eye className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-14 flex flex-col items-center justify-center text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Coins className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-foreground">{t.withdrawHistory.noHistory}</p>
                <p className="text-xs text-muted-foreground max-w-sm">
                  {t.withdrawHistory.noHistoryDesc}
                </p>
              </div>
              <Button asChild size="sm" className="font-bold text-xs mt-2">
                <Link href="/withdraw">
                  <ArrowUpRight className="mr-1.5 h-3.5 w-3.5" /> {t.common.withdraw}
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline Modal Dialog */}
      <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Payout Details: {selectedRecord?.id}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Submitted on {selectedRecord ? formatDateTime(selectedRecord.createdAt) : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="p-4 rounded-xl bg-card border border-border space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t.withdrawHistory.table.method}</span>
                <span className="font-bold text-foreground">{selectedRecord?.methodName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t.withdraw.pointsToWithdraw}</span>
                <span className="font-mono font-bold text-foreground">
                  {formatPoints(selectedRecord?.points || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t.withdraw.willReceive}</span>
                <span className="font-bold text-emerald-500">
                  {formatCash(selectedRecord?.cashValue || 0)} USD
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Recipient Info</span>
                <span className="font-mono text-foreground font-semibold">
                  {selectedRecord?.destinationMasked}
                </span>
              </div>
              {selectedRecord?.externalTxId && (
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="text-muted-foreground">Gateway TxID</span>
                  <span className="font-mono text-emerald-500 font-bold">
                    {selectedRecord.externalTxId}
                  </span>
                </div>
              )}
              {selectedRecord?.adminNote && (
                <div className="pt-2 border-t border-border text-[11px] space-y-0.5">
                  <span className="text-muted-foreground font-semibold block">Admin Note / Status:</span>
                  <p className="text-foreground">{selectedRecord.adminNote}</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
