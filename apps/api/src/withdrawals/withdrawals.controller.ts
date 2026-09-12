import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { WithdrawalsService } from './withdrawals.service';
import { CreateWithdrawalDto } from './dto/withdrawals.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('withdrawals')
@ApiBearerAuth()
@Controller('withdrawals')
export class WithdrawalsController {
  constructor(private withdrawalsService: WithdrawalsService) {}

  @Public()
  @Get('methods')
  @ApiOperation({ summary: 'List active withdrawal methods' })
  async listMethods() {
    const data = await this.withdrawalsService.listMethods(true);
    return { success: true, data };
  }

  @Public()
  @Get('methods/:id')
  @ApiOperation({ summary: 'Get withdrawal method details' })
  async getMethod(@Param('id') id: string) {
    const data = await this.withdrawalsService.getMethod(id);
    return { success: true, data };
  }

  @Post()
  @ApiOperation({ summary: 'Create a withdrawal request' })
  async createWithdrawal(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateWithdrawalDto,
    @Req() req: Request,
  ) {
    const data = await this.withdrawalsService.createWithdrawal(userId, dto, req.ip);
    return { success: true, data, message: 'Withdrawal request submitted' };
  }

  @Get('mine')
  @ApiOperation({ summary: 'Get current user withdrawals' })
  async getMyWithdrawals(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.withdrawalsService.getUserWithdrawals(userId, page, limit);
    return { success: true, ...result };
  }

  @Get('mine/:id')
  @ApiOperation({ summary: 'Get a specific withdrawal by ID' })
  async getWithdrawal(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const data = await this.withdrawalsService.getWithdrawalById(id, userId);
    return { success: true, data };
  }

  @Delete('mine/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a pending withdrawal' })
  async cancelWithdrawal(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.withdrawalsService.cancelWithdrawal(id, userId);
    return { success: true, message: 'Withdrawal cancelled and points refunded' };
  }
}
