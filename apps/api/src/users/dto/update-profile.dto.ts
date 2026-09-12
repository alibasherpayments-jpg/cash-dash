import {
  IsOptional,
  IsString,
  IsBoolean,
  IsUrl,
  MaxLength,
  IsISO31661Alpha2,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO31661Alpha2()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isLeaderboardVisible?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isProfileVisible?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;
}
