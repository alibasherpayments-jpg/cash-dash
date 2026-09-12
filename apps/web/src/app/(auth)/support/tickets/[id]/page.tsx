"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AvatarWithFallback } from "@/components/common/avatar-with-fallback";
import { ArrowLeft, Send, Loader2, LifeBuoy, AlertCircle } from "lucide-react";
import { formatDateTime } from "@/lib/formatters";
import apiClient from "@/lib/api-client";
import { FieldError } from "@/components/ui/field-error";

export default function TicketThreadPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [replyError, setReplyError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const fetchTicket = async () => {
    if (!ticketId) return;
    try {
      const res = await apiClient.get(`/support/tickets/${ticketId}`);
      if (res.data?.data) {
        setTicket(res.data.data);
        setMessages(res.data.data.messages || []);
      } else {
        setError("Ticket not found.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load support ticket.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) {
      setReplyError("Please enter your reply before submitting");
      return;
    }
    if (isSending) return;

    setReplyError(null);
    setIsSending(true);
    try {
      const res = await apiClient.post(`/support/tickets/${ticketId}/messages`, {
        content: reply.trim(),
      });
      if (res.data?.data) {
        setMessages((prev) => [...prev, res.data.data]);
      } else {
        await fetchTicket();
      }
      setReply("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading support ticket thread...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="font-bold text-lg">{error || "Ticket Not Found"}</h3>
        <p className="text-xs text-muted-foreground">
          The requested support ticket could not be found or you do not have permission to view it.
        </p>
        <Button asChild size="sm">
          <Link href="/support">Return to Support Desk</Link>
        </Button>
      </div>
    );
  }

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
            <span className="font-mono text-xs font-bold text-primary">#{ticket.id.slice(-6).toUpperCase()}</span>
            <Badge variant="outline" className="text-[10px]">
              {(ticket.category || "GENERAL").replace(/_/g, " ")}
            </Badge>
          </div>
          <Badge
            className={`text-xs ${
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

        <h1 className="text-xl font-black text-foreground">
          {ticket.subject}
        </h1>
        <p className="text-xs text-muted-foreground">
          Opened on {formatDateTime(ticket.createdAt)} • Priority: {ticket.priority || "Normal"}
        </p>
      </div>

      {/* Message Thread */}
      <div className="space-y-4">
        {messages.map((m) => {
          const authorName = m.isStaff ? "Support Specialist" : ticket.user?.username || "You";
          return (
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
                  <AvatarWithFallback username={authorName} size="sm" />
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    {authorName}
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
          );
        })}
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
          <form onSubmit={handleSendReply} noValidate className="space-y-3">
            <Textarea
              rows={4}
              hasError={!!replyError}
              placeholder="Type your reply here..."
              value={reply}
              onChange={(e) => {
                setReply(e.target.value);
                if (replyError) setReplyError(null);
              }}
              className="text-xs"
            />
            <FieldError message={replyError} />
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
