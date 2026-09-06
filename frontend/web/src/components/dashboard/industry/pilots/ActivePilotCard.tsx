"use client";

import React from "react";
import { ActivePilotSummary, PilotHealthStatus } from "@/modules/industry/types/activePilots";

interface ActivePilotCardProps {
  pilot: ActivePilotSummary;
  onOpenDossier: (pilot: ActivePilotSummary, defaultTab?: "milestones" | "disbursements" | "discussions" | "documents") => void;
  onReviewMilestone?: (pilot: ActivePilotSummary) => void;
}

export function ActivePilotCard({ pilot, onOpenDossier, onReviewMilestone }: ActivePilotCardProps) {
  const getHealthBadge = (health: PilotHealthStatus) => {
    switch (health) {
      case "ON_TRACK":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            On Track
          </span>
        );
      case "DELAYED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Delayed
          </span>
        );
      case "AT_RISK":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            At Risk
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Completed
          </span>
        );
    }
  };

  const isPendingReview = pilot.status === "MILESTONE_PENDING";

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-sm transition-all p-5 flex flex-col justify-between group">
      <div>
        {/* Header Badges */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
              {pilot.sectorName}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700">
              {pilot.stageLabel}
            </span>
            {pilot.targetDistrict && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-200/60">
                 {pilot.targetDistrict}
              </span>
            )}
          </div>
          <div>{getHealthBadge(pilot.healthStatus)}</div>
        </div>

        {/* Title & Description */}
        <h3
          onClick={() => onOpenDossier(pilot)}
          className="text-sm font-bold text-slate-900 group-hover:text-indigo-900 transition-colors line-clamp-2 cursor-pointer"
        >
          {pilot.title}
        </h3>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{pilot.abstractDescription}</p>

        {/* University & Lead Mentor */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700">
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="font-semibold text-slate-800 truncate">{pilot.universityName}</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
            <span className="truncate">PI: {pilot.facultyLeadName || "Faculty Guide"}</span>
            {pilot.corporateMentorName && (
              <span className="text-slate-400 truncate">Mentor: {pilot.corporateMentorName}</span>
            )}
          </div>
        </div>

        {/* Milestone Progress Section */}
        <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800">
              Milestone {pilot.currentMilestone} of {pilot.totalMilestones}
            </span>
            <span className="font-mono font-bold text-indigo-700">{pilot.progressPercentage}%</span>
          </div>

          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                pilot.healthStatus === "AT_RISK"
                  ? "bg-rose-500"
                  : pilot.healthStatus === "DELAYED"
                  ? "bg-amber-500"
                  : "bg-indigo-600"
              }`}
              style={{ width: `${Math.min(100, pilot.progressPercentage)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-500">
            <span>
              Next Due:{" "}
              <strong className="text-slate-700">
                {pilot.nextDeliverableDate || "TBD"}
              </strong>
            </span>
            {isPendingReview && (
              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 font-bold rounded">
                Deliverable Submitted
              </span>
            )}
          </div>
        </div>

        {/* Financial Flow Section */}
        <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 bg-white border border-slate-200/80 rounded-lg">
            <span className="text-[10px] font-medium text-slate-400 block uppercase">Committed</span>
            <strong className="text-slate-900 font-mono text-xs">{pilot.totalBudgetFormatted}</strong>
          </div>
          <div className="p-2.5 bg-white border border-slate-200/80 rounded-lg">
            <span className="text-[10px] font-medium text-slate-400 block uppercase">Disbursed</span>
            <strong className="text-emerald-700 font-mono text-xs">{pilot.disbursedBudgetFormatted}</strong>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onOpenDossier(pilot, "milestones")}
          className="flex-1 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer text-center"
        >
          Project Dossier
        </button>

        {isPendingReview && onReviewMilestone && (
          <button
            type="button"
            onClick={() => onReviewMilestone(pilot)}
            className="py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-2xs transition-all cursor-pointer animate-bounce"
            title="Review pending milestone deliverable"
          >
            Review Deliverable
          </button>
        )}

        <button
          type="button"
          onClick={() => onOpenDossier(pilot, "discussions")}
          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          title="Open Collaboration Discussion"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
