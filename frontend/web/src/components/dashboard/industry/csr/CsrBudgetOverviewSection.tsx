"use client";

import React from "react";
import { CsrBudgetSummary } from "@/modules/industry/types/csrCompliance";

interface CsrBudgetOverviewSectionProps {
  summary: CsrBudgetSummary | null;
  isLoading: boolean;
  onOpenBudgetModal: () => void;
  onOpenUploadModal: () => void;
  onNavigateSubTab: (tab: "overview" | "ledger" | "certificates" | "reports" | "audit") => void;
}

export function CsrBudgetOverviewSection({
  summary,
  isLoading,
  onOpenBudgetModal,
  onOpenUploadModal,
  onNavigateSubTab,
}: CsrBudgetOverviewSectionProps) {
  if (isLoading && !summary) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const obligationPct = summary?.obligationUtilizationPercentage || 0;
  const earmarkedPct = summary?.earmarkedUtilizationPercentage || 0;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* 1. Top Executive Compliance Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
              MCA Section 135 Compliant
            </span>
            <span className="bg-white/10 text-slate-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">
              FY {summary?.financialYear || "2026-2027"}
            </span>
            {summary?.cinNumber && (
              <span className="text-slate-400 text-[10px] font-mono">CIN: {summary.cinNumber}</span>
            )}
          </div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight">
            {summary?.corporateName || "Corporate CSR Partner"} • Statutory CSR Ledger
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            Directly funding public-funded universities, premier institutions, and R&amp;D testbeds under{" "}
            <strong className="text-emerald-300 font-semibold">Schedule VII Item (ix)</strong> of the Indian Companies Act, 2013.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={onOpenBudgetModal}
            className="px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-black transition-all shadow-md cursor-pointer flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Update Budget</span>
          </button>
          <button
            type="button"
            onClick={onOpenUploadModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-md cursor-pointer flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Upload UC (GFR 12-A)</span>
          </button>
        </div>
      </div>

      {/* 2. Key Statutory Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Mandatory Obligation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Mandatory CSR Obligation
            </span>
            <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-black text-xs">
              2%
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {summary?.mandatoryCsrObligationFormatted || "₹2.50 Cr"}
          </div>
          <p className="text-[10px] text-slate-400">
            2% of average net profits for preceding 3 fiscal years (Sec 135(5))
          </p>
        </div>

        {/* Earmarked for HEIs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Earmarked for HEIs &amp; R&amp;D
            </span>
            <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
              ix
            </span>
          </div>
          <div className="text-2xl font-black text-indigo-950 tracking-tight">
            {summary?.earmarkedForHeisFormatted || "₹1.00 Cr"}
          </div>
          <p className="text-[10px] text-slate-400">
            Board-approved sub-allocation for Public Universities &amp; Incubators
          </p>
        </div>

        {/* Total Committed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Grants Committed
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
              {summary?.totalActivePilotsCount || 0} Pilots
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {summary?.totalCommittedFormatted || "₹0"}
          </div>
          <p className="text-[10px] text-slate-400">
            Sanctioned under Tripartite R&amp;D agreements
          </p>
        </div>

        {/* Total Disbursed */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/20 to-white shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Total Disbursed Funds
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-emerald-900 tracking-tight">
            {summary?.totalDisbursedFormatted || "₹0"}
          </div>
          <p className="text-[10px] text-emerald-700/80 font-medium">
            Transferred via NEFT/RTGS bank tranches to University Accounts
          </p>
        </div>

        {/* Verified Utilized (GFR 12-A) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Audited Utilization (UCs)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              {summary?.totalAuditedUcsCount || 0} UCs Audited
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-950 tracking-tight">
            {summary?.verifiedUtilizedFormatted || "₹0"}
          </div>
          <p className="text-[10px] text-slate-400">
            Backed by Form GFR 12-A &amp; Statutory CA UDIN certification
          </p>
        </div>

        {/* Unspent Balance */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/20 to-white shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
              Remaining Obligation Balance
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
              Surplus / To Spend
            </span>
          </div>
          <div className="text-2xl font-black text-amber-950 tracking-tight">
            {summary?.unspentBalanceFormatted || "₹0"}
          </div>
          <p className="text-[10px] text-amber-700/80 font-medium">
            To be disbursed or transferred to Section 135(6) unspent CSR bank account
          </p>
        </div>
      </div>

      {/* 3. Statutory Utilization Progress & Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress 1: Mandatory Obligation Utilization */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">Total Mandatory CSR Spend</h3>
              <p className="text-xs text-slate-500">Disbursed vs 2% Statutory Obligation</p>
            </div>
            <span className="text-base font-black font-mono text-emerald-700">
              {obligationPct.toFixed(1)}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                obligationPct >= 100 ? "bg-emerald-600" : obligationPct >= 60 ? "bg-indigo-600" : "bg-amber-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, obligationPct))}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-slate-600 font-medium pt-1 border-t border-slate-100">
            <span>Disbursed: <strong className="text-slate-900">{summary?.totalDisbursedFormatted || "₹0"}</strong></span>
            <span>Target: <strong className="text-slate-900">{summary?.mandatoryCsrObligationFormatted || "₹0"}</strong></span>
          </div>
        </div>

        {/* Progress 2: HEI Earmarked Allocation */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">University R&amp;D Earmarked Spend</h3>
              <p className="text-xs text-slate-500">Schedule VII Item (ix) Co-Funding Allocation</p>
            </div>
            <span className="text-base font-black font-mono text-indigo-700">
              {earmarkedPct.toFixed(1)}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                earmarkedPct >= 100 ? "bg-emerald-600" : "bg-indigo-600"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, earmarkedPct))}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-slate-600 font-medium pt-1 border-t border-slate-100">
            <span>Disbursed to HEIs: <strong className="text-slate-900">{summary?.totalDisbursedFormatted || "₹0"}</strong></span>
            <span>Earmarked Cap: <strong className="text-slate-900">{summary?.earmarkedForHeisFormatted || "₹0"}</strong></span>
          </div>
        </div>
      </div>

      {/* 4. Schedule VII Category Distribution */}
      {summary?.categoryBreakdown && summary.categoryBreakdown.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Schedule VII Statutory Classification Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                Categorization of ongoing University Co-Funded Projects under Companies Act 2013
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateSubTab("ledger")}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
            >
              View Full Ledger →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {summary.categoryBreakdown.map((cat, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                    {cat.categoryCode}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-700">
                    {cat.sharePercentage.toFixed(1)}% Share
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                  {cat.categoryName}
                </h4>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Disbursed</span>
                    <strong className="text-slate-900 font-mono font-bold">{cat.disbursedFormatted}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Projects</span>
                    <span className="text-slate-800 font-bold">{cat.projectsCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
