"use client";

import React, { useState } from "react";
import { useOffers } from "@/hooks/use-offers";
import { OfferCard } from "@/components/common/offer-card";
import { SearchInput } from "@/components/common/search-input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyOffers } from "@/components/illustrations/empty-offers";
import { Gift, Sparkles, Filter, SlidersHorizontal } from "lucide-react";
import { OfferCategory } from "@cashdash/shared";

const CATEGORIES = [
  { label: "All Categories", value: "ALL" },
  { label: "Games", value: "GAMES" },
  { label: "Surveys", value: "SURVEYS" },
  { label: "Apps", value: "APPS" },
  { label: "Finance", value: "FINANCE" },
  { label: "Shopping", value: "SHOPPING" },
  { label: "Trials", value: "TRIALS" },
];

export default function OffersPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("recommended");

  const { offers, isLoading } = useOffers({
    category: selectedCategory === "ALL" ? undefined : (selectedCategory as OfferCategory),
    search: searchTerm || undefined,
    sort: sortBy,
  });

  return (
    <div className="space-y-6">
      {/* ─── Header & Breadcrumb ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <Gift className="h-7 w-7 text-primary" /> Offer Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Discover verified tasks, surveys, and high-reward mobile games
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs font-semibold">
            ● 30+ Offers Available
          </Badge>
        </div>
      </div>

      {/* ─── Controls: Search, Categories, Sorting ───────────────── */}
      <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-card border border-border">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-8">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search offers by game, app, or survey keywords..."
              className="w-full"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="sm:col-span-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort offers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended First</SelectItem>
                <SelectItem value="highest_reward">Highest Reward (Points)</SelectItem>
                <SelectItem value="lowest_reward">Lowest Reward</SelectItem>
                <SelectItem value="fastest">Fastest Completion</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Horizontal Category Badges / Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/25"
                    : "bg-background/80 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Offer Cards Grid ────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-card/60 animate-pulse border border-border/50" />
          ))}
        </div>
      ) : offers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-4">
          <EmptyOffers className="mx-auto h-32 w-32 opacity-80" />
          <h3 className="text-lg font-bold">No Offers Matching Your Filter</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try searching for different terms or reset your category filters to view all available earning tasks.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedCategory("ALL");
              setSearchTerm("");
              setSortBy("recommended");
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
