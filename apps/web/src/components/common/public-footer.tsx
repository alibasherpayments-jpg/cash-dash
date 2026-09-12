"use client";

import React from "react";
import Link from "next/link";
import { Coins } from "lucide-react";
import { useTranslation } from "@/providers/i18n-provider";

export function PublicFooter() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border/50 bg-background/95 py-12 transition-colors">
      <div className="container">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/20">
                <Coins className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="font-black text-foreground leading-none block">Cash Dash</span>
                <span className="block text-[9px] font-bold uppercase tracking-wider text-amber-500 font-sans leading-none mt-1">
                  Rewards
                </span>
              </div>
            </Link>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              {t.footer.tagline}
            </p>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-foreground">{t.footer.product}</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/offers" className="hover:text-foreground transition-colors">
                  {t.footer.offers}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-foreground transition-colors">
                  {t.footer.rewards}
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-foreground transition-colors">
                  {t.footer.leaderboard}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-foreground">{t.footer.company}</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  {t.footer.about}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  {t.footer.contact}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-foreground">{t.footer.support}</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/support" className="hover:text-foreground transition-colors">
                  {t.footer.helpCenter}
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-foreground transition-colors">
                  {t.footer.faq}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-foreground">{t.footer.legal}</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  {t.footer.terms}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  {t.footer.privacy}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border/50 pt-8 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Cash Dash. {t.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
