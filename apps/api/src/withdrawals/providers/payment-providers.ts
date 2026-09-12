import { Injectable, Logger } from '@nestjs/common';

/**
 * Interface for payment providers handling withdrawals.
 */
export interface IPaymentProvider {
  readonly slug: string;
  readonly name: string;
  processWithdrawal(withdrawalId: string, amount: number, destination: Record<string, string>): Promise<{ externalTxId: string }>;
  checkStatus(externalTxId: string): Promise<'PROCESSING' | 'PAID' | 'FAILED'>;
}

// ─── Mock PayPal Provider ─────────────────────────────────────────────────────

@Injectable()
export class MockPayPalProvider implements IPaymentProvider {
  private readonly logger = new Logger(MockPayPalProvider.name);
  readonly slug = 'paypal';
  readonly name = 'PayPal';

  async processWithdrawal(withdrawalId: string, amount: number, destination: Record<string, string>) {
    this.logger.log(`MockPayPal: Processing withdrawal ${withdrawalId} for $${amount / 10000}`);
    return { externalTxId: `PP-${Date.now()}-${withdrawalId.slice(0, 8)}` };
  }

  async checkStatus(_externalTxId: string): Promise<'PROCESSING' | 'PAID' | 'FAILED'> {
    return 'PAID';
  }
}

// ─── Mock Crypto Provider ─────────────────────────────────────────────────────

@Injectable()
export class MockCryptoProvider implements IPaymentProvider {
  private readonly logger = new Logger(MockCryptoProvider.name);
  readonly slug = 'crypto';
  readonly name = 'Cryptocurrency';

  async processWithdrawal(withdrawalId: string, amount: number, destination: Record<string, string>) {
    this.logger.log(`MockCrypto: Processing withdrawal ${withdrawalId}`);
    return { externalTxId: `BTC-${Date.now()}-${withdrawalId.slice(0, 8)}` };
  }

  async checkStatus(_externalTxId: string): Promise<'PROCESSING' | 'PAID' | 'FAILED'> {
    return 'PAID';
  }
}

// ─── Mock Gift Card Provider ──────────────────────────────────────────────────

@Injectable()
export class MockGiftCardProvider implements IPaymentProvider {
  private readonly logger = new Logger(MockGiftCardProvider.name);
  readonly slug = 'gift-card';
  readonly name = 'Gift Cards';

  async processWithdrawal(withdrawalId: string, amount: number, destination: Record<string, string>) {
    this.logger.log(`MockGiftCard: Processing withdrawal ${withdrawalId}`);
    return { externalTxId: `GC-${Date.now()}-${withdrawalId.slice(0, 8)}` };
  }

  async checkStatus(_externalTxId: string): Promise<'PROCESSING' | 'PAID' | 'FAILED'> {
    return 'PAID';
  }
}

// ─── Mock Bank Transfer Provider ─────────────────────────────────────────────

@Injectable()
export class MockBankProvider implements IPaymentProvider {
  private readonly logger = new Logger(MockBankProvider.name);
  readonly slug = 'bank-transfer';
  readonly name = 'Bank Transfer';

  async processWithdrawal(withdrawalId: string, amount: number, destination: Record<string, string>) {
    this.logger.log(`MockBank: Processing withdrawal ${withdrawalId}`);
    return { externalTxId: `BNK-${Date.now()}-${withdrawalId.slice(0, 8)}` };
  }

  async checkStatus(_externalTxId: string): Promise<'PROCESSING' | 'PAID' | 'FAILED'> {
    return 'PAID';
  }
}
