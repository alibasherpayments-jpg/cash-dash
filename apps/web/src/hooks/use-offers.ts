"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import type { ApiResponse, OfferPublic, PaginatedResponse, OfferCategory } from "@cashdash/shared";
import { OfferDifficulty, OfferStatus } from "@cashdash/shared";

interface OffersFilter {
  page?: number;
  limit?: number;
  category?: OfferCategory;
  search?: string;
  minReward?: number;
  maxReward?: number;
  sort?: string;
}

export function useOffers(filters: OffersFilter = {}) {
  const query = useQuery({
    queryKey: ["offers", filters],
    queryFn: async () => {
      try {
        const res = await apiGet<any>("/offers", filters as Record<string, unknown>);
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res)) return res;
        return [];
      } catch {
        return [];
      }
    },
    staleTime: 60 * 1000,
  });

  const offers: OfferPublic[] = Array.isArray(query.data)
    ? query.data
    : (query.data as any)?.data || [];

  return {
    offers,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useOffer(id: string) {
  return useQuery({
    queryKey: ["offers", id],
    queryFn: async () => {
      try {
        const res = await apiGet<ApiResponse<OfferPublic>>(`/offers/${id}`);
        return res.data || null;
      } catch {
        return null;
      }
    },
    enabled: !!id,
  });
}

export function useFeaturedOffers() {
  const { offers, isLoading } = useOffers();
  return {
    data: offers.filter((o) => o.isFeatured),
    isLoading,
  };
}
