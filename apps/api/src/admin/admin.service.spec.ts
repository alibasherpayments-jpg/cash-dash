import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminService } from './admin.service';
import {
  AuditAction,
  TransactionDirection,
  TransactionType,
  UserStatus,
} from '@prisma/client';

describe('AdminService', () => {
  let service: AdminService;
  let mockPrisma: any;
  let mockWalletService: any;
  let mockOffersService: any;
  let mockWithdrawalsService: any;
  let mockNotificationsService: any;
  let mockAuditService: any;
  let mockSettingsService: any;
  let mockFraudService: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        count: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      withdrawalRequest: {
        count: vi.fn(),
      },
      offer: {
        count: vi.fn(),
      },
      offerCompletion: {
        count: vi.fn(),
      },
      wallet: {
        aggregate: vi.fn(),
        findUnique: vi.fn(),
      },
    };

    mockWalletService = {
      credit: vi.fn(),
      debit: vi.fn(),
    };
    mockOffersService = {};
    mockWithdrawalsService = {};
    mockNotificationsService = {};
    mockAuditService = {
      log: vi.fn().mockResolvedValue({}),
    };
    mockSettingsService = {};
    mockFraudService = {};

    service = new AdminService(
      mockPrisma,
      mockWalletService,
      mockOffersService,
      mockWithdrawalsService,
      mockNotificationsService,
      mockAuditService,
      mockSettingsService,
      mockFraudService,
    );
  });

  it('should adjust user balance with CREDIT and log audit trail', async () => {
    mockPrisma.wallet.findUnique.mockResolvedValue({
      id: 'wallet-1',
      userId: 'user-1',
      availablePoints: 2000,
    });
    mockWalletService.credit.mockResolvedValue({});

    await service.adjustBalance(
      'user-1',
      {
        points: 500,
        direction: TransactionDirection.CREDIT,
        reason: 'Compensation for survey error',
      },
      'admin-1',
      '127.0.0.1',
    );

    expect(mockWalletService.credit).toHaveBeenCalledWith({
      userId: 'user-1',
      amount: 500,
      type: TransactionType.ADMIN_ADJUSTMENT,
      source: 'admin',
      description: 'Admin adjustment: Compensation for survey error',
      referenceId: 'admin-1',
    });

    expect(mockAuditService.log).toHaveBeenCalledWith({
      adminId: 'admin-1',
      action: AuditAction.BALANCE_ADJUSTED,
      entityType: 'Wallet',
      entityId: 'wallet-1',
      previousValue: { availablePoints: 2000 },
      newValue: { adjustment: 'CREDIT 500', reason: 'Compensation for survey error' },
      ipAddress: '127.0.0.1',
    });
  });

  it('should adjust user balance with DEBIT and log audit trail', async () => {
    mockPrisma.wallet.findUnique.mockResolvedValue({
      id: 'wallet-1',
      userId: 'user-1',
      availablePoints: 2000,
    });
    mockWalletService.debit.mockResolvedValue({});

    await service.adjustBalance(
      'user-1',
      {
        points: 300,
        direction: TransactionDirection.DEBIT,
        reason: 'Chargeback clawback',
      },
      'admin-1',
    );

    expect(mockWalletService.debit).toHaveBeenCalledWith({
      userId: 'user-1',
      amount: 300,
      type: TransactionType.ADMIN_ADJUSTMENT,
      source: 'admin',
      description: 'Admin adjustment: Chargeback clawback',
      referenceId: 'admin-1',
    });

    expect(mockAuditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        adminId: 'admin-1',
        action: AuditAction.BALANCE_ADJUSTED,
        newValue: { adjustment: 'DEBIT 300', reason: 'Chargeback clawback' },
      }),
    );
  });

  it('should update user status and create appropriate audit action', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      status: UserStatus.ACTIVE,
    });
    mockPrisma.user.update.mockResolvedValue({});

    await service.updateUserStatus(
      'user-1',
      { status: UserStatus.SUSPENDED, reason: 'Suspicious proxy activity' },
      'admin-1',
    );

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { status: UserStatus.SUSPENDED },
    });

    expect(mockAuditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        adminId: 'admin-1',
        action: AuditAction.USER_SUSPENDED,
        entityType: 'User',
        entityId: 'user-1',
      }),
    );
  });

  it('should aggregate dashboard statistics correctly', async () => {
    mockPrisma.user.count
      .mockResolvedValueOnce(150) // total
      .mockResolvedValueOnce(120); // active
    mockPrisma.withdrawalRequest.count
      .mockResolvedValueOnce(45) // total
      .mockResolvedValueOnce(5); // pending
    mockPrisma.offer.count.mockResolvedValueOnce(80);
    mockPrisma.offerCompletion.count.mockResolvedValueOnce(350);
    mockPrisma.user.findMany.mockResolvedValueOnce([]);
    mockPrisma.wallet.aggregate.mockResolvedValueOnce({
      _sum: { availablePoints: 500000, totalEarned: 1200000, totalWithdrawn: 700000 },
    });

    const stats = await service.getDashboardStats();

    expect(stats.users.total).toBe(150);
    expect(stats.users.active).toBe(120);
    expect(stats.withdrawals.pending).toBe(5);
    expect(stats.points.inCirculation).toBe(500000);
  });
});
