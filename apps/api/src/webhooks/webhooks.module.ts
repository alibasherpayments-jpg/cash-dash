import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { OffersModule } from '../offers/offers.module';
import { JobsModule } from '../jobs/jobs.module';
import { WalletModule } from '../wallet/wallet.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [OffersModule, JobsModule, WalletModule, NotificationsModule],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
