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

  it('should throw BadRequestException when crediting non-positive or fractional points', async () => {
    await expect(
      service.credit({
        userId: 'user-1',
        amount: -500,
        type: TransactionType.OFFER_REWARD,
        source: 'offer',
        description: 'Negative credit test',
      }),
    ).rejects.toThrow('Credit amount must be a positive integer');

    await expect(
      service.credit({
        userId: 'user-1',
        amount: 0,
        type: TransactionType.OFFER_REWARD,
        source: 'offer',
        description: 'Zero credit test',
      }),
    ).rejects.toThrow('Credit amount must be a positive integer');

    await expect(
      service.credit({
        userId: 'user-1',
        amount: 15.75,
        type: TransactionType.OFFER_REWARD,
        source: 'offer',
        description: 'Fractional credit test',
      }),
    ).rejects.toThrow('Credit amount must be a positive integer');
  });

  it('should throw BadRequestException when debiting non-positive or fractional points', async () => {
    await expect(
      service.debit({
        userId: 'user-1',
        amount: -100,
        type: TransactionType.WITHDRAWAL,
        source: 'withdrawal',
        description: 'Negative debit test',
      }),
    ).rejects.toThrow('Debit amount must be a positive integer');

    await expect(
      service.debit({
        userId: 'user-1',
        amount: 0,
        type: TransactionType.WITHDRAWAL,
        source: 'withdrawal',
        description: 'Zero debit test',
      }),
    ).rejects.toThrow('Debit amount must be a positive integer');
  });

  it('should cap reversal debit at current availablePoints so balance never drops below zero', async () => {
    // User had earned 5000 points, but already cashed out 4000, leaving availablePoints = 1000.
    // An offer reversal of 5000 occurs.
    mockPrisma.wallet.findUnique.mockResolvedValue({
      id: 'wallet-1',
      userId: 'user-1',
      availablePoints: 1000,
    });

    await service.reverseCredit('user-1', 5000, 'offer-comp-1', 'Chargeback reversal');

    expect(mockPrisma.wallet.update).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      data: {
        availablePoints: { decrement: 1000 }, // capped at 1000, not 5000!
        totalEarned: { decrement: 1000 },
      },
    });
    expect(mockPrisma.ledgerTransaction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        amount: 1000,
        status: TransactionStatus.REVERSED,
      }),
    });
  });
});
