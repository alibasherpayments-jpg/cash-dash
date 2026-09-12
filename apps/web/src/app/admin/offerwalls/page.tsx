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
  Trash2,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  ExternalLink,
  Flame,
  Key,
  Globe,
  Loader2,
  AlertCircle,
  Play,
  CheckCircle2,
} from "lucide-react";
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

const INITIAL_OFFERWALLS: OfferwallItem[] = [
  {
    id: "ow-taskwall",
    name: "Taskwall.io",
    slug: "taskwall",
    type: "TASKS",
    badge: "Instant Clearance",
    rating: 4.9,
    avgPayout: "$1.00 - $25.00",
    devices: ["Web", "Android", "iOS"],
    postbackUrl: "https://api-production-8237.up.railway.app/api/v1/webhooks/providers/taskwall?userid={userid}&offer_id={offer_id}&offer_name={offer_name}&payout={payout}&tx_id={tx_id}",
    webhookSecret: "taskwall-secret-cashdash",
    isActive: true,
    completionsCount: 2450,
  },
  {
    id: "ow-cpalead",
    name: "CPALead",
    slug: "cpalead",
    type: "CPI_OFFERS",
    badge: "Fastest Approval",
    rating: 4.8,
    avgPayout: "$0.50 - $12.00",
    devices: ["Multi-Device", "Android", "iOS"],
    postbackUrl: "https://api-production-8237.up.railway.app/api/v1/webhooks/providers/cpalead?subid={subid}&payout={payout}&lead_id={lead_id}&campaign_name={campaign_name}",
    webhookSecret: "cpalead-secret-cashdash",
    isActive: true,
    completionsCount: 3840,
  },
  {
    id: "ow-clickwall",
    name: "ClickWall.io",
    slug: "clickwall",
    type: "PTC_CLICKS",
    badge: "Instant Clicks",
    rating: 4.9,
    avgPayout: "$0.10 - $5.00",
    devices: ["Desktop", "Android", "iOS"],
    postbackUrl: "https://api-production-8237.up.railway.app/api/v1/webhooks/providers/clickwall?user_id={user_id}&points={points}&trans_id={trans_id}",
    webhookSecret: "clickwall-secret-cashdash",
    isActive: true,
    completionsCount: 5120,
  },
];

