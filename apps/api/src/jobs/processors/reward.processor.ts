import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { WalletService } from '../../wallet/wallet.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { PrismaService } from '../../prisma/prisma.service';
import { TransactionType, NotificationType, OfferCompletionStatus } from '@prisma/client';
import { QUEUES } from '../queues.constants';

export interface RewardJobData {
  completionId: string;
  userId: string;
  offerId: string;
  rewardPoints: number;
  offerTitle: string;
}

@Processor(QUEUES.REWARD_PROCESSING)
export class RewardProcessor extends WorkerHost {
  private readonly logger = new Logger(RewardProcessor.name);

  constructor(
    private walletService: WalletService,
    private notificationsService: NotificationsService,
    private prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<RewardJobData>): Promise<void> {
    const { completionId, userId, offerId, rewardPoints, offerTitle } = job.data;
    this.logger.log(`Processing reward job for completion ${completionId}`);

    try {
      // Check if already completed to prevent double-crediting on job retry
      const existing = await this.prisma.offerCompletion.findUnique({
        where: { id: completionId },
      });

      if (!existing) {
        this.logger.warn(`Completion ${completionId} not found; skipping`);
        return;
      }

      if (existing.status === OfferCompletionStatus.COMPLETED) {
        this.logger.warn(`Reward job for completion ${completionId} already completed; skipping credit`);
        return;
      }

      // Update completion status to COMPLETED
      await this.prisma.offerCompletion.update({
        where: { id: completionId },
        data: {
          status: OfferCompletionStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      // Credit wallet
      await this.walletService.credit({
        userId,
        amount: rewardPoints,
        type: TransactionType.OFFER_REWARD,
        source: 'offer',
        description: `Reward for completing: ${offerTitle}`,
        referenceId: completionId,
      });

      // Increment offer completion count
      await this.prisma.offer.update({
        where: { id: offerId },
        data: { completionCount: { increment: 1 } },
      });

      // Send notification with offer details
      await this.notificationsService.trigger(userId, {
        type: NotificationType.REWARD_ADDED,
        title: `🎉 تم احتساب العرض: ${offerTitle}`,
        message: `تم احتساب عرض "${offerTitle}" بنجاح! حصلت على +${rewardPoints.toLocaleString()} نقطة ($${(rewardPoints / 1000).toFixed(2)} USD).`,
        relatedEntityId: completionId,
        relatedEntityType: 'offerCompletion',
        link: '/wallet',
      });

      this.logger.log(`Reward processed successfully for completion ${completionId}`);
    } catch (err) {
      this.logger.error(`Failed to process reward for completion ${completionId}: ${(err as Error).message}`);
      
      // Mark completion as under review on failure
      await this.prisma.offerCompletion.update({
        where: { id: completionId },
        data: { status: OfferCompletionStatus.UNDER_REVIEW },
      }).catch(() => {});

      throw err;
    }
  }
}
