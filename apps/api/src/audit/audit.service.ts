import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction, Prisma } from '@prisma/client';
import { getPaginationParams, paginate } from '../common/dto/pagination.dto';

interface LogOptions {
  adminId: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  previousValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async log(opts: LogOptions) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          adminId: opts.adminId,
          action: opts.action,
          entityType: opts.entityType,
          entityId: opts.entityId,
          previousValue: opts.previousValue as Prisma.InputJsonValue,
          newValue: opts.newValue as Prisma.InputJsonValue,
          ipAddress: opts.ipAddress,
          metadata: opts.metadata as Prisma.InputJsonValue,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to write audit log: ${(err as Error).message}`);
      return null;
    }
  }

  async listLogs(page = 1, limit = 50, filters?: { adminId?: string; action?: AuditAction; entityType?: string }) {
    const { take, skip } = getPaginationParams(page, limit || 50);

    const where: Prisma.AuditLogWhereInput = {
      ...(filters?.adminId && { adminId: filters.adminId }),
      ...(filters?.action && { action: filters.action }),
      ...(filters?.entityType && { entityType: filters.entityType }),
    };

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          admin: { select: { username: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return paginate(logs, total, page, take);
  }
}
