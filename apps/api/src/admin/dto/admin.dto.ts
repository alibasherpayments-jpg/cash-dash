import { IsString, IsEnum, IsOptional, IsInt, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus, NotificationType } from '@prisma/client';
import { TransactionDirection } from '@prisma/client';

export class AdminAdjustBalanceDto {
  @ApiProperty({ description: 'Points to add (positive) or subtract (negative)' })
  @IsInt()
  points: number;

  @ApiProperty({ enum: TransactionDirection })
  @IsEnum(TransactionDirection)
  direction: TransactionDirection;

  @ApiProperty()
  @IsString()
  reason: string;
}

export class AdminUpdateUserStatusDto {
  @ApiProperty({ enum: UserStatus })
  @IsEnum(UserStatus)
  status: UserStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

export class AdminBroadcastNotificationDto {
  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Specific user IDs to notify. Empty = all active users.' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];
}

export class AdminUpdateSettingDto {
  @ApiProperty()
  @IsString()
  value: string;
}
