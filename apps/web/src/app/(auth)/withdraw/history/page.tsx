"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/common/status-badge";
import { Timeline } from "@/components/common/timeline";
import { EmptyWithdrawals } from "@/components/illustrations/empty-withdrawals";
import {
  ArrowLeft,
  ArrowUpRight,
  Clock,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { formatPoints, formatCash, formatDateTime } from "@/lib/formatters";

interface MockWithdrawalRecord {
  id: string;
  methodName: string;
  points: number;
  netPoints: number;
  cashValue: number;
  status: "PENDING" | "PROCESSING" | "PAID" | "REJECTED";
  destinationMasked: string;
  externalTxId?: string;
  createdAt: string;
  timeline: Array<{
    title: string;
    description: string;
    date: string;
    status: "completed" | "current" | "pending";
  }>;
}

const MOCK_WITHDRAWALS: MockWithdrawalRecord[] = [
  {
    id: "WDR-80921",
    methodName: "PayPal",
    points: 15000,
    netPoints: 15000,
    cashValue: 1.5,
    status: "PAID",
    destinationMasked: "us**@cashdash.io",
    externalTxId: "PP-TX-9981245",
    createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    timeline: [
      { title: "Requested", description: "User submitted withdrawal of 15,000 pts", date: "Sep 10, 2026 at 2:00 PM", status: "completed" },
      { title: "Automated Review", description: "Risk checks passed (Risk Score: 5)", date: "Sep 10, 2026 at 2:05 PM", status: "completed" },
      { title: "Processing", description: "Sent to PayPal gateway", date: "Sep 10, 2026 at 3:15 PM", status: "completed" },
      { title: "Paid", description: "Payment verified. Tx: PP-TX-9981245", date: "Sep 10, 2026 at 4:30 PM", status: "completed" },
    ],
  },
  {
    id: "WDR-80988",
    methodName: "Crypto (USDT)",
    points: 25000,
    netPoints: 24625,
    cashValue: 2.46,
    status: "PROCESSING",
    destinationMasked: "TV7k...88k1",
    createdAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    timeline: [
      { title: "Requested", description: "Submitted payout to USDT TRC20 address", date: "Today at 9:00 AM", status: "completed" },
      { title: "Under Review", description: "Batch fraud check completed", date: "Today at 9:30 AM", status: "completed" },
      { title: "Processing", description: "Queued for broadcast to Tron blockchain", date: "Today at 10:15 AM", status: "current" },
      { title: "Paid", description: "Blockchain transaction confirmation", date: "Pending broadcast", status: "pending" },
    ],
  },
  {
    id: "WDR-81005",
    methodName: "PayPal",
    points: 10000,
    netPoints: 10000,
    cashValue: 1.0,
    status: "PENDING",
    destinationMasked: "us**@cashdash.io",
    createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    timeline: [
      { title: "Requested", description: "Submitted withdrawal for 10,000 pts", date: "Today at 2:30 PM", status: "current" },
      { title: "Under Review", description: "Staff & risk queue validation", date: "Estimated 1-2 hours", status: "pending" },
      { title: "Processing", description: "Gateway disbursement", date: "Pending review", status: "pending" },
      { title: "Paid", description: "Direct credit to PayPal", date: "Pending disbursement", status: "pending" },
    ],
  },
];

export default function WithdrawalHistoryPage() {
  const [selectedRecord, setSelectedRecord] = useState<MockWithdrawalRecord | null>(null);

  return (
    <div className="space-y-6">
      {/* Top navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/withdraw">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Payout Methods
            </Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Withdrawal History</h1>
          <p className="text-xs text-muted-foreground">
            Track real-time status and audit timeline of all your requested payouts
          </p>
        </div>

        <Button asChild size="sm" className="font-bold">
          <Link href="/withdraw">
            <ArrowUpRight className="mr-2 h-4 w-4" /> New Cashout
          </Link>
        </Button>
      </div>

      {/* ─── Desktop Table & Mobile Cards ─────────────────────────── */}
      <Card className="border-border">
        <CardHeader className="p-6 pb-3">
          <CardTitle className="text-base font-bold">All Withdrawal Requests</CardTitle>
          <CardDescription className="text-xs">
            Click any row or details button to open the full status timeline
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          {MOCK_WITHDRAWALS.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="pb-3 font-semibold">Reference ID</th>
                      <th className="pb-3 font-semibold">Method</th>
                      <th className="pb-3 font-semibold">Amount</th>
                      <th className="pb-3 font-semibold">Destination</th>
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {MOCK_WITHDRAWALS.map((row) => (
                      <tr key={row.id} className="hover:bg-accent/5 transition-colors">
                        <td className="py-3.5 font-mono text-[11px] font-bold text-foreground">
                          {row.id}
                        </td>
                        <td className="py-3.5 font-semibold text-foreground">{row.methodName}</td>
                        <td className="py-3.5">
                          <span className="font-bold text-foreground">{formatPoints(row.points)}</span>
                          <span className="text-[10px] text-emerald-500 block font-semibold">
                            ≈ {formatCash(row.cashValue)}
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
                            <Eye className="h-3.5 w-3.5 mr-1" /> View Timeline
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List */}
              <div className="md:hidden space-y-3">
                {MOCK_WITHDRAWALS.map((row) => (
                  <div
                    key={row.id}
                    onClick={() => setSelectedRecord(row)}
                    className="p-4 rounded-xl bg-card border border-border space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-foreground">{row.id}</span>
                      <StatusBadge status={row.status} />
                    </div>

                    <div className="flex justify-between items-baseline">
                      <div>
                        <p className="font-bold text-sm text-foreground">{row.methodName}</p>
                        <p className="text-[11px] font-mono text-muted-foreground">{row.destinationMasked}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-foreground">{formatPoints(row.points)}</p>
                        <p className="text-xs text-emerald-500 font-semibold">{formatCash(row.cashValue)}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{formatDateTime(row.createdAt)}</span>
                      <span className="text-primary font-bold">Tap to view timeline →</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-12 text-center space-y-4">
              <EmptyWithdrawals className="mx-auto h-28 w-28 opacity-75" />
              <h4 className="font-bold text-base">No Withdrawal History Found</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Once you complete offers and reach the minimum points balance, your payout requests will appear here.
              </p>
              <Button asChild size="sm">
                <Link href="/withdraw">Redeem First Reward</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Detail & Timeline Modal ──────────────────────────────── */}
      <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent className="max-w-md">
          {selectedRecord && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between pr-4">
                  <DialogTitle className="text-base font-black flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" /> Payout {selectedRecord.id}
                  </DialogTitle>
                  <StatusBadge status={selectedRecord.status} />
                </div>
                <DialogDescription className="text-xs">
                  Requested on {formatDateTime(selectedRecord.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2 text-xs">
                {/* Specs Box */}
                <div className="p-3.5 rounded-xl bg-accent/5 border border-border grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Method</span>
                    <strong className="text-foreground">{selectedRecord.methodName}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Net Cashout</span>
                    <strong className="text-emerald-500 font-bold">{formatCash(selectedRecord.cashValue)} USD</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Points Redeemed</span>
                    <strong className="text-foreground">{formatPoints(selectedRecord.points)}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Destination</span>
                    <span className="font-mono text-foreground truncate block">{selectedRecord.destinationMasked}</span>
                  </div>
                  {selectedRecord.externalTxId && (
                    <div className="col-span-2 pt-1 border-t border-border/50">
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Provider Transaction Ref</span>
                      <span className="font-mono text-primary font-bold">{selectedRecord.externalTxId}</span>
                    </div>
                  )}
                </div>

                {/* Timeline */}
                <div className="space-y-2">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Status Progression Timeline
                  </h5>
                  <div className="space-y-4 pl-2 pt-2 border-l-2 border-border ml-2">
                    {selectedRecord.timeline.map((step, idx) => (
                      <div key={idx} className="relative pl-4">
                        <span
                          className={`absolute -left-[13px] top-0.5 h-4 w-4 rounded-full border-2 border-background flex items-center justify-center ${
                            step.status === "completed"
                              ? "bg-emerald-500 text-white"
                              : step.status === "current"
                              ? "bg-amber-500 animate-pulse text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {step.status === "completed" && <CheckCircle2 className="h-3 w-3" />}
                        </span>
                        <p className="font-bold text-foreground text-xs">{step.title}</p>
                        <p className="text-muted-foreground text-[11px]">{step.description}</p>
                        <span className="text-[10px] text-muted-foreground/70 block mt-0.5">{step.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
