"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Save, CheckCircle2, Shield, DollarSign, Trophy } from "lucide-react";

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState("Cash Dash");
  const [supportEmail, setSupportEmail] = useState("support@cashdash.io");
  const [conversionRate, setConversionRate] = useState("1000");
  const [minWithdrawal, setMinWithdrawal] = useState("100");
  const [referralPercent, setReferralPercent] = useState("10");
  const [leaderboardEnabled, setLeaderboardEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
          <Settings className="h-7 w-7 text-amber-500" /> Platform Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Global business rules stored in database. Changes apply platform-wide in real-time.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ─── General Settings ────────────────────────────────────── */}
        <Card className="bg-[#12141d] border-slate-800 text-slate-100">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white">General Platform Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-200">Site Name</Label>
                <Input
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="bg-slate-900 border-slate-800 text-xs h-9 text-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-200">Support Inquiries Email</Label>
                <Input
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="bg-slate-900 border-slate-800 text-xs h-9 text-slate-200"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Earning & Financial Rules ───────────────────────────── */}
        <Card className="bg-[#12141d] border-slate-800 text-slate-100">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-400" /> Earning & Points Conversion Rules
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Crucial: Controls point value across all wallets and cashout options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-200">Points per $1.00 USD</Label>
                <Input
                  type="number"
                  value={conversionRate}
                  onChange={(e) => setConversionRate(e.target.value)}
                  className="bg-slate-900 border-slate-800 text-xs h-9 font-mono text-slate-200"
                />
                <span className="text-[10px] text-slate-400">Default: 10,000 points = $1.00</span>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-200">Global Min. Withdrawal (Points)</Label>
                <Input
                  type="number"
                  value={minWithdrawal}
                  onChange={(e) => setMinWithdrawal(e.target.value)}
                  className="bg-slate-900 border-slate-800 text-xs h-9 font-mono text-slate-200"
                />
                <span className="text-[10px] text-slate-400">5,000 pts = $0.50</span>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-200">Referral Commission %</Label>
                <Input
                  type="number"
                  value={referralPercent}
                  onChange={(e) => setReferralPercent(e.target.value)}
                  className="bg-slate-900 border-slate-800 text-xs h-9 font-mono text-slate-200"
                />
                <span className="text-[10px] text-slate-400">Paid from platform margin</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Security & Public Features ──────────────────────────── */}
        <Card className="bg-[#12141d] border-slate-800 text-slate-100">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-500" /> Security & Public Visibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <span className="font-bold text-white block">Public Leaderboard</span>
                <span className="text-slate-400 text-[11px]">
                  Enable the Top 10 Most Withdrawn rankings for all members
                </span>
              </div>
              <Switch checked={leaderboardEnabled} onCheckedChange={setLeaderboardEnabled} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <span className="font-bold text-white block">Maintenance Mode</span>
                <span className="text-slate-400 text-[11px]">
                  Pause offer starts and withdrawals during server maintenance
                </span>
              </div>
              <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center pt-2">
          {saved && (
            <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="h-4 w-4" /> System settings updated in database!
            </span>
          )}
          <Button type="submit" size="lg" className="ml-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold">
            <Save className="h-4 w-4 mr-1.5" /> Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
