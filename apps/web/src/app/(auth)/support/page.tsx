"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HelpCircle,
  Plus,
  MessageSquare,
  LifeBuoy,
  Clock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { formatDateTime } from "@/lib/formatters";

const SAMPLE_TICKETS = [
  {
    id: "TCK-4091",
    subject: "Offer completion delay for Raid Shadow Legends",
    category: "OFFER_ISSUE",
    status: "WAITING_FOR_USER",
    lastUpdated: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    messagesCount: 2,
  },
  {
    id: "TCK-3890",
    subject: "Change withdrawal PayPal address verification",
    category: "WITHDRAWAL_ISSUE",
    status: "RESOLVED",
    lastUpdated: new Date(Date.now() - 3600 * 1000 * 96).toISOString(),
    messagesCount: 3,
  },
];

export default function SupportCenterPage() {
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
          {SAMPLE_TICKETS.length > 0 ? (
            <div className="divide-y divide-border/60">
              {SAMPLE_TICKETS.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/support/tickets/${ticket.id}`}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-accent/5 transition-colors rounded-lg px-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-muted-foreground">{ticket.id}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {ticket.category.replace("_", " ")}
                      </Badge>
                      <Badge
                        className={`text-[10px] ${
                          ticket.status === "RESOLVED"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        }`}
                      >
                        {ticket.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <h4 className="font-bold text-sm text-foreground">{ticket.subject}</h4>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Updated {formatDateTime(ticket.lastUpdated)}</span>
                    <span className="text-primary font-semibold flex items-center">
                      View Thread <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-6 text-center">
              You do not have any open support tickets.
            </p>
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
