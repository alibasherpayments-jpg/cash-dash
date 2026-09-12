"use client";
import { formatRelativeTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { NotificationType } from "@cashdash/shared";
import type { NotificationPublic } from "@cashdash/shared";
import { Bell, CheckCircle, Gift, TrendingDown, TrendingUp, Trophy, Users, XCircle, Megaphone } from "lucide-react";

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  REWARD_ADDED: <TrendingUp className="h-4 w-4 text-emerald-500" />,
  REWARD_PENDING: <Bell className="h-4 w-4 text-amber-500" />,
  REWARD_REVERSED: <TrendingDown className="h-4 w-4 text-red-500" />,
  WITHDRAWAL_REQUESTED: <TrendingDown className="h-4 w-4 text-blue-500" />,
  WITHDRAWAL_PROCESSING: <Bell className="h-4 w-4 text-blue-500" />,
  WITHDRAWAL_COMPLETED: <CheckCircle className="h-4 w-4 text-emerald-500" />,
  WITHDRAWAL_REJECTED: <XCircle className="h-4 w-4 text-red-500" />,
  REFERRAL_REWARD: <Users className="h-4 w-4 text-purple-500" />,
  PROMOTIONAL: <Gift className="h-4 w-4 text-amber-500" />,
  SYSTEM_ANNOUNCEMENT: <Megaphone className="h-4 w-4 text-primary" />,
  ACHIEVEMENT_UNLOCKED: <Trophy className="h-4 w-4 text-amber-400" />,
};

interface NotificationItemProps {
  notification: NotificationPublic;
  onClick?: (id: string) => void;
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const icon = notificationIcons[notification.type] ?? <Bell className="h-4 w-4" />;

  return (
    <button
      onClick={() => onClick?.(notification.id)}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted/50",
        !notification.isRead && "bg-primary/5",
      )}
    >
      <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", !notification.isRead ? "bg-primary/10" : "bg-muted")}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium">{notification.title}</p>
          {!notification.isRead && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
        <p className="mt-1 text-xs text-muted-foreground/70">{formatRelativeTime(notification.createdAt)}</p>
      </div>
    </button>
  );
}
