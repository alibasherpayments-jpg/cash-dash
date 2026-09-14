import { Module } from '@nestjs/common';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import {
  TaskwallProvider,
  CPALeadProvider,
  ClickWallProvider,
  PixyLabsProvider,
  ProviderRegistry,
} from './providers/offer-providers';

@Module({
  providers: [
    OffersService,
    TaskwallProvider,
    CPALeadProvider,
    ClickWallProvider,
    PixyLabsProvider,
    ProviderRegistry,
  ],
  controllers: [OffersController],
  exports: [OffersService, ProviderRegistry],
})
export class OffersModule {}
