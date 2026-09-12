"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Coins,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  History,
  CreditCard,
  Building,
  DollarSign,
  Smartphone,
} from "lucide-react";
import { formatPoints, formatCash } from "@/lib/formatters";
import apiClient from "@/lib/api-client";
import { VodafoneCashLogo } from "@/components/illustrations/vodafone-cash-logo";
import { BinanceLogo } from "@/components/illustrations/binance-logo";

interface RequirementField {
  fieldName: string;
  label: string;
  type: string;
  placeholder?: string;
  helpText?: string;
  isRequired: boolean;
  options?: string[];
}

interface WithdrawalMethodItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl?: string;
  minimumPoints: number;
  maximumPoints?: number;
  feePercent: number;
  processingTime: string;
  requirements: RequirementField[];
}

const DEFAULT_METHODS: WithdrawalMethodItem[] = [
  {
    id: "cmtxpyvlb000niaczrj98azbs",
    name: "Vodafone Cash (فودافون كاش)",
    slug: "vodafone-cash",
    logoUrl: "/images/methods/vodafone-cash.png",
    description: "سحب فوري إلى محفظة فودافون كاش في مصر بالجنيه المصري (EGP). الحد الأدنى 10 سنت (100 نقطة) فقط.",
    minimumPoints: 100, // $0.10 USD
    maximumPoints: 500000, // $500.00 USD
    feePercent: 0,
    processingTime: "Instant to 30 mins",
    requirements: [
      {
        fieldName: "walletNumber",
        label: "Vodafone Cash Number (رقم محفظة فودافون كاش)",
        type: "TEXT",
        placeholder: "010xxxxxxxx",
        helpText: "رقم الهاتف المسجل عليه المحفظة (يبدأ بـ 010)",
        isRequired: true,
      },
      {
        fieldName: "accountHolderName",
        label: "Account Holder Name (اسم صاحب المحفظة)",
        type: "TEXT",
        placeholder: "Full legal name as registered",
        helpText: "الاسم الكامل المسجل لدى فودافون",
        isRequired: true,
      },
    ],
  },
  {
    id: "cmtxpyvlg000qiacza0n827xn",
    name: "Binance (USDT / Pay / UID)",
    slug: "binance",
    logoUrl: "/images/methods/binance.png",
    description: "سحب مباشر عبر منصة بينانس (Binance Pay ID / Binance UID أو شبكات USDT BEP20/TRC20 بدون أي عمولة). الحد الأدنى 10 سنت.",
    minimumPoints: 100, // $0.10 USD
    maximumPoints: 1000000, // $1,000.00 USD
    feePercent: 0,
    processingTime: "Instant to 2 hours",
    requirements: [
      {
        fieldName: "transferMethod",
        label: "Transfer Method (طريقة التحويل)",
        type: "SELECT",
        placeholder: "Select transfer method",
        options: [
          "Binance Pay ID",
          "Binance UID",
          "USDT Address (BEP20)",
          "USDT Address (TRC20)",
        ],
        isRequired: true,
      },
      {
        fieldName: "recipientIdentifier",
        label: "Binance Pay ID / UID or USDT Address (معرف الحساب أو العنوان)",
        type: "TEXT",
        placeholder: "Enter your Binance Pay ID, User ID, or USDT deposit address",
        helpText: "يرجى التأكد من دقة العنوان أو المعرف",
        isRequired: true,
      },
    ],
  },
];

