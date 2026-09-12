"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Shield, Clock } from "lucide-react";
import { formatDateTime } from "@/lib/formatters";

interface AuditLogRow {
  id: string;
  admin: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  date: string;
}

const SAMPLE_LOGS: AuditLogRow[] = [
  { id: "log-1", admin: "admin@cashdash.io", action: "BALANCE_ADJUSTED", entityType: "UserWallet", entityId: "usr-4", details: "Manual credit of +1,000 points (delayed postback compensation)", date: "Today at 3:15 PM" },
  { id: "log-2", admin: "admin@cashdash.io", action: "WITHDRAWAL_APPROVED", entityType: "WithdrawalRequest", entityId: "WDR-80988", details: "Approved Crypto (USDT) payout of $2.46 (Score: 8)", date: "Today at 9:30 AM" },
  { id: "log-3", admin: "admin@cashdash.io", action: "WITHDRAWAL_METHOD_CREATED", entityType: "WithdrawalMethod", entityId: "meth-venmo", details: "Created dynamic method Venmo with 2 requirements", date: "Yesterday at 6:45 PM" },
  { id: "log-4", admin: "admin@cashdash.io", action: "USER_SUSPENDED", entityType: "User", entityId: "usr-7", details: "Suspended suspicious_bot (Score: 88, velocity abuse)", date: "Sep 8, 2026" },
  { id: "log-5", admin: "admin@cashdash.io", action: "SETTINGS_UPDATED", entityType: "SystemSetting", entityId: "conversion_rate", details: "Updated points_conversion_rate to 10000", date: "Sep 1, 2026" },
];

export default function AdminAuditLogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <FileText className="h-7 w-7 text-amber-500" /> Immutable Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Security audit log recording all administrative modifications and financial approvals
          </p>
        </div>

        <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-xs font-semibold">
          ● Cryptographically Ordered
        </Badge>
      </div>

      <Card className="bg-[#12141d] border-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider bg-slate-900/40">
                <tr>
                  <th className="py-3.5 px-5 font-semibold">Timestamp</th>
                  <th className="py-3.5 px-5 font-semibold">Admin Actor</th>
                  <th className="py-3.5 px-5 font-semibold">Action Executed</th>
                  <th className="py-3.5 px-5 font-semibold">Target Entity</th>
                  <th className="py-3.5 px-5 font-semibold">Operation Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {SAMPLE_LOGS.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-5 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {log.date}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-white">{log.admin}</td>
                    <td className="py-3.5 px-5">
                      <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] font-mono">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-400">
                      {log.entityType} <span className="text-slate-500">({log.entityId})</span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-300 max-w-md">{log.details}</td>
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
