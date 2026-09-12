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
import { FieldError } from "@/components/ui/field-error";
import { validateEmail } from "@/lib/validation";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuthStore();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const errors: typeof fieldErrors = {};

    const trimmedUser = username.trim();
    if (!trimmedUser) {
      errors.username = "Please choose a username";
    } else if (trimmedUser.length < 3) {
      errors.username = "Username must be at least 3 characters long";
    }

    const emailErr = validateEmail(email);
    if (emailErr) {
      errors.email = emailErr;
    }

    if (!password) {
      errors.password = "Please create a password";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsLoading(true);

    try {
      await register(username, email, password);
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
            Join Cash Dash and claim your first rewards immediately
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} noValidate>
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
                hasError={!!fieldErrors.username}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (fieldErrors.username) setFieldErrors((prev) => ({ ...prev, username: undefined }));
                }}
                placeholder="username"
                className="h-10 text-sm"
              />
              <FieldError message={fieldErrors.username} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
              <Input
                id="email"
                type="email"
                hasError={!!fieldErrors.email}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="name@example.com"
                className="h-10 text-sm"
              />
              <FieldError message={fieldErrors.email} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
              <Input
                id="password"
                type="password"
                hasError={!!fieldErrors.password}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="Minimum 8 characters"
                className="h-10 text-sm"
              />
              <FieldError message={fieldErrors.password} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                hasError={!!fieldErrors.confirmPassword}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                placeholder="Re-enter password"
                className="h-10 text-sm"
              />
              <FieldError message={fieldErrors.confirmPassword} />
            </div>

            <div className="text-[11px] text-muted-foreground space-y-1 pt-1">
              <div className="flex items-center gap-1.5 text-emerald-500">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Instant free access to 30+ earning offers</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" loading={isLoading} className="w-full font-bold h-10">
              {isLoading ? "Creating Account..." : "Get Started Free"}
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
