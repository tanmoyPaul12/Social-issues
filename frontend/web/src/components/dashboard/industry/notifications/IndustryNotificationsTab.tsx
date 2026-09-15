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
import { useIndustryPitchStore } from "@/lib/store/useIndustryPitchStore";
import {
  registerProjectPitchThread,
  postThreadMessage,
  CommunicationThread,
} from "@/modules/communication/services/communicationApi";

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

const SAMPLE_FALLBACK_ACTIVITIES: IndustryActivity[] = [];

export function IndustryNotificationsTab({ onNavigateTab }: IndustryNotificationsTabProps) {
  const { token, user } = useAuthStore();
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

  const { pitches: storePitches, addPitch, acceptPitch, rejectPitch } = useIndustryPitchStore();
  const [localPitches, setLocalPitches] = useState<any[]>([]);

  const syncLocalPitches = useCallback(() => {
    if (typeof window !== "undefined") {
      const allPitches: any[] = [];
      const seenIds = new Set<string>();

      // 1. Read from raw pitch array key (written by addPitch)
      try {
        const stored = localStorage.getItem("social_issues_csr_pitches_v1");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            parsed.forEach((p) => { if (p?.id && !seenIds.has(p.id)) { seenIds.add(p.id); allPitches.push(p); } });
          }
        }
      } catch (e) {}

      // 2. Also read from zustand persist key (format: { state: { pitches: [] }, version: 0 })
      try {
        const zustandStored = localStorage.getItem("social_issues_industry_pitch_store_v1");
        if (zustandStored) {
          const parsed = JSON.parse(zustandStored);
          const pitchArray = parsed?.state?.pitches;
          if (Array.isArray(pitchArray)) {
            pitchArray.forEach((p) => { if (p?.id && !seenIds.has(p.id)) { seenIds.add(p.id); allPitches.push(p); } });
          }
        }
      } catch (e) {}

      if (allPitches.length > 0) setLocalPitches(allPitches);
    }
  }, []);

  useEffect(() => {
    syncLocalPitches();
    const interval = setInterval(syncLocalPitches, 2000);
    return () => clearInterval(interval);
  }, [syncLocalPitches]);

  const pitches = useMemo(() => {
    const map = new Map<string, any>();
    localPitches.forEach((p) => map.set(p.id, p));
    storePitches.forEach((p) => map.set(p.id, p));
    return Array.from(map.values());
  }, [localPitches, storePitches]);

  const handleAcceptCsrPitch = (pitchId: string) => {
    const accepted = acceptPitch(pitchId);
    if (accepted) {
      const createdThread = registerProjectPitchThread({
        id: accepted.threadId,
        pilotId: accepted.threadId,
        title: accepted.projectTitle,
        partnerName: accepted.universityName,
        partnerRole: `Lead PI • ${accepted.universityName}`,
        sector: accepted.category || "CSR Grant",
        lastMessage: "Pitch accepted by Industry CSR Committee.",
        timestamp: "Just now",
        unreadCount: 0,
        type: "PILOT",
        avatarBg: "bg-indigo-600",
        universityName: accepted.universityName || "Birla Institute of Technology (BIT) Mesra",
        companyName: accepted.targetCompany || user?.name || "Corporate CSR Sponsor",
      });

      try {
        postThreadMessage(
          token,
          createdThread.id,
          `🤝 CSR GRANT PROPOSAL ACCEPTED\n\nCorporate Partner (${user?.name || accepted.targetCompany || "Industry CSR Committee"}) has officially accepted the grant pitch for "${accepted.projectTitle}".\n\nActive communication channel is now open for prototype review, technical mentorship, and milestone disbursements.`,
          undefined,
          undefined,
          createdThread.pilotId,
          user?.name || "Industry CSR SPOC",
          "INDUSTRY_SPOC",
          accepted.projectTitle,
          "INDUSTRY"
        );
      } catch {}

      toast.success(`Accepted CSR Pitch for "${accepted.projectTitle}"! Moved to My Co-Funded Projects.`);
      if (onNavigateTab) {
        onNavigateTab("collaborations");
      }
    }
  };

  const handleRejectCsrPitch = (pitchId: string) => {
    rejectPitch(pitchId);
    toast.info("CSR Pitch Proposal declined.");
  };

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
      const threadId = Date.now();
      addPitch({
        id: `pitch-${threadId}`,
        threadId: threadId,
        projectCode: "BIT-WATER-2024-01",
        projectTitle: "Arsenic & Turbidity Inline Filtration Unit",
        universityName: "Birla Institute of Technology, Mesra",
        targetCompany: "Registered Corporate Partner",
        requestedAmount: 350000,
        category: "Direct Hardware & Lab Equipment Grant",
        description: "Req for IoT water quality sensors & field testbed modems for Ramgarh district deployment.",
        mentorNeeds: "Senior IoT firmware architect for telemetry review",
        submittedAt: new Date().toISOString(),
      });
      syncLocalPitches();
      toast.success("Simulated incoming University CSR pitch requisition!");
    } catch {
      toast.info("Test event simulated.");
    } finally {
      setIsTriggeringTest(false);
    }
  };

  // Dynamically map all pitches into Industry Notifications Activity Feed
  const dynamicPitchActivities = useMemo(() => {
    return pitches.map((pitch, idx) => ({
      id: 990000 + idx,
      title: `🏛️ ${pitch.universityName} Pitched CSR Proposal: "${pitch.projectTitle}"`,
      description: `Target Sponsor: ${pitch.targetCompany} • Requisition: ₹${pitch.requestedAmount.toLocaleString()} (${pitch.category}). ${pitch.description}`,
      eventType: "UNIVERSITY_PITCH",
      severity: pitch.status === "PENDING" ? ("ACTION_REQUIRED" as const) : ("SUCCESS" as const),
      timestamp: pitch.submittedAt || new Date().toISOString(),
      relativeTime: "Just now",
      read: pitch.status !== "PENDING",
      referenceEntityId: String(pitch.id),
      referenceEntityType: "PILOT",
      actionUrl: "/dashboard?tab=collaborations",
    }));
  }, [pitches]);

  const combinedActivities = useMemo(() => {
    return [...dynamicPitchActivities, ...activities];
  }, [dynamicPitchActivities, activities]);

  const filteredActivities = useMemo(() => {
    return combinedActivities.filter((act) => {
      // Category filter
      if (selectedCategory === "MILESTONE") {
        if (!act.eventType.includes("MILESTONE") && !act.eventType.includes("DISBURSEMENT")) return false;
      } else if (selectedCategory === "COMPLIANCE") {
        if (!act.eventType.includes("COMPLIANCE") && !act.eventType.includes("CSR")) return false;
      } else if (selectedCategory === "PROJECTS") {
        if (!act.eventType.includes("PROPOSAL") && !act.eventType.includes("PROJECT") && !act.eventType.includes("PITCH")) return false;
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
  }, [combinedActivities, selectedCategory, searchQuery]);

  const unreadCount = combinedActivities.filter((a) => !a.read).length;

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



      {/* ── INCOMING UNIVERSITY CSR PITCH PROPOSALS ── */}
      {pitches.filter((p) => p.status === "PENDING").length > 0 && (
        <div className="space-y-3 bg-indigo-950 text-white p-5 rounded-2xl border border-indigo-700 shadow-md">
          <div className="flex items-center justify-between border-b border-indigo-800 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                Action Required • University CSR Requisitions
              </span>
              <h3 className="text-base font-black text-white">
                Incoming University CSR Grant Pitches
              </h3>
            </div>
            <span className="bg-indigo-600 text-white text-xs px-3 py-1 rounded-full font-bold">
              {pitches.filter((p) => p.status === "PENDING").length} Pending Proposal(s)
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {pitches
              .filter((p) => p.status === "PENDING")
              .map((pitch) => (
                <div
                  key={pitch.id}
                  className="p-4 rounded-xl bg-slate-900/90 border border-indigo-600/50 space-y-3 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[10px] bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded border border-indigo-400/30">
                          {pitch.projectCode}
                        </span>
                        <span className="text-xs font-bold text-slate-200">{pitch.universityName}</span>
                      </div>
                      <h4 className="text-sm font-black text-white mt-1">{pitch.projectTitle}</h4>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-emerald-400 font-mono">
                        ₹{pitch.requestedAmount.toLocaleString()}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Requested CSR Grant</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-slate-300">
                    <p><strong>Category:</strong> <span className="text-indigo-200">{pitch.category}</span></p>
                    <p className="text-slate-300 leading-relaxed bg-slate-800/80 p-2.5 rounded border border-slate-700/80">
                      "{pitch.description}"
                    </p>
                    {pitch.mentorNeeds && (
                      <p className="text-slate-400 text-[11px]">
                        <strong>Mentor Needs:</strong> {pitch.mentorNeeds}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleRejectCsrPitch(pitch.id)}
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-rose-500/40 text-rose-300 text-xs font-bold transition-colors cursor-pointer"
                    >
                      ✕ Decline / Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAcceptCsrPitch(pitch.id)}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
                    >
                      ✓ Accept Pitch &amp; Co-Fund
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

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
