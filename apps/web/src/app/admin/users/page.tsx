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
} from "lucide-react";
import { formatPoints, formatCash, formatPointsAsCash, formatDateTime } from "@/lib/formatters";
import apiClient from "@/lib/api-client";

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

  const handleConfirmAdjustment = async () => {
    if (!adjustModalUser) return;
    const amount = parseInt(adjustAmount, 10) || 0;
    if (amount <= 0) return;

    setIsSubmitting(true);
    try {
      await apiClient.post(`/admin/users/${adjustModalUser.id}/adjust-balance`, {
        amount,
        direction: adjustDirection === "ADD" ? "CREDIT" : "DEBIT",
        reason: adjustReason.trim() || "Administrative manual adjustment",
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

      {/* ─── Search Bar ──────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-[#12141d] border border-slate-800 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username, email, or country..."
            className="pl-9 bg-slate-900/60 border-slate-800 text-xs h-10 text-slate-200"
          />
        </div>
      </div>

      {/* ─── Users Table ─────────────────────────────────────────── */}
      <Card className="bg-[#12141d] border-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-amber-500" /> Loading users directory...
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Users className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                <p className="font-semibold text-white">No Users Found</p>
                <p className="text-xs text-slate-500">No user accounts matching the search query exist in the database.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider bg-slate-900/40">
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

                      <td className="py-3.5 px-5 text-right space-x-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setAdjustModalUser(u)}
                          className="h-7 px-2 text-xs text-amber-400 hover:text-amber-300"
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
                              ? "text-rose-400 hover:text-rose-300"
                              : "text-emerald-400 hover:text-emerald-300"
                          }`}
                        >
                          {u.status === "ACTIVE" ? "Suspend" : "Activate"}
                        </Button>
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
        <DialogContent className="max-w-md bg-[#12141d] border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-500" /> Administrative Balance Adjustment
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Adjusting points for <strong className="text-white">{adjustModalUser?.username}</strong> will create an auditable ledger entry.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-200">Direction</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={adjustDirection === "ADD" ? "default" : "outline"}
                  onClick={() => setAdjustDirection("ADD")}
                  className={adjustDirection === "ADD" ? "bg-emerald-600 hover:bg-emerald-500 font-bold" : "border-slate-800 text-slate-300"}
                >
                  + Add Points (Credit)
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={adjustDirection === "DEDUCT" ? "default" : "outline"}
                  onClick={() => setAdjustDirection("DEDUCT")}
                  className={adjustDirection === "DEDUCT" ? "bg-rose-600 hover:bg-rose-500 font-bold" : "border-slate-800 text-slate-300"}
                >
                  - Deduct Points (Debit)
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-200">Amount (Points)</Label>
              <Input
                type="number"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                className="bg-slate-900 border-slate-800 font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-200">Administrative Reason (Audit Log)</Label>
              <Input
                required
                placeholder="e.g. Compensation for delayed offer postback"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="bg-slate-900 border-slate-800 text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAdjustModalUser(null)} className="border-slate-800 text-slate-300">
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmAdjustment} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold">
              Commit Ledger Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
