import { Module } from '@nestjs/common';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import {
  MockOfferProviderA,
  MockOfferProviderB,
  MockOfferProviderC,
  MockSurveyProvider,
  MockGameProvider,
  ProviderRegistry,
} from './providers/offer-providers';

@Module({
  providers: [
    OffersService,
    MockOfferProviderA,
    MockOfferProviderB,
    MockOfferProviderC,
    MockSurveyProvider,
    MockGameProvider,
    ProviderRegistry,
  ],
  controllers: [OffersController],
  exports: [OffersService, ProviderRegistry],
})
export class OffersModule {}
