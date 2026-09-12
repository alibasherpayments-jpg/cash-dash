import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { OffersModule } from '../offers/offers.module';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [OffersModule, JobsModule],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
