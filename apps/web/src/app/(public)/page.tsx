"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Coins,
  ArrowRight,
  ShieldCheck,
  Zap,
  Gift,
  Gamepad2,
  CheckCircle2,
  Trophy,
  Users,
  Smartphone,
  Sparkles,
  Star,
  DollarSign,
  Lock,
  Layers,
} from "lucide-react";
import { formatPoints, formatCash, formatPointsAsCash } from "@/lib/formatters";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { AvatarWithFallback } from "@/components/common/avatar-with-fallback";
import { useTranslation } from "@/providers/i18n-provider";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://www.alibasher.online/#website",
      "url": "https://www.alibasher.online",
      "name": "Cash Dash",
      "alternateName": ["Cash Dash Rewards", "CashDash"],
      "description": "Complete offers, answer surveys, play games, and earn real cash rewards with instant payouts.",
      "inLanguage": "en-US",
    },
    {
      "@type": "Organization",
      "@id": "https://www.alibasher.online/#organization",
      "name": "Cash Dash",
      "url": "https://www.alibasher.online",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.alibasher.online/icon-512.png",
        "width": 512,
        "height": 512,
      },
    },
    {
      "@type": "WebApplication",
      "@id": "https://www.alibasher.online/#app",
      "name": "Cash Dash Rewards",
      "url": "https://www.alibasher.online",
      "applicationCategory": "FinanceApplication, EntertainmentApplication",
      "operatingSystem": "All",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "1280",
        "bestRating": "5",
        "worstRating": "1",
      },
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.alibasher.online/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How do I earn points on Cash Dash?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You earn points by completing verified partner offers: downloading and reaching levels in mobile games, testing new SaaS tools or fintech apps, completing opinion surveys, or shopping with cashback partners.",
          },
        },
        {
          "@type": "Question",
          "name": "What is the minimum withdrawal amount?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Minimum withdrawals start at just 100 points ($0.10 USD) for instant cashouts via Vodafone Cash and Binance.",
          },
        },
        {
          "@type": "Question",
          "name": "How long do withdrawals take to process?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Most digital payouts (Vodafone Cash and Binance) are reviewed and processed within 1 to 24 hours directly to your preferred account.",
          },
        },
        {
          "@type": "Question",
          "name": "What is the points conversion rate?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "1,000 points equals $1.00 USD (or 100 points = $0.10). Conversion rates are dynamically computed across the entire app.",
          },
        },
      ],
    },
  ],
};

