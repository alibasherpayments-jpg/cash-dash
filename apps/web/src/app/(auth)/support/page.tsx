"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Plus,
  MessageSquare,
  LifeBuoy,
  ArrowRight,
  Loader2,
  Inbox,
} from "lucide-react";
import { formatDateTime } from "@/lib/formatters";
import { apiGet } from "@/lib/api-client";

export default function SupportCenterPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    apiGet<any>("/support/tickets")
      .then((res) => {
        if (res.data && Array.isArray(res.data)) {
          setTickets(res.data);
        } else {
          setTickets([]);
        }
      })
      .catch(() => {
        setTickets([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <LifeBuoy className="h-7 w-7 text-primary" /> Help & Support Desk
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Find immediate answers in our knowledge base or open a ticket with our support specialists
          </p>
        </div>

        <Button asChild className="font-bold shadow-lg shadow-primary/20">
          <Link href="/support/new">
            <Plus className="mr-1.5 h-4 w-4" /> Open New Ticket
          </Link>
        </Button>
      </div>

      {/* ─── My Tickets Section ──────────────────────────────────── */}
      <Card className="border-border shadow-md">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" /> Your Active Support Tickets
            </CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-xs text-primary font-semibold">
              <Link href="/support/new">Create Ticket</Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-0">
          {isLoading ? (
            <div className="space-y-3 py-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-card animate-pulse border border-border/40" />
              ))}
            </div>
          ) : tickets.length > 0 ? (
            <div className="divide-y divide-border/60">
              {tickets.map((ticket) => {
                const displayId = ticket.id ? `#${ticket.id.slice(-6).toUpperCase()}` : "#TICKET";
                return (
                  <Link
                    key={ticket.id}
                    href={`/support/tickets/${ticket.id}`}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-accent/5 transition-colors rounded-lg px-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-muted-foreground">{displayId}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {(ticket.category || "GENERAL").replace(/_/g, " ")}
                        </Badge>
                        <Badge
                          className={`text-[10px] ${
                            ticket.status === "RESOLVED"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : ticket.status === "CLOSED"
                              ? "bg-slate-500/10 text-slate-400 border-slate-500/20"
                              : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          }`}
                        >
                          {(ticket.status || "OPEN").replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <h4 className="font-bold text-sm text-foreground">{ticket.subject}</h4>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Updated {formatDateTime(ticket.updatedAt || ticket.createdAt)}</span>
                      <span className="text-primary font-semibold flex items-center">
                        View Thread <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-muted/40 flex items-center justify-center text-muted-foreground">
                <Inbox className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-sm text-foreground">No Support Tickets Yet</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                You do not have any open support tickets. If you need assistance with an offer, cashout, or account inquiry, feel free to open a ticket.
              </p>
              <Button asChild size="sm" variant="outline" className="font-bold text-xs mt-2">
                <Link href="/support/new">Open Your First Ticket</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── FAQ Knowledge Base ──────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Frequently Answered Questions</h3>

        <Accordion type="single" collapsible className="w-full space-y-3">
          <AccordionItem value="faq-1" className="border border-border rounded-xl px-4 bg-card">
            <AccordionTrigger className="font-bold text-sm">
              My offer points haven't been credited yet. What should I do?
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
              Most offerwall networks credit points within 15 minutes of completing the final condition. However, certain heavy game offers require up to 24–48 hours for publisher postbacks to clear. If your reward has not arrived after 48 hours, please open a support ticket with a screenshot of your player profile.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-2" className="border border-border rounded-xl px-4 bg-card">
            <AccordionTrigger className="font-bold text-sm">
              Can I complete the same offer on multiple devices?
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
              No. Offerwall advertisers enforce strict unique user and device fingerprint rules. Repeating an offer or sharing accounts across devices may cause network reversals.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-3" className="border border-border rounded-xl px-4 bg-card">
            <AccordionTrigger className="font-bold text-sm">
              Why was my withdrawal rejected or placed under review?
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
              Withdrawals can be held if risk checks detect proxy/VPN usage, mismatching destination accounts, or unverified postbacks. Contact support to request manual review by an admin.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
