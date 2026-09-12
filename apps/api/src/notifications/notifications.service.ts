import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
import { getPaginationParams, paginate } from '../common/dto/pagination.dto';

interface TriggerNotificationOptions {
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  link?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a notification for a user. Called by other services.
   */
  async trigger(userId: string, opts: TriggerNotificationOptions) {
    try {
      return await this.prisma.notification.create({
        data: {
          userId,
          type: opts.type,
          title: opts.title,
          message: opts.message,
          relatedEntityId: opts.relatedEntityId,
          relatedEntityType: opts.relatedEntityType,
          link: opts.link,
          isRead: false,
        },
      });
    } catch (err) {
      // Never let notification failure break the main flow
      this.logger.error(`Failed to create notification for user ${userId}: ${(err as Error).message}`);
      return null;
    }
  }

  async getUserNotifications(userId: string, page = 1, limit = 20, unreadOnly = false) {
    const { take, skip } = getPaginationParams(page, limit);

    const where = {
      userId,
      ...(unreadOnly && { isRead: false }),
    };

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return paginate(notifications, total, page, take);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      return;
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async broadcastToUsers(userIds: string[], opts: TriggerNotificationOptions) {
    const data = userIds.map((userId) => ({
      userId,
      type: opts.type,
      title: opts.title,
      message: opts.message,
      relatedEntityId: opts.relatedEntityId,
      relatedEntityType: opts.relatedEntityType,
      link: opts.link,
      isRead: false,
    }));

    return this.prisma.notification.createMany({ data });
  }

  async broadcastToAll(opts: TriggerNotificationOptions, limit = 10000) {
    const users = await this.prisma.user.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true },
      take: limit,
    });

    return this.broadcastToUsers(users.map((u) => u.id), opts);
  }
}
