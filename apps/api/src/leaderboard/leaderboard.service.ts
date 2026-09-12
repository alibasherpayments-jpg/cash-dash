import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { LeaderboardMetric, WithdrawalStatus } from '@prisma/client';
import { getPaginationParams, paginate } from '../common/dto/pagination.dto';

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

    // Get latest snapshots for this metric
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

  async getUserRank(userId: string, metric: LeaderboardMetric, period = 'all-time') {
    const snapshot = await this.prisma.leaderboardSnapshot.findFirst({
      where: { userId, metric, period },
      orderBy: { snapshotAt: 'desc' },
    });

    return snapshot ? { rank: snapshot.rank, value: snapshot.value, metric, period } : null;
  }

  /**
   * Recalculate leaderboard from live data and save snapshots.
   * Called by BullMQ job periodically.
   */
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

    // Atomically prune older snapshots and insert new calculated rankings
    await this.prisma.$transaction(async (tx) => {
      await tx.leaderboardSnapshot.deleteMany({
        where: { metric, period },
      });

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
}
