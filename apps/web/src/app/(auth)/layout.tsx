"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useWallet } from "@/hooks/use-wallet";
import { useNotifications } from "@/hooks/use-notifications";
import { useTranslation } from "@/providers/i18n-provider";
import { AvatarWithFallback } from "@/components/common/avatar-with-fallback";
import { OfferAlertsToggle } from "@/components/common/offer-alerts-toggle";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Coins,
  LayoutDashboard,
  Gift,
  Wallet,
  ArrowUpRight,
  Trophy,
  Bell,
  HelpCircle,
  User,
  LogOut,
  Shield,
  Menu,
  X,
  ChevronDown,
  Layers,
} from "lucide-react";
import { formatPoints, formatCash } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/common/theme-switcher";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  const checkStoredAuth = (): boolean => {
    if (typeof window === "undefined") return false;
    try {
      const raw = localStorage.getItem("cashdash-auth");
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return !!(parsed?.state?.accessToken && parsed?.state?.isAuthenticated);
    } catch {
      return false;
    }
  };

  const hasSession = isAuthenticated || checkStoredAuth();

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated && !checkStoredAuth()) {
      router.replace("/register");
    }
  }, [isAuthenticated, router]);

  const { summary: wallet } = useWallet();
  const { unreadCount } = useNotifications();
  const { t, locale } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: t.common.dashboard, href: "/dashboard", icon: LayoutDashboard },
    { name: t.common.offerwalls, href: "/offerwalls", icon: Layers },
    { name: t.common.offers, href: "/offers", icon: Gift },
    { name: t.common.wallet, href: "/wallet", icon: Wallet },
    { name: t.common.withdraw, href: "/withdraw", icon: ArrowUpRight },
    { name: t.common.leaderboard, href: "/leaderboard", icon: Trophy },
    { name: t.common.notifications, href: "/notifications", icon: Bell },
    { name: t.common.support, href: "/support", icon: HelpCircle },
    { name: t.common.profile, href: "/profile", icon: User },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (!mounted || !hasSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/25 animate-pulse">
            <Coins className="h-6 w-6" />
          </div>
          <p className="text-xs text-muted-foreground font-medium">Redirecting to register...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-foreground">
      {/* ─── Desktop Sidebar ───────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card/40 backdrop-blur-xl shrink-0 sticky top-0 h-screen z-30">
        {/* Brand */}
        <div className="p-6 flex items-center justify-between border-b border-border/50">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
              <Coins className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-foreground">Cash Dash</span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-accent -mt-1">Rewards</span>
            </div>
          </Link>
        </div>

        {/* Balance Card in Sidebar */}
        <div className="p-4 mx-3 my-4 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>{t.common.availableBalance}</span>
            <Coins className="h-3.5 w-3.5 text-accent" />
          </div>
          <div className="text-xl font-black text-foreground">
            {formatPoints(wallet?.availablePoints || 0)} <span className="text-xs font-semibold text-accent">{t.common.pts}</span>
          </div>
          <div className="text-xs font-medium text-emerald-500 mt-0.5">
            ≈ {formatCash((wallet?.availablePoints || 0) / 1000)}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button size="sm" variant="default" className="h-7 text-xs font-semibold" asChild>
              <Link href="/withdraw">{t.common.withdraw}</Link>
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs font-semibold" asChild>
              <Link href="/offers">{t.common.offers}</Link>
            </Button>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            const isNotifs = item.href === "/notifications";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25 font-semibold"
                    : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
                {isNotifs && unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-auto px-1.5 py-0.2 text-[10px] h-4 min-w-4 flex items-center justify-center">
                    {unreadCount}
                  </Badge>
                )}
              </Link>
            );
          })}

          {user?.role === "ADMIN" && (
            <div className="pt-4 mt-4 border-t border-border/50">
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-amber-500 hover:bg-amber-500/10 transition-colors"
              >
                <Shield className="h-4 w-4" />
                <span>{t.nav.adminConsole}</span>
              </Link>
            </div>
          )}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <AvatarWithFallback username={user?.username || "user"} avatarUrl={user?.profile?.avatarUrl} size="sm" />
            <div className="min-w-0">
              <p className="text-xs font-bold truncate text-foreground">{user?.username || "Member"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={handleLogout} title={t.common.logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </aside>

      {/* ─── Main Content Area ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        {/* Top Header */}
        <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-xl px-3 sm:px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Mobile Header Brand & Menu */}
          <div className="flex items-center gap-2 sm:gap-3 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl border border-border/80 text-foreground hover:bg-accent/10 active:scale-95 transition-transform"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-sm shadow-primary/25 shrink-0">
                <Coins className="h-4 w-4 text-white" />
              </div>
              <span className="font-black text-foreground text-base tracking-tight truncate">Cash Dash</span>
            </Link>
          </div>

          <div className="hidden md:block" />

          {/* Right actions: Balance badge, language switcher, theme switcher, alerts toggle, notifications, user menu */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 ml-auto">
            {/* Quick Points Pill */}
            <Link
              href="/wallet"
              className="h-9 flex items-center gap-2 px-2.5 sm:px-3 rounded-xl bg-card border border-border/80 hover:border-primary/50 transition-all shadow-xs shrink-0 active:scale-95"
            >
              <div className="h-5 w-5 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0">
                <Coins className="h-3 w-3" />
              </div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-xs font-black text-foreground">{formatPoints(wallet?.availablePoints || 0)}</span>
                <span className="text-[11px] font-semibold text-muted-foreground hidden sm:inline-block">
                  ({formatCash((wallet?.availablePoints || 0) / 1000)})
                </span>
              </div>
            </Link>

            {/* Language Switcher - visible on tablet & desktop */}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            {/* Theme Switcher - visible on tablet & desktop */}
            <div className="hidden sm:block">
              <ThemeSwitcher />
            </div>

            {/* Live Offer Alerts Button - visible on desktop */}
            <div className="hidden md:block">
              <OfferAlertsToggle />
            </div>

            {/* Notification Bell */}
            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl shrink-0" asChild>
              <Link href="/notifications">
                <Bell className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive animate-pulse" />
                )}
              </Link>
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 rounded-xl p-1 hover:bg-accent/10 transition-colors shrink-0">
                  <AvatarWithFallback username={user?.username || "user"} avatarUrl={user?.profile?.avatarUrl} size="sm" />
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden md:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold">{user?.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    {t.common.profile}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/wallet" className="cursor-pointer">
                    <Wallet className="h-4 w-4 mr-2" />
                    {t.common.wallet}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/leaderboard" className="cursor-pointer">
                    <Trophy className="h-4 w-4 mr-2" />
                    {t.common.leaderboard}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <Layers className="h-4 w-4 mr-2" />
                    {t.profile.tabs.language}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  {t.common.logout}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>

      {/* ─── Mobile Slide-out Drawer ────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col w-80 max-w-[85vw] bg-card border-r border-border h-full p-5 z-10 shadow-2xl overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <Link href="/dashboard" className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-sm shadow-primary/25">
                  <Coins className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="text-base font-black text-foreground block leading-tight">Cash Dash</span>
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wider block">Rewards</span>
                </div>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User Quick Info Card */}
            <div className="p-3 my-3 rounded-xl bg-accent/5 border border-border/60 flex items-center gap-3">
              <AvatarWithFallback username={user?.username || "user"} avatarUrl={user?.profile?.avatarUrl} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold truncate text-foreground">{user?.username || "Member"}</p>
                <p className="text-[10px] text-emerald-500 font-semibold truncate">
                  {formatPoints(wallet?.availablePoints || 0)} pts ({formatCash((wallet?.availablePoints || 0) / 1000)})
                </p>
              </div>
            </div>

            {/* Settings Card: Language, Theme, and Live Alerts */}
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-3 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">{t.profile.tabs.language}</span>
                <LanguageSwitcher />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <span className="text-xs font-semibold text-muted-foreground">Theme</span>
                <ThemeSwitcher />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <span className="text-xs font-semibold text-muted-foreground">Live Offer Alerts</span>
                <OfferAlertsToggle />
              </div>
            </div>

            {/* Navigation links with min-h 44px for comfortable touch targets */}
            <nav className="flex-1 py-1 space-y-1 overflow-y-auto">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;
                const isNotifs = item.href === "/notifications";
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 min-h-[44px] rounded-xl text-sm font-medium transition-colors active:scale-98",
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold shadow-sm shadow-primary/20"
                        : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{item.name}</span>
                    {isNotifs && unreadCount > 0 && (
                      <Badge variant="destructive" className="px-1.5 py-0.2 text-[10px] h-4 min-w-4 flex items-center justify-center">
                        {unreadCount}
                      </Badge>
                    )}
                  </Link>
                );
              })}

              {user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 min-h-[44px] rounded-xl text-sm font-bold text-amber-500 hover:bg-amber-500/10 transition-colors"
                >
                  <Shield className="h-4 w-4 shrink-0" />
                  <span>{t.nav.adminConsole}</span>
                </Link>
              )}
            </nav>

            {/* Logout button */}
            <div className="pt-3 mt-auto border-t border-border">
              <Button
                variant="outline"
                className="w-full h-11 text-destructive hover:text-destructive hover:bg-destructive/10 font-semibold rounded-xl"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t.common.logout}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Mobile Bottom Navigation ──────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-card/95 backdrop-blur-xl border-t border-border flex items-center justify-around px-2 shadow-2xl"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          height: "calc(3.85rem + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {[
          { name: t.common.dashboard, href: "/dashboard", icon: LayoutDashboard },
          { name: t.common.offers, href: "/offers", icon: Gift },
          { name: t.common.wallet, href: "/wallet", icon: Wallet },
          { name: t.common.withdraw, href: "/withdraw", icon: ArrowUpRight },
          { name: t.common.leaderboard, href: "/leaderboard", icon: Trophy },
        ].map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors select-none active:scale-95",
                isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-7 rounded-lg mb-0.5 transition-all",
                  isActive && "bg-primary/15 text-primary"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="truncate max-w-[64px] text-center">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
