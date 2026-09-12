import { formatDateTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface TimelineEvent {
  id: string;
  status: string;
  label: string;
  description?: string;
  timestamp: string;
  isCompleted?: boolean;
  isError?: boolean;
}

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  return (
    <div className="relative space-y-0">
      {events.map((event, i) => (
        <div key={event.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
              event.isError ? "bg-red-500/10 text-red-500" : event.isCompleted ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
            )}>
              {event.isError ? <XCircle className="h-4 w-4" /> : event.isCompleted ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
            </div>
            {i < events.length - 1 && <div className="mt-1 w-px flex-1 bg-border" />}
          </div>
          <div className={cn("pb-6 pt-1", i === events.length - 1 && "pb-0")}>
            <p className="text-sm font-medium">{event.label}</p>
            {event.description && <p className="text-xs text-muted-foreground">{event.description}</p>}
            <p className="mt-1 text-xs text-muted-foreground/70">{formatDateTime(event.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
