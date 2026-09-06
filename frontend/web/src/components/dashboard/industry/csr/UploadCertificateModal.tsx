"use client";

import React, { useState } from "react";

interface UploadCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (formData: FormData) => Promise<boolean>;
  financialYear: string;
  isUploading: boolean;
}

export function UploadCertificateModal({
  isOpen,
  onClose,
  onUpload,
  financialYear,
  isUploading,
}: UploadCertificateModalProps) {
  const [formType, setFormType] = useState<string>("GFR_12A");
  const [certificateNumber, setCertificateNumber] = useState<string>(
    `UC/${financialYear}/GFR12A/042`
  );
  const [universityName, setUniversityName] = useState<string>("Birla Institute of Technology (BIT) Mesra");
  const [grantSanctionOrderRef, setGrantSanctionOrderRef] = useState<string>(
    `CSR-GRANT-SANCTION-${financialYear}/01`
  );
  const [certifiedDisbursedAmount, setCertifiedDisbursedAmount] = useState<number>(1500000);
  const [certifiedUtilizedAmount, setCertifiedUtilizedAmount] = useState<number>(1450000);
  const [unspentBalanceAmount, setUnspentBalanceAmount] = useState<number>(50000);
  const [caAuditorName, setCaAuditorName] = useState<string>("CA Rajesh Singhania");
  const [caFirmName, setCaFirmName] = useState<string>("Singhania & Associates LLP, Chartered Accountants");
  const [caMembershipNumber, setCaMembershipNumber] = useState<string>("FCA-084920");
  const [udinNumber, setUdinNumber] = useState<string>("26084920AAAAAB9812");
  const [issueDate, setIssueDate] = useState<string>("2026-04-15");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleDisbursedChange = (val: number) => {
    setCertifiedDisbursedAmount(val);
    setUnspentBalanceAmount(Math.max(0, val - certifiedUtilizedAmount));
  };

  const handleUtilizedChange = (val: number) => {
    setCertifiedUtilizedAmount(val);
    setUnspentBalanceAmount(Math.max(0, certifiedDisbursedAmount - val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("financialYear", financialYear);
    formData.append("formType", formType);
    formData.append("certificateNumber", certificateNumber);
    formData.append("universityName", universityName);
    formData.append("grantSanctionOrderRef", grantSanctionOrderRef);
    formData.append("certifiedDisbursedAmount", String(certifiedDisbursedAmount));
    formData.append("certifiedUtilizedAmount", String(certifiedUtilizedAmount));
    formData.append("unspentBalanceAmount", String(unspentBalanceAmount));
    formData.append("caAuditorName", caAuditorName);
    formData.append("caFirmName", caFirmName);
    formData.append("caMembershipNumber", caMembershipNumber);
    formData.append("udinNumber", udinNumber);
    formData.append("issueDate", issueDate);

    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    const ok = await onUpload(formData);
    if (ok) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-uc-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isUploading}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Close dialog"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 id="upload-uc-modal-title" className="text-base font-black text-slate-900 tracking-tight">
              Upload Utilization Certificate (Form GFR 12-A)
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Statutory CA Certified UC with UDIN verification for MCA Section 135 Compliance
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Form Type:</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 outline-none focus:border-slate-400 font-medium"
              >
                <option value="GFR_12A">Form GFR 12-A (Rule 238(1) Govt/HEI Standard)</option>
                <option value="CA_CERTIFIED">Independent CA Audit Certificate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Certificate Number / Ref:</label>
              <input
                type="text"
                value={certificateNumber}
                onChange={(e) => setCertificateNumber(e.target.value)}
                required
                className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 font-mono font-bold outline-none focus:border-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Academic Partner / University:</label>
              <input
                type="text"
                value={universityName}
                onChange={(e) => setUniversityName(e.target.value)}
                required
                className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sanction Order Reference:</label>
              <input
                type="text"
                value={grantSanctionOrderRef}
                onChange={(e) => setGrantSanctionOrderRef(e.target.value)}
                required
                className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 font-mono outline-none focus:border-slate-400"
              />
            </div>
          </div>

          {/* Financial Amounts Grid */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Audited Financial Quantums (INR)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Disbursed Grant:</label>
                <input
                  type="number"
                  min="0"
                  value={certifiedDisbursedAmount}
                  onChange={(e) => handleDisbursedChange(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full p-2 text-xs font-mono font-bold rounded-lg border border-slate-200 bg-white text-slate-900 outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Certified Utilized:</label>
                <input
                  type="number"
                  min="0"
                  max={certifiedDisbursedAmount}
                  value={certifiedUtilizedAmount}
                  onChange={(e) => handleUtilizedChange(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full p-2 text-xs font-mono font-bold rounded-lg border border-emerald-300 bg-emerald-50/50 text-emerald-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Unspent Balance:</label>
                <input
                  type="number"
                  min="0"
                  value={unspentBalanceAmount}
                  onChange={(e) => setUnspentBalanceAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 text-xs font-mono font-bold rounded-lg border border-slate-200 bg-white text-slate-700 outline-none focus:border-slate-400"
                />
              </div>
            </div>
          </div>

          {/* CA Details & UDIN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Chartered Accountant / Signatory:</label>
              <input
                type="text"
                value={caAuditorName}
                onChange={(e) => setCaAuditorName(e.target.value)}
                required
                className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">CA Audit Firm Name:</label>
              <input
                type="text"
                value={caFirmName}
                onChange={(e) => setCaFirmName(e.target.value)}
                required
                className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 outline-none focus:border-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ICAI Membership No.:</label>
              <input
                type="text"
                value={caMembershipNumber}
                onChange={(e) => setCaMembershipNumber(e.target.value)}
                required
                className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white font-mono text-slate-800 outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ICAI UDIN Number:</label>
              <input
                type="text"
                value={udinNumber}
                onChange={(e) => setUdinNumber(e.target.value)}
                required
                className="w-full p-2 text-xs rounded-lg border border-emerald-300 font-mono font-bold text-emerald-900 bg-emerald-50/30 outline-none focus:border-emerald-500 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Certification Issue Date:</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
                className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 outline-none focus:border-slate-400"
              />
            </div>
          </div>

          {/* Scanned Document Dropzone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Attach Scanned UC (PDF / Signed GFR 12-A):
            </label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 file:cursor-pointer cursor-pointer border border-slate-200 rounded-lg p-1.5"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isUploading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>Upload &amp; Register UC →</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
