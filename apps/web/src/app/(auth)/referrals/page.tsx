"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/common/stat-card";
import { Users, Copy, Check, Share2, Sparkles, Gift, ShieldAlert } from "lucide-react";
import { formatPoints } from "@/lib/formatters";

export default function ReferralsPage() {
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const referralCode = user?.referralCode || "REF-ALEXDASH";
  const referralLink = typeof window !== "undefined"
    ? `${window.location.origin}/register?ref=${referralCode}`
    : `https://cashdash.io/register?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
          <Users className="h-7 w-7 text-primary" /> Referral Program
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Invite friends to CashDash and earn a lifetime 10% commission on every qualifying offer they complete
        </p>
      </div>

      {/* ─── Referral Link Hero Box ──────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-primary/15 via-card to-accent/10 border border-primary/30 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-bold">
              LIFETIME 10% COMMISSION
            </Badge>
            <h2 className="text-xl sm:text-2xl font-black text-foreground">Your Exclusive Invitation Link</h2>
            <p className="text-xs text-muted-foreground">
              Share this link across social channels, forums, or with your gaming clan.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-muted-foreground uppercase font-bold block">Your Referral Code</span>
            <span className="font-mono text-lg font-black text-primary">{referralCode}</span>
          </div>
        </div>

        {/* Link Input + Copy Button */}
        <div className="flex items-center gap-2">
          <Input
            readOnly
            value={referralLink}
            className="h-12 bg-background/80 font-mono text-xs sm:text-sm border-primary/30"
          />
          <Button onClick={handleCopy} size="lg" className="h-12 font-bold shrink-0">
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-1.5" /> Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1.5" /> Copy Link
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ─── Referral Statistics ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Referrals"
          value="4"
          subtitle="Signed up"
          icon={<Users className="h-5 w-5 text-primary" />}
        />
        <StatCard
          title="Active Earners"
          value="3"
          subtitle="Completed offers"
          icon={<Sparkles className="h-5 w-5 text-accent" />}
        />
        <StatCard
          title="Total Referral Earnings"
          value={formatPoints(3200)}
          subtitle="≈ $0.32 credited"
          icon={<Gift className="h-5 w-5 text-emerald-500" />}
        />
        <StatCard
          title="Commission Rate"
          value="10%"
          subtitle="Lifetime eligible"
          icon={<Share2 className="h-5 w-5 text-indigo-400" />}
        />
      </div>

      {/* ─── How it works 3 steps ─────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">How the Referral Program Works</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-card border border-border space-y-2">
            <span className="text-xl font-black text-primary">1</span>
            <h4 className="font-bold text-sm">Share Your Link</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Send your personal invitation link to friends, family, or followers on Discord, YouTube, or Reddit.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-card border border-border space-y-2">
            <span className="text-xl font-black text-primary">2</span>
            <h4 className="font-bold text-sm">Friends Complete Tasks</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your referred friends register and complete mobile game tasks, apps, and market research surveys.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-card border border-border space-y-2">
            <span className="text-xl font-black text-primary">3</span>
            <h4 className="font-bold text-sm">Earn 10% Automatically</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Whenever a friend earns points, 10% of their reward amount is credited into your ledger with no deductions to them.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Referred Friends Table ──────────────────────────────── */}
      <Card className="border-border">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-base font-bold">Referred Friends Activity</CardTitle>
          <CardDescription className="text-xs">
            Anonymous summary of friends who registered via your link
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 pt-0">
          <div className="divide-y divide-border">
            {[
              { handle: "ry***tle", date: "Sep 8, 2026", earned: 12000, commission: 1200, status: "Active" },
              { handle: "em***est", date: "Sep 5, 2026", earned: 8500, commission: 850, status: "Active" },
              { handle: "no***ash", date: "Aug 28, 2026", earned: 11500, commission: 1150, status: "Active" },
              { handle: "zo***aze", date: "Aug 15, 2026", earned: 0, commission: 0, status: "Registered" },
            ].map((ref, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-mono font-bold text-foreground">{ref.handle}</p>
                  <p className="text-[10px] text-muted-foreground">Joined {ref.date}</p>
                </div>

                <div className="flex items-center gap-6 text-right">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Points Earned</span>
                    <strong className="text-foreground">{formatPoints(ref.earned)}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Your 10%</span>
                    <strong className="text-emerald-500 font-bold">+{formatPoints(ref.commission)}</strong>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {ref.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
