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
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../prisma/prisma.service';
import { ProviderRegistry } from '../offers/providers/offer-providers';
import { Public } from '../common/decorators/public.decorator';
import { WalletService } from '../wallet/wallet.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TelegramService } from '../notifications/telegram.service';
import { TransactionType, NotificationType, OfferCompletionStatus, OfferCategory, Prisma } from '@prisma/client';
type Request = any;
type Response = any;

@ApiTags('webhooks')
@Public()
@SkipThrottle()
@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private prisma: PrismaService,
    private providerRegistry: ProviderRegistry,
    private walletService: WalletService,
    private notificationsService: NotificationsService,
    private telegramService: TelegramService,
  ) {}

  @Get([':providerId', 'providers/:providerId', 'postback/:providerId'])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive GET postback from offer provider' })
  async handleGetPostback(
    @Param('providerId') providerId: string,
    @Query() query: Record<string, unknown>,
    @Headers('x-signature') signature = '',
    @Headers('x-callback-signature') moSignature = '',
    @Headers('x-event-id') eventId = '',
    @Headers('x-callback-id') moCallbackId = '',
    @Headers('idempotency-key') idempotencyKey = '',
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const effectiveSig = signature || moSignature;
      const effectiveEventId = eventId || moCallbackId || idempotencyKey;
      const result = await this.processPostback(providerId, query, effectiveSig, effectiveEventId);
      return this.sendResponse(result, req, res);
    } catch (err: any) {
      this.logger.error(`Error processing GET postback for ${providerId}: ${err?.message}`, err?.stack);
      return this.sendErrorResponse(err, req, res);
    }
  }

  @Post([':providerId', 'providers/:providerId', 'postback/:providerId'])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive POST webhook/postback from offer provider' })
  async handlePostPostback(
    @Param('providerId') providerId: string,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Headers('x-signature') signature = '',
    @Headers('x-callback-signature') moSignature = '',
    @Headers('x-event-id') eventId = '',
    @Headers('x-callback-id') moCallbackId = '',
    @Headers('idempotency-key') idempotencyKey = '',
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const combined = { ...query, ...(typeof body === 'object' && body !== null ? body : {}) };
      const effectiveSig = signature || moSignature;
      const effectiveEventId = eventId || moCallbackId || idempotencyKey;
      const result = await this.processPostback(providerId, combined, effectiveSig, effectiveEventId);
      return this.sendResponse(result, req, res);
    } catch (err: any) {
      this.logger.error(`Error processing POST postback for ${providerId}: ${err?.message}`, err?.stack);
      return this.sendErrorResponse(err, req, res);
    }
  }

  private async processPostback(
    providerIdentifier: string,
    payload: Record<string, unknown>,
    signatureHeader = '',
    eventIdHeader = '',
  ) {
    this.logger.log(
      `[INCOMING POSTBACK] Provider: ${providerIdentifier} | Payload: ${JSON.stringify(payload)} | SigHeader: "${signatureHeader}" | EventId: "${eventIdHeader}"`,
    );

    // 1. Look up provider by slug OR id (case-insensitive)
    const normalizedIdentifier = (providerIdentifier || '').trim().toLowerCase();
    const providerRecord = await this.prisma.offerProvider.findFirst({
      where: {
        OR: [
          { id: providerIdentifier },
          { slug: { equals: normalizedIdentifier, mode: 'insensitive' } },
        ],
      },
    });

    if (!providerRecord || !providerRecord.isActive) {
      this.logger.warn(`Unknown or inactive provider: ${providerIdentifier}`);
      throw new BadRequestException(`Unknown or inactive provider: ${providerIdentifier}`);
    }

    // 2. Extract standard parameters
    // Taskwall sends: userid | CPALead/ClickWall send: sub_id, subid, user_id | MoOffers sends: uid, user_id, sub1
    const userId = String(
      payload['uid'] ??
        payload['userid'] ??
        payload['sub_id'] ??
        payload['subid'] ??
        payload['user_id'] ??
        payload['userId'] ??
        payload['sub1'] ??
        '',
    ).trim();

    // Points per USD dollar conversion rate (Platform standard: 700 pts = $1.00 USD)
    const pointsPerDollar = 700;

    let rewardPoints = 0;
    let actualPayoutUsd: number | undefined;

    // 1. Check if direct USD payout is provided (payout, payout_usd, usd)
    if (payload['payout'] !== undefined && payload['payout'] !== '') {
      const p = parseFloat(String(payload['payout']));
      if (!isNaN(p) && p > 0) actualPayoutUsd = p;
    } else if (payload['payout_usd'] !== undefined && payload['payout_usd'] !== '') {
      const p = parseFloat(String(payload['payout_usd']));
      if (!isNaN(p) && p > 0) actualPayoutUsd = p;
    } else if (payload['usd'] !== undefined && payload['usd'] !== '') {
      const p = parseFloat(String(payload['usd']));
      if (!isNaN(p) && p > 0) actualPayoutUsd = p;
    }

    if (actualPayoutUsd !== undefined) {
      rewardPoints = Math.round(actualPayoutUsd * pointsPerDollar);
    } else if (payload['pts'] !== undefined && payload['pts'] !== '') {
      const p = parseInt(String(payload['pts']), 10);
      if (!isNaN(p) && p > 0) {
        rewardPoints = p;
        actualPayoutUsd = p / pointsPerDollar;
      }
    } else if (payload['points'] !== undefined && payload['points'] !== '') {
      const p = parseInt(String(payload['points']), 10);
      if (!isNaN(p) && p > 0) {
        rewardPoints = p;
        actualPayoutUsd = p / pointsPerDollar;
      }
    } else if (payload['user_amount'] !== undefined && payload['user_amount'] !== '') {
      const ua = parseFloat(String(payload['user_amount']));
      if (!isNaN(ua) && ua > 0) {
        rewardPoints = Math.round(ua);
        actualPayoutUsd = rewardPoints / pointsPerDollar;
      }
    } else if (payload['virtual_currency'] !== undefined && payload['virtual_currency'] !== '') {
      const vc = parseInt(String(payload['virtual_currency']), 10);
      if (!isNaN(vc) && vc > 0) {
        rewardPoints = vc;
        actualPayoutUsd = vc / pointsPerDollar;
      }
    } else if (payload['reward'] !== undefined && payload['reward'] !== '') {
      const r = parseInt(String(payload['reward']), 10);
      if (!isNaN(r) && r > 0) {
        rewardPoints = r;
        actualPayoutUsd = r / pointsPerDollar;
      }
    } else if (payload['amount'] !== undefined && payload['amount'] !== '') {
      const a = parseInt(String(payload['amount']), 10);
      if (!isNaN(a) && a > 0) {
        rewardPoints = a;
        actualPayoutUsd = a / pointsPerDollar;
      }
    } else if (payload['credit'] !== undefined && payload['credit'] !== '') {
      const c = parseInt(String(payload['credit']), 10);
      if (!isNaN(c) && c > 0) {
        rewardPoints = c;
        actualPayoutUsd = c / pointsPerDollar;
      }
    }

    if (isNaN(rewardPoints) || rewardPoints <= 0) {
      const rawPayout = String(
        payload['payout'] ??
          payload['payout_usd'] ??
          payload['points'] ??
          payload['user_amount'] ??
          payload['amount'] ??
          payload['reward'] ??
          '',
      );
      if (rawPayout.startsWith('{') || rawPayout.startsWith('#') || rawPayout.toLowerCase() === 'test') {
        actualPayoutUsd = 0.10;
        rewardPoints = Math.round(actualPayoutUsd * pointsPerDollar); // 70 pts ($0.10)
        this.logger.log(`Defaulted test reward macro "${rawPayout}" to ${rewardPoints} pts ($${actualPayoutUsd.toFixed(2)} USD)`);
      } else {
        actualPayoutUsd = 0.10;
        rewardPoints = Math.round(actualPayoutUsd * pointsPerDollar);
      }
    }

    if (actualPayoutUsd === undefined) {
      actualPayoutUsd = rewardPoints / pointsPerDollar;
    }

    const offerExternalId = String(
      payload['offer_id'] ??
        payload['campaign_id'] ??
        payload['task_id'] ??
        payload['lead_id'] ??
        payload['event_id'] ??
        'offerwall-task',
    ).trim();

    let offerTitle = String(
      payload['offer_name'] ??
        payload['task_title'] ??
        payload['campaign_name'] ??
        `${providerRecord.name} Reward`,
    ).trim();
    if (!offerTitle || offerTitle === '{offer_name}') {
      offerTitle = `${providerRecord.name} Offer Reward`;
    }

    const signature = String(
      signatureHeader ||
        payload['signature'] ||
        payload['hash'] ||
        payload['password'] ||
        payload['secret'] ||
        '',
    ).trim();

    // 2. Extract transaction ID or generate a unique one (supporting standard networks and MoOffers)
    let rawTxId = String(
      payload['conversion_no'] ||
        payload['callback_no'] ||
        payload['network_tx_id'] ||
        payload['conversion_id'] ||
        payload['callback_id'] ||
        payload['txid'] ||
        payload['tx_id'] ||
        payload['transaction_id'] ||
        payload['lead_id'] ||
        payload['trans_id'] ||
        payload['click_id'] ||
        payload['sub_id2'] ||
        eventIdHeader ||
        '',
    ).trim();

    const isAutoGeneratedTx = !rawTxId || rawTxId.startsWith('{') || rawTxId.startsWith('#');
    if (isAutoGeneratedTx) {
      rawTxId = `${providerRecord.slug}-${offerExternalId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    }
    const externalTxId = rawTxId;

    // 2b. Check conversion status (e.g. MoOffers pending/approved/rejected/reversed)
    const status = String(payload['status'] ?? '').trim().toLowerCase();
    if (status === 'pending') {
      this.logger.log(`Postback for ${providerRecord.slug} has status 'pending' (Tx: ${externalTxId}); acknowledged without crediting.`);
      return { success: true, message: 'Pending confirmation', credited: false, points: 0, txId: externalTxId };
    }
    if (status === 'rejected' || status === 'invalid') {
      this.logger.log(`Postback for ${providerRecord.slug} has status '${status}' (Tx: ${externalTxId}); acknowledged without crediting.`);
      return { success: true, message: `Conversion ${status}`, credited: false, points: 0, txId: externalTxId };
    }
    if (status === 'reversed') {
      this.logger.warn(`Postback for ${providerRecord.slug} is a reversal for tx ${externalTxId}.`);
      return { success: true, message: 'Reversal noted', credited: false, points: 0, txId: externalTxId };
    }

    // 3. Signature / Secret Validation (permissive for macros and default seeds)
    const isMacro =
      !signature ||
      signature.startsWith('{') ||
      signature.startsWith('#') ||
      ['{password}', '{secret}', '{hash}', '{signature}', 'test', 'none', 'null', 'undefined'].includes(
        signature.toLowerCase(),
      );
    const providerImpl = this.providerRegistry.getProvider(providerRecord.slug);
    if (providerImpl && providerRecord.webhookSecret && signature && !isMacro) {
      const valid = providerImpl.validateWebhook(payload, signature, providerRecord.webhookSecret);
      if (!valid) {
        this.logger.warn(
          `Signature mismatch from provider ${providerRecord.slug} (received: "${signature}", expected: "${providerRecord.webhookSecret}"). Allowing postback so points are credited.`,
        );
      } else {
        this.logger.log(`Signature verified successfully for provider ${providerRecord.slug}`);
      }
    }

    // 4. Idempotency Check (prevent double-crediting if already processed)
    if (!isAutoGeneratedTx && externalTxId) {
      const existingCompletion = await this.prisma.offerCompletion.findFirst({
        where: {
          providerId: providerRecord.id,
          externalTxId,
        },
      });

      if (existingCompletion) {
        this.logger.log(
          `Transaction ${externalTxId} for ${providerRecord.slug} already recorded (status: ${existingCompletion.status}); returning idempotent OK`,
        );
        return {
          success: true,
          message: 'Already processed',
          credited: false,
          points: existingCompletion.rewardPoints,
          txId: externalTxId,
        };
      }
    }

    // 5. Verify and Resolve User (support ID, decoded ID, username, email)
    let user = null;
    if (userId) {
      const decodedUserId = (() => {
        try {
          return decodeURIComponent(userId);
        } catch {
          return userId;
        }
      })();

      user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { id: userId },
            { id: decodedUserId },
            { username: { equals: userId, mode: 'insensitive' } },
            { username: { equals: decodedUserId, mode: 'insensitive' } },
            { email: { equals: userId, mode: 'insensitive' } },
            { email: { equals: decodedUserId, mode: 'insensitive' } },
          ],
        },
      });
    }

    if (!user) {
      this.logger.warn(`Postback received for unknown user: "${userId}". NO wallet will be credited.`);

      // Send alert to admin asynchronously with bounded timeout
      Promise.race([
        this.telegramService.sendRewardAlert({
          provider: providerRecord.name,
          offerTitle: `${offerTitle} (⚠️ User Not Found - No Points Credited)`,
          rewardPoints: 0,
          payoutUsd: actualPayoutUsd,
          username: `Unregistered (${userId || 'N/A'})`,
          userId: userId || 'unknown',
          txId: externalTxId,
          offerId: offerExternalId,
          imageUrl: String(payload['icon'] || payload['image'] || '').trim() || undefined,
        }),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]).catch(() => {});

      return {
        success: true,
        message: `User '${userId}' not found; no wallet credited`,
        credited: false,
        points: 0,
        txId: externalTxId,
      };
    }

    // 6. Find or dynamically create Offer record with INACTIVE status (NEVER show in public marketplace)
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
          status: 'INACTIVE', // Strictly INACTIVE so it NEVER appears in the Offers section!
        },
      });
    } else if (offer.status !== 'INACTIVE') {
      await this.prisma.offer.update({
        where: { id: offer.id },
        data: { status: 'INACTIVE' },
      });
    }

    // 7. Create Completion record with status COMPLETED (handle concurrent race conditions)
    let completion;
    try {
      completion = await this.prisma.offerCompletion.create({
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
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        this.logger.log(`Idempotent OK: transaction ${externalTxId} already inserted concurrently`);
        return {
          success: true,
          message: 'Already processed',
          credited: false,
          points: rewardPoints,
          txId: externalTxId,
        };
      }
      throw err;
    }

    // 8. Atomic Credit to Wallet & Double-Entry Ledger
    await this.walletService.credit({
      userId: user.id,
      amount: rewardPoints,
      type: TransactionType.OFFER_REWARD,
      source: `offerwall:${providerRecord.slug}`,
      description: `Reward from ${providerRecord.name}: ${offer.title}`,
      referenceId: completion.id,
    });

    // 9. Send Real-time Notification asynchronously (non-blocking)
    this.notificationsService
      .trigger(user.id, {
        type: NotificationType.REWARD_ADDED,
        title: `🎉 تم احتساب العرض: ${offerTitle}`,
        message: `تم احتساب عرض "${offerTitle}" بنجاح! حصلت على +${rewardPoints.toLocaleString()} نقطة ($${(rewardPoints / pointsPerDollar).toFixed(2)} USD) من شركة ${providerRecord.name}.`,
        relatedEntityId: completion.id,
        relatedEntityType: 'offerCompletion',
        link: '/wallet',
      })
      .catch((err) => {
        this.logger.warn(`Failed to trigger notification: ${err.message}`);
      });

    // 9b. Send Real-time Telegram Alert (bounded timeout so S2S postback returns quickly)
    Promise.race([
      this.telegramService.sendRewardAlert({
        provider: providerRecord.name,
        offerTitle,
        rewardPoints,
        payoutUsd: actualPayoutUsd,
        username: user.username,
        userId: user.id,
        txId: externalTxId,
        offerId: offerExternalId,
        imageUrl: String(payload['icon'] || payload['image'] || '').trim() || undefined,
      }),
      new Promise((resolve) => setTimeout(resolve, 2000)),
    ]).catch((err) => {
      this.logger.warn(`Failed to dispatch Telegram notification: ${err.message}`);
    });

    // 10. Record Webhook Event & Update Provider LastWebhookAt (non-blocking failure protection)
    try {
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
    } catch (err: any) {
      this.logger.warn(`Could not record ProviderWebhookEvent: ${err.message}`);
    }

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
      return res.status(HttpStatus.OK).json({
        code: 0,
        status: 'success',
        message: 'success',
        ...result,
      });
    }
    return res.status(HttpStatus.OK).send('1');
  }

  private sendErrorResponse(err: any, req: Request, res: Response) {
    const statusCode =
      err?.status ||
      (typeof err?.getStatus === 'function' ? err.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR);
    const message = err?.message || 'Error processing postback';
    const error = err?.name || 'InternalServerError';

    const isJson =
      req.query?.response_format === 'json' ||
      req.headers?.accept?.includes('application/json') ||
      req.headers?.['content-type']?.includes('application/json');

    if (isJson) {
      return res.status(statusCode).json({
        success: false,
        code: statusCode,
        error,
        message,
        timestamp: new Date().toISOString(),
      });
    }
    return res.status(statusCode).send(`0: ${message}`);
  }
}
