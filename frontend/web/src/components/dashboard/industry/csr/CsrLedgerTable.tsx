"use client";

import React, { useState } from "react";
import { CsrLedgerEntry, CsrLedgerFilterState } from "@/modules/industry/types/csrCompliance";

interface CsrLedgerTableProps {
  entries: CsrLedgerEntry[];
  totalElements: number;
  totalPages: number;
  filters: CsrLedgerFilterState;
  onFilterChange: (filters: Partial<CsrLedgerFilterState>) => void;
  isLoading: boolean;
  onNavigateToUcs: () => void;
}

export function CsrLedgerTable({
  entries,
  totalElements,
  totalPages,
  filters,
  onFilterChange,
  isLoading,
  onNavigateToUcs,
}: CsrLedgerTableProps) {
  const [searchInput, setSearchInput] = useState(filters.search || "");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ search: searchInput, page: 0 });
  };

  const handleClearFilters = () => {
    setSearchInput("");
    onFilterChange({ search: "", category: "", page: 0 });
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* 1. Header & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              Audit-Ready CSR Disbursements Ledger
            </h3>
            <p className="text-xs text-slate-500">
              Total Recorded Transactions: <strong className="text-slate-900">{totalElements}</strong>
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <select
              value={filters.category || ""}
              onChange={(e) => onFilterChange({ category: e.target.value, page: 0 })}
              className="py-1.5 px-3 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 outline-none cursor-pointer"
            >
              <option value="">All Schedule VII Categories</option>
              <option value="Item (ix)">Item (ix) - Public Universities &amp; Labs</option>
              <option value="Item (ii)">Item (ii) - Promoting Education &amp; Skilling</option>
              <option value="Item (iv)">Item (iv) - Environmental Sustainability</option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by Project, University, UTR number, or CSR project code..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/60 text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-slate-400"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors cursor-pointer"
          >
            Search
          </button>
          {(filters.search || filters.category) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* 2. Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold tracking-wider uppercase text-[10px]">
                <th className="py-3 px-4">Date &amp; Ref / UTR</th>
                <th className="py-3 px-4">Funded Project &amp; University</th>
                <th className="py-3 px-4">Schedule VII Clause</th>
                <th className="py-3 px-4 text-right">Disbursed Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Form GFR 12-A UC</th>
                <th className="py-3 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                      <span>Loading Statutory Ledger Entries...</span>
                    </div>
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No disbursement transactions found for this financial year or search criteria.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Date & UTR */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{entry.transactionDate || "N/A"}</div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {entry.utrNumber ? `UTR: ${entry.utrNumber}` : entry.disbursementReference || "Bank Transfer"}
                      </div>
                    </td>

                    {/* Project & University */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 truncate" title={entry.pilotTitle}>
                        {entry.pilotTitle}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <span>{entry.universityName}</span>
                        {entry.targetDistrict && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400">{entry.targetDistrict}</span>
                          </>
                        )}
                      </div>
                      {entry.trancheLabel && (
                        <span className="inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                          {entry.trancheLabel}
                        </span>
                      )}
                    </td>

                    {/* Schedule VII Clause */}
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="text-slate-800 font-medium truncate" title={entry.scheduleVIICategory}>
                        {entry.scheduleVIICategory || "Schedule VII Item (ix)"}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {entry.csrProjectCode || "CSR-PILOT"}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="font-black font-mono text-emerald-800 text-sm">
                        {entry.amountFormatted}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {entry.paymentMethod || "NEFT_RTGS"}
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          entry.status === "DISBURSED" || entry.status === "UTILIZED"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : entry.status === "APPROVED"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>

                    {/* UC Link */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {entry.hasUtilizationCertificate ? (
                        <button
                          type="button"
                          onClick={onNavigateToUcs}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 transition-colors cursor-pointer"
                        >
                          <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{entry.ucNumber || "Audited UC"}</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Pending UC
                        </span>
                      )}
                    </td>

                    {/* Receipt Doc */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {entry.receiptDocUrl ? (
                        <a
                          href={entry.receiptDocUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 font-bold text-[11px] underline"
                        >
                          View Voucher
                        </a>
                      ) : (
                        <span className="text-slate-300 text-[10px]">Bank UTR</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 3. Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing Page <strong className="text-slate-900">{filters.page + 1}</strong> of{" "}
              <strong className="text-slate-900">{totalPages}</strong>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={filters.page === 0}
                onClick={() => onFilterChange({ page: filters.page - 1 })}
                className="px-3 py-1.5 rounded border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                ← Previous
              </button>
              <button
                type="button"
                disabled={filters.page + 1 >= totalPages}
                onClick={() => onFilterChange({ page: filters.page + 1 })}
                className="px-3 py-1.5 rounded border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
