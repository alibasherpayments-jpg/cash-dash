"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Gift, Edit, Trash2, Star } from "lucide-react";
import { formatPoints, formatCash, formatPointsAsCash } from "@/lib/formatters";

interface AdminOfferItem {
  id: string;
  title: string;
  provider: string;
  category: string;
  rewardPoints: number;
  difficulty: string;
  status: "ACTIVE" | "INACTIVE";
  isFeatured: boolean;
  completions: number;
}

const INITIAL_OFFERS: AdminOfferItem[] = [
  { id: "off-1", title: "Raid: Shadow Legends - Reach Lv 40", provider: "AdVenture", category: "GAMES", rewardPoints: 45000, difficulty: "HARD", status: "ACTIVE", isFeatured: true, completions: 32 },
  { id: "off-2", title: "Revolut - Sign Up & First Card Payment", provider: "RewardHub", category: "FINANCE", rewardPoints: 65000, difficulty: "MEDIUM", status: "ACTIVE", isFeatured: true, completions: 18 },
  { id: "off-3", title: "Monopoly GO! - Board 15", provider: "PlayForge", category: "GAMES", rewardPoints: 28000, difficulty: "MEDIUM", status: "ACTIVE", isFeatured: true, completions: 45 },
  { id: "off-4", title: "Consumer Tech & Gadgets Survey 2026", provider: "InsightSurveys", category: "SURVEYS", rewardPoints: 2400, difficulty: "EASY", status: "ACTIVE", isFeatured: true, completions: 92 },
  { id: "off-5", title: "NordVPN - Secure 2-Year Plan", provider: "TaskForce", category: "APPS", rewardPoints: 75000, difficulty: "EASY", status: "ACTIVE", isFeatured: true, completions: 11 },
  { id: "off-6", title: "Temu - First Order with Discount", provider: "RewardHub", category: "SHOPPING", rewardPoints: 32000, difficulty: "MEDIUM", status: "ACTIVE", isFeatured: true, completions: 26 },
];

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<AdminOfferItem[]>(INITIAL_OFFERS);
  const [search, setSearch] = useState("");

  const filtered = offers.filter(
    (o) =>
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleStatus = (id: string) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: o.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" } : o))
    );
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

        <Button size="sm" asChild className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold">
          <Link href="/admin/offers/new">
            <Plus className="h-4 w-4 mr-1.5" /> Create New Offer
          </Link>
        </Button>
      </div>

      <div className="p-4 rounded-2xl bg-[#12141d] border border-slate-800">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter offers by title or category..."
          className="bg-slate-900 border-slate-800 text-xs h-10 text-slate-200"
        />
      </div>

      <Card className="bg-[#12141d] border-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider bg-slate-900/40">
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
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-white">
                      <div className="flex items-center gap-2">
                        {o.isFeatured && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                        <span>{o.title}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge variant="outline" className="text-[10px] text-slate-300 border-slate-700">
                        {o.category}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-5 text-slate-400">{o.provider}</td>
                    <td className="py-3.5 px-5">
                      <span className="font-bold text-amber-400">{formatPoints(o.rewardPoints)}</span>
                      <span className="text-[10px] text-emerald-400 block font-semibold">
                        ≈ {formatPointsAsCash(o.rewardPoints)}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-mono">{o.completions}</td>
                    <td className="py-3.5 px-5">
                      <button
                        onClick={() => handleToggleStatus(o.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          o.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {o.status}
                      </button>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1">
                      <Button size="sm" variant="ghost" asChild className="h-7 text-xs text-amber-400">
                        <Link href={`/admin/offers/${o.id}/edit`}>
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
