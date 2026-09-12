import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6">
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>

        <div className="space-y-2">
          <Badge variant="outline" className="text-amber-500 border-amber-500/30">
            DEMO PLACEHOLDER POLICY
          </Badge>
          <h1 className="text-4xl font-black tracking-tight">Terms of Service</h1>
          <p className="text-xs text-muted-foreground">Last updated: September 12, 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-sm text-muted-foreground leading-relaxed">
          <div className="p-4 rounded-xl bg-card border border-border text-foreground font-medium">
            Note: This is a placeholder terms of service document designed for demonstration and architectural testing purposes. Real commercial deployment requires tailored legal review.
          </div>

          <section className="space-y-2">
            <h3 className="text-lg font-bold text-foreground">1. Acceptance of Terms</h3>
            <p>
              By accessing or creating an account on Cash Dash, you agree to comply with and be bound by these Terms of Service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-bold text-foreground">2. Virtual Currency and Points</h3>
            <p>
              Points earned on Cash Dash are virtual promotional units and hold no real-world monetary value until an eligible and approved redemption request has been formally completed by the platform. Points may not be transferred between accounts.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-bold text-foreground">3. Anti-Fraud & Prohibited Activities</h3>
            <p>
              Users are strictly prohibited from using Virtual Private Networks (VPNs), proxies, Tor routing, automated scripts, emulators, or multiple duplicate accounts to manipulate offer completions. Accounts found violating these terms will be suspended without reward distribution.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-bold text-foreground">4. Payouts and Approvals</h3>
            <p>
              All reward redemptions undergo automated and manual review for risk verification. Cash Dash reserves the right to withhold payments if a third-party offerwall provider reverses an offer postback.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
