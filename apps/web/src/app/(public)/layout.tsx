import type { ReactNode } from "react";
import { PublicNavbar } from "@/components/common/public-navbar";
import { Coins } from "lucide-react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/50 bg-background py-12">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/20">
                  <Coins className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="font-black text-foreground leading-none block">Cash Dash</span>
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-amber-500 font-sans leading-none mt-1">Rewards</span>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Earn real rewards by completing tasks and surveys.</p>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold">Product</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/offers" className="hover:text-foreground">Offers</a></li>
                <li><a href="/dashboard" className="hover:text-foreground">Rewards</a></li>
                <li><a href="/leaderboard" className="hover:text-foreground">Leaderboard</a></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold">Company</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/about" className="hover:text-foreground">About</a></li>
                <li><a href="/contact" className="hover:text-foreground">Contact</a></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold">Support</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/support" className="hover:text-foreground">Help Center</a></li>
                <li><a href="/#faq" className="hover:text-foreground">FAQ</a></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold">Legal</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/terms" className="hover:text-foreground">Terms</a></li>
                <li><a href="/privacy" className="hover:text-foreground">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-border/50 pt-8 text-center text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Cash Dash. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
