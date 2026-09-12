import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationsService } from './notifications.service';
import { NotificationType } from '@prisma/client';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      notification: {
        create: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        createMany: vi.fn(),
      },
      user: {
        findMany: vi.fn(),
      },
    };

    service = new NotificationsService(mockPrisma);
  });

  it('should trigger a notification successfully', async () => {
    const mockCreated = {
      id: 'notif-1',
      userId: 'user-1',
      type: NotificationType.REWARD_ADDED,
      title: 'Points Credited',
      message: 'You earned 500 pts',
      isRead: false,
    };
    mockPrisma.notification.create.mockResolvedValue(mockCreated);

    const result = await service.trigger('user-1', {
      type: NotificationType.REWARD_ADDED,
      title: 'Points Credited',
      message: 'You earned 500 pts',
    });

    expect(result).toEqual(mockCreated);
    expect(mockPrisma.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        type: NotificationType.REWARD_ADDED,
        isRead: false,
      }),
    });
  });

  it('should swallow errors when notification creation fails and not throw', async () => {
    mockPrisma.notification.create.mockRejectedValue(new Error('DB failure'));

    const result = await service.trigger('user-1', {
      type: NotificationType.REWARD_ADDED,
      title: 'Points Credited',
      message: 'You earned 500 pts',
    });

    expect(result).toBeNull();
  });

  it('should return unread notification count', async () => {
    mockPrisma.notification.count.mockResolvedValue(4);

    const count = await service.getUnreadCount('user-1');
    expect(count).toBe(4);
    expect(mockPrisma.notification.count).toHaveBeenCalledWith({
      where: { userId: 'user-1', isRead: false },
    });
  });

  it('should mark notification as read only if owned by user', async () => {
    mockPrisma.notification.findUnique.mockResolvedValue({
      id: 'notif-1',
      userId: 'user-2', // different user
    });

    const result = await service.markAsRead('notif-1', 'user-1');
    expect(result).toBeUndefined();
    expect(mockPrisma.notification.update).not.toHaveBeenCalled();
  });

  it('should broadcast notifications to multiple users with createMany', async () => {
    mockPrisma.notification.createMany.mockResolvedValue({ count: 2 });

    await service.broadcastToUsers(['u1', 'u2'], {
      type: NotificationType.SYSTEM_ANNOUNCEMENT,
      title: 'Maintenance',
      message: 'Scheduled maintenance tonight',
    });

    expect(mockPrisma.notification.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ userId: 'u1', title: 'Maintenance' }),
        expect.objectContaining({ userId: 'u2', title: 'Maintenance' }),
      ]),
    });
  });
});
