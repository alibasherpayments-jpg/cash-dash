"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch } from "@/lib/api-client";
import type { ApiResponse } from "@cashdash/shared";

export function useNotifications(page = 1, limit = 20) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications", page],
    queryFn: async () => {
      try {
        const res = await apiGet<any>("/notifications", { page, limit });
        return Array.isArray(res.data) ? res.data : [];
      } catch {
        return [];
      }
    },
    refetchInterval: 8000, // Background poll every 8 seconds for live offer completions
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => apiPatch<ApiResponse<void>>("/notifications/read-all"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => apiPatch<ApiResponse<void>>(`/notifications/${id}/read`),
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
    markAsRead: markReadMutation.mutate,
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
