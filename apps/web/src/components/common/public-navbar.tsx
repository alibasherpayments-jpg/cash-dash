"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { useTranslation } from "@/providers/i18n-provider";
import { Coins, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/common/theme-switcher";
import { LanguageSwitcher } from "@/components/common/language-switcher";

export function PublicNavbar() {
  const { isAuthenticated } = useAuthStore();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: t.nav.features, href: "/#features" },
    { label: t.nav.howItWorks, href: "/#how-it-works" },
    { label: t.common.leaderboard, href: "/#leaderboard" },
    { label: t.nav.faq, href: "/#faq" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
            <Coins className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-foreground leading-none block">Cash Dash</span>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-500 font-sans leading-none mt-1">Rewards</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 md:flex">
          <LanguageSwitcher />
          <ThemeSwitcher />
          {isAuthenticated ? (
            <Button asChild>
              <Link href="/dashboard">{t.common.dashboard}</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">{t.nav.signIn}</Link>
              </Button>
              <Button asChild>
                <Link href="/register">{t.nav.getStarted}</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 md:hidden">
          <LanguageSwitcher showLabel={false} />
          <ThemeSwitcher />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl text-foreground hover:bg-accent/10 active:scale-95 transition-transform"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/60 bg-background/95 backdrop-blur-xl px-4 py-5 md:hidden animate-fade-in shadow-xl">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center min-h-[44px] px-3 rounded-xl text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent/10 active:scale-98 transition-all"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-3 flex flex-col gap-2.5 border-t border-border/60 pt-4">
              {isAuthenticated ? (
                <Button asChild className="w-full h-11 font-bold rounded-xl shadow-md">
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                    {t.common.dashboard}
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild className="w-full h-11 font-semibold rounded-xl">
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      {t.nav.signIn}
                    </Link>
                  </Button>
                  <Button asChild className="w-full h-11 font-bold rounded-xl shadow-md">
                    <Link href="/register" onClick={() => setMobileOpen(false)}>
                      {t.nav.getStarted}
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
