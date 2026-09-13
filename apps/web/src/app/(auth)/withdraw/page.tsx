"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/use-wallet";
import { useTranslation } from "@/providers/i18n-provider";
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
  AlertTriangle,
} from "lucide-react";
import { usePlatformSettings } from "@/hooks/use-platform-settings";
import { formatPoints, formatCash } from "@/lib/formatters";
import apiClient from "@/lib/api-client";
import { VodafoneCashLogo } from "@/components/illustrations/vodafone-cash-logo";
import { BinanceLogo } from "@/components/illustrations/binance-logo";
import { FieldError } from "@/components/ui/field-error";
import { isValidEmail } from "@/lib/validation";
import { toast } from "sonner";

interface WithdrawalMethodItem {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  logoUrl?: string;
  minimumPoints: number;
  feePercent: number;
  processingTime: string;
  description?: string;
  badge?: string;
  requirements?: {
    fieldName: string;
    label: string;
    type: "TEXT" | "NUMBER" | "EMAIL" | "SELECT";
    placeholder?: string;
    helpText?: string;
    options?: string[];
    isRequired: boolean;
  }[];
}

const DEFAULT_METHODS: WithdrawalMethodItem[] = [
  {
    id: "vodafone-cash",
    name: "Vodafone Cash (فودافون كاش)",
    slug: "vodafone-cash",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Vodafone_icon.svg/512px-Vodafone_icon.svg.png",
    minimumPoints: 100, // $0.10
    feePercent: 0,
    processingTime: "Instant - 15 Mins",
    description: "استلام فوري عبر المحفظة الإلكترونية لجميع أرقام فودافون مصر",
    badge: "Most Popular (Egypt)",
    requirements: [
      {
        fieldName: "walletNumber",
        label: "Vodafone Cash Wallet Number (رقم محفظة فودافون كاش)",
        type: "TEXT",
        placeholder: "010XXXXXXXX",
        helpText: "يجب أن يبدأ بـ 010 ومفعل عليه خدمة فودافون كاش",
        isRequired: true,
      },
      {
        fieldName: "accountHolder",
        label: "Account Holder Name (اسم صاحب المحفظة)",
        type: "TEXT",
        placeholder: "Full name as registered on wallet",
        helpText: "للتأكد من مطابقة بيانات التحويل",
        isRequired: true,
      },
    ],
  },
  {
    id: "binance-pay",
    name: "Binance Pay / Crypto USDT",
    slug: "binance",
    icon: "https://cryptologos.cc/logos/binance-coin-bnb-logo.png",
    minimumPoints: 1000, // $1.00
    feePercent: 1.5,
    processingTime: "1 - 2 Hours",
    description: "Receive USDT directly into your Binance Pay account with zero network fee",
    badge: "Crypto (USDT)",
    requirements: [
      {
        fieldName: "binanceId",
        label: "Binance ID / Pay ID / Registered Email",
        type: "TEXT",
        placeholder: "e.g. 184920481 or your@email.com",
        helpText: "Your 8-9 digit Binance User ID or Pay ID",
        isRequired: true,
      },
    ],
  },
];

