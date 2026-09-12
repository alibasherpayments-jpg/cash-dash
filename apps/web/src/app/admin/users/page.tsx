"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AvatarWithFallback } from "@/components/common/avatar-with-fallback";
import {
  Users,
  Search,
  SlidersHorizontal,
  Coins,
  ShieldAlert,
  Ban,
  CheckCircle2,
  Eye,
  PlusCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { formatPoints, formatCash, formatPointsAsCash, formatDateTime } from "@/lib/formatters";
import apiClient from "@/lib/api-client";
import { FieldError } from "@/components/ui/field-error";

interface AdminUserRow {
  id: string;
  username: string;
  email: string;
  role: string;
  status: "ACTIVE" | "SUSPENDED" | "BANNED" | "PENDING_VERIFICATION";
  country: string;
  availablePoints: number;
  totalWithdrawn: number;
  riskScore: number;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [adjustModalUser, setAdjustModalUser] = useState<AdminUserRow | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("1000");
  const [adjustDirection, setAdjustDirection] = useState<"ADD" | "DEDUCT">("ADD");
  const [adjustReason, setAdjustReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete user state
  const [deleteModalUser, setDeleteModalUser] = useState<AdminUserRow | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<any>("/admin/users", {
        params: { search: search.trim() || undefined, limit: 50 },
      });
      const list = res.data?.data || res.data || [];
      if (Array.isArray(list)) {
        const mapped: AdminUserRow[] = list.map((u: any) => ({
          id: u.id,
          username: u.username || "Anonymous",
          email: u.email || "No email",
          role: u.role || "USER",
          status: u.status || "ACTIVE",
          country: u.profile?.country || "US",
          availablePoints: u.wallet?.availablePoints || 0,
          totalWithdrawn: u.wallet?.totalWithdrawn || 0,
          riskScore: u.riskAssessment?.overallScore || 5,
          createdAt: u.createdAt || new Date().toISOString(),
        }));
        setUsers(mapped);
      }
    } catch (err) {
      console.error("Failed to load admin users", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleToggleSuspend = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await apiClient.patch(`/admin/users/${id}/status`, {
        status: nextStatus,
        reason: `Status changed to ${nextStatus} by admin`,
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: nextStatus as any } : u))
      );
    } catch (err) {
      alert("Failed to update user status on server");
    }
  };

  const [adjustErrors, setAdjustErrors] = useState<{ amount?: string; reason?: string }>({});

  const handleConfirmAdjustment = async () => {
    if (!adjustModalUser) return;

    const errors: typeof adjustErrors = {};
    const amount = parseInt(adjustAmount, 10) || 0;
    if (amount <= 0) {
      errors.amount = "Points amount must be greater than 0";
    }
    if (!adjustReason.trim()) {
      errors.reason = "Administrative reason is required for audit logs";
    }

    if (Object.keys(errors).length > 0) {
      setAdjustErrors(errors);
      return;
    }

    setAdjustErrors({});
    setIsSubmitting(true);
    try {
      await apiClient.post(`/admin/users/${adjustModalUser.id}/adjust-balance`, {
        amount,
        direction: adjustDirection === "ADD" ? "CREDIT" : "DEBIT",
        reason: adjustReason.trim(),
      });
      await fetchUsers();
      setAdjustModalUser(null);
      setAdjustReason("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to adjust balance");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteModalUser) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await apiClient.delete(`/admin/users/${deleteModalUser.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== deleteModalUser.id));
      setDeleteSuccessMessage(`User @${deleteModalUser.username} has been permanently deleted.`);
      setTimeout(() => setDeleteSuccessMessage(null), 4000);
      setDeleteModalUser(null);
      setDeleteConfirmationText("");
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || err.message || "Failed to delete user account.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Users className="h-7 w-7 text-amber-500" /> User Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            View profiles, audit ledgers, enforce risk suspensions, and manage point balances
          </p>
        </div>

        <Badge variant="outline" className="text-slate-300 border-slate-700 text-xs w-fit">
          Total Users: {users.length}
        </Badge>
      </div>

      {deleteSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{deleteSuccessMessage}</span>
        </div>
      )}

      {/* ─── Search Bar ──────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username, email, or country..."
            className="pl-9 bg-background border-border text-xs h-10 text-foreground"
          />
        </div>
      </div>

      {/* ─── Users Table ─────────────────────────────────────────── */}
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" /> Loading users directory...
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground space-y-2">
                <Users className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2" />
                <p className="font-semibold text-foreground">No Users Found</p>
                <p className="text-xs text-muted-foreground">No user accounts matching the search query exist in the database.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-foreground">
                <thead className="border-b border-border text-muted-foreground text-[10px] uppercase tracking-wider bg-muted/30">
                  <tr>
                    <th className="py-3.5 px-5 font-semibold">User</th>
                    <th className="py-3.5 px-5 font-semibold">Available Points</th>
                    <th className="py-3.5 px-5 font-semibold">Total Withdrawn</th>
                    <th className="py-3.5 px-5 font-semibold">Risk Score</th>
                    <th className="py-3.5 px-5 font-semibold">Status</th>
                    <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <AvatarWithFallback username={u.username} size="sm" />
                          <div>
                            <Link href={`/admin/users/${u.id}`} className="font-bold text-white hover:text-amber-400">
                              {u.username}
                            </Link>
                            <p className="text-[10px] text-slate-400">{u.email} • {u.country}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <span className="font-bold text-white">{formatPoints(u.availablePoints)}</span>
                        <span className="text-[10px] text-emerald-400 block">
                          ≈ {formatPointsAsCash(u.availablePoints)}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 font-bold text-emerald-400">
                        {formatPointsAsCash(u.totalWithdrawn)}
                      </td>

                      <td className="py-3.5 px-5">
                        <Badge
                          className={`text-[10px] font-bold ${
                            u.riskScore > 50
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : u.riskScore > 20
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          }`}
                        >
                          Score: {u.riskScore}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-right space-x-1.5 whitespace-nowrap">
                        <Link href={`/admin/users/${u.id}`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-sky-400 hover:text-sky-300 hover:bg-sky-400/10"
                            title="View member details"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" /> View
                          </Button>
                        </Link>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setAdjustModalUser(u)}
                          className="h-7 px-2 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
                          title="Adjust balance"
                        >
                          <Coins className="h-3.5 w-3.5 mr-1" /> Adjust
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleSuspend(u.id, u.status)}
                          className={`h-7 px-2 text-xs ${
                            u.status === "ACTIVE"
                              ? "text-rose-400 hover:text-rose-300 hover:bg-rose-400/10"
                              : "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"
                          }`}
                        >
                          {u.status === "ACTIVE" ? "Suspend" : "Activate"}
                        </Button>

                        {u.role !== "ADMIN" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setDeleteModalUser(u);
                              setDeleteConfirmationText("");
                              setDeleteError(null);
                            }}
                            className="h-7 px-2 text-xs text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
                            title="Delete user account"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ─── Adjust Balance Dialog ───────────────────────────────── */}
      <Dialog open={!!adjustModalUser} onOpenChange={(open) => !open && setAdjustModalUser(null)}>
        <DialogContent className="max-w-md bg-card border-border text-card-foreground">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" /> Administrative Balance Adjustment
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Adjusting points for <strong className="text-foreground">{adjustModalUser?.username}</strong> will create an auditable ledger entry.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Direction</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={adjustDirection === "ADD" ? "default" : "outline"}
                  onClick={() => setAdjustDirection("ADD")}
                  className={adjustDirection === "ADD" ? "bg-emerald-600 hover:bg-emerald-500 font-bold text-white" : "border-border text-foreground"}
                >
                  + Add Points (Credit)
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={adjustDirection === "DEDUCT" ? "default" : "outline"}
                  onClick={() => setAdjustDirection("DEDUCT")}
                  className={adjustDirection === "DEDUCT" ? "bg-rose-600 hover:bg-rose-500 font-bold text-white" : "border-border text-foreground"}
                >
                  - Deduct Points (Debit)
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Amount (Points)</Label>
              <Input
                type="number"
                hasError={!!adjustErrors.amount}
                value={adjustAmount}
                onChange={(e) => {
                  setAdjustAmount(e.target.value);
                  if (adjustErrors.amount) setAdjustErrors((p) => ({ ...p, amount: undefined }));
                }}
                className="bg-background border-border font-mono text-xs text-foreground"
              />
              <FieldError message={adjustErrors.amount} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Administrative Reason (Audit Log)</Label>
              <Input
                placeholder="e.g. Compensation for delayed offer postback"
                hasError={!!adjustErrors.reason}
                value={adjustReason}
                onChange={(e) => {
                  setAdjustReason(e.target.value);
                  if (adjustErrors.reason) setAdjustErrors((p) => ({ ...p, reason: undefined }));
                }}
                className="bg-background border-border text-xs text-foreground"
              />
              <FieldError message={adjustErrors.reason} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAdjustModalUser(null)} className="border-border text-foreground hover:bg-accent">
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmAdjustment} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
              Commit Ledger Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete User Dialog ─────────────────────────────────── */}
      <Dialog
        open={!!deleteModalUser}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteModalUser(null);
            setDeleteConfirmationText("");
            setDeleteError(null);
          }
        }}
      >
        <DialogContent className="max-w-md bg-card border-border text-card-foreground">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" /> Delete User Account
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to permanently delete{" "}
              <strong className="text-foreground">@{deleteModalUser?.username}</strong>?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs space-y-1">
              <p className="font-semibold">⚠️ Irreversible Platform Action</p>
              <p className="text-[11px] leading-relaxed opacity-90">
                This will permanently remove this user along with their wallet, transactions, withdrawal requests, support tickets, and revoke all sessions.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-background/70 border border-border text-[11px] space-y-1 text-muted-foreground">
              <div>Email: <span className="font-mono text-foreground">{deleteModalUser?.email}</span></div>
              <div>Available Balance: <span className="font-mono text-foreground font-bold">{formatPoints(deleteModalUser?.availablePoints ?? 0)} pts</span></div>
              <div>User ID: <span className="font-mono text-foreground">{deleteModalUser?.id}</span></div>
            </div>

            {deleteError && (
              <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                {deleteError}
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">
                To confirm, type <span className="font-bold text-destructive">{deleteModalUser?.username}</span> below:
              </Label>
              <Input
                placeholder={deleteModalUser?.username}
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
                setDeleteModalUser(null);
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
              disabled={isDeleting || deleteConfirmationText !== deleteModalUser?.username}
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
