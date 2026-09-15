import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TelegramService } from './telegram.service';

@Module({
  providers: [NotificationsService, TelegramService],
  controllers: [NotificationsController],
  exports: [NotificationsService, TelegramService],
})
export class NotificationsModule {}
