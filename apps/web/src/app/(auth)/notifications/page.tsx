"use client";

import React, { useState } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationItem } from "@/components/common/notification-item";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyNotifications } from "@/components/illustrations/empty-notifications";
import { Bell, CheckCheck } from "lucide-react";

export default function NotificationsPage() {
  const { notifications, unreadCount, markAllRead, markAsRead, isLoading } = useNotifications();
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");

  const filtered = notifications.filter((n: any) => {
    if (filter === "UNREAD") return !n.isRead;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <Bell className="h-7 w-7 text-primary" /> Notifications Center
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Real-time updates regarding your offer completions, payouts, and referral rewards
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllRead()}
              className="text-xs font-semibold"
            >
              <CheckCheck className="mr-1.5 h-4 w-4" /> Mark All as Read
            </Button>
          )}
        </div>
      </div>

      {/* ─── Filter Tabs ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={filter === "ALL" ? "default" : "outline"}
          onClick={() => setFilter("ALL")}
          className="text-xs font-semibold h-8"
        >
          All Updates ({notifications.length})
        </Button>
        <Button
          size="sm"
          variant={filter === "UNREAD" ? "default" : "outline"}
          onClick={() => setFilter("UNREAD")}
          className="text-xs font-semibold h-8"
        >
          Unread Only ({unreadCount})
        </Button>
      </div>

      {/* ─── Notifications List ──────────────────────────────────── */}
      <Card className="border-border shadow-md">
        <CardContent className="p-4 sm:p-6">
          {isLoading ? (
            <div className="space-y-3 py-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-card animate-pulse border border-border/40" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="divide-y divide-border/40">
              {filtered.map((item: any) => (
                <div key={item.id} className="py-2">
                  <NotificationItem notification={item} onClick={(id) => markAsRead(id)} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center space-y-4">
              <EmptyNotifications className="mx-auto h-28 w-28 opacity-75" />
              <h4 className="font-bold text-base">You're All Caught Up!</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No unread notifications at the moment. As soon as partner networks confirm your offer credits, they will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
