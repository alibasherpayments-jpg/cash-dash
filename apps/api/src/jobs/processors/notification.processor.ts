import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUES } from '../queues.constants';

export interface NotificationJobData {
  userId: string;
  title: string;
  message: string;
  channel: 'email' | 'push' | 'in-app';
}

@Processor(QUEUES.NOTIFICATION_DISPATCH)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  async process(job: Job<NotificationJobData>): Promise<void> {
    const { userId, title, message, channel } = job.data;

    // In production: integrate real email/push notification providers
    this.logger.log(`Dispatching ${channel} notification to user ${userId}: "${title}"`);

    if (channel === 'email') {
      // TODO: Send via SMTP/SendGrid/etc.
      this.logger.log(`[EMAIL] To: ${userId} | ${title}`);
    } else if (channel === 'push') {
      // TODO: Send via FCM/APNs
      this.logger.log(`[PUSH] To: ${userId} | ${title}`);
    }
  }
}
