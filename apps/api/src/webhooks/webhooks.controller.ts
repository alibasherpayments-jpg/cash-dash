import {
  Controller,
  Post,
  Param,
  Body,
  Headers,
  BadRequestException,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { ProviderRegistry } from '../offers/providers/offer-providers';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUES } from '../jobs/jobs.module';
import { Public } from '../common/decorators/public.decorator';
import { ConfigService } from '@nestjs/config';
import { RewardJobData } from '../jobs/processors/reward.processor';

@ApiTags('webhooks')
@Public()
@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private prisma: PrismaService,
    private providerRegistry: ProviderRegistry,
    private configService: ConfigService,
    @InjectQueue(QUEUES.REWARD_PROCESSING) private rewardQueue: Queue<RewardJobData>,
  ) {}

  @Post('providers/:providerId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive webhook event from offer provider' })
  async handleWebhook(
    @Param('providerId') providerDbId: string,
    @Body() payload: Record<string, unknown>,
    @Headers('x-signature') signature = '',
    @Headers('x-event-id') eventId = '',
  ) {
    // Look up the provider in DB
    const providerRecord = await this.prisma.offerProvider.findUnique({
      where: { id: providerDbId },
    });

    if (!providerRecord || !providerRecord.isActive) {
      throw new BadRequestException('Unknown or inactive provider');
    }

    // Validate HMAC signature
    const providerImpl = this.providerRegistry.getProvider(providerRecord.slug);
    if (providerImpl && providerRecord.webhookSecret && signature) {
      const valid = providerImpl.validateWebhook(payload, signature, providerRecord.webhookSecret);
      if (!valid) {
        this.logger.warn(`Invalid webhook signature from provider ${providerRecord.slug}`);
        throw new BadRequestException('Invalid signature');
      }
    }

    // Idempotency: check if we've seen this event before
    const uniqueEventId = eventId || `${providerDbId}-${Date.now()}`;
    const existingEvent = await this.prisma.providerWebhookEvent.findUnique({
      where: { providerId_eventId: { providerId: providerDbId, eventId: uniqueEventId } },
    });

    if (existingEvent && existingEvent.status === 'processed') {
      return { success: true, message: 'Event already processed' };
    }

    // Store webhook event
    const webhookEvent = await this.prisma.providerWebhookEvent.upsert({
      where: { providerId_eventId: { providerId: providerDbId, eventId: uniqueEventId } },
      create: {
        providerId: providerDbId,
        eventId: uniqueEventId,
        payload: payload as object,
        signature,
        status: 'pending',
      },
      update: {},
    });

    // Update last webhook timestamp
    await this.prisma.offerProvider.update({
      where: { id: providerDbId },
      data: { lastWebhookAt: new Date() },
    });

    // Process the completion reward
    try {
      const userId = String(payload['user_id'] ?? payload['userId'] ?? '');
      const externalTxId = String(payload['transaction_id'] ?? payload['txId'] ?? uniqueEventId);
      const offerId = String(payload['offer_id'] ?? payload['offerId'] ?? '');
      const rewardPoints = parseInt(String(payload['reward_points'] ?? payload['points'] ?? '0'), 10);

      if (userId && offerId && rewardPoints > 0) {
        // Find the completion record
        const completion = await this.prisma.offerCompletion.findFirst({
          where: { userId, offerId, status: { in: ['STARTED', 'PENDING'] } },
          include: { offer: true },
        });

        if (completion) {
          // Update external tx id
          await this.prisma.offerCompletion.update({
            where: { id: completion.id },
            data: { externalTxId, status: 'PENDING' },
          });

          // Queue reward processing job
          await this.rewardQueue.add('process-reward', {
            completionId: completion.id,
            userId,
            offerId,
            rewardPoints: completion.rewardPoints,
            offerTitle: completion.offer.title,
          });
        }
      }

      // Mark event as processed
      await this.prisma.providerWebhookEvent.update({
        where: { id: webhookEvent.id },
        data: { status: 'processed', processedAt: new Date() },
      });

      return { success: true, message: 'Webhook processed' };
    } catch (err) {
      await this.prisma.providerWebhookEvent.update({
        where: { id: webhookEvent.id },
        data: { status: 'failed', error: (err as Error).message },
      });
      throw err;
    }
  }
}
