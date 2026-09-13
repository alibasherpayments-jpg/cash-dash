"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/providers/i18n-provider";
import { AvatarWithFallback } from "@/components/common/avatar-with-fallback";
import { Trophy, Crown, Wallet, RefreshCw } from "lucide-react";
import { formatPointsAsCash, formatPoints } from "@/lib/formatters";
import { useLeaderboard, type LeaderboardEntry } from "@/hooks/use-leaderboard";
import { usePlatformSettings } from "@/hooks/use-platform-settings";

// ─── Skeleton loaders ───────────────────────────────────────────────────────

function PodiumSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 items-end">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-6 rounded-2xl bg-card border border-border space-y-3 text-center">
          <Skeleton className="h-8 w-8 rounded-full mx-auto" />
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-24 mx-auto" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <Card className="border-border">
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-2 w-16" />
                </div>
              </div>
              <div className="space-y-1 text-end">
                <Skeleton className="h-3 w-16 ml-auto" />
                <Skeleton className="h-2 w-20 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Empty state ────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
      <Trophy className="h-12 w-12 text-muted-foreground/30" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}

// ─── Podium card ─────────────────────────────────────────────────────────────

interface PodiumCardProps {
  user: LeaderboardEntry;
  position: 1 | 2 | 3;
  activeTab: "WITHDRAWALS" | "EARNERS";
  t: any;
}

