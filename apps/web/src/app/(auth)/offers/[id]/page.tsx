"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useOffer } from "@/hooks/use-offers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Coins,
  Clock,
  Zap,
  Globe,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { formatPoints, formatCash } from "@/lib/formatters";
import apiClient from "@/lib/api-client";

export default function OfferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const offerId = params.id as string;
  const { data: offer, isLoading } = useOffer(offerId);

  const [starting, setStarting] = useState(false);
  const [started, setStarted] = useState(false);

  const handleStartOffer = async () => {
    setStarting(true);
    try {
      await apiClient.post(`/offers/${offerId}/start`);
    } catch {
      // Demo mock fallback
    } finally {
      setStarting(false);
      setStarted(true);
    }
  };

  if (isLoading || !offer) {
    return (
      <div className="p-12 text-center space-y-4">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Loading offer details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/offers">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketplace
        </Link>
      </Button>

      {/* ─── Hero Card ───────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden border border-border">
              {offer.iconUrl ? (
                <img src={offer.iconUrl} alt={offer.title} className="h-full w-full object-cover" />
              ) : (
                <Coins className="h-8 w-8 text-primary" />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs font-bold">
                  {offer.category}
                </Badge>
                <span className="text-xs text-muted-foreground font-medium">{offer.providerName}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground">{offer.title}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{offer.description}</p>
            </div>
          </div>

          {/* Reward Box */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/15 to-transparent border border-primary/20 shrink-0 text-center sm:text-right">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">
              Reward Payout
            </span>
            <div className="text-2xl sm:text-3xl font-black text-foreground">
              {formatPoints(offer.rewardPoints)}
            </div>
            <span className="text-xs font-bold text-emerald-500 block">
              ≈ {formatCash(offer.rewardPoints / 10000)} USD
            </span>
          </div>
        </div>

        {/* Quick Specs bar */}
        <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-accent/5 border border-border text-center text-xs">
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Est. Time</span>
            <span className="font-bold text-foreground flex items-center justify-center gap-1 mt-0.5">
              <Clock className="h-3.5 w-3.5 text-primary" /> {offer.estimatedMinutes} mins
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Difficulty</span>
            <span className="font-bold text-amber-400 flex items-center justify-center gap-1 mt-0.5">
              <Zap className="h-3.5 w-3.5" /> {offer.difficulty}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Availability</span>
            <span className="font-bold text-foreground flex items-center justify-center gap-1 mt-0.5">
              <Globe className="h-3.5 w-3.5 text-emerald-500" /> {offer.countries?.join(", ") || "Global"}
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <div>
          {started ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>
                  <strong>Offer Tracking Active!</strong> We have initialized your tracking session. Complete the steps below to be credited.
                </span>
              </div>
              <Button size="sm" variant="outline" className="text-xs font-semibold" asChild>
                <Link href="/wallet">Track in Wallet</Link>
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleStartOffer}
              disabled={starting}
              size="lg"
              className="w-full font-bold h-12 text-base shadow-lg shadow-primary/25"
            >
              {starting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Launching Partner Session...
                </>
              ) : (
                <>
                  Start Offer & Earn {formatPoints(offer.rewardPoints)} <ExternalLink className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* ─── Step-by-Step Instructions ───────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Step-by-Step Completion Guide</h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            { step: "Step 1", title: "Click Start Offer", desc: "Launch using our tracked partner link above" },
            { step: "Step 2", title: "Download / Register", desc: "Install app or register verified new account" },
            { step: "Step 3", title: "Complete Conditions", desc: "Play until reaching stated milestone" },
            { step: "Step 4", title: "Instant Credit", desc: "Points automatically added to your ledger" },
          ].map((s, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-card border border-border space-y-1 text-xs">
              <span className="font-black text-primary uppercase text-[10px]">{s.step}</span>
              <h4 className="font-bold text-foreground">{s.title}</h4>
              <p className="text-muted-foreground text-[11px]">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Requirements & Rules Accordion ───────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Terms & Crucial Requirements</h3>

        <div className="p-4 rounded-xl bg-card border border-border space-y-3 text-xs">
          <div className="flex items-start gap-2.5 text-amber-500">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Important Offer Conditions:</p>
              <p className="text-muted-foreground leading-relaxed">
                You must complete the offer according to the listed conditions to receive the reward. Emulators, VPNs, and AdBlockers will prevent your tracking token from triggering postbacks.
              </p>
            </div>
          </div>

          <ul className="space-y-1.5 pt-2 border-t border-border">
            {offer.requirements?.map((req, i) => (
              <li key={i} className="flex items-center gap-2 text-foreground font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Problem reporting footer */}
      <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>Encountering tracking issues with this offer?</span>
        <Button variant="ghost" size="sm" asChild className="text-xs text-primary font-semibold">
          <Link href="/support/new">Report a Problem</Link>
        </Button>
      </div>
    </div>
  );
}
