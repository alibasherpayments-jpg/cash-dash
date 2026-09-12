import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  illustration?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({ illustration, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 py-16 text-center", className)}>
      {illustration && <div className="mb-2 opacity-80">{illustration}</div>}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">{title}</h3>
        {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && (
        <Button
          onClick={action.onClick}
          asChild={!!action.href}
          className="mt-2"
        >
          {action.href ? <a href={action.href}>{action.label}</a> : action.label}
        </Button>
      )}
    </div>
  );
}
