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
        return {
          availablePoints: 0,
          pendingPoints: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
          cashValue: 0,
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
        return [];
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
