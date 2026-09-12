import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_SETTINGS: Record<string, { value: string; type: string; category: string; label: string }> = {
  site_name: { value: 'Cash Dash', type: 'string', category: 'general', label: 'Site Name' },
  support_email: { value: 'support@cashdash.com', type: 'string', category: 'general', label: 'Support Inquiries Email' },
  conversion_rate: { value: '1000', type: 'number', category: 'financial', label: 'Points per $1 USD' },
  points_conversion_rate: { value: '1000', type: 'number', category: 'financial', label: 'Points per $1 USD (Alias)' },
  referral_reward_percent: { value: '10', type: 'number', category: 'referrals', label: 'Referral reward percentage of first withdrawal' },
  referral_percentage: { value: '10', type: 'number', category: 'referrals', label: 'Referral commission percentage (Alias)' },
  referral_bonus_points: { value: '500', type: 'number', category: 'referrals', label: 'Referral bonus points on sign-up' },
  min_withdrawal_points: { value: '100', type: 'number', category: 'financial', label: 'Minimum withdrawal in points' },
  max_withdrawal_points: { value: '5000000', type: 'number', category: 'financial', label: 'Maximum withdrawal in points' },
  leaderboard_enabled: { value: 'true', type: 'boolean', category: 'features', label: 'Leaderboard enabled' },
  leaderboard_update_interval: { value: '3600', type: 'number', category: 'features', label: 'Leaderboard update interval (seconds)' },
  daily_bonus_points: { value: '50', type: 'number', category: 'rewards', label: 'Daily login bonus points' },
  maintenance_mode: { value: 'false', type: 'boolean', category: 'system', label: 'Global maintenance mode' },
  max_offers_per_day: { value: '10', type: 'number', category: 'limits', label: 'Maximum offers a user can start per day' },
};

// Aliases to keep synchronized
const KEY_ALIASES: Record<string, string> = {
  points_conversion_rate: 'conversion_rate',
  conversion_rate: 'points_conversion_rate',
  referral_percentage: 'referral_reward_percent',
  referral_reward_percent: 'referral_percentage',
};

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private prisma: PrismaService) {}

  private normalizeKey(key: string): string {
    if (key === 'points_conversion_rate') return 'conversion_rate';
    if (key === 'referral_percentage') return 'referral_reward_percent';
    return key;
  }

  async get(key: string): Promise<string | null> {
    const normalizedKey = this.normalizeKey(key);
    const setting = await this.prisma.systemSetting.findUnique({ where: { key: normalizedKey } });
    if (!setting) {
      if (normalizedKey !== key) {
        const alt = await this.prisma.systemSetting.findUnique({ where: { key } });
        if (alt) return alt.value;
      }
      return DEFAULT_SETTINGS[normalizedKey]?.value ?? DEFAULT_SETTINGS[key]?.value ?? null;
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
    const normalizedKey = this.normalizeKey(key);
    const meta = DEFAULT_SETTINGS[normalizedKey] ?? DEFAULT_SETTINGS[key];

    // Upsert primary key
    await this.prisma.systemSetting.upsert({
      where: { key: normalizedKey },
      update: { value },
      create: {
        key: normalizedKey,
        value,
        type: meta?.type ?? 'string',
        category: meta?.category ?? 'general',
        label: meta?.label ?? normalizedKey,
      },
    });

    // Also sync the alias key if one exists
    const aliasKey = KEY_ALIASES[normalizedKey];
    if (aliasKey) {
      const aliasMeta = DEFAULT_SETTINGS[aliasKey];
      await this.prisma.systemSetting.upsert({
        where: { key: aliasKey },
        update: { value },
        create: {
          key: aliasKey,
          value,
          type: aliasMeta?.type ?? 'string',
          category: aliasMeta?.category ?? 'general',
          label: aliasMeta?.label ?? aliasKey,
        },
      });
    }
  }

  async getAllSettings() {
    const dbSettings = await this.prisma.systemSetting.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });
    const dbMap = new Map(dbSettings.map((s) => [s.key, s]));

    // Construct full settings list with defaults if not yet written to DB
    const result = Object.entries(DEFAULT_SETTINGS).map(([key, def]) => {
      const existing = dbMap.get(key);
      if (existing) {
        return existing;
      }
      return {
        id: `default-${key}`,
        key,
        value: def.value,
        type: def.type,
        category: def.category,
        label: def.label,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    // Append any custom settings stored in DB
    for (const s of dbSettings) {
      if (!DEFAULT_SETTINGS[s.key]) {
        result.push(s);
      }
    }

    return result;
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

  async getPublicSettings() {
    const [
      siteName,
      supportEmail,
      conversionRate,
      minWithdrawalPoints,
      leaderboardEnabled,
      maintenanceMode,
    ] = await Promise.all([
      this.get('site_name'),
      this.get('support_email'),
      this.getConversionRate(),
      this.getMinWithdrawalPoints(),
      this.isLeaderboardEnabled(),
      this.isMaintenanceMode(),
    ]);

    return {
      siteName: siteName ?? 'Cash Dash',
      supportEmail: supportEmail ?? 'support@cashdash.com',
      conversionRate,
      minWithdrawalPoints,
      leaderboardEnabled,
      maintenanceMode,
    };
  }
}