"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useWallet } from "@/hooks/use-wallet";
import { useNotifications } from "@/hooks/use-notifications";
import { AvatarWithFallback } from "@/components/common/avatar-with-fallback";
import { OfferAlertsToggle } from "@/components/common/offer-alerts-toggle";
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

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Offerwalls", href: "/offerwalls", icon: Layers },
  { name: "Offers", href: "/offers", icon: Gift },
  { name: "Wallet", href: "/wallet", icon: Wallet },
  { name: "Withdraw", href: "/withdraw", icon: ArrowUpRight },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Support", href: "/support", icon: HelpCircle },
  { name: "Profile", href: "/profile", icon: User },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { summary: wallet } = useWallet();
  const { unreadCount } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

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
            <span>Available Balance</span>
            <Coins className="h-3.5 w-3.5 text-accent" />
          </div>
          <div className="text-xl font-black text-foreground">
            {formatPoints(wallet?.availablePoints || 0)} <span className="text-xs font-semibold text-accent">pts</span>
          </div>
          <div className="text-xs font-medium text-emerald-500 mt-0.5">
            ≈ {formatCash((wallet?.availablePoints || 0) / 1000)}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button size="sm" variant="default" className="h-7 text-xs font-semibold" asChild>
              <Link href="/withdraw">Withdraw</Link>
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs font-semibold" asChild>
              <Link href="/offers">Earn More</Link>
            </Button>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
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
                {item.name === "Notifications" && unreadCount > 0 && (
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
                <span>Admin Panel</span>
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
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={handleLogout} title="Sign Out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </aside>

      {/* ─── Main Content Area ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Top Header */}
        <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-xl px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Mobile Header Brand & Menu */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg border border-border text-foreground hover:bg-accent/10"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Coins className="h-4 w-4 text-white" />
              </div>
              <span className="font-black text-foreground">Cash Dash</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Level 1 Earner • High Trust Tier
            </span>
          </div>

          {/* Right actions: Balance badge, notifications, user menu */}
          <div className="flex items-center gap-2.5 md:gap-4">

            {/* Quick Points Pill */}
            <Link
              href="/wallet"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border/80 hover:border-primary/50 transition-colors shadow-sm"
            >
              <div className="h-5 w-5 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                <Coins className="h-3 w-3" />
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-foreground">{formatPoints(wallet?.availablePoints || 0)}</span>
                <span className="text-[10px] text-muted-foreground block -mt-1 font-medium">
                  {formatCash((wallet?.availablePoints || 0) / 1000)}
                </span>
              </div>
            </Link>

            {/* Theme Switcher */}
            <ThemeSwitcher />

            {/* Live Offer Alerts Button (Beside Notification) */}
            <OfferAlertsToggle />

            {/* Notification Bell */}
            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg" asChild>
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
                <button className="flex items-center gap-2 rounded-lg p-1 hover:bg-accent/10 transition-colors">
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
                    Profile & Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/wallet" className="cursor-pointer">
                    <Wallet className="h-4 w-4 mr-2" />
                    Wallet & Ledger
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/withdraw/history" className="cursor-pointer">
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Withdrawal History
                  </Link>
                </DropdownMenuItem>
                {user?.role === "ADMIN" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer text-amber-500 font-semibold">
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* ─── Mobile Slide-out Drawer ────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex flex-col w-72 max-w-[85vw] bg-card border-r border-border h-full p-6 z-10 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Coins className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-black">Cash Dash</span>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                      isActive ? "bg-primary text-white font-semibold" : "text-muted-foreground hover:bg-accent/10"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-amber-500"
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </nav>

            <div className="pt-4 border-t border-border">
              <Button variant="outline" className="w-full text-destructive" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Mobile Bottom Navigation ──────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-card/95 backdrop-blur-lg border-t border-border flex items-center justify-around h-16 px-2">
        {[
          { name: "Home", href: "/dashboard", icon: LayoutDashboard },
          { name: "Offers", href: "/offers", icon: Gift },
          { name: "Wallet", href: "/wallet", icon: Wallet },
          { name: "Withdraw", href: "/withdraw", icon: ArrowUpRight },
          { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
        ].map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-14 h-12 rounded-lg text-[10px] font-medium transition-colors",
                isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 mb-1" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
