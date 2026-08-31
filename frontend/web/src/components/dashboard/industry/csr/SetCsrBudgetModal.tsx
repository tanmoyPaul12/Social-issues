"use client";

import React, { useState } from "react";
import { CsrBudgetSummary, SetCsrBudgetPayload } from "@/modules/industry/types/csrCompliance";

interface SetCsrBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: SetCsrBudgetPayload) => Promise<boolean>;
  currentSummary: CsrBudgetSummary | null;
  financialYear: string;
  isSaving: boolean;
}

export function SetCsrBudgetModal({
  isOpen,
  onClose,
  onSave,
  currentSummary,
  financialYear,
  isSaving,
}: SetCsrBudgetModalProps) {
  const [obligation, setObligation] = useState<number>(
    currentSummary?.mandatoryCsrObligation || 25000000
  );
  const [earmarked, setEarmarked] = useState<number>(
    currentSummary?.earmarkedForHeis || 10000000
  );
  const [boardDate, setBoardDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [remarks, setRemarks] = useState<string>(
    "Annual CSR Board approval under Section 135(5) for Public HEIs & Incubator R&D."
  );

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onSave({
      financialYear,
      mandatoryCsrObligation: obligation,
      earmarkedForHeis: earmarked,
      boardApprovalDate: boardDate,
      remarks,
    });
    if (ok) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="csr-budget-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Close dialog"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-md">
            ₹
          </div>
          <div>
            <h2 id="csr-budget-modal-title" className="text-base font-black text-slate-900 tracking-tight">
              Set Annual CSR Obligation &amp; HEI Allocation
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Financial Year: <span className="font-mono font-bold text-slate-800">{financialYear}</span> • Section 135 Compliance
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mandatory CSR Obligation (2% Average Net Profit):
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="10000"
                value={obligation}
                onChange={(e) => setObligation(parseFloat(e.target.value) || 0)}
                required
                className="w-full pl-8 pr-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-400 outline-none text-slate-900"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Formatted: <strong className="text-slate-700">₹{(obligation / 10000000).toFixed(2)} Cr (₹{(obligation / 100000).toFixed(1)} Lakhs)</strong>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Earmarked Allocation for HEIs &amp; University R&amp;D (Schedule VII Item ix):
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                ₹
              </span>
              <input
                type="number"
                min="0"
                max={obligation}
                step="10000"
                value={earmarked}
                onChange={(e) => setEarmarked(parseFloat(e.target.value) || 0)}
                required
                className="w-full pl-8 pr-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-400 outline-none text-slate-900"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Share of Obligation: <strong className="text-emerald-700">{obligation > 0 ? ((earmarked / obligation) * 100).toFixed(1) : 0}%</strong>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Board Approval / CSR Committee Resolution Date:
            </label>
            <input
              type="date"
              value={boardDate}
              onChange={(e) => setBoardDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Statutory Remarks / Board Minuting Note:
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full p-2.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 outline-none focus:border-slate-400 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>Save Statutory Budget →</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
