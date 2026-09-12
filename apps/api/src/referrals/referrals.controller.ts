import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReferralsService } from './referrals.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('referrals')
@ApiBearerAuth()
@Controller('referrals')
export class ReferralsController {
  constructor(private referralsService: ReferralsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get referral stats and list for current user' })
  async getStats(@CurrentUser('id') userId: string) {
    const data = await this.referralsService.getReferralStats(userId);
    return { success: true, data };
  }
}
