import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  change?: number;
  changeLabel?: string;
  iconClassName?: string;
  className?: string;
}

export function StatCard({ title, value, subtitle, icon, change, changeLabel, iconClassName, className }: StatCardProps) {
  const changeIsPositive = change !== undefined && change > 0;
  const changeIsNegative = change !== undefined && change < 0;
  const changeIsNeutral = change === 0;

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {icon && (
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary", iconClassName)}>
              {icon}
            </div>
          )}
        </div>
        {change !== undefined && (
          <div className="mt-3 flex items-center gap-1 text-xs">
            {changeIsPositive && <TrendingUp className="h-3 w-3 text-emerald-500" />}
            {changeIsNegative && <TrendingDown className="h-3 w-3 text-red-500" />}
            {changeIsNeutral && <Minus className="h-3 w-3 text-muted-foreground" />}
            <span className={cn(changeIsPositive && "text-emerald-500", changeIsNegative && "text-red-500", changeIsNeutral && "text-muted-foreground")}>
              {changeIsPositive ? "+" : ""}{change}%
            </span>
            {changeLabel && <span className="text-muted-foreground">{changeLabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
