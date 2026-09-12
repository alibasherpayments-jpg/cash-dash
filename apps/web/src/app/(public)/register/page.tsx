"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuthStore();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      await register(username, email, password, referralCode ? referralCode : undefined);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to create account. Username or email might be in use.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border/70 shadow-2xl bg-card">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/25">
            <Coins className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-black tracking-tight">Create Free Account</CardTitle>
          <CardDescription className="text-xs">
            Join CashDash and claim your first rewards immediately
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs font-semibold">Username</Label>
              <Input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_earner_handle"
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="referralCode" className="text-xs font-semibold">Referral Code (Optional)</Label>
                <span className="text-[10px] text-muted-foreground">Bonus Points</span>
              </div>
              <Input
                id="referralCode"
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="e.g. REF-ALEX"
                className="h-10 text-sm"
              />
            </div>

            <div className="text-[11px] text-muted-foreground space-y-1 pt-1">
              <div className="flex items-center gap-1.5 text-emerald-500">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Instant free access to 30+ earning offers</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" disabled={isLoading} className="w-full font-bold h-10">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...
                </>
              ) : (
                "Get Started Free"
              )}
            </Button>

            <div className="text-center text-xs text-muted-foreground">
              Already a member?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Sign In
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
