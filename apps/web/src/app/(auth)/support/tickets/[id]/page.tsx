"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AvatarWithFallback } from "@/components/common/avatar-with-fallback";
import { ArrowLeft, Send, Shield, LifeBuoy } from "lucide-react";
import { formatDateTime } from "@/lib/formatters";

interface MessageItem {
  id: string;
  author: string;
  isStaff: boolean;
  content: string;
  createdAt: string;
}

export default function TicketThreadPage() {
  const params = useParams();
  const ticketId = (params.id as string) || "TCK-4091";

  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "msg-1",
      author: "alex_dash",
      isStaff: false,
      content:
        "Hello, I completed player level 40 on Raid: Shadow Legends yesterday evening, but the points are still showing as pending. Could you check please?",
      createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    },
    {
      id: "msg-2",
      author: "Admin Support (Sarah)",
      isStaff: true,
      content:
        "Hi Alex, thank you for reaching out! We see the postback from AdVenture Offerwall is in pending state. It usually clears within 24-48 hours. Please provide a screenshot of your player profile if it does not credit by tomorrow.",
      createdAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    },
  ]);

  const [reply, setReply] = useState("");

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;

    const newMsg: MessageItem = {
      id: `msg-${Date.now()}`,
      author: "You",
      isStaff: false,
      content: reply.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setReply("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/support">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tickets
        </Link>
      </Button>

      {/* Ticket Header */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-md space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary">{ticketId}</span>
            <Badge variant="outline" className="text-[10px]">
              OFFER ISSUE
            </Badge>
          </div>
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs">
            WAITING FOR USER
          </Badge>
        </div>

        <h1 className="text-xl font-black text-foreground">
          Offer completion delay for Raid Shadow Legends
        </h1>
        <p className="text-xs text-muted-foreground">
          Opened on {formatDateTime(messages[0].createdAt)} • Priority: Normal
        </p>
      </div>

      {/* Message Thread */}
      <div className="space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-5 rounded-2xl border text-xs space-y-2 ${
              m.isStaff
                ? "bg-primary/5 border-primary/20 ml-0 sm:ml-6"
                : "bg-card border-border mr-0 sm:mr-6"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AvatarWithFallback username={m.author} size="sm" />
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  {m.author}
                  {m.isStaff && (
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] px-1 py-0">
                      STAFF
                    </Badge>
                  )}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground">{formatDateTime(m.createdAt)}</span>
            </div>

            <p className="text-foreground leading-relaxed pl-8">{m.content}</p>
          </div>
        ))}
      </div>

      {/* Reply Form */}
      <Card className="border-border shadow-md">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-bold">Reply to Ticket</CardTitle>
          <CardDescription className="text-xs">
            Add information or answer questions asked by the support agent
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <form onSubmit={handleSendReply} className="space-y-3">
            <Textarea
              rows={4}
              required
              placeholder="Type your reply here..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="text-xs"
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" className="font-bold">
                <Send className="h-3.5 w-3.5 mr-1.5" /> Send Reply
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
