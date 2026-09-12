import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RiskLevel, RiskStatus } from '@prisma/client';

interface FraudSignalConfig {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  description: string;
}

const SIGNAL_SCORES: Record<string, number> = {
  ip_mismatch: 15,
  velocity: 25,
  referral_abuse: 35,
  suspicious_completion: 20,
  multiple_accounts: 40,
  vpn_detected: 10,
  bot_pattern: 50,
};

@Injectable()
export class FraudService {
  private readonly logger = new Logger(FraudService.name);

  constructor(private prisma: PrismaService) {}

  async assess(userId: string): Promise<{ riskScore: number; riskLevel: RiskLevel; signals: FraudSignalConfig[] }> {
    const signals: FraudSignalConfig[] = [];
    let totalScore = 0;

    // 1. Check completion velocity (too many completions in short period)
    const recentCompletions = await this.prisma.offerCompletion.count({
      where: {
        userId,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    if (recentCompletions > 20) {
      const score = SIGNAL_SCORES['velocity'] ?? 25;
      signals.push({
        type: 'velocity',
        severity: 'high',
        score,
        description: `${recentCompletions} offer completions in 24 hours`,
      });
      totalScore += score;
    }

    // 2. Check referral abuse (many referrals from same IP)
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      const referralCount = await this.prisma.referral.count({
        where: { referrerId: userId },
      });

      if (referralCount > 50) {
        const score = SIGNAL_SCORES['referral_abuse'] ?? 35;
        signals.push({
          type: 'referral_abuse',
          severity: 'medium',
          score,
          description: `Unusually high referral count: ${referralCount}`,
        });
        totalScore += score;
      }
    }

    // 3. Check suspicious completion patterns
    const reversedCompletions = await this.prisma.offerCompletion.count({
      where: { userId, status: 'REVERSED' },
    });

    if (reversedCompletions > 5) {
      const score = SIGNAL_SCORES['suspicious_completion'] ?? 20;
      signals.push({
        type: 'suspicious_completion',
        severity: 'medium',
        score,
        description: `${reversedCompletions} reversed offer completions`,
      });
      totalScore += score;
    }

    // Determine risk level
    const riskLevel = this.scoreToLevel(totalScore);
    const riskStatus = this.levelToStatus(riskLevel);

    // Update risk assessment
    await this.prisma.riskAssessment.upsert({
      where: { userId },
      update: { riskLevel, riskStatus, riskScore: totalScore, lastChecked: new Date() },
      create: { userId, riskLevel, riskStatus, riskScore: totalScore },
    });

    // Store new signals
    if (signals.length > 0) {
      await this.prisma.fraudSignal.createMany({
        data: signals.map((s) => ({
          userId,
          signalType: s.type,
          severity: s.severity,
          description: s.description,
          metadata: { score: s.score } as object,
        })),
      });
    }

    if (totalScore >= 60) {
      this.logger.warn(`High fraud risk for user ${userId}: score=${totalScore}, level=${riskLevel}`);
    }

    return { riskScore: totalScore, riskLevel, signals };
  }

  async getRiskAssessment(userId: string) {
    const [assessment, signals] = await Promise.all([
      this.prisma.riskAssessment.findUnique({ where: { userId } }),
      this.prisma.fraudSignal.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    return { assessment, signals };
  }

  private scoreToLevel(score: number): RiskLevel {
    if (score >= 80) return RiskLevel.CRITICAL;
    if (score >= 60) return RiskLevel.HIGH;
    if (score >= 30) return RiskLevel.MEDIUM;
    return RiskLevel.LOW;
  }

  private levelToStatus(level: RiskLevel): RiskStatus {
    switch (level) {
      case RiskLevel.CRITICAL:
        return RiskStatus.RESTRICTED;
      case RiskLevel.HIGH:
        return RiskStatus.REVIEW_REQUIRED;
      case RiskLevel.MEDIUM:
        return RiskStatus.MONITORING;
      default:
        return RiskStatus.CLEAR;
    }
  }
}
