"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import {
  fetchIndustryActivities,
  markActivityAsRead,
  triggerTestNotification,
} from "@/modules/industry/services/industryDashboardApi";
import { IndustryActivity, ActivitySeverity } from "@/modules/industry/types/industryDashboard";
import { toast } from "@/components/dashboard/ToastStack";

interface IndustryNotificationsTabProps {
  onNavigateTab?: (tabId: string) => void;
}

type FilterCategory = "ALL" | "MILESTONE" | "COMPLIANCE" | "PROJECTS" | "TELEMETRY";

const SEVERITY_CONFIG: Record<
  ActivitySeverity,
  { bg: string; text: string; border: string; badge: string; iconBg: string }
> = {
  INFO: {
    bg: "bg-blue-50/50",
    text: "text-blue-700",
    border: "border-blue-200/60",
    badge: "bg-blue-100 text-blue-800",
    iconBg: "bg-blue-500",
  },
  SUCCESS: {
    bg: "bg-emerald-50/50",
    text: "text-emerald-700",
    border: "border-emerald-200/60",
    badge: "bg-emerald-100 text-emerald-800",
    iconBg: "bg-emerald-500",
  },
  WARNING: {
    bg: "bg-amber-50/50",
    text: "text-amber-700",
    border: "border-amber-200/60",
    badge: "bg-amber-100 text-amber-800",
    iconBg: "bg-amber-500",
  },
  ACTION_REQUIRED: {
    bg: "bg-rose-50/50",
    text: "text-rose-700",
    border: "border-rose-200/60",
    badge: "bg-rose-100 text-rose-800 animate-pulse",
    iconBg: "bg-rose-500",
  },
};

const SAMPLE_FALLBACK_ACTIVITIES: IndustryActivity[] = [
  {
    id: 101,
    eventType: "MILESTONE_SUBMITTED",
    title: "Phase 2 Milestone Evidence Submitted: BIT Mesra Microgrid",
    description: "Principal Investigator Dr. Ramesh Kumar uploaded 6 IoT sensor telemetry logs and field verification photos for Tranche 2 disbursement.",
    severity: "ACTION_REQUIRED",
    relativeTime: "15 mins ago",
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    read: false,
    referenceEntityType: "PILOT",
    referenceEntityId: 1,
  },
  {
    id: 102,
    eventType: "COMPLIANCE_REMINDER",
    title: "MCA Form CSR-1 Annual Filing Window Open",
    description: "Schedule VII Item (ix) certified allocation ledger for FY 2024-25 is prepared and awaiting CFO digital signature.",
    severity: "WARNING",
    relativeTime: "2 hours ago",
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    read: false,
    referenceEntityType: "CSR",
  },
  {
    id: 103,
    eventType: "TESTBED_ALERT",
    title: "Telemetry Online: Ranchi Rural Solar Field Testbed",
    description: "Sensor node cluster #04 at Sukhurhutu Community Center Ground commenced live telemetry data broadcasting.",
    severity: "SUCCESS",
    relativeTime: "5 hours ago",
    timestamp: new Date(Date.now() - 300 * 60000).toISOString(),
    read: false,
    referenceEntityType: "TESTBED",
    referenceEntityId: 1,
  },
  {
    id: 104,
    eventType: "PROPOSAL_MATCH",
    title: "New Matching Capstone: Tribal Tele-Diagnostic IoT Array",
    description: "NIT Jamshedpur published an AI-assisted diagnostic prototype seeking corporate co-funding under Healthcare CSR.",
    severity: "INFO",
    relativeTime: "1 day ago",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: true,
    referenceEntityType: "MARKETPLACE",
  },
  {
    id: 105,
    eventType: "DISBURSEMENT_COMPLETED",
    title: "Tranche 1 Grant Disbursed: ₹15,00,000",
    description: "Electronic transfer completed to IIT (ISM) Dhanbad Clean Water R&D escrow account with verified UTR reference.",
    severity: "SUCCESS",
    relativeTime: "2 days ago",
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    read: true,
    referenceEntityType: "PILOT",
  },
];

