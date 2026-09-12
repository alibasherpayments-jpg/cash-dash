"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { AvatarWithFallback } from "@/components/common/avatar-with-fallback";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
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
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Offers", href: "/admin/offers", icon: Gift },
  { name: "Withdrawals", href: "/admin/withdrawals", icon: ArrowUpRight },
  { name: "Withdrawal Methods", href: "/admin/withdrawal-methods", icon: CreditCard },
  { name: "Broadcast Notifications", href: "/admin/notifications", icon: Bell },
  { name: "Support Tickets", href: "/admin/support", icon: LifeBuoy },
  { name: "Audit Logs", href: "/admin/audit-logs", icon: FileText },
  { name: "System Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-slate-100 flex flex-col md:flex-row">
      {/* ─── Admin Desktop Sidebar ─────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-[#10121a] shrink-0 sticky top-0 h-screen z-30">
        {/* Brand */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 shadow-lg shadow-amber-500/25">
              <Shield className="h-5 w-5 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white">CashDash</span>
              <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/30 px-1.5 py-0 block w-fit">
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
            className="w-full justify-start text-xs border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300"
            asChild
          >
            <Link href="/dashboard">
              <ArrowLeft className="h-3.5 w-3.5 mr-2" />
              Return to Member App
            </Link>
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Admin User Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <AvatarWithFallback username={user?.username || "Admin"} avatarUrl={user?.profile?.avatarUrl} size="sm" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.username || "Superadmin"}</p>
              <p className="text-[10px] text-slate-400 truncate">Security Officer</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-400" onClick={handleLogout} title="Sign Out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </aside>

      {/* ─── Admin Content Area ────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 border-b border-slate-800 bg-[#10121a]/90 backdrop-blur-xl px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1.5 rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-bold text-amber-400 flex items-center gap-1.5 text-sm">
              <Shield className="h-4 w-4" /> Admin Console
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-200">Production Demo Environment</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">All Mock Services Operational</span>
          </div>

          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
              System Live
            </Badge>
            <Button size="sm" variant="ghost" className="text-xs text-slate-400 hover:text-white" asChild>
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
          <div className="relative flex flex-col w-72 max-w-[85vw] bg-[#10121a] border-r border-slate-800 h-full p-6 z-10">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="font-bold text-amber-400 flex items-center gap-2">
                <Shield className="h-5 w-5" /> Admin Console
              </span>
              <button onClick={() => setMobileOpen(false)} className="text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
              {adminNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
            <div className="pt-4 border-t border-slate-800">
              <Button variant="outline" className="w-full text-slate-300 border-slate-800" asChild>
                <Link href="/dashboard">Exit to Member App</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
