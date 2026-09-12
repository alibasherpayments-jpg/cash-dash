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
    const data = await this.walletService.getTransactions(userId, page, limit, type);
    return { success: true, ...data };
  }
}
