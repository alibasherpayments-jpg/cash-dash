import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true, wallet: true, userStreak: true },
    });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash: _ph, ...safeUser } = user;
    return safeUser;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const profile = await this.prisma.profile.upsert({
      where: { userId },
      update: {
        avatarUrl: dto.avatarUrl,
        country: dto.country,
        bio: dto.bio,
        isLeaderboardVisible: dto.isLeaderboardVisible,
        isProfileVisible: dto.isProfileVisible,
        emailNotifications: dto.emailNotifications,
        pushNotifications: dto.pushNotifications,
      },
      create: {
        userId,
        avatarUrl: dto.avatarUrl,
        country: dto.country,
        bio: dto.bio,
        isLeaderboardVisible: dto.isLeaderboardVisible ?? true,
        isProfileVisible: dto.isProfileVisible ?? true,
        emailNotifications: dto.emailNotifications ?? true,
        pushNotifications: dto.pushNotifications ?? false,
      },
    });
    return profile;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) throw new BadRequestException('Current password is incorrect');

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Revoke all sessions after password change
    await this.prisma.session.deleteMany({ where: { userId } });
  }

  async getStats(userId: string) {
    const [offersCompleted, referrals, streak, wallet] = await Promise.all([
      this.prisma.offerCompletion.count({
        where: { userId, status: 'COMPLETED' },
      }),
      this.prisma.referral.count({ where: { referrerId: userId } }),
      this.prisma.userStreak.findUnique({ where: { userId } }),
      this.prisma.wallet.findUnique({ where: { userId } }),
    ]);

    return {
      offersCompleted,
      totalReferrals: referrals,
      currentStreak: streak?.currentStreak ?? 0,
      longestStreak: streak?.longestStreak ?? 0,
      availablePoints: wallet?.availablePoints ?? 0,
      totalEarned: wallet?.totalEarned ?? 0,
      totalWithdrawn: wallet?.totalWithdrawn ?? 0,
    };
  }

  async findByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: { profile: true },
    });
    if (!user) throw new NotFoundException('User not found');
    if (!user.profile?.isProfileVisible) throw new NotFoundException('Profile is private');
    const { passwordHash: _ph, email, referredById, ...publicUser } = user;
    return publicUser;
  }

  async getNotificationPreferences(userId: string) {
    return this.prisma.notificationPreference.findUnique({ where: { userId } });
  }

  async updateNotificationPreferences(userId: string, prefs: Partial<{
    rewardNotifications: boolean;
    withdrawalNotifications: boolean;
    referralNotifications: boolean;
    promotionalNotifications: boolean;
    systemNotifications: boolean;
    emailRewardNotifications: boolean;
    emailWithdrawalNotifications: boolean;
  }>) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      update: prefs,
      create: { userId, ...prefs },
    });
  }
}
