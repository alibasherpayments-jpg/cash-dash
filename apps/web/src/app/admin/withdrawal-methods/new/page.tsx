"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Loader2,
  Sliders,
  Eye,
} from "lucide-react";

interface RequirementDraft {
  id: string;
  fieldName: string;
  label: string;
  type: "TEXT" | "EMAIL" | "NUMBER" | "SELECT" | "TEXTAREA";
  placeholder: string;
  helpText: string;
  isRequired: boolean;
  options: string;
  validation: string;
}

export default function AdminNewWithdrawalMethodPage() {
  const router = useRouter();

  // Basic Info
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [minimumPoints, setMinimumPoints] = useState("5000");
  const [feePercent, setFeePercent] = useState("0");
  const [processingTime, setProcessingTime] = useState("1–24 hours");
  const [isActive, setIsActive] = useState(true);

  // Dynamic Requirements Builder
  const [requirements, setRequirements] = useState<RequirementDraft[]>([
    {
      id: "req-1",
      fieldName: "accountIdentifier",
      label: "Account ID / Email Address",
      type: "TEXT",
      placeholder: "e.g. user@example.com",
      helpText: "Primary identifier for this gateway disbursement",
      isRequired: true,
      options: "",
      validation: "",
    },
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleAddRequirement = () => {
    const newReq: RequirementDraft = {
      id: `req-${Date.now()}`,
      fieldName: "",
      label: "",
      type: "TEXT",
      placeholder: "",
      helpText: "",
      isRequired: true,
      options: "",
      validation: "",
    };
    setRequirements((prev) => [...prev, newReq]);
  };

  const handleUpdateReq = (id: string, field: keyof RequirementDraft, value: any) => {
    setRequirements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleRemoveReq = (id: string) => {
    if (requirements.length <= 1) return;
    setRequirements((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => router.push("/admin/withdrawal-methods"), 1000);
    }, 600);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild className="text-slate-400 hover:text-white">
        <Link href="/admin/withdrawal-methods">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Payout Methods
        </Link>
      </Button>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
          <Sliders className="h-7 w-7 text-amber-500" /> Withdrawal Method & Requirement Builder
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Define custom form inputs that dynamically render on the user cashout page
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ─── Method Configuration ────────────────────────────────── */}
        <Card className="bg-[#12141d] border-slate-800 text-slate-100">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white">1. Gateway Configuration</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              General display parameters, minimum points, and gateway fee percentage
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-200">Display Name</Label>
                <Input
                  required
                  placeholder="e.g. Venmo / Cash App / Stripe"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slug) setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                  }}
                  className="bg-slate-900 border-slate-800 text-xs h-9 text-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-200">System Slug (Unique ID)</Label>
                <Input
                  required
                  placeholder="e.g. cash-app"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="bg-slate-900 border-slate-800 text-xs h-9 font-mono text-slate-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-200">Description</Label>
              <Input
                required
                placeholder="Short customer-facing description of the redemption speed and conditions"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-slate-900 border-slate-800 text-xs h-9 text-slate-200"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-200">Min. Points</Label>
                <Input
                  type="number"
                  required
                  value={minimumPoints}
                  onChange={(e) => setMinimumPoints(e.target.value)}
                  className="bg-slate-900 border-slate-800 text-xs h-9 font-mono text-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-200">Gateway Fee %</Label>
                <Input
                  type="number"
                  step="0.1"
                  required
                  value={feePercent}
                  onChange={(e) => setFeePercent(e.target.value)}
                  className="bg-slate-900 border-slate-800 text-xs h-9 text-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-200">Processing Speed</Label>
                <Input
                  required
                  value={processingTime}
                  onChange={(e) => setProcessingTime(e.target.value)}
                  className="bg-slate-900 border-slate-800 text-xs h-9 text-slate-200"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Dynamic Requirement Builder ─────────────────────────── */}
        <Card className="bg-[#12141d] border-slate-800 text-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-white">
                2. Dynamic Required Information Fields
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Fields required from the member to disburse funds. Add as many fields as necessary.
              </CardDescription>
            </div>

            <Button
              type="button"
              onClick={handleAddRequirement}
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Add Requirement Field
            </Button>
          </CardHeader>

          <CardContent className="space-y-4 text-xs">
            {requirements.map((req, idx) => (
              <div
                key={req.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 relative group"
              >
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="font-bold text-white text-xs">
                    Field #{idx + 1}: {req.label || "Untitled Field"}
                  </span>
                  <div className="flex items-center gap-2">
                    {requirements.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveReq(req.id)}
                        className="h-7 px-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-300">Field Key (camelCase)</Label>
                    <Input
                      required
                      placeholder="e.g. routingNumber"
                      value={req.fieldName}
                      onChange={(e) => handleUpdateReq(req.id, "fieldName", e.target.value)}
                      className="bg-slate-950 border-slate-800 text-xs h-8 font-mono text-slate-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-300">Display Label</Label>
                    <Input
                      required
                      placeholder="e.g. 9-Digit Bank Routing Number"
                      value={req.label}
                      onChange={(e) => handleUpdateReq(req.id, "label", e.target.value)}
                      className="bg-slate-950 border-slate-800 text-xs h-8 text-slate-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-300">Field Type</Label>
                    <Select
                      value={req.type}
                      onValueChange={(val) => handleUpdateReq(req.id, "type", val)}
                    >
                      <SelectTrigger className="bg-slate-950 border-slate-800 h-8 text-xs text-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-200 text-xs">
                        <SelectItem value="TEXT">Single Line Text</SelectItem>
                        <SelectItem value="EMAIL">Email Address</SelectItem>
                        <SelectItem value="NUMBER">Number</SelectItem>
                        <SelectItem value="SELECT">Dropdown Select</SelectItem>
                        <SelectItem value="TEXTAREA">Multi-line Textarea</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {req.type === "SELECT" && (
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-300">Dropdown Options (Comma separated)</Label>
                    <Input
                      placeholder="Option 1, Option 2, Option 3"
                      value={req.options}
                      onChange={(e) => handleUpdateReq(req.id, "options", e.target.value)}
                      className="bg-slate-950 border-slate-800 text-xs h-8 text-slate-200"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-300">Placeholder Text</Label>
                    <Input
                      placeholder="Helpful prompt text"
                      value={req.placeholder}
                      onChange={(e) => handleUpdateReq(req.id, "placeholder", e.target.value)}
                      className="bg-slate-950 border-slate-800 text-xs h-8 text-slate-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-300">Help / Disclaimer Text</Label>
                    <Input
                      placeholder="e.g. Double check wallet address carefully"
                      value={req.helpText}
                      onChange={(e) => handleUpdateReq(req.id, "helpText", e.target.value)}
                      className="bg-slate-950 border-slate-800 text-xs h-8 text-slate-200"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Switch
                    checked={req.isRequired}
                    onCheckedChange={(val) => handleUpdateReq(req.id, "isRequired", val)}
                  />
                  <span className="text-[11px] text-slate-300">This field is mandatory for withdrawal</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ─── Submit Action ───────────────────────────────────────── */}
        <div className="flex justify-between items-center pt-2">
          {saved && (
            <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="h-4 w-4" /> Method published! Available on cashout form.
            </span>
          )}
          <Button
            type="submit"
            disabled={isSaving}
            size="lg"
            className="ml-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-xl shadow-amber-500/20"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Method...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save & Enable Method
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
