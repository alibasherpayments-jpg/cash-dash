"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import apiClient from "@/lib/api-client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("mock-reset-token-123");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post("/auth/reset-password", { token, newPassword: password });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to reset password. Token may have expired.");
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
          <CardTitle className="text-2xl font-black tracking-tight">Set New Password</CardTitle>
          <CardDescription className="text-xs">
            Create a secure new password for your CashDash account
          </CardDescription>
        </CardHeader>

        {success ? (
          <CardContent className="space-y-4 text-center py-6">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-base">Password Updated</h4>
            <p className="text-xs text-muted-foreground">
              Your password has been changed successfully. You can now sign in with your new credentials.
            </p>
            <Button className="w-full mt-4 font-bold" asChild>
              <Link href="/login">Sign In Now</Link>
            </Button>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="token" className="text-xs font-semibold">Security Token</Label>
                <Input
                  id="token"
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="h-10 text-sm font-mono text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-semibold">New Password</Label>
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
                <Label htmlFor="confirmPassword" className="text-xs font-semibold">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="h-10 text-sm"
                />
              </div>
            </CardContent>

            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full font-bold h-10">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save New Password"}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