function PodiumCard({ user, position, activeTab, t }: PodiumCardProps) {
  const value =
    activeTab === "WITHDRAWALS" ? user.totalWithdrawn : user.totalEarned;
  const isWithdrawals = activeTab === "WITHDRAWALS";
  const maskedAddress = user.walletDestination || user.lastPayoutMasked || user.username;
  const methodName = user.lastMethodName || "Verified Payout";

  if (position === 1) {
    return (
      <div className="order-1 md:order-2 p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-amber-500/15 via-card to-card border border-amber-500/40 shadow-xl shadow-amber-500/10 text-center space-y-4 relative md:-translate-y-4">
        <div className="mx-auto h-10 w-10 rounded-full bg-amber-500 text-slate-950 font-black text-base flex items-center justify-center shadow-lg shadow-amber-500/30">
          <Crown className="h-5 w-5" />
        </div>

        {isWithdrawals ? (
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-transparent border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/15 ring-4 ring-emerald-500/20">
            <Wallet className="h-8 w-8 text-emerald-400" />
          </div>
        ) : (
          <AvatarWithFallback username={user.username} size="lg" className="mx-auto ring-4 ring-amber-500/30" />
        )}

        <div>
          <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 text-[10px] font-bold mb-1">
            {isWithdrawals ? "#1 TOP PAYOUT WALLET" : "#1 CHAMPION"}
          </Badge>

          {isWithdrawals ? (
            <div className="space-y-1">
              <h3 className="font-mono font-black text-xl text-emerald-400 tracking-wider dir-ltr select-all">
                {maskedAddress}
              </h3>
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-300 border-emerald-500/25 text-xs font-semibold px-2 py-0.5">
                  {methodName}
                </Badge>
                {user.withdrawalsCount && user.withdrawalsCount > 1 && (
                  <span className="text-[11px] text-muted-foreground font-mono">
                    ({user.withdrawalsCount} {user.accountsCount && user.accountsCount > 1 ? `from ${user.accountsCount} accounts` : "payouts"})
                  </span>
                )}
              </div>
            </div>
          ) : (
            <>
              <h3 className="font-black text-lg text-foreground">{user.username}</h3>
              {user.country && (
                <span className="text-xs text-muted-foreground uppercase">{user.country}</span>
              )}
            </>
          )}
        </div>

        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <span className="text-[10px] uppercase font-bold text-amber-500 block">
            {isWithdrawals ? t.leaderboard.totalWithdrawn : t.leaderboard.totalEarned}
          </span>
          <span className="text-2xl font-black text-emerald-500">
            {isWithdrawals ? formatPointsAsCash(value) : formatPoints(value)}
          </span>
          {isWithdrawals && (
            <span className="text-[11px] text-muted-foreground font-mono block mt-0.5">
              {formatPoints(value)}
            </span>
          )}
        </div>

        {!isWithdrawals && user.lastPayoutMasked && (
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono text-xs font-semibold shadow-sm mx-auto max-w-full truncate">
            <Wallet className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
            {user.lastMethodName && (
              <span className="text-muted-foreground font-sans text-[11px] truncate max-w-[120px]">
                {user.lastMethodName}:
              </span>
            )}
            <span className="font-mono tracking-wider">{user.lastPayoutMasked}</span>
          </div>
        )}
      </div>
    );
  }

  const colors = position === 2
    ? { border: "border-slate-700/60", badge: "bg-slate-400/20 text-slate-300" }
    : { border: "border-amber-800/40", badge: "bg-amber-800/20 text-amber-600" };

  return (
    <div className={`order-${position === 2 ? "2 md:order-1" : "3"} p-6 rounded-2xl bg-card border ${colors.border} shadow-lg text-center space-y-3 relative`}>
      <div className={`mx-auto h-8 w-8 rounded-full ${colors.badge} font-black text-sm flex items-center justify-center`}>
        {position}
      </div>

      {isWithdrawals ? (
        <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/15 via-accent/5 to-transparent border border-emerald-500/30 flex items-center justify-center shadow-md">
          <Wallet className="h-6 w-6 text-emerald-400" />
        </div>
      ) : (
        <AvatarWithFallback username={user.username} size="lg" className="mx-auto" />
      )}

      <div>
        {isWithdrawals ? (
          <div className="space-y-1">
            <h4 className="font-mono font-bold text-base text-emerald-400 tracking-wide dir-ltr select-all">
              {maskedAddress}
            </h4>
            <div className="flex items-center justify-center gap-1 flex-wrap">
              <Badge variant="outline" className="bg-card text-muted-foreground border-border text-[11px] font-medium px-2 py-0.5">
                {methodName}
              </Badge>
              {user.withdrawalsCount && user.withdrawalsCount > 1 && (
                <span className="text-[10px] text-muted-foreground font-mono">
                  ({user.withdrawalsCount}x)
                </span>
              )}
            </div>
          </div>
        ) : (
          <>
            <h4 className="font-bold text-base text-foreground">{user.username}</h4>
            {user.country && (
              <span className="text-xs text-muted-foreground uppercase">{user.country}</span>
            )}
          </>
        )}
      </div>

      <div className="p-2.5 rounded-xl bg-accent/5 border border-border">
        <span className="text-[10px] uppercase font-bold text-muted-foreground block">
          {isWithdrawals ? t.leaderboard.totalWithdrawn : t.leaderboard.totalEarned}
        </span>
        <span className="text-lg font-black text-foreground">
          {isWithdrawals ? formatPointsAsCash(value) : formatPoints(value)}
        </span>
        {isWithdrawals && (
          <span className="text-[10px] text-muted-foreground font-mono block">
            {formatPoints(value)}
          </span>
        )}
      </div>

      {!isWithdrawals && user.lastPayoutMasked && (
        <div className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-semibold shadow-sm mx-auto max-w-full truncate">
          <Wallet className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
          {user.lastMethodName && (
            <span className="text-muted-foreground font-sans text-[11px] truncate max-w-[100px]">
              {user.lastMethodName}:
            </span>
          )}
          <span className="font-mono tracking-wider">{user.lastPayoutMasked}</span>
        </div>
      )}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"WITHDRAWALS" | "EARNERS">("WITHDRAWALS");
  const { withdrawers, earners, isLoading, refetch } = useLeaderboard();
  const { settings } = usePlatformSettings();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    if (!isLoading && withdrawers.length === 0 && earners.length > 0 && activeTab === "WITHDRAWALS") {
      setActiveTab("EARNERS");
    }
  }, [isLoading, withdrawers.length, earners.length, activeTab]);

  const isLeaderboardDisabled = settings?.leaderboardEnabled === false;

  if (isLeaderboardDisabled) {
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
              <Trophy className="h-7 w-7 text-amber-500" /> {t.leaderboard.title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {t.leaderboard.subtitle}
            </p>
          </div>
        </div>

        <Card className="border-border">
          <CardContent className="py-20 flex flex-col items-center justify-center text-center gap-3">
            <Trophy className="h-12 w-12 text-muted-foreground/30" />
            <h3 className="font-bold text-base text-foreground">Leaderboard Currently Disabled</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              The public platform leaderboard is temporarily paused by administrator. Please check back later!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const users = activeTab === "WITHDRAWALS" ? withdrawers : earners;
  const top3 = users.slice(0, 3);
  const remaining = users.slice(3);

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <Trophy className="h-7 w-7 text-amber-500" /> {t.leaderboard.title}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {t.leaderboard.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 p-1 bg-card border border-border rounded-xl">
            <Button
              size="sm"
              variant={activeTab === "WITHDRAWALS" ? "default" : "ghost"}
              onClick={() => setActiveTab("WITHDRAWALS")}
              className="text-xs font-semibold h-8"
            >
              {t.leaderboard.tabs.withdrawn}
            </Button>
            <Button
              size="sm"
              variant={activeTab === "EARNERS" ? "default" : "ghost"}
              onClick={() => setActiveTab("EARNERS")}
              className="text-xs font-semibold h-8"
            >
              {t.leaderboard.tabs.earners}
            </Button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className="h-8 px-2.5 text-muted-foreground hover:text-foreground"
            title="Refresh Leaderboard"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing || isLoading ? "animate-spin text-emerald-500" : ""}`} />
          </Button>
        </div>
      </div>

      {/* ─── Top 3 Podium (Resilient to 1, 2, or 3+ users) ───────── */}
      {isLoading ? (
        <PodiumSkeleton />
      ) : top3.length === 0 ? (
        <EmptyState message={t.leaderboard.noData ?? "No data yet — be the first on the leaderboard!"} />
      ) : top3.length === 1 ? (
        <div className="max-w-md mx-auto pt-4">
          <PodiumCard user={top3[0]} position={1} activeTab={activeTab} t={t} />
        </div>
      ) : top3.length === 2 ? (
        <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 items-end">
          <PodiumCard user={top3[0]} position={1} activeTab={activeTab} t={t} />
          <PodiumCard user={top3[1]} position={2} activeTab={activeTab} t={t} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 items-end">
          <PodiumCard user={top3[1]} position={2} activeTab={activeTab} t={t} />
          <PodiumCard user={top3[0]} position={1} activeTab={activeTab} t={t} />
          <PodiumCard user={top3[2]} position={3} activeTab={activeTab} t={t} />
        </div>
      )}

      {/* ─── Ranks 4 - 10 Table ────────────────────────────────── */}
      {isLoading ? (
        <TableSkeleton />
      ) : remaining.length > 0 ? (
        <Card className="border-border">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-base font-bold">{t.leaderboard.title}</CardTitle>
            <CardDescription className="text-xs">
              {t.leaderboard.subtitle}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {remaining.map((user) => {
                const isWithdrawals = activeTab === "WITHDRAWALS";
                const maskedAddress = user.walletDestination || user.lastPayoutMasked || user.username;
                const methodName = user.lastMethodName || "Verified Method";

                return (
                  <div key={user.userId} className="p-4 flex items-center justify-between hover:bg-accent/5 transition-colors">
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="font-mono text-sm font-bold text-muted-foreground w-6 text-center shrink-0">
                        #{user.rank}
                      </span>

                      {isWithdrawals ? (
                        <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0 shadow-sm">
                          <Wallet className="h-4 w-4 text-emerald-400" />
                        </div>
                      ) : (
                        <AvatarWithFallback username={user.username} size="sm" />
                      )}

                      <div className="min-w-0">
                        {isWithdrawals ? (
                          <>
                            <p className="font-mono font-bold text-sm text-emerald-400 tracking-wider truncate dir-ltr select-all">
                              {maskedAddress}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap mt-0.5">
                              <span className="text-[11px] text-muted-foreground bg-accent/10 px-2 py-0.5 rounded border border-border">
                                {methodName}
                              </span>
                              {user.withdrawalsCount && user.withdrawalsCount > 1 && (
                                <span className="text-[10px] text-muted-foreground font-mono">
                                  {user.withdrawalsCount} {user.accountsCount && user.accountsCount > 1 ? `(${user.accountsCount} accounts)` : "payouts"}
                                </span>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="font-bold text-sm text-foreground truncate">{user.username}</p>
                            <div className="flex items-center gap-2 flex-wrap mt-0.5">
                              {user.country && (
                                <span className="text-[10px] text-muted-foreground uppercase">{user.country}</span>
                              )}
                              {user.lastPayoutMasked && (
                                <span className="text-xs text-emerald-400 font-mono font-medium flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                  <Wallet className="h-3 w-3 shrink-0" />
                                  {user.lastMethodName ? `${user.lastMethodName}: ` : ""}
                                  <span className="font-mono tracking-wider">{user.lastPayoutMasked}</span>
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-end shrink-0">
                      <span className="font-bold text-sm text-foreground block">
                        {isWithdrawals
                          ? formatPointsAsCash(user.totalWithdrawn)
                          : formatPoints(user.totalEarned)}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {formatPoints(isWithdrawals ? user.totalWithdrawn : user.totalEarned)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}