import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { LeaderboardService } from '../../leaderboard/leaderboard.service';
import { QUEUES } from '../queues.constants';

export interface LeaderboardJobData {
  period?: string;
}

@Processor(QUEUES.LEADERBOARD_RECALC)
export class LeaderboardProcessor extends WorkerHost {
  private readonly logger = new Logger(LeaderboardProcessor.name);

  constructor(private leaderboardService: LeaderboardService) {
    super();
  }

  async process(job: Job<LeaderboardJobData>): Promise<void> {
    const period = job.data.period ?? 'all-time';
    this.logger.log(`Recalculating leaderboard for period: ${period}`);

    await this.leaderboardService.recalculate(period);
    this.logger.log('Leaderboard recalculation complete');
  }
}
