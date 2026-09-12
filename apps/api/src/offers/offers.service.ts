import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OfferStatus, OfferCompletionStatus, Prisma } from '@prisma/client';
import { CreateOfferDto, UpdateOfferDto, ListOffersQueryDto } from './dto/offers.dto';
import { getPaginationParams, paginate } from '../common/dto/pagination.dto';

@Injectable()
export class OffersService {
  private readonly logger = new Logger(OffersService.name);

  constructor(private prisma: PrismaService) {}

  async createOffer(dto: CreateOfferDto) {
    const provider = await this.prisma.offerProvider.findUnique({
      where: { id: dto.providerId },
    });
    if (!provider) throw new NotFoundException('Provider not found');

    const offer = await this.prisma.offer.create({
      data: {
        providerId: dto.providerId,
        externalId: dto.externalId,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        rewardPoints: dto.rewardPoints,
        iconUrl: dto.iconUrl,
        imageUrl: dto.imageUrl,
        estimatedMinutes: dto.estimatedMinutes ?? 15,
        difficulty: dto.difficulty ?? 'MEDIUM',
        countries: dto.countries ?? [],
        requirements: dto.requirements ?? [],
        trackingUrl: dto.trackingUrl,
        status: dto.status ?? OfferStatus.ACTIVE,
        isFeatured: dto.isFeatured ?? false,
        isRecommended: dto.isRecommended ?? false,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
      include: { provider: true },
    });

    // Update provider offer count
    await this.prisma.offerProvider.update({
      where: { id: dto.providerId },
      data: { offersCount: { increment: 1 } },
    });

    return offer;
  }

  async updateOffer(id: string, dto: UpdateOfferDto) {
    const offer = await this.prisma.offer.findUnique({ where: { id } });
    if (!offer) throw new NotFoundException('Offer not found');

    return this.prisma.offer.update({
      where: { id },
      data: {
        ...dto,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
      include: { provider: true },
    });
  }

  async deleteOffer(id: string) {
    const offer = await this.prisma.offer.findUnique({ where: { id } });
    if (!offer) throw new NotFoundException('Offer not found');

    await this.prisma.offer.update({
      where: { id },
      data: { status: OfferStatus.INACTIVE },
    });

    await this.prisma.offerProvider.update({
      where: { id: offer.providerId },
      data: { offersCount: { decrement: 1 } },
    });
  }

  async listOffers(query: ListOffersQueryDto, userId?: string) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { take, skip } = getPaginationParams(page, limit);

    const where: Prisma.OfferWhereInput = {
      status: { in: [OfferStatus.ACTIVE, OfferStatus.FEATURED] },
      ...(query.category && { category: query.category }),
      ...(query.difficulty && { difficulty: query.difficulty }),
      ...(query.minReward !== undefined && { rewardPoints: { gte: query.minReward } }),
      ...(query.maxReward !== undefined && { rewardPoints: { lte: query.maxReward } }),
      ...(query.featured && { isFeatured: true }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    let orderBy: Prisma.OfferOrderByWithRelationInput = { createdAt: 'desc' };
    switch (query.sort) {
      case 'reward_asc':
        orderBy = { rewardPoints: 'asc' };
        break;
      case 'reward_desc':
        orderBy = { rewardPoints: 'desc' };
        break;
      case 'popular':
        orderBy = { completionCount: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [offers, total] = await Promise.all([
      this.prisma.offer.findMany({
        where,
        orderBy,
        take,
        skip,
        include: { provider: { select: { name: true, logoUrl: true } } },
      }),
      this.prisma.offer.count({ where }),
    ]);

    return paginate(offers, total, page, take);
  }

  async getOfferById(id: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
      include: { provider: true },
    });
    if (!offer) throw new NotFoundException('Offer not found');
    return offer;
  }

  async startOffer(offerId: string, userId: string, ipAddress?: string, userAgent?: string) {
    const offer = await this.prisma.offer.findUnique({ where: { id: offerId } });
    if (!offer) throw new NotFoundException('Offer not found');

    if (offer.status === OfferStatus.INACTIVE || offer.status === OfferStatus.EXPIRED) {
      throw new BadRequestException('This offer is no longer available');
    }

    if (offer.expiresAt && offer.expiresAt < new Date()) {
      await this.prisma.offer.update({ where: { id: offerId }, data: { status: OfferStatus.EXPIRED } });
      throw new BadRequestException('This offer has expired');
    }

    // Check if already completed
    const alreadyCompleted = await this.prisma.offerCompletion.findFirst({
      where: { userId, offerId, status: OfferCompletionStatus.COMPLETED },
    });
    if (alreadyCompleted) {
      throw new BadRequestException('You have already completed this offer');
    }

    // Create click record
    const click = await this.prisma.offerClick.create({
      data: { userId, offerId, ipAddress, userAgent },
    });

    // Create or update completion record
    const completion = await this.prisma.offerCompletion.upsert({
      where: {
        userId_offerId_externalTxId: { userId, offerId, externalTxId: null as unknown as string },
      },
      create: {
        userId,
        offerId,
        providerId: offer.providerId,
        status: OfferCompletionStatus.STARTED,
        rewardPoints: offer.rewardPoints,
        clickedAt: click.clickedAt,
        startedAt: new Date(),
        ipAddress,
        userAgent,
      },
      update: {
        status: OfferCompletionStatus.STARTED,
        clickedAt: click.clickedAt,
        startedAt: new Date(),
      },
    });

    // Increment click count
    await this.prisma.offer.update({
      where: { id: offerId },
      data: { clickCount: { increment: 1 } },
    });

    return { completion, trackingUrl: offer.trackingUrl };
  }

  async getProviders() {
    return this.prisma.offerProvider.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async getFeaturedOffers(limit = 6) {
    return this.prisma.offer.findMany({
      where: {
        status: { in: [OfferStatus.FEATURED, OfferStatus.ACTIVE] },
        isFeatured: true,
      },
      take: limit,
      orderBy: { rewardPoints: 'desc' },
      include: { provider: { select: { name: true, logoUrl: true } } },
    });
  }
}
