"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, CheckCircle2, Loader2, Sliders } from "lucide-react";

export default function AdminEditWithdrawalMethodPage() {
  const params = useParams();
  const router = useRouter();
  const methodId = params.id as string;

  const [name, setName] = useState("PayPal");
  const [minPoints, setMinPoints] = useState("5000");
  const [feePercent, setFeePercent] = useState("0");
  const [processingTime, setProcessingTime] = useState("1–24 hours");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild className="text-slate-400 hover:text-white">
        <Link href="/admin/withdrawal-methods">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Payout Methods
        </Link>
      </Button>

      <Card className="bg-[#12141d] border-slate-800 text-slate-100">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">Edit Payout Method: {name}</CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Modify minimum cashout constraints and gateway processing fee
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-200">Display Name</Label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-900 border-slate-800 text-xs h-9 text-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-200">Minimum Points</Label>
                <Input
                  type="number"
                  required
                  value={minPoints}
                  onChange={(e) => setMinPoints(e.target.value)}
                  className="bg-slate-900 border-slate-800 text-xs h-9 font-mono text-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-200">Fee Percent (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  required
                  value={feePercent}
                  onChange={(e) => setFeePercent(e.target.value)}
                  className="bg-slate-900 border-slate-800 text-xs h-9 text-slate-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-200">Processing Time Display</Label>
              <Input
                required
                value={processingTime}
                onChange={(e) => setProcessingTime(e.target.value)}
                className="bg-slate-900 border-slate-800 text-xs h-9 text-slate-200"
              />
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-slate-800">
              {saved && (
                <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="h-4 w-4" /> Changes saved!
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
