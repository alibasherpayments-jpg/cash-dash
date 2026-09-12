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

  describe('maskIdentifier', () => {
    it('should correctly mask phone number according to user rule (e.g. 010123456789 -> 01012*****89)', () => {
      expect(service.maskIdentifier('010123456789')).toBe('01012*****89');
      expect(service.maskIdentifier('01123456789')).toBe('01123****89');
    });

    it('should correctly mask email addresses', () => {
      expect(service.maskIdentifier('john@example.com')).toBe('jo***n@example.com');
    });

    it('should correctly mask short IDs', () => {
      expect(service.maskIdentifier('123456')).toBe('12***56');
    });
  });

  describe('getLiveTopWithdrawers', () => {
    it('should return live top withdrawers with masked wallet destination', async () => {
      mockPrisma.wallet = {
        findMany: vi.fn().mockResolvedValue([
          {
            userId: 'user-1',
            totalWithdrawn: 50000,
            totalEarned: 80000,
            availablePoints: 30000,
            user: {
              id: 'user-1',
              username: 'super_earner',
              profile: { avatarUrl: null, country: 'EG', isLeaderboardVisible: true },
              withdrawalRequests: [
                {
                  points: 50000,
                  destination: { walletNumber: '010123456789' },
                  status: 'PAID',
                  createdAt: new Date(),
                  method: { name: 'Vodafone Cash', slug: 'vodafone-cash' },
                },
              ],
            },
          },
        ]),
      };

      const result = await service.getLiveTopWithdrawers(10);
      expect(result.length).toBe(1);
      expect(result[0].username).toBe('super_earner');
      expect(result[0].totalWithdrawn).toBe(50000);
      expect(result[0].lastPayoutMasked).toBe('01012*****89');
      expect(result[0].lastMethodName).toBe('Vodafone Cash');
    });
  });

  describe('getLiveTopEarners', () => {
    it('should fallback to availablePoints when totalEarned is zero', async () => {
      mockPrisma.wallet = {
        findMany: vi.fn().mockResolvedValue([
          {
            userId: 'user-2',
            totalWithdrawn: 0,
            totalEarned: 0,
            availablePoints: 15000,
            user: {
              id: 'user-2',
              username: 'new_earner',
              profile: { avatarUrl: null, country: 'US', isLeaderboardVisible: true },
              withdrawalRequests: [],
            },
          },
        ]),
      };

      const result = await service.getLiveTopEarners(10);
      expect(result.length).toBe(1);
      expect(result[0].username).toBe('new_earner');
      expect(result[0].totalEarned).toBe(15000);
    });
  });
});


