"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, AlertCircle, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("user@cashdash.io");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillAdmin = () => {
    setEmail("admin@cashdash.io");
    setPassword("Admin@CashDash2024!");
  };

  const handleFillUser = () => {
    setEmail("user@cashdash.io");
    setPassword("Password123!");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border/70 shadow-2xl bg-card">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/25">
            <Coins className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-black tracking-tight">Welcome Back</CardTitle>
          <CardDescription className="text-xs">
            Sign in to access your rewards balance and active offers
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 text-sm"
              />
            </div>

            {/* Quick Demo Credentials Autofill */}
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1.5 tracking-wider">
                Quick Demo Login Autofill:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" size="sm" onClick={handleFillUser} className="text-xs h-7">
                  Demo Member
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={handleFillAdmin} className="text-xs h-7 text-amber-500">
                  Admin Demo
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" disabled={isLoading} className="w-full font-bold h-10">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing In...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <div className="text-center text-xs text-muted-foreground">
              Don't have an account yet?{" "}
              <Link href="/register" className="text-primary font-bold hover:underline">
                Create Free Account
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
