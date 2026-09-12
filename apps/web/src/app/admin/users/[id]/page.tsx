"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AvatarWithFallback } from "@/components/common/avatar-with-fallback";
import {
  ArrowLeft,
  Coins,
  ArrowUpRight,
  ShieldAlert,
  ShieldCheck,
  FileText,
  User,
  Clock,
  Plus,
} from "lucide-react";
import { formatPoints, formatCash, formatDateTime } from "@/lib/formatters";

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = (params.id as string) || "usr-1";

  const [notes, setNotes] = useState([
    { id: "note-1", author: "Security Officer (Admin)", date: "Sep 10, 2026", text: "Identity verified via PayPal email ownership check. Risk score adjusted to 5." },
  ]);
  const [newNote, setNewNote] = useState("");

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotes((prev) => [
      ...prev,
      { id: `note-${Date.now()}`, author: "Admin", date: "Today", text: newNote.trim() },
    ]);
    setNewNote("");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild className="text-slate-400 hover:text-white">
        <Link href="/admin/users">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users Directory
        </Link>
      </Button>

      {/* ─── Profile Overview ────────────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-[#12141d] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <AvatarWithFallback username="alex_dash" size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">alex_dash</h1>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                ACTIVE
              </Badge>
            </div>
            <p className="text-xs text-slate-400">alex@example.com • United States (US)</p>
            <p className="text-[11px] text-slate-500 mt-1">
              User ID: <span className="font-mono text-slate-400">{userId}</span> • Registered Aug 1, 2026
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Risk Score</span>
            <span className="text-lg font-black text-emerald-400">5 / 100 (Clear)</span>
          </div>
        </div>
      </div>

      {/* ─── Financial Balances ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#12141d] border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Available Balance</span>
          <span className="text-xl font-black text-white">{formatPoints(482000)}</span>
          <span className="text-xs text-emerald-400 block">≈ {formatCash(48.2)}</span>
        </div>

        <div className="p-4 rounded-xl bg-[#12141d] border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Pending Points</span>
          <span className="text-xl font-black text-amber-400">{formatPoints(10000)}</span>
          <span className="text-xs text-slate-400 block">Under postback hold</span>
        </div>

        <div className="p-4 rounded-xl bg-[#12141d] border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Withdrawn</span>
          <span className="text-xl font-black text-emerald-400">{formatCash(482.0)}</span>
          <span className="text-xs text-slate-400 block">12 paid cashouts</span>
        </div>

        <div className="p-4 rounded-xl bg-[#12141d] border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Offers Completed</span>
          <span className="text-xl font-black text-white">32 Offers</span>
          <span className="text-xs text-slate-400 block">Zero chargebacks</span>
        </div>
      </div>

      {/* ─── Internal Notes ──────────────────────────────────────── */}
      <Card className="bg-[#12141d] border-slate-800 text-slate-100">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-amber-400" /> Internal Staff Notes (Audit Trail)
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Notes visible only to platform administrators and support officers
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 pt-0 space-y-4">
          <div className="space-y-3">
            {notes.map((n) => (
              <div key={n.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <strong className="text-amber-400">{n.author}</strong>
                  <span>{n.date}</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{n.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddNote} className="space-y-2 pt-2 border-t border-slate-800">
            <Textarea
              rows={3}
              placeholder="Add staff observation or verification note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="bg-slate-900 border-slate-800 text-xs text-slate-200"
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Internal Note
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
