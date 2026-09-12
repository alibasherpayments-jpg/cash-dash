"use client";

import React from "react";
import { formatPoints, formatRelativeTime } from "@/lib/formatters";
import { useTranslation } from "@/providers/i18n-provider";
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

const typeIcons: Record<TransactionType, React.ReactNode> = {
  OFFER_REWARD: <Star className="h-4 w-4" />,
  SURVEY_REWARD: <Star className="h-4 w-4" />,
  REFERRAL_REWARD: <Users className="h-4 w-4" />,
  DAILY_BONUS: <Gift className="h-4 w-4" />,
  PROMOTIONAL_BONUS: <Gift className="h-4 w-4" />,
  WITHDRAWAL: <Banknote className="h-4 w-4" />,
  WITHDRAWAL_REVERSAL: <Banknote className="h-4 w-4" />,
  ADMIN_ADJUSTMENT: <Banknote className="h-4 w-4" />,
};

export function TransactionItem(props: TransactionItemProps) {
  const { t, locale } = useTranslation();
  const tx = props.transaction;
  const type = tx?.type ?? props.type ?? TransactionType.OFFER_REWARD;
  const direction = tx?.direction ?? props.direction ?? TransactionDirection.CREDIT;
  const rawPoints = (tx as any)?.amount ?? tx?.points ?? (props as any)?.amount ?? props.points ?? 0;
  const points = typeof rawPoints === "number" ? rawPoints : parseInt(String(rawPoints), 10) || 0;
  const description = tx?.description ?? props.description ?? "";
  const createdAt = tx?.createdAt ?? props.createdAt ?? new Date().toISOString();
  const className = props.className;
  const isCredit = direction === TransactionDirection.CREDIT;
  const icon = typeIcons[type] ?? <Star className="h-4 w-4" />;
  const localizedType = t.transactions.types[type] || type;

  return (
    <div className={cn("flex items-center gap-3 sm:gap-4 py-2.5 sm:py-3", className)}>
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          isCredit ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
        )}
      >
        {isCredit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-2 break-words">
          {description || localizedType}
        </p>
        <p className="text-[10px] sm:text-xs text-muted-foreground">{formatRelativeTime(createdAt, locale)}</p>
      </div>
      <div className="text-end shrink-0 pl-2">
        <p className={cn("text-xs sm:text-sm font-bold font-mono", isCredit ? "text-emerald-500" : "text-red-500")}>
          {isCredit ? "+" : "-"}{formatPoints(points)}
        </p>
      </div>
    </div>
  );
}
