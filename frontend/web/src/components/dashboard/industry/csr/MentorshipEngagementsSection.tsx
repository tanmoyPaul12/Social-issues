"use client";

import React, { useState } from "react";
import { useMentorship } from "@/modules/industry/hooks/useMentorship";
import { MentorshipEngagement, LogSessionPayload } from "@/modules/industry/services/mentorshipApi";
import { toast } from "@/components/dashboard/ToastStack";
import { Users } from "@/components/dashboard/icons";

interface MentorshipEngagementsSectionProps {
  onNavigateSubTab?: (subTab: string) => void;
}

export function MentorshipEngagementsSection({ onNavigateSubTab }: MentorshipEngagementsSectionProps) {
  const {
    engagements,
    statusFilter,
    setStatusFilter,
    isLoading,
    refetch,
    updateStatus,
    logSession,
  } = useMentorship("ALL");

  const [selectedForSession, setSelectedForSession] = useState<MentorshipEngagement | null>(null);
  const [sessionForm, setSessionForm] = useState<LogSessionPayload>({
    sessionSummary: "",
    nextSessionDate: "",
    meetingLink: "",
    hoursSpent: 1,
  });

  const handleOpenLogModal = (eng: MentorshipEngagement) => {
    setSelectedForSession(eng);
    setSessionForm({
      sessionSummary: "",
      nextSessionDate: eng.nextScheduledSession || "",
      meetingLink: eng.meetingLink || "",
      hoursSpent: eng.weeklyHoursCommitted || 2,
    });
  };

  const handleConfirmLogSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForSession) return;

    if (!sessionForm.sessionSummary.trim()) {
      toast.error("Session summary notes are required");
      return;
    }

    const success = await logSession(selectedForSession.id, sessionForm);
    if (success) {
      setSelectedForSession(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-black text-slate-900 text-base">Corporate Mentorship &amp; Technical Advisory Hub</h3>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-purple-100 text-purple-800 rounded-md">
              Industry-Academia Track
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Nominate domain experts, guide student innovators through prototyping milestones, and record advisory hours for MCA CSR Schedule VII reporting.
          </p>
        </div>

        {/* Filter & Refresh */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white text-slate-800 outline-none"
          >
            <option value="ALL">All Engagements</option>
            <option value="ACTIVE">Active Mentorships</option>
            <option value="PAUSED">Paused</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            Sync
          </button>
        </div>
      </div>

      {/* List of Engagements */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-xs font-medium">
          Loading corporate mentorship roster...
        </div>
      ) : engagements.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">No Active Mentorship Nominations</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Browse published academic challenges on the Marketplace to nominate technical leaders and mentors.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {engagements.map((eng) => {
            const isActive = eng.status === "ACTIVE";
            return (
              <div
                key={eng.id}
                className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs hover:border-slate-300 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        PROJ-{eng.projectId}
                      </span>
                      <span className="text-slate-600 font-medium px-2 py-0.5 bg-slate-100 rounded">
                        {eng.sector}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isActive
                            ? "bg-emerald-100 text-emerald-800"
                            : eng.status === "COMPLETED"
                            ? "bg-slate-200 text-slate-700"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {eng.status}
                      </span>
                    </div>
                    <h4 className="font-black text-slate-900 text-sm mt-1">{eng.projectTitle}</h4>
                    <p className="text-xs text-slate-500">
                      Host: <strong>{eng.universityName}</strong> • PI: {eng.leadFacultyName}
                    </p>
                  </div>
                </div>

                {/* Mentor Specs */}
                <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-950">{eng.mentorName}</span>
                    <span className="font-mono text-purple-700 text-[11px] font-semibold">
                      {eng.weeklyHoursCommitted}h / week committed
                    </span>
                  </div>
                  <div className="text-slate-600 text-[11px]">{eng.mentorDesignation || "Corporate Advisor"}</div>
                  {eng.domainExpertise && (
                    <div className="text-[11px] text-slate-500">
                      Focus: <strong>{eng.domainExpertise}</strong>
                    </div>
                  )}
                  {eng.advisoryNotes && (
                    <div className="text-[11px] text-slate-600 italic border-t border-purple-100/80 pt-1 mt-1">
                      &ldquo;{eng.advisoryNotes}&rdquo;
                    </div>
                  )}
                </div>

                {/* Telemetry Stats & Next Session */}
                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <div>
                    <span>Completed Sessions: </span>
                    <strong className="text-slate-900 font-mono">{eng.sessionCount || 0}</strong>
                  </div>
                  {eng.nextScheduledSession && (
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500">Next Review: </span>
                      <strong className="text-slate-800 font-mono">{eng.nextScheduledSession}</strong>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    {eng.meetingLink && (
                      <a
                        href={eng.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-xs font-bold"
                      >
                        Join Call →
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenLogModal(eng)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold cursor-pointer"
                    >
                      + Log Session
                    </button>
                    {isActive ? (
                      <button
                        type="button"
                        onClick={() => updateStatus(eng.id, "COMPLETED")}
                        className="px-2.5 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded text-xs font-semibold cursor-pointer"
                      >
                        Close
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => updateStatus(eng.id, "ACTIVE")}
                        className="px-2.5 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded text-xs font-semibold cursor-pointer"
                      >
                        Re-activate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: LOG MENTORSHIP SESSION */}
      {selectedForSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 border border-slate-300 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Log Advisory / Mentorship Session</h3>
                <span className="text-slate-500 font-mono text-[11px]">{selectedForSession.projectTitle}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedForSession(null)}
                className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmLogSession} className="space-y-4 font-medium">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Session Summary &amp; Technical Directives *</label>
                <textarea
                  rows={3}
                  required
                  value={sessionForm.sessionSummary}
                  onChange={(e) => setSessionForm((prev) => ({ ...prev, sessionSummary: e.target.value }))}
                  placeholder="Summarize key architectural guidance, lab test feedback, or telemetry reviews provided to researchers..."
                  className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Hours Spent</label>
                  <input
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={sessionForm.hoursSpent}
                    onChange={(e) => setSessionForm((prev) => ({ ...prev, hoursSpent: parseFloat(e.target.value) || 1 }))}
                    className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Next Scheduled Review</label>
                  <input
                    type="date"
                    value={sessionForm.nextSessionDate}
                    onChange={(e) => setSessionForm((prev) => ({ ...prev, nextSessionDate: e.target.value }))}
                    className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Meeting Video Link (Google Meet / Teams)</label>
                <input
                  type="url"
                  value={sessionForm.meetingLink}
                  onChange={(e) => setSessionForm((prev) => ({ ...prev, meetingLink: e.target.value }))}
                  placeholder="https://meet.google.com/..."
                  className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedForSession(null)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold cursor-pointer"
                >
                  Save Advisory Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
