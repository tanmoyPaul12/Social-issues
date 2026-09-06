"use client";

import React, { useState } from "react";
import { DisbursementTranche, ReleaseDisbursementPayload } from "@/modules/industry/types/activePilots";

interface ReleaseDisbursementModalProps {
  disbursement: DisbursementTranche;
  pilotTitle: string;
  universityName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: ReleaseDisbursementPayload) => Promise<boolean>;
}

export function ReleaseDisbursementModal({
  disbursement,
  pilotTitle,
  universityName,
  isOpen,
  onClose,
  onSubmit,
}: ReleaseDisbursementModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("NEFT_RTGS");
  const [utrNumber, setUtrNumber] = useState<string>("");
  const [disbursedDate, setDisbursedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [receiptDocUrl, setReceiptDocUrl] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await onSubmit({
      disbursementId: disbursement.id,
      paymentMethod,
      utrNumber: utrNumber.trim() || undefined,
      disbursedDate: disbursedDate || undefined,
      receiptDocUrl: receiptDocUrl.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto text-xs">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono font-bold text-[10px]">
              Tranche #{disbursement.trancheNumber}
            </span>
            <span className="font-mono text-slate-400 text-[10px]">{disbursement.disbursementReference}</span>
          </div>
          <h2 className="text-base font-black text-slate-900 mt-1">Record Grant Tranche Release</h2>
          <p className="text-slate-500 text-[11px] mt-0.5 truncate">
            {pilotTitle} • {universityName}
          </p>
        </div>

        {/* Tranche Summary Box */}
        <div className="mt-4 p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-800 block">Release Amount</span>
            <span className="text-lg font-mono font-black text-emerald-950">{disbursement.amountFormatted}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-emerald-700 block">Scheduled Target</span>
            <span className="font-mono text-xs font-bold text-emerald-900">{disbursement.scheduledDate || "Immediate"}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 font-medium">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Disbursement Date:</label>
            <input
              type="date"
              required
              value={disbursedDate}
              onChange={(e) => setDisbursedDate(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs outline-none focus:border-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Payment Method:</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs outline-none focus:border-slate-500 cursor-pointer"
              >
                <option value="NEFT_RTGS">NEFT / RTGS</option>
                <option value="PFMS">PFMS (Govt Portal)</option>
                <option value="DIRECT_BANK_TRANSFER">Direct Bank Transfer</option>
                <option value="CHEQUE">Account Payee Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Bank UTR / Txn ID:</label>
              <input
                type="text"
                placeholder="e.g. HDFCN26182049102"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs font-mono outline-none focus:border-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Voucher / Receipt Link (Optional):</label>
            <input
              type="text"
              placeholder="e.g. /api/uploads/receipts/voucher_002.pdf"
              value={receiptDocUrl}
              onChange={(e) => setReceiptDocUrl(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Compliance Notes (MCA / Audit):</label>
            <textarea
              rows={2}
              placeholder="e.g. Released upon Milestone 1 review approval and tripartite MoU signing."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs outline-none focus:border-slate-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
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
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all cursor-pointer shadow-2xs"
            >
              {isSubmitting ? "Recording Release..." : "Confirm Tranche Release"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
