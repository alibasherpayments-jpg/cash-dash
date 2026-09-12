import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { LeaderboardMetric, WithdrawalStatus } from '@prisma/client';

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService,
  ) {}

  async getLeaderboard(metric: LeaderboardMetric, period = 'all-time', limit = 10) {
    const enabled = await this.settingsService.isLeaderboardEnabled();
    if (!enabled) {
      return [];
    }

    const snapshots = await this.prisma.leaderboardSnapshot.findMany({
      where: {
        metric,
        period,
        user: { profile: { isLeaderboardVisible: true } },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile: {
              select: { avatarUrl: true, isLeaderboardVisible: true },
            },
          },
        },
      },
      orderBy: { rank: 'asc' },
      take: limit,
    });

    return snapshots
      .filter((s) => s.user.profile?.isLeaderboardVisible !== false)
      .map((s) => ({
        rank: s.rank,
        userId: s.userId,
        username: s.user.username,
        avatarUrl: s.user.profile?.avatarUrl,
        value: s.value,
        metric: s.metric,
        snapshotAt: s.snapshotAt,
      }));
  }

  async getLiveTopWithdrawers(limit = 10) {
    const enabled = await this.settingsService.isLeaderboardEnabled();
    if (!enabled) return [];

    const wallets = await this.prisma.wallet.findMany({
      where: {
        totalWithdrawn: { gt: 0 },
        user: { profile: { isLeaderboardVisible: true } },
      },
      select: {
        userId: true,
        totalWithdrawn: true,
        totalEarned: true,
        user: {
          select: {
            username: true,
            profile: {
              select: { avatarUrl: true, country: true, isLeaderboardVisible: true },
            },
          },
        },
      },
      orderBy: { totalWithdrawn: 'desc' },
      take: limit,
    });

    const results = await Promise.all(
      wallets
        .filter((w) => w.user.profile?.isLeaderboardVisible !== false)
        .map(async (w, idx) => {
          const lastWithdrawal = await this.prisma.withdrawalRequest.findFirst({
            where: {
              userId: w.userId,
              status: { in: [WithdrawalStatus.PAID, WithdrawalStatus.COMPLETED] },
            },
            select: {
              destination: true,
              method: { select: { name: true, slug: true } },
            },
            orderBy: { createdAt: 'desc' },
          });

          let maskedDestination: string | null = null;
          let methodName: string | null = null;

          if (lastWithdrawal) {
            methodName = lastWithdrawal.method?.name ?? null;
            const dest = lastWithdrawal.destination as Record<string, string>;
            const entry = Object.entries(dest).find(
              ([, v]) => typeof v === 'string' && v.length >= 4,
            );
            if (entry) {
              maskedDestination = this.maskIdentifier(entry[1]);
            }
          }

          return {
            rank: idx + 1,
            userId: w.userId,
            username: w.user.username,
            avatarUrl: w.user.profile?.avatarUrl ?? null,
            country: w.user.profile?.country ?? null,
            totalWithdrawn: w.totalWithdrawn,
            totalEarned: w.totalEarned,
            lastMethodName: methodName,
            lastPayoutMasked: maskedDestination,
          };
        }),
    );

    return results;
  }

  async getLiveTopEarners(limit = 10) {
    const enabled = await this.settingsService.isLeaderboardEnabled();
    if (!enabled) return [];

    const wallets = await this.prisma.wallet.findMany({
      where: {
        totalEarned: { gt: 0 },
        user: { profile: { isLeaderboardVisible: true } },
      },
      select: {
        userId: true,
        totalWithdrawn: true,
        totalEarned: true,
        user: {
          select: {
            username: true,
            profile: {
              select: { avatarUrl: true, country: true, isLeaderboardVisible: true },
            },
          },
        },
      },
      orderBy: { totalEarned: 'desc' },
      take: limit,
    });

    return wallets
      .filter((w) => w.user.profile?.isLeaderboardVisible !== false)
      .map((w, idx) => ({
        rank: idx + 1,
        userId: w.userId,
        username: w.user.username,
        avatarUrl: w.user.profile?.avatarUrl ?? null,
        country: w.user.profile?.country ?? null,
        totalWithdrawn: w.totalWithdrawn,
        totalEarned: w.totalEarned,
        lastMethodName: null as string | null,
        lastPayoutMasked: null as string | null,
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
          totalWithdrawn: { gt: 0 },
          user: { profile: { isLeaderboardVisible: true } },
        },
        select: { userId: true, totalWithdrawn: true },
        orderBy: { totalWithdrawn: 'desc' },
        take: 100,
      });
      users = wallets.map((w) => ({ userId: w.userId, value: w.totalWithdrawn }));
    } else if (metric === LeaderboardMetric.TOTAL_EARNED) {
      const wallets = await this.prisma.wallet.findMany({
        where: {
          totalEarned: { gt: 0 },
          user: { profile: { isLeaderboardVisible: true } },
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

  private maskIdentifier(value: string): string {
    if (value.length <= 7) {
      return `${value.slice(0, 2)}${'*'.repeat(Math.max(value.length - 4, 1))}${value.slice(-2)}`;
    }
    const prefixLen = 5;
    const suffixLen = 2;
    const middleLen = value.length - prefixLen - suffixLen;
    return `${value.slice(0, prefixLen)}${'*'.repeat(middleLen)}${value.slice(-suffixLen)}`;
  }
}