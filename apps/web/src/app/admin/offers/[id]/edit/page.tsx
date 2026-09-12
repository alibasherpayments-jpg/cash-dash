"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import apiClient from "@/lib/api-client";
import { FieldError } from "@/components/ui/field-error";

export default function AdminEditOfferPage() {
  const router = useRouter();
  const params = useParams();
  const offerId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rewardPoints, setRewardPoints] = useState("1000");
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiClient
      .get(`/offers`)
      .then((res) => {
        const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
        const o = list.find((item: any) => item.id === offerId);
        if (o) {
          setTitle(o.title || "");
          setDescription(o.description || "");
          setRewardPoints(String(o.rewardPoints || 1000));
          setIsFeatured(Boolean(o.isFeatured));
        } else {
          setError("Offer not found");
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load offer");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [offerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!title.trim()) {
      errors.title = "Offer title is required";
    }
    const pointsNum = parseInt(rewardPoints, 10);
    if (isNaN(pointsNum) || pointsNum <= 0) {
      errors.rewardPoints = "Points must be greater than 0";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSaving(true);
    try {
      await apiClient.put(`/admin/offers/${offerId}`, {
        title,
        description,
        rewardPoints: pointsNum || 1000,
        isFeatured,
      });
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => router.push("/admin/offers"), 900);
    } catch (err: any) {
      setIsSaving(false);
      alert(err.response?.data?.message || "Failed to update offer");
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <p className="text-sm">Loading offer from database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-white">{error}</h2>
        <Button variant="outline" asChild className="border-slate-800 text-slate-300">
          <Link href="/admin/offers">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Offers
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild className="text-slate-400 hover:text-white">
        <Link href="/admin/offers">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Offers
        </Link>
      </Button>

      <Card className="bg-[#12141d] border-slate-800 text-slate-100">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">Edit Offer: {title || offerId}</CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Update rewards or promotional flags for this offer
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-200">Title</Label>
              <Input
                hasError={!!fieldErrors.title}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (fieldErrors.title) setFieldErrors((p) => ({ ...p, title: "" }));
                }}
                className="bg-slate-900 border-slate-800 text-xs h-9 text-slate-200"
              />
              <FieldError message={fieldErrors.title} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-200">Description</Label>
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-slate-900 border-slate-800 text-xs text-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-200">Reward Points</Label>
              <Input
                type="number"
                hasError={!!fieldErrors.rewardPoints}
                value={rewardPoints}
                onChange={(e) => {
                  setRewardPoints(e.target.value);
                  if (fieldErrors.rewardPoints) setFieldErrors((p) => ({ ...p, rewardPoints: "" }));
                }}
                className="bg-slate-900 border-slate-800 text-xs h-9 font-mono text-slate-200"
              />
              <FieldError message={fieldErrors.rewardPoints} />
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
