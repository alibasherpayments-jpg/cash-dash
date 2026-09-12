import { Controller, Get, Patch, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

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
