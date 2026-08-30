"use client";

import React from "react";
import { ActivePilotsOverview } from "@/modules/industry/types/activePilots";

interface PilotsOverviewStatsProps {
  overview: ActivePilotsOverview;
}

export function PilotsOverviewStats({ overview }: PilotsOverviewStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Card 1: Active Engagements */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Active Pilots
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900">{overview.activePilotsCount}</span>
          <span className="text-xs text-slate-500 font-medium">/ {overview.totalPilotsCount} Total Funded</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">Joint Academic Testbed Deployments</p>
      </div>

      {/* Card 2: Capital Deployment Progress */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Capital Disbursed
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-black text-slate-900">{overview.totalDisbursedFormatted}</span>
          <span className="text-xs font-mono font-bold text-emerald-700">{overview.overallDisbursedPercentage}%</span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, overview.overallDisbursedPercentage)}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 font-mono">
          <span>Committed: {overview.totalCommittedFormatted}</span>
        </div>
      </div>

      {/* Card 3: Pending Milestone Approvals */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Pending Milestones
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900">{overview.pendingMilestonesCount}</span>
          <span className="text-xs text-amber-700 font-bold">Action Needed</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">Deliverables submitted by HEI PIs</p>
      </div>

      {/* Card 4: Projects Requiring Attention */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            At-Risk / Delayed
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900">{overview.atRiskPilotsCount}</span>
          <span className={`text-xs font-bold ${overview.atRiskPilotsCount > 0 ? "text-rose-700" : "text-slate-400"}`}>
            {overview.atRiskPilotsCount > 0 ? "Requires Intervention" : "All Projects Healthy"}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">Schedule or technical roadblocks</p>
      </div>
    </div>
  );
}
