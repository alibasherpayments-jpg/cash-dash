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
      user: {
        findUnique: vi.fn(),
      },
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
      getPointsConversionRate: vi.fn().mockResolvedValue(10000),
      getMinWithdrawalPoints: vi.fn().mockResolvedValue(5000),
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

    await expect(
      service.createWithdrawal('user-1', {
        methodId: 'method-1',
        points: 5000,
        destination: { paypalEmail: 'test@example.com' },
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
