"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import apiClient from "@/lib/api-client";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"pending" | "verified" | "error">("pending");
  const [isLoading, setIsLoading] = useState(false);

  const handleSimulateVerify = async () => {
    setIsLoading(true);
    try {
      await apiClient.post("/auth/verify-email", { token: "demo-verification-token" });
      setStatus("verified");
    } catch {
      setStatus("verified"); // Demo simulation
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border/70 shadow-2xl bg-card text-center">
        <CardHeader className="space-y-2">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            {status === "verified" ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            ) : (
              <Mail className="h-6 w-6" />
            )}
          </div>
          <CardTitle className="text-2xl font-black tracking-tight">
            {status === "verified" ? "Email Verified!" : "Verify Your Email"}
          </CardTitle>
          <CardDescription className="text-xs">
            {status === "verified"
              ? "Your email address has been verified. You now have full access to rewards."
              : "We sent a confirmation link to your registered email address."}
          </CardDescription>
        </CardHeader>

        <CardContent className="py-4 space-y-4">
          {status === "verified" ? (
            <p className="text-xs text-muted-foreground">
              Thank you for confirming your account. You can now start earning points and requesting withdrawals.
            </p>
          ) : (
            <div className="p-4 rounded-xl bg-card border border-border text-xs text-muted-foreground space-y-2">
              <p>Please click the link in your email to activate account withdrawals.</p>
              <p className="text-[11px] text-amber-500 font-medium">
                (For development & testing, you can click the button below to simulate verification)
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          {status === "verified" ? (
            <Button className="w-full font-bold" asChild>
              <Link href="/dashboard">
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button onClick={handleSimulateVerify} disabled={isLoading} className="w-full font-bold">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Simulate Instant Verification
              </Button>
              <Button variant="ghost" size="sm" asChild className="text-xs">
                <Link href="/dashboard">Skip for now & go to dashboard</Link>
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
