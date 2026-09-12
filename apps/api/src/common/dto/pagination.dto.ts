import { IsInt, IsOptional, IsPositive, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit?: number = 20;
}

export function paginate<T>(
  data: T[],
  total: number,
  page?: number,
  limit?: number,
) {
  const safePage = !page || isNaN(Number(page)) || Number(page) < 1 ? 1 : Math.floor(Number(page));
  const safeLimit = !limit || isNaN(Number(limit)) || Number(limit) < 1 ? 20 : Math.min(Math.floor(Number(limit)), 100);
  return {
    data,
    meta: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  };
}

export function getPaginationParams(page?: number, limit?: number) {
  const safePage = !page || isNaN(Number(page)) || Number(page) < 1 ? 1 : Math.floor(Number(page));
  const safeLimit = !limit || isNaN(Number(limit)) || Number(limit) < 1 ? 20 : Math.min(Math.floor(Number(limit)), 100);
  const take = safeLimit;
  const skip = (safePage - 1) * take;
  return { take, skip };
}
