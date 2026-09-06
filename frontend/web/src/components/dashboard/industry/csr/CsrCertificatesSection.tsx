"use client";

import React, { useState } from "react";
import { CsrUtilizationCertificate } from "@/modules/industry/types/csrCompliance";

interface CsrCertificatesSectionProps {
  certificates: CsrUtilizationCertificate[];
  isLoading: boolean;
  onOpenUploadModal: () => void;
  onOpenVerifyModal: (cert: CsrUtilizationCertificate) => void;
}

export function CsrCertificatesSection({
  certificates,
  isLoading,
  onOpenUploadModal,
  onOpenVerifyModal,
}: CsrCertificatesSectionProps) {
  const [filterVerified, setFilterVerified] = useState<"ALL" | "VERIFIED" | "UNVERIFIED">("ALL");

  const filteredCerts = certificates.filter((c) => {
    if (filterVerified === "VERIFIED") return c.isVerified;
    if (filterVerified === "UNVERIFIED") return !c.isVerified;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* 1. Header with Upload Action */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black text-slate-900 tracking-tight">
            Form GFR 12-A &amp; Statutory Utilization Certificates (UC)
          </h3>
          <p className="text-xs text-slate-500">
            Mandatory under General Financial Rules (GFR 2017) Rule 238(1) &amp; Section 135 MCA Audit Norms
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Status Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setFilterVerified("ALL")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                filterVerified === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({certificates.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterVerified("VERIFIED")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                filterVerified === "VERIFIED" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Verified
            </button>
            <button
              type="button"
              onClick={() => setFilterVerified("UNVERIFIED")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                filterVerified === "UNVERIFIED" ? "bg-amber-500 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Pending Audit
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenUploadModal}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-all shadow-sm cursor-pointer flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>Upload New UC</span>
          </button>
        </div>
      </div>

      {/* 2. Certificate Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-56 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredCerts.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center font-bold text-lg">
            UC
          </div>
          <h4 className="text-sm font-bold text-slate-800">No Utilization Certificates Found</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Upload Form GFR 12-A received from the university project lead with CA certification &amp; UDIN to verify fund utilization.
          </p>
          <button
            type="button"
            onClick={onOpenUploadModal}
            className="mt-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Upload First UC →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCerts.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-md transition-all p-5 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Top Row: Type & Verification Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                      {cert.formType || "GFR_12A"}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-800 truncate">
                      {cert.certificateNumber}
                    </span>
                  </div>

                  {cert.isVerified ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Audited &amp; Verified</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                      Pending Verification
                    </span>
                  )}
                </div>

                {/* University & Project Title */}
                <div>
                  <h4 className="text-xs font-black text-slate-900 line-clamp-1">
                    {cert.pilotTitle || "University R&D Project"}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">{cert.universityName}</p>
                </div>

                {/* Financial Breakdown Card */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Disbursed</span>
                    <strong className="text-slate-800 font-mono text-[11px]">
                      {cert.certifiedDisbursedFormatted || `₹${cert.certifiedDisbursedAmount}`}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-600 block uppercase font-bold">Utilized</span>
                    <strong className="text-emerald-800 font-mono font-black text-[11px]">
                      {cert.certifiedUtilizedFormatted || `₹${cert.certifiedUtilizedAmount}`}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-600 block uppercase font-bold">Unspent</span>
                    <strong className="text-amber-800 font-mono text-[11px]">
                      {cert.unspentBalanceFormatted || `₹${cert.unspentBalanceAmount}`}
                    </strong>
                  </div>
                </div>

                {/* Auditor & UDIN Particulars */}
                <div className="space-y-1 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                  {cert.caAuditorName && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Auditor / CA:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[220px]">
                        {cert.caAuditorName} {cert.caFirmName ? `(${cert.caFirmName})` : ""}
                      </span>
                    </div>
                  )}
                  {cert.udinNumber && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">ICAI UDIN:</span>
                      <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 text-[10px]">
                        {cert.udinNumber}
                      </span>
                    </div>
                  )}
                  {cert.issueDate && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Issue Date:</span>
                      <span className="font-medium text-slate-700">{cert.issueDate}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {cert.certificateDocUrl ? (
                  <a
                    href={cert.certificateDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 underline"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>View Scanned GFR 12-A</span>
                  </a>
                ) : (
                  <span className="text-[10px] text-slate-400 font-mono">Digital Signature Record</span>
                )}

                {!cert.isVerified && (
                  <button
                    type="button"
                    onClick={() => onOpenVerifyModal(cert)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <span>Verify with UDIN ✓</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
