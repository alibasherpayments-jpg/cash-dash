import { formatPoints, formatRelativeTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { TransactionDirection, TransactionType } from "@cashdash/shared";
import { ArrowDownLeft, ArrowUpRight, Gift, Star, Users, Banknote } from "lucide-react";

interface TransactionItemProps {
  type?: TransactionType;
  direction?: TransactionDirection;
  points?: number;
  amount?: number;
  description?: string;
  createdAt?: string;
  status?: string;
  className?: string;
  transaction?: {
    id?: string;
    type: TransactionType;
    direction: TransactionDirection;
    points?: number;
    amount?: number;
    description?: string;
    createdAt: string;
    status?: string;
  };
}

const typeConfig: Record<TransactionType, { icon: React.ReactNode; label: string }> = {
  OFFER_REWARD: { icon: <Star className="h-4 w-4" />, label: "Offer Reward" },
  SURVEY_REWARD: { icon: <Star className="h-4 w-4" />, label: "Survey Reward" },
  REFERRAL_REWARD: { icon: <Users className="h-4 w-4" />, label: "Referral Reward" },
  DAILY_BONUS: { icon: <Gift className="h-4 w-4" />, label: "Daily Bonus" },
  PROMOTIONAL_BONUS: { icon: <Gift className="h-4 w-4" />, label: "Bonus" },
  WITHDRAWAL: { icon: <Banknote className="h-4 w-4" />, label: "Withdrawal" },
  WITHDRAWAL_REVERSAL: { icon: <Banknote className="h-4 w-4" />, label: "Withdrawal Reversed" },
  ADMIN_ADJUSTMENT: { icon: <Banknote className="h-4 w-4" />, label: "Adjustment" },
};

export function TransactionItem(props: TransactionItemProps) {
  const tx = props.transaction;
  const type = tx?.type ?? props.type ?? TransactionType.OFFER_REWARD;
  const direction = tx?.direction ?? props.direction ?? TransactionDirection.CREDIT;
  const rawPoints = (tx as any)?.amount ?? tx?.points ?? (props as any)?.amount ?? props.points ?? 0;
  const points = typeof rawPoints === 'number' ? rawPoints : parseInt(String(rawPoints), 10) || 0;
  const description = tx?.description ?? props.description ?? "";
  const createdAt = tx?.createdAt ?? props.createdAt ?? new Date().toISOString();
  const className = props.className;
  const isCredit = direction === TransactionDirection.CREDIT;
  const config = typeConfig[type] ?? { icon: <Star className="h-4 w-4" />, label: type };

  return (
    <div className={cn("flex items-center gap-4 py-3", className)}>
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
        isCredit ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
      )}>
        {isCredit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{description || config.label}</p>
        <p className="text-xs text-muted-foreground">{formatRelativeTime(createdAt)}</p>
      </div>
      <div className="text-right">
        <p className={cn("text-sm font-semibold", isCredit ? "text-emerald-500" : "text-red-500")}>
          {isCredit ? "+" : "-"}{formatPoints(points)}
        </p>
      </div>
    </div>
  );
}
