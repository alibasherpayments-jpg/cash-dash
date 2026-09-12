"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CreditCard, Edit, Trash2, RefreshCw, CheckCircle2, Loader2 } from "lucide-react";
import { formatPoints, formatCash } from "@/lib/formatters";
import apiClient from "@/lib/api-client";

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

export default function AdminWithdrawalMethodsPage() {
  const [methods, setMethods] = useState<MethodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchMethods = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/withdrawal-methods");
      const raw = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      const mapped: MethodItem[] = raw.map((m: any) => ({
        id: m.id,
        name: m.name,
        slug: m.slug,
        minimumPoints: m.minimumPoints,
        feePercent: m.feePercent || 0,
        processingTime: m.processingTime || "1-24 hours",
        isActive: m.isActive,
        fieldsCount: m.requirements?.length || 0,
      }));
      setMethods(mapped);
    } catch (err) {
      console.error("Failed to load methods:", err);
      setMethods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await apiClient.put(`/admin/withdrawal-methods/${id}`, { isActive: !current });
      setMethods((prev) =>
        prev.map((m) => (m.id === id ? { ...m, isActive: !current } : m))
      );
      setSuccessMsg(`Status updated successfully!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update method status");
    }
  };

  const handleDeleteMethod = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate ${name}?`)) return;
    try {
      await apiClient.delete(`/admin/withdrawal-methods/${id}`);
      setMethods((prev) => prev.filter((m) => m.id !== id));
      setSuccessMsg(`${name} deactivated successfully!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to deactivate method");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <CreditCard className="h-7 w-7 text-amber-500" /> Payment & Withdrawal Methods
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage payout options (Vodafone Cash, Binance, InstaPay, Crypto) and configure dynamic fields & minimums
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchMethods}
            disabled={loading}
            className="border-slate-800 text-slate-300 hover:text-white text-xs h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>

          <Button size="sm" asChild className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold h-9">
            <Link href="/admin/withdrawal-methods/new">
              <Plus className="h-4 w-4 mr-1.5" /> Add New Payment Method
            </Link>
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {successMsg}
        </div>
      )}

      <Card className="bg-[#12141d] border-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider bg-slate-900/40">
                <tr>
                  <th className="py-3.5 px-5 font-semibold">Method Name</th>
                  <th className="py-3.5 px-5 font-semibold">Identifier (Slug)</th>
                  <th className="py-3.5 px-5 font-semibold">Min. Points & USD</th>
                  <th className="py-3.5 px-5 font-semibold">Fee %</th>
                  <th className="py-3.5 px-5 font-semibold">Processing Speed</th>
                  <th className="py-3.5 px-5 font-semibold">Dynamic Fields</th>
                  <th className="py-3.5 px-5 font-semibold">Status</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Loader2 className="h-5 w-5 animate-spin text-amber-500 mx-auto mb-2" />
                      Loading payment methods from database...
                    </td>
                  </tr>
                ) : methods.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      No payout methods configured yet. Click &quot;Add New Payment Method&quot; above to create one.
                    </td>
                  </tr>
                ) : (
                  methods.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-white">{m.name}</td>
                    <td className="py-3.5 px-5 font-mono text-slate-400 text-[11px]">{m.slug}</td>
                    <td className="py-3.5 px-5">
                      <span className="font-bold text-white font-mono">{formatPoints(m.minimumPoints)}</span>
                      <span className="text-[10px] text-emerald-400 block font-semibold">
                        ≈ {formatCash(m.minimumPoints / 1000)} USD
                      </span>
                    </td>
                    <td className="py-3.5 px-5">{m.feePercent}%</td>
                    <td className="py-3.5 px-5 text-emerald-400 font-semibold">{m.processingTime}</td>
                    <td className="py-3.5 px-5">
                      <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30 font-medium">
                        {m.fieldsCount} Custom Fields
                      </Badge>
                    </td>
                    <td className="py-3.5 px-5">
                      <button
                        onClick={() => handleToggleActive(m.id, m.isActive)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                          m.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {m.isActive ? "Enabled" : "Disabled"}
                      </button>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1 whitespace-nowrap">
                      <Button size="sm" variant="ghost" asChild className="h-7 px-2 text-xs text-amber-400 hover:text-amber-300">
                        <Link href={`/admin/withdrawal-methods/${m.id}/edit`}>
                          <Edit className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteMethod(m.id, m.name)}
                        className="h-7 px-2 text-xs text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
