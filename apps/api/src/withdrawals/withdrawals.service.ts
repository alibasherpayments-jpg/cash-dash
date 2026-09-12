import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { SettingsService } from '../settings/settings.service';
import { WithdrawalStatus, TransactionType, TransactionDirection, TransactionStatus, AuditAction, NotificationType, Prisma } from '@prisma/client';
import {
  CreateWithdrawalDto,
  CreateWithdrawalMethodDto,
  CreateWithdrawalRequirementDto,
  UpdateWithdrawalStatusDto,
  ListWithdrawalsQueryDto,
} from './dto/withdrawals.dto';
import { getPaginationParams, paginate } from '../common/dto/pagination.dto';

const VALID_TRANSITIONS: Record<WithdrawalStatus, WithdrawalStatus[]> = {
  PENDING: ['PROCESSING', 'REJECTED', 'CANCELLED', 'UNDER_REVIEW'],
  PROCESSING: ['PAID', 'FAILED', 'UNDER_REVIEW'],
  UNDER_REVIEW: ['PROCESSING', 'REJECTED'],
  PAID: ['COMPLETED', 'REFUNDED'],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
  FAILED: ['REFUNDED'],
  REFUNDED: [],
};

@Injectable()
export class WithdrawalsService {
  private readonly logger = new Logger(WithdrawalsService.name);

  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
    private notificationsService: NotificationsService,
    private auditService: AuditService,
    private settingsService: SettingsService,
  ) {}

  // ─── Withdrawal Methods ──────────────────────────────────────────────────────

  async listMethods(activeOnly = true) {
    return this.prisma.withdrawalMethod.findMany({
      where: activeOnly ? { isActive: true, isMaintenanceMode: false } : {},
      include: { requirements: { orderBy: { displayOrder: 'asc' } } },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async getMethod(id: string) {
    const method = await this.prisma.withdrawalMethod.findUnique({
      where: { id },
      include: { requirements: { orderBy: { displayOrder: 'asc' } } },
    });
    if (!method) throw new NotFoundException('Withdrawal method not found');
    return method;
  }

  async createMethod(dto: CreateWithdrawalMethodDto) {
    return this.prisma.withdrawalMethod.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        logoUrl: dto.logoUrl,
        minimumPoints: dto.minimumPoints,
        maximumPoints: dto.maximumPoints,
        feePercent: dto.feePercent ?? 0,
        processingTime: dto.processingTime,
        isActive: dto.isActive ?? true,
        enabledCountries: dto.enabledCountries ?? [],
        displayOrder: dto.displayOrder ?? 0,
      },
      include: { requirements: true },
    });
  }

  async updateMethod(id: string, dto: Partial<CreateWithdrawalMethodDto>) {
    const method = await this.prisma.withdrawalMethod.findUnique({ where: { id } });
    if (!method) throw new NotFoundException('Withdrawal method not found');
    return this.prisma.withdrawalMethod.update({ where: { id }, data: dto });
  }

  async deleteMethod(id: string) {
    const method = await this.prisma.withdrawalMethod.findUnique({ where: { id } });
    if (!method) throw new NotFoundException('Withdrawal method not found');
    await this.prisma.withdrawalMethod.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async addRequirement(methodId: string, dto: CreateWithdrawalRequirementDto) {
    const method = await this.prisma.withdrawalMethod.findUnique({ where: { id: methodId } });
    if (!method) throw new NotFoundException('Withdrawal method not found');

    return this.prisma.withdrawalRequirement.create({
      data: {
        methodId,
        fieldName: dto.fieldName,
        label: dto.label,
        type: dto.type ?? 'TEXT',
        placeholder: dto.placeholder,
        helpText: dto.helpText,
        isRequired: dto.isRequired ?? true,
        validation: dto.validation,
        options: dto.options ?? [],
        displayOrder: dto.displayOrder ?? 0,
      },
    });
  }

  async deleteRequirement(requirementId: string) {
    await this.prisma.withdrawalRequirement.delete({ where: { id: requirementId } });
  }

  // ─── Withdrawal Requests ─────────────────────────────────────────────────────

  async createWithdrawal(userId: string, dto: CreateWithdrawalDto, ipAddress?: string) {
    const method = await this.prisma.withdrawalMethod.findUnique({
      where: { id: dto.methodId },
      include: { requirements: true },
    });
    if (!method) throw new NotFoundException('Withdrawal method not found');
    if (!method.isActive) throw new BadRequestException('This withdrawal method is not available');
    if (method.isMaintenanceMode) throw new BadRequestException('This withdrawal method is under maintenance');

    const conversionRate = await this.settingsService.getConversionRate();

    // Check minimum
    if (dto.points < method.minimumPoints) {
      const minDollar = (method.minimumPoints / conversionRate).toFixed(2);
      throw new BadRequestException(
        `Minimum withdrawal is ${method.minimumPoints} points ($${minDollar})`,
      );
    }

    // Check maximum
    if (method.maximumPoints && dto.points > method.maximumPoints) {
      throw new BadRequestException(`Maximum withdrawal is ${method.maximumPoints} points`);
    }

    // Validate required fields in destination
    for (const req of method.requirements) {
      if (req.isRequired && !dto.destination[req.fieldName]) {
        throw new BadRequestException(`Missing required field: ${req.label}`);
      }
    }

    // Calculate fee & net values
    const feePoints = Math.floor(dto.points * (method.feePercent / 100));
    const netPoints = dto.points - feePoints;
    const cashValue = netPoints / conversionRate;

    // Atomic withdrawal creation + wallet debit + ledger entry in a single transaction
    const withdrawal = await this.prisma.$transaction(async (tx) => {
      // 1. Check wallet balance atomically inside transaction
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new NotFoundException(`Wallet not found for user: ${userId}`);
      if (wallet.availablePoints < dto.points) {
        throw new BadRequestException(
          `Insufficient balance. Available: ${wallet.availablePoints} points`,
        );
      }

      // 2. Decrement wallet available points
      await tx.wallet.update({
        where: { userId },
        data: {
          availablePoints: { decrement: dto.points },
          totalWithdrawn: { increment: dto.points },
        },
      });

      // 3. Create withdrawal request
      const wr = await tx.withdrawalRequest.create({
        data: {
          userId,
          methodId: dto.methodId,
          points: dto.points,
          feePoints,
          netPoints,
          cashValue,
          status: WithdrawalStatus.PENDING,
          destination: dto.destination as Prisma.InputJsonValue,
          ipAddress,
        },
        include: { method: true },
      });

      // 4. Create double-entry ledger transaction
      await tx.ledgerTransaction.create({
        data: {
          userId,
          walletId: wallet.id,
          type: TransactionType.WITHDRAWAL,
          direction: TransactionDirection.DEBIT,
          amount: dto.points,
          status: TransactionStatus.COMPLETED,
          source: 'withdrawal',
          referenceId: wr.id,
          description: `Withdrawal via ${method.name}`,
          metadata: {
            methodName: method.name,
            cashValue,
            netPoints,
          },
        },
      });

      // 5. Create initial status history
      await tx.withdrawalStatusHistory.create({
        data: {
          withdrawalId: wr.id,
          toStatus: WithdrawalStatus.PENDING,
          note: 'Withdrawal request created',
        },
      });

      return wr;
    });

    // Send notification
    await this.notificationsService.trigger(userId, {
      type: NotificationType.WITHDRAWAL_REQUESTED,
      title: 'Withdrawal Requested',
      message: `Your withdrawal of ${netPoints} points ($${cashValue.toFixed(2)}) via ${method.name} is being processed.`,
      relatedEntityId: withdrawal.id,
      relatedEntityType: 'withdrawal',
    });

    return withdrawal;
  }

  async getUserWithdrawals(userId: string, page = 1, limit = 20) {
    const { take, skip } = getPaginationParams(page, limit);
    const [withdrawals, total] = await Promise.all([
      this.prisma.withdrawalRequest.findMany({
        where: { userId },
        include: { method: { select: { name: true, logoUrl: true } } },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.withdrawalRequest.count({ where: { userId } }),
    ]);

    // Mask sensitive destination data
    const masked = withdrawals.map((w) => ({
      ...w,
      destination: this.maskDestination(w.destination as Record<string, string>),
    }));

    return paginate(masked, total, page, take);
  }

  async getWithdrawalById(id: string, userId?: string) {
    const withdrawal = await this.prisma.withdrawalRequest.findUnique({
      where: { id },
      include: {
        method: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!withdrawal) throw new NotFoundException('Withdrawal not found');
    if (userId && withdrawal.userId !== userId) throw new ForbiddenException('Access denied');

    return {
      ...withdrawal,
      destination: userId ? this.maskDestination(withdrawal.destination as Record<string, string>) : withdrawal.destination,
    };
  }

  async cancelWithdrawal(id: string, userId: string) {
    const withdrawal = await this.prisma.withdrawalRequest.findUnique({ where: { id } });
    if (!withdrawal) throw new NotFoundException('Withdrawal not found');
    if (withdrawal.userId !== userId) throw new ForbiddenException('Access denied');
    if (withdrawal.status !== WithdrawalStatus.PENDING) {
      throw new BadRequestException('Only pending withdrawals can be cancelled');
    }

    await this.updateWithdrawalStatus(id, WithdrawalStatus.CANCELLED, userId, 'Cancelled by user');

    // Refund points to wallet
    await this.walletService.credit({
      userId,
      amount: withdrawal.points,
      type: TransactionType.WITHDRAWAL_REVERSAL,
      source: 'withdrawal_reversal',
      description: 'Withdrawal cancellation refund',
      referenceId: id,
    });

    await this.notificationsService.trigger(userId, {
      type: NotificationType.WITHDRAWAL_REJECTED,
      title: 'Withdrawal Cancelled',
      message: `Your withdrawal of ${withdrawal.points} points has been cancelled and refunded.`,
      relatedEntityId: id,
      relatedEntityType: 'withdrawal',
    });
  }

  async adminUpdateWithdrawalStatus(
    withdrawalId: string,
    dto: UpdateWithdrawalStatusDto,
    adminId: string,
    ipAddress?: string,
  ) {
    const withdrawal = await this.prisma.withdrawalRequest.findUnique({
      where: { id: withdrawalId },
      include: { method: true },
    });
    if (!withdrawal) throw new NotFoundException('Withdrawal not found');

    const newStatus = dto.status as WithdrawalStatus;
    const allowed = VALID_TRANSITIONS[withdrawal.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${withdrawal.status} to ${newStatus}`,
      );
    }

    await this.updateWithdrawalStatus(withdrawalId, newStatus, adminId, dto.note, dto.externalTxId);

    // Handle refund for rejection
    if (newStatus === WithdrawalStatus.REJECTED || newStatus === WithdrawalStatus.REFUNDED) {
      await this.walletService.credit({
        userId: withdrawal.userId,
        amount: withdrawal.points,
        type: TransactionType.WITHDRAWAL_REVERSAL,
        source: 'withdrawal_reversal',
        description: `Withdrawal ${newStatus.toLowerCase()} - refund`,
        referenceId: withdrawalId,
      });
    }

    // Determine notification type
    let notifType: NotificationType = NotificationType.WITHDRAWAL_PROCESSING;
    if (newStatus === WithdrawalStatus.PAID || newStatus === WithdrawalStatus.COMPLETED) {
      notifType = NotificationType.WITHDRAWAL_COMPLETED;
    } else if (newStatus === WithdrawalStatus.REJECTED) {
      notifType = NotificationType.WITHDRAWAL_REJECTED;
    }

    await this.notificationsService.trigger(withdrawal.userId, {
      type: notifType,
      title: `Withdrawal ${newStatus}`,
      message: dto.note ?? `Your withdrawal status has been updated to ${newStatus}.`,
      relatedEntityId: withdrawalId,
      relatedEntityType: 'withdrawal',
    });

    // Audit log
    let auditAction: AuditAction = AuditAction.WITHDRAWAL_APPROVED;
    if (newStatus === WithdrawalStatus.REJECTED) {
      auditAction = AuditAction.WITHDRAWAL_REJECTED;
    } else if (newStatus === WithdrawalStatus.PAID || newStatus === WithdrawalStatus.COMPLETED) {
      auditAction = AuditAction.WITHDRAWAL_PAID;
    }

    await this.auditService.log({
      adminId,
      action: auditAction,
      entityType: 'WithdrawalRequest',
      entityId: withdrawalId,
      previousValue: { status: withdrawal.status },
      newValue: { status: newStatus },
      ipAddress,
    });

    return this.getWithdrawalById(withdrawalId);
  }

  async listWithdrawals(query: ListWithdrawalsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { take, skip } = getPaginationParams(page, limit);

    const where: Prisma.WithdrawalRequestWhereInput = {
      ...(query.status && { status: query.status as WithdrawalStatus }),
      ...(query.userId && { userId: query.userId }),
    };

    const [withdrawals, total] = await Promise.all([
      this.prisma.withdrawalRequest.findMany({
        where,
        include: {
          user: { select: { username: true, email: true } },
          method: { select: { name: true, logoUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.withdrawalRequest.count({ where }),
    ]);

    return paginate(withdrawals, total, page, take);
  }

  private async updateWithdrawalStatus(
    withdrawalId: string,
    status: WithdrawalStatus,
    changedById: string,
    note?: string,
    externalTxId?: string,
  ) {
    const withdrawal = await this.prisma.withdrawalRequest.findUnique({ where: { id: withdrawalId } });
    if (!withdrawal) throw new NotFoundException('Withdrawal not found');

    await this.prisma.$transaction([
      this.prisma.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: {
          status,
          ...(externalTxId && { externalTxId }),
          ...(note && { adminNote: note }),
        },
      }),
      this.prisma.withdrawalStatusHistory.create({
        data: {
          withdrawalId,
          fromStatus: withdrawal.status,
          toStatus: status,
          note,
          changedById,
        },
      }),
    ]);
  }

  private maskDestination(destination: Record<string, string>): Record<string, string> {
    const masked: Record<string, string> = {};
    for (const [key, value] of Object.entries(destination)) {
      if (typeof value === 'string' && value.length > 4) {
        // Show first 2 and last 2 chars, mask the middle
        masked[key] = `${value.slice(0, 2)}${'*'.repeat(Math.max(value.length - 4, 2))}${value.slice(-2)}`;
      } else {
        masked[key] = value;
      }
    }
    return masked;
  }
}
