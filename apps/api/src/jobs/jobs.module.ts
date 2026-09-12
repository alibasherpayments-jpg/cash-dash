import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RewardProcessor } from './processors/reward.processor';
import { LeaderboardProcessor } from './processors/leaderboard.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { WalletModule } from '../wallet/wallet.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { QUEUES } from './queues.constants';

export { QUEUES } from './queues.constants';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.get<string>('redis.url', 'redis://localhost:6379'),
        },
      }),
    }),
    BullModule.registerQueue(
      { name: QUEUES.REWARD_PROCESSING },
      { name: QUEUES.WITHDRAWAL_PROCESSING },
      { name: QUEUES.NOTIFICATION_DISPATCH },
      { name: QUEUES.LEADERBOARD_RECALC },
    ),
    WalletModule,
    NotificationsModule,
    LeaderboardModule,
  ],
  providers: [RewardProcessor, LeaderboardProcessor, NotificationProcessor],
  exports: [BullModule],
})
export class JobsModule {}
