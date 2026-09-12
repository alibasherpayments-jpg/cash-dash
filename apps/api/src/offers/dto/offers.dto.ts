import {
  IsEnum,
  IsOptional,
  IsString,
  IsInt,
  IsBoolean,
  IsArray,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsUrl,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { OfferCategory, OfferDifficulty, OfferStatus } from '@prisma/client';

export class CreateOfferDto {
  @ApiProperty()
  @IsString()
  providerId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  externalId?: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ enum: OfferCategory })
  @IsEnum(OfferCategory)
  category: OfferCategory;

  @ApiProperty()
  @IsInt()
  @Min(100)
  rewardPoints: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  iconUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedMinutes?: number;

  @ApiPropertyOptional({ enum: OfferDifficulty })
  @IsOptional()
  @IsEnum(OfferDifficulty)
  difficulty?: OfferDifficulty;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  countries?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  trackingUrl?: string;

  @ApiPropertyOptional({ enum: OfferStatus })
  @IsOptional()
  @IsEnum(OfferStatus)
  status?: OfferStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isRecommended?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class UpdateOfferDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: OfferCategory })
  @IsOptional()
  @IsEnum(OfferCategory)
  category?: OfferCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(100)
  rewardPoints?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  iconUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedMinutes?: number;

  @ApiPropertyOptional({ enum: OfferDifficulty })
  @IsOptional()
  @IsEnum(OfferDifficulty)
  difficulty?: OfferDifficulty;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  countries?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  trackingUrl?: string;

  @ApiPropertyOptional({ enum: OfferStatus })
  @IsOptional()
  @IsEnum(OfferStatus)
  status?: OfferStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isRecommended?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class ListOffersQueryDto {
  @ApiPropertyOptional({ enum: OfferCategory })
  @IsOptional()
  @IsEnum(OfferCategory)
  category?: OfferCategory;

  @ApiPropertyOptional({ enum: OfferDifficulty })
  @IsOptional()
  @IsEnum(OfferDifficulty)
  difficulty?: OfferDifficulty;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minReward?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxReward?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  featured?: boolean;

  @ApiPropertyOptional({ enum: ['reward_asc', 'reward_desc', 'newest', 'popular'] })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
