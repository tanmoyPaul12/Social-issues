"use client";

import React from "react";
import { MarketplaceProject } from "@/modules/industry/types/marketplace";

interface ProjectDossierModalProps {
  project: MarketplaceProject | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenCommit: (project: MarketplaceProject) => void;
  onOpenMentorship: (project: MarketplaceProject) => void;
}

export function ProjectDossierModal({
  project,
  isOpen,
  onClose,
  onOpenCommit,
  onOpenMentorship,
}: ProjectDossierModalProps) {
  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-300 relative max-h-[90vh] overflow-y-auto text-xs space-y-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header Strip */}
        <div className="space-y-2 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              {project.universityName}
            </span>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
              {project.sectorName}
            </span>
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
              TRL Level {project.trlLevel || 4}
            </span>
            <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
              {project.stageLabel}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            {project.title}
          </h2>
          <p className="text-xs text-slate-500">
            Target Testbed Deployment: <strong>{project.targetDistrict || "Jharkhand State"}</strong>
          </p>
        </div>

        {/* Section 1: Executive Abstract */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
            Executive Research Abstract
          </h4>
          <p className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
            {project.abstractDescription}
          </p>
        </div>

        {/* Section 2: Research Team & Financial Ask */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Research Investigators */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              Academic Research Team
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Lead Faculty PI:</span>
                <strong className="text-slate-900">{project.leadFacultyMentor}</strong>
              </div>
              {project.studentLead && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Student Team Lead:</span>
                  <strong className="text-slate-900">{project.studentLead}</strong>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Team Size:</span>
                <strong className="text-slate-900">{project.teamSize} Researchers</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Host Institution:</span>
                <strong className="text-slate-900">{project.universityName}</strong>
              </div>
            </div>
          </div>

          {/* Grant Financials */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              CSR Grant Co-Funding Status
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Required Grant Ask:</span>
                <strong className="font-mono text-sm text-slate-900 font-bold">{project.fundingAskFormatted}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Co-Funded Committed:</span>
                <strong className="font-mono text-xs text-emerald-700 font-bold">{project.fundingCommittedFormatted} ({project.fundedPercentage}%)</strong>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden my-1">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(4, project.fundedPercentage || 0))}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>MCA Eligible: Schedule VII (ix)</span>
                <span>Audit Status: Validated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2.5: Mentorship Lifecycle & Advisory Status */}
        {project.mentorName || project.mentorshipStatus ? (
          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                <h4 className="text-xs font-bold uppercase text-indigo-950 tracking-wider">
                  Corporate Mentorship &amp; Advisory Tracking
                </h4>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  project.mentorshipStatus === "ACTIVE"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : project.mentorshipStatus === "COMPLETED"
                    ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                    : "bg-amber-100 text-amber-800 border border-amber-200"
                }`}
              >
                {(project.mentorshipStatus || "ACTIVE").replace(/_/g, " ")}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Designated Mentor</span>
                <strong className="text-slate-900 text-xs">{project.mentorName || "Designated Industry SPOC"}</strong>
                <span className="text-[11px] text-slate-500 block truncate">{project.mentorDesignation || "Technical Advisor"}</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Sessions Completed</span>
                <strong className="text-indigo-700 text-sm font-mono block">
                  {project.mentorshipSessionCount || 1} Sessions
                </strong>
                <span className="text-[10px] text-slate-400">Bi-weekly technical advisory</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Next Advisory Call</span>
                <strong className="text-slate-900 text-xs block truncate">
                  {project.mentorshipNextSession || "Scheduled with PI"}
                </strong>
                {project.mentorshipMeetingLink ? (
                  <a
                    href={project.mentorshipMeetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-indigo-600 font-bold hover:underline truncate block"
                  >
                    Join Virtual Room →
                  </a>
                ) : (
                  <span className="text-[10px] text-slate-400">Google Meet / Teams</span>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* Section 3: Technical Deliverables & Attachments */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
            Verified Technical Dossier Attachments
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <strong className="text-xs text-slate-900 block">R&amp;D Proposal Specification.pdf</strong>
                  <span className="text-[10px] text-slate-400">Institutional Review Board Approved • 2.4 MB</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => alert("Downloading Technical Proposal Specification...")}
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Download
              </button>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <strong className="text-xs text-slate-900 block">Prototype Schematics &amp; Photos.zip</strong>
                  <span className="text-[10px] text-slate-400">CAD Models &amp; Bench Test Logs • 8.1 MB</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => alert("Downloading Prototype Schematics Archive...")}
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Download
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenMentorship(project);
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold text-xs transition-all cursor-pointer"
          >
            Offer Corporate Mentorship
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCommit(project);
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Commit CSR Grant Funding →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
