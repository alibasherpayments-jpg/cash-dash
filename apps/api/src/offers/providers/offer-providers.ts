import { Injectable, Logger } from '@nestjs/common';

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

// ─── Mock Provider A: Games + Apps ────────────────────────────────────────────

@Injectable()
export class MockOfferProviderA implements IOfferProvider {
  private readonly logger = new Logger(MockOfferProviderA.name);
  readonly slug = 'mock-provider-a';
  readonly name = 'MockOfferProviderA';

  validateWebhook(payload: unknown, signature: string, secret: string): boolean {
    // In production: compute HMAC-SHA256 of payload with secret and compare
    const crypto = require('crypto') as typeof import('crypto');
    const expected = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    return signature === expected;
  }

  async processCompletion(externalTxId: string, userId: string, rewardPoints: number): Promise<void> {
    this.logger.log(`MockProviderA: Processing completion ${externalTxId} for user ${userId} (${rewardPoints} pts)`);
  }
}

// ─── Mock Provider B: Shopping + Finance ──────────────────────────────────────

@Injectable()
export class MockOfferProviderB implements IOfferProvider {
  private readonly logger = new Logger(MockOfferProviderB.name);
  readonly slug = 'mock-provider-b';
  readonly name = 'MockOfferProviderB';

  validateWebhook(payload: unknown, signature: string, secret: string): boolean {
    const crypto = require('crypto') as typeof import('crypto');
    const expected = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    return signature === expected;
  }

  async processCompletion(externalTxId: string, userId: string, rewardPoints: number): Promise<void> {
    this.logger.log(`MockProviderB: Processing completion ${externalTxId} for user ${userId} (${rewardPoints} pts)`);
  }
}

// ─── Mock Provider C: Sign-up + Trials ────────────────────────────────────────

@Injectable()
export class MockOfferProviderC implements IOfferProvider {
  private readonly logger = new Logger(MockOfferProviderC.name);
  readonly slug = 'mock-provider-c';
  readonly name = 'MockOfferProviderC';

  validateWebhook(payload: unknown, signature: string, secret: string): boolean {
    const crypto = require('crypto') as typeof import('crypto');
    const expected = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    return signature === expected;
  }

  async processCompletion(externalTxId: string, userId: string, rewardPoints: number): Promise<void> {
    this.logger.log(`MockProviderC: Processing completion ${externalTxId} for user ${userId} (${rewardPoints} pts)`);
  }
}

// ─── Mock Survey Provider ─────────────────────────────────────────────────────

@Injectable()
export class MockSurveyProvider implements IOfferProvider {
  private readonly logger = new Logger(MockSurveyProvider.name);
  readonly slug = 'mock-survey-provider';
  readonly name = 'MockSurveyProvider';

  validateWebhook(payload: unknown, signature: string, secret: string): boolean {
    const crypto = require('crypto') as typeof import('crypto');
    const expected = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    return signature === expected;
  }

  async processCompletion(externalTxId: string, userId: string, rewardPoints: number): Promise<void> {
    this.logger.log(`MockSurveyProvider: Survey ${externalTxId} completed for user ${userId} (${rewardPoints} pts)`);
  }
}

// ─── Mock Game Provider ───────────────────────────────────────────────────────

@Injectable()
export class MockGameProvider implements IOfferProvider {
  private readonly logger = new Logger(MockGameProvider.name);
  readonly slug = 'mock-game-provider';
  readonly name = 'MockGameProvider';

  validateWebhook(payload: unknown, signature: string, secret: string): boolean {
    const crypto = require('crypto') as typeof import('crypto');
    const expected = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    return signature === expected;
  }

  async processCompletion(externalTxId: string, userId: string, rewardPoints: number): Promise<void> {
    this.logger.log(`MockGameProvider: Game ${externalTxId} level reached for user ${userId} (${rewardPoints} pts)`);
  }
}

// ─── Provider Registry ────────────────────────────────────────────────────────

@Injectable()
export class ProviderRegistry {
  private readonly providers: Map<string, IOfferProvider>;

  constructor(
    private providerA: MockOfferProviderA,
    private providerB: MockOfferProviderB,
    private providerC: MockOfferProviderC,
    private surveyProvider: MockSurveyProvider,
    private gameProvider: MockGameProvider,
  ) {
    this.providers = new Map<string, IOfferProvider>([
      [providerA.slug, providerA],
      [providerB.slug, providerB],
      [providerC.slug, providerC],
      [surveyProvider.slug, surveyProvider],
      [gameProvider.slug, gameProvider],
    ]);
  }

  getProvider(slug: string): IOfferProvider | undefined {
    return this.providers.get(slug);
  }

  getAllProviders(): IOfferProvider[] {
    return Array.from(this.providers.values());
  }
}
