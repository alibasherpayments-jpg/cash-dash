import { Module } from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { WithdrawalsController } from './withdrawals.controller';
import { WalletModule } from '../wallet/wallet.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';
import { SettingsModule } from '../settings/settings.module';
import {
  MockPayPalProvider,
  MockCryptoProvider,
  MockGiftCardProvider,
  MockBankProvider,
} from './providers/payment-providers';

@Module({
  imports: [WalletModule, NotificationsModule, AuditModule, SettingsModule],
  providers: [
    WithdrawalsService,
    MockPayPalProvider,
    MockCryptoProvider,
    MockGiftCardProvider,
    MockBankProvider,
  ],
  controllers: [WithdrawalsController],
  exports: [WithdrawalsService],
})
export class WithdrawalsModule {}
