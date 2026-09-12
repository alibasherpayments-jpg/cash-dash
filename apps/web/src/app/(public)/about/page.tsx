import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Zap, ShieldCheck, Trophy, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 space-y-12">
      <div className="space-y-4 text-center">
        <Badge variant="outline" className="text-primary border-primary/30">
          ABOUT CASHDASH
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
          Pioneering the Next Era of Digital Rewards
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          We built CashDash to eliminate the slow payments, opaque deductions, and clunky interfaces that have plagued traditional rewards sites for over a decade.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-card border border-border space-y-3 text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Coins className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg">Fintech Standards</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Every transaction is recorded with double-entry style ledger accountability.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border space-y-3 text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
            <Zap className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg">Rapid Clearance</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Fast automated processing pipelines designed to deliver payouts in under 24 hours.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border space-y-3 text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg">Member-First Support</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Direct ticket communication when an offer provider requires manual review.
          </p>
        </div>
      </div>

      <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 text-center space-y-4">
        <h3 className="text-2xl font-black">Ready to experience CashDash?</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Sign up today, explore dozens of offers, and discover why thousands earn daily.
        </p>
        <Button asChild size="lg" className="font-bold">
          <Link href="/register">Create Free Account <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>
    </div>
  );
}
