import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * Interface that all offer providers must implement.
 * Allows plugging in real provider SDKs in production.
 */
export interface IOfferProvider {
  readonly slug: string;
  readonly name: string;
  validateWebhook(payload: unknown, signature: string, secret: string): boolean;
  processCompletion(externalTxId: string, userId: string, rewardPoints: number): Promise<void>;
}

// ─── Taskwall.io Provider ─────────────────────────────────────────────────────

@Injectable()
export class TaskwallProvider implements IOfferProvider {
  private readonly logger = new Logger(TaskwallProvider.name);
  readonly slug = 'taskwall';
  readonly name = 'Taskwall.io';

  validateWebhook(payload: unknown, signatureOrSecret: string, secret: string): boolean {
    if (!signatureOrSecret || !secret) return false;
    try {
      if (signatureOrSecret.length === secret.length) {
        if (crypto.timingSafeEqual(Buffer.from(signatureOrSecret), Buffer.from(secret))) return true;
      }
      const expected = crypto
        .createHmac('sha256', secret)
        .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
        .digest('hex');
      const sigBuffer = Buffer.from(signatureOrSecret, 'hex');
      const expBuffer = Buffer.from(expected, 'hex');
      if (sigBuffer.length === expBuffer.length && crypto.timingSafeEqual(sigBuffer, expBuffer)) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async processCompletion(externalTxId: string, userId: string, rewardPoints: number): Promise<void> {
    this.logger.log(`Taskwall: Processing completion ${externalTxId} for user ${userId} (${rewardPoints} pts)`);
  }
}

// ─── CPALead Provider ─────────────────────────────────────────────────────────

@Injectable()
export class CPALeadProvider implements IOfferProvider {
  private readonly logger = new Logger(CPALeadProvider.name);
  readonly slug = 'cpalead';
  readonly name = 'CPALead';

  validateWebhook(payload: unknown, signatureOrSecret: string, secret: string): boolean {
    if (!signatureOrSecret || !secret) return false;
    try {
      if (signatureOrSecret.length === secret.length) {
        if (crypto.timingSafeEqual(Buffer.from(signatureOrSecret), Buffer.from(secret))) return true;
      }
      const expected = crypto
        .createHmac('sha256', secret)
        .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
        .digest('hex');
      const sigBuffer = Buffer.from(signatureOrSecret, 'hex');
      const expBuffer = Buffer.from(expected, 'hex');
      if (sigBuffer.length === expBuffer.length && crypto.timingSafeEqual(sigBuffer, expBuffer)) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async processCompletion(externalTxId: string, userId: string, rewardPoints: number): Promise<void> {
    this.logger.log(`CPALead: Processing completion ${externalTxId} for user ${userId} (${rewardPoints} pts)`);
  }
}

// ─── ClickWall.io Provider ───────────────────────────────────────────────────

@Injectable()
export class ClickWallProvider implements IOfferProvider {
  private readonly logger = new Logger(ClickWallProvider.name);
  readonly slug = 'clickwall';
  readonly name = 'ClickWall.io';

  validateWebhook(payload: unknown, signatureOrSecret: string, secret: string): boolean {
    if (!signatureOrSecret || !secret) return false;
    try {
      if (signatureOrSecret.length === secret.length) {
        if (crypto.timingSafeEqual(Buffer.from(signatureOrSecret), Buffer.from(secret))) return true;
      }
      const expected = crypto
        .createHmac('sha256', secret)
        .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
        .digest('hex');
      const sigBuffer = Buffer.from(signatureOrSecret, 'hex');
      const expBuffer = Buffer.from(expected, 'hex');
      if (sigBuffer.length === expBuffer.length && crypto.timingSafeEqual(sigBuffer, expBuffer)) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async processCompletion(externalTxId: string, userId: string, rewardPoints: number): Promise<void> {
    this.logger.log(`ClickWall: Processing completion ${externalTxId} for user ${userId} (${rewardPoints} pts)`);
  }
}

// ─── PixyLabs Provider ───────────────────────────────────────────────────────

@Injectable()
export class PixyLabsProvider implements IOfferProvider {
  private readonly logger = new Logger(PixyLabsProvider.name);
  readonly slug = 'pixylabs';
  readonly name = 'PixyLabs';

  validateWebhook(payload: unknown, signatureOrSecret: string, secret: string): boolean {
    if (!signatureOrSecret || !secret) return false;
    try {
      if (signatureOrSecret.length === secret.length) {
        if (crypto.timingSafeEqual(Buffer.from(signatureOrSecret), Buffer.from(secret))) return true;
      }
      const expected = crypto
        .createHmac('sha256', secret)
        .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
        .digest('hex');
      const sigBuffer = Buffer.from(signatureOrSecret, 'hex');
      const expBuffer = Buffer.from(expected, 'hex');
      if (sigBuffer.length === expBuffer.length && crypto.timingSafeEqual(sigBuffer, expBuffer)) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async processCompletion(externalTxId: string, userId: string, rewardPoints: number): Promise<void> {
    this.logger.log(`PixyLabs: Processing completion ${externalTxId} for user ${userId} (${rewardPoints} pts)`);
  }
}

// Aliases for compatibility
export { TaskwallProvider as MockOfferProviderA };
export { CPALeadProvider as MockOfferProviderB };
export { ClickWallProvider as MockOfferProviderC };
export { TaskwallProvider as MockSurveyProvider };
export { CPALeadProvider as MockGameProvider };

// ─── Provider Registry ────────────────────────────────────────────────────────

@Injectable()
export class ProviderRegistry {
  private readonly providers: Map<string, IOfferProvider>;

  constructor(
    private taskwall: TaskwallProvider,
    private cpalead: CPALeadProvider,
    private clickwall: ClickWallProvider,
    private pixylabs: PixyLabsProvider,
  ) {
    this.providers = new Map<string, IOfferProvider>([
      [taskwall.slug, taskwall],
      [cpalead.slug, cpalead],
      [clickwall.slug, clickwall],
      [pixylabs.slug, pixylabs],
      // Legacy aliases
      ['mock-provider-a', taskwall],
      ['mock-provider-b', cpalead],
      ['mock-provider-c', clickwall],
      ['mock-survey-provider', taskwall],
      ['mock-game-provider', cpalead],
    ]);
  }

  getProvider(slug: string): IOfferProvider | undefined {
    return this.providers.get(slug);
  }

  getAllProviders(): IOfferProvider[] {
    return [this.taskwall, this.cpalead, this.clickwall, this.pixylabs];
  }
}
