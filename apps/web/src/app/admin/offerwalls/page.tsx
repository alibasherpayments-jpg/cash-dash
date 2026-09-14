"use client";

import React, { useState, useEffect } from "react";
import apiClient from "@/lib/api-client";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Layers,
  Plus,
  Edit,
  ExternalLink,
  Shield,
  ShieldCheck,
  Zap,
  Globe,
  Settings,
  CheckCircle,
  CheckCircle2,
  Check,
  Copy,
  Terminal,
  Activity,
  Trash2,
  Lock,
  Flame,
  Key,
  Loader2,
  AlertCircle,
  Play,
} from "lucide-react";
import { FieldError } from "@/components/ui/field-error";
import { formatPoints } from "@/lib/formatters";

interface OfferwallItem {
  id: string;
  name: string;
  slug: string;
  type: string;
  badge: string;
  rating: number;
  avgPayout: string;
  devices: string[];
  postbackUrl: string;
  webhookSecret: string;
  isActive: boolean;
  completionsCount: number;
}

export default function AdminOfferwallsPage() {
  const [offerwalls, setOfferwalls] = useState<OfferwallItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [testModalWall, setTestModalWall] = useState<OfferwallItem | null>(null);
  const [testUserId, setTestUserId] = useState("admin");
  const [testPoints, setTestPoints] = useState("500");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/providers");
      const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      const apiHost = "https://api-production-8237.up.railway.app";
      const mapped: OfferwallItem[] = list.map((p: any) => {
        let postback = "";
        if (p.slug === "taskwall") {
          postback = `${apiHost}/api/v1/webhooks/providers/taskwall?userid={userid}&offer_id={offer_id}&offer_name={offer_name}&payout={payout}&tx_id={tx_id}`;
        } else if (p.slug === "cpalead") {
          postback = `${apiHost}/api/v1/webhooks/providers/cpalead?subid={subid}&payout={payout}&lead_id={lead_id}&campaign_name={campaign_name}`;
        } else if (p.slug === "clickwall") {
          postback = `${apiHost}/api/v1/webhooks/providers/clickwall?user_id={user_id}&points={points}&trans_id={trans_id}`;
        } else if (p.slug === "pixylabs") {
          postback = `${apiHost}/api/v1/webhooks/providers/pixylabs?user_id={user_id}&subid={subid}&payout={payout}&points={points}&tx_id={tx_id}`;
        } else {
          postback = `${apiHost}/api/v1/webhooks/providers/${p.slug}?user_id={user_id}&points={points}&tx_id={tx_id}`;
        }

        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          type: (p.type || "TASKS").toUpperCase(),
          badge:
            p.slug === "taskwall"
              ? "Instant Clearance"
              : p.slug === "cpalead"
              ? "Fastest Approval"
              : p.slug === "pixylabs"
              ? "High Payouts"
              : "Instant Clicks",
          rating: 4.9,
          avgPayout: "$1.00 - $25.00",
          devices: ["Web", "Android", "iOS"],
          postbackUrl: postback,
          webhookSecret: p.webhookSecret || `${p.slug}-secret-cashdash`,
          isActive: p.isActive,
          completionsCount: p.offersCount || 0,
        };
      });
      setOfferwalls(mapped);
    } catch (err) {
      console.error("Failed to load providers:", err);
      setOfferwalls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  // New Wall Form State
  const [newWall, setNewWall] = useState({
    name: "",
    slug: "",
    type: "OFFERWALL",
    badge: "+10% Boost",
    avgPayout: "$1.00 - $20.00",
    devices: "Desktop, Android, iOS",
    webhookSecret: `sec_${Math.random().toString(36).substring(2, 10)}`,
    isActive: true,
  });
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await apiClient.patch(`/admin/providers/${id}`, { isActive: !current });
      setOfferwalls((prev) =>
        prev.map((w) => (w.id === id ? { ...w, isActive: !current } : w))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update offerwall status");
    }
  };

  const handleDeleteWall = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate and remove this offerwall provider?")) return;
    try {
      await apiClient.delete(`/admin/providers/${id}`);
      setOfferwalls((prev) => prev.filter((w) => w.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete offerwall provider");
    }
  };

  const handleCreateWall = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!newWall.name.trim()) errors.name = "Company / network name is required";
    if (!newWall.slug.trim()) errors.slug = "Identifier slug is required";
    if (!newWall.webhookSecret.trim()) errors.webhookSecret = "Webhook secret token is required";

    if (Object.keys(errors).length > 0) {
      setAddErrors(errors);
      return;
    }

    setAddErrors({});
    const slugFormatted = newWall.slug.toLowerCase().replace(/\s+/g, "-");
    try {
      await apiClient.post("/admin/providers", {
        name: newWall.name,
        slug: slugFormatted,
        type: newWall.type,
        webhookSecret: newWall.webhookSecret,
        isActive: newWall.isActive,
      });
      await fetchProviders();
      setIsAddModalOpen(false);
      setNewWall({
        name: "",
        slug: "",
        type: "OFFERWALL",
        badge: "+10% Boost",
        avgPayout: "$1.00 - $20.00",
        devices: "Desktop, Android, iOS",
        webhookSecret: `sec_${Math.random().toString(36).substring(2, 10)}`,
        isActive: true,
      });
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create offerwall provider");
    }
  };

  const handleRunTestPostback = async () => {
    if (!testModalWall) return;
    setIsTesting(true);
    setTestResult(null);

    try {
      const txId = `TEST-${Date.now()}`;
      const res = await apiClient.post(
        `/webhooks/providers/${testModalWall.slug}?response_format=json`,
        {
          sub_id: testUserId,
          points: Number(testPoints),
          tx_id: txId,
          offer_name: `Admin Test Task (${testModalWall.name})`,
        },
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = res.data;
      if (data?.credited) {
        setTestResult(
          `✅ SUCCESS: Real postback processed! Credited +${data.points} points ($${(data.points / 1000).toFixed(2)}) to user '${data.username || testUserId}'. Event Tx: ${data.txId}`
        );
        setOfferwalls((prev) =>
          prev.map((w) =>
            w.id === testModalWall.id ? { ...w, completionsCount: w.completionsCount + 1 } : w
          )
        );
      } else if (data?.message === "Already processed") {
        setTestResult(`⚠️ NOTICE: Duplicate transaction '${txId}' already processed. Idempotency test passed.`);
      } else {
        setTestResult(`✅ Webhook response: ${JSON.stringify(data)}`);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Postback failed";
      setTestResult(`❌ FAILED: ${Array.isArray(msg) ? msg.join(", ") : msg}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Layers className="h-7 w-7 text-amber-500" /> Offerwalls & Partners Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Add new offerwall networks, configure postback webhook URLs, secrets, and test live postback callbacks
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Add New Offerwall Company
        </Button>
      </div>

      {/* ─── Metrics Summary ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border p-5 rounded-2xl shadow-sm">
          <span className="text-xs text-muted-foreground font-semibold uppercase">Total Networks</span>
          <div className="text-2xl font-black text-foreground mt-1">{offerwalls.length}</div>
          <span className="text-[11px] text-emerald-500 font-medium block mt-0.5">
            {offerwalls.filter((w) => w.isActive).length} active in production
          </span>
        </Card>

        <Card className="bg-card border-border p-5 rounded-2xl shadow-sm">
          <span className="text-xs text-muted-foreground font-semibold uppercase">Total Completions</span>
          <div className="text-2xl font-black text-amber-500 mt-1">
            {formatPoints(offerwalls.reduce((acc, w) => acc + w.completionsCount, 0))}
          </div>
          <span className="text-[11px] text-muted-foreground font-medium block mt-0.5">
            All postback events verified
          </span>
        </Card>

        <Card className="bg-card border-border p-5 rounded-2xl shadow-sm">
          <span className="text-xs text-muted-foreground font-semibold uppercase">Conversion Ratio</span>
          <div className="text-2xl font-black text-emerald-500 mt-1">1,000 : $1.00</div>
          <span className="text-[11px] text-muted-foreground font-medium block mt-0.5">
            Min. Cashout: 100 pts ($0.10)
          </span>
        </Card>

        <Card className="bg-card border-border p-5 rounded-2xl shadow-sm">
          <span className="text-xs text-muted-foreground font-semibold uppercase">Postback Security</span>
          <div className="text-2xl font-black text-foreground mt-1 flex items-center gap-1.5">
            <ShieldCheck className="h-6 w-6 text-emerald-500" />
            <span>Encrypted</span>
          </div>
          <span className="text-[11px] text-emerald-500 font-medium block mt-0.5">
            HMAC-SHA256 signature check
          </span>
        </Card>
      </div>

      {/* ─── Offerwalls Networks Table ───────────────────────────── */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="p-5 pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> Integrated Offerwall Networks
            </CardTitle>
            <Badge variant="outline" className="text-xs text-muted-foreground border-border">
              {offerwalls.length} Configured
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider bg-slate-900/40">
                <tr>
                  <th className="py-3.5 px-5 font-semibold">Company / Network</th>
                  <th className="py-3.5 px-5 font-semibold">Type & Target</th>
                  <th className="py-3.5 px-5 font-semibold">Postback Webhook URL</th>
                  <th className="py-3.5 px-5 font-semibold">Secret Key</th>
                  <th className="py-3.5 px-5 font-semibold">Avg Payout</th>
                  <th className="py-3.5 px-5 font-semibold">Status</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Loader2 className="h-5 w-5 animate-spin text-amber-500 mx-auto mb-2" />
                      Loading offerwalls from database...
                    </td>
                  </tr>
                ) : offerwalls.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No offerwall networks found. Add your first network above.
                    </td>
                  </tr>
                ) : (
                  offerwalls.map((wall) => (
                  <tr key={wall.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 font-bold flex items-center justify-center text-xs border border-amber-500/20">
                          {wall.name.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{wall.name}</p>
                          <span className="text-[10px] text-slate-400 font-mono">slug: {wall.slug}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-[10px] bg-slate-800 text-slate-300 border-slate-700">
                          {wall.type}
                        </Badge>
                        <p className="text-[10px] text-slate-400">{wall.devices.join(", ")}</p>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5 max-w-sm">
                        <code className="text-[11px] font-mono text-amber-300/90 bg-slate-900/90 px-2 py-1 rounded border border-slate-800 truncate block">
                          {wall.postbackUrl}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(wall.postbackUrl, wall.id)}
                          className="h-7 w-7 p-0 shrink-0 text-slate-400 hover:text-white"
                        >
                          {copiedId === wall.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </td>

                    <td className="py-4 px-5 font-mono text-slate-400 text-[11px]">
                      ••••••••{wall.webhookSecret.slice(-4)}
                    </td>

                    <td className="py-4 px-5 font-bold text-emerald-400">
                      {wall.avgPayout}
                    </td>

                    <td className="py-4 px-5">
                      <button
                        onClick={() => handleToggleActive(wall.id, wall.isActive)}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                          wall.isActive
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {wall.isActive ? "Active" : "Disabled"}
                      </button>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setTestModalWall(wall)}
                          className="h-7 text-[11px] border-amber-500/30 text-amber-400 hover:bg-amber-500/10 font-bold"
                        >
                          <Play className="h-3 w-3 mr-1" /> Test Postback
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteWall(wall.id)}
                          className="h-7 w-7 p-0 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ─── Add Offerwall Network Modal ──────────────────────────── */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-card border-border text-card-foreground max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-foreground flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Add New Offerwall Company
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Integrate a new provider network. Cash Dash will assign an encrypted postback URL and signature key.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateWall} noValidate className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-slate-300">Company / Network Name</Label>
                <Input
                  placeholder="e.g. Monlix, Lootably, Torox"
                  hasError={!!addErrors.name}
                  value={newWall.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setNewWall((prev) => ({
                      ...prev,
                      name,
                      slug: prev.slug ? prev.slug : name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
                    }));
                    if (addErrors.name) setAddErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  className="bg-slate-900 border-slate-800 text-white"
                />
                <FieldError message={addErrors.name} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300">Identifier Slug</Label>
                <Input
                  placeholder="e.g. monlix"
                  hasError={!!addErrors.slug}
                  value={newWall.slug}
                  onChange={(e) => {
                    setNewWall((prev) => ({ ...prev, slug: e.target.value }));
                    if (addErrors.slug) setAddErrors((prev) => ({ ...prev, slug: "" }));
                  }}
                  className="bg-slate-900 border-slate-800 text-white font-mono"
                />
                <FieldError message={addErrors.slug} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-slate-300">Offer Type</Label>
                <Select
                  value={newWall.type}
                  onValueChange={(v) => setNewWall((prev) => ({ ...prev, type: v }))}
                >
                  <SelectTrigger className="bg-slate-900 border-slate-800 text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    <SelectItem value="OFFERWALL">General Offerwall</SelectItem>
                    <SelectItem value="SURVEYS">Market Research Surveys</SelectItem>
                    <SelectItem value="GAMES">Mobile Games & Milestones</SelectItem>
                    <SelectItem value="TASKS">Microtasks & Installs</SelectItem>
                    <SelectItem value="FINANCE">Financial Apps & Trials</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300">Bonus Points Multiplier</Label>
                <Input
                  placeholder="e.g. +20% Boost"
                  value={newWall.badge}
                  onChange={(e) => setNewWall((prev) => ({ ...prev, badge: e.target.value }))}
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-slate-300">Average Payout Range</Label>
                <Input
                  placeholder="e.g. $1.00 - $35.00"
                  value={newWall.avgPayout}
                  onChange={(e) => setNewWall((prev) => ({ ...prev, avgPayout: e.target.value }))}
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300">Supported Devices</Label>
                <Input
                  placeholder="Desktop, Android, iOS"
                  value={newWall.devices}
                  onChange={(e) => setNewWall((prev) => ({ ...prev, devices: e.target.value }))}
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300">Webhook Secret Token</Label>
              <div className="flex gap-2">
                <Input
                  hasError={!!addErrors.webhookSecret}
                  value={newWall.webhookSecret}
                  onChange={(e) => {
                    setNewWall((prev) => ({ ...prev, webhookSecret: e.target.value }));
                    if (addErrors.webhookSecret) setAddErrors((prev) => ({ ...prev, webhookSecret: "" }));
                  }}
                  className="bg-slate-900 border-slate-800 text-white font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setNewWall((prev) => ({
                      ...prev,
                      webhookSecret: `sec_${Math.random().toString(36).substring(2, 12)}`,
                    }))
                  }
                  className="border-slate-800 text-xs"
                >
                  Regenerate
                </Button>
              </div>
              <FieldError message={addErrors.webhookSecret} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <Label className="font-bold text-white">Enable Immediately</Label>
                <p className="text-[11px] text-slate-400">Display this provider on the user Offerwalls Hub</p>
              </div>
              <Switch
                checked={newWall.isActive}
                onCheckedChange={(c) => setNewWall((prev) => ({ ...prev, isActive: c }))}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="border-slate-800 text-slate-400"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold">
                Save & Deploy Provider
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Test Postback Simulator Modal ────────────────────────── */}
      <Dialog open={!!testModalWall} onOpenChange={(open) => !open && setTestModalWall(null)}>
        <DialogContent className="bg-card border-border text-card-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" /> Test Postback: {testModalWall?.name}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Simulate an incoming callback webhook from this partner network to test instant ledger balance crediting.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-foreground">Target Username / ID</Label>
              <Input
                value={testUserId}
                onChange={(e) => setTestUserId(e.target.value)}
                placeholder="admin"
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-foreground">Points to Award</Label>
              <Input
                type="number"
                value={testPoints}
                onChange={(e) => setTestPoints(e.target.value)}
                placeholder="500"
                className="bg-background border-border text-foreground font-mono"
              />
              <span className="text-[11px] text-emerald-500 block mt-0.5 font-medium">
                ≈ ${(Number(testPoints) / 1000).toFixed(2)} USD Value (1,000 pts = $1.00)
              </span>
            </div>

            {testResult && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs leading-relaxed animate-in fade-in">
                {testResult}
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                onClick={() => setTestModalWall(null)}
                className="border-border text-foreground hover:bg-accent"
              >
                Close
              </Button>
              <Button
                disabled={isTesting}
                onClick={handleRunTestPostback}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Simulating...
                  </>
                ) : (
                  <>
                    <Play className="mr-1.5 h-3.5 w-3.5" /> Fire Test Postback
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
