"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LifeBuoy, Search, Eye, CheckCircle2 } from "lucide-react";
import { formatDateTime } from "@/lib/formatters";

interface AdminTicketRow {
  id: string;
  user: string;
  subject: string;
  category: string;
  status: "OPEN" | "WAITING_FOR_USER" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
}

const INITIAL_TICKETS: AdminTicketRow[] = [
  { id: "TCK-4091", user: "alex_dash", subject: "Offer completion delay for Raid Shadow Legends", category: "OFFER_ISSUE", status: "WAITING_FOR_USER", createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString() },
  { id: "TCK-4088", user: "ryan_hustle", subject: "PayPal payout destination confirmation", category: "WITHDRAWAL_ISSUE", status: "OPEN", createdAt: new Date(Date.now() - 3600 * 1000 * 8).toISOString() },
  { id: "TCK-3890", user: "emma_quest", subject: "Two-factor auth reset request", category: "ACCOUNT_ISSUE", status: "RESOLVED", createdAt: new Date(Date.now() - 3600 * 1000 * 72).toISOString() },
];

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<AdminTicketRow[]>(INITIAL_TICKETS);

  const handleResolve = (id: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "RESOLVED" } : t))
    );
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
                {tickets.map((t) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
