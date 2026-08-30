"use client";

import React, { useState } from "react";
import { MarketplaceProject, MarketplaceStage } from "@/modules/industry/types/marketplace";

interface MarketplaceProjectCardProps {
  project: MarketplaceProject;
  onOpenCommit: (project: MarketplaceProject) => void;
  onOpenMentorship: (project: MarketplaceProject) => void;
  onOpenInterest: (project: MarketplaceProject) => void;
  onOpenDossier: (project: MarketplaceProject) => void;
}

const SECTOR_BADGES: Record<string, { bg: string; text: string; border: string }> = {
  AGRICULTURE: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
  WATER: { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200" },
  HEALTH: { bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-200" },
  ELECTRICITY: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  EDUCATION: { bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-200" },
  ROADS_AND_TRANSPORT: { bg: "bg-violet-50", text: "text-violet-800", border: "border-violet-200" },
  OTHER: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" },
};

const STAGE_BADGES: Record<MarketplaceStage, { bg: string; text: string; border: string }> = {
  PROTOTYPE: { bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200" },
  NEEDS_FUNDING: { bg: "bg-amber-50", text: "text-amber-900", border: "border-amber-300" },
  NEEDS_MENTOR: { bg: "bg-cyan-50", text: "text-cyan-900", border: "border-cyan-200" },
  READY_FOR_TESTBED: { bg: "bg-emerald-50", text: "text-emerald-900", border: "border-emerald-300" },
};

export function MarketplaceProjectCard({
  project,
  onOpenCommit,
  onOpenMentorship,
  onOpenInterest,
  onOpenDossier,
}: MarketplaceProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const sectorStyle = SECTOR_BADGES[project.sector] || SECTOR_BADGES.OTHER;
  const stageStyle = STAGE_BADGES[project.stage] || STAGE_BADGES.PROTOTYPE;

  return (
    <div className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      {/* Top Strip: University & Sector Badges */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          {/* University Info */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 flex-shrink-0">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-slate-800 truncate" title={project.universityName}>
              {project.universityName}
            </span>
          </div>

          {/* Sector & Stage Badges */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sectorStyle.bg} ${sectorStyle.text} ${sectorStyle.border}`}>
              {project.sectorName}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stageStyle.bg} ${stageStyle.text} ${stageStyle.border}`}>
              {project.stageLabel}
            </span>
          </div>
        </div>

        {/* Project Title & TRL */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
              TRL {project.trlLevel || 4}
            </span>
            {project.targetDistrict && (
              <span className="text-[10px] font-medium text-slate-500 flex items-center gap-0.5">
                <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {project.targetDistrict}
              </span>
            )}
          </div>
          <h3
            onClick={() => onOpenDossier(project)}
            className="text-sm sm:text-base font-bold text-slate-900 leading-snug group-hover:text-indigo-900 transition-colors cursor-pointer"
          >
            {project.title}
          </h3>
        </div>

        {/* Abstract */}
        <p className={`text-xs text-slate-600 leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>
          {project.abstractDescription}
        </p>
        {project.abstractDescription && project.abstractDescription.length > 120 && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
          >
            {isExpanded ? "Show less" : "Read abstract..."}
          </button>
        )}

        {/* Faculty PI & Student Team */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-medium">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-slate-400">PI:</span>
            <strong className="text-slate-700 truncate">{project.leadFacultyMentor}</strong>
          </div>
          <span className="flex-shrink-0 text-[11px] text-slate-500">
            Team: <strong>{project.teamSize} researchers</strong>
          </span>
        </div>

        {/* Financial Ask & Co-Funding Telemetry */}
        <div className="bg-slate-50/90 rounded-lg p-3 border border-slate-100 space-y-2">
          <div className="flex justify-between items-baseline text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Required Grant</span>
              <strong className="font-mono text-sm font-black text-slate-900">
                {project.fundingAskFormatted || "₹0"}
              </strong>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Co-Funded</span>
              <strong className="font-mono text-xs font-bold text-emerald-700">
                {project.fundingCommittedFormatted || "₹0"} ({project.fundedPercentage || 0}%)
              </strong>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(3, project.fundedPercentage || 0))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Action Strip */}
      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {/* Action 1: Commit CSR Grant */}
          <button
            type="button"
            onClick={() => onOpenCommit(project)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-2xs active:scale-98 transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Commit CSR</span>
          </button>

          {/* Action 2: Offer Mentorship */}
          <button
            type="button"
            onClick={() => onOpenMentorship(project)}
            className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/70 font-bold text-xs active:scale-98 transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Offer Mentor</span>
          </button>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          {/* Action 3: Express LOI / Interest */}
          <button
            type="button"
            onClick={() => onOpenInterest(project)}
            className="text-slate-500 hover:text-slate-900 font-bold text-[11px] underline underline-offset-2 transition-colors cursor-pointer"
          >
            Express Interest
          </button>

          {/* Action 4: Full Dossier Inspection */}
          <button
            type="button"
            onClick={() => onOpenDossier(project)}
            className="inline-flex items-center gap-1 text-slate-700 hover:text-indigo-900 font-bold text-xs transition-colors cursor-pointer group-hover:translate-x-0.5"
          >
            <span>Full Dossier</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
