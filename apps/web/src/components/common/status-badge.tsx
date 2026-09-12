import { Badge } from "@/components/ui/badge";
import type { WithdrawalStatus, OfferStatus, TicketStatus, OfferCompletionStatus } from "@cashdash/shared";

type Status = WithdrawalStatus | OfferStatus | TicketStatus | OfferCompletionStatus | string;

const statusConfig: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" | "outline" | "amber" | "info" }> = {
  ACTIVE: { label: "Active", variant: "success" },
  FEATURED: { label: "Featured", variant: "amber" },
  INACTIVE: { label: "Inactive", variant: "secondary" },
  EXPIRED: { label: "Expired", variant: "secondary" },
  PENDING: { label: "Pending", variant: "warning" },
  PROCESSING: { label: "Processing", variant: "info" },
  PAID: { label: "Paid", variant: "success" },
  COMPLETED: { label: "Completed", variant: "success" },
  REJECTED: { label: "Rejected", variant: "destructive" },
  CANCELLED: { label: "Cancelled", variant: "secondary" },
  FAILED: { label: "Failed", variant: "destructive" },
  REFUNDED: { label: "Refunded", variant: "warning" },
  UNDER_REVIEW: { label: "Under Review", variant: "warning" },
  OPEN: { label: "Open", variant: "info" },
  WAITING_FOR_USER: { label: "Awaiting Reply", variant: "warning" },
  IN_PROGRESS: { label: "In Progress", variant: "info" },
  RESOLVED: { label: "Resolved", variant: "success" },
  CLOSED: { label: "Closed", variant: "secondary" },
  CLICKED: { label: "Clicked", variant: "secondary" },
  STARTED: { label: "Started", variant: "info" },
  REVERSED: { label: "Reversed", variant: "destructive" },
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, variant: "secondary" as const };
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
