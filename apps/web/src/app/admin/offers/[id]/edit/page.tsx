"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Loader2, CheckCircle2 } from "lucide-react";

export default function AdminEditOfferPage() {
  const params = useParams();
  const router = useRouter();
  const offerId = params.id as string;

  const [title, setTitle] = useState("Raid: Shadow Legends - Reach Lv 40");
  const [rewardPoints, setRewardPoints] = useState("45000");
  const [isFeatured, setIsFeatured] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => router.push("/admin/offers"), 1000);
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild className="text-slate-400 hover:text-white">
        <Link href="/admin/offers">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Offers
        </Link>
      </Button>

      <Card className="bg-[#12141d] border-slate-800 text-slate-100">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">Edit Offer: {offerId}</CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Update rewards or promotional flags for this offer
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-200">Title</Label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-slate-900 border-slate-800 text-xs h-9 text-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-200">Reward Points</Label>
              <Input
                type="number"
                required
                value={rewardPoints}
                onChange={(e) => setRewardPoints(e.target.value)}
                className="bg-slate-900 border-slate-800 text-xs h-9 font-mono text-slate-200"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <span className="font-bold text-white block">Featured in Hero Showcase</span>
                <span className="text-slate-400 text-[11px]">Show in highlighted carousels</span>
              </div>
              <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
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
