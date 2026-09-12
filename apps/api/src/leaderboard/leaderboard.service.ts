import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { LeaderboardMetric, WithdrawalStatus } from '@prisma/client';

export interface LeaderboardUserResult {
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

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService,
  ) {}

  /**
   * Snapshot-based leaderboard for legacy/compatibility
   */
  async getLeaderboard(metric: LeaderboardMetric, period = 'all-time', limit = 10) {
    const enabled = await this.settingsService.isLeaderboardEnabled();
    if (!enabled) return [];

    const snapshots = await this.prisma.leaderboardSnapshot.findMany({
      where: {
        metric,
        period,
        NOT: {
          user: { profile: { isLeaderboardVisible: false } },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile: {
              select: { avatarUrl: true, country: true, isLeaderboardVisible: true },
            },
          },
        },
      },
      orderBy: { rank: 'asc' },
      take: limit,
    });

    return snapshots
      .filter((s) => s.user?.profile?.isLeaderboardVisible !== false)
      .map((s) => ({
        rank: s.rank,
        userId: s.userId,
        username: s.user.username,
        avatarUrl: s.user.profile?.avatarUrl ?? null,
        country: s.user.profile?.country ?? null,
        value: s.value,
        metric: s.metric,
        snapshotAt: s.snapshotAt,
      }));
  }

  /**
   * Live top users by total amount withdrawn from wallet / paid out
   * Fully connected to database with masked wallet destination
   */
  async getLiveTopWithdrawers(limit = 10): Promise<LeaderboardUserResult[]> {
    const enabled = await this.settingsService.isLeaderboardEnabled();
    if (!enabled) return [];

    // Find wallets for visible platform users
    const wallets = await this.prisma.wallet.findMany({
      where: {
        NOT: {
          user: { profile: { isLeaderboardVisible: false } },
        },
      },
      select: {
        userId: true,
        totalWithdrawn: true,
        totalEarned: true,
        availablePoints: true,
        user: {
          select: {
            id: true,
            username: true,
            createdAt: true,
            profile: {
              select: { avatarUrl: true, country: true, isLeaderboardVisible: true },
            },
            withdrawalRequests: {
              select: {
                points: true,
                destination: true,
                status: true,
                createdAt: true,
                method: { select: { name: true, slug: true } },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
      take: 50,
    });

    // Map each wallet with effective total withdrawn and extract payout destination
    const items = wallets
      .filter((w) => w.user && w.user.profile?.isLeaderboardVisible !== false)
      .map((w) => {
        const validWithdrawals = (w.user.withdrawalRequests || []).filter(
          (r) =>
            r.status !== WithdrawalStatus.REJECTED &&
            r.status !== WithdrawalStatus.CANCELLED &&
            r.status !== WithdrawalStatus.FAILED,
        );

        const requestsSum = validWithdrawals.reduce((sum, r) => sum + (r.points || 0), 0);
        const effectiveWithdrawn = Math.max(w.totalWithdrawn || 0, requestsSum);

        // Pick latest withdrawal request for destination masking
        const latestReq = validWithdrawals[0] || (w.user.withdrawalRequests || [])[0];
        let maskedDestination: string | null = null;
        let methodName: string | null = null;

        if (latestReq) {
          methodName = latestReq.method?.name ?? null;
          const rawDest = this.extractDestinationString(latestReq.destination);
          if (rawDest) {
            maskedDestination = this.maskIdentifier(rawDest);
          }
        }

        return {
          userId: w.userId,
          username: w.user.username,
          avatarUrl: w.user.profile?.avatarUrl ?? null,
          country: w.user.profile?.country ?? null,
          totalWithdrawn: effectiveWithdrawn,
          totalEarned: Math.max(w.totalEarned || 0, w.availablePoints || 0),
          lastMethodName: methodName,
          lastPayoutMasked: maskedDestination,
          createdAt: w.user.createdAt,
        };
      })
      .sort((a, b) => {
        if (b.totalWithdrawn !== a.totalWithdrawn) {
          return b.totalWithdrawn - a.totalWithdrawn;
        }
        if (b.totalEarned !== a.totalEarned) {
          return b.totalEarned - a.totalEarned;
        }
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      })
      .slice(0, limit);

    return items.map((item, idx) => ({
      rank: idx + 1,
      userId: item.userId,
      username: item.username,
      avatarUrl: item.avatarUrl,
      country: item.country,
      totalWithdrawn: item.totalWithdrawn,
      totalEarned: item.totalEarned,
      lastMethodName: item.lastMethodName,
      lastPayoutMasked: item.lastPayoutMasked,
    }));
  }

  /**
   * Live top users by total points earned
   * Fully connected to database with activity data
   */
  async getLiveTopEarners(limit = 10): Promise<LeaderboardUserResult[]> {
    const enabled = await this.settingsService.isLeaderboardEnabled();
    if (!enabled) return [];

    const wallets = await this.prisma.wallet.findMany({
      where: {
        NOT: {
          user: { profile: { isLeaderboardVisible: false } },
        },
      },
      select: {
        userId: true,
        totalWithdrawn: true,
        totalEarned: true,
        availablePoints: true,
        user: {
          select: {
            id: true,
            username: true,
            createdAt: true,
            profile: {
              select: { avatarUrl: true, country: true, isLeaderboardVisible: true },
            },
            withdrawalRequests: {
              select: {
                destination: true,
                method: { select: { name: true } },
              },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      take: 50,
    });

    const items = wallets
      .filter((w) => w.user && w.user.profile?.isLeaderboardVisible !== false)
      .map((w) => {
        const effectiveEarned = Math.max(w.totalEarned || 0, w.availablePoints || 0);

        let maskedDestination: string | null = null;
        let methodName: string | null = null;
        const lastReq = w.user.withdrawalRequests[0];
        if (lastReq) {
          methodName = lastReq.method?.name ?? null;
          const rawDest = this.extractDestinationString(lastReq.destination);
          if (rawDest) {
            maskedDestination = this.maskIdentifier(rawDest);
          }
        }

        return {
          userId: w.userId,
          username: w.user.username,
          avatarUrl: w.user.profile?.avatarUrl ?? null,
          country: w.user.profile?.country ?? null,
          totalWithdrawn: w.totalWithdrawn || 0,
          totalEarned: effectiveEarned,
          lastMethodName: methodName,
          lastPayoutMasked: maskedDestination,
          createdAt: w.user.createdAt,
        };
      })
      .sort((a, b) => {
        if (b.totalEarned !== a.totalEarned) {
          return b.totalEarned - a.totalEarned;
        }
        if (b.totalWithdrawn !== a.totalWithdrawn) {
          return b.totalWithdrawn - a.totalWithdrawn;
        }
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      })
      .slice(0, limit);

    return items.map((item, idx) => ({
      rank: idx + 1,
      userId: item.userId,
      username: item.username,
      avatarUrl: item.avatarUrl,
      country: item.country,
      totalWithdrawn: item.totalWithdrawn,
      totalEarned: item.totalEarned,
      lastMethodName: item.lastMethodName,
      lastPayoutMasked: item.lastPayoutMasked,
    }));
  }

  async getUserRank(userId: string, metric: LeaderboardMetric, period = 'all-time') {
    const snapshot = await this.prisma.leaderboardSnapshot.findFirst({
      where: { userId, metric, period },
      orderBy: { snapshotAt: 'desc' },
    });

    return snapshot ? { rank: snapshot.rank, value: snapshot.value, metric, period } : null;
  }

  async recalculate(period = 'all-time'): Promise<void> {
    this.logger.log(`Recalculating leaderboard for period: ${period}`);

    await Promise.all([
      this.recalcMetric(LeaderboardMetric.TOTAL_WITHDRAWN, period),
      this.recalcMetric(LeaderboardMetric.TOTAL_EARNED, period),
      this.recalcMetric(LeaderboardMetric.TOTAL_REFERRALS, period),
    ]);

    this.logger.log('Leaderboard recalculation complete');
  }

  private async recalcMetric(metric: LeaderboardMetric, period: string): Promise<void> {
    let users: Array<{ userId: string; value: number }> = [];

    if (metric === LeaderboardMetric.TOTAL_WITHDRAWN) {
      const wallets = await this.prisma.wallet.findMany({
        where: {
          NOT: { user: { profile: { isLeaderboardVisible: false } } },
          totalWithdrawn: { gt: 0 },
        },
        select: { userId: true, totalWithdrawn: true },
        orderBy: { totalWithdrawn: 'desc' },
        take: 100,
      });
      users = wallets.map((w) => ({ userId: w.userId, value: w.totalWithdrawn }));
    } else if (metric === LeaderboardMetric.TOTAL_EARNED) {
      const wallets = await this.prisma.wallet.findMany({
        where: {
          NOT: { user: { profile: { isLeaderboardVisible: false } } },
          totalEarned: { gt: 0 },
        },
        select: { userId: true, totalEarned: true },
        orderBy: { totalEarned: 'desc' },
        take: 100,
      });
      users = wallets.map((w) => ({ userId: w.userId, value: w.totalEarned }));
    } else if (metric === LeaderboardMetric.TOTAL_REFERRALS) {
      const referrals = await this.prisma.referral.groupBy({
        by: ['referrerId'],
        _count: { referrerId: true },
        where: {
          referrer: { profile: { isLeaderboardVisible: true } },
        },
        orderBy: { _count: { referrerId: 'desc' } },
        take: 100,
      });
      users = referrals.map((r) => ({ userId: r.referrerId, value: r._count.referrerId }));
    }

    const snapshotAt = new Date();

    await this.prisma.$transaction(async (tx) => {
      await tx.leaderboardSnapshot.deleteMany({ where: { metric, period } });

      if (users.length > 0) {
        await tx.leaderboardSnapshot.createMany({
          data: users.map((entry, idx) => ({
            userId: entry.userId,
            metric,
            value: entry.value,
            rank: idx + 1,
            period,
            snapshotAt,
          })),
        });
      }
    });
  }

  /**
   * Robust destination extractor supporting objects, JSON strings, and direct strings
   */
  private extractDestinationString(destination: unknown): string | null {
    if (!destination) return null;

    if (typeof destination === 'string') {
      const trimmed = destination.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
          const parsed = JSON.parse(trimmed);
          return this.extractDestinationString(parsed);
        } catch {
          return trimmed;
        }
      }
      return trimmed.length >= 3 ? trimmed : null;
    }

    if (typeof destination === 'object' && destination !== null) {
      const obj = destination as Record<string, unknown>;
      const entries = Object.entries(obj);
      if (entries.length === 0) return null;

      // 1. Prioritize known field names
      const prioritized = entries.find(([k, v]) =>
        (typeof v === 'string' || typeof v === 'number') &&
        String(v).trim().length >= 3 &&
        /wallet|phone|mobile|number|vodafone|binance|email|account|address|destination|id/i.test(k),
      );
      if (prioritized) return String(prioritized[1]).trim();

      // 2. Fallback to any string property >= 3 characters
      const anyString = entries.find(
        ([, v]) => typeof v === 'string' && v.trim().length >= 3,
      );
      if (anyString) return String(anyString[1]).trim();

      // 3. Fallback to numeric value
      const anyNumber = entries.find(([, v]) => typeof v === 'number');
      if (anyNumber) return String(anyNumber[1]).trim();
    }

    return null;
  }

  /**
   * Masks wallet identifier according to user rules:
   * e.g. 010123456789 -> 01012*****89 (first 5 + stars + last 2)
   */
  maskIdentifier(value: string): string {
    if (!value) return '';
    const clean = value.trim();

    // Email masking
    if (clean.includes('@')) {
      const parts = clean.split('@');
      const name = parts[0];
      const domain = parts.slice(1).join('@');
      const maskedName =
        name.length <= 3
          ? `${name.slice(0, 1)}***`
          : `${name.slice(0, 2)}***${name.slice(-1)}`;
      return `${maskedName}@${domain}`;
    }

    // Short identifier (<= 7 characters)
    if (clean.length <= 7) {
      if (clean.length <= 4) {
        return `${clean.slice(0, 1)}***${clean.slice(-1)}`;
      }
      return `${clean.slice(0, 2)}***${clean.slice(-2)}`;
    }

    // Standard phone / wallet number: keep first 5, asterisks in middle, last 2
    const prefixLen = Math.min(5, Math.floor(clean.length / 2));
    const suffixLen = 2;
    const middleLen = Math.max(clean.length - prefixLen - suffixLen, 3);
    return `${clean.slice(0, prefixLen)}${'*'.repeat(middleLen)}${clean.slice(-suffixLen)}`;
  }
}