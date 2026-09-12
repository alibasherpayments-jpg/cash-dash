import {
  IsString,
  IsInt,
  Min,
  IsObject,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  IsNumber,
  MaxLength,
  MinLength,
  IsPositive,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { WithdrawalFieldType } from '@prisma/client';

export class CreateWithdrawalDto {
  @ApiProperty({ description: 'Withdrawal method ID' })
  @IsString()
  methodId: string;

  @ApiProperty({ description: 'Points to withdraw' })
  @IsInt()
  @IsPositive()
  points: number;

  @ApiProperty({ description: 'Payout destination details (e.g. { email: "user@paypal.com" })' })
  @IsObject()
  destination: Record<string, string>;
}

export class CreateWithdrawalMethodDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  slug: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  minimumPoints: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @IsPositive()
  maximumPoints?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  feePercent?: number;

  @ApiProperty({ example: '1-3 business days' })
  @IsString()
  processingTime: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  enabledCountries?: string[];

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}

export class CreateWithdrawalRequirementDto {
  @ApiProperty()
  @IsString()
  fieldName: string;

  @ApiProperty()
  @IsString()
  label: string;

  @ApiPropertyOptional({ enum: WithdrawalFieldType })
  @IsOptional()
  @IsEnum(WithdrawalFieldType)
  type?: WithdrawalFieldType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  placeholder?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  helpText?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  validation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}

export class UpdateWithdrawalStatusDto {
  @ApiProperty()
  @IsString()
  status: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  externalTxId?: string;
}

export class ListWithdrawalsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

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
  limit?: number;
}

export class BatchUpdateWithdrawalStatusDto {
  @ApiProperty({ type: [String], description: 'List of withdrawal IDs to update' })
  @IsArray()
  @IsString({ each: true })
  withdrawalIds: string[];

  @ApiProperty({ description: 'New status for the withdrawals' })
  @IsString()
  status: string;

  @ApiPropertyOptional({ description: 'Admin audit note or rejection reason' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ description: 'Optional gateway external transaction ID' })
  @IsOptional()
  @IsString()
  externalTxId?: string;
}
