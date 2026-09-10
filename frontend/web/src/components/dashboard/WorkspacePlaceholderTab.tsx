"use client";

import React, { useState } from "react";
import { toast } from "@/components/dashboard/ToastStack";

interface WorkspacePlaceholderTabProps {
  title: string;
  subtitle?: string;
  description: string;
  role?: string;
  tabId?: string;
  statusBadge?: string;
  features?: string[];
  onNavigateTab?: (tabId: string) => void;
}

export function WorkspacePlaceholderTab({
  title,
  subtitle = "Module Workspace Standby",
  description,
  role = "workspace",
  tabId = "active_tab",
  statusBadge = "Under Active Development",
  features = [],
  onNavigateTab,
}: WorkspacePlaceholderTabProps) {
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [userNote, setUserNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userNote.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setFeedbackSent(true);
      toast.success("Feedback submitted to the Platform Product Board.");
    }, 600);
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                {statusBadge}
              </span>
              <span className="text-xs font-mono text-slate-400 uppercase">
                {role} • tab/{tabId}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {description}
            </p>
          </div>

          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab("overview")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10 cursor-pointer self-start flex-shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Overview</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Features Specs + Workspace Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Planned Capabilities */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Planned Functional Capabilities
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            </div>
            <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              NEP &amp; SDC Specification
            </span>
          </div>

          {features.length > 0 ? (
            <div className="space-y-3">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div className="w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 text-xs font-mono font-bold shadow-2xs">
                    0{idx + 1}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{feature}</span>
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      Automated audit trail &amp; multi-stakeholder governance workflow
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs">
              Specification details will be populated in the next platform release cycle.
            </div>
          )}

          {/* Quick Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
            {onNavigateTab && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigateTab("overview")}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                >
                  Go to Overview Dashboard →
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab("challenges")}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer transition-colors"
                >
                  Explore Active Challenges
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Module Status & Feedback Card */}
        <div className="space-y-6">
          {/* Status Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wide text-[11px] text-slate-500">
              Workspace Telemetry
            </h3>

            <div className="space-y-2 font-mono text-[11px]">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Route State:</span>
                <span className="font-bold text-emerald-700">STANDBY_OK</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Target Role:</span>
                <span className="font-bold text-slate-800 uppercase">{role}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Target Module:</span>
                <span className="font-bold text-indigo-700">{tabId}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Milestone Target:</span>
                <span className="font-bold text-slate-800">Sprint 4.2</span>
              </div>
            </div>
          </div>

          {/* User Feedback / Feature Request Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900">
              Request Specific Features
            </h3>
            <p className="text-[11px] text-slate-500">
              Have specific data fields or integration needs for this module? Share your requirement with the project lead.
            </p>

            {feedbackSent ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-bold flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Requirement logged successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleSendFeedback} className="space-y-2">
                <textarea
                  rows={3}
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  placeholder="e.g. Export patent data in JSON, schedule video calls with Google Meet..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:bg-white focus:border-slate-400 transition-colors"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !userNote.trim()}
                  className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs cursor-pointer transition-all"
                >
                  {isSubmitting ? "Submitting..." : "Send Module Feedback"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
