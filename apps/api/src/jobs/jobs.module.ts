import { Module } from '@nestjs/common';
import { WalletModule } from '../wallet/wallet.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { QUEUES } from './queues.constants';

export { QUEUES } from './queues.constants';

@Module({
  imports: [WalletModule, NotificationsModule, LeaderboardModule],
  providers: [],
  exports: [],
})
export class JobsModule {}
