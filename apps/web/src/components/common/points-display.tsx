import { formatPoints, formatPointsAsCash } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface PointsDisplayProps {
  points: number;
  size?: "sm" | "md" | "lg" | "xl";
  showCash?: boolean;
  className?: string;
}

const pointsSizeMap = { sm: "text-sm font-semibold", md: "text-lg font-bold", lg: "text-2xl font-bold", xl: "text-4xl font-bold" };
const cashSizeMap = { sm: "text-xs", md: "text-sm", lg: "text-base", xl: "text-xl" };

export function PointsDisplay({ points, size = "md", showCash = true, className }: PointsDisplayProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <span className={cn("text-amber-400", pointsSizeMap[size])}>{formatPoints(points)}</span>
      {showCash && (
        <span className={cn("text-muted-foreground", cashSizeMap[size])}>{formatPointsAsCash(points)}</span>
      )}
    </div>
  );
}
