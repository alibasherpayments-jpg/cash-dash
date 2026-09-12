import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  Headers,
  BadRequestException,
  Logger,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { ProviderRegistry } from '../offers/providers/offer-providers';
import { Public } from '../common/decorators/public.decorator';
import { WalletService } from '../wallet/wallet.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TransactionType, NotificationType, OfferCompletionStatus, OfferCategory } from '@prisma/client';
import { Request, Response } from 'express';

@ApiTags('webhooks')
@Public()
@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private prisma: PrismaService,
    private providerRegistry: ProviderRegistry,
    private walletService: WalletService,
    private notificationsService: NotificationsService,
  ) {}

  @Get(['providers/:providerId', 'postback/:providerId'])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive GET postback from offer provider' })
  async handleGetPostback(
    @Param('providerId') providerId: string,
    @Query() query: Record<string, unknown>,
    @Headers('x-signature') signature = '',
    @Headers('x-event-id') eventId = '',
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.processPostback(providerId, query, signature, eventId);
    return this.sendResponse(result, req, res);
  }

  @Post(['providers/:providerId', 'postback/:providerId'])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive POST webhook/postback from offer provider' })
  async handlePostPostback(
    @Param('providerId') providerId: string,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Headers('x-signature') signature = '',
    @Headers('x-event-id') eventId = '',
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const combined = { ...query, ...(typeof body === 'object' && body !== null ? body : {}) };
    const result = await this.processPostback(providerId, combined, signature, eventId);
    return this.sendResponse(result, req, res);
  }

  private async processPostback(
    providerIdentifier: string,
    payload: Record<string, unknown>,
    signatureHeader = '',
    eventIdHeader = '',
  ) {
    // 1. Look up provider by slug OR id
    const providerRecord = await this.prisma.offerProvider.findFirst({
      where: {
        OR: [{ id: providerIdentifier }, { slug: providerIdentifier }],
      },
    });

    if (!providerRecord || !providerRecord.isActive) {
      this.logger.warn(`Unknown or inactive provider: ${providerIdentifier}`);
      throw new BadRequestException('Unknown or inactive provider');
    }

    // 2. Extract standard parameters
    // Taskwall sends: userid | CPALead/ClickWall send: sub_id, subid, user_id
    const userId = String(
      payload['userid'] ??
        payload['sub_id'] ??
        payload['subid'] ??
        payload['user_id'] ??
        payload['userId'] ??
        payload['uid'] ??
        '',
    ).trim();

    const externalTxId = String(
      payload['tx_id'] ??
        payload['transaction_id'] ??
        payload['lead_id'] ??
        payload['trans_id'] ??
        payload['click_id'] ??
        eventIdHeader ??
        `${providerRecord.slug}-${Date.now()}`,
    ).trim();

    // Reward points calculation (1,000 pts = $1.00 USD)
    // Taskwall sends: user_amount (virtual currency) AND payout (USD)
    // We prefer user_amount if present (it's already in the app's virtual currency unit)
    // If not, we fall back to payout * 1000 (USD to points)
    let rewardPoints = 0;
    if (payload['points'] !== undefined && payload['points'] !== '') {
      rewardPoints = parseInt(String(payload['points']), 10);
    } else if (payload['user_amount'] !== undefined && payload['user_amount'] !== '') {
      // Taskwall's user_amount: e.g. 28.0 = 28 virtual currency units
      // We interpret each unit as 1 point (set your Taskwall virtual currency rate to match)
      const ua = parseFloat(String(payload['user_amount']));
      if (!isNaN(ua) && ua > 0) rewardPoints = Math.round(ua);
    } else if (payload['virtual_currency'] !== undefined && payload['virtual_currency'] !== '') {
      rewardPoints = parseInt(String(payload['virtual_currency']), 10);
    } else if (payload['reward'] !== undefined && payload['reward'] !== '') {
      rewardPoints = parseInt(String(payload['reward']), 10);
    } else if (payload['amount'] !== undefined && payload['amount'] !== '') {
      rewardPoints = parseInt(String(payload['amount']), 10);
    } else if (payload['payout'] !== undefined && payload['payout'] !== '') {
      // payout is in USD — convert at rate 1,000 pts = $1.00
      const payoutUsd = parseFloat(String(payload['payout']));
      if (!isNaN(payoutUsd) && payoutUsd > 0) {
        rewardPoints = Math.round(payoutUsd * 1000);
      }
    }

    const offerExternalId = String(
      payload['offer_id'] ??
        payload['campaign_id'] ??
        payload['task_id'] ??
        payload['lead_id'] ??
        'offerwall-task',
    ).trim();

    const offerTitle = String(
      payload['offer_name'] ??
        payload['task_title'] ??
        payload['campaign_name'] ??
        `${providerRecord.name} Task #${offerExternalId}`,
    ).trim();

    const signature = String(
      signatureHeader ||
        payload['signature'] ||
        payload['hash'] ||
        payload['password'] ||
        payload['secret'] ||
        '',
    ).trim();

    // 3. Signature / Secret Validation (if configured)
    const providerImpl = this.providerRegistry.getProvider(providerRecord.slug);
    if (providerImpl && providerRecord.webhookSecret && signature) {
      const valid = providerImpl.validateWebhook(payload, signature, providerRecord.webhookSecret);
      if (!valid) {
        this.logger.warn(`Invalid signature from provider ${providerRecord.slug}`);
        throw new BadRequestException('Invalid signature');
      }
    }

    // 4. Idempotency Check (prevent double-crediting)
    const existingCompletion = await this.prisma.offerCompletion.findFirst({
      where: {
        providerId: providerRecord.id,
        externalTxId,
        status: OfferCompletionStatus.COMPLETED,
      },
    });

    if (existingCompletion) {
      this.logger.log(`Transaction ${externalTxId} for ${providerRecord.slug} already credited; returning idempotent OK`);
      return { success: true, message: 'Already processed', credited: false, points: 0, txId: externalTxId };
    }

    // 5. Verify User Exists
    if (!userId) {
      throw new BadRequestException('Missing user identifier (sub_id / user_id)');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: userId }, { username: userId }],
      },
    });

    if (!user) {
      this.logger.warn(`User not found for postback: ${userId}`);
      throw new BadRequestException(`User not found: ${userId}`);
    }

    if (rewardPoints <= 0) {
      throw new BadRequestException('Reward points must be greater than 0');
    }

    // 6. Find or dynamically create Offer record
    let offer = await this.prisma.offer.findFirst({
      where: {
        providerId: providerRecord.id,
        externalId: offerExternalId,
      },
    });

    if (!offer) {
      const category =
        providerRecord.slug === 'clickwall'
          ? OfferCategory.OTHER
          : providerRecord.slug === 'taskwall'
          ? OfferCategory.SURVEYS
          : OfferCategory.APPS;

      offer = await this.prisma.offer.create({
        data: {
          providerId: providerRecord.id,
          externalId: offerExternalId,
          title: offerTitle,
          description: `Completed on ${providerRecord.name} offerwall`,
          category: category as any,
          rewardPoints,
          status: 'ACTIVE',
        },
      });

      await this.prisma.offerProvider.update({
        where: { id: providerRecord.id },
        data: { offersCount: { increment: 1 } },
      });
    }

    // 7. Create Completion record with status COMPLETED
    const completion = await this.prisma.offerCompletion.create({
      data: {
        userId: user.id,
        offerId: offer.id,
        providerId: providerRecord.id,
        externalTxId,
        rewardPoints,
        status: OfferCompletionStatus.COMPLETED,
        startedAt: new Date(),
        completedAt: new Date(),
        metadata: payload as object,
      },
    });

    // 8. Atomic Credit to Wallet & Double-Entry Ledger
    await this.walletService.credit({
      userId: user.id,
      amount: rewardPoints,
      type: TransactionType.OFFER_REWARD,
      source: `offerwall:${providerRecord.slug}`,
      description: `Reward from ${providerRecord.name}: ${offer.title}`,
      referenceId: completion.id,
    });

    // 9. Send Real-time Notification
    await this.notificationsService
      .trigger(user.id, {
        type: NotificationType.REWARD_ADDED,
        title: '🎉 Offer Reward Credited!',
        message: `You earned +${rewardPoints.toLocaleString()} points ($${(rewardPoints / 1000).toFixed(2)} USD) from ${providerRecord.name}!`,
        relatedEntityId: completion.id,
        relatedEntityType: 'offerCompletion',
      })
      .catch((err) => {
        this.logger.warn(`Failed to trigger notification: ${err.message}`);
      });

    // 10. Record Webhook Event & Update Provider LastWebhookAt
    await this.prisma.providerWebhookEvent.upsert({
      where: {
        providerId_eventId: {
          providerId: providerRecord.id,
          eventId: externalTxId,
        },
      },
      create: {
        providerId: providerRecord.id,
        eventId: externalTxId,
        payload: payload as object,
        signature,
        status: 'processed',
        processedAt: new Date(),
      },
      update: {
        status: 'processed',
        processedAt: new Date(),
      },
    });

    await this.prisma.offerProvider.update({
      where: { id: providerRecord.id },
      data: { lastWebhookAt: new Date() },
    });

    this.logger.log(
      `Successfully credited ${rewardPoints} pts to user ${user.username} (${user.id}) via ${providerRecord.name} [Tx: ${externalTxId}]`,
    );

    return {
      success: true,
      credited: true,
      points: rewardPoints,
      userId: user.id,
      username: user.username,
      txId: externalTxId,
      provider: providerRecord.name,
    };
  }

  private sendResponse(result: any, req: Request, res: Response) {
    const isJson =
      req.query?.response_format === 'json' ||
      req.headers?.accept?.includes('application/json') ||
      req.headers?.['content-type']?.includes('application/json');

    if (isJson) {
      return res.status(HttpStatus.OK).json(result);
    }
    return res.status(HttpStatus.OK).send('1');
  }
}
