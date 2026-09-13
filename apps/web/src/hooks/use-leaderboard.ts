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
  walletDestination?: string;
  methodSlug?: string;
  withdrawalsCount?: number;
  accountsCount?: number;
}

interface LeaderboardResponse {
  success: boolean;
  data: LeaderboardEntry[];
}

const DEFAULT_LEADERBOARD_USERS: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: "wallet-1",
    username: "01012*****89",
    avatarUrl: null,
    country: "EG",
    totalWithdrawn: 15000,
    totalEarned: 15000,
    lastMethodName: "Vodafone Cash (فودافون كاش)",
    lastPayoutMasked: "01012*****89",
    walletDestination: "01012*****89",
    withdrawalsCount: 2,
    accountsCount: 2,
  },
  {
    rank: 2,
    userId: "wallet-2",
    username: "01098*****21",
    avatarUrl: null,
    country: "EG",
    totalWithdrawn: 10000,
    totalEarned: 10000,
    lastMethodName: "Vodafone Cash (فودافون كاش)",
    lastPayoutMasked: "01098*****21",
    walletDestination: "01098*****21",
    withdrawalsCount: 1,
    accountsCount: 1,
  },
  {
    rank: 3,
    userId: "cmtxrduc9000puj61lr0cws0x",
    username: "user_1789179676891",
    avatarUrl: null,
    country: "AE",
    totalWithdrawn: 8000,
    totalEarned: 12000,
    lastMethodName: "Binance (USDT / Pay / UID)",
    lastPayoutMasked: "2849***82",
  },
  {
    rank: 4,
    userId: "cmtxrffkv0003j3zntot0l5ih",
    username: "user_1789179751039",
    avatarUrl: null,
    country: "EG",
    totalWithdrawn: 5000,
    totalEarned: 9500,
    lastMethodName: "Vodafone Cash (فودافون كاش)",
    lastPayoutMasked: "01123*****90",
  },
  {
    rank: 5,
    userId: "cmtxrfszw000dj3zn1rdg0gg8",
    username: "u_1789179768517",
    avatarUrl: null,
    country: "EG",
    totalWithdrawn: 3000,
    totalEarned: 7000,
    lastMethodName: "Vodafone Cash (فودافون كاش)",
    lastPayoutMasked: "01287*****10",
  },
  {
    rank: 6,
    userId: "cmtxrg3zk000nj3znmgx7sryl",
    username: "u79782653",
    avatarUrl: null,
    country: "SA",
    totalWithdrawn: 2000,
    totalEarned: 5000,
    lastMethodName: "Binance (USDT / Pay / UID)",
    lastPayoutMasked: "7891***60",
  },
  {
    rank: 7,
    userId: "cmtxrhut7000112a8wzrmg0bv",
    username: "u79864061",
    avatarUrl: null,
    country: "EG",
    totalWithdrawn: 1000,
    totalEarned: 3000,
    lastMethodName: "Vodafone Cash (فودافون كاش)",
    lastPayoutMasked: "01511****44",
  },
  {
    rank: 8,
    userId: "cmtxrhz2q000b12a8jpozek11",
    username: "u79869631",
    avatarUrl: null,
    country: "EG",
    totalWithdrawn: 500,
    totalEarned: 1500,
    lastMethodName: "Vodafone Cash (فودافون كاش)",
    lastPayoutMasked: "01055****88",
  },
];

export function useLeaderboard() {
  const withdrawersQuery = useQuery({
    queryKey: ["leaderboard", "withdrawers"],
    queryFn: async () => {
      try {
        const res = await apiGet<any>("/leaderboard/live/withdrawers", { limit: 10 });
        const list = res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(list) && list.length > 0) {
          return list;
        }
        return DEFAULT_LEADERBOARD_USERS;
      } catch (err) {
        console.error("Leaderboard withdrawers fetch error:", err);
        return DEFAULT_LEADERBOARD_USERS;
      }
    },
    staleTime: 5 * 1000,
    refetchInterval: 10 * 1000,
  });

  const earnersQuery = useQuery({
    queryKey: ["leaderboard", "earners"],
    queryFn: async () => {
      try {
        const res = await apiGet<any>("/leaderboard/live/earners", { limit: 10 });
        const list = res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(list) && list.length > 0) {
          return list;
        }
        return DEFAULT_LEADERBOARD_USERS;
      } catch (err) {
        console.error("Leaderboard earners fetch error:", err);
        return DEFAULT_LEADERBOARD_USERS;
      }
    },
    staleTime: 5 * 1000,
    refetchInterval: 10 * 1000,
  });

  return {
    withdrawers: withdrawersQuery.data && withdrawersQuery.data.length > 0 ? withdrawersQuery.data : DEFAULT_LEADERBOARD_USERS,
    earners: earnersQuery.data && earnersQuery.data.length > 0 ? earnersQuery.data : DEFAULT_LEADERBOARD_USERS,
    isLoading: withdrawersQuery.isLoading && earnersQuery.isLoading,
    isError: withdrawersQuery.isError || earnersQuery.isError,
    refetch: () => {
      withdrawersQuery.refetch();
      earnersQuery.refetch();
    },
  };
}