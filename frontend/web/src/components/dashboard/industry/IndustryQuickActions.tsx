"use client";

import React, { useState } from "react";
import { QuickActions as QuickActionsType } from "@/modules/industry/types/industryDashboard";
import { toast } from "@/components/dashboard/ToastStack";

interface IndustryQuickActionsProps {
  quickActions: QuickActionsType;
  onNavigateTab: (tabId: string) => void;
  onTriggerTestEvent?: () => Promise<void>;
}

export function IndustryQuickActions({
  quickActions,
  onNavigateTab,
  onTriggerTestEvent,
}: IndustryQuickActionsProps) {
  const [isTriggering, setIsTriggering] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const pendingApprovals = quickActions?.pendingApprovalsCount ?? 0;
  const proposalsCount = quickActions?.proposalsAwaitingReviewCount ?? 0;

  const handleExportCsrLedger = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      toast.success("MCA CSR-1 Compliance Dossier (FY 2026-2027) generated successfully.");
    }, 1200);
  };

  const handleTestEvent = async () => {
    if (!onTriggerTestEvent) return;
    setIsTriggering(true);
    try {
      await onTriggerTestEvent();
      toast.success("Simulated deliverable submission dispatched to Redis Pub/Sub.");
    } catch {
      toast.error("Failed to dispatch test event.");
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-lg p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wide">
            Corporate Command Shortcuts
          </span>
          <span className="text-xs text-slate-400">Schedule VII Allocation Hub</span>
        </div>
        <h3 className="text-base font-bold text-white tracking-tight">
          Accelerate Academic Partnerships &amp; Milestone Sign-offs
        </h3>
      </div>

      {/* Quick Action Button Group */}
      <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto">
        {/* 1. Browse Marketplace Button */}
        <button
          type="button"
          onClick={() => onNavigateTab("marketplace")}
          className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 active:scale-98 transition-all cursor-pointer shadow-xs"
        >
          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>Browse Marketplace</span>
          {proposalsCount > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-black bg-indigo-100 text-indigo-900 rounded">
              {proposalsCount} New
            </span>
          )}
        </button>

        {/* 2. View Pending Approvals Button */}
        <button
          type="button"
          onClick={() => onNavigateTab("engagements")}
          className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs active:scale-98 transition-all cursor-pointer shadow-xs"
        >
          <svg className="w-4 h-4 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Pending Approvals</span>
          {pendingApprovals > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-black bg-slate-950 text-amber-300 rounded">
              {pendingApprovals}
            </span>
          )}
        </button>

        {/* 3. Export CSR Dossier */}
        <button
          type="button"
          onClick={handleExportCsrLedger}
          disabled={isExporting}
          className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs active:scale-98 transition-all cursor-pointer"
        >
          {isExporting ? (
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          )}
          <span>CSR-1 Dossier</span>
        </button>

        {/* 4. Live Test Realtime Event Button */}
        {onTriggerTestEvent && (
          <button
            type="button"
            onClick={handleTestEvent}
            disabled={isTriggering}
            title="Simulate university milestone upload event via Redis Pub/Sub"
            className="p-2.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-amber-400 transition-colors cursor-pointer"
          >
            {isTriggering ? (
              <span className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin inline-block" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
