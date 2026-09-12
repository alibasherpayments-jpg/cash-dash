import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardMetric } from '@prisma/client';

describe('LeaderboardService', () => {
  let service: LeaderboardService;
  let mockPrisma: any;
  let mockSettingsService: any;

  beforeEach(() => {
    mockPrisma = {
      leaderboardSnapshot: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
    };

    mockSettingsService = {
      isLeaderboardEnabled: vi.fn().mockResolvedValue(true),
    };

    service = new LeaderboardService(mockPrisma, mockSettingsService);
  });

  it('should return empty list when leaderboard is disabled in settings', async () => {
    mockSettingsService.isLeaderboardEnabled.mockResolvedValue(false);

    const result = await service.getLeaderboard(LeaderboardMetric.TOTAL_WITHDRAWN);
    expect(result).toEqual([]);
    expect(mockPrisma.leaderboardSnapshot.findMany).not.toHaveBeenCalled();
  });

  it('should return formatted leaderboard entries when enabled', async () => {
    mockPrisma.leaderboardSnapshot.findMany.mockResolvedValue([
      {
        rank: 1,
        userId: 'user-1',
        value: 500000,
        metric: LeaderboardMetric.TOTAL_WITHDRAWN,
        snapshotAt: new Date(),
        user: {
          id: 'user-1',
          username: 'alex',
          profile: { avatarUrl: 'http://avatar/1', isLeaderboardVisible: true },
        },
      },
      {
        rank: 2,
        userId: 'user-2',
        value: 400000,
        metric: LeaderboardMetric.TOTAL_WITHDRAWN,
        snapshotAt: new Date(),
        user: {
          id: 'user-2',
          username: 'hidden_user',
          profile: { avatarUrl: 'http://avatar/2', isLeaderboardVisible: false }, // Hidden
        },
      },
    ]);

    const result = await service.getLeaderboard(LeaderboardMetric.TOTAL_WITHDRAWN);

    // Hidden user should be filtered out
    expect(result.length).toBe(1);
    expect(result[0].username).toBe('alex');
    expect(result[0].rank).toBe(1);
    expect(result[0].value).toBe(500000);
  });

  it('should return user rank when snapshot exists', async () => {
    mockPrisma.leaderboardSnapshot.findFirst.mockResolvedValue({
      rank: 5,
      value: 120000,
      metric: LeaderboardMetric.TOTAL_EARNED,
      period: 'all-time',
    });

    const rank = await service.getUserRank('user-1', LeaderboardMetric.TOTAL_EARNED);
    expect(rank).toEqual({
      rank: 5,
      value: 120000,
      metric: LeaderboardMetric.TOTAL_EARNED,
      period: 'all-time',
    });
  });

  it('should recalculate leaderboard metrics and prune old snapshots atomically', async () => {
    mockPrisma.wallet = {
      findMany: vi.fn().mockResolvedValue([
        { userId: 'user-top1', totalWithdrawn: 100000, totalEarned: 200000 },
      ]),
    };
    mockPrisma.referral = {
      groupBy: vi.fn().mockResolvedValue([
        { referrerId: 'user-top1', _count: { referrerId: 10 } },
      ]),
    };
    mockPrisma.leaderboardSnapshot.deleteMany = vi.fn().mockResolvedValue({ count: 1 });
    mockPrisma.leaderboardSnapshot.createMany = vi.fn().mockResolvedValue({ count: 1 });
    mockPrisma.$transaction = vi.fn(async (cb: any) => cb(mockPrisma));

    await service.recalculate('all-time');

    expect(mockPrisma.leaderboardSnapshot.deleteMany).toHaveBeenCalledTimes(3);
    expect(mockPrisma.leaderboardSnapshot.createMany).toHaveBeenCalledTimes(3);
  });
});

