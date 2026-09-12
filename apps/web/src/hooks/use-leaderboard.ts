"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string | null;
  country: string | null;
  totalWithdrawn: number;
  totalEarned: number;
  lastMethodName: string | null;
  lastPayoutMasked: string | null;
}

interface LeaderboardResponse {
  success: boolean;
  data: LeaderboardEntry[];
}

export function useLeaderboard() {
  const withdrawersQuery = useQuery({
    queryKey: ["leaderboard", "withdrawers"],
    queryFn: async () => {
      try {
        const res = await apiGet<any>("/leaderboard/live/withdrawers");
        const list = res?.data || (Array.isArray(res) ? res : []);
        return Array.isArray(list) ? list : [];
      } catch (err) {
        console.error("Leaderboard withdrawers fetch error:", err);
        return [];
      }
    },
    staleTime: 5 * 1000,
    refetchInterval: 10 * 1000,
  });

  const earnersQuery = useQuery({
    queryKey: ["leaderboard", "earners"],
    queryFn: async () => {
      try {
        const res = await apiGet<any>("/leaderboard/live/earners");
        const list = res?.data || (Array.isArray(res) ? res : []);
        return Array.isArray(list) ? list : [];
      } catch (err) {
        console.error("Leaderboard earners fetch error:", err);
        return [];
      }
    },
    staleTime: 5 * 1000,
    refetchInterval: 10 * 1000,
  });

  return {
    withdrawers: withdrawersQuery.data ?? [],
    earners: earnersQuery.data ?? [],
    isLoading: withdrawersQuery.isLoading || earnersQuery.isLoading,
    isError: withdrawersQuery.isError || earnersQuery.isError,
    refetch: () => {
      withdrawersQuery.refetch();
      earnersQuery.refetch();
    },
  };
}