"use client";

import React, { useState } from "react";
import { MarketplaceProject, CommitFundingPayload } from "@/modules/industry/types/marketplace";
import { useAuthStore } from "@/lib/store/useAuthStore";

interface CommitFundingModalProps {
  project: MarketplaceProject | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectId: number, payload: CommitFundingPayload) => Promise<boolean>;
}

export function CommitFundingModal({
  project,
  isOpen,
  onClose,
  onSubmit,
}: CommitFundingModalProps) {
  const { user } = useAuthStore();
  const companyName = user?.orgName || user?.name || "Corporate CSR Partner";

  const defaultAmount = project ? Math.max(100000, project.fundingAskAmount - project.fundingCommittedAmount) : 500000;
  const [grantAmount, setGrantAmount] = useState<number>(defaultAmount);
  const [mentorName, setMentorName] = useState<string>(user?.name ? `${user.name} (${user.designation || "CSR SPOC"})` : "Corporate Technical SPOC");
  const [messageNotes, setMessageNotes] = useState<string>("");
  const [scheduleVii, setScheduleVii] = useState<string>("Item (ix) - Contribution to Public Funded Universities & Incubators");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (grantAmount <= 0) return;

    setIsSubmitting(true);
    const success = await onSubmit(project.id, {
      grantAmount,
      corporateMentorName: mentorName,
      csrScheduleViiHead: scheduleVii,
      messageNotes,
      financialYear: "2026-2027",
    });
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  const formattedGrant = (grantAmount || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl border border-slate-300 relative max-h-[90vh] overflow-y-auto text-xs">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
            MCA Schedule VII CSR Grant
          </span>
        </div>
        <h3 className="text-lg font-black text-slate-900 tracking-tight">
          Commit CSR Co-Funding
        </h3>
        <p className="text-slate-500 mt-1">
          Co-funding <strong>{project.title}</strong> with <strong>{project.universityName}</strong>.
        </p>

        {/* Financial Context Card */}
        <div className="my-4 p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Budget Ask</span>
            <strong className="font-mono text-sm text-slate-900 font-bold">{project.fundingAskFormatted}</strong>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Co-Funded</span>
            <strong className="font-mono text-xs text-emerald-700 font-bold">{project.fundingCommittedFormatted} ({project.fundedPercentage}%)</strong>
          </div>
        </div>

        {/* Commitment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Grant Amount to Commit: <span className="font-mono text-amber-700">({formattedGrant})</span>
            </label>
            <input
              type="number"
              min="10000"
              step="10000"
              required
              value={grantAmount}
              onChange={(e) => setGrantAmount(Number(e.target.value))}
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-mono font-bold text-sm outline-none focus:border-slate-500"
            />
            <div className="flex gap-1.5 mt-1.5">
              {[200000, 500000, 1000000, 1500000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setGrantAmount(preset)}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 cursor-pointer"
                >
                  ₹{(preset / 100000).toFixed(0)} Lakhs
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">MCA CSR Schedule VII Eligible Head:</label>
            <select
              value={scheduleVii}
              onChange={(e) => setScheduleVii(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 outline-none focus:border-slate-500"
            >
              <option value="Item (ix) - Contribution to Public Funded Universities & Incubators">
                Item (ix) - Contribution to Public Funded Universities &amp; Incubators
              </option>
              <option value="Item (iv) - Environmental Sustainability & Water Conservation">
                Item (iv) - Environmental Sustainability &amp; Water Conservation
              </option>
              <option value="Item (ii) - Healthcare & Sanitation Innovation">
                Item (ii) - Healthcare &amp; Sanitation Innovation
              </option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Nominate Corporate Mentor / SPOC:</label>
            <input
              type="text"
              value={mentorName}
              onChange={(e) => setMentorName(e.target.value)}
              placeholder="e.g. Dr. Ramesh Gupta (VP R&D)"
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Special Grant Conditions / Scope Notes (Optional):</label>
            <textarea
              rows={2}
              value={messageNotes}
              onChange={(e) => setMessageNotes(e.target.value)}
              placeholder="e.g. Grant tranches linked to Stage 2 field telemetry verification..."
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 outline-none focus:border-slate-500"
            />
          </div>

          {/* Compliance Check */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex items-start gap-2 text-[11px] text-amber-900">
            <input type="checkbox" defaultChecked required className="mt-0.5 cursor-pointer" />
            <span>
              I confirm on behalf of <strong>{companyName}</strong> that this grant is allocated under Section 135 MCA guidelines and will be tracked in the verified Jharkhand CSR Ledger.
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Sign Tripartite CSR Grant Commitment ({formattedGrant})</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
