import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FraudService } from './fraud.service';
import { RiskLevel, RiskStatus } from '@prisma/client';

describe('FraudService', () => {
  let service: FraudService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      offerCompletion: {
        count: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
      referral: {
        count: vi.fn(),
      },
      riskAssessment: {
        upsert: vi.fn(),
        findUnique: vi.fn(),
      },
      fraudSignal: {
        createMany: vi.fn(),
        findMany: vi.fn(),
      },
    };

    service = new FraudService(mockPrisma);
  });

  it('should assess low risk for normal user with zero flags', async () => {
    mockPrisma.offerCompletion.count.mockResolvedValue(2);
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-normal' });
    mockPrisma.referral.count.mockResolvedValue(3);
    mockPrisma.riskAssessment.upsert.mockResolvedValue({ id: 'risk-1' });

    const assessment = await service.assess('user-normal');

    expect(assessment.riskScore).toBe(0);
    expect(assessment.riskLevel).toBe(RiskLevel.LOW);
    expect(assessment.signals).toHaveLength(0);
  });

  it('should flag velocity signal when completions exceed threshold', async () => {
    // 25 completions in 24 hours > 20 threshold
    mockPrisma.offerCompletion.count
      .mockResolvedValueOnce(25) // recent completions
      .mockResolvedValueOnce(0);  // reversed completions
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-fast' });
    mockPrisma.referral.count.mockResolvedValue(5);
    mockPrisma.riskAssessment.upsert.mockResolvedValue({ id: 'risk-1' });

    const assessment = await service.assess('user-fast');

    expect(assessment.riskScore).toBe(25);
    expect(assessment.riskLevel).toBe(RiskLevel.LOW);
    expect(assessment.signals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'velocity', score: 25 }),
      ]),
    );
  });

  it('should flag multiple signals and escalate risk level to HIGH or CRITICAL', async () => {
    // velocity + referral abuse + reversed completions
    mockPrisma.offerCompletion.count
      .mockResolvedValueOnce(35) // > 20 completions
      .mockResolvedValueOnce(8);  // > 5 reversed
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-suspicious' });
    mockPrisma.referral.count.mockResolvedValue(60); // > 50 referrals
    mockPrisma.riskAssessment.upsert.mockResolvedValue({ id: 'risk-1' });

    const assessment = await service.assess('user-suspicious');

    // velocity (25) + referral_abuse (35) + suspicious_completion (20) = 80
    expect(assessment.riskScore).toBe(80);
    expect(assessment.riskLevel).toBe(RiskLevel.CRITICAL);
    expect(assessment.signals).toHaveLength(3);
    expect(mockPrisma.fraudSignal.createMany).toHaveBeenCalled();
  });
});
