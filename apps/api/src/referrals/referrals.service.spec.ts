import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReferralsService } from './referrals.service';
import { TransactionType, NotificationType } from '@prisma/client';

describe('ReferralsService', () => {
  let service: ReferralsService;
  let mockPrisma: any;
  let mockWalletService: any;
  let mockNotificationsService: any;
  let mockSettingsService: any;

  beforeEach(() => {
    mockPrisma = {
      referral: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      wallet: {
        findUnique: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
    };

    mockWalletService = {
      credit: vi.fn().mockResolvedValue(undefined),
    };

    mockNotificationsService = {
      trigger: vi.fn().mockResolvedValue(undefined),
    };

    mockSettingsService = {
      getReferralRewardPercent: vi.fn().mockResolvedValue(10),
      getReferralBonusPoints: vi.fn().mockResolvedValue(500),
    };

    service = new ReferralsService(
      mockPrisma,
      mockWalletService,
      mockNotificationsService,
      mockSettingsService,
    );
  });

  it('should calculate referral statistics correctly', async () => {
    mockPrisma.referral.findMany.mockResolvedValue([
      {
        id: 'ref-1',
        referrerId: 'user-1',
        referredId: 'user-2',
        rewardGiven: true,
        rewardPoints: 1000,
        referred: {
          username: 'bob',
          createdAt: new Date('2026-01-01'),
          profile: { avatarUrl: null },
        },
      },
      {
        id: 'ref-2',
        referrerId: 'user-1',
        referredId: 'user-3',
        rewardGiven: false,
        rewardPoints: 0,
        referred: {
          username: 'alice',
          createdAt: new Date('2026-01-02'),
          profile: { avatarUrl: null },
        },
      },
    ]);

    mockPrisma.wallet.findUnique.mockResolvedValue({ id: 'wallet-1' });
    mockPrisma.user.findUnique.mockResolvedValue({ referralCode: 'REF123' });

    const stats = await service.getReferralStats('user-1');

    expect(stats.totalReferrals).toBe(2);
    expect(stats.rewardedReferrals).toBe(1);
    expect(stats.totalEarned).toBe(1000);
    expect(stats.referralCode).toBe('REF123');
    expect(stats.referrals).toHaveLength(2);
  });

  it('should process referral reward and credit referrer wallet', async () => {
    mockPrisma.referral.findUnique.mockResolvedValue({
      id: 'ref-1',
      referrerId: 'user-referrer',
      referredId: 'user-referred',
      rewardGiven: false,
      rewardPoints: 0,
    });

    await service.processReferralReward('user-referred', 20000);

    expect(mockSettingsService.getReferralRewardPercent).toHaveBeenCalled();
    // 10% of 20000 = 2000 pts
    expect(mockPrisma.referral.update).toHaveBeenCalledWith({
      where: { id: 'ref-1' },
      data: { rewardGiven: true, rewardPoints: 2000 },
    });
    expect(mockWalletService.credit).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-referrer',
        amount: 2000,
        type: TransactionType.REFERRAL_REWARD,
      }),
    );
    expect(mockNotificationsService.trigger).toHaveBeenCalledWith(
      'user-referrer',
      expect.objectContaining({
        type: NotificationType.REFERRAL_REWARD,
      }),
    );
  });

  it('should ignore duplicate referral rewards if already rewarded', async () => {
    mockPrisma.referral.findUnique.mockResolvedValue({
      id: 'ref-1',
      referrerId: 'user-referrer',
      referredId: 'user-referred',
      rewardGiven: true,
      rewardPoints: 2000,
    });

    await service.processReferralReward('user-referred', 20000);

    expect(mockWalletService.credit).not.toHaveBeenCalled();
    expect(mockPrisma.referral.update).not.toHaveBeenCalled();
  });
});
