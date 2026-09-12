"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { formatPoints, formatCash } from "@/lib/formatters";
import apiClient from "@/lib/api-client";

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
  minimumPoints: number;
  maximumPoints?: number;
  feePercent: number;
  processingTime: string;
  requirements: RequirementField[];
}

const DEFAULT_METHODS: WithdrawalMethodItem[] = [
  {
    id: "meth-paypal",
    name: "PayPal",
    slug: "paypal",
    description: "Instant or same-day USD cash sent straight to your verified PayPal email.",
    minimumPoints: 5000,
    maximumPoints: 1000000,
    feePercent: 0,
    processingTime: "1–24 hours",
    requirements: [
      {
        fieldName: "paypalEmail",
        label: "PayPal Email Address",
        type: "EMAIL",
        placeholder: "your.paypal@example.com",
        helpText: "Ensure this email is verified with PayPal to avoid payout bounce",
        isRequired: true,
      },
      {
        fieldName: "confirmEmail",
        label: "Confirm PayPal Email",
        type: "EMAIL",
        placeholder: "your.paypal@example.com",
        isRequired: true,
      },
    ],
  },
  {
    id: "meth-crypto",
    name: "Crypto (USDT / BTC / LTC)",
    slug: "crypto",
    description: "Receive non-custodial or exchange payout in USDT (TRC20), Bitcoin, or Litecoin.",
    minimumPoints: 10000,
    maximumPoints: 5000000,
    feePercent: 1.5,
    processingTime: "Instant to 2 hours",
    requirements: [
      {
        fieldName: "network",
        label: "Cryptocurrency Network",
        type: "SELECT",
        placeholder: "Choose Network",
        options: ["USDT (TRC20 - Tron)", "USDT (ERC20 - Ethereum)", "Bitcoin (BTC)", "Litecoin (LTC)"],
        isRequired: true,
      },
      {
        fieldName: "walletAddress",
        label: "Destination Wallet Address",
        type: "TEXT",
        placeholder: "Enter valid address matching chosen network",
        helpText: "Double-check carefully. Blockchain transactions cannot be refunded.",
        isRequired: true,
      },
    ],
  },
  {
    id: "meth-gift",
    name: "Digital Gift Cards",
    slug: "gift-cards",
    description: "Amazon, Apple, Google Play, and Steam digital redemption codes emailed directly.",
    minimumPoints: 5000,
    maximumPoints: 2000000,
    feePercent: 0,
    processingTime: "Instant to 6 hours",
    requirements: [
      {
        fieldName: "brand",
        label: "Gift Card Brand",
        type: "SELECT",
        placeholder: "Select Brand",
        options: ["Amazon Gift Card", "Apple App Store", "Google Play Store", "Steam Wallet", "PlayStation Store"],
        isRequired: true,
      },
      {
        fieldName: "region",
        label: "Card Region / Currency",
        type: "SELECT",
        placeholder: "Select Region",
        options: ["United States (USD)", "European Union (EUR)", "United Kingdom (GBP)", "Global (USD)"],
        isRequired: true,
      },
      {
        fieldName: "deliveryEmail",
        label: "Delivery Email Address",
        type: "EMAIL",
        placeholder: "delivery@example.com",
        helpText: "Your voucher code will be emailed here once approved",
        isRequired: true,
      },
    ],
  },
  {
    id: "meth-bank",
    name: "Bank Wire / ACH / SEPA",
    slug: "bank-transfer",
    description: "Direct bank deposit straight to your checking account in USD or EUR.",
    minimumPoints: 20000,
    maximumPoints: 10000000,
    feePercent: 2.0,
    processingTime: "1–3 business days",
    requirements: [
      {
        fieldName: "accountHolderName",
        label: "Legal Account Holder Name",
        type: "TEXT",
        placeholder: "Johnathan Doe",
        isRequired: true,
      },
      {
        fieldName: "bankName",
        label: "Bank Name",
        type: "TEXT",
        placeholder: "Chase / Barclays / Deutsche Bank",
        isRequired: true,
      },
      {
        fieldName: "accountNumber",
        label: "Account Number / IBAN",
        type: "TEXT",
        placeholder: "Account number or full IBAN",
        isRequired: true,
      },
      {
        fieldName: "swiftBic",
        label: "SWIFT / BIC / Routing Code",
        type: "TEXT",
        placeholder: "SWIFT code or 9-digit Routing number",
        isRequired: true,
      },
    ],
  },
];

