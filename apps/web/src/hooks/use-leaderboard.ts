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
        const res = await apiGet<LeaderboardResponse>("/leaderboard/live/withdrawers");
        return res.data ?? [];
      } catch {
        return [];
      }
    },
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  const earnersQuery = useQuery({
    queryKey: ["leaderboard", "earners"],
    queryFn: async () => {
      try {
        const res = await apiGet<LeaderboardResponse>("/leaderboard/live/earners");
        return res.data ?? [];
      } catch {
        return [];
      }
    },
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  return {
    withdrawers: withdrawersQuery.data ?? [],
    earners: earnersQuery.data ?? [],
    isLoading: withdrawersQuery.isLoading || earnersQuery.isLoading,
    isError: withdrawersQuery.isError || earnersQuery.isError,
  };
}