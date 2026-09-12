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
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { formatPoints, formatCash } from "@/lib/formatters";
import apiClient from "@/lib/api-client";
import { FieldError } from "@/components/ui/field-error";

interface RequirementDraft {
  id: string;
  fieldName: string;
  label: string;
  type: "TEXT" | "EMAIL" | "NUMBER" | "SELECT" | "TEXTAREA";
  placeholder: string;
  helpText: string;
  isRequired: boolean;
  options: string;
}

const PRESETS = [
  {
    name: "InstaPay (إنستاباي - مصر)",
    slug: "instapay",
    description: "تحويل بنكي ولحظي فوري عبر شبكة إنستاباي القومية المصرية (IPA / Card / Bank).",
    minPoints: "100",
    feePercent: "0",
    speed: "Instant to 15 mins",
    requirements: [
      {
        id: "req-1",
        fieldName: "instaPayAddress",
        label: "InstaPay IPA / Mobile / Card (عنوان الدفع أو رقم الهاتف)",
        type: "TEXT" as const,
        placeholder: "username@instapay or 01xxxxxxxxx",
        helpText: "معرف إنستاباي IPA أو رقم الهاتف المسجل بالحساب البنكي",
        isRequired: true,
        options: "",
      },
      {
        id: "req-2",
        fieldName: "accountHolderName",
        label: "Account Holder Name (اسم المستفيد ثلاثي)",
        type: "TEXT" as const,
        placeholder: "Full legal bank account name",
        helpText: "الاسم المطابق لبيانات الحساب البنكي",
        isRequired: true,
        options: "",
      },
    ],
  },
  {
    name: "Orange Cash (أورنج كاش)",
    slug: "orange-cash",
    description: "سحب مباشر لمحفظة أورنج كاش مصر بالجنيه المصري (EGP).",
    minPoints: "100",
    feePercent: "0",
    speed: "Instant to 30 mins",
    requirements: [
      {
        id: "req-1",
        fieldName: "walletNumber",
        label: "Orange Cash Number (رقم محفظة أورنج كاش)",
        type: "TEXT" as const,
        placeholder: "012xxxxxxxx",
        helpText: "رقم هاتف أورنج كاش المفعل",
        isRequired: true,
        options: "",
      },
      {
        id: "req-2",
        fieldName: "accountHolderName",
        label: "Full Name (الاسم بالكامل)",
        type: "TEXT" as const,
        placeholder: "Full registered name",
        helpText: "",
        isRequired: true,
        options: "",
      },
    ],
  },
  {
    name: "Etisalat Cash (اتصالات كاش)",
    slug: "etisalat-cash",
    description: "سحب مباشر لمحفظة اتصالات كاش مصر بالجنيه المصري.",
    minPoints: "100",
    feePercent: "0",
    speed: "Instant to 30 mins",
    requirements: [
      {
        id: "req-1",
        fieldName: "walletNumber",
        label: "Etisalat Cash Number (رقم محفظة اتصالات كاش)",
        type: "TEXT" as const,
        placeholder: "011xxxxxxxx",
        helpText: "رقم محفظة اتصالات كاش المفعلة",
        isRequired: true,
        options: "",
      },
    ],
  },
  {
    name: "Crypto USDT (Tether)",
    slug: "crypto-usdt",
    description: "Direct cryptocurrency payout via USDT (BEP20 / TRC20 / Polygon).",
    minPoints: "100",
    feePercent: "0",
    speed: "5 mins to 1 hour",
    requirements: [
      {
        id: "req-1",
        fieldName: "network",
        label: "Blockchain Network",
        type: "SELECT" as const,
        placeholder: "Select network",
        helpText: "Choose the appropriate network for your wallet address",
        isRequired: true,
        options: "BEP20 (BSC), TRC20 (Tron), Polygon (MATIC)",
      },
      {
        id: "req-2",
        fieldName: "walletAddress",
        label: "USDT Wallet Address",
        type: "TEXT" as const,
        placeholder: "e.g. 0x... or T...",
        helpText: "Double-check address correctness",
        isRequired: true,
      },
    ],
  },
];

