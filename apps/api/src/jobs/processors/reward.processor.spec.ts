import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RewardProcessor } from './reward.processor';
import { OfferCompletionStatus, TransactionType, NotificationType } from '@prisma/client';

describe('RewardProcessor', () => {
  let processor: RewardProcessor;
  let mockWalletService: any;
  let mockNotificationsService: any;
  let mockPrisma: any;

  beforeEach(() => {
    mockWalletService = {
      credit: vi.fn().mockResolvedValue(undefined),
    };
    mockNotificationsService = {
      trigger: vi.fn().mockResolvedValue({}),
    };
    mockPrisma = {
      offerCompletion: {
        findUnique: vi.fn(),
        update: vi.fn().mockResolvedValue({}),
      },
      offer: {
        update: vi.fn().mockResolvedValue({}),
      },
    };

    processor = new RewardProcessor(
      mockWalletService,
      mockNotificationsService,
      mockPrisma,
    );
  });

  it('should process reward when completion is pending', async () => {
    mockPrisma.offerCompletion.findUnique.mockResolvedValue({
      id: 'comp-1',
      status: OfferCompletionStatus.PENDING,
    });

    const job = {
      data: {
        completionId: 'comp-1',
        userId: 'user-1',
        offerId: 'offer-1',
        rewardPoints: 1200,
        offerTitle: 'Install App',
      },
    } as any;

    await processor.process(job);

    expect(mockPrisma.offerCompletion.update).toHaveBeenCalledWith({
      where: { id: 'comp-1' },
      data: expect.objectContaining({
        status: OfferCompletionStatus.COMPLETED,
      }),
    });

    expect(mockWalletService.credit).toHaveBeenCalledWith({
      userId: 'user-1',
      amount: 1200,
      type: TransactionType.OFFER_REWARD,
      source: 'offer',
      description: 'Reward for completing: Install App',
      referenceId: 'comp-1',
    });

    expect(mockNotificationsService.trigger).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        type: NotificationType.REWARD_ADDED,
      }),
    );
  });

  it('should skip crediting if completion is already COMPLETED (idempotency guard)', async () => {
    mockPrisma.offerCompletion.findUnique.mockResolvedValue({
      id: 'comp-1',
      status: OfferCompletionStatus.COMPLETED,
    });

    const job = {
      data: {
        completionId: 'comp-1',
        userId: 'user-1',
        offerId: 'offer-1',
        rewardPoints: 1200,
        offerTitle: 'Install App',
      },
    } as any;

    await processor.process(job);

    expect(mockWalletService.credit).not.toHaveBeenCalled();
    expect(mockNotificationsService.trigger).not.toHaveBeenCalled();
  });

  it('should set status to UNDER_REVIEW and rethrow if error occurs during processing', async () => {
    mockPrisma.offerCompletion.findUnique.mockResolvedValue({
      id: 'comp-1',
      status: OfferCompletionStatus.PENDING,
    });
    mockWalletService.credit.mockRejectedValue(new Error('Ledger transaction failure'));

    const job = {
      data: {
        completionId: 'comp-1',
        userId: 'user-1',
        offerId: 'offer-1',
        rewardPoints: 1200,
        offerTitle: 'Install App',
      },
    } as any;

    await expect(processor.process(job)).rejects.toThrow('Ledger transaction failure');

    expect(mockPrisma.offerCompletion.update).toHaveBeenCalledWith({
      where: { id: 'comp-1' },
      data: { status: OfferCompletionStatus.UNDER_REVIEW },
    });
  });
});
