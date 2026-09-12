import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_SETTINGS: Record<string, { value: string; type: string; category: string; label: string }> = {
  conversion_rate: { value: '1000', type: 'number', category: 'financial', label: 'Points per $1 USD' },
  referral_reward_percent: { value: '10', type: 'number', category: 'referrals', label: 'Referral reward percentage of first withdrawal' },
  referral_bonus_points: { value: '500', type: 'number', category: 'referrals', label: 'Referral bonus points on sign-up' },
  min_withdrawal_points: { value: '100', type: 'number', category: 'financial', label: 'Minimum withdrawal in points' },
  max_withdrawal_points: { value: '5000000', type: 'number', category: 'financial', label: 'Maximum withdrawal in points' },
  leaderboard_enabled: { value: 'true', type: 'boolean', category: 'features', label: 'Leaderboard enabled' },
  leaderboard_update_interval: { value: '3600', type: 'number', category: 'features', label: 'Leaderboard update interval (seconds)' },
  daily_bonus_points: { value: '50', type: 'number', category: 'rewards', label: 'Daily login bonus points' },
  maintenance_mode: { value: 'false', type: 'boolean', category: 'system', label: 'Global maintenance mode' },
  max_offers_per_day: { value: '10', type: 'number', category: 'limits', label: 'Maximum offers a user can start per day' },
};

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private prisma: PrismaService) {}

  async get(key: string): Promise<string | null> {
    const setting = await this.prisma.systemSetting.findUnique({ where: { key } });
    if (!setting) {
      return DEFAULT_SETTINGS[key]?.value ?? null;
    }
    return setting.value;
  }

  async getNumber(key: string, defaultVal = 0): Promise<number> {
    const val = await this.get(key);
    return val !== null ? parseFloat(val) : defaultVal;
  }

  async getBoolean(key: string, defaultVal = false): Promise<boolean> {
    const val = await this.get(key);
    if (val === null) return defaultVal;
    return val === 'true' || val === '1';
  }

  async set(key: string, value: string): Promise<void> {
    const meta = DEFAULT_SETTINGS[key];
    await this.prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: {
        key,
        value,
        type: meta?.type ?? 'string',
        category: meta?.category ?? 'general',
        label: meta?.label ?? key,
      },
    });
  }

  async getAllSettings() {
    return this.prisma.systemSetting.findMany({ orderBy: [{ category: 'asc' }, { key: 'asc' }] });
  }

  async getByCategory(category: string) {
    return this.prisma.systemSetting.findMany({
      where: { category },
      orderBy: { key: 'asc' },
    });
  }

  // ─── Typed convenience getters ─────────────────────────────────────────────

  async getConversionRate(): Promise<number> {
    return this.getNumber('conversion_rate', 1000);
  }

  async getReferralRewardPercent(): Promise<number> {
    return this.getNumber('referral_reward_percent', 10);
  }

  async getReferralBonusPoints(): Promise<number> {
    return this.getNumber('referral_bonus_points', 500);
  }

  async getMinWithdrawalPoints(): Promise<number> {
    return this.getNumber('min_withdrawal_points', 100);
  }

  async isLeaderboardEnabled(): Promise<boolean> {
    return this.getBoolean('leaderboard_enabled', true);
  }

  async getDailyBonusPoints(): Promise<number> {
    return this.getNumber('daily_bonus_points', 100);
  }

  async isMaintenanceMode(): Promise<boolean> {
    return this.getBoolean('maintenance_mode', false);
  }
}
