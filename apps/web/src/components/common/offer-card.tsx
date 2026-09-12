import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPoints, formatPointsAsCash } from "@/lib/formatters";
import { Clock, Star, Zap } from "lucide-react";
import type { OfferPublic } from "@cashdash/shared";
import { OfferDifficulty } from "@cashdash/shared";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface OfferCardProps {
  offer: OfferPublic;
  className?: string;
}

const difficultyConfig = {
  [OfferDifficulty.EASY]: { label: "Easy", color: "text-emerald-400" },
  [OfferDifficulty.MEDIUM]: { label: "Medium", color: "text-amber-400" },
  [OfferDifficulty.HARD]: { label: "Hard", color: "text-red-400" },
};

export function OfferCard({ offer, className }: OfferCardProps) {
  const diff = difficultyConfig[offer.difficulty];
  return (
    <Card className={cn("group transition-all duration-200 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5", className)}>
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-2xl">
            {offer.iconUrl ? (
              <img src={offer.iconUrl} alt={offer.providerName} className="h-8 w-8 rounded object-contain" />
            ) : (
              <span className="text-xl">??</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground">{offer.providerName}</p>
                <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-tight">{offer.title}</h3>
              </div>
              {offer.isFeatured && (
                <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
              )}
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {offer.estimatedMinutes} min
              </span>
              <span className={cn("flex items-center gap-1 font-medium", diff.color)}>
                <Zap className="h-3 w-3" />
                {diff.label}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-amber-400">{formatPoints(offer.rewardPoints)}</p>
            <p className="text-xs text-muted-foreground">{formatPointsAsCash(offer.rewardPoints)}</p>
          </div>
          <Button size="sm" asChild>
            <Link href={`/offers/${offer.id}`}>Start</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
