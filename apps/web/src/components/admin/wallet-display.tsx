"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Copy, Check, User, Phone, CreditCard } from "lucide-react";
import { parseWithdrawalDestination, ParsedDestination } from "@/lib/withdrawal-helpers";

interface WalletCopyBadgeProps {
  destination: any;
  methodName?: string;
  className?: string;
}

export function WalletCopyBadge({ destination, methodName, className = "" }: WalletCopyBadgeProps) {
  const [copied, setCopied] = useState(false);
  const parsed = parseWithdrawalDestination(destination, methodName);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!parsed.primaryWallet || parsed.primaryWallet === "N/A") return;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(parsed.primaryWallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isUnknown = !parsed.primaryWallet || parsed.primaryWallet === "N/A";

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Primary Wallet Box with Copy Button */}
      <div className="flex items-center justify-between gap-1.5 bg-slate-900/90 hover:bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 transition-all shadow-inner group">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <Wallet className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span
            className="font-mono text-xs font-bold text-amber-300 truncate select-all tracking-wide"
            title={parsed.primaryWallet}
          >
            {parsed.primaryWallet}
          </span>
        </div>

        {!isUnknown && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className={`h-6 px-2 text-[10px] font-bold rounded flex items-center gap-1 transition-all ${
              copied
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent"
            }`}
            title="Copy Wallet / نسخ المحفظة"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </>
            )}
          </Button>
        )}
      </div>

      {/* Subline: Method/Type & Account Holder Name */}
      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
        {parsed.walletType && (
          <span className="px-1.5 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700 font-medium">
            {parsed.walletType}
          </span>
        )}
        {parsed.accountHolder && (
          <span
            className="text-slate-300 font-medium truncate max-w-[170px] flex items-center gap-1"
            title={`Account Holder: ${parsed.accountHolder}`}
          >
            <User className="h-3 w-3 text-slate-400 shrink-0" />
            <span className="truncate">{parsed.accountHolder}</span>
          </span>
        )}
      </div>
    </div>
  );
}

interface DestinationDetailCardProps {
  destination: any;
  methodName?: string;
  externalTxId?: string;
  adminNote?: string;
}

export function DestinationDetailCard({
  destination,
  methodName,
  externalTxId,
  adminNote,
}: DestinationDetailCardProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const parsed = parseWithdrawalDestination(destination, methodName);

  const copyText = (text: string, keyId: string) => {
    if (!text) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedKey(keyId);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-3">
      {/* Highlighted Primary Payout Box */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-950/30 border border-amber-500/30 shadow-md">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
            <Wallet className="h-3.5 w-3.5" /> Primary Target Wallet / المحفظة المستهدفة
          </span>
          {parsed.walletType && (
            <Badge variant="outline" className="bg-slate-900 text-amber-300 border-amber-500/40 text-[10px]">
              {parsed.walletType}
            </Badge>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-base sm:text-lg font-mono font-black text-white select-all break-all tracking-wide">
            {parsed.primaryWallet}
          </span>

          <Button
            type="button"
            onClick={() => copyText(parsed.primaryWallet, "primary")}
            className={`font-bold text-xs h-9 px-4 shrink-0 transition-all ${
              copiedKey === "primary"
                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                : "bg-amber-500 hover:bg-amber-400 text-slate-950"
            }`}
          >
            {copiedKey === "primary" ? (
              <>
                <Check className="h-4 w-4 mr-1.5 text-white" /> Copied! (تم النسخ)
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1.5" /> Copy Wallet / نسخ المحفظة
              </>
            )}
          </Button>
        </div>

        {parsed.accountHolder && (
          <p className="text-xs text-slate-300 mt-2.5 flex items-center gap-1.5 border-t border-slate-800 pt-2">
            <User className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            Account Holder: <strong className="text-white">{parsed.accountHolder}</strong>
          </p>
        )}
      </div>

      {/* Field-by-Field Breakdown with Copy Buttons */}
      <div className="p-3.5 rounded-xl bg-card border border-border space-y-2">
        <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">
          All Payout Form Fields
        </span>
        <div className="space-y-1.5 divide-y divide-border/60">
          {parsed.entries.map((entry) => (
            <div key={entry.key} className="flex items-center justify-between pt-1.5 text-xs">
              <span className="text-muted-foreground font-medium">{entry.label}:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-foreground select-all">{entry.value}</span>
                <button
                  type="button"
                  onClick={() => copyText(entry.value, entry.key)}
                  className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                  title={`Copy ${entry.label}`}
                >
                  {copiedKey === entry.key ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* External TxID */}
      {externalTxId && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-between text-xs font-mono">
          <span>TxID: {externalTxId}</span>
          <button
            type="button"
            onClick={() => copyText(externalTxId, "txId")}
            className="p-1 hover:text-emerald-300 transition-colors"
            title="Copy TxID"
          >
            {copiedKey === "txId" ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      )}

      {/* Admin Note */}
      {adminNote && (
        <div className="p-3 rounded-lg bg-card border border-border text-foreground text-xs space-y-1">
          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Admin Note:</span>
          <p>{adminNote}</p>
        </div>
      )}
    </div>
  );
}
