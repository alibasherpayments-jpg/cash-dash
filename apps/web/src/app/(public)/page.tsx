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
import { formatPoints, formatCash } from "@/lib/formatters";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://web-production-79a62.up.railway.app/#website",
      "url": "https://web-production-79a62.up.railway.app",
      "name": "Cash Dash",
      "alternateName": ["Cash Dash Rewards", "CashDash"],
      "description": "Complete offers, answer surveys, play games, and earn real cash rewards with instant payouts.",
      "inLanguage": "en-US",
    },
    {
      "@type": "Organization",
      "@id": "https://web-production-79a62.up.railway.app/#organization",
      "name": "Cash Dash",
      "url": "https://web-production-79a62.up.railway.app",
      "logo": {
        "@type": "ImageObject",
        "url": "https://web-production-79a62.up.railway.app/icon-512.png",
        "width": 512,
        "height": 512,
      },
    },
    {
      "@type": "WebApplication",
      "@id": "https://web-production-79a62.up.railway.app/#app",
      "name": "Cash Dash Rewards",
      "url": "https://web-production-79a62.up.railway.app",
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
      "@id": "https://web-production-79a62.up.railway.app/#faq",
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
          <div className="lg:col-span-7 space-y-8 sm:space-y-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide uppercase shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Generation Digital Rewards Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]">
              Complete Offers. <br />
              <span className="bg-gradient-to-r from-primary via-indigo-400 to-accent bg-clip-text text-transparent">
                Earn Points.
              </span>{" "}
              <br />
              Get Rewarded.
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Earn virtual currency by playing top mobile games, testing innovative apps, and taking opinion surveys. Cash out directly via Vodafone Cash, Binance USDT, and major digital payouts.
            </p>

            <div className="pt-2 pb-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-5">
              <Button size="lg" className="h-14 px-9 text-base font-bold shadow-xl shadow-primary/25 rounded-2xl w-full sm:w-auto hover:shadow-primary/40 hover:-translate-y-0.5 transition-all" asChild>
                <Link href="/register">
                  Start Earning Free <ArrowRight className="ml-2.5 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-base font-semibold rounded-2xl w-full sm:w-auto hover:bg-secondary/60 border-border/80 transition-all" asChild>
                <Link href="/offers">Explore Earning Offers</Link>
              </Button>
            </div>

            {/* Micro Trust Stats with Comfortable Spacing & Modern Pill Badges */}
            <div className="pt-8 sm:pt-10 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/40 border border-border/50 shadow-sm backdrop-blur-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span><strong className="text-foreground font-semibold">100% Free</strong> to join</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/40 border border-border/50 shadow-sm backdrop-blur-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span><strong className="text-foreground font-semibold">$0.10</strong> min cashout</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/40 border border-border/50 shadow-sm backdrop-blur-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span><strong className="text-foreground font-semibold">Instant</strong> fast payouts</span>
              </div>
            </div>
          </div>

          {/* Hero Right Visual Mockup */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Interactive Style Mock Balance Card */}
            <div className="w-full max-w-md p-6 rounded-2xl bg-card/90 border border-border shadow-2xl backdrop-blur-2xl relative space-y-6">
              {/* Floating notification badge 1 */}
              <div className="absolute -top-5 -right-4 bg-emerald-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border-2 border-background animate-bounce">
                <Zap className="h-3.5 w-3.5 fill-white" />
                <span>+5,000 Points Credited!</span>
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
                  <Link href="/register">Withdraw Funds</Link>
                </Button>
                <Button size="sm" variant="outline" className="w-full font-bold text-xs" asChild>
                  <Link href="/offers">Browse Tasks</Link>
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
              SIMPLE 4-STEP PROCESS
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Start Earning In Under 3 Minutes
            </h2>
            <p className="text-muted-foreground">
              No complicated setups or fees. Just pick your favorite activity, complete the task, and receive verified digital points.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Create Account",
                desc: "Sign up in 30 seconds. No credit card required. Instantly get your personal rewards dashboard.",
                icon: Users,
              },
              {
                step: "02",
                title: "Pick An Offer",
                desc: "Choose from hundreds of mobile games, surveys, fintech apps, and brand trials tailored to you.",
                icon: Gift,
              },
              {
                step: "03",
                title: "Complete Task",
                desc: "Follow the simple step-by-step instructions. Install the app, play the game, or answer questions.",
                icon: CheckCircle2,
              },
              {
                step: "04",
                title: "Get Rewarded",
                desc: "Redeem your points for real cash or crypto via Vodafone Cash & Binance starting at just 100 points ($0.10).",
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
                TOP OPPORTUNITIES
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                Featured Earning Offers
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                High-reward offers tested and verified by our partner networks.
              </p>
            </div>
            <Button variant="outline" className="w-fit font-semibold" asChild>
              <Link href="/offers">View All 30+ Offers <ArrowRight className="ml-2 h-4 w-4" /></Link>
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
                    <p className="text-xs text-muted-foreground mt-1">Est. {offer.time} • {offer.difficulty}</p>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground font-semibold">Reward</span>
                      <p className="text-lg font-black text-foreground">
                        {formatPoints(offer.reward)} <span className="text-xs font-bold text-accent">pts</span>
                      </p>
                      <p className="text-xs font-medium text-emerald-500">
                        ≈ {formatCash(offer.reward / 1000)}
                      </p>
                    </div>

                    <Button size="sm" asChild>
                      <Link href="/register">Start Offer</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why Choose Us ────────────────────────────────────────── */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-border/40 bg-card/10">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">
              TRUST & SECURITY
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Why Serious Earners Choose Cash Dash
            </h2>
            <p className="text-muted-foreground">
              Built with financial-grade precision, transparent ledger tracking, and guaranteed payout integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Ledger-Backed Wallets",
                desc: "Every point you earn or spend is logged in an immutable, auditable transaction ledger. No mysterious balance drops.",
                icon: ShieldCheck,
              },
              {
                title: "Rapid Payout Processing",
                desc: "Automated verification pipelines clear your reward withdrawals within 1 to 24 hours directly to your preferred payout method.",
                icon: Zap,
              },
              {
                title: "Dynamic Payment Methods",
                desc: "Choose from PayPal, USDT crypto, Amazon, Apple, and wire transfers without hidden deductions or fees.",
                icon: DollarSign,
              },
              {
                title: "Transparent Tracking",
                desc: "View real-time status updates on every offer click, start, pending verification, and completion.",
                icon: CheckCircle2,
              },
              {
                title: "Top Partner Offerwalls",
                desc: "Direct access to industry-leading networks including Taskwall, CPALead, and ClickWall with instant postbacks.",
                icon: Layers,
              },
              {
                title: "Dedicated Support Desk",
                desc: "Real help tickets handled by support agents when offer postbacks are delayed or help is needed.",
                icon: Lock,
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
              HALL OF FAME
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Top 3 Most Withdrawn Earners
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Calculated exclusively from completed, verified payouts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {[
              { rank: "🥈 #2", name: "mia_rewards", amount: "$4,510.00", pts: "45,100,000 pts", country: "UK" },
              { rank: "🥇 #1", name: "alex_dash", amount: "$4,820.00", pts: "48,200,000 pts", country: "US", primary: true },
              { rank: "🥉 #3", name: "sam_earner", amount: "$4,120.00", pts: "41,200,000 pts", country: "CA" },
            ].map((user, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl border transition-all ${
                  user.primary
                    ? "bg-gradient-to-b from-amber-500/10 via-card to-card border-amber-500/40 shadow-xl shadow-amber-500/10 md:-translate-y-4"
                    : "bg-card border-border"
                }`}
              >
                <div className="text-2xl font-black mb-2">{user.rank}</div>
                <div className="h-14 w-14 rounded-full bg-primary/20 mx-auto flex items-center justify-center font-bold text-lg mb-3">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <h4 className="font-bold text-foreground">{user.name}</h4>
                <p className="text-xs text-muted-foreground uppercase">{user.country}</p>
                <div className="mt-4 pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground block">Total Withdrawn</span>
                  <span className="text-xl font-black text-emerald-500">{user.amount}</span>
                  <span className="text-[10px] text-muted-foreground block">{user.pts}</span>
                </div>
              </div>
            ))}
          </div>

          <div>
            <Button variant="outline" asChild>
              <Link href="/leaderboard">View Full Top 10 Leaderboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Testimonials (Marked Demo) ───────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-border/40 bg-card/20">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-black tracking-tight">Trusted by Digital Earners</h2>
            <Badge variant="secondary" className="text-[10px]">
              FICTIONAL PLACEHOLDER TESTIMONIALS (DEMO CONTENT)
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "Cash Dash is the first rewards site where cashouts actually feel instantaneous and transparent. I withdrew my earnings via Vodafone Cash and Binance with zero hassle.",
                author: "Marcus T.",
                role: "Mobile Gamer • Joined 6 months ago",
              },
              {
                quote: "The interface is leagues ahead of clunky old offerwall sites. Being able to see my pending transactions and requirements dynamically gives total peace of mind.",
                author: "Sarah L.",
                role: "Student • Cashed out $320+",
              },
              {
                quote: "Cash Dash has the cleanest interface and highest payouts compared to any other platform. Love the instant verification and quick approvals.",
                author: "David K.",
                role: "Verified Earner • Top Tier",
              },
            ].map((t, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-card border border-border space-y-4">
                <div className="flex text-amber-500 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-500" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground italic leading-relaxed">"{t.quote}"</p>
                <div className="pt-2 border-t border-border">
                  <h5 className="font-bold text-sm text-foreground">{t.author}</h5>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ Accordion ────────────────────────────────────────── */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-border/40">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <Badge variant="outline" className="text-primary border-primary/30">
              FREQUENTLY ASKED QUESTIONS
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Got Questions? We Have Answers.
            </h2>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            <AccordionItem value="q1" className="border border-border rounded-xl px-4">
              <AccordionTrigger className="font-bold text-sm sm:text-base">
                How do I earn points on Cash Dash?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                You earn points by completing verified partner offers: downloading and reaching levels in mobile games, testing new SaaS tools or fintech apps, completing opinion surveys, or shopping with cashback partners.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q2" className="border border-border rounded-xl px-4">
              <AccordionTrigger className="font-bold text-sm sm:text-base">
                What is the points conversion rate?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                1,000 points equals $1.00 USD (or 100 points = $0.10). Conversion rates are dynamically computed across the entire app.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q3" className="border border-border rounded-xl px-4">
              <AccordionTrigger className="font-bold text-sm sm:text-base">
                What is the minimum withdrawal amount?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                Minimum withdrawals start at just 100 points ($0.10 USD) for Vodafone Cash and Binance.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q4" className="border border-border rounded-xl px-4">
              <AccordionTrigger className="font-bold text-sm sm:text-base">
                How long do withdrawals take to process?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                Most digital payouts (Vodafone Cash and Binance) are reviewed and processed within 1 to 24 hours.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q5" className="border border-border rounded-xl px-4">
              <AccordionTrigger className="font-bold text-sm sm:text-base">
                Can I use a VPN or emulator?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                No. To protect advertiser integrity and prevent fraud, using VPNs, proxies, or Android emulators will flag your account for risk review and prevent payout clearance.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* ─── Final CTA Banner ─────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="max-w-4xl mx-auto p-10 md:p-16 rounded-3xl bg-gradient-to-br from-primary/20 via-card to-accent/10 border border-primary/30 shadow-2xl relative space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Ready to Claim Your First Reward?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            Join thousands of smart earners today. Sign up in under a minute and start completing tasks right away.
          </p>
          <div className="pt-4">
            <Button size="lg" className="h-14 px-10 text-base font-bold shadow-xl shadow-primary/30 rounded-2xl hover:shadow-primary/50 hover:-translate-y-0.5 transition-all" asChild>
              <Link href="/register">Create Free Account Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-border/60 bg-card/40 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white">
                <Coins className="h-5 w-5" />
              </div>
              <span className="text-xl font-black">Cash Dash</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              Premium gamified rewards and virtual currency platform. Complete offers, earn digital points, and cash out with confidence.
            </p>
            <p className="text-[11px] text-muted-foreground/60">
              © {new Date().getFullYear()} Cash Dash Inc. All rights reserved. Demo platform.
            </p>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Earn</h5>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="/offers" className="hover:text-foreground">Game Offers</Link></li>
              <li><Link href="/offers" className="hover:text-foreground">Surveys</Link></li>
              <li><Link href="/offers" className="hover:text-foreground">App Downloads</Link></li>
              <li><Link href="/offerwalls" className="hover:text-foreground">Partner Offerwalls</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Rewards</h5>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="/withdraw" className="hover:text-foreground">PayPal Cash</Link></li>
              <li><Link href="/withdraw" className="hover:text-foreground">Crypto Payouts</Link></li>
              <li><Link href="/withdraw" className="hover:text-foreground">Amazon Gift Cards</Link></li>
              <li><Link href="/leaderboard" className="hover:text-foreground">Leaderboard</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Legal & Support</h5>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/contact" className="hover:text-foreground">Contact Support</Link></li>
              <li><Link href="/about" className="hover:text-foreground">About Platform</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
