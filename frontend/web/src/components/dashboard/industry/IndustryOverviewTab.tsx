"use client";

import React from "react";
import { useIndustryOverview } from "@/modules/industry/hooks/useIndustryOverview";
import { IndustryStatCards } from "./IndustryStatCards";
import { IndustryQuickActions } from "./IndustryQuickActions";
import { IndustrySectorEngagementChart } from "./IndustrySectorEngagementChart";
import { IndustryRecentActivityFeed } from "./IndustryRecentActivityFeed";

interface IndustryOverviewTabProps {
  onNavigateTab: (tabId: string) => void;
}

export function IndustryOverviewTab({ onNavigateTab }: IndustryOverviewTabProps) {
  const {
    overview,
    isLoading,
    isRefreshing,
    error,
    financialYear,
    setFinancialYear,
    refetch,
    markAsRead,
    triggerTestNotification,
  } = useIndustryOverview();

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight">
            Corporate CSR Portfolio &amp; R&amp;D Sponsorship
          </h2>
          <p className="text-xs text-slate-500">
            Real-time telemetry on capital allocation, pilot testbeds, and academic milestones
          </p>
        </div>

        {/* Controls: FY Selector & Manual Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Financial Year Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1">
            <span className="text-[11px] font-bold text-slate-500">FY:</span>
            <select
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="2026-2027">2026-2027 (Current)</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2024-2025">2024-2025</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isRefreshing}
            title="Refresh overview metrics"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs active:scale-95 transition-all cursor-pointer"
          >
            <svg
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-slate-900" : "text-slate-500"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="text-[11px]">{isRefreshing ? "Syncing..." : "Sync"}</span>
          </button>
        </div>
      </div>

      {/* Optional Warning Banner if API had non-fatal error */}
      {error && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="font-bold underline cursor-pointer hover:text-amber-950"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* 1. Stat Cards Row */}
      <IndustryStatCards stats={overview.statCards} isLoading={isLoading} />

      {/* 2. Quick Action Shortcuts */}
      <IndustryQuickActions
        quickActions={overview.quickActions}
        onNavigateTab={onNavigateTab}
        onTriggerTestEvent={triggerTestNotification}
      />

      {/* 3. Two-Column Grid: Domain Engagement Chart (Left) + Recent Activity Feed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 flex flex-col">
          <IndustrySectorEngagementChart
            sectorData={overview.sectorEngagement}
            totalCommittedFormatted={overview.statCards?.csrCapitalCommittedFormatted || "₹45.0 L"}
          />
        </div>

        <div className="lg:col-span-6 flex flex-col">
          <IndustryRecentActivityFeed
            activities={overview.recentActivities}
            onMarkAsRead={markAsRead}
            onNavigateTab={onNavigateTab}
          />
        </div>
      </div>
    </div>
  );
}
