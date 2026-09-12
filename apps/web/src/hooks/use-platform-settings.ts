"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";

export interface PlatformSettings {
  siteName: string;
  supportEmail: string;
  conversionRate: number;
  minWithdrawalPoints: number;
  leaderboardEnabled: boolean;
  maintenanceMode: boolean;
}

interface PublicSettingsResponse {
  success: boolean;
  data: PlatformSettings;
}

export function usePlatformSettings() {
  const query = useQuery<PlatformSettings>({
    queryKey: ["platform-settings"],
    queryFn: async () => {
      try {
        const res = await apiGet<PublicSettingsResponse>("/settings/public");
        return res.data;
      } catch {
        return {
          siteName: "Cash Dash",
          supportEmail: "support@cashdash.com",
          conversionRate: 1000,
          minWithdrawalPoints: 100,
          leaderboardEnabled: true,
          maintenanceMode: false,
        };
      }
    },
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });

  return {
    settings: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}