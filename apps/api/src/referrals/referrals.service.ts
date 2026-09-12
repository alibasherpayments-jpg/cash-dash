import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SettingsService } from '../settings/settings.service';
import { TransactionType, NotificationType } from '@prisma/client';

@Injectable()
export class ReferralsService {
  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
    private notificationsService: NotificationsService,
    private settingsService: SettingsService,
  ) {}

  async getReferralStats(userId: string) {
    const [referrals, wallet] = await Promise.all([
      this.prisma.referral.findMany({
        where: { referrerId: userId },
        include: {
          referred: {
            select: {
              username: true,
              createdAt: true,
              profile: { select: { avatarUrl: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.wallet.findUnique({ where: { userId } }),
    ]);

    const totalEarned = referrals.reduce((sum, r) => sum + r.rewardPoints, 0);
    const totalReferrals = referrals.length;
    const rewardedReferrals = referrals.filter((r) => r.rewardGiven).length;

    return {
      referralCode: await this.getUserReferralCode(userId),
      totalReferrals,
      rewardedReferrals,
      totalEarned,
      referrals: referrals.map((r) => ({
        id: r.id,
        username: r.referred.username,
        avatarUrl: r.referred.profile?.avatarUrl,
        joinedAt: r.referred.createdAt,
        rewardGiven: r.rewardGiven,
        rewardPoints: r.rewardPoints,
      })),
    };
  }

  async getUserReferralCode(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });
    return user?.referralCode ?? '';
  }

  /**
   * Award referral bonus when a referred user completes their first withdrawal.
   * Anti-abuse: checks for self-referral, duplicate rewards.
   */
  async processReferralReward(referredUserId: string, withdrawalAmount: number): Promise<void> {
    const referral = await this.prisma.referral.findUnique({
      where: { referredId: referredUserId },
      include: { referrer: true },
    });

    if (!referral || referral.rewardGiven) return;

    // Anti-abuse: no self-referral (already prevented at registration, double-check)
    if (referral.referrerId === referredUserId) return;

    const rewardPercent = await this.settingsService.getReferralRewardPercent();
    const rewardPoints = Math.floor(withdrawalAmount * (rewardPercent / 100));

    await this.prisma.referral.update({
      where: { id: referral.id },
      data: { rewardGiven: true, rewardPoints },
    });

    await this.walletService.credit({
      userId: referral.referrerId,
      amount: rewardPoints,
      type: TransactionType.REFERRAL_REWARD,
      source: 'referral',
      description: `Referral reward for ${rewardPercent}% of referred user's withdrawal`,
      referenceId: referral.id,
    });

    await this.notificationsService.trigger(referral.referrerId, {
      type: NotificationType.REFERRAL_REWARD,
      title: 'Referral Reward Earned!',
      message: `You earned ${rewardPoints} points from your referral!`,
      relatedEntityId: referral.id,
      relatedEntityType: 'referral',
    });
  }

  /**
   * Award sign-up referral bonus (given when referred user verifies email).
   */
  async processSignupBonus(referredUserId: string): Promise<void> {
    const referral = await this.prisma.referral.findUnique({
      where: { referredId: referredUserId },
    });

    if (!referral) return;

    const bonusPoints = await this.settingsService.getReferralBonusPoints();
    if (bonusPoints <= 0) return;

    // Credit both users with sign-up bonus
    await this.walletService.credit({
      userId: referral.referrerId,
      amount: bonusPoints,
      type: TransactionType.REFERRAL_REWARD,
      source: 'referral_signup',
      description: 'Referral sign-up bonus',
      referenceId: referral.id,
    });
  }
}
