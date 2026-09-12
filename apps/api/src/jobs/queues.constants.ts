export const QUEUES = {
  REWARD_PROCESSING: 'reward-processing',
  WITHDRAWAL_PROCESSING: 'withdrawal-processing',
  NOTIFICATION_DISPATCH: 'notification-dispatch',
  LEADERBOARD_RECALC: 'leaderboard-recalc',
} as const;

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];
