"use client";

import React, { useState } from "react";
import { IndustryActivity, ActivitySeverity } from "@/modules/industry/types/industryDashboard";

interface IndustryRecentActivityFeedProps {
  activities: IndustryActivity[];
  onMarkAsRead?: (id: number) => void;
  onNavigateTab?: (tabId: string) => void;
}

const SEVERITY_STYLES: Record<
  ActivitySeverity,
  { badge: string; bg: string; dot: string; icon: React.ReactNode }
> = {
  SUCCESS: {
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    bg: "border-l-emerald-500",
    dot: "bg-emerald-500",
    icon: (
      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  ACTION_REQUIRED: {
    badge: "bg-amber-50 text-amber-900 border-amber-300",
    bg: "border-l-amber-500",
    dot: "bg-amber-500 animate-pulse",
    icon: (
      <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  WARNING: {
    badge: "bg-orange-50 text-orange-900 border-orange-200",
    bg: "border-l-orange-500",
    dot: "bg-orange-500",
    icon: (
      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  INFO: {
    badge: "bg-blue-50 text-blue-800 border-blue-200",
    bg: "border-l-blue-500",
    dot: "bg-blue-500",
    icon: (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

export function IndustryRecentActivityFeed({
  activities,
  onMarkAsRead,
  onNavigateTab,
}: IndustryRecentActivityFeedProps) {
  const [filter, setFilter] = useState<"ALL" | "ACTION_REQUIRED" | "MILESTONES">("ALL");

  const filteredActivities = (activities || []).filter((item) => {
    if (filter === "ACTION_REQUIRED") {
      return item.severity === "ACTION_REQUIRED";
    }
    if (filter === "MILESTONES") {
      return (
        item.eventType?.includes("MILESTONE") ||
        item.title?.toLowerCase().includes("milestone")
      );
    }
    return true;
  });

  return (
    <div className="bg-white border border-slate-200/90 rounded-lg p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Header & Unified Filter Segmented Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Live Activity Stream
            </h3>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Real-time SSE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Academic proposals, deliverable uploads, and tranche disbursement logs
          </p>
        </div>

        {/* Unified Segmented Filter Control */}
        <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-lg border border-slate-200/60 self-start sm:self-auto">
          {[
            { id: "ALL", label: "All Logs" },
            { id: "ACTION_REQUIRED", label: "Action Needed" },
            { id: "MILESTONES", label: "Milestones" },
          ].map((f) => {
            const isActive = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id as any)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-slate-950 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/40"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Activity List Content */}
      <div className="mt-4 divide-y divide-slate-100">
        {filteredActivities.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h4 className="text-xs font-bold text-slate-800">No Activity Logs Yet</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Real-time updates from university partners, milestone approvals, and grant disbursements will appear here.
            </p>
          </div>
        ) : (
          filteredActivities.slice(0, 6).map((item) => {
            const severity = item.severity || "INFO";
            const style = SEVERITY_STYLES[severity] || SEVERITY_STYLES.INFO;

            return (
              <div
                key={item.id}
                className={`py-3.5 px-3 -mx-3 rounded-lg hover:bg-slate-50/90 transition-colors flex items-start justify-between gap-3 border-l-3 ${style.bg} ${
                  item.read ? "opacity-75" : "bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-md bg-slate-50 border border-slate-200/80 flex-shrink-0 mt-0.5">
                    {style.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">
                        {item.title}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.badge}`}
                      >
                        {severity === "ACTION_REQUIRED" ? "Action Needed" : severity}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5 font-medium">
                      <span>{item.relativeTime || "Recently"}</span>
                      <span>•</span>
                      <span className="font-mono text-slate-500">
                        Ref: #{item.id}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action Trigger */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {severity === "ACTION_REQUIRED" && onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab("engagements")}
                      className="px-3 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs transition-all active:scale-95 cursor-pointer"
                    >
                      Review →
                    </button>
                  )}

                  {!item.read && onMarkAsRead && (
                    <button
                      type="button"
                      onClick={() => onMarkAsRead(item.id)}
                      title="Mark as read"
                      className="p-1.5 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