export default function WithdrawPage() {
  const router = useRouter();
  const { summary: wallet, refetch } = useWallet();

  const [selectedMethod, setSelectedMethod] = useState<WithdrawalMethodItem | null>(null);
  const [pointsInput, setPointsInput] = useState<string>("10000");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availablePoints = wallet?.availablePoints || 0;
  const points = parseInt(pointsInput, 10) || 0;
  const feePercent = selectedMethod?.feePercent || 0;
  const feePoints = Math.round((points * feePercent) / 100);
  const netPoints = Math.max(0, points - feePoints);
  const cashValue = netPoints / 10000;

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
    for (const req of selectedMethod.requirements) {
      if (req.isRequired && !formData[req.fieldName]?.trim()) {
        setError(`Please fill in '${req.label}'`);
        return;
      }
    }

    if (formData.paypalEmail && formData.confirmEmail && formData.paypalEmail !== formData.confirmEmail) {
      setError("PayPal email confirmation does not match.");
      return;
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
      // Demo mock fallback
      refetch();
      setConfirmModalOpen(false);
      router.push("/withdraw/history");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* ─── Header & History Link ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <ArrowUpRight className="h-7 w-7 text-primary" /> Redeem Rewards
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Convert your earned points to real currency and digital vouchers
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
          ≈ {formatCash(availablePoints / 10000)} USD Ready to Cash Out
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEFAULT_METHODS.map((method) => {
            const isSelected = selectedMethod?.id === method.id;
            return (
              <div
                key={method.id}
                onClick={() => handleSelectMethod(method)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? "bg-primary/10 border-primary shadow-md shadow-primary/15"
                    : "bg-card border-border hover:border-primary/50"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-foreground">{method.name}</span>
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{method.description}</p>
                </div>

                <div className="pt-3 border-t border-border/60 text-[11px] space-y-1 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Minimum:</span>
                    <strong className="text-foreground">{formatPoints(method.minimumPoints)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Fee:</span>
                    <strong className="text-foreground">{method.feePercent}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Speed:</span>
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

              {/* Amount input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="points" className="text-xs font-semibold">Points to Withdraw</Label>
                  <div className="relative">
                    <Input
                      id="points"
                      type="number"
                      min={selectedMethod.minimumPoints}
                      max={availablePoints}
                      step={500}
                      value={pointsInput}
                      onChange={(e) => setPointsInput(e.target.value)}
                      className="h-10 text-sm pl-8 font-mono"
                    />
                    <Coins className="h-4 w-4 text-muted-foreground absolute left-2.5 top-3" />
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Min: {formatPoints(selectedMethod.minimumPoints)} • Max: {formatPoints(availablePoints)}
                  </span>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Estimated Net Value</Label>
                  <div className="h-10 px-3 rounded-md bg-accent/5 border border-border flex items-center justify-between text-sm">
                    <span className="text-emerald-500 font-bold">{formatCash(cashValue)} USD</span>
                    <span className="text-xs text-muted-foreground">
                      Fee ({selectedMethod.feePercent}%): {formatPoints(feePoints)}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Net credited: {formatPoints(netPoints)}
                  </span>
                </div>
              </div>

              {/* Dynamic Requirement Fields */}
              <div className="space-y-4 pt-2 border-t border-border">
                {selectedMethod.requirements.map((req) => (
                  <div key={req.fieldName} className="space-y-1.5">
                    <Label className="text-xs font-semibold">
                      {req.label} {req.isRequired && <span className="text-destructive">*</span>}
                    </Label>

                    {req.type === "SELECT" && req.options ? (
                      <select
                        required={req.isRequired}
                        value={formData[req.fieldName] || ""}
                        onChange={(e) => handleFieldChange(req.fieldName, e.target.value)}
                        className="w-full h-10 px-3 rounded-md bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">{req.placeholder || "Select option..."}</option>
                        {req.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        type={req.type === "EMAIL" ? "email" : "text"}
                        required={req.isRequired}
                        placeholder={req.placeholder}
                        value={formData[req.fieldName] || ""}
                        onChange={(e) => handleFieldChange(req.fieldName, e.target.value)}
                        className="h-10 text-sm"
                      />
                    )}

                    {req.helpText && (
                      <p className="text-[11px] text-muted-foreground">{req.helpText}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>

            <div className="p-6 pt-0 flex justify-end">
              <Button type="submit" size="lg" className="font-bold">
                Review & Confirm Withdrawal <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ─── Confirmation Modal ───────────────────────────────────── */}
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" /> Confirm Withdrawal Request
            </DialogTitle>
            <DialogDescription className="text-xs">
              Please review your payout details. Once submitted, points will be deducted from your available balance.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs divide-y divide-border">
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Payout Method</span>
              <strong className="text-foreground">{selectedMethod?.name}</strong>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Points Deducted</span>
              <strong className="text-foreground">{formatPoints(points)}</strong>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Gateway Fee ({selectedMethod?.feePercent}%)</span>
              <span className="text-muted-foreground">{formatPoints(feePoints)}</span>
            </div>

            <div className="flex justify-between py-1 font-bold text-sm">
              <span>Net Cashout Amount</span>
              <span className="text-emerald-500">{formatCash(cashValue)} USD</span>
            </div>

            <div className="py-2 space-y-1">
              <span className="text-muted-foreground block text-[11px] uppercase font-semibold">Destination Details:</span>
              {selectedMethod &&
                selectedMethod.requirements.map((r) => (
                  <p key={r.fieldName} className="font-mono text-xs text-foreground truncate">
                    {r.label}: {formData[r.fieldName]}
                  </p>
                ))}
            </div>

            <div className="pt-2 flex items-center gap-2 text-muted-foreground text-[11px]">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>Estimated processing: {selectedMethod?.processingTime}</span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleFinalSubmit} disabled={isSubmitting} className="font-bold">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting Request...
                </>
              ) : (
                "Confirm & Submit Payout"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
