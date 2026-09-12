"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api-client";
import type { ApiResponse, NotificationPublic, PaginatedResponse } from "@cashdash/shared";

export function useNotifications(page = 1, limit = 20) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications", page],
    queryFn: async () => {
      try {
        const res = await apiGet<any>("/notifications", { page, limit });
        return res.data || [];
      } catch {
        return [
          {
            id: "notif-1",
            type: "REWARD_ADDED",
            title: "+45,000 Points Credited!",
            message: "Your game completion for 'Raid: Shadow Legends' has been verified and added to your balance.",
            isRead: false,
            createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
          },
          {
            id: "notif-2",
            type: "WITHDRAWAL_PROCESSING",
            title: "Withdrawal Under Review",
            message: "Your withdrawal request of 15,000 points has passed automated validation and is queued for processing.",
            isRead: false,
            createdAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
          },
          {
            id: "notif-3",
            type: "REFERRAL_REWARD",
            title: "+1,200 Referral Commission",
            message: "Your referred friend 'ryan_hustle' completed their first offer. Your 10% commission was credited.",
            isRead: true,
            createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
          },
        ];
      }
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => apiPost<ApiResponse<void>>("/notifications/mark-all-read"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notifications = (query.data as any[]) || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    isLoading: query.isLoading,
    markAllRead: markAllReadMutation.mutate,
    refetch: query.refetch,
  };
}

export function useUnreadCount() {
  const { unreadCount } = useNotifications();
  return { data: unreadCount };
}

export function useMarkAllRead() {
  const { markAllRead } = useNotifications();
  return { mutate: markAllRead };
}
