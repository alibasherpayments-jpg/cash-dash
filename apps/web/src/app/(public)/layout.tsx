import type { ReactNode } from "react";
import { PublicNavbar } from "@/components/common/public-navbar";
import { PublicFooter } from "@/components/common/public-footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
