"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Gift, Edit, Trash2, Star, Loader2, RefreshCw } from "lucide-react";
import { formatPoints, formatCash, formatPointsAsCash } from "@/lib/formatters";
import apiClient from "@/lib/api-client";

interface AdminOfferItem {
  id: string;
  title: string;
  provider: string;
  category: string;
  rewardPoints: number;
  difficulty: string;
  status: "ACTIVE" | "INACTIVE" | "FEATURED" | "EXPIRED";
  isFeatured: boolean;
  completions: number;
}

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<AdminOfferItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/offers");
      const raw = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      const mapped: AdminOfferItem[] = raw.map((o: any) => ({
        id: o.id,
        title: o.title,
        provider: o.provider?.name || "Direct",
        category: o.category,
        rewardPoints: o.rewardPoints,
        difficulty: o.difficulty,
        status: o.status,
        isFeatured: o.isFeatured,
        completions: o.completionCount || 0,
      }));
      setOffers(mapped);
    } catch (err) {
      console.error("Failed to load offers:", err);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const filtered = offers.filter(
    (o) =>
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.category.toLowerCase().includes(search.toLowerCase()) ||
      o.provider.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await apiClient.put(`/admin/offers/${id}`, { status: newStatus });
      setOffers((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus as any } : o))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update offer status");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to deactivate "${title}"?`)) return;
    try {
      await apiClient.delete(`/admin/offers/${id}`);
      setOffers((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: "INACTIVE" } : o))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to deactivate offer");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Gift className="h-7 w-7 text-amber-500" /> Offer Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage active tasks, configure reward point amounts, and assign partner networks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchOffers}
            disabled={loading}
            className="border-slate-800 text-slate-300 hover:text-white text-xs h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>

          <Button size="sm" asChild className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold h-9">
            <Link href="/admin/offers/new">
              <Plus className="h-4 w-4 mr-1.5" /> Create New Offer
            </Link>
          </Button>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter offers by title, category, or provider..."
          className="bg-background border-border text-xs h-10 text-foreground"
        />
      </div>

      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-foreground">
              <thead className="border-b border-border text-muted-foreground text-[10px] uppercase tracking-wider bg-muted/30">
                <tr>
                  <th className="py-3.5 px-5 font-semibold">Offer Title</th>
                  <th className="py-3.5 px-5 font-semibold">Category</th>
                  <th className="py-3.5 px-5 font-semibold">Provider</th>
                  <th className="py-3.5 px-5 font-semibold">Reward</th>
                  <th className="py-3.5 px-5 font-semibold">Completions</th>
                  <th className="py-3.5 px-5 font-semibold">Status</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto mb-2" />
                      Loading offer inventory from database...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      No offers found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((o) => (
                    <tr key={o.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          {o.isFeatured && <Star className="h-3.5 w-3.5 fill-primary text-primary" />}
                          <span>{o.title}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <Badge variant="outline" className="text-[10px] text-muted-foreground border-border">
                          {o.category}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-5 text-muted-foreground">{o.provider}</td>
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-foreground">{formatPoints(o.rewardPoints)}</span>
                        <span className="text-[10px] text-emerald-500 block font-semibold">
                          ≈ {formatPointsAsCash(o.rewardPoints)}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-mono text-muted-foreground">{o.completions}</td>
                      <td className="py-3.5 px-5">
                        <button
                          onClick={() => handleToggleStatus(o.id, o.status)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                            o.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                              : "bg-muted text-muted-foreground border border-border"
                          }`}
                        >
                          {o.status}
                        </button>
                      </td>
                      <td className="py-3.5 px-5 text-right space-x-1">
                        <Button size="sm" variant="ghost" asChild className="h-7 text-xs text-primary hover:text-primary/80">
                          <Link href={`/admin/offers/${o.id}/edit`}>
                            <Edit className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(o.id, o.title)}
                          className="h-7 text-xs text-rose-500 hover:text-rose-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
    </div>
  );
}
