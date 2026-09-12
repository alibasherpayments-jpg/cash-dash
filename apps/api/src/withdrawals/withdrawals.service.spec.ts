import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WithdrawalsService } from './withdrawals.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WithdrawalStatus } from '@prisma/client';

describe('WithdrawalsService', () => {
  let service: WithdrawalsService;
  let mockPrisma: any;
  let mockWalletService: any;
  let mockNotificationsService: any;
  let mockAuditService: any;
  let mockSettingsService: any;

  beforeEach(() => {
    mockPrisma = {
      withdrawalMethod: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      withdrawalRequest: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        count: vi.fn(),
        update: vi.fn(),
      },
      withdrawalStatusHistory: {
        create: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
      wallet: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      ledgerEntry: {
        create: vi.fn(),
      },
      $transaction: vi.fn((arg) => (typeof arg === 'function' ? arg(mockPrisma) : Promise.all(arg))),
    };

    mockWalletService = {
      getWallet: vi.fn(),
      debit: vi.fn(),
      credit: vi.fn(),
    };

    mockNotificationsService = {
      trigger: vi.fn(),
    };

    mockAuditService = {
      log: vi.fn(),
    };

    mockSettingsService = {
      getConversionRate: vi.fn().mockResolvedValue(1000),
      getPointsConversionRate: vi.fn().mockResolvedValue(1000),
      getMinWithdrawalPoints: vi.fn().mockResolvedValue(100),
    };

    service = new WithdrawalsService(
      mockPrisma,
      mockWalletService,
      mockNotificationsService,
      mockAuditService,
      mockSettingsService,
    );
  });

  it('should reject withdrawal when points is below method minimum', async () => {
    mockPrisma.withdrawalMethod.findUnique.mockResolvedValue({
      id: 'method-1',
      isActive: true,
      isMaintenanceMode: false,
      minimumPoints: 10000,
      feePercent: 0,
      requirements: [],
    });

    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      status: 'ACTIVE',
      profile: { country: 'US' },
    });

    mockWalletService.getWallet.mockResolvedValue({
      availablePoints: 20000,
    });

    await expect(
      service.createWithdrawal('user-1', {
        methodId: 'method-1',
        points: 5000, // Below minimum 10000
        destination: { paypalEmail: 'test@example.com' },
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject withdrawal when user has insufficient points', async () => {
    mockPrisma.withdrawalMethod.findUnique.mockResolvedValue({
      id: 'method-1',
      isActive: true,
      isMaintenanceMode: false,
      minimumPoints: 5000,
      feePercent: 0,
      requirements: [],
    });

    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      status: 'ACTIVE',
      profile: { country: 'US' },
    });

    mockWalletService.getWallet.mockResolvedValue({
      availablePoints: 3000, // less than requested 5000
    });
    mockPrisma.wallet.findUnique.mockResolvedValue({
      availablePoints: 3000,
    });

    await expect(
      service.createWithdrawal('user-1', {
        methodId: 'method-1',
        points: 5000,
        destination: { paypalEmail: 'test@example.com' },
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject withdrawal when required dynamic requirement field is missing', async () => {
    mockPrisma.withdrawalMethod.findUnique.mockResolvedValue({
      id: 'method-crypto',
      name: 'Crypto',
      isActive: true,
      isMaintenanceMode: false,
      minimumPoints: 10000,
      feePercent: 1.5,
      requirements: [
        { fieldName: 'walletAddress', label: 'Wallet Address', isRequired: true },
        { fieldName: 'network', label: 'Network', isRequired: true },
      ],
    });

    mockWalletService.getWallet.mockResolvedValue({
      availablePoints: 50000,
    });

    await expect(
      service.createWithdrawal('user-1', {
        methodId: 'method-crypto',
        points: 20000,
        destination: { network: 'TRC20' }, // missing walletAddress!
      }),
    ).rejects.toThrow('Missing required field: Wallet Address');
  });

  it('should reject invalid status transition (e.g. from COMPLETED to PENDING)', async () => {
    mockPrisma.withdrawalRequest.findUnique.mockResolvedValue({
      id: 'wr-1',
      status: WithdrawalStatus.COMPLETED,
      userId: 'user-1',
      points: 15000,
    });

    await expect(
      service.adminUpdateWithdrawalStatus('wr-1', { status: WithdrawalStatus.PENDING }, 'admin-1'),
    ).rejects.toThrow('Invalid status transition from COMPLETED to PENDING');
  });

  it('should refund wallet points and log audit event when admin rejects withdrawal', async () => {
    mockPrisma.withdrawalRequest.findUnique.mockResolvedValue({
      id: 'wr-1',
      status: WithdrawalStatus.PENDING,
      userId: 'user-1',
      points: 15000,
      method: { name: 'PayPal' },
      destination: { paypalEmail: 'user@example.com' },
    });

    mockPrisma.withdrawalRequest.update.mockResolvedValue({ id: 'wr-1' });

    await service.adminUpdateWithdrawalStatus(
      'wr-1',
      { status: WithdrawalStatus.REJECTED, note: 'Failed verification' },
      'admin-1',
    );

    // Points refunded to wallet
    expect(mockWalletService.credit).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        amount: 15000,
        type: 'WITHDRAWAL_REVERSAL',
      }),
    );

    // Audit log created with action WITHDRAWAL_REJECTED
    expect(mockAuditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        adminId: 'admin-1',
        action: 'WITHDRAWAL_REJECTED',
        entityId: 'wr-1',
      }),
    );
  });
});
