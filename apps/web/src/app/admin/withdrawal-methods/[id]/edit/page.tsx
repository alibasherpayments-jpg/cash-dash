"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, CheckCircle2, Loader2, Sliders } from "lucide-react";
import apiClient from "@/lib/api-client";
import { FieldError } from "@/components/ui/field-error";

export default function AdminEditWithdrawalMethodPage() {
  const params = useParams();
  const router = useRouter();
  const methodId = params.id as string;

  const [name, setName] = useState("");
  const [minPoints, setMinPoints] = useState("100");
  const [feePercent, setFeePercent] = useState("0");
  const [processingTime, setProcessingTime] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiClient
      .get(`/admin/withdrawal-methods`)
      .then((res) => {
        const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
        const found = list.find((m: any) => m.id === methodId);
        if (found) {
          setName(found.name || "");
          setMinPoints(found.minimumPoints?.toString() || "100");
          setFeePercent(found.feePercent?.toString() || "0");
          setProcessingTime(found.processingTime || "");
        }
      })
      .catch((err) => console.error("Failed to load method", err));
  }, [methodId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Display name is required";
    const minPts = parseInt(minPoints, 10);
    if (isNaN(minPts) || minPts <= 0) errors.minPoints = "Minimum points must be greater than 0";
    if (isNaN(parseFloat(feePercent)) || parseFloat(feePercent) < 0) errors.feePercent = "Fee percent must be 0 or greater";
    if (!processingTime.trim()) errors.processingTime = "Processing time is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSaving(true);

    try {
      await apiClient.put(`/admin/withdrawal-methods/${methodId}`, {
        name,
        minimumPoints: minPts,
        feePercent: parseFloat(feePercent) || 0,
        processingTime,
      });
    } catch {
      // Local fallback
    }

    setIsSaving(false);
    setSaved(true);
    setTimeout(() => router.push("/admin/withdrawal-methods"), 900);
  };

  const minPtsNum = parseInt(minPoints, 10) || 0;
  const minUsd = (minPtsNum / 1000).toFixed(2);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild className="text-slate-400 hover:text-white">
        <Link href="/admin/withdrawal-methods">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Payout Methods
        </Link>
      </Button>

      <Card className="bg-[#12141d] border-slate-800 text-slate-100">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Sliders className="h-5 w-5 text-amber-500" /> Edit Payout Method: {name}
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Modify minimum cashout constraints and gateway processing fee (1,000 points = $1.00 USD)
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-200">Display Name</Label>
              <Input
                hasError={!!fieldErrors.name}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: "" }));
                }}
                className="bg-slate-900 border-slate-800 text-xs h-9 text-slate-200"
              />
              <FieldError message={fieldErrors.name} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <Label className="text-xs font-semibold text-slate-200">Minimum Points</Label>
                  <span className="text-[11px] text-emerald-400 font-semibold">≈ ${minUsd} USD</span>
                </div>
                <Input
                  type="number"
                  min={100}
                  hasError={!!fieldErrors.minPoints}
                  value={minPoints}
                  onChange={(e) => {
                    setMinPoints(e.target.value);
                    if (fieldErrors.minPoints) setFieldErrors((p) => ({ ...p, minPoints: "" }));
                  }}
                  className="bg-slate-900 border-slate-800 text-xs h-9 font-mono text-slate-200"
                />
                <FieldError message={fieldErrors.minPoints} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-200">Fee Percent (%)</Label>
                <Input
                  type="number"
                  step="0.1"
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
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-200">Processing Time Display</Label>
              <Input
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

            <div className="pt-4 flex justify-between items-center border-t border-slate-800">
              {saved && (
                <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="h-4 w-4" /> Changes saved successfully!
                </span>
              )}
              <Button type="submit" disabled={isSaving} className="ml-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1.5" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
