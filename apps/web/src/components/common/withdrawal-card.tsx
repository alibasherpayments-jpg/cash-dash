import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCash } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface WithdrawalMethod {
  id: string;
  name: string;
  iconUrl?: string;
  minAmount: number;
  fee: number;
  feeType: "FIXED" | "PERCENTAGE";
  processingTime: string;
  isEnabled: boolean;
}

interface WithdrawalCardProps {
  method: WithdrawalMethod;
  isSelected?: boolean;
  onSelect: (id: string) => void;
}

export function WithdrawalCard({ method, isSelected, onSelect }: WithdrawalCardProps) {
  const feeLabel = method.feeType === "FIXED" ? formatCash(method.fee) : `${method.fee}%`;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:border-primary/50",
        isSelected && "border-primary ring-2 ring-primary/30",
        !method.isEnabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={() => method.isEnabled && onSelect(method.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-lg">
            {method.iconUrl ? (
              <img src={method.iconUrl} alt={method.name} className="h-7 w-7 object-contain" />
            ) : (
              <span>💳</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium">{method.name}</p>
              {!method.isEnabled && <Badge variant="secondary" className="text-xs">Unavailable</Badge>}
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span>Min: {formatCash(method.minAmount / 100)}</span>
              <span>Fee: {feeLabel}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{method.processingTime}</span>
            </div>
          </div>
          {isSelected && <div className="h-4 w-4 rounded-full bg-primary" />}
        </div>
      </CardContent>
    </Card>
  );
}
