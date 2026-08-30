"use client";

import React, { useState } from "react";
import { Milestone, ReviewMilestonePayload } from "@/modules/industry/types/activePilots";

interface ReviewMilestoneModalProps {
  milestone: Milestone;
  pilotTitle: string;
  universityName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: ReviewMilestonePayload) => Promise<boolean>;
}

export function ReviewMilestoneModal({
  milestone,
  pilotTitle,
  universityName,
  isOpen,
  onClose,
  onSubmit,
}: ReviewMilestoneModalProps) {
  const [action, setAction] = useState<"APPROVE" | "REQUEST_REVISION">("APPROVE");
  const [remarks, setRemarks] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await onSubmit({
      action,
      reviewRemarks: remarks.trim(),
    });
    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto text-xs">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono font-bold text-[10px]">
              Milestone {milestone.milestoneNumber}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Tranche: {milestone.trancheAmountFormatted}</span>
          </div>
          <h2 className="text-base font-black text-slate-900 mt-1">{milestone.title}</h2>
          <p className="text-slate-500 text-[11px] mt-0.5 truncate">
            {pilotTitle} • {universityName}
          </p>
        </div>

        {/* Deliverable Details Box */}
        <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg space-y-2 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Deliverable Summary:</span>
            <p className="text-slate-800 font-medium mt-0.5">{milestone.deliverableSummary}</p>
          </div>

          {milestone.submissionRemarks && (
            <div className="pt-2 border-t border-slate-200/60">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">University PI Remarks:</span>
              <p className="text-slate-700 italic mt-0.5 bg-white p-2 rounded border border-slate-200/60">
                "{milestone.submissionRemarks}"
              </p>
            </div>
          )}

          {milestone.evidenceDocUrl && (
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-slate-600 font-semibold text-[11px]">Lab / Testbed Evidence Attachment</span>
              <a
                href={milestone.evidenceDocUrl}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:text-indigo-800 font-bold underline text-[11px]"
              >
                View Artifact
              </a>
            </div>
          )}
        </div>

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-slate-800 font-bold mb-2">Review Decision:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAction("APPROVE")}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  action === "APPROVE"
                    ? "bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400/20 font-bold"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${action === "APPROVE" ? "border-emerald-600 bg-emerald-600" : "border-slate-300"}`}>
                    {action === "APPROVE" && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <span className="text-xs">Approve Milestone</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 pl-5">
                  Unlocks grant tranche release &amp; advances progress.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAction("REQUEST_REVISION")}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  action === "REQUEST_REVISION"
                    ? "bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-400/20 font-bold"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${action === "REQUEST_REVISION" ? "border-amber-600 bg-amber-600" : "border-slate-300"}`}>
                    {action === "REQUEST_REVISION" && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <span className="text-xs">Request Revision</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 pl-5">
                  Sends feedback back to research faculty for correction.
                </p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-800 font-bold mb-1">
              Reviewer Remarks / Technical Feedback:
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={
                action === "APPROVE"
                  ? "Verified test reports and NABL certifications. Tranche approval granted."
                  : "Specify required test repeats, additional calibration datasets, or deliverable corrections..."
              }
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 text-xs"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 rounded-lg font-bold text-white transition-all cursor-pointer flex items-center gap-2 ${
                action === "APPROVE"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-amber-600 hover:bg-amber-700"
              }`}
            >
              {isSubmitting ? "Submitting Review..." : action === "APPROVE" ? "Confirm Approval" : "Send Revision Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
