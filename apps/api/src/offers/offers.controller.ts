import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { OffersService } from './offers.service';
import { ListOffersQueryDto } from './dto/offers.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('offers')
@ApiBearerAuth()
@Controller('offers')
export class OffersController {
  constructor(private offersService: OffersService) {}

  @Public()
  @Get('featured')
  @ApiOperation({ summary: 'Get featured offers' })
  async getFeatured(@Query('limit') limit?: number) {
    const data = await this.offersService.getFeaturedOffers(limit);
    return { success: true, data };
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List offers with filters and pagination' })
  async listOffers(@Query() query: ListOffersQueryDto, @CurrentUser('id') userId?: string) {
    const result = await this.offersService.listOffers(query, userId);
    return { success: true, ...result };
  }

  @Public()
  @Get('providers')
  @ApiOperation({ summary: 'List active offer providers' })
  async getProviders() {
    const data = await this.offersService.getProviders();
    return { success: true, data };
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get offer by ID' })
  async getOffer(@Param('id') id: string) {
    const data = await this.offersService.getOfferById(id);
    return { success: true, data };
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start an offer (creates click + completion record)' })
  async startOffer(
    @Param('id') offerId: string,
    @CurrentUser('id') userId: string,
    @Req() req: Request,
  ) {
    const ip = req.ip;
    const ua = req.headers['user-agent'];
    const data = await this.offersService.startOffer(offerId, userId, ip, ua);
    return { success: true, data };
  }
}
