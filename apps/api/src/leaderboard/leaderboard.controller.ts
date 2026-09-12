import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { LeaderboardMetric } from '@prisma/client';

@ApiTags('leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private leaderboardService: LeaderboardService) {}

  private parseLimit(limit?: unknown, defaultLimit = 10): number {
    const num = Number(limit);
    return typeof num === 'number' && !isNaN(num) && num > 0 ? Math.min(num, 100) : defaultLimit;
  }

  /** Live leaderboard: top users by total wallet withdrawals (with masked payout info) */
  @Public()
  @Get('live/withdrawers')
  @ApiOperation({ summary: 'Get live top 10 users by total withdrawn from wallet' })
  async getLiveTopWithdrawers(@Query('limit') limit?: number) {
    const safeLimit = this.parseLimit(limit, 10);
    const data = await this.leaderboardService.getLiveTopWithdrawers(safeLimit);
    return { success: true, data };
  }

  /** Live leaderboard: top users by total earned */
  @Public()
  @Get('live/earners')
  @ApiOperation({ summary: 'Get live top 10 users by total earned' })
  async getLiveTopEarners(@Query('limit') limit?: number) {
    const safeLimit = this.parseLimit(limit, 10);
    const data = await this.leaderboardService.getLiveTopEarners(safeLimit);
    return { success: true, data };
  }

  @Public()
  @Get(':metric')
  @ApiOperation({ summary: 'Get top 10 leaderboard for a metric' })
  async getLeaderboard(
    @Param('metric') metric: LeaderboardMetric,
    @Query('period') period?: string,
    @Query('limit') limit?: number,
  ) {
    const safeLimit = this.parseLimit(limit, 10);
    const data = await this.leaderboardService.getLeaderboard(metric, period ?? 'all-time', safeLimit);
    return { success: true, data };
  }

  @Get(':metric/my-rank')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user's rank for a metric" })
  async getMyRank(
    @Param('metric') metric: LeaderboardMetric,
    @CurrentUser('id') userId: string,
    @Query('period') period?: string,
  ) {
    const data = await this.leaderboardService.getUserRank(userId, metric, period ?? 'all-time');
    return { success: true, data };
  }
}
