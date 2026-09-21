"use client";

import React, { useState, useEffect } from "react";
import { NotificationItem, notificationApi } from "@/services/notificationApi";
import { useRouter } from "next/navigation";

interface NotificationInboxPanelProps {
  userId: string | number;
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange: (count: number) => void;
}

export function NotificationInboxPanel({
  userId,
  isOpen,
  onClose,
  onUnreadCountChange,
}: NotificationInboxPanelProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const router = useRouter();

  const fetchInbox = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await notificationApi.getInbox(userId, pageNum, 30);
      if (res.success) {
        setNotifications(res.notifications || []);
        setTotal(res.total || 0);
        onUnreadCountChange(res.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInbox(page);
    }
  }, [isOpen, userId, page]);

  const handleMarkAsRead = async (e: React.MouseEvent, item: NotificationItem) => {
    e.stopPropagation();
    if (item.read) return;

    try {
      const res = await notificationApi.markAsRead(item.eventId || item.id, userId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id || n.eventId === item.eventId ? { ...n, read: true } : n))
      );
      onUnreadCountChange(res.unreadCount);
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead(userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      onUnreadCountChange(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleItemClick = (item: NotificationItem) => {
    handleMarkAsRead({ stopPropagation: () => {} } as any, item);
    if (item.actionUrl && item.actionUrl !== "/") {
      onClose();
      router.push(item.actionUrl);
    }
  };

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) =>
    filter === "unread" ? !n.read : true
  );

  const getSeverityBadge = (severity?: string) => {
    switch (severity) {
      case "SUCCESS":
        return {
          bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          icon: "✓",
        };
      case "WARNING":
      case "ACTION_REQUIRED":
        return {
          bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          icon: "!",
        };
      default:
        return {
          bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
          icon: "i",
        };
    }
  };

  const formatRelativeTime = (timestamp?: string) => {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp);
    const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSeconds < 60) return "Just now";
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return `${Math.floor(diffSeconds / 86400)}d ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Notifications
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
              {total}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline px-2 py-1"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              filter === "all"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            All Updates
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              filter === "unread"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            Unread
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {loading && notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Fetching notification feed...</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-400 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl">
                📬
              </div>
              <p className="font-medium text-slate-600 dark:text-slate-300">
                {filter === "unread" ? "No unread notifications" : "Inbox is empty"}
              </p>
              <p className="text-xs text-slate-400 max-w-xs">
                Lifecycle updates, AI validation alerts, and stage sign-offs will appear here.
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const badge = getSeverityBadge(item.severity);
              return (
                <div
                  key={item.id || item.eventId}
                  onClick={() => handleItemClick(item)}
                  className={`p-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer flex gap-3 relative group ${
                    !item.read
                      ? "bg-blue-50/40 dark:bg-blue-950/15"
                      : "opacity-85 hover:opacity-100"
                  }`}
                >
                  {/* Unread indicator bar */}
                  {!item.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                  )}

                  {/* Icon */}
                  <div
                    className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs border ${badge.bg}`}
                  >
                    {badge.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4
                        className={`text-xs truncate ${
                          !item.read
                            ? "font-bold text-slate-900 dark:text-white"
                            : "font-semibold text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11.5px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>

                    {/* Channels & Action */}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {item.channels?.map((ch) => (
                          <span
                            key={ch}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono"
                          >
                            {ch}
                          </span>
                        ))}
                      </div>

                      {item.actionUrl && (
                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          View details &rarr;
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 text-center text-[11px] text-slate-400 flex items-center justify-between px-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Redis BullMQ Queue Active
          </span>
          <button
            onClick={() => fetchInbox(page)}
            className="text-blue-600 hover:underline font-semibold"
          >
            Refresh Feed
          </button>
        </div>
      </div>
    </div>
  );
}
