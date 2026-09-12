"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CreditCard, Edit, Trash2, Sliders, CheckCircle2 } from "lucide-react";
import { formatPoints } from "@/lib/formatters";

interface MethodItem {
  id: string;
  name: string;
  slug: string;
  minimumPoints: number;
  feePercent: number;
  processingTime: string;
  isActive: boolean;
  fieldsCount: number;
}

const INITIAL_METHODS: MethodItem[] = [
  { id: "meth-1", name: "PayPal", slug: "paypal", minimumPoints: 5000, feePercent: 0, processingTime: "1–24 hours", isActive: true, fieldsCount: 2 },
  { id: "meth-2", name: "Crypto (USDT / BTC / LTC)", slug: "crypto", minimumPoints: 10000, feePercent: 1.5, processingTime: "Instant to 2 hours", isActive: true, fieldsCount: 2 },
  { id: "meth-3", name: "Digital Gift Cards", slug: "gift-cards", minimumPoints: 5000, feePercent: 0, processingTime: "Instant to 6 hours", isActive: true, fieldsCount: 3 },
  { id: "meth-4", name: "Bank Transfer", slug: "bank-transfer", minimumPoints: 20000, feePercent: 2.0, processingTime: "1–3 business days", isActive: true, fieldsCount: 4 },
];

export default function AdminWithdrawalMethodsPage() {
  const [methods, setMethods] = useState<MethodItem[]>(INITIAL_METHODS);

  const handleToggleActive = (id: string) => {
    setMethods((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isActive: !m.isActive } : m))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <CreditCard className="h-7 w-7 text-amber-500" /> Withdrawal Method Builder
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Create, configure, and dynamically define custom input fields for payout gateways without code changes
          </p>
        </div>

        <Button size="sm" asChild className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold">
          <Link href="/admin/withdrawal-methods/new">
            <Plus className="h-4 w-4 mr-1.5" /> Add New Payout Method
          </Link>
        </Button>
      </div>

      <Card className="bg-[#12141d] border-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider bg-slate-900/40">
                <tr>
                  <th className="py-3.5 px-5 font-semibold">Method Name</th>
                  <th className="py-3.5 px-5 font-semibold">Identifier (Slug)</th>
                  <th className="py-3.5 px-5 font-semibold">Min Points</th>
                  <th className="py-3.5 px-5 font-semibold">Fee %</th>
                  <th className="py-3.5 px-5 font-semibold">Processing Speed</th>
                  <th className="py-3.5 px-5 font-semibold">Dynamic Fields</th>
                  <th className="py-3.5 px-5 font-semibold">Status</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {methods.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-white">{m.name}</td>
                    <td className="py-3.5 px-5 font-mono text-slate-400">{m.slug}</td>
                    <td className="py-3.5 px-5 font-mono">{formatPoints(m.minimumPoints)}</td>
                    <td className="py-3.5 px-5">{m.feePercent}%</td>
                    <td className="py-3.5 px-5 text-emerald-400">{m.processingTime}</td>
                    <td className="py-3.5 px-5">
                      <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">
                        {m.fieldsCount} Custom Fields
                      </Badge>
                    </td>
                    <td className="py-3.5 px-5">
                      <button
                        onClick={() => handleToggleActive(m.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          m.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {m.isActive ? "Enabled" : "Disabled"}
                      </button>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1">
                      <Button size="sm" variant="ghost" asChild className="h-7 text-xs text-amber-400">
                        <Link href={`/admin/withdrawal-methods/${m.id}/edit`}>
                          <Edit className="h-3.5 w-3.5" />
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
    </div>
  );
}