export default function AdminOfferwallsPage() {
  const [offerwalls, setOfferwalls] = useState<OfferwallItem[]>(INITIAL_OFFERWALLS);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [testModalWall, setTestModalWall] = useState<OfferwallItem | null>(null);
  const [testUserId, setTestUserId] = useState("admin");
  const [testPoints, setTestPoints] = useState("500");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get("/admin/providers")
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const mapped: OfferwallItem[] = res.data.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            type: (p.type || "TASKS").toUpperCase(),
            badge: p.slug === "taskwall" ? "Instant Clearance" : p.slug === "cpalead" ? "Fastest Approval" : "Instant Clicks",
            rating: 4.9,
            avgPayout: "$1.00 - $25.00",
            devices: ["Web", "Android", "iOS"],
            postbackUrl: p.postbackUrl || `http://localhost:3001/api/v1/webhooks/providers/${p.slug}?user_id={user_id}&points={points}&tx_id={tx_id}`,
            webhookSecret: p.webhookSecret || `${p.slug}-secret-cashdash`,
            isActive: p.isActive,
            completionsCount: p.offersCount || 10,
          }));
          setOfferwalls(mapped);
        }
      })
      .catch(() => {});
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

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleActive = (id: string) => {
    setOfferwalls((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isActive: !w.isActive } : w))
    );
  };

  const handleDeleteWall = (id: string) => {
    if (confirm("Are you sure you want to deactivate and remove this offerwall provider?")) {
      setOfferwalls((prev) => prev.filter((w) => w.id !== id));
    }
  };

  const handleCreateWall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWall.name || !newWall.slug) return;

    const slugFormatted = newWall.slug.toLowerCase().replace(/\s+/g, "-");
    const item: OfferwallItem = {
      id: `ow-${Date.now()}`,
      name: newWall.name,
      slug: slugFormatted,
      type: newWall.type,
      badge: newWall.badge,
      rating: 4.8,
      avgPayout: newWall.avgPayout,
      devices: newWall.devices.split(",").map((s) => s.trim()),
      postbackUrl: `http://localhost:3001/api/v1/webhooks/providers/${slugFormatted}?user_id={user_id}&points={points}&tx_id={tx_id}`,
      webhookSecret: newWall.webhookSecret,
      isActive: newWall.isActive,
      completionsCount: 0,
    };

    setOfferwalls((prev) => [item, ...prev]);
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
        <Card className="bg-[#12141d] border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Networks</span>
          <div className="text-2xl font-black text-white mt-1">{offerwalls.length}</div>
          <span className="text-[11px] text-emerald-400 font-medium block mt-0.5">
            {offerwalls.filter((w) => w.isActive).length} active in production
          </span>
        </Card>

        <Card className="bg-[#12141d] border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Completions</span>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {formatPoints(offerwalls.reduce((acc, w) => acc + w.completionsCount, 0))}
          </div>
          <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
            All postback events verified
          </span>
        </Card>

        <Card className="bg-[#12141d] border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 font-semibold uppercase">Conversion Ratio</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">1,000 : $1.00</div>
          <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
            Min. Cashout: 100 pts ($0.10)
          </span>
        </Card>

        <Card className="bg-[#12141d] border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 font-semibold uppercase">Postback Security</span>
          <div className="text-2xl font-black text-white mt-1 flex items-center gap-1.5">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            <span>Encrypted</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-medium block mt-0.5">
            HMAC-SHA256 signature check
          </span>
        </Card>
      </div>

      {/* ─── Offerwalls Networks Table ───────────────────────────── */}
      <Card className="bg-[#12141d] border-slate-800">
        <CardHeader className="p-5 pb-3 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" /> Integrated Offerwall Networks
            </CardTitle>
            <Badge variant="outline" className="text-xs text-slate-400 border-slate-700">
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
                {offerwalls.map((wall) => (
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

                    <td className="py-4 px-5 max-w-xs">
                      <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-lg border border-slate-800 font-mono text-[10px]">
                        <span className="truncate text-slate-400 flex-1">{wall.postbackUrl}</span>
                        <button
                          onClick={() => handleCopy(wall.postbackUrl, wall.id)}
                          className="p-1 text-slate-400 hover:text-white shrink-0"
                          title="Copy Postback URL"
                        >
                          {copiedId === wall.id ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
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
                        onClick={() => handleToggleActive(wall.id)}
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
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ─── Add Offerwall Network Modal ──────────────────────────── */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-[#12141d] border-slate-800 text-slate-100 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-amber-500" /> Add New Offerwall Company
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Integrate a new provider network. Cash Dash will assign an encrypted postback URL and signature key.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateWall} className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-slate-300">Company / Network Name</Label>
                <Input
                  required
                  placeholder="e.g. Monlix, Lootably, Torox"
                  value={newWall.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setNewWall((prev) => ({
                      ...prev,
                      name,
                      slug: prev.slug ? prev.slug : name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
                    }));
                  }}
                  className="bg-slate-900 border-slate-800 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300">Identifier Slug</Label>
                <Input
                  required
                  placeholder="e.g. monlix"
                  value={newWall.slug}
                  onChange={(e) => setNewWall((prev) => ({ ...prev, slug: e.target.value }))}
                  className="bg-slate-900 border-slate-800 text-white font-mono"
                />
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
                  required
                  value={newWall.webhookSecret}
                  onChange={(e) => setNewWall((prev) => ({ ...prev, webhookSecret: e.target.value }))}
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
        <DialogContent className="bg-[#12141d] border-slate-800 text-slate-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Play className="h-5 w-5 text-amber-500" /> Test Postback: {testModalWall?.name}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Simulate an incoming callback webhook from this partner network to test instant ledger balance crediting.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-slate-300">Target Username / ID</Label>
              <Input
                value={testUserId}
                onChange={(e) => setTestUserId(e.target.value)}
                placeholder="admin"
                className="bg-slate-900 border-slate-800 text-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300">Points to Award</Label>
              <Input
                type="number"
                value={testPoints}
                onChange={(e) => setTestPoints(e.target.value)}
                placeholder="500"
                className="bg-slate-900 border-slate-800 text-white font-mono"
              />
              <span className="text-[11px] text-emerald-400 block mt-0.5 font-medium">
                ≈ ${(Number(testPoints) / 1000).toFixed(2)} USD Value (1,000 pts = $1.00)
              </span>
            </div>

            {testResult && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs leading-relaxed animate-in fade-in">
                {testResult}
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                onClick={() => setTestModalWall(null)}
                className="border-slate-800 text-slate-400"
              >
                Close
              </Button>
              <Button
                disabled={isTesting}
                onClick={handleRunTestPostback}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Simulating...
                  </>
                ) : (
                  <>
                    <Play className="mr-1.5 h-3.5 w-3.5" /> Execute Webhook Ping
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
