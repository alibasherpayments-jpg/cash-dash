"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Send, CheckCircle2, Loader2 } from "lucide-react";
import apiClient from "@/lib/api-client";
import { FieldError } from "@/components/ui/field-error";

export default function AdminBroadcastNotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("PROMOTIONAL");
  const [audience, setAudience] = useState("ALL");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = "Headline title is required";
    if (!message.trim()) errors.message = "Message body is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSending(true);
    try {
      const notifType = type === "ACHIEVEMENT" ? "ACHIEVEMENT_UNLOCKED" : type;
      await apiClient.post("/admin/notifications/broadcast", {
        title,
        message,
        type: notifType,
      });
      setSent(true);
      setTitle("");
      setMessage("");
      setTimeout(() => setSent(false), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to broadcast notification");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
          <Bell className="h-7 w-7 text-amber-500" /> Broadcast System Announcements
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Send in-app notifications and promotional alerts to segmented member groups
        </p>
      </div>

      <Card className="bg-[#12141d] border-slate-800 text-slate-100">
        <CardHeader>
          <CardTitle className="text-base font-bold text-white">Create Announcement</CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Dispatched instantly to users matching the audience filter
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSend} noValidate className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-200">Target Audience</Label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger className="bg-slate-900 border-slate-800 text-slate-200 text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200 text-xs">
                    <SelectItem value="ALL">All Registered Users</SelectItem>
                    <SelectItem value="ACTIVE">Active Users</SelectItem>
                    <SelectItem value="NEW">Newly Registered Members</SelectItem>
                    <SelectItem value="WITHDRAWN">Users with Completed Withdrawals</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-200">Notification Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="bg-slate-900 border-slate-800 text-slate-200 text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200 text-xs">
                    <SelectItem value="PROMOTIONAL">Promotional / Bonus Points</SelectItem>
                    <SelectItem value="SYSTEM_ANNOUNCEMENT">System Maintenance / Update</SelectItem>
                    <SelectItem value="ACHIEVEMENT">Special Platform Milestone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-200">Headline Title</Label>
              <Input
                placeholder="e.g. 2x Points Weekend Active!"
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
              <Label className="text-xs font-semibold text-slate-200">Message Body</Label>
              <Textarea
                rows={4}
                placeholder="Enter the full notification message shown to members..."
                hasError={!!fieldErrors.message}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (fieldErrors.message) setFieldErrors((p) => ({ ...p, message: "" }));
                }}
                className="bg-slate-900 border-slate-800 text-xs text-slate-200"
              />
              <FieldError message={fieldErrors.message} />
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-slate-800">
              {sent && (
                <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="h-4 w-4" /> Broadcast dispatched to audience!
                </span>
              )}
              <Button type="submit" disabled={isSending} className="ml-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold">
                {isSending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1.5" />}
                Send Broadcast
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
