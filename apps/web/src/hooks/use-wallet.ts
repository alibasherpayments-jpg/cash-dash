"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import type { ApiResponse, WalletSummary } from "@cashdash/shared";

export function useWallet() {
  const summaryQuery = useQuery({
    queryKey: ["wallet", "summary"],
    queryFn: async () => {
      try {
        const res = await apiGet<ApiResponse<WalletSummary>>("/wallet");
        return res.data;
      } catch {
        // Fallback for demo when backend not yet connected
        return {
          availablePoints: 12450,
          pendingPoints: 1245,
          totalEarned: 24950,
          totalWithdrawn: 15000,
          cashValue: 1.245,
        };
      }
    },
    staleTime: 15 * 1000,
  });

  const transactionsQuery = useQuery({
    queryKey: ["wallet", "transactions"],
    queryFn: async () => {
      try {
        const res = await apiGet<any>("/wallet/transactions");
        return res.data || [];
      } catch {
        return [
          {
            id: "tx-1",
            type: "OFFER_REWARD",
            direction: "CREDIT",
            amount: 45000,
            status: "COMPLETED",
            source: "offer",
            description: "Completed 'Raid: Shadow Legends - Reach Lv 40'",
            createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
          },
          {
            id: "tx-2",
            type: "SURVEY_REWARD",
            direction: "CREDIT",
            amount: 2400,
            status: "COMPLETED",
            source: "survey",
            description: "Completed 'Consumer Tech & Gadgets Survey 2026'",
            createdAt: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
          },
          {
            id: "tx-3",
            type: "WITHDRAWAL",
            direction: "DEBIT",
            amount: 15000,
            status: "COMPLETED",
            source: "withdrawal",
            description: "Withdrawal via PayPal to user@cashdash.io",
            createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
          },
          {
            id: "tx-4",
            type: "REFERRAL_REWARD",
            direction: "CREDIT",
            amount: 1200,
            status: "COMPLETED",
            source: "referral",
            description: "10% Referral commission from friend activity",
            createdAt: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
          },
        ];
      }
    },
  });

  return {
    summary: summaryQuery.data,
    transactions: transactionsQuery.data || [],
    isLoading: summaryQuery.isLoading,
    refetch: () => {
      summaryQuery.refetch();
      transactionsQuery.refetch();
    },
  };
}
