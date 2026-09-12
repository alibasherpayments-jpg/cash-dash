import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WalletService } from './wallet.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TransactionType, TransactionDirection, TransactionStatus } from '@prisma/client';

describe('WalletService', () => {
  let service: WalletService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      wallet: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      ledgerTransaction: {
        create: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
      $transaction: vi.fn((cb) => cb(mockPrisma)),
    };

    service = new WalletService(mockPrisma);
  });

  it('should get wallet summary with correct conversion rate', async () => {
    mockPrisma.wallet.findUnique.mockResolvedValue({
      id: 'wallet-1',
      userId: 'user-1',
      availablePoints: 20000,
      pendingPoints: 1000,
      totalEarned: 50000,
      totalWithdrawn: 30000,
    });

    const summary = await service.getWalletSummary('user-1', 10000);

    expect(summary).toEqual({
      availablePoints: 20000,
      pendingPoints: 1000,
      totalEarned: 50000,
      totalWithdrawn: 30000,
      cashValue: 2.0, // 20000 / 10000
    });
  });

  it('should credit wallet points and create ledger transaction atomically', async () => {
    mockPrisma.wallet.findUnique.mockResolvedValue({
      id: 'wallet-1',
      userId: 'user-1',
      availablePoints: 5000,
    });

    await service.credit({
      userId: 'user-1',
      amount: 1500,
      type: TransactionType.OFFER_REWARD,
      source: 'offer',
      description: 'Completed offer',
    });

    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    expect(mockPrisma.wallet.update).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      data: {
        availablePoints: { increment: 1500 },
        totalEarned: { increment: 1500 },
      },
    });
    expect(mockPrisma.ledgerTransaction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        walletId: 'wallet-1',
        type: TransactionType.OFFER_REWARD,
        direction: TransactionDirection.CREDIT,
        amount: 1500,
        status: TransactionStatus.COMPLETED,
      }),
    });
  });

  it('should throw BadRequestException when debiting more than available balance', async () => {
    mockPrisma.wallet.findUnique.mockResolvedValue({
      id: 'wallet-1',
      userId: 'user-1',
      availablePoints: 1000,
    });

    await expect(
      service.debit({
        userId: 'user-1',
        amount: 5000,
        type: TransactionType.WITHDRAWAL,
        source: 'withdrawal',
        description: 'Withdrawal payout',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
