"use client";

import React, { useState, useEffect, useRef } from "react";
import { notificationApi } from "@/services/notificationApi";
import { NotificationInboxPanel } from "./NotificationInboxPanel";

interface NotificationBellProps {
  userId?: string | number;
  role?: string;
}

export function NotificationBell({ userId = "all", role = "citizen" }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isAnimate, setIsAnimate] = useState<boolean>(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // 1. Initial Unread Count
  useEffect(() => {
    notificationApi.getUnreadCount(userId).then((count) => {
      setUnreadCount(count);
    });
  }, [userId]);

  // 2. Real-Time SSE Stream Listener
  useEffect(() => {
    const sseBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const streamUrl = `${sseBase}/notifications/stream?userId=${encodeURIComponent(userId)}&role=${encodeURIComponent(role)}`;

    let sse: EventSource;

    try {
      sse = new EventSource(streamUrl);
      eventSourceRef.current = sse;

      sse.addEventListener("notification", (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          console.log("[NotificationBell] Real-time event received:", payload.title);
          setUnreadCount((prev) => prev + 1);
          setIsAnimate(true);
          setTimeout(() => setIsAnimate(false), 1500);
        } catch (err) {
          console.warn("Failed to parse SSE payload:", err);
        }
      });

      sse.onerror = () => {
        // Fallback or retry quietly
        sse.close();
      };
    } catch (e) {
      console.warn("EventSource setup failed:", e);
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [userId, role]);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open notifications inbox"
        className={`relative p-2 rounded-full border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 ${
          isAnimate ? "animate-bounce" : ""
        }`}
      >
        {/* Bell Icon */}
        <svg
          className="w-4 h-4 sm:w-4.5 sm:h-4.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Live Badge Counter */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-black text-white shadow-xs animate-in zoom-in duration-150">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Slide-out Inbox Drawer */}
      <NotificationInboxPanel
        userId={userId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onUnreadCountChange={(count) => setUnreadCount(count)}
      />
    </>
  );
}
