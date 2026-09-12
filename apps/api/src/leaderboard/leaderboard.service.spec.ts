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
});
