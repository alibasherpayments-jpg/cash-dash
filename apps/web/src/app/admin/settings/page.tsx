"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Save,
  CheckCircle2,
  Shield,
  DollarSign,
  Loader2,
  AlertTriangle,
  Mail,
  Globe,
  Coins,
  Trophy,
} from "lucide-react";
import apiClient from "@/lib/api-client";
import { FieldError } from "@/components/ui/field-error";
import { validateEmail } from "@/lib/validation";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState("Cash Dash");
  const [supportEmail, setSupportEmail] = useState("support@cashdash.com");
  const [conversionRate, setConversionRate] = useState("1000");
  const [minWithdrawal, setMinWithdrawal] = useState("100");
  const [referralPercent, setReferralPercent] = useState("10");
  const [leaderboardEnabled, setLeaderboardEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setIsLoading(true);
    apiClient
      .get("/admin/settings")
      .then((res) => {
        const data = res.data?.data || (Array.isArray(res.data) ? res.data : []);
        if (Array.isArray(data)) {
          data.forEach((s: any) => {
            if (s.key === "site_name") setSiteName(s.value);
            if (s.key === "support_email") setSupportEmail(s.value);
            if (s.key === "conversion_rate" || s.key === "points_conversion_rate") setConversionRate(s.value);
            if (s.key === "min_withdrawal_points") setMinWithdrawal(s.value);
            if (s.key === "referral_reward_percent" || s.key === "referral_percentage") setReferralPercent(s.value);
            if (s.key === "leaderboard_enabled") setLeaderboardEnabled(s.value === "true");
            if (s.key === "maintenance_mode") setMaintenanceMode(s.value === "true");
          });
        }
      })
      .catch(() => {
        toast.error("Failed to load settings from server, showing defaults");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    const emailErr = validateEmail(supportEmail);
    if (emailErr) errors.supportEmail = emailErr;

    const rateNum = parseInt(conversionRate, 10);
    if (isNaN(rateNum) || rateNum <= 0) errors.conversionRate = "Conversion rate must be greater than 0";

    const minW = parseInt(minWithdrawal, 10);
    if (isNaN(minW) || minW <= 0) errors.minWithdrawal = "Minimum withdrawal must be greater than 0";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please resolve validation errors before saving");
      return;
    }

    setFieldErrors({});
    setIsSaving(true);

    const payload = {
      site_name: siteName.trim(),
      support_email: supportEmail.trim(),
      conversion_rate: conversionRate.trim(),
      points_conversion_rate: conversionRate.trim(),
      min_withdrawal_points: minWithdrawal.trim(),
      referral_reward_percent: referralPercent.trim(),
      referral_percentage: referralPercent.trim(),
      leaderboard_enabled: String(leaderboardEnabled),
      maintenance_mode: String(maintenanceMode),
    };

    try {
      // Send batch update
      await apiClient.put("/admin/settings", payload);
      setSaved(true);
      toast.success("Platform settings successfully saved and applied in real-time!");
      setTimeout(() => setSaved(false), 4000);
    } catch (err: any) {
      // Fallback to individual updates if batch is unsupported
      try {
        await Promise.all(
          Object.entries(payload).map(([k, v]) =>
            apiClient.put(`/admin/settings/${k}`, { value: v }),
          ),
        );
        setSaved(true);
        toast.success("Platform settings updated successfully!");
        setTimeout(() => setSaved(false), 4000);
      } catch (innerErr: any) {
        toast.error(innerErr.response?.data?.message || "Failed to save settings");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const rateNum = parseInt(conversionRate, 10) || 1000;
  const minWNum = parseInt(minWithdrawal, 10) || 100;
  const minCashValue = (minWNum / rateNum).toFixed(2);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Settings className="h-7 w-7 text-amber-500" /> Platform Configuration
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Global business rules stored in database. Changes apply platform-wide in real-time.
          </p>
        </div>

        {maintenanceMode && (
          <Badge variant="destructive" className="flex items-center gap-1.5 self-start sm:self-auto py-1 px-3">
            <AlertTriangle className="h-3.5 w-3.5" /> Maintenance Mode Active
          </Badge>
        )}
      </div>

      <form onSubmit={handleSave} noValidate className="space-y-6">
        {/* ─── General Settings ────────────────────────────────────── */}
        <Card className="bg-card border-border text-card-foreground shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" /> General Platform Identity
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Platform public brand name and official communication address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Site Name</Label>
                <Input
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="bg-background border-border text-xs h-9 text-foreground"
                  placeholder="Cash Dash"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Support Inquiries Email</Label>
                <Input
                  type="email"
                  hasError={!!fieldErrors.supportEmail}
                  value={supportEmail}
                  onChange={(e) => {
                    setSupportEmail(e.target.value);
                    if (fieldErrors.supportEmail) setFieldErrors((p) => ({ ...p, supportEmail: "" }));
                  }}
                  className="bg-background border-border text-xs h-9 text-foreground"
                  placeholder="support@cashdash.com"
                />
                <FieldError message={fieldErrors.supportEmail} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Earning & Financial Rules ───────────────────────────── */}
        <Card className="bg-card border-border text-card-foreground shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-500" /> Earning & Points Conversion Rules
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Crucial: Controls point values across all wallets, payout calculation, and minimum cashout thresholds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Points per $1.00 USD</span>
                  <Coins className="h-3.5 w-3.5 text-primary" />
                </Label>
                <Input
                  type="number"
                  hasError={!!fieldErrors.conversionRate}
                  value={conversionRate}
                  onChange={(e) => {
                    setConversionRate(e.target.value);
                    if (fieldErrors.conversionRate) setFieldErrors((p) => ({ ...p, conversionRate: "" }));
                  }}
                  className="bg-background border-border text-xs h-9 font-mono text-foreground"
                />
                <FieldError message={fieldErrors.conversionRate} />
                <span className="text-[10px] text-emerald-500 font-mono block">
                  {rateNum.toLocaleString()} pts = $1.00 USD
                </span>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Global Min. Withdrawal (Points)</Label>
                <Input
                  type="number"
                  hasError={!!fieldErrors.minWithdrawal}
                  value={minWithdrawal}
                  onChange={(e) => {
                    setMinWithdrawal(e.target.value);
                    if (fieldErrors.minWithdrawal) setFieldErrors((p) => ({ ...p, minWithdrawal: "" }));
                  }}
                  className="bg-background border-border text-xs h-9 font-mono text-foreground"
                />
                <FieldError message={fieldErrors.minWithdrawal} />
                <span className="text-[10px] text-amber-500 font-mono block">
                  {minWNum.toLocaleString()} pts ≈ ${minCashValue} USD
                </span>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Referral Commission %</Label>
                <Input
                  type="number"
                  value={referralPercent}
                  onChange={(e) => setReferralPercent(e.target.value)}
                  className="bg-background border-border text-xs h-9 font-mono text-foreground"
                />
                <span className="text-[10px] text-muted-foreground block">Calculated on referred user's cashout</span>
              </div>
            </div>

            {/* Live Formula Preview Box */}
            <div className="p-3.5 rounded-xl bg-background/60 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px]">
              <span className="text-muted-foreground">Live Formula Calculation:</span>
              <span className="font-mono text-emerald-500 font-bold">
                1 Point = ${(1 / rateNum).toFixed(6)} USD | Min Cashout = {minWNum.toLocaleString()} Points (${minCashValue})
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ─── Security & Public Features ──────────────────────────── */}
        <Card className="bg-card border-border text-card-foreground shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Operational Modes & Public Visibility
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Live switches that immediately govern user visibility and transaction processing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-background/60 border border-border">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span className="font-bold text-foreground">Public Leaderboard</span>
                  {leaderboardEnabled ? (
                    <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">Active</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground border-border">Disabled</Badge>
                  )}
                </div>
                <span className="text-muted-foreground text-[11px] block">
                  When enabled, shows the Top 10 users by total withdrawals. When disabled, leaderboard content is hidden.
                </span>
              </div>
              <Switch checked={leaderboardEnabled} onCheckedChange={setLeaderboardEnabled} />
            </div>

            <div className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors ${
              maintenanceMode ? "bg-red-500/10 border-red-500/30" : "bg-background/60 border-border"
            }`}>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`h-4 w-4 ${maintenanceMode ? "text-red-400" : "text-muted-foreground"}`} />
                  <span className="font-bold text-foreground">Maintenance Mode</span>
                  {maintenanceMode ? (
                    <Badge variant="destructive" className="text-[10px]">PAUSED</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">Operational</Badge>
                  )}
                </div>
                <span className="text-muted-foreground text-[11px] block">
                  When enabled, temporarily pauses all new withdrawals and offer starts with a clear system maintenance alert.
                </span>
              </div>
              <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center pt-2">
          {saved && (
            <span className="text-emerald-500 font-bold flex items-center gap-1.5 text-xs animate-fade-in">
              <CheckCircle2 className="h-4 w-4" /> System settings updated in database & active immediately!
            </span>
          )}
          <Button
            type="submit"
            disabled={isSaving || isLoading}
            size="lg"
            className="ml-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm"
          >
            {isSaving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
            Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}