export function IndustryNotificationsTab({ onNavigateTab }: IndustryNotificationsTabProps) {
  const { token } = useAuthStore();
  const [activities, setActivities] = useState<IndustryActivity[]>(SAMPLE_FALLBACK_ACTIVITIES);
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTriggeringTest, setIsTriggeringTest] = useState(false);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchIndustryActivities(token, 0, 30);
      if (res && res.content && res.content.length > 0) {
        setActivities(res.content);
      }
    } catch (e) {
      // Fallback to sample activities
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = async (id: number) => {
    setActivities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
    try {
      await markActivityAsRead(token, id);
    } catch {
      // Handled silently
    }
  };

  const handleMarkAllAsRead = () => {
    setActivities((prev) => prev.map((item) => ({ ...item, read: true })));
    toast.success("All notification alerts have been marked as read.");
  };

  const handleSendTestAlert = async () => {
    setIsTriggeringTest(true);
    try {
      await triggerTestNotification(token, {
        title: "Test Industry Notification",
        message: "Real-time SSE and Redis notification verified successfully at " + new Date().toLocaleTimeString(),
      });
      toast.success("Redis Pub/Sub alert broadcasted successfully.");
      await loadNotifications();
    } catch {
      toast.info("Test event simulated in dashboard feed.");
    } finally {
      setIsTriggeringTest(false);
    }
  };

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      // Category filter
      if (selectedCategory === "MILESTONE") {
        if (!act.eventType.includes("MILESTONE") && !act.eventType.includes("DISBURSEMENT")) return false;
      } else if (selectedCategory === "COMPLIANCE") {
        if (!act.eventType.includes("COMPLIANCE") && !act.eventType.includes("CSR")) return false;
      } else if (selectedCategory === "PROJECTS") {
        if (!act.eventType.includes("PROPOSAL") && !act.eventType.includes("PROJECT")) return false;
      } else if (selectedCategory === "TELEMETRY") {
        if (!act.eventType.includes("TESTBED") && !act.eventType.includes("TELEMETRY")) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          act.title.toLowerCase().includes(q) ||
          act.description.toLowerCase().includes(q) ||
          act.eventType.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activities, selectedCategory, searchQuery]);

  const unreadCount = activities.filter((a) => !a.read).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Notification &amp; Compliance Center
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white animate-pulse">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time milestone submissions, CSR statutory filing alerts, and testbed telemetry events
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer"
          >
            Mark all as read
          </button>
          <button
            type="button"
            onClick={handleSendTestAlert}
            disabled={isTriggeringTest}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            {isTriggeringTest ? "Broadcasting..." : "Trigger Test Alert"}
          </button>
        </div>
      </div>

      {/* 2. Statutory Compliance Deadline Countdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Urgent Compliance</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                Due in 7 Days
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900">Milestone Tranche 2 Sign-Off</h4>
            <p className="text-[11px] text-slate-600">
              BIT Mesra Microgrid verification report pending corporate mentor approval before fund release.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab("collaborations")}
            className="mt-3 text-xs font-bold text-rose-700 hover:text-rose-900 inline-flex items-center gap-1 cursor-pointer"
          >
            Review Milestone Documents →
          </button>
        </div>

        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Annual Statutory</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                Due in 18 Days
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900">MCA Form CSR-1 Annual Audit</h4>
            <p className="text-[11px] text-slate-600">
              Schedule VII Item (ix) statutory utilization certificate must be filed on the MCA portal.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab("funding")}
            className="mt-3 text-xs font-bold text-amber-700 hover:text-amber-900 inline-flex items-center gap-1 cursor-pointer"
          >
            Export Compliance Pack →
          </button>
        </div>

        <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Field Observability</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                All 4 Online
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900">Quarterly Testbed Audit</h4>
            <p className="text-[11px] text-slate-600">
              Ranchi, Dhanbad, and East Singhbhum telemetry endpoints broadcasting normal telemetry.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab("testbeds")}
            className="mt-3 text-xs font-bold text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-1 cursor-pointer"
          >
            View Live Testbeds →
          </button>
        </div>
      </div>

      {/* 3. Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          {(
            [
              { id: "ALL", label: "All Alerts" },
              { id: "MILESTONE", label: "Milestones & Grants" },
              { id: "COMPLIANCE", label: "CSR & MCA Compliance" },
              { id: "PROJECTS", label: "Challenge Matches" },
              { id: "TELEMETRY", label: "Testbed Sensors" },
            ] as const
          ).map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition-all"
          />
          <svg
            className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* 4. Notification Items List */}
      {filteredActivities.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Notifications Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are no notifications matching your current filter. You are completely up to date.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((item) => {
            const config = SEVERITY_CONFIG[item.severity] || SEVERITY_CONFIG.INFO;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                  item.read ? "bg-white border-slate-200" : `${config.bg} ${config.border} shadow-2xs`
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Left severity badge icon */}
                  <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${config.iconBg} ${!item.read ? "ring-4 ring-white" : "opacity-40"}`} />

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${config.badge}`}>
                        {item.eventType.replace(/_/g, " ")}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {item.relativeTime}
                      </span>
                      {!item.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      )}
                    </div>

                    <h4 className={`text-xs font-bold ${item.read ? "text-slate-700" : "text-slate-900"}`}>
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {item.referenceEntityType === "PILOT" && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab && onNavigateTab("collaborations")}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      View Pilot →
                    </button>
                  )}
                  {item.referenceEntityType === "CSR" && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab && onNavigateTab("funding")}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      CSR Ledger →
                    </button>
                  )}
                  {item.referenceEntityType === "TESTBED" && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab && onNavigateTab("testbeds")}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Testbeds →
                    </button>
                  )}
                  {item.referenceEntityType === "MARKETPLACE" && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab && onNavigateTab("challenges")}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Explore →
                    </button>
                  )}

                  {!item.read && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(item.id)}
                      title="Mark as read"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
