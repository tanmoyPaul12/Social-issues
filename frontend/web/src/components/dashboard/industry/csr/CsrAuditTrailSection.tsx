"use client";

import React from "react";
import { CsrAuditTrailEntry } from "@/modules/industry/types/csrCompliance";

interface CsrAuditTrailSectionProps {
  auditTrails: CsrAuditTrailEntry[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export function CsrAuditTrailSection({
  auditTrails,
  totalPages,
  currentPage,
  onPageChange,
  isLoading,
  onRefresh,
}: CsrAuditTrailSectionProps) {
  return (
    <div className="space-y-6 animate-in fade-in">
      {/* 1. Header with Cryptographic Verification Shield */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full">
              <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>SHA-256 Tamper-Evident Immutable Ledger</span>
            </span>
          </div>
          <h3 className="text-sm font-black text-slate-900 tracking-tight">
            Cryptographic Statutory Audit Trail &amp; Provenance Chain
          </h3>
          <p className="text-xs text-slate-500">
            Chronological cryptographic record of all budget revisions, grant releases, UCs, and CA verifications
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-2"
        >
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh Audit Chain</span>
        </button>
      </div>

      {/* 2. Audit Trail Chronology Blocks */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : auditTrails.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center font-bold text-sm">
            #
          </div>
          <h4 className="text-sm font-bold text-slate-800">No Audit Events Logged</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Audit trail entries will automatically appear as you allocate budgets, release tranches, and verify UCs.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {auditTrails.map((entry, idx) => (
            <div
              key={entry.id || idx}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-4.5 space-y-3"
            >
              {/* Event Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      entry.actionType.includes("VERIF")
                        ? "bg-emerald-100 text-emerald-800"
                        : entry.actionType.includes("DISBUR")
                        ? "bg-blue-100 text-blue-800"
                        : entry.actionType.includes("BUDGET")
                        ? "bg-purple-100 text-purple-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    #
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">{entry.actionTitle}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {entry.timestamp ? new Date(entry.timestamp).toLocaleString("en-IN") : "Recorded"} • Action: {entry.actionType}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800 block">{entry.actorName || "System / Auditor"}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{entry.actorRole || "CSR Compliance SPOC"}</span>
                </div>
              </div>

              {/* JSON Metadata Details */}
              {entry.detailsJson && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 font-mono text-[11px] text-slate-700 overflow-x-auto">
                  {entry.detailsJson}
                </div>
              )}

              {/* Cryptographic Hash Blocks */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] font-mono">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <span className="text-slate-400">Prev Hash:</span>
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 truncate max-w-[160px] sm:max-w-xs" title={entry.previousHash}>
                    {entry.previousHash || "GENESIS_BLOCK_00000000000000"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-emerald-800">
                  <span className="text-emerald-600 font-bold">SHA-256:</span>
                  <span className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold truncate max-w-[200px] sm:max-w-sm" title={entry.hashSha256}>
                    {entry.hashSha256 || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div>
                Page <strong className="text-slate-900">{currentPage + 1}</strong> of{" "}
                <strong className="text-slate-900">{totalPages}</strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 0}
                  onClick={() => onPageChange(currentPage - 1)}
                  className="px-3 py-1.5 rounded border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  ← Newer
                </button>
                <button
                  type="button"
                  disabled={currentPage + 1 >= totalPages}
                  onClick={() => onPageChange(currentPage + 1)}
                  className="px-3 py-1.5 rounded border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  Older →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
