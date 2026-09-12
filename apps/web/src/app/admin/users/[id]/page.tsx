"use client";

import React, { useState, useEffect } from "react";
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
  Loader2,
  AlertCircle,
} from "lucide-react";
import { formatPoints, formatCash, formatDateTime } from "@/lib/formatters";
import apiClient from "@/lib/api-client";

interface UserDetailData {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  profile?: {
    avatarUrl?: string;
    country?: string;
    firstName?: string;
    lastName?: string;
  };
  wallet?: {
    availablePoints: number;
    pendingPoints?: number;
    totalEarned: number;
    totalWithdrawn: number;
  };
  riskAssessment?: {
    riskScore: number;
    riskLevel: string;
    riskStatus: string;
  };
  _count?: {
    offerCompletions: number;
    withdrawalRequests: number;
    referralsMade: number;
  };
}

interface AdminNoteItem {
  id: string;
  content: string;
  createdAt: string;
  author?: {
    username: string;
  };
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = params.id as string;

  const [userData, setUserData] = useState<UserDetailData | null>(null);
  const [notes, setNotes] = useState<AdminNoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [userRes, notesRes] = await Promise.all([
          apiClient.get(`/admin/users/${userId}`),
          apiClient.get(`/admin/users/${userId}/notes`),
        ]);

        if (userRes.data?.data) {
          setUserData(userRes.data.data);
        } else {
          setError("User not found");
        }

        if (notesRes.data?.data && Array.isArray(notesRes.data.data)) {
          setNotes(notesRes.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load user details");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [userId]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || addingNote) return;

    setAddingNote(true);
    try {
      const res = await apiClient.post(`/admin/users/${userId}/notes`, {
        content: newNote.trim(),
      });
      if (res.data?.data) {
        setNotes((prev) => [res.data.data, ...prev]);
        setNewNote("");
      }
    } catch {
      // Ignore or display error
    } finally {
      setAddingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <p className="text-sm">Loading member profile from database...</p>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-white">{error || "User Not Found"}</h2>
        <Button variant="outline" asChild className="border-slate-800 text-slate-300">
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users Directory
          </Link>
        </Button>
      </div>
    );
  }

  const availablePoints = userData.wallet?.availablePoints ?? 0;
  const totalEarned = userData.wallet?.totalEarned ?? 0;
  const totalWithdrawn = (userData.wallet?.totalWithdrawn ?? 0) / 1000;
  const offersCount = userData._count?.offerCompletions ?? 0;
  const riskScore = userData.riskAssessment?.riskScore ?? 0;

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
          <AvatarWithFallback username={userData.username} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">{userData.username}</h1>
              <Badge
                className={`text-xs ${
                  userData.status === "ACTIVE"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}
              >
                {userData.status}
              </Badge>
              {userData.role === "ADMIN" && (
                <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">
                  ADMIN
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {userData.email} • {userData.profile?.country || "Worldwide"}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              User ID: <span className="font-mono text-slate-400">{userData.id}</span> • Registered {formatDateTime(userData.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Risk Score</span>
            <span
              className={`text-lg font-black ${
                riskScore > 50 ? "text-red-400" : riskScore > 20 ? "text-amber-400" : "text-emerald-400"
              }`}
            >
              {riskScore} / 100 ({riskScore > 50 ? "High Risk" : riskScore > 20 ? "Review" : "Clear"})
            </span>
          </div>
        </div>
      </div>

      {/* ─── Financial Balances ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#12141d] border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Available Balance</span>
          <span className="text-xl font-black text-white">{formatPoints(availablePoints)}</span>
          <span className="text-xs text-emerald-400 block">≈ {formatCash(availablePoints / 1000)}</span>
        </div>

        <div className="p-4 rounded-xl bg-[#12141d] border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Lifetime Earned</span>
          <span className="text-xl font-black text-amber-400">{formatPoints(totalEarned)}</span>
          <span className="text-xs text-slate-400 block">≈ {formatCash(totalEarned / 1000)}</span>
        </div>

        <div className="p-4 rounded-xl bg-[#12141d] border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Withdrawn</span>
          <span className="text-xl font-black text-emerald-400">{formatCash(totalWithdrawn)}</span>
          <span className="text-xs text-slate-400 block">
            {userData._count?.withdrawalRequests ?? 0} cashout requests
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#12141d] border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Offers Completed</span>
          <span className="text-xl font-black text-white">{offersCount} Offers</span>
          <span className="text-xs text-slate-400 block">
            {userData._count?.referralsMade ?? 0} referrals made
          </span>
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
            {notes.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 italic">
                No internal notes on this user profile yet. Add any observations below.
              </p>
            ) : (
              notes.map((n) => (
                <div key={n.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <strong className="text-amber-400">{n.author?.username || "Admin"}</strong>
                    <span>{formatDateTime(n.createdAt)}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{n.content}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddNote} noValidate className="space-y-2 pt-2 border-t border-slate-800">
            <Textarea
              rows={3}
              placeholder="Add staff observation or verification note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="bg-slate-900 border-slate-800 text-xs text-slate-200"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={addingNote || !newNote.trim()}
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
              >
                {addingNote ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                ) : (
                  <Plus className="h-3.5 w-3.5 mr-1" />
                )}
                Add Internal Note
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