export default function WithdrawPage() {
  const router = useRouter();
  const { summary: wallet, refetch } = useWallet();

  const [methods, setMethods] = useState<WithdrawalMethodItem[]>(DEFAULT_METHODS);
  const [selectedMethod, setSelectedMethod] = useState<WithdrawalMethodItem | null>(null);
  const [pointsInput, setPointsInput] = useState<string>("100");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch active methods dynamically from API
  useEffect(() => {
    apiClient
      .get("/withdrawals/methods")
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setMethods(res.data.data);
        }
      })
      .catch(() => {
        // Keep DEFAULT_METHODS
      });
  }, []);

  const availablePoints = wallet?.availablePoints || 0;
  const points = parseInt(pointsInput, 10) || 0;
  const feePercent = selectedMethod?.feePercent || 0;
  const feePoints = Math.round((points * feePercent) / 100);
  const netPoints = Math.max(0, points - feePoints);
  const cashValue = netPoints / 1000; // 1,000 points = $1.00 USD

  const handleSelectMethod = (m: WithdrawalMethodItem) => {
    setSelectedMethod(m);
    setFormData({});
    setError(null);
    if (points < m.minimumPoints) {
      setPointsInput(m.minimumPoints.toString());
    }
  };

  const handleFieldChange = (name: string, val: string) => {
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleProceedToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedMethod) return;

    if (points > availablePoints) {
      setError(`Insufficient points. You have ${formatPoints(availablePoints)} available.`);
      return;
    }

    if (points < selectedMethod.minimumPoints) {
      setError(`Minimum withdrawal for ${selectedMethod.name} is ${formatPoints(selectedMethod.minimumPoints)}.`);
      return;
    }

    // Validate required fields
    if (selectedMethod.requirements && Array.isArray(selectedMethod.requirements)) {
      for (const req of selectedMethod.requirements) {
        if (req.isRequired && !formData[req.fieldName]?.trim()) {
          setError(`Please fill in '${req.label}'`);
          return;
        }
      }
    }

    setConfirmModalOpen(true);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.post("/withdrawals", {
        methodId: selectedMethod?.id,
        points,
        destination: formData,
      });

      refetch();
      setConfirmModalOpen(false);
      router.push("/withdraw/history");
    } catch (err: any) {
      refetch();
      setConfirmModalOpen(false);
      router.push("/withdraw/history");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ─── Header & History Link ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <ArrowUpRight className="h-7 w-7 text-primary" /> Redeem Rewards
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Convert your earned points to real currency and digital disbursements (1,000 pts = $1.00 USD)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" asChild size="sm">
            <Link href="/withdraw/history">
              <History className="mr-2 h-4 w-4" /> Withdrawal History
            </Link>
          </Button>
        </div>
      </div>

      {/* ─── Available Balance Notice ────────────────────────────── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Coins className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Your Balance</span>
            <div className="text-xl font-black text-foreground">
              {formatPoints(availablePoints)} <span className="text-xs font-semibold text-accent">pts</span>
            </div>
          </div>
        </div>

        <div className="text-sm font-bold text-emerald-500">
          ≈ {formatCash(availablePoints / 1000)} USD Ready to Cash Out
        </div>
      </div>

      {/* ─── Step 1: Select Withdrawal Method ─────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
            1
          </span>
          Choose Your Payout Method
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {methods.map((method) => {
            const isSelected = selectedMethod?.id === method.id;
            const isVodafone = method.slug.includes("vodafone");
            const isBinance = method.slug.includes("binance");
            const minUsd = (method.minimumPoints / 1000).toFixed(2);
            const logoSrc = method.logoUrl || (isVodafone ? "/images/methods/vodafone-cash.png" : isBinance ? "/images/methods/binance.png" : null);

            return (
              <div
                key={method.id}
                onClick={() => handleSelectMethod(method)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? "bg-primary/10 border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/30"
                    : "bg-card border-border hover:border-primary/50"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3.5">
                    <div className="h-12 w-12 rounded-2xl bg-white/5 border border-border/60 p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
                      {logoSrc ? (
                        <img
                          src={logoSrc}
                          alt={method.name}
                          className="h-full w-full object-contain"
                        />
                      ) : isVodafone ? (
                        <VodafoneCashLogo size={42} />
                      ) : isBinance ? (
                        <BinanceLogo size={42} />
                      ) : (
                        <CreditCard className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-base text-foreground truncate">{method.name}</span>
                        {isSelected && <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />}
                      </div>
                      <Badge variant="outline" className={`text-[10px] mt-0.5 ${isVodafone ? "border-red-500/30 text-red-400 bg-red-500/10" : isBinance ? "border-amber-500/30 text-amber-400 bg-amber-500/10" : "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"}`}>
                        {isVodafone ? "🇪🇬 Egypt EGP Instant" : isBinance ? "⚡ Global Crypto Zero-Fee" : "⚡ Direct Payout"}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{method.description}</p>
                </div>

                <div className="pt-3 border-t border-border/60 text-[11px] space-y-1 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Minimum Cashout:</span>
                    <strong className="text-emerald-500 font-bold">{formatPoints(method.minimumPoints)} pts (${minUsd})</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Transfer Fee:</span>
                    <strong className="text-foreground">{method.feePercent === 0 ? "FREE (0%)" : `${method.feePercent}%`}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing Speed:</span>
                    <span className="text-emerald-500 font-semibold">{method.processingTime}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Step 2: Dynamic Requirements Form ───────────────────── */}
      {selectedMethod && (
        <Card className="border-border shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                2
              </span>
              <CardTitle className="text-lg font-bold">
                {selectedMethod.name} Payout Details
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Fill in the destination details required by our {selectedMethod.name} gateway
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleProceedToConfirm}>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Amount input & Net Value with consistent alignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                <div className="space-y-1.5">
                  <Label htmlFor="points" className="text-xs font-semibold">Points to Withdraw</Label>
                  <div className="relative">
                    <Input
                      id="points"
                      type="number"
                      min={selectedMethod.minimumPoints}
                      max={availablePoints}
                      step={100}
                      value={pointsInput}
                      onChange={(e) => setPointsInput(e.target.value)}
                      className="h-10 text-sm pl-8 font-mono"
                    />
                    <Coins className="h-4 w-4 text-muted-foreground absolute left-2.5 top-3" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Min: {formatPoints(selectedMethod.minimumPoints)} • Max: {formatPoints(availablePoints)}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Estimated Net Value</Label>
                  <div className="h-10 px-3.5 rounded-md bg-accent/5 border border-border flex items-center justify-between text-sm">
                    <span className="text-emerald-500 font-bold">{formatCash(cashValue)} USD</span>
                    <span className="text-xs text-muted-foreground">
                      Fee ({selectedMethod.feePercent}%): {formatPoints(feePoints)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Net credited: {formatPoints(netPoints)} pts
                  </p>
                </div>
              </div>

              {/* Dynamic Requirement Fields */}
              <div className="space-y-4 pt-2 border-t border-border">
                {selectedMethod.requirements?.map((req) => (
                  <div key={req.fieldName} className="space-y-1.5">
                    <Label className="text-xs font-semibold">
                      {req.label} {req.isRequired && <span className="text-destructive">*</span>}
                    </Label>

                    {req.type === "SELECT" && req.options ? (
                      <select
                        required={req.isRequired}
                        value={formData[req.fieldName] || ""}
                        onChange={(e) => handleFieldChange(req.fieldName, e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                      >
                        <option value="">Select option...</option>
                        {req.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        required={req.isRequired}
                        type={req.type === "NUMBER" ? "number" : req.type === "EMAIL" ? "email" : "text"}
                        placeholder={req.placeholder}
                        value={formData[req.fieldName] || ""}
                        onChange={(e) => handleFieldChange(req.fieldName, e.target.value)}
                        className="h-10 text-sm font-mono"
                      />
                    )}

                    {req.helpText && (
                      <p className="text-[11px] text-muted-foreground">{req.helpText}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Verification & Warnings */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border/80 text-xs text-muted-foreground space-y-2">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Instant Ledger Deduction & Anti-Fraud Clearance
                </div>
                <p>
                  Requested points will be deducted immediately from your balance. Withdrawals are processed according to the gateway speed ({selectedMethod.processingTime}). If rejected, points are instantly refunded to your wallet.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="submit"
                  size="lg"
                  disabled={points <= 0 || points > availablePoints || points < selectedMethod.minimumPoints}
                  className="font-bold text-sm px-8"
                >
                  Proceed to Verification
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      )}

      {/* ─── Confirmation Modal with Centered Alignment ─────────── */}
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Confirm Your Withdrawal</DialogTitle>
            <DialogDescription className="text-xs">
              Please double-check your recipient information before confirming this transaction.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="p-4 rounded-xl bg-card border border-border space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Payment Method:</span>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-white/5 border border-border/60 p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src={selectedMethod?.logoUrl || (selectedMethod?.slug.includes("vodafone") ? "/images/methods/vodafone-cash.png" : "/images/methods/binance.png")}
                      alt={selectedMethod?.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <span className="font-bold text-foreground">{selectedMethod?.name}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Points Debited:</span>
                <span className="font-mono font-bold text-foreground">{formatPoints(points)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Cash Out Value:</span>
                <span className="font-bold text-emerald-500 text-sm">{formatCash(cashValue)} USD</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-muted-foreground">Estimated Delivery:</span>
                <span className="text-foreground font-medium">{selectedMethod?.processingTime}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
              <span className="text-muted-foreground font-sans font-bold text-xs block">
                Disbursement Destination:
              </span>
              {Object.entries(formData).map(([k, v]) => {
                const label = selectedMethod?.requirements?.find((r) => r.fieldName === k)?.label || k;
                return (
                  <div key={k} className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground text-[11px]">{label}:</span>
                    <span className="font-mono text-foreground font-semibold">{v}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter className="flex flex-row items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setConfirmModalOpen(false)}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="font-bold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                "Confirm & Submit"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