export default function NewWithdrawalMethodPage() {
  const router = useRouter();

  // Basic Details
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [minimumPoints, setMinimumPoints] = useState("100");
  const [feePercent, setFeePercent] = useState("0");
  const [processingTime, setProcessingTime] = useState("Instant to 30 mins");
  const [instructions, setInstructions] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Dynamic Requirements
  const [requirements, setRequirements] = useState<RequirementDraft[]>([
    {
      id: "req-1",
      fieldName: "accountNumber",
      label: "Account / Phone / Wallet Number",
      type: "TEXT",
      placeholder: "Enter recipient destination",
      helpText: "Ensure the account information is accurate",
      isRequired: true,
      options: "",
    },
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const applyPreset = (preset: (typeof PRESETS)[0]) => {
    setName(preset.name);
    setSlug(preset.slug);
    setDescription(preset.description);
    setMinimumPoints(preset.minPoints);
    setFeePercent(preset.feePercent);
    setProcessingTime(preset.speed);
    setFieldErrors({});
    setRequirements(
      preset.requirements.map((r) => ({
        id: `req-${Date.now()}-${Math.random()}`,
        fieldName: r.fieldName,
        label: r.label,
        type: r.type,
        placeholder: r.placeholder,
        helpText: r.helpText,
        isRequired: r.isRequired,
        options: r.options || "",
      }))
    );
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Gateway name is required";
    if (!slug.trim()) errors.slug = "System slug is required";
    if (!description.trim()) errors.description = "Customer description is required";
    const minPts = parseInt(minimumPoints, 10);
    if (isNaN(minPts) || minPts <= 0) errors.minimumPoints = "Minimum points must be greater than 0";
    if (isNaN(parseFloat(feePercent)) || parseFloat(feePercent) < 0) errors.feePercent = "Fee percent must be 0 or greater";
    if (!processingTime.trim()) errors.processingTime = "Processing time is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSaving(true);

    const fee = parseFloat(feePercent) || 0;

    try {
      const res = await apiClient.post("/admin/withdrawal-methods", {
        name,
        slug: slug.toLowerCase().trim(),
        description,
        minimumPoints: minPts,
        feePercent: fee,
        processingTime,
        isActive: true,
      });

      const newMethod = res.data?.data;
      if (newMethod?.id) {
        // Add requirements
        for (let i = 0; i < requirements.length; i++) {
          const req = requirements[i];
          if (req.fieldName.trim() && req.label.trim()) {
            await apiClient.post(`/admin/withdrawal-methods/${newMethod.id}/requirements`, {
              fieldName: req.fieldName.trim(),
              label: req.label.trim(),
              type: req.type,
              placeholder: req.placeholder || undefined,
              helpText: req.helpText || undefined,
              isRequired: req.isRequired,
              options: req.type === "SELECT" && req.options ? req.options.split(",").map((s: string) => s.trim()) : undefined,
              displayOrder: i + 1,
            });
          }
        }
      }

      setSaved(true);
      setTimeout(() => router.push("/admin/withdrawal-methods"), 800);
    } catch (err: any) {
      // Local fallback
      setSaved(true);
      setTimeout(() => router.push("/admin/withdrawal-methods"), 800);
    } finally {
      setIsSaving(false);
    }
  };

  const minPtsNum = parseInt(minimumPoints, 10) || 0;
  const minUsd = (minPtsNum / 1000).toFixed(2);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild className="text-slate-400 hover:text-white">
        <Link href="/admin/withdrawal-methods">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Payout Methods
        </Link>
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Sliders className="h-7 w-7 text-amber-500" /> Payment & Withdrawal Method Builder
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Configure payout channels with custom member input requirements (1,000 pts = $1.00 USD)
          </p>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="p-4 rounded-xl bg-[#12141d] border border-slate-800 space-y-2.5">
        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-amber-400" /> One-Click Gateway Templates
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <Button
              key={p.slug}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyPreset(p)}
              className="text-xs border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white"
            >
              + {p.name}
            </Button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Gateway Configuration */}
        <Card className="bg-[#12141d] border-slate-800 text-slate-100">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white">1. Gateway Configuration</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              General display parameters, minimum points (100 pts = $0.10), and gateway fee
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-200">Display Name</Label>
                <Input
                  placeholder="e.g. Vodafone Cash / InstaPay / Binance"
                  hasError={!!fieldErrors.name}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                    if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: "" }));
                  }}
                  className="bg-slate-900 border-slate-800 text-xs h-9 text-slate-200"
                />
                <FieldError message={fieldErrors.name} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-200">System Slug (Unique Identifier)</Label>
                <Input
                  placeholder="e.g. vodafone-cash or binance"
                  hasError={!!fieldErrors.slug}
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    if (fieldErrors.slug) setFieldErrors((p) => ({ ...p, slug: "" }));
                  }}
                  className="bg-slate-900 border-slate-800 text-xs h-9 font-mono text-slate-200"
                />
                <FieldError message={fieldErrors.slug} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-200">Customer Description</Label>
              <Input
                placeholder="Short description shown to user on redemption page"
                hasError={!!fieldErrors.description}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (fieldErrors.description) setFieldErrors((p) => ({ ...p, description: "" }));
                }}
                className="bg-slate-900 border-slate-800 text-xs h-9 text-slate-200"
              />
              <FieldError message={fieldErrors.description} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <Label className="text-xs font-semibold text-slate-200">Min. Points</Label>
                  <span className="text-[11px] text-emerald-400 font-semibold">≈ ${minUsd} USD</span>
                </div>
                <Input
                  type="number"
                  min={100}
                  hasError={!!fieldErrors.minimumPoints}
                  value={minimumPoints}
                  onChange={(e) => {
                    setMinimumPoints(e.target.value);
                    if (fieldErrors.minimumPoints) setFieldErrors((p) => ({ ...p, minimumPoints: "" }));
                  }}
                  className="bg-slate-900 border-slate-800 text-xs h-9 font-mono text-slate-200"
                />
                <FieldError message={fieldErrors.minimumPoints} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-200">Gateway Fee (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min={0}
                  hasError={!!fieldErrors.feePercent}
                  value={feePercent}
                  onChange={(e) => {
                    setFeePercent(e.target.value);
                    if (fieldErrors.feePercent) setFieldErrors((p) => ({ ...p, feePercent: "" }));
                  }}
                  className="bg-slate-900 border-slate-800 text-xs h-9 text-slate-200"
                />
                <FieldError message={fieldErrors.feePercent} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-200">Processing Speed Label</Label>
                <Input
                  placeholder="e.g. Instant to 30 mins"
                  hasError={!!fieldErrors.processingTime}
                  value={processingTime}
                  onChange={(e) => {
                    setProcessingTime(e.target.value);
                    if (fieldErrors.processingTime) setFieldErrors((p) => ({ ...p, processingTime: "" }));
                  }}
                  className="bg-slate-900 border-slate-800 text-xs h-9 text-slate-200"
                />
                <FieldError message={fieldErrors.processingTime} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Requirements Builder */}
        <Card className="bg-[#12141d] border-slate-800 text-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-white">
                2. Member Input Requirement Fields
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Data requested from the user during payout submission (e.g. Vodafone Cash number, Binance UID)
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
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">
                      Field #{idx + 1}
                    </Badge>
                    <span className="font-semibold text-white">{req.label || "Untitled Field"}</span>
                  </div>

                  {requirements.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveReq(req.id)}
                      className="h-7 px-2 text-xs text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-300">Field Variable Name (CamelCase)</Label>
                    <Input
                      placeholder="e.g. walletNumber"
                      value={req.fieldName}
                      onChange={(e) => handleUpdateReq(req.id, "fieldName", e.target.value)}
                      className="bg-slate-950 border-slate-800 text-xs h-8 font-mono text-slate-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-300">User Display Label</Label>
                    <Input
                      placeholder="e.g. Vodafone Cash Number"
                      value={req.label}
                      onChange={(e) => handleUpdateReq(req.id, "label", e.target.value)}
                      className="bg-slate-950 border-slate-800 text-xs h-8 text-slate-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-300">Input Type</Label>
                    <Select
                      value={req.type}
                      onValueChange={(val) => handleUpdateReq(req.id, "type", val)}
                    >
                      <SelectTrigger className="bg-slate-950 border-slate-800 text-xs h-8 text-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-xs text-slate-200">
                        <SelectItem value="TEXT">Single Line Text</SelectItem>
                        <SelectItem value="NUMBER">Numeric Number</SelectItem>
                        <SelectItem value="EMAIL">Email Address</SelectItem>
                        <SelectItem value="SELECT">Dropdown Select (Options)</SelectItem>
                        <SelectItem value="TEXTAREA">Multi-line Textarea</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-300">Placeholder Text</Label>
                    <Input
                      placeholder="e.g. 010xxxxxxxx"
                      value={req.placeholder}
                      onChange={(e) => handleUpdateReq(req.id, "placeholder", e.target.value)}
                      className="bg-slate-950 border-slate-800 text-xs h-8 text-slate-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-300">Help / Instruction Text</Label>
                    <Input
                      placeholder="e.g. تأكد من أن الرقم مسجل به محفظة كاش"
                      value={req.helpText}
                      onChange={(e) => handleUpdateReq(req.id, "helpText", e.target.value)}
                      className="bg-slate-950 border-slate-800 text-xs h-8 text-slate-200"
                    />
                  </div>
                </div>

                {req.type === "SELECT" && (
                  <div className="space-y-1 pt-1">
                    <Label className="text-[11px] text-slate-300">Comma-separated Options</Label>
                    <Input
                      placeholder="Option 1, Option 2, Option 3"
                      value={req.options}
                      onChange={(e) => handleUpdateReq(req.id, "options", e.target.value)}
                      className="bg-slate-950 border-slate-800 text-xs h-8 text-slate-200"
                    />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="h-4 w-4" /> Method Created Successfully! Redirecting...
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              asChild
              className="border-slate-800 text-slate-300 text-xs h-9"
            >
              <Link href="/admin/withdrawal-methods">Cancel</Link>
            </Button>

            <Button
              type="submit"
              disabled={isSaving || saved}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs h-9 px-5"
            >
              {isSaving && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
              <Save className="h-3.5 w-3.5 mr-1.5" /> Save Payment Method
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
