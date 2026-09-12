import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TransactionType } from '@prisma/client';

@ApiTags('wallet')
@ApiBearerAuth()
@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get()
  @ApiOperation({ summary: 'Get wallet summary' })
  async getWallet(@CurrentUser('id') userId: string) {
    const data = await this.walletService.getWalletSummary(userId);
    return { success: true, data };
  }

  private parsePage(page?: unknown): number {
    const num = Number(page);
    return typeof num === 'number' && !isNaN(num) && num >= 1 ? Math.floor(num) : 1;
  }

  private parseLimit(limit?: unknown, defaultLimit = 20): number {
    const num = Number(limit);
    return typeof num === 'number' && !isNaN(num) && num >= 1 ? Math.min(Math.floor(num), 100) : defaultLimit;
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get wallet transaction history (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: TransactionType })
  async getTransactions(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: TransactionType,
  ) {
    const safePage = this.parsePage(page);
    const safeLimit = this.parseLimit(limit, 20);
    const data = await this.walletService.getTransactions(userId, safePage, safeLimit, type);
    return { success: true, ...data };
  }
}
