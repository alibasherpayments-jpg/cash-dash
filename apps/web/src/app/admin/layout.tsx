"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { AvatarWithFallback } from "@/components/common/avatar-with-fallback";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  ShieldAlert,
  LayoutDashboard,
  Users,
  Gift,
  ArrowUpRight,
  CreditCard,
  Bell,
  Settings,
  FileText,
  LifeBuoy,
  ArrowLeft,
  Menu,
  X,
  LogOut,
  Layers,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/common/theme-switcher";

const adminNavItems = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Withdrawals Queue", href: "/admin/withdrawals", icon: ArrowUpRight },
  { name: "Payment Methods", href: "/admin/withdrawal-methods", icon: CreditCard },
  { name: "Offerwalls Networks", href: "/admin/offerwalls", icon: Layers },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Offers Directory", href: "/admin/offers", icon: Gift },
  { name: "Broadcast Notifications", href: "/admin/notifications", icon: Bell },
  { name: "Support Tickets", href: "/admin/support", icon: LifeBuoy },
  { name: "Audit Logs", href: "/admin/audit-logs", icon: FileText },
  { name: "System Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading, setUser } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Refresh user role from database in case role was updated recently
    import("@/lib/api-client").then(({ default: apiClient }) => {
      apiClient
        .get("/auth/me")
        .then((res) => {
          if (res.data?.data) {
            setUser(res.data.data);
          }
        })
        .catch(() => {});
    });
  }, [setUser]);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (user.role !== "ADMIN") {
        const timer = setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, user, pathname, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground font-medium">Verifying administrative credentials...</p>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md w-full p-8 rounded-2xl bg-card border border-rose-500/20 shadow-2xl flex flex-col items-center">
          <div className="h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-6 shadow-lg shadow-rose-500/10">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <Badge variant="outline" className="text-xs bg-rose-500/10 text-rose-400 border-rose-500/30 mb-3 px-3 py-1 font-bold tracking-wider">
            403 • ACCESS DENIED
          </Badge>
          <h1 className="text-2xl font-black text-foreground mb-2">Administrative Console</h1>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            This area is restricted to Cash Dash Administrators only. Your account does not have permission to view or manage this console.
          </p>
          <div className="flex flex-col w-full gap-3">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Member Dashboard
            </Button>
            <p className="text-xs text-muted-foreground">
              Redirecting to member dashboard in 3 seconds...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row transition-colors">
      {/* ─── Admin Desktop Sidebar ─────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card/95 backdrop-blur-md shrink-0 sticky top-0 h-screen z-30">
        {/* Brand */}
        <div className="p-5 border-b border-border/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <Shield className="h-5 w-5 font-bold" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-foreground">Cash Dash</span>
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30 px-1.5 py-0 block w-fit font-bold">
                ADMIN CONSOLE
              </Badge>
            </div>
          </div>
        </div>

        {/* Back to User App Button */}
        <div className="px-4 pt-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-xs border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            asChild
          >
            <Link href="/dashboard">
              <ArrowLeft className="h-3.5 w-3.5 mr-2" />
              Return to Member App
            </Link>
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {adminNavItems.map((item) => {
            const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/15 text-primary border border-primary/30 font-semibold shadow-sm"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Admin User Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <AvatarWithFallback username={user?.username || "Admin"} avatarUrl={user?.profile?.avatarUrl} size="sm" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{user?.username || "Superadmin"}</p>
              <p className="text-[10px] text-muted-foreground truncate">Security Officer</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={handleLogout} title="Sign Out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </aside>

      {/* ─── Admin Content Area ────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 border-b border-border bg-card/85 backdrop-blur-xl px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-bold text-primary flex items-center gap-1.5 text-sm">
              <Shield className="h-4 w-4" /> Admin Console
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Production Operations Environment</span>
            <span>•</span>
            <span className="text-emerald-500 font-medium">All Internal Services Active</span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Theme Selector for Admin Panel */}
            <ThemeSwitcher />

            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs hidden sm:inline-flex">
              System Live
            </Badge>

            <Button size="sm" variant="ghost" className="text-xs text-muted-foreground hover:text-foreground" asChild>
              <Link href="/dashboard">View as Member</Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative flex flex-col w-72 max-w-[85vw] bg-card border-r border-border h-full p-6 z-10">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <span className="font-bold text-primary flex items-center gap-2">
                <Shield className="h-5 w-5" /> Admin Console
              </span>
              <button onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="py-3 border-b border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Theme</span>
              <ThemeSwitcher />
            </div>
            <nav className="flex-1 py-4 space-y-1 overflow-y-auto custom-scrollbar">
              {adminNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-muted"
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
            <div className="pt-4 border-t border-border">
              <Button variant="outline" className="w-full text-foreground border-border" asChild>
                <Link href="/dashboard">Exit to Member App</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
