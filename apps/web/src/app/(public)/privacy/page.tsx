import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-black tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground">Last updated: September 12, 2026</p>
        </div>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <div className="p-4 rounded-xl bg-card border border-border text-foreground font-medium">
            Note: This privacy policy is a template placeholder for the Cash Dash platform.
          </div>

          <section className="space-y-2">
            <h3 className="text-lg font-bold text-foreground">1. Information We Collect</h3>
            <p>
              We collect information you provide directly to us when registering an account, such as your username and email address, as well as necessary payout destination details (e.g. PayPal email or crypto address) when you initiate a withdrawal.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-bold text-foreground">2. Usage Data & Fraud Prevention</h3>
            <p>
              To protect against unauthorized activities and bot abuse, we track anonymous device fingerprints, IP addresses, country geolocation, and offer completion velocity signals.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-bold text-foreground">3. Sharing with Offerwall Partners</h3>
            <p>
              When you click on an offer, a unique anonymous tracking token (user ID hash) is passed to the provider to confirm when you satisfy the reward milestones. We never share your password or personal contact details with advertisers.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
