"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  AlertTriangle,
  Trash2,
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
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [userData, setUserData] = useState<UserDetailData | null>(null);
  const [notes, setNotes] = useState<AdminNoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const handleDeleteUser = async () => {
    if (!userData) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await apiClient.delete(`/admin/users/${userData.id}`);
      router.push("/admin/users");
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || err.message || "Failed to delete user account.");
      setIsDeleting(false);
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
      <div className="p-6 rounded-2xl bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <AvatarWithFallback username={userData.username} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-foreground">{userData.username}</h1>
              <Badge
                className={`text-xs ${
                  userData.status === "ACTIVE"
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : "bg-red-500/10 text-red-500 border-red-500/20"
                }`}
              >
                {userData.status}
              </Badge>
              {userData.role === "ADMIN" && (
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                  ADMIN
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {userData.email} • {userData.profile?.country || "Worldwide"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              User ID: <span className="font-mono text-foreground">{userData.id}</span> • Registered {formatDateTime(userData.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-background/60 border border-border text-center">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Risk Score</span>
            <span
              className={`text-lg font-black ${
                riskScore > 50 ? "text-red-500" : riskScore > 20 ? "text-amber-500" : "text-emerald-500"
              }`}
            >
              {riskScore} / 100 ({riskScore > 50 ? "High Risk" : riskScore > 20 ? "Review" : "Clear"})
            </span>
          </div>
        </div>
      </div>

      {/* ─── Financial Balances ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Available Balance</span>
          <span className="text-xl font-black text-foreground">{formatPoints(availablePoints)}</span>
          <span className="text-xs text-emerald-500 block">≈ {formatCash(availablePoints / 1000)}</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Lifetime Earned</span>
          <span className="text-xl font-black text-amber-500">{formatPoints(totalEarned)}</span>
          <span className="text-xs text-muted-foreground block">≈ {formatCash(totalEarned / 1000)}</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Total Withdrawn</span>
          <span className="text-xl font-black text-emerald-500">{formatCash(totalWithdrawn)}</span>
          <span className="text-xs text-muted-foreground block">
            {userData._count?.withdrawalRequests ?? 0} cashout requests
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Offers Completed</span>
          <span className="text-xl font-black text-foreground">{offersCount} Offers</span>
          <span className="text-xs text-muted-foreground block">
            {userData._count?.referralsMade ?? 0} referrals made
          </span>
        </div>
      </div>

      {/* ─── Internal Notes ──────────────────────────────────────── */}
      <Card className="bg-card border-border text-card-foreground shadow-sm">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> Internal Staff Notes (Audit Trail)
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Notes visible only to platform administrators and support officers
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 pt-0 space-y-4">
          <div className="space-y-3">
            {notes.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3 italic">
                No internal notes on this user profile yet. Add any observations below.
              </p>
            ) : (
              notes.map((n) => (
                <div key={n.id} className="p-3.5 rounded-xl bg-background/60 border border-border text-xs space-y-1">
                  <div className="flex justify-between text-muted-foreground text-[11px]">
                    <strong className="text-primary">{n.author?.username || "Admin"}</strong>
                    <span>{formatDateTime(n.createdAt)}</span>
                  </div>
                  <p className="text-foreground leading-relaxed">{n.content}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddNote} noValidate className="space-y-2 pt-2 border-t border-border">
            <Textarea
              rows={3}
              placeholder="Add staff observation or verification note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="bg-background border-border text-xs text-foreground"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={addingNote || !newNote.trim()}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs"
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

      {/* ─── Danger Zone ─────────────────────────────────────────── */}
      {userData.role !== "ADMIN" && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-red-500 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" /> Danger Zone: Permanently Delete Account
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Once you delete a user account, there is no going back. All balances, points, sessions, and ticket history will be irrevocably purged.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pt-0">
            <span className="text-xs text-muted-foreground">
              Delete member <strong className="text-foreground">@{userData.username}</strong> ({userData.email})
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setDeleteModalOpen(true);
                setDeleteConfirmationText("");
                setDeleteError(null);
              }}
              className="text-xs font-bold bg-red-600 hover:bg-red-700 text-white w-fit"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Account
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ─── Delete User Dialog ─────────────────────────────────── */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-card-foreground">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" /> Permanently Delete Account
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to permanently delete{" "}
              <strong className="text-foreground">@{userData?.username}</strong>?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs space-y-1">
              <p className="font-semibold">⚠️ Irreversible Platform Action</p>
              <p className="text-[11px] leading-relaxed opacity-90">
                This action cannot be undone. All wallet balances, ledger entries, withdrawals, referrals, and support tickets for this user will be completely destroyed.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-background/70 border border-border text-[11px] space-y-1 text-muted-foreground">
              <div>Username: <span className="font-bold text-foreground">@{userData?.username}</span></div>
              <div>Email: <span className="font-mono text-foreground">{userData?.email}</span></div>
              <div>Available Balance: <span className="font-mono text-foreground font-bold">{formatPoints(availablePoints)} pts</span></div>
            </div>

            {deleteError && (
              <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                {deleteError}
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">
                To confirm, type <span className="font-bold text-destructive">{userData?.username}</span> below:
              </Label>
              <Input
                placeholder={userData?.username}
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                className="bg-background border-border text-xs text-foreground font-mono"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDeleteModalOpen(false);
                setDeleteConfirmationText("");
                setDeleteError(null);
              }}
              className="border-border text-foreground hover:bg-accent text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={isDeleting || deleteConfirmationText !== userData?.username}
              onClick={handleDeleteUser}
              className="font-bold text-xs bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Permanently Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
