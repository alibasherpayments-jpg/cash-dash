import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { OffersService } from '../offers/offers.service';
import { WithdrawalsService } from '../withdrawals/withdrawals.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { SettingsService } from '../settings/settings.service';
import { FraudService } from '../fraud/fraud.service';
import {
  AuditAction,
  TransactionType,
  TransactionDirection,
  UserStatus,
  OfferStatus,
  OfferCategory,
  Prisma,
} from '@prisma/client';
import {
  AdminAdjustBalanceDto,
  AdminUpdateUserStatusDto,
  AdminBroadcastNotificationDto,
  CreateOfferProviderDto,
  UpdateOfferProviderDto,
} from './dto/admin.dto';
import { CreateOfferDto, UpdateOfferDto } from '../offers/dto/offers.dto';
import {
  CreateWithdrawalMethodDto,
  CreateWithdrawalRequirementDto,
  UpdateWithdrawalStatusDto,
  ListWithdrawalsQueryDto,
  BatchUpdateWithdrawalStatusDto,
} from '../withdrawals/dto/withdrawals.dto';
import { getPaginationParams, paginate } from '../common/dto/pagination.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
    private offersService: OffersService,
    private withdrawalsService: WithdrawalsService,
    private notificationsService: NotificationsService,
    private auditService: AuditService,
    private settingsService: SettingsService,
    private fraudService: FraudService,
  ) {}

  // ─── Dashboard Stats ─────────────────────────────────────────────────────

  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      totalWithdrawals,
      pendingWithdrawals,
      totalOffers,
      totalCompletions,
      recentUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.withdrawalRequest.count(),
      this.prisma.withdrawalRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.offer.count({ where: { status: { in: ['ACTIVE', 'FEATURED'] } } }),
      this.prisma.offerCompletion.count({ where: { status: 'COMPLETED' } }),
      this.prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: { id: true, username: true, email: true, status: true, createdAt: true },
      }),
    ]);

    // Total points in circulation
    const walletAgg = await this.prisma.wallet.aggregate({
      _sum: { availablePoints: true, totalEarned: true, totalWithdrawn: true },
    });

    return {
      users: { total: totalUsers, active: activeUsers },
      withdrawals: { total: totalWithdrawals, pending: pendingWithdrawals },
      offers: { active: totalOffers, completions: totalCompletions },
      points: {
        inCirculation: walletAgg._sum.availablePoints ?? 0,
        totalEarned: walletAgg._sum.totalEarned ?? 0,
        totalWithdrawn: walletAgg._sum.totalWithdrawn ?? 0,
      },
      recentUsers,
    };
  }

  // ─── Users ──────────────────────────────────────────────────────────────

  async listUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    role?: string;
  }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const { take, skip } = getPaginationParams(page, limit);

    const where: Prisma.UserWhereInput = {
      ...(params.status && { status: params.status as UserStatus }),
      ...(params.role && { role: params.role as 'USER' | 'ADMIN' | 'SUPPORT' }),
      ...(params.search && {
        OR: [
          { username: { contains: params.search, mode: 'insensitive' } },
          { email: { contains: params.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          wallet: { select: { availablePoints: true, totalEarned: true } },
          profile: { select: { avatarUrl: true, country: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.user.count({ where }),
    ]);

    return paginate(users, total, page, take);
  }

  async getUserDetail(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        wallet: true,
        riskAssessment: true,
        userStreak: true,
        _count: {
          select: {
            offerCompletions: true,
            withdrawalRequests: true,
            referralsMade: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash: _ph, ...safeUser } = user;
    return safeUser;
  }

  async updateUserStatus(
    userId: string,
    dto: AdminUpdateUserStatusDto,
    adminId: string,
    ipAddress?: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.update({
      where: { id: userId },
      data: { status: dto.status },
    });

    const action =
      dto.status === UserStatus.SUSPENDED
        ? AuditAction.USER_SUSPENDED
        : dto.status === UserStatus.ACTIVE
        ? AuditAction.USER_UNSUSPENDED
        : AuditAction.USER_VERIFIED;

    await this.auditService.log({
      adminId,
      action,
      entityType: 'User',
      entityId: userId,
      previousValue: { status: user.status },
      newValue: { status: dto.status, reason: dto.reason },
      ipAddress,
    });
  }

  async adjustBalance(userId: string, dto: AdminAdjustBalanceDto, adminId: string, ipAddress?: string) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');

    if (dto.direction === TransactionDirection.CREDIT) {
      await this.walletService.credit({
        userId,
        amount: dto.points,
        type: TransactionType.ADMIN_ADJUSTMENT,
        source: 'admin',
        description: `Admin adjustment: ${dto.reason}`,
        referenceId: adminId,
      });
    } else {
      await this.walletService.debit({
        userId,
        amount: dto.points,
        type: TransactionType.ADMIN_ADJUSTMENT,
        source: 'admin',
        description: `Admin adjustment: ${dto.reason}`,
        referenceId: adminId,
      });
    }

    await this.auditService.log({
      adminId,
      action: AuditAction.BALANCE_ADJUSTED,
      entityType: 'Wallet',
      entityId: wallet.id,
      previousValue: { availablePoints: wallet.availablePoints },
      newValue: { adjustment: `${dto.direction} ${dto.points}`, reason: dto.reason },
      ipAddress,
    });
  }

  async getUserNotes(userId: string) {
    return this.prisma.adminNote.findMany({
      where: { targetId: userId },
      include: { author: { select: { username: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addUserNote(userId: string, adminId: string, content: string) {
    return this.prisma.adminNote.create({
      data: { targetId: userId, authorId: adminId, content },
    });
  }

  async getUserRisk(userId: string) {
    return this.fraudService.getRiskAssessment(userId);
  }

  async deleteUser(userId: string, adminId: string, ipAddress?: string) {
    if (userId === adminId) {
      throw new BadRequestException('You cannot delete your own administrator account.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'ADMIN') {
      throw new BadRequestException('Administrator accounts cannot be deleted.');
    }

    await this.prisma.$transaction(async (tx) => {
      // 1. Unlink referrals where this user is referredBy
      await tx.user.updateMany({
        where: { referredById: userId },
        data: { referredById: null },
      });

      // 2. Delete referrals
      await tx.referral.deleteMany({
        where: { OR: [{ referrerId: userId }, { referredId: userId }] },
      });

      // 3. Delete admin notes on this user or authored by this user
      await tx.adminNote.deleteMany({
        where: { OR: [{ targetId: userId }, { authorId: userId }] },
      });

      // 4. Delete support tickets & messages
      const tickets = await tx.supportTicket.findMany({
        where: { userId },
        select: { id: true },
      });
      if (tickets.length > 0) {
        await tx.supportMessage.deleteMany({
          where: { ticketId: { in: tickets.map((t) => t.id) } },
        });
        await tx.supportTicket.deleteMany({
          where: { userId },
        });
      }
      await tx.supportMessage.deleteMany({
        where: { authorId: userId },
      });

      // 5. Delete withdrawal requests & status histories
      const withdrawals = await tx.withdrawalRequest.findMany({
        where: { userId },
        select: { id: true },
      });
      if (withdrawals.length > 0) {
        await tx.withdrawalStatusHistory.deleteMany({
          where: { withdrawalId: { in: withdrawals.map((w) => w.id) } },
        });
        await tx.withdrawalRequest.deleteMany({
          where: { userId },
        });
      }
      await tx.withdrawalStatusHistory.deleteMany({
        where: { changedById: userId },
      });

      // 6. Delete offer completions and clicks
      await tx.offerCompletion.deleteMany({
        where: { userId },
      });
      await tx.offerClick.deleteMany({
        where: { userId },
      });

      // 7. Delete fraud signals & risk assessment
      await tx.fraudSignal.deleteMany({
        where: { userId },
      });
      await tx.riskAssessment.deleteMany({
        where: { userId },
      });

      // 8. Delete user achievements & streak
      await tx.userAchievement.deleteMany({
        where: { userId },
      });
      await tx.userStreak.deleteMany({
        where: { userId },
      });

      // 9. Delete ledger transactions
      if (user.wallet) {
        await tx.ledgerTransaction.deleteMany({
          where: { walletId: user.wallet.id },
        });
      }
      await tx.ledgerTransaction.deleteMany({
        where: { userId },
      });

      // 10. Delete sessions, notifications, profile, wallet, and finally user
      await tx.session.deleteMany({ where: { userId } });
      await tx.notification.deleteMany({ where: { userId } });
      await tx.notificationPreference.deleteMany({ where: { userId } });
      await tx.leaderboardSnapshot.deleteMany({ where: { userId } });
      await tx.profile.deleteMany({ where: { userId } });
      await tx.wallet.deleteMany({ where: { userId } });

      // Delete the user record
      await tx.user.delete({
        where: { id: userId },
      });
    });

    // Write audit log
    await this.auditService.log({
      adminId,
      action: AuditAction.USER_DELETED,
      entityType: 'User',
      entityId: userId,
      previousValue: { username: user.username, email: user.email },
      metadata: { reason: 'Permanently deleted by administrator' },
      ipAddress,
    });

    return { message: `User @${user.username} (${user.email}) deleted successfully.` };
  }

  // ─── Offers ──────────────────────────────────────────────────────────────

  async createOffer(dto: CreateOfferDto, adminId: string, ipAddress?: string) {
    const offer = await this.offersService.createOffer(dto);
    await this.auditService.log({
      adminId,
      action: AuditAction.OFFER_CREATED,
      entityType: 'Offer',
      entityId: offer.id,
      newValue: { title: offer.title },
      ipAddress,
    });
    return offer;
  }

  async updateOffer(id: string, dto: UpdateOfferDto, adminId: string, ipAddress?: string) {
    const offer = await this.offersService.updateOffer(id, dto);
    await this.auditService.log({
      adminId,
      action: AuditAction.OFFER_UPDATED,
      entityType: 'Offer',
      entityId: id,
      newValue: dto as Record<string, unknown>,
      ipAddress,
    });
    return offer;
  }

  async deleteOffer(id: string, adminId: string, ipAddress?: string) {
    await this.offersService.deleteOffer(id);
    await this.auditService.log({
      adminId,
      action: AuditAction.OFFER_DELETED,
      entityType: 'Offer',
      entityId: id,
      ipAddress,
    });
  }

  async listOffers(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: OfferStatus;
    category?: OfferCategory;
  }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 50;
    const { take, skip } = getPaginationParams(page, limit);

    const where: Prisma.OfferWhereInput = {
      ...(params.status && { status: params.status }),
      ...(params.category && { category: params.category }),
      ...(params.search && {
        OR: [
          { title: { contains: params.search, mode: 'insensitive' } },
          { description: { contains: params.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [offers, total] = await Promise.all([
      this.prisma.offer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
        include: { provider: { select: { id: true, name: true, slug: true } } },
      }),
      this.prisma.offer.count({ where }),
    ]);

    return paginate(offers, total, page, take);
  }

  async getOffer(id: string) {
    return this.offersService.getOfferById(id);
  }

  // ─── Providers ───────────────────────────────────────────────────────────

  async listProviders() {
    return this.prisma.offerProvider.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getProvider(id: string) {
    const provider = await this.prisma.offerProvider.findUnique({
      where: { id },
      include: { _count: { select: { offers: true, webhookEvents: true } } },
    });
    if (!provider) throw new NotFoundException('Provider not found');
    return provider;
  }

  async createProvider(dto: CreateOfferProviderDto, adminId: string, ipAddress?: string) {
    const slug = dto.slug.toLowerCase().trim();
    const existing = await this.prisma.offerProvider.findUnique({
      where: { slug },
    });
    if (existing) throw new BadRequestException(`Provider with slug '${slug}' already exists`);

    const provider = await this.prisma.offerProvider.create({
      data: {
        name: dto.name,
        type: dto.type ?? 'offerwall',
        slug,
        logoUrl: dto.logoUrl,
        apiKeyMasked: dto.apiKeyMasked,
        webhookSecret: dto.webhookSecret ?? `cd_wh_${Math.random().toString(36).substring(2, 12)}`,
        postbackUrl: dto.postbackUrl ?? `http://localhost:3001/api/v1/webhooks/providers/${slug}`,
        isActive: dto.isActive ?? true,
      },
    });

    await this.auditService.log({
      adminId,
      action: AuditAction.PROVIDER_UPDATED,
      entityType: 'OfferProvider',
      entityId: provider.id,
      newValue: { name: provider.name, slug: provider.slug },
      ipAddress,
    });

    return provider;
  }

  async updateProvider(id: string, data: Record<string, unknown>, adminId: string, ipAddress?: string) {
    const provider = await this.prisma.offerProvider.findUnique({ where: { id } });
    if (!provider) throw new NotFoundException('Provider not found');

    // Never update webhookSecret through this endpoint (security)
    const { webhookSecret: _ws, ...safeData } = data;

    const updated = await this.prisma.offerProvider.update({
      where: { id },
      data: safeData as Prisma.OfferProviderUpdateInput,
    });

    await this.auditService.log({
      adminId,
      action: AuditAction.PROVIDER_UPDATED,
      entityType: 'OfferProvider',
      entityId: id,
      previousValue: { name: provider.name, isActive: provider.isActive },
      newValue: safeData,
      ipAddress,
    });

    return updated;
  }

  async deleteProvider(id: string, adminId: string, ipAddress?: string) {
    const provider = await this.prisma.offerProvider.findUnique({ where: { id } });
    if (!provider) throw new NotFoundException('Provider not found');

    await this.prisma.offerProvider.delete({ where: { id } });

    await this.auditService.log({
      adminId,
      action: AuditAction.PROVIDER_UPDATED,
      entityType: 'OfferProvider',
      entityId: id,
      previousValue: { name: provider.name },
      ipAddress,
    });
  }

  // ─── Withdrawals ─────────────────────────────────────────────────────────

  async listWithdrawals(query: ListWithdrawalsQueryDto) {
    return this.withdrawalsService.listWithdrawals(query);
  }

  async getWithdrawal(id: string) {
    const withdrawal = await this.prisma.withdrawalRequest.findUnique({
      where: { id },
      include: {
        method: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            status: true,
            profile: { select: { country: true, avatarUrl: true } },
            createdAt: true,
            riskAssessment: true,
          },
        },
      },
    });

    if (!withdrawal) throw new NotFoundException('Withdrawal not found');

    const [wallet, transactions, completions] = await Promise.all([
      this.prisma.wallet.findUnique({
        where: { userId: withdrawal.userId },
      }),
      this.prisma.ledgerTransaction.findMany({
        where: { userId: withdrawal.userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.prisma.offerCompletion.findMany({
        where: { userId: withdrawal.userId },
        include: {
          offer: {
            select: {
              title: true,
              category: true,
              provider: { select: { name: true, slug: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
    ]);

    const breakdown = {
      totalEarned: wallet?.totalEarned ?? 0,
      availablePoints: wallet?.availablePoints ?? 0,
      totalWithdrawn: wallet?.totalWithdrawn ?? 0,
      pendingPoints: wallet?.pendingPoints ?? 0,
      fromOffers: 0,
      fromSurveys: 0,
      fromReferrals: 0,
      fromBonuses: 0,
      fromAdjustments: 0,
    };

    for (const tx of transactions) {
      if (tx.direction === TransactionDirection.CREDIT) {
        if (tx.type === TransactionType.OFFER_REWARD) breakdown.fromOffers += tx.amount;
        else if (tx.type === TransactionType.SURVEY_REWARD) breakdown.fromSurveys += tx.amount;
        else if (tx.type === TransactionType.REFERRAL_REWARD) breakdown.fromReferrals += tx.amount;
        else if (tx.type === TransactionType.DAILY_BONUS || tx.type === TransactionType.PROMOTIONAL_BONUS) breakdown.fromBonuses += tx.amount;
        else if (tx.type === TransactionType.ADMIN_ADJUSTMENT) breakdown.fromAdjustments += tx.amount;
      }
    }

    return {
      ...withdrawal,
      wallet,
      transactions,
      completions,
      pointsBreakdown: breakdown,
    };
  }

  async updateWithdrawalStatus(id: string, dto: UpdateWithdrawalStatusDto, adminId: string, ipAddress?: string) {
    return this.withdrawalsService.adminUpdateWithdrawalStatus(id, dto, adminId, ipAddress);
  }

  async batchUpdateWithdrawalStatus(dto: BatchUpdateWithdrawalStatusDto, adminId: string, ipAddress?: string) {
    return this.withdrawalsService.adminBatchUpdateWithdrawalStatus(dto, adminId, ipAddress);
  }

  // ─── Withdrawal Methods ──────────────────────────────────────────────────

  async listWithdrawalMethods() {
    return this.withdrawalsService.listMethods(false);
  }

  async createWithdrawalMethod(dto: CreateWithdrawalMethodDto, adminId: string, ipAddress?: string) {
    const method = await this.withdrawalsService.createMethod(dto);
    await this.auditService.log({
      adminId,
      action: AuditAction.WITHDRAWAL_METHOD_CREATED,
      entityType: 'WithdrawalMethod',
      entityId: method.id,
      newValue: { name: method.name },
      ipAddress,
    });
    return method;
  }

  async updateWithdrawalMethod(
    id: string,
    dto: Partial<CreateWithdrawalMethodDto>,
    adminId: string,
    ipAddress?: string,
  ) {
    const method = await this.withdrawalsService.updateMethod(id, dto);
    await this.auditService.log({
      adminId,
      action: AuditAction.WITHDRAWAL_METHOD_UPDATED,
      entityType: 'WithdrawalMethod',
      entityId: id,
      newValue: dto as Record<string, unknown>,
      ipAddress,
    });
    return method;
  }

  async deleteWithdrawalMethod(id: string, adminId: string, ipAddress?: string) {
    await this.withdrawalsService.deleteMethod(id);
    await this.auditService.log({
      adminId,
      action: AuditAction.WITHDRAWAL_METHOD_DELETED,
      entityType: 'WithdrawalMethod',
      entityId: id,
      ipAddress,
    });
  }

  async addWithdrawalRequirement(methodId: string, dto: CreateWithdrawalRequirementDto) {
    return this.withdrawalsService.addRequirement(methodId, dto);
  }

  async deleteWithdrawalRequirement(requirementId: string) {
    return this.withdrawalsService.deleteRequirement(requirementId);
  }

  // ─── Notifications ───────────────────────────────────────────────────────

  async broadcastNotification(dto: AdminBroadcastNotificationDto, adminId: string, ipAddress?: string) {
    if (dto.userIds && dto.userIds.length > 0) {
      await this.notificationsService.broadcastToUsers(dto.userIds, {
        type: dto.type,
        title: dto.title,
        message: dto.message,
      });
    } else {
      await this.notificationsService.broadcastToAll({
        type: dto.type,
        title: dto.title,
        message: dto.message,
      });
    }

    await this.auditService.log({
      adminId,
      action: AuditAction.NOTIFICATION_SENT,
      entityType: 'Notification',
      newValue: { title: dto.title, userCount: dto.userIds?.length ?? 'all' },
      ipAddress,
    });
  }

  // ─── Settings ────────────────────────────────────────────────────────────

  async getAllSettings() {
    return this.settingsService.getAllSettings();
  }

  async updateSetting(key: string, value: string, adminId: string, ipAddress?: string) {
    const prev = await this.settingsService.get(key);
    await this.settingsService.set(key, value);

    await this.auditService.log({
      adminId,
      action: AuditAction.SETTINGS_UPDATED,
      entityType: 'SystemSetting',
      entityId: key,
      previousValue: { value: prev },
      newValue: { value },
      ipAddress,
    });
  }

  async batchUpdateSettings(settings: Record<string, any>, adminId: string, ipAddress?: string) {
    for (const [key, value] of Object.entries(settings)) {
      if (value !== undefined && value !== null) {
        await this.updateSetting(key, String(value), adminId, ipAddress);
      }
    }
  }


  // ─── Audit Logs ──────────────────────────────────────────────────────────

  async getAuditLogs(params: {
    page?: number;
    limit?: number;
    action?: AuditAction;
    entityType?: string;
  }) {
    return this.auditService.listLogs(params.page, params.limit, {
      action: params.action,
      entityType: params.entityType,
    });
  }
}
