"use client";

import React, { useState } from "react";
import { CsrUtilizationCertificate, VerifyCertificatePayload } from "@/modules/industry/types/csrCompliance";

interface VerifyCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: CsrUtilizationCertificate | null;
  onVerify: (id: number, payload: VerifyCertificatePayload) => Promise<boolean>;
  isVerifying: boolean;
}

export function VerifyCertificateModal({
  isOpen,
  onClose,
  certificate,
  onVerify,
  isVerifying,
}: VerifyCertificateModalProps) {
  const [udin, setUdin] = useState<string>(certificate?.udinNumber || "26084920AAAAAB1024");
  const [remarks, setRemarks] = useState<string>(
    "Audited and verified against university bank ledger and expenditure vouchers as per MCA Section 135 norms."
  );

  if (!isOpen || !certificate) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onVerify(certificate.id, {
      udinNumber: udin,
      verificationRemarks: remarks,
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
      aria-labelledby="verify-uc-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isVerifying}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Close dialog"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 id="verify-uc-modal-title" className="text-base font-black text-slate-900 tracking-tight">
              Statutory Verification of UC
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Cert Ref: <span className="font-mono font-bold text-slate-800">{certificate.certificateNumber}</span>
            </p>
          </div>
        </div>

        {/* Certificate Overview Summary */}
        <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">University / HEI:</span>
            <strong className="text-slate-900 font-semibold">{certificate.universityName}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Certified Utilized:</span>
            <strong className="text-emerald-700 font-bold font-mono text-sm">
              {certificate.certifiedUtilizedFormatted || `₹${certificate.certifiedUtilizedAmount}`}
            </strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">CA Auditor:</span>
            <span className="text-slate-800 font-medium">{certificate.caAuditorName || "Chartered Accountant"}</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Verified ICAI UDIN Number:
            </label>
            <input
              type="text"
              value={udin}
              onChange={(e) => setUdin(e.target.value)}
              required
              className="w-full p-2 text-xs rounded-lg border border-emerald-300 font-mono font-bold text-emerald-900 bg-emerald-50/20 outline-none focus:border-emerald-500 uppercase"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Ensure the 18-digit UDIN is verified on ICAI portal (udin.icai.org)
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Statutory Audit Verification Remarks:
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              required
              className="w-full p-2.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 outline-none focus:border-slate-400 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isVerifying}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isVerifying && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>Mark Verified &amp; Audit Passed ✓</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
