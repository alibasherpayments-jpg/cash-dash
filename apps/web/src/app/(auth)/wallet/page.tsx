"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TransactionItem } from "@/components/common/transaction-item";
import { EmptyWallet } from "@/components/illustrations/empty-wallet";
import {
  Wallet as WalletIcon,
  Coins,
  ArrowUpRight,
  Clock,
  TrendingUp,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { formatPoints, formatCash, formatPointsAsCash } from "@/lib/formatters";

const FILTER_TABS = [
  { label: "All Transactions", value: "ALL" },
  { label: "Offer Earnings", value: "OFFER_REWARD" },
  { label: "Withdrawals", value: "WITHDRAWAL" },
  { label: "Referrals", value: "REFERRAL_REWARD" },
  { label: "Surveys", value: "SURVEY_REWARD" },
];

export default function WalletPage() {
  const { summary, transactions, isLoading } = useWallet();
  const [activeFilter, setActiveFilter] = useState("ALL");

  const filteredTransactions = transactions.filter((tx: any) => {
    if (activeFilter === "ALL") return true;
    return tx.type === activeFilter;
  });

  return (
    <div className="space-y-8">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <WalletIcon className="h-7 w-7 text-primary" /> Wallet & Transaction Ledger
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Double-entry immutable ledger tracking all your points, rewards, and payouts
          </p>
        </div>

        <Button asChild className="font-bold shadow-lg shadow-primary/20">
          <Link href="/withdraw">
            <ArrowUpRight className="mr-2 h-4 w-4" /> Request Cashout
          </Link>
        </Button>
      </div>

      {/* ─── Balances Overview Cards ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <Card className="p-6 rounded-2xl bg-gradient-to-br from-primary/15 via-card to-card border-primary/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span className="font-bold uppercase tracking-wider">Available Balance</span>
            <Coins className="h-4 w-4 text-accent" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-foreground">
            {formatPoints(summary?.availablePoints || 0)}
          </div>
          <div className="text-xs font-bold text-emerald-500 mt-1">
            ≈ {formatPointsAsCash(summary?.availablePoints || 0)} USD
          </div>
        </Card>

        {/* Pending Points */}
        <Card className="p-6 rounded-2xl bg-card border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span className="font-bold uppercase tracking-wider">Pending Points</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-foreground">
            {formatPoints(summary?.pendingPoints || 0)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Clears after provider postback
          </div>
        </Card>

        {/* Lifetime Earned */}
        <Card className="p-6 rounded-2xl bg-card border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span className="font-bold uppercase tracking-wider">Lifetime Earned</span>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-foreground">
            {formatPoints(summary?.totalEarned || 0)}
          </div>
          <div className="text-xs text-emerald-500 font-semibold mt-1">
            ≈ {formatPointsAsCash(summary?.totalEarned || 0)} Total
          </div>
        </Card>

        {/* Total Withdrawn */}
        <Card className="p-6 rounded-2xl bg-card border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span className="font-bold uppercase tracking-wider">Total Withdrawn</span>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-foreground">
            {formatPointsAsCash(summary?.totalWithdrawn || 0)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {formatPoints(summary?.totalWithdrawn || 0)} Cashed Out
          </div>
        </Card>
      </div>

      {/* ─── Ledger Transactions ─────────────────────────────────── */}
      <Card className="border-border shadow-md">
        <CardHeader className="p-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold">Ledger Transactions</CardTitle>
              <CardDescription className="text-xs">
                Real-time record of every credit and debit to your rewards balance
              </CardDescription>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {FILTER_TABS.map((tab) => {
                const isActive = activeFilter === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveFilter(tab.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground font-bold shadow-sm"
                        : "bg-accent/10 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0 space-y-2">
          {isLoading ? (
            <div className="space-y-3 py-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-card animate-pulse border border-border/40" />
              ))}
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="divide-y divide-border/40">
              {filteredTransactions.map((tx: any) => (
                <div key={tx.id} className="py-2.5">
                  <TransactionItem transaction={tx} />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center space-y-4">
              <EmptyWallet className="mx-auto h-28 w-28 opacity-75" />
              <h4 className="font-bold text-base">No Transactions in this Category</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Complete tasks or request withdrawals to view entries in your ledger history.
              </p>
              <Button asChild size="sm" variant="outline">
                <Link href="/offers">Browse Offers</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
