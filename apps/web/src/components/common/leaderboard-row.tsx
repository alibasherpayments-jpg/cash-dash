import { AvatarWithFallback } from "@/components/common/avatar-with-fallback";
import { formatPoints, formatCash } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@cashdash/shared";
import { LeaderboardMetric } from "@cashdash/shared";

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
}

const medalEmoji = ["🥇", "🥈", "🥉"];

export function LeaderboardRow({ entry, isCurrentUser }: LeaderboardRowProps) {
  const medal = entry.rank <= 3 ? medalEmoji[entry.rank - 1] : null;
  const valueLabel = entry.metric === LeaderboardMetric.TOTAL_EARNED
    ? formatPoints(entry.value)
    : entry.metric === LeaderboardMetric.TOTAL_REFERRALS
    ? `${entry.value} referrals`
    : formatCash(entry.value / 10000);

  return (
    <div className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
      isCurrentUser ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/50"
    )}>
      <div className="flex w-8 shrink-0 items-center justify-center">
        {medal ? (
          <span className="text-xl">{medal}</span>
        ) : (
          <span className="text-sm font-semibold text-muted-foreground">#{entry.rank}</span>
        )}
      </div>
      <AvatarWithFallback username={entry.username} src={entry.avatarUrl} size="sm" />
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-medium truncate", isCurrentUser && "text-primary")}>{entry.username}</p>
        {isCurrentUser && <p className="text-xs text-muted-foreground">You</p>}
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-amber-400">{valueLabel}</p>
      </div>
    </div>
  );
}