export default function LandingPage() {
  const { t } = useTranslation();
  const { withdrawers } = useLeaderboard();

  const top1 = withdrawers?.[0];
  const top2 = withdrawers?.[1];
  const top3 = withdrawers?.[2];

  const hallOfFame = [
    { rank: "🥈 #2", user: top2, primary: false },
    { rank: "🥇 #1", user: top1, primary: true },
    { rank: "🥉 #3", user: top3, primary: false },
  ].filter(item => Boolean(item.user));

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
      {/* Schema.org Structured Data for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ─── Hero Section ─────────────────────────────────────────── */}
      <section className="relative py-24 sm:py-28 lg:py-36 px-4 sm:px-6 lg:px-8 border-b border-border/40">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/20 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-8 sm:space-y-10 text-center lg:text-start">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide uppercase shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t.landing.hero.badge}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]">
              {t.landing.hero.titleMain} <br />
              <span className="bg-gradient-to-r from-primary via-indigo-400 to-accent bg-clip-text text-transparent">
                {t.landing.hero.titleGradient}
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              {t.landing.hero.subtitle}
            </p>

            <div className="pt-2 pb-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-5">
              <Button size="lg" className="h-14 px-9 text-base font-bold shadow-xl shadow-primary/25 rounded-2xl w-full sm:w-auto hover:shadow-primary/40 hover:-translate-y-0.5 transition-all" asChild>
                <Link href="/register">
                  {t.landing.hero.startEarningBtn} <ArrowRight className="ms-2.5 h-4 w-4 rtl:rotate-180" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-base font-semibold rounded-2xl w-full sm:w-auto hover:bg-secondary/60 border-border/80 transition-all" asChild>
                <Link href="/offers">{t.landing.hero.exploreOffersBtn}</Link>
              </Button>
            </div>

            {/* Micro Trust Stats with Comfortable Spacing & Modern Pill Badges */}
            <div className="pt-8 sm:pt-10 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/40 border border-border/50 shadow-sm backdrop-blur-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span><strong className="text-foreground font-semibold">{t.landing.hero.noCardRequired}</strong></span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/40 border border-border/50 shadow-sm backdrop-blur-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span><strong className="text-foreground font-semibold">{t.landing.payouts.minimumNotice}</strong></span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/40 border border-border/50 shadow-sm backdrop-blur-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span><strong className="text-foreground font-semibold">{t.landing.hero.instantBadge}</strong></span>
              </div>
            </div>
          </div>

          {/* Hero Right Visual Mockup */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Interactive Style Mock Balance Card */}
            <div className="w-full max-w-md p-6 rounded-2xl bg-card/90 border border-border shadow-2xl backdrop-blur-2xl relative space-y-6">
              {/* Floating notification badge 1 */}
              <div className="absolute -top-3 sm:-top-5 right-2 sm:-right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border-2 border-background animate-bounce">
                <Zap className="h-3.5 w-3.5 fill-white" />
                <span>+5,000 {t.common.pts} Credited!</span>
              </div>

              {/* Header inside mockup */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-white">
                    <Coins className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Cash Dash Wallet</h3>
                    <p className="text-xs text-muted-foreground">Verified Member Tier</p>
                  </div>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-bold">
                  LIVE STATUS
                </Badge>
              </div>

              {/* Balance display */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-primary/15 via-background to-accent/5 border border-border">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Available Balance
                </span>
                <div className="text-3xl font-black text-foreground mt-1 flex items-baseline gap-2">
                  <span>12,450</span>
                  <span className="text-sm font-bold text-accent">Points</span>
                </div>
                <div className="text-sm font-semibold text-emerald-500 mt-1">
                  ≈ $124.50 USD Available
                </div>
              </div>

              {/* Sample Activity Rows */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Recent Completions
                </span>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-accent/5 border border-border/60 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Gamepad2 className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-bold text-foreground">Raid: Shadow Legends</p>
                      <p className="text-muted-foreground text-[10px]">Game Offer Completed</p>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-500">+45,000 pts</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-accent/5 border border-border/60 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="h-4 w-4 text-accent" />
                    <div>
                      <p className="font-bold text-foreground">Tech Consumer Study</p>
                      <p className="text-muted-foreground text-[10px]">15-min Survey</p>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-500">+2,400 pts</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button size="sm" className="w-full font-bold text-xs" asChild>
                  <Link href="/register">{t.common.withdraw}</Link>
                </Button>
                <Button size="sm" variant="outline" className="w-full font-bold text-xs" asChild>
                  <Link href="/offers">{t.common.offers}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works Section ─────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-border/40 bg-card/20">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <Badge variant="outline" className="text-primary border-primary/30">
              {t.landing.howItWorks.tag}
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              {t.landing.howItWorks.title}
            </h2>
            <p className="text-muted-foreground">
              {t.landing.howItWorks.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: t.landing.howItWorks.step1Title,
                desc: t.landing.howItWorks.step1Desc,
                icon: Gift,
              },
              {
                step: "02",
                title: t.landing.howItWorks.step2Title,
                desc: t.landing.howItWorks.step2Desc,
                icon: CheckCircle2,
              },
              {
                step: "03",
                title: t.landing.howItWorks.step3Title,
                desc: t.landing.howItWorks.step3Desc,
                icon: Trophy,
              },
            ].map((item, idx) => (
              <div key={idx} className="relative p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all group">
                <div className="text-4xl font-black text-primary/20 group-hover:text-primary/40 transition-colors mb-4">
                  {item.step}
                </div>
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Offers Preview ──────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-border/40">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <Badge variant="outline" className="text-accent border-accent/30 mb-2">
                {t.landing.featured.tag}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                {t.landing.featured.title}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {t.landing.featured.subtitle}
              </p>
            </div>
            <Button variant="outline" className="w-fit font-semibold" asChild>
              <Link href="/offers">{t.landing.featured.viewAllOffers} <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Raid: Shadow Legends - Reach Lv 40",
                category: "GAMES",
                reward: 45000,
                time: "120 mins",
                difficulty: "Hard",
                provider: "AdVenture",
              },
              {
                title: "Revolut - Sign Up & First Card Payment",
                category: "FINANCE",
                reward: 65000,
                time: "25 mins",
                difficulty: "Medium",
                provider: "RewardHub",
              },
              {
                title: "Monopoly GO! - Board 15",
                category: "GAMES",
                reward: 28000,
                time: "60 mins",
                difficulty: "Medium",
                provider: "PlayForge",
              },
              {
                title: "Consumer Tech & Gadgets Survey 2026",
                category: "SURVEYS",
                reward: 2400,
                time: "15 mins",
                difficulty: "Easy",
                provider: "InsightSurveys",
              },
              {
                title: "NordVPN - Secure 2-Year Plan",
                category: "APPS",
                reward: 75000,
                time: "10 mins",
                difficulty: "Easy",
                provider: "TaskForce",
              },
              {
                title: "Temu - First Order with Discount",
                category: "SHOPPING",
                reward: 32000,
                time: "20 mins",
                difficulty: "Medium",
                provider: "RewardHub",
              },
            ].map((offer, idx) => (
              <Card key={idx} className="border-border hover:border-primary/50 transition-all flex flex-col justify-between">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px] font-bold">
                      {offer.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-medium">{offer.provider}</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-base text-foreground line-clamp-1">{offer.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{offer.time} • {offer.difficulty}</p>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground font-semibold">{t.landing.featured.earnUpTo}</span>
                      <p className="text-lg font-black text-foreground">
                        {formatPoints(offer.reward)} <span className="text-xs font-bold text-accent">{t.common.pts}</span>
                      </p>
                      <p className="text-xs font-medium text-emerald-500">
                        ≈ {formatCash(offer.reward / 1000)}
                      </p>
                    </div>

                    <Button size="sm" asChild>
                      <Link href="/register">{t.landing.featured.startOfferBtn}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why Choose Us / Security ──────────────────────────────── */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-border/40 bg-card/10">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">
              {t.landing.security.tag}
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              {t.landing.security.title}
            </h2>
            <p className="text-muted-foreground">
              {t.landing.security.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: t.landing.security.feature1Title,
                desc: t.landing.security.feature1Desc,
                icon: ShieldCheck,
              },
              {
                title: t.landing.security.feature2Title,
                desc: t.landing.security.feature2Desc,
                icon: Zap,
              },
              {
                title: t.landing.security.feature3Title,
                desc: t.landing.security.feature3Desc,
                icon: DollarSign,
              },
            ].map((feat, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-card border border-border space-y-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <feat.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Leaderboard Preview ──────────────────────────────────── */}
      <section id="leaderboard" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-border/40">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div>
            <Badge variant="outline" className="text-amber-500 border-amber-500/30 mb-2">
              {t.common.leaderboard}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Top 3 Most Withdrawn Earners
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Calculated exclusively from completed, verified payouts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {hallOfFame.map(({ rank, user, primary }, idx) => {
              const orderClass = primary
                ? "order-1 md:order-2"
                : rank.includes("2")
                ? "order-2 md:order-1"
                : "order-3 md:order-3";

              return (
                <div
                  key={user.userId || idx}
                  className={`${orderClass} p-6 rounded-2xl border transition-all ${
                    primary
                      ? "bg-gradient-to-b from-amber-500/10 via-card to-card border-amber-500/40 shadow-xl shadow-amber-500/10 md:-translate-y-4"
                      : "bg-card border-border"
                  }`}
                >
                <div className="text-2xl font-black mb-2">{rank}</div>
                <div className="mb-3 flex justify-center">
                  <AvatarWithFallback username={user.username} avatarUrl={user.avatarUrl} size="lg" />
                </div>
                <h4 className="font-bold text-foreground truncate max-w-[200px] mx-auto">{user.username}</h4>
                <p className="text-xs text-muted-foreground uppercase">{user.country || "EG"}</p>
                {user.lastPayoutMasked && (
                  <div className="text-[11px] text-muted-foreground font-mono mt-1">
                    {user.lastPayoutMasked}
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground block">Total Withdrawn</span>
                  <span className="text-xl font-black text-emerald-500">
                    {formatPointsAsCash(user.totalWithdrawn)}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    {formatPoints(user.totalWithdrawn)} {t.common.pts}
                  </span>
                </div>
              </div>
            );
          })}
          </div>

          <div>
            <Button variant="outline" asChild>
              <Link href="/leaderboard">{t.common.viewAll} {t.common.leaderboard}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Payout Methods Showcase ──────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-border/40 bg-card/20">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <div className="space-y-3">
            <Badge variant="outline" className="text-primary border-primary/30">
              {t.landing.payouts.tag}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              {t.landing.payouts.title}
            </h2>
            <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
              {t.landing.payouts.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { name: t.landing.payouts.methods.vodafone, icon: DollarSign, color: "text-red-500 bg-red-500/10 border-red-500/20" },
              { name: t.landing.payouts.methods.binance, icon: Coins, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
              { name: t.landing.payouts.methods.instapay, icon: Zap, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
              { name: t.landing.payouts.methods.paypal, icon: ShieldCheck, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
              { name: t.landing.payouts.methods.usdt, icon: Sparkles, color: "text-teal-500 bg-teal-500/10 border-teal-500/20" },
            ].map((m, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-card border border-border flex flex-col items-center justify-center text-center gap-3 hover:border-primary/40 transition-all">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center border ${m.color}`}>
                  <m.icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold text-foreground line-clamp-1">{m.name}</span>
              </div>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{t.landing.payouts.minimumNotice}</span>
          </div>
        </div>
      </section>

      {/* ─── FAQ Accordion ────────────────────────────────────────── */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-border/40">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <Badge variant="outline" className="text-primary border-primary/30">
              {t.landing.faq.tag}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              {t.landing.faq.title}
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              {t.landing.faq.subtitle}
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            <AccordionItem value="q1" className="border border-border rounded-xl px-4">
              <AccordionTrigger className="font-bold text-sm sm:text-base">
                {t.landing.faq.q1}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {t.landing.faq.a1}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q2" className="border border-border rounded-xl px-4">
              <AccordionTrigger className="font-bold text-sm sm:text-base">
                {t.landing.faq.q2}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {t.landing.faq.a2}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q3" className="border border-border rounded-xl px-4">
              <AccordionTrigger className="font-bold text-sm sm:text-base">
                {t.landing.faq.q3}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {t.landing.faq.a3}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q4" className="border border-border rounded-xl px-4">
              <AccordionTrigger className="font-bold text-sm sm:text-base">
                {t.landing.faq.q4}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {t.landing.faq.a4}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q5" className="border border-border rounded-xl px-4">
              <AccordionTrigger className="font-bold text-sm sm:text-base">
                {t.landing.faq.q5}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {t.landing.faq.a5}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* ─── Final CTA Banner ─────────────────────────────────────── */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="max-w-4xl mx-auto p-6 sm:p-10 md:p-16 rounded-3xl bg-gradient-to-br from-primary/20 via-card to-accent/10 border border-primary/30 shadow-2xl relative space-y-4 sm:space-y-6">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            {t.landing.cta.title}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {t.landing.cta.subtitle}
          </p>
          <div className="pt-2 sm:pt-4 flex flex-col items-center gap-3 w-full">
            <Button size="lg" className="h-12 sm:h-14 px-6 sm:px-10 text-sm sm:text-base font-bold shadow-xl shadow-primary/30 rounded-2xl hover:shadow-primary/50 hover:-translate-y-0.5 transition-all max-w-full w-full sm:w-auto" asChild>
              <Link href="/register" className="truncate px-2">{t.landing.cta.button}</Link>
            </Button>
            <span className="text-[11px] sm:text-xs text-muted-foreground px-2">{t.landing.cta.note}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
