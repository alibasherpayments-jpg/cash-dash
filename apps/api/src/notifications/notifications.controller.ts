import { Controller, Get, Patch, Post, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { NotificationType } from '@prisma/client';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications (paginated)' })
  async getNotifications(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('unread') unread?: boolean,
  ) {
    const result = await this.notificationsService.getUserNotifications(userId, page, limit, unread);
    return { success: true, ...result };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get count of unread notifications' })
  async getUnreadCount(@CurrentUser('id') userId: string) {
    const count = await this.notificationsService.getUnreadCount(userId);
    return { success: true, data: { count } };
  }

  @Post('test-alert')
  @ApiOperation({ summary: 'Send a test offer reward notification to current user' })
  async sendTestAlert(@CurrentUser('id') userId: string) {
    const testNotif = await this.notificationsService.trigger(userId, {
      type: NotificationType.REWARD_ADDED,
      title: '🎉 تم احتساب العرض: استطلاع الرأي السريع (Quick Survey)',
      message: 'تم احتساب عرض "استطلاع الرأي السريع (Quick Survey)" بنجاح! حصلت على +1,500 نقطة ($1.50 USD) من شركة Taskwall.io.',
      link: '/wallet',
    });
    return { success: true, message: 'Test alert notification sent', data: testNotif };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markAsRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.notificationsService.markAsRead(id, userId);
    return { success: true, message: 'Notification marked as read' };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@CurrentUser('id') userId: string) {
    const result = await this.notificationsService.markAllAsRead(userId);
    return { success: true, message: `Marked ${result.count} notifications as read` };
  }
}
