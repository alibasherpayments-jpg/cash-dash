import { Progress } from "@/components/ui/progress";
import { formatPoints } from "@/lib/formatters";
import { Target } from "lucide-react";

interface DailyGoalProps {
  current: number;
  goal: number;
}

export function DailyGoal({ current, goal }: DailyGoalProps) {
  const percentage = Math.min(100, Math.round((current / goal) * 100));
  const achieved = current >= goal;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-medium">Daily Goal</span>
        </div>
        <span className="text-sm font-semibold text-amber-400">{percentage}%</span>
      </div>
      <Progress value={percentage} className="h-2 [&>div]:bg-amber-400" />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatPoints(current)} earned</span>
        <span>Goal: {formatPoints(goal)}</span>
      </div>
      {achieved && (
        <p className="text-xs font-medium text-emerald-500">?? Daily goal achieved!</p>
      )}
    </div>
  );
}
