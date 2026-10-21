"use client";

import React from "react";
import { Coins } from "lucide-react";

export function BrandRedirectLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground overflow-hidden select-none">
      {/* Ambient background glow aura */}
      <div className="absolute w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-primary/15 blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute w-60 h-60 rounded-full bg-accent/10 blur-[80px] pointer-events-none -top-10 -end-10" />

      <div className="relative flex flex-col items-center gap-5 z-10 animate-fade-in">
        {/* Animated Brand Badge with Glowing Aura & Particle Points */}
        <div className="relative flex items-center justify-center">
          {/* Outer glowing ripple ring */}
          <div className="absolute -inset-2.5 rounded-3xl bg-gradient-to-tr from-primary/30 via-accent/30 to-primary/10 blur-md animate-pulse" />

          {/* Floating animated points (sparkling reward dots) */}
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-400 shadow-md shadow-amber-400/80 animate-ping" />
          <span className="absolute -bottom-1 -left-1 h-2 w-2 rounded-full bg-primary shadow-md shadow-primary/80 animate-pulse" />
          <span className="absolute top-1/2 -left-3 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping [animation-duration:2.5s]" />
          <span className="absolute -top-2 left-1/4 h-1.5 w-1.5 rounded-full bg-accent animate-pulse [animation-duration:1.5s]" />

          {/* Central Logo Box */}
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary via-indigo-600 to-accent text-white shadow-2xl shadow-primary/30 ring-1 ring-white/20 animate-pulse-scale">
            <Coins className="h-8 w-8 text-white drop-shadow-md" />
          </div>
        </div>

        {/* Brand Name + Modern Pulsing Points */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center justify-center gap-1">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-foreground drop-shadow-sm">
              Cash Dash
            </span>

            {/* Modern Animated Sequential Dots */}
            <span className="inline-flex items-center gap-1.5 ms-1.5 mb-0.5">
              <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.32s] shadow-xs shadow-primary/50" />
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-bounce [animation-delay:-0.16s] shadow-xs shadow-amber-400/50" />
              <span className="h-2 w-2 rounded-full bg-primary animate-bounce shadow-xs shadow-primary/50" />
            </span>
          </div>

          {/* Elegant Slim Flowing Shimmer Bar */}
          <div className="w-28 sm:w-36 h-1 rounded-full bg-secondary/80 overflow-hidden relative mt-1">
            <div className="h-full w-full bg-gradient-to-r from-transparent via-primary to-transparent animate-shimmer bg-[length:200%_100%]" />
          </div>
        </div>
      </div>
    </div>
  );
}
