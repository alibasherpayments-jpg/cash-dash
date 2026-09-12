import {
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketCategory, TicketStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateTicketDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  subject: string;

  @ApiProperty({ enum: TicketCategory })
  @IsEnum(TicketCategory)
  category: TicketCategory;

  @ApiProperty({ description: 'First message content' })
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  message: string;
}

export class AddTicketMessageDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content: string;
}

export class UpdateTicketStatusDto {
  @ApiProperty({ enum: TicketStatus })
  @IsEnum(TicketStatus)
  status: TicketStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;
}
