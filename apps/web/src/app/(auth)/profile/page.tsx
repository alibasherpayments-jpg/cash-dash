"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AvatarWithFallback } from "@/components/common/avatar-with-fallback";
import { User, Shield, Bell, Lock, CheckCircle2, Save } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"PERSONAL" | "SECURITY" | "PREFERENCES" | "PRIVACY">("PERSONAL");
  const [saved, setSaved] = useState(false);

  // Form states
  const [country, setCountry] = useState(user?.profile?.country || "US");
  const [bio, setBio] = useState(user?.profile?.bio || "Active gamer & digital survey earner");
  const [leaderboardVisible, setLeaderboardVisible] = useState(user?.profile?.isLeaderboardVisible ?? true);
  const [emailRewardNotifs, setEmailRewardNotifs] = useState(true);
  const [emailWithdrawalNotifs, setEmailWithdrawalNotifs] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ─── Profile Header ──────────────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <AvatarWithFallback username={user?.username || "user"} avatarUrl={user?.profile?.avatarUrl} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-foreground">{user?.username}</h1>
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                {user?.role || "MEMBER"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            <p className="text-[11px] text-muted-foreground/80 mt-1">
              Member since {new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-muted-foreground uppercase font-bold block">Account Status</span>
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs">
            ● Active & Verified
          </Badge>
        </div>
      </div>

      {/* ─── Tab Navigation ──────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { label: "Personal Information", value: "PERSONAL", icon: User },
          { label: "Security & Passwords", value: "SECURITY", icon: Lock },
          { label: "Notification Settings", value: "PREFERENCES", icon: Bell },
          { label: "Privacy & Visibility", value: "PRIVACY", icon: Shield },
        ].map((tab) => {
          const isActive = activeTab === tab.value;
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                  : "bg-card text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── Tab 1: Personal Info ─────────────────────────────────── */}
      {activeTab === "PERSONAL" && (
        <Card className="border-border shadow-md">
          <form onSubmit={handleSave} noValidate>
            <CardHeader>
              <CardTitle className="text-base font-bold">Personal Information</CardTitle>
              <CardDescription className="text-xs">
                Update your public username display and geographic region
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Username</Label>
                  <Input disabled value={user?.username || ""} className="h-9 text-xs bg-muted/40" />
                  <span className="text-[10px] text-muted-foreground">Usernames cannot be changed once set</span>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Email Address</Label>
                  <Input disabled value={user?.email || ""} className="h-9 text-xs bg-muted/40" />
                  <span className="text-[10px] text-muted-foreground">Primary verified contact address</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Country Code</Label>
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="US / UK / DE / CA"
                  className="h-9 text-xs max-w-xs uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Bio / Tagline</Label>
                <Input
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell other earners about your favorite tasks"
                  className="h-9 text-xs"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-border pt-4">
              {saved && (
                <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Changes saved successfully!
                </span>
              )}
              <Button type="submit" size="sm" className="ml-auto font-bold">
                <Save className="mr-1.5 h-4 w-4" /> Save Profile
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* ─── Tab 2: Security ─────────────────────────────────────── */}
      {activeTab === "SECURITY" && (
        <Card className="border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-base font-bold">Security & Authentication</CardTitle>
            <CardDescription className="text-xs">
              Manage your password and multi-factor authentication security keys
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-xs">
            <div className="p-4 rounded-xl bg-accent/5 border border-border flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-foreground">Email Verification</h4>
                <p className="text-muted-foreground text-xs">Your registered email address is verified</p>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs">
                Verified
              </Badge>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-sm text-foreground">Change Password</h4>
              <div className="space-y-2 max-w-md">
                <Input type="password" placeholder="Current Password" className="h-9 text-xs" />
                <Input type="password" placeholder="New Password (min 8 chars)" className="h-9 text-xs" />
                <Input type="password" placeholder="Confirm New Password" className="h-9 text-xs" />
              </div>
              <Button size="sm" className="font-bold mt-2">
                Update Password
              </Button>
            </div>

            <div className="p-4 rounded-xl bg-accent/5 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-foreground">Two-Factor Authentication (2FA)</h4>
                  <p className="text-muted-foreground text-xs">
                    Require an authenticator app code for sensitive reward withdrawals
                  </p>
                </div>
                <Badge variant="outline" className="text-amber-500 border-amber-500/30 text-[10px]">
                  Configurable in Settings
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Tab 3: Notifications ─────────────────────────────────── */}
      {activeTab === "PREFERENCES" && (
        <Card className="border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-base font-bold">Notification Preferences</CardTitle>
            <CardDescription className="text-xs">
              Choose which events trigger instant notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div>
                <p className="font-bold text-foreground">Offer & Reward Credits</p>
                <p className="text-muted-foreground text-[11px]">Notify me when points are credited from an offer</p>
              </div>
              <Switch checked={emailRewardNotifs} onCheckedChange={setEmailRewardNotifs} />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border">
              <div>
                <p className="font-bold text-foreground">Withdrawal Payout Updates</p>
                <p className="text-muted-foreground text-[11px]">Alert me when my payout transitions to Processing or Paid</p>
              </div>
              <Switch checked={emailWithdrawalNotifs} onCheckedChange={setEmailWithdrawalNotifs} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Tab 4: Privacy ──────────────────────────────────────── */}
      {activeTab === "PRIVACY" && (
        <Card className="border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-base font-bold">Privacy & Public Visibility</CardTitle>
            <CardDescription className="text-xs">
              Control whether your username appears in global platform leaderboards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-bold text-foreground">Show in Public Leaderboard</p>
                <p className="text-muted-foreground text-[11px]">
                  When enabled, your username and rank appear in the Top 10 withdrawn rankings
                </p>
              </div>
              <Switch checked={leaderboardVisible} onCheckedChange={setLeaderboardVisible} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
