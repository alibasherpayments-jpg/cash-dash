"use client";

import React, { useState, useEffect } from "react";
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
import { ArrowLeft, Save, Loader2, CheckCircle2 } from "lucide-react";
import apiClient from "@/lib/api-client";
import { FieldError } from "@/components/ui/field-error";

export default function NewOfferPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("GAMES");
  const [provider, setProvider] = useState("");
  const [rewardPoints, setRewardPoints] = useState("1500");
  const [estimatedMinutes, setEstimatedMinutes] = useState("20");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [countries, setCountries] = useState("ALL");
  const [requirements, setRequirements] = useState("Install the game\nReach level 15 within 7 days\nReward credits automatically");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isRecommended, setIsRecommended] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [providers, setProviders] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    apiClient
      .get("/admin/providers")
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          setProviders(res.data.data);
          if (res.data.data.length > 0) {
            setProvider(res.data.data[0].id);
          }
        }
      })
      .catch((err) => console.error("Failed to load providers", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = "Offer title is required";
    }
    if (!description.trim()) {
      errors.description = "Description is required";
    }
    if (!provider) {
      errors.provider = "Please select a provider network";
    }
    const pointsNum = parseInt(rewardPoints, 10);
    if (isNaN(pointsNum) || pointsNum <= 0) {
      errors.rewardPoints = "Points must be greater than 0";
    }
    const minNum = parseInt(estimatedMinutes, 10);
    if (isNaN(minNum) || minNum <= 0) {
      errors.estimatedMinutes = "Estimated minutes must be greater than 0";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSaving(true);
    try {
      await apiClient.post("/admin/offers", {
        title,
        description,
        category,
        providerId: provider,
        rewardPoints: pointsNum || 1000,
        estimatedMinutes: minNum || 15,
        difficulty,
        countries: countries.split(",").map((c) => c.trim()).filter(Boolean),
        requirements: requirements.split("\n").map((r) => r.trim()).filter(Boolean),
        isFeatured,
        isRecommended,
      });
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => router.push("/admin/offers"), 900);
    } catch (err: any) {
      setIsSaving(false);
      alert(err.response?.data?.message || "Failed to create offer");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild className="text-slate-400 hover:text-white">
        <Link href="/admin/offers">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Offers Inventory
        </Link>
      </Button>

      <Card className="bg-[#12141d] border-slate-800 text-slate-100">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">Create New Earning Offer</CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Publish a mock or partner offer with custom reward points and completion requirements
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-200">Offer Title</Label>
              <Input
                placeholder="e.g. Star Trek Fleet Command - Level 15"
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
                placeholder="Short summary of the task conditions"
                hasError={!!fieldErrors.description}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (fieldErrors.description) setFieldErrors((p) => ({ ...p, description: "" }));
                }}
                className="bg-slate-900 border-slate-800 text-xs text-slate-200"
              />
              <FieldError message={fieldErrors.description} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-200">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-slate-900 border-slate-800 h-9 text-xs text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                    <SelectItem value="GAMES">Games</SelectItem>
                    <SelectItem value="APPS">Apps</SelectItem>
                    <SelectItem value="SURVEYS">Surveys</SelectItem>
                    <SelectItem value="FINANCE">Finance</SelectItem>
                    <SelectItem value="SHOPPING">Shopping</SelectItem>
                    <SelectItem value="TRIALS">Trials</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-200">Provider Network</Label>
                <Select value={provider} onValueChange={(v) => {
                  setProvider(v);
                  if (fieldErrors.provider) setFieldErrors((p) => ({ ...p, provider: "" }));
                }}>
                  <SelectTrigger className={`bg-slate-900 border-slate-800 h-9 text-xs text-slate-200 ${fieldErrors.provider ? "border-rose-500/70" : ""}`}>
                    <SelectValue placeholder="Select network provider" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                    {providers.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError message={fieldErrors.provider} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
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

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-200">Est. Minutes</Label>
                <Input
                  type="number"
                  hasError={!!fieldErrors.estimatedMinutes}
                  value={estimatedMinutes}
                  onChange={(e) => {
                    setEstimatedMinutes(e.target.value);
                    if (fieldErrors.estimatedMinutes) setFieldErrors((p) => ({ ...p, estimatedMinutes: "" }));
                  }}
                  className="bg-slate-900 border-slate-800 text-xs h-9 text-slate-200"
                />
                <FieldError message={fieldErrors.estimatedMinutes} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-200">Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="bg-slate-900 border-slate-800 h-9 text-xs text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-200">Requirements (one per line)</Label>
              <Textarea
                rows={3}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="bg-slate-900 border-slate-800 text-xs text-slate-200"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <span className="font-bold text-white block">Featured in Hero Showcase</span>
                <span className="text-slate-400 text-[11px]">Pin this offer to homepage carousel</span>
              </div>
              <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-slate-800">
              {saved && (
                <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="h-4 w-4" /> Offer created successfully!
                </span>
              )}
              <Button type="submit" disabled={isSaving} className="ml-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1.5" />}
                Publish Offer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
