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
    staleTime: 5 * 1000,
    refetchInterval: 5 * 1000,
  });

  const transactionsQuery = useQuery({
    queryKey: ["wallet", "transactions"],
    queryFn: async () => {
      try {
        const res = await apiGet<any>("/wallet/transactions");
        const list = Array.isArray(res) ? res : res?.data || [];
        return list.map((tx: any) => ({
          ...tx,
          points: tx.points ?? tx.amount ?? 0,
          amount: tx.amount ?? tx.points ?? 0,
        }));
      } catch {
        return [];
      }
    },
    staleTime: 5 * 1000,
    refetchInterval: 5 * 1000,
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
