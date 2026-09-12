"use client";

import React, { useState } from "react";
import Link from "next/link";
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
import { Gift, Sparkles, Filter, SlidersHorizontal, Layers, ArrowRight } from "lucide-react";
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
            Discover verified tasks, surveys, and high-reward campaigns
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs font-semibold">
            {offers.length > 0 ? `● ${offers.length} Offers Available` : "● Offerwalls Active"}
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
        <div className="p-12 sm:p-16 text-center rounded-2xl bg-card border border-border space-y-5">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Layers className="h-8 w-8" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-foreground">No Direct Offers Listed Right Now</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Direct marketplace offers are added periodically by administrators. In the meantime, head over to our <strong>Offerwalls Hub</strong> to earn unlimited points through 7 verified networks with instant postback clearance!
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button asChild size="lg" className="font-bold shadow-lg shadow-primary/20">
              <Link href="/offerwalls">
                <Layers className="mr-2 h-4 w-4" /> Explore Offerwalls Hub <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            {(selectedCategory !== "ALL" || searchTerm) && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setSelectedCategory("ALL");
                  setSearchTerm("");
                  setSortBy("recommended");
                }}
              >
                Reset Filters
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
