"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LifeBuoy, Search, Eye, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { formatDateTime } from "@/lib/formatters";
import apiClient from "@/lib/api-client";

interface AdminTicketRow {
  id: string;
  user: string;
  subject: string;
  category: string;
  status: "OPEN" | "WAITING_FOR_USER" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  createdAt: string;
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<AdminTicketRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/support/tickets");
      const raw = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      const mapped: AdminTicketRow[] = raw.map((t: any) => ({
        id: t.id,
        user: t.user?.username || t.user?.email || "User",
        subject: t.subject,
        category: t.category,
        status: t.status,
        createdAt: t.createdAt,
      }));
      setTickets(mapped);
    } catch (err) {
      console.error("Failed to load support tickets:", err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await apiClient.patch(`/support/tickets/${id}/status`, { status: "RESOLVED" });
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: "RESOLVED" } : t))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to resolve ticket");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <LifeBuoy className="h-7 w-7 text-amber-500" /> Support Desk Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage incoming inquiries, investigate offer tracking discrepancies, and resolve tickets
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={fetchTickets}
          disabled={loading}
          className="border-slate-800 text-slate-300 hover:text-white text-xs h-9"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <Card className="bg-[#12141d] border-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider bg-slate-900/40">
                <tr>
                  <th className="py-3.5 px-5 font-semibold">Ticket ID</th>
                  <th className="py-3.5 px-5 font-semibold">User</th>
                  <th className="py-3.5 px-5 font-semibold">Subject</th>
                  <th className="py-3.5 px-5 font-semibold">Category</th>
                  <th className="py-3.5 px-5 font-semibold">Status</th>
                  <th className="py-3.5 px-5 font-semibold">Date</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Loader2 className="h-5 w-5 animate-spin text-amber-500 mx-auto mb-2" />
                      Loading support desk queue from database...
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      Support desk is clear! No active tickets in the queue.
                    </td>
                  </tr>
                ) : (
                  tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-5 font-mono text-[11px] font-bold text-white">{t.id}</td>
                      <td className="py-3.5 px-5 font-bold text-white">{t.user}</td>
                      <td className="py-3.5 px-5 max-w-xs truncate">{t.subject}</td>
                      <td className="py-3.5 px-5">
                        <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-700">
                          {t.category.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.status === "RESOLVED"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {t.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-400">{formatDateTime(t.createdAt)}</td>
                      <td className="py-3.5 px-5 text-right space-x-1.5">
                        {t.status !== "RESOLVED" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleResolve(t.id)}
                            className="h-7 text-xs text-emerald-400 hover:text-emerald-300"
                          >
                            Resolve
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" asChild className="h-7 text-xs text-amber-400">
                          <Link href={`/support/tickets/${t.id}`}>
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
