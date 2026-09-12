"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Shield, Clock, Loader2, RefreshCw } from "lucide-react";
import { formatDateTime } from "@/lib/formatters";
import apiClient from "@/lib/api-client";

interface AuditLogRow {
  id: string;
  admin: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  date: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/audit-logs?limit=50");
      const raw = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      const mapped: AuditLogRow[] = raw.map((log: any) => {
        let detailsStr = "";
        if (log.newValue && typeof log.newValue === "object") {
          detailsStr = Object.entries(log.newValue)
            .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`)
            .join(", ");
        } else if (log.newValue) {
          detailsStr = String(log.newValue);
        } else {
          detailsStr = "Operation executed successfully";
        }

        return {
          id: log.id,
          admin: log.admin?.username || log.admin?.email || "System Admin",
          action: log.action,
          entityType: log.entityType,
          entityId: log.entityId || "N/A",
          details: detailsStr,
          date: formatDateTime(log.createdAt),
        };
      });
      setLogs(mapped);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

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

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchLogs}
            disabled={loading}
            className="border-slate-800 text-slate-300 hover:text-white text-xs h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>

          <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-xs font-semibold">
            ● Cryptographically Ordered
          </Badge>
        </div>
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
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <Loader2 className="h-5 w-5 animate-spin text-amber-500 mx-auto mb-2" />
                      Loading audit logs from database...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      No audit events recorded yet. Administrative operations and balance modifications will appear here automatically.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
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
