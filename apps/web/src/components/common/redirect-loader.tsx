"use client";

import React from "react";
import { Coins, Sparkles } from "lucide-react";

export function BrandRedirectLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground overflow-hidden select-none">
      {/* ─── Ambient Glow Auras ────────────────────────────────────────────── */}
      <div className="absolute w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-primary/15 blur-[110px] pointer-events-none animate-pulse" />
      <div className="absolute w-64 h-64 rounded-full bg-accent/15 blur-[90px] pointer-events-none -top-10 -end-10" />
      <div className="absolute w-56 h-56 rounded-full bg-emerald-500/10 blur-[90px] pointer-events-none -bottom-10 -start-10" />

      {/* ─── Scoped CSS Keyframes for Playful Dots & Trampoline Logo ──────── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes cdDotLeft {
          0% { transform: translate3d(-24px, 0, 0) scale(1, 1); }
          10% { transform: translate3d(-24px, 3px, 0) scale(1.25, 0.75); }
          22% { transform: translate3d(-4px, -36px, 0) scale(0.85, 1.25); }
          28% { transform: translate3d(-15px, -30px, 0) scale(1.15, 0.9); } /* Bumped by Center Dot */
          40% { transform: translate3d(-18px, -12px, 0) scale(0.95, 1.1); }
          50% { transform: translate3d(-18px, 3px, 0) scale(1.3, 0.7); } /* Land & squash */
          60% { transform: translate3d(-8px, -24px, 0) scale(0.9, 1.15); } /* Jump & scramble right */
          70% { transform: translate3d(8px, -28px, 0) scale(1.1, 0.95); } /* Mid-air tussle */
          82% { transform: translate3d(-18px, -18px, 0) scale(0.9, 1.15); } /* Rush back left */
          92% { transform: translate3d(-24px, 3px, 0) scale(1.25, 0.75); } /* Landing squash */
          100% { transform: translate3d(-24px, 0, 0) scale(1, 1); }
        }

        @keyframes cdDotMid {
          0% { transform: translate3d(0, 0, 0) scale(1, 1); }
          10% { transform: translate3d(0, 3px, 0) scale(1.2, 0.8); }
          22% { transform: translate3d(0, -30px, 0) scale(0.9, 1.25); }
          28% { transform: translate3d(12px, -24px, 0) scale(1.15, 0.9); } /* Hit by Left Dot */
          42% { transform: translate3d(2px, 2px, 0) scale(1.25, 0.8); } /* Lands on logo */
          55% { transform: translate3d(0, -42px, 0) scale(0.85, 1.25); } /* High jump between them */
          68% { transform: translate3d(-4px, -30px, 0) scale(1.15, 0.9); } /* Mid-air scramble */
          80% { transform: translate3d(2px, -18px, 0) scale(0.9, 1.15); }
          92% { transform: translate3d(0, 3px, 0) scale(1.3, 0.75); } /* Landing squash */
          100% { transform: translate3d(0, 0, 0) scale(1, 1); }
        }

        @keyframes cdDotRight {
          0% { transform: translate3d(24px, 0, 0) scale(1, 1) rotate(0deg); }
          10% { transform: translate3d(24px, 3px, 0) scale(1.25, 0.75) rotate(0deg); }
          22% { transform: translate3d(22px, -18px, 0) scale(0.9, 1.15) rotate(-20deg); }
          34% { transform: translate3d(0, -50px, 0) scale(0.85, 1.25) rotate(-180deg); } /* Somersault leap over center */
          48% { transform: translate3d(-14px, -24px, 0) scale(1.15, 0.9) rotate(-270deg); } /* Swoop onto Left Dot */
          60% { transform: translate3d(-6px, -14px, 0) scale(0.95, 1.1) rotate(-320deg); }
          72% { transform: translate3d(16px, -28px, 0) scale(1.1, 0.95) rotate(-360deg); } /* Scramble back right */
          84% { transform: translate3d(22px, -18px, 0) scale(0.9, 1.15) rotate(-360deg); }
          92% { transform: translate3d(24px, 3px, 0) scale(1.25, 0.75) rotate(-360deg); } /* Landing squash */
          100% { transform: translate3d(24px, 0, 0) scale(1, 1) rotate(-360deg); }
        }

        @keyframes cdLogoSpring {
          0%, 20%, 35%, 62%, 80%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          10% { transform: translate3d(0, 2px, 0) scale(0.99, 0.99); }
          43% { transform: translate3d(0, 2.5px, 0) scale(0.985, 0.985); }
          50% { transform: translate3d(0, 2px, 0) scale(0.985, 0.985); }
          92% { transform: translate3d(0, 3.5px, 0) scale(0.98, 0.98); } /* All 3 land together */
          96% { transform: translate3d(0, -1.5px, 0) scale(1.015, 1.015); } /* Rebound spring */
        }

        @keyframes cdImpactBurst {
          0%, 22%, 32%, 100% { opacity: 0; transform: scale(0.3); }
          26% { opacity: 1; transform: scale(1.35); }
          48% { opacity: 0; transform: scale(0.5); }
          52% { opacity: 0.9; transform: translate3d(-10px, -20px, 0) scale(1.2); }
        }

        .animate-cd-dot-left {
          animation: cdDotLeft 2.2s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }
        .animate-cd-dot-mid {
          animation: cdDotMid 2.2s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }
        .animate-cd-dot-right {
          animation: cdDotRight 2.2s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }
        .animate-cd-logo-spring {
          animation: cdLogoSpring 2.2s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }
        .animate-cd-impact {
          animation: cdImpactBurst 2.2s ease-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-cd-dot-left,
          .animate-cd-dot-mid,
          .animate-cd-dot-right,
          .animate-cd-logo-spring,
          .animate-cd-impact {
            animation: none !important;
          }
        }
      `}} />

      <div className="relative flex flex-col items-center gap-7 z-10 animate-fade-in">
        {/* ─── Interactive Stage: Playful 3 Dots Wrestling Over Logo ──── */}
        <div className="relative flex flex-col items-center justify-center pt-8">
          {/* Collision Starburst Sparkle */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 pointer-events-none z-30 animate-cd-impact">
            <Sparkles className="h-5 w-5 text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.9)]" />
          </div>

          {/* The 3 Playful Bouncing & Wrestling Dots */}
          <div className="relative w-20 h-6 flex items-center justify-center z-20 pointer-events-none mb-1">
            {/* Dot 1: Amber / Gold Coin Dot */}
            <div
              className="absolute h-4 w-4 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.9)] animate-cd-dot-left flex items-center justify-center ring-1 ring-white/40"
              title="Gold Point"
            >
              <span className="absolute top-0.5 left-0.5 h-1 w-1 rounded-full bg-white/90" />
            </div>

            {/* Dot 2: Primary / Indigo Power Dot */}
            <div
              className="absolute h-4 w-4 rounded-full bg-gradient-to-tr from-indigo-600 via-primary to-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.9)] animate-cd-dot-mid flex items-center justify-center ring-1 ring-white/40"
              title="Power Point"
            >
              <span className="absolute top-0.5 left-0.5 h-1 w-1 rounded-full bg-white/90" />
            </div>

            {/* Dot 3: Emerald / Mint Reward Dot */}
            <div
              className="absolute h-4 w-4 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-400 to-teal-200 shadow-[0_0_12px_rgba(16,185,129,0.9)] animate-cd-dot-right flex items-center justify-center ring-1 ring-white/40"
              title="Cash Point"
            >
              <span className="absolute top-0.5 left-0.5 h-1 w-1 rounded-full bg-white/90" />
            </div>
          </div>

          {/* Central Logo Box (Acts as Trampoline for the Dots) */}
          <div className="relative animate-cd-logo-spring">
            {/* Soft glowing halo behind the logo box */}
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-primary/30 via-accent/30 to-emerald-500/20 blur-md pointer-events-none" />

            <div className="relative flex h-18 w-18 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary via-indigo-600 to-accent text-white shadow-2xl shadow-primary/35 ring-1 ring-white/25">
              <Coins className="h-9 w-9 sm:h-10 sm:w-10 text-white drop-shadow-md animate-pulse-scale" />
            </div>
          </div>
        </div>

        {/* ─── Brand Name + Modern Sequential Loading Dots ─────────── */}
        <div className="flex flex-col items-center gap-2 text-center pt-1">
          <div className="flex items-center justify-center gap-1">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-foreground drop-shadow-sm">
              Cash Dash
            </span>

            {/* Modern Animated Sequential Dots */}
            <span className="inline-flex items-center gap-1.5 ms-1.5 mb-0.5">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-bounce [animation-delay:-0.32s] shadow-xs shadow-amber-400/50" />
              <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.16s] shadow-xs shadow-primary/50" />
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce shadow-xs shadow-emerald-400/50" />
            </span>
          </div>

          {/* Elegant Slim Flowing Shimmer Bar */}
          <div className="w-32 sm:w-40 h-1 rounded-full bg-secondary/80 overflow-hidden relative mt-1">
            <div className="h-full w-full bg-gradient-to-r from-transparent via-primary to-transparent animate-shimmer bg-[length:200%_100%]" />
          </div>
        </div>
      </div>
    </div>
  );
}
