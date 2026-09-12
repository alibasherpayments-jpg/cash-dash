import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { WalletModule } from '../wallet/wallet.module';
import { OffersModule } from '../offers/offers.module';
import { WithdrawalsModule } from '../withdrawals/withdrawals.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';
import { SettingsModule } from '../settings/settings.module';
import { FraudModule } from '../fraud/fraud.module';

@Module({
  imports: [
    WalletModule,
    OffersModule,
    WithdrawalsModule,
    NotificationsModule,
    AuditModule,
    SettingsModule,
    FraudModule,
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
