"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import type { ApiResponse, OfferPublic, PaginatedResponse, OfferCategory } from "@cashdash/shared";
import { OfferDifficulty, OfferStatus } from "@cashdash/shared";

const MOCK_OFFERS: OfferPublic[] = [
  {
    id: "off-1",
    providerId: "prov-a",
    providerName: "AdVenture Offerwall",
    title: "Raid: Shadow Legends - Reach Lv 40",
    description: "Install Raid: Shadow Legends, defeat normal campaign and reach player level 40 within 21 days.",
    category: "GAMES" as OfferCategory,
    rewardPoints: 45000,
    cashValue: 4.5,
    iconUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=128&auto=format&fit=crop&q=80",
    estimatedMinutes: 120,
    difficulty: OfferDifficulty.HARD,
    countries: ["US", "CA", "UK", "DE", "FR", "AU"],
    requirements: ["New users only", "Reach player Level 40 in 21 days", "No emulator or VPN allowed"],
    status: OfferStatus.ACTIVE,
    isFeatured: true,
    isRecommended: true,
    startDate: new Date().toISOString(),
  },
  {
    id: "off-2",
    providerId: "prov-b",
    providerName: "RewardHub Media",
    title: "Revolut - Sign Up & First Card Payment",
    description: "Open a standard free Revolut account, verify identity and execute a single card purchase of at least $5.",
    category: "FINANCE" as OfferCategory,
    rewardPoints: 65000,
    cashValue: 6.5,
    iconUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=128&auto=format&fit=crop&q=80",
    estimatedMinutes: 25,
    difficulty: OfferDifficulty.MEDIUM,
    countries: ["US", "UK", "DE", "FR", "ES", "IT"],
    requirements: ["KYC verification required", "Must complete 1 card payment", "First-time customers only"],
    status: OfferStatus.ACTIVE,
    isFeatured: true,
    isRecommended: true,
    startDate: new Date().toISOString(),
  },
  {
    id: "off-3",
    providerId: "prov-game",
    providerName: "PlayForge Gaming",
    title: "Monopoly GO! - Board 15",
    description: "Download Monopoly GO!, build properties and clear Board 15 within 14 days of install.",
    category: "GAMES" as OfferCategory,
    rewardPoints: 28000,
    cashValue: 2.8,
    iconUrl: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=128&auto=format&fit=crop&q=80",
    estimatedMinutes: 60,
    difficulty: OfferDifficulty.MEDIUM,
    countries: ["US", "CA", "UK"],
    requirements: ["Install through our link", "Reach and complete Board 15", "Must complete within 14 days"],
    status: OfferStatus.ACTIVE,
    isFeatured: true,
    isRecommended: true,
    startDate: new Date().toISOString(),
  },
  {
    id: "off-4",
    providerId: "prov-survey",
    providerName: "InsightSurveys Global",
    title: "Consumer Tech & Gadgets Survey 2026",
    description: "Share your genuine feedback on smart home devices and consumer electronics in this 15-min survey.",
    category: "SURVEYS" as OfferCategory,
    rewardPoints: 2400,
    cashValue: 0.24,
    iconUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=128&auto=format&fit=crop&q=80",
    estimatedMinutes: 15,
    difficulty: OfferDifficulty.EASY,
    countries: ["US", "CA", "UK", "DE", "AU"],
    requirements: ["Answer all questions attentively", "Quality check questions must be passed"],
    status: OfferStatus.ACTIVE,
    isFeatured: true,
    isRecommended: true,
    startDate: new Date().toISOString(),
  },
  {
    id: "off-5",
    providerId: "prov-c",
    providerName: "TaskForce Digital",
    title: "NordVPN - Secure 2-Year Plan",
    description: "Protect your internet privacy with the leading global VPN service and get rewarded.",
    category: "APPS" as OfferCategory,
    rewardPoints: 75000,
    cashValue: 7.5,
    iconUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=128&auto=format&fit=crop&q=80",
    estimatedMinutes: 10,
    difficulty: OfferDifficulty.EASY,
    countries: ["US", "CA", "UK", "DE", "AU", "FR"],
    requirements: ["Subscribe to any 1 or 2-year plan", "Valid payment method required"],
    status: OfferStatus.ACTIVE,
    isFeatured: true,
    isRecommended: true,
    startDate: new Date().toISOString(),
  },
  {
    id: "off-6",
    providerId: "prov-b",
    providerName: "RewardHub Media",
    title: "Temu - First Order with Discount",
    description: "Shop quality trending products and make your first verified purchase of $10 or more.",
    category: "SHOPPING" as OfferCategory,
    rewardPoints: 32000,
    cashValue: 3.2,
    iconUrl: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=128&auto=format&fit=crop&q=80",
    estimatedMinutes: 20,
    difficulty: OfferDifficulty.MEDIUM,
    countries: ["US", "CA", "UK", "AU", "DE"],
    requirements: ["Complete initial purchase above $10", "Delivered order verified"],
    status: OfferStatus.ACTIVE,
    isFeatured: true,
    isRecommended: false,
    startDate: new Date().toISOString(),
  },
  {
    id: "off-7",
    providerId: "prov-survey",
    providerName: "InsightSurveys Global",
    title: "Streaming & Entertainment Habits Study",
    description: "Tell top media companies what shows, music, and streaming services you watch and pay for.",
    category: "SURVEYS" as OfferCategory,
    rewardPoints: 1800,
    cashValue: 0.18,
    iconUrl: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=128&auto=format&fit=crop&q=80",
    estimatedMinutes: 10,
    difficulty: OfferDifficulty.EASY,
    countries: ["US", "UK"],
    requirements: ["Ages 18+", "Must actively use at least one streaming service"],
    status: OfferStatus.ACTIVE,
    isFeatured: false,
    isRecommended: true,
    startDate: new Date().toISOString(),
  },
  {
    id: "off-8",
    providerId: "prov-c",
    providerName: "TaskForce Digital",
    title: "Audible - 30-Day Free Audiobook Trial",
    description: "Enjoy 2 free bestselling audiobooks and keep them forever with an Amazon Audible trial.",
    category: "TRIALS" as OfferCategory,
    rewardPoints: 15000,
    cashValue: 1.5,
    iconUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=128&auto=format&fit=crop&q=80",
    estimatedMinutes: 10,
    difficulty: OfferDifficulty.EASY,
    countries: ["US", "UK", "CA", "AU"],
    requirements: ["Start 30-day trial", "Cancel anytime during trial"],
    status: OfferStatus.ACTIVE,
    isFeatured: false,
    isRecommended: true,
    startDate: new Date().toISOString(),
  },
];

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
        return res.data || res || [];
      } catch {
        let result = [...MOCK_OFFERS];
        if (filters.category && (filters.category as string) !== "ALL") {
          result = result.filter((o) => o.category === filters.category);
        }
        if (filters.search) {
          const s = filters.search.toLowerCase();
          result = result.filter(
            (o) => o.title.toLowerCase().includes(s) || o.description.toLowerCase().includes(s)
          );
        }
        if (filters.sort === "highest_reward") {
          result.sort((a, b) => b.rewardPoints - a.rewardPoints);
        } else if (filters.sort === "lowest_reward") {
          result.sort((a, b) => a.rewardPoints - b.rewardPoints);
        } else if (filters.sort === "fastest") {
          result.sort((a, b) => a.estimatedMinutes - b.estimatedMinutes);
        }
        return result;
      }
    },
    staleTime: 60 * 1000,
  });

  const offers: OfferPublic[] = Array.isArray(query.data)
    ? query.data
    : (query.data as any)?.data || MOCK_OFFERS;

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
        return res.data;
      } catch {
        return MOCK_OFFERS.find((o) => o.id === id) || MOCK_OFFERS[0];
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
