"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";

export default function ReferralsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="max-w-md mx-auto py-24 text-center space-y-4">
      <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
        <Users className="h-6 w-6" />
      </div>
      <h3 className="font-bold text-lg">Referral Program Discontinued</h3>
      <p className="text-xs text-muted-foreground">
        The referral system has been discontinued. Redirecting you back to the Dashboard...
      </p>
      <div className="pt-2">
        <Button asChild size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Return to Dashboard
          </Link>
        </Button>
      </div>

    </div>
  );
}
