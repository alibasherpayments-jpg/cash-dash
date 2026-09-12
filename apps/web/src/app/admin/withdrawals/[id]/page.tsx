"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, ShieldAlert, Clock, AlertTriangle, FileText } from "lucide-react";
import { formatPoints, formatCash } from "@/lib/formatters";

export default function AdminWithdrawalDetailPage() {
  const params = useParams();
  const withdrawalId = (params.id as string) || "WDR-81005";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild className="text-slate-400 hover:text-white">
        <Link href="/admin/withdrawals">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Withdrawals Queue
        </Link>
      </Button>

      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#12141d] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white">{withdrawalId}</h1>
            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">
              PENDING REVIEW
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Submitted today at 2:30 PM by user ryan_hustle</p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
            Approve Payout
          </Button>
          <Button size="sm" variant="outline" className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10">
            Reject Request
          </Button>
        </div>
      </div>

      {/* Financial Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#12141d] border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Payout Method</span>
          <span className="text-lg font-bold text-white">PayPal</span>
          <span className="text-xs text-slate-400 block">Fee: 0%</span>
        </div>

        <div className="p-4 rounded-xl bg-[#12141d] border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Points Deducted</span>
          <span className="text-lg font-mono font-bold text-white">{formatPoints(10000)}</span>
          <span className="text-xs text-slate-400 block">Deducted from ledger</span>
        </div>

        <div className="p-4 rounded-xl bg-[#12141d] border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Net Payout Value</span>
          <span className="text-lg font-bold text-emerald-400">$1.00 USD</span>
          <span className="text-xs text-slate-400 block">Zero fee transaction</span>
        </div>
      </div>

      {/* Destination & Fraud Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-[#12141d] border-slate-800 text-slate-100">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold text-white">Destination Details</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-2 text-xs">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1 font-mono">
              <p className="text-slate-400">Destination Field: <span className="text-white">paypalEmail</span></p>
              <p className="text-slate-400">Value: <span className="text-amber-400">ryan@example.com</span></p>
            </div>
            <p className="text-[11px] text-slate-400">
              Matches user registered email address. High confidence score.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#12141d] border-slate-800 text-slate-100">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-emerald-400" /> Fraud & Risk Telemetry
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-800">
              <span className="text-slate-400">Risk Assessment</span>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                Score: 10 / 100 (LOW)
              </Badge>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-800">
              <span className="text-slate-400">IP Geolocation</span>
              <span className="text-slate-200">United States (US) — Clean ASN</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">VPN / Proxy Detection</span>
              <span className="text-emerald-400 font-bold">Negative (Clean Residential)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
