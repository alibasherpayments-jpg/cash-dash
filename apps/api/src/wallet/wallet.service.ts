import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType, TransactionDirection, TransactionStatus, Prisma } from '@prisma/client';
import { getPaginationParams, paginate } from '../common/dto/pagination.dto';

interface CreditOptions {
  userId: string;
  amount: number; // points
  type: TransactionType;
  source: string;
  description: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
  isPending?: boolean;
}

interface DebitOptions {
  userId: string;
  amount: number; // points
  type: TransactionType;
  source: string;
  description: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(private prisma: PrismaService) {}

  async getWallet(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });
    if (!wallet) throw new NotFoundException('Wallet not found');
    return wallet;
  }

  async getWalletSummary(userId: string, conversionRate = 10000) {
    const wallet = await this.getWallet(userId);
    return {
      availablePoints: wallet.availablePoints,
      pendingPoints: wallet.pendingPoints,
      totalEarned: wallet.totalEarned,
      totalWithdrawn: wallet.totalWithdrawn,
      cashValue: wallet.availablePoints / conversionRate,
    };
  }

  /**
   * Atomically credit a user's wallet and create a ledger entry.
   * Uses Prisma transaction to ensure consistency.
   */
  async credit(opts: CreditOptions): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId: opts.userId } });
      if (!wallet) throw new NotFoundException(`Wallet not found for user: ${opts.userId}`);

      const updateData: Prisma.WalletUpdateInput = opts.isPending
        ? { pendingPoints: { increment: opts.amount } }
        : {
            availablePoints: { increment: opts.amount },
            totalEarned: { increment: opts.amount },
          };

      await tx.wallet.update({
        where: { userId: opts.userId },
        data: updateData,
      });

      await tx.ledgerTransaction.create({
        data: {
          userId: opts.userId,
          walletId: wallet.id,
          type: opts.type,
          direction: TransactionDirection.CREDIT,
          amount: opts.amount,
          status: opts.isPending ? TransactionStatus.PENDING : TransactionStatus.COMPLETED,
          source: opts.source,
          referenceId: opts.referenceId,
          description: opts.description,
          metadata: opts.metadata as Prisma.InputJsonValue,
        },
      });
    });

    this.logger.log(`Credited ${opts.amount} pts to user ${opts.userId} [${opts.type}]`);
  }

  /**
   * Atomically debit a user's wallet and create a ledger entry.
   * Validates sufficient available balance before debiting.
   */
  async debit(opts: DebitOptions): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId: opts.userId } });
      if (!wallet) throw new NotFoundException(`Wallet not found for user: ${opts.userId}`);

      if (wallet.availablePoints < opts.amount) {
        throw new BadRequestException(
          `Insufficient balance. Available: ${wallet.availablePoints}, Required: ${opts.amount}`,
        );
      }

      await tx.wallet.update({
        where: { userId: opts.userId },
        data: {
          availablePoints: { decrement: opts.amount },
          totalWithdrawn: { increment: opts.amount },
        },
      });

      await tx.ledgerTransaction.create({
        data: {
          userId: opts.userId,
          walletId: wallet.id,
          type: opts.type,
          direction: TransactionDirection.DEBIT,
          amount: opts.amount,
          status: TransactionStatus.COMPLETED,
          source: opts.source,
          referenceId: opts.referenceId,
          description: opts.description,
          metadata: opts.metadata as Prisma.InputJsonValue,
        },
      });
    });

    this.logger.log(`Debited ${opts.amount} pts from user ${opts.userId} [${opts.type}]`);
  }

  /**
   * Confirm a pending credit (move from pending to available).
   */
  async confirmPending(userId: string, amount: number, referenceId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new NotFoundException('Wallet not found');

      await tx.wallet.update({
        where: { userId },
        data: {
          pendingPoints: { decrement: amount },
          availablePoints: { increment: amount },
          totalEarned: { increment: amount },
        },
      });

      await tx.ledgerTransaction.updateMany({
        where: {
          userId,
          referenceId,
          status: TransactionStatus.PENDING,
          direction: TransactionDirection.CREDIT,
        },
        data: { status: TransactionStatus.COMPLETED },
      });
    });
  }

  /**
   * Reverse a credit (e.g. when an offer completion is rejected).
   */
  async reverseCredit(userId: string, amount: number, referenceId: string, description: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new NotFoundException('Wallet not found');

      const safeAmount = Math.min(amount, wallet.availablePoints);

      await tx.wallet.update({
        where: { userId },
        data: {
          availablePoints: { decrement: safeAmount },
          totalEarned: { decrement: safeAmount },
        },
      });

      await tx.ledgerTransaction.create({
        data: {
          userId,
          walletId: wallet.id,
          type: TransactionType.ADMIN_ADJUSTMENT,
          direction: TransactionDirection.DEBIT,
          amount: safeAmount,
          status: TransactionStatus.REVERSED,
          source: 'reversal',
          referenceId,
          description,
        },
      });
    });
  }

  async getTransactions(
    userId: string,
    page = 1,
    limit = 20,
    type?: TransactionType,
  ) {
    const { take, skip } = getPaginationParams(page, limit);

    const where: Prisma.LedgerTransactionWhereInput = {
      userId,
      ...(type && { type }),
    };

    const [transactions, total] = await Promise.all([
      this.prisma.ledgerTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.ledgerTransaction.count({ where }),
    ]);

    return paginate(transactions, total, page, take);
  }
}