export default function WithdrawPage() {
  const router = useRouter();
  const { summary: wallet, refetch } = useWallet();
  const { t } = useTranslation();

  const [methods, setMethods] = useState<WithdrawalMethodItem[]>(DEFAULT_METHODS);
  const [selectedMethod, setSelectedMethod] = useState<WithdrawalMethodItem | null>(null);
  const [pointsInput, setPointsInput] = useState<string>("100");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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

  const { settings } = usePlatformSettings();
  const conversionRate = (wallet as any)?.conversionRate || settings?.conversionRate || 1000;
  const availablePoints = wallet?.availablePoints || 0;
  const points = parseInt((pointsInput || "").toString().replace(/,/g, ""), 10) || 0;
  const feePercent = selectedMethod?.feePercent || 0;
  const feePoints = Math.floor((points * feePercent) / 100);
  const netPoints = Math.max(0, points - feePoints);
  const cashValue = netPoints / conversionRate;

  const handleSetMaxPoints = () => {
    if (availablePoints <= 0) return;
    setPointsInput(availablePoints.toString());
    if (fieldErrors.points) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.points;
        return next;
      });
    }
  };

  const handleSelectMethod = (m: WithdrawalMethodItem) => {
    setSelectedMethod(m);
    setFormData({});
    setFieldErrors({});
    setError(null);
    if (points < m.minimumPoints) {
      setPointsInput(m.minimumPoints.toString());
    }
  };

  const handleFieldChange = (name: string, val: string) => {
    setFormData((prev) => ({ ...prev, [name]: val }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleProceedToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedMethod) return;

    if (settings?.maintenanceMode) {
      setError("Withdrawals are temporarily paused for platform maintenance.");
      return;
    }

    const errors: Record<string, string> = {};
    const effectiveMin = Math.max(selectedMethod.minimumPoints, settings?.minWithdrawalPoints || 0);

    if (!pointsInput || isNaN(points) || points <= 0) {
      errors.points = t.withdraw.enterAmount;
    } else if (points > availablePoints) {
      errors.points = `${t.withdraw.insufficientBalance} (${formatPoints(availablePoints)})`;
    } else if (points < effectiveMin) {
      errors.points = `${t.withdraw.belowMinimum} (${formatPoints(effectiveMin)})`;
    }


    // Validate required fields
    if (selectedMethod.requirements && Array.isArray(selectedMethod.requirements)) {
      for (const req of selectedMethod.requirements) {
        const val = formData[req.fieldName]?.trim();
        if (req.isRequired && !val) {
          errors[req.fieldName] = `Please fill out ${req.label}`;
        } else if (req.type === "EMAIL" && val && !isValidEmail(val)) {
          errors[req.fieldName] = "Please enter a valid email address";
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
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

      toast.success(t.withdraw.successToast);
      setConfirmModalOpen(false);
      refetch();
      router.push("/withdraw/history");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to submit withdrawal request";
      setError(msg);
      toast.error(msg);
      setConfirmModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2">
      {/* ─── Header & History Link ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <ArrowUpRight className="h-7 w-7 text-primary" /> {t.withdraw.title}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {t.withdraw.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" asChild size="sm">
            <Link href="/withdraw/history">
              <History className="mr-2 h-4 w-4" /> {t.withdraw.historyButton}
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
            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{t.withdraw.balanceCard}</span>
            <div className="text-xl font-black text-foreground">
              {formatPoints(availablePoints)} <span className="text-xs font-semibold text-accent">{t.common.pts}</span>
            </div>
          </div>
        </div>

        <div className="text-sm font-bold text-emerald-500">
          ≈ {formatCash(availablePoints / conversionRate)} USD
        </div>
      </div>

      {/* ─── Maintenance Mode Warning ────────────────────────────── */}
      {settings?.maintenanceMode && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="text-xs font-semibold">
            System Notice: Withdrawals are temporarily paused while our team performs scheduled platform maintenance. Submissions will be re-enabled shortly.
          </span>
        </div>
      )}


      {/* ─── Step 1: Select Withdrawal Method ─────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
            1
          </span>
          {t.withdraw.selectMethod}
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
                        {isVodafone ? "🇪🇬 Egypt EGP" : isBinance ? "⚡ Crypto USDT" : "⚡ Direct Payout"}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{method.description}</p>
                </div>

                <div className="pt-3 border-t border-border/60 text-[11px] space-y-1 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>{t.withdraw.minWithdrawal}:</span>
                    <strong className="text-emerald-500 font-bold">{formatPoints(method.minimumPoints)} ({minUsd} USD)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.withdraw.fee}:</span>
                    <strong className="text-foreground">{method.feePercent === 0 ? "0%" : `${method.feePercent}%`}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.withdraw.processingTime}:</span>
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
                {selectedMethod.name}
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              {t.withdraw.confirmDesc}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleProceedToConfirm} noValidate>
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
                  <div className="h-5 flex items-center justify-between">
                    <Label htmlFor="points" className="text-xs font-semibold leading-none">
                      {t.withdraw.pointsToWithdraw}
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="points"
                        type="number"
                        min={selectedMethod.minimumPoints}
                        max={availablePoints}
                        step={1}
                        hasError={!!fieldErrors.points}
                        value={pointsInput}
                        onChange={(e) => {
                          setPointsInput(e.target.value);
                          if (fieldErrors.points) setFieldErrors((prev) => ({ ...prev, points: "" }));
                        }}
                        className="h-10 text-sm ps-8 pe-3 font-mono font-bold"
                        placeholder="0"
                      />
                      <Coins className="h-4 w-4 text-muted-foreground absolute start-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleSetMaxPoints}
                      disabled={availablePoints <= 0}
                      className="h-10 px-3.5 font-black text-xs tracking-wider uppercase bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/25 hover:border-primary transition-all active:scale-95 shrink-0 shadow-xs cursor-pointer"
                      title={t.withdraw.allPoints}
                    >
                      MAX
                    </Button>
                  </div>

                  <FieldError message={fieldErrors.points} />
                  <div className="h-5 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      {t.withdraw.minWithdrawal}: {formatPoints(selectedMethod.minimumPoints)}
                    </span>
                    <button
                      type="button"
                      onClick={handleSetMaxPoints}
                      className="hover:text-primary transition-colors font-semibold cursor-pointer"
                    >
                      Max: {formatPoints(availablePoints)}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="h-5 flex items-center justify-between">
                    <Label className="text-xs font-semibold leading-none">
                      {t.withdraw.willReceive}
                    </Label>
                  </div>

                  <div className="h-10 px-3.5 rounded-md bg-accent/5 border border-border flex items-center justify-between text-sm">
                    <span className="text-emerald-500 font-bold">{formatCash(cashValue)} USD</span>
                    <span className="text-xs text-muted-foreground">
                      {t.withdraw.fee} ({selectedMethod.feePercent}%): {formatPoints(feePoints)}
                    </span>
                  </div>

                  <div className="h-5 flex items-center text-[11px] text-muted-foreground">
                    <span>Net: {formatPoints(netPoints)}</span>
                  </div>
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
                        value={formData[req.fieldName] || ""}
                        onChange={(e) => handleFieldChange(req.fieldName, e.target.value)}
                        className={`w-full h-10 px-3 rounded-md border text-sm text-foreground focus:ring-2 focus:outline-none transition-colors ${
                          fieldErrors[req.fieldName]
                            ? "border-rose-500/70 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-500/[0.02]"
                            : "border-input bg-background focus:ring-primary"
                        }`}
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
                        type={req.type === "NUMBER" ? "number" : req.type === "EMAIL" ? "email" : "text"}
                        placeholder={req.placeholder}
                        hasError={!!fieldErrors[req.fieldName]}
                        value={formData[req.fieldName] || ""}
                        onChange={(e) => handleFieldChange(req.fieldName, e.target.value)}
                        className="h-10 text-sm font-mono"
                      />
                    )}
                    <FieldError message={fieldErrors[req.fieldName]} />

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
                  {t.withdraw.submitRequest}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      )}

      {/* ─── Confirmation Modal with Centered Alignment ─────────── */}
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">{t.withdraw.confirmTitle}</DialogTitle>
            <DialogDescription className="text-xs">
              {t.withdraw.confirmDesc}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="p-4 rounded-xl bg-card border border-border space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t.withdraw.selectMethod}:</span>
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
                <span className="text-muted-foreground">{t.withdraw.pointsToWithdraw}:</span>
                <span className="font-mono font-bold text-foreground">{formatPoints(points)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t.withdraw.willReceive}:</span>
                <span className="font-bold text-emerald-500 text-sm">{formatCash(cashValue)} USD</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-muted-foreground">{t.withdraw.processingTime}:</span>
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
              {t.common.cancel}
            </Button>
            <Button
              onClick={handleFinalSubmit}
              disabled={isSubmitting || !!settings?.maintenanceMode}
              className="font-bold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.common.loading}
                </>
              ) : (
                t.withdraw.confirmButton
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
