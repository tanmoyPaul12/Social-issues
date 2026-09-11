"use client";

import React, { useState } from "react";
import { useIndustryAnalytics } from "@/modules/industry/hooks/useIndustryAnalytics";

interface IndustryAnalyticsTabProps {
  onNavigateTab?: (tabId: string) => void;
}

const SECTOR_COLORS: Record<string, { bg: string; text: string; bar: string; stroke: string }> = {
  RENEWABLE_ENERGY: { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-500", stroke: "#f59e0b" },
  AGRICULTURE: { bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-500", stroke: "#10b981" },
  HEALTHCARE: { bg: "bg-rose-50", text: "text-rose-700", bar: "bg-rose-500", stroke: "#f43f5e" },
  WATER_SANITATION: { bg: "bg-blue-50", text: "text-blue-700", bar: "bg-blue-500", stroke: "#3b82f6" },
  EDUCATION: { bg: "bg-indigo-50", text: "text-indigo-700", bar: "bg-indigo-500", stroke: "#6366f1" },
  RURAL_INFRASTRUCTURE: { bg: "bg-violet-50", text: "text-violet-700", bar: "bg-violet-500", stroke: "#8b5cf6" },
};

export function IndustryAnalyticsTab({ onNavigateTab }: IndustryAnalyticsTabProps) {
  const {
    impactSummary,
    quarterlyTrends,
    domainBreakdown,
    selectedFiscalYear,
    setSelectedFiscalYear,
    isLoading,
    refresh,
    exportAuditReport,
  } = useIndustryAnalytics();

  const [hoveredQuarter, setHoveredQuarter] = useState<string | null>(null);
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Compute donut circumference
  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.76
  let cumulativeOffset = 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Hero Banner with Controls & Export */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-xl border border-indigo-900/40">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              Jharkhand Higher Education &amp; Industry R&amp;D Analytics
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              CSR Impact &amp; Deployment Analytics
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Comprehensive analytics on Section 135 MCA CSR capital utilization, ground-level beneficiary reach, patent generation, and district validation testbeds across Jharkhand.
            </p>
          </div>

          {/* Actions & Filters */}
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            {/* Fiscal Year Selector */}
            <select
              value={selectedFiscalYear}
              onChange={(e) => setSelectedFiscalYear(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 outline-none cursor-pointer transition-colors"
            >
              <option value="FY 2024-25" className="bg-slate-900 text-white">FY 2024-25 (Current)</option>
              <option value="FY 2023-24" className="bg-slate-900 text-white">FY 2023-24</option>
              <option value="FY 2022-23" className="bg-slate-900 text-white">FY 2022-23</option>
            </select>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Impact Report
                <svg className="w-3.5 h-3.5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white text-slate-800 shadow-2xl border border-slate-200 py-1.5 z-20 animate-in fade-in">
                  <button
                    onClick={() => {
                      exportAuditReport("PDF");
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2.5 transition-colors"
                  >
                    <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    State Cabinet CSR Brief (PDF)
                  </button>
                  <button
                    onClick={() => {
                      exportAuditReport("EXCEL");
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2.5 transition-colors"
                  >
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    MCA Form CSR-1 Audit Ledger (Excel)
                  </button>
                  <button
                    onClick={() => {
                      exportAuditReport("CSV");
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2.5 transition-colors"
                  >
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Raw Telemetry Dataset (CSV)
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => refresh()}
              title="Refresh Analytics"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors cursor-pointer"
            >
              <svg className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mt-8 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3.5 border border-white/10">
            <div className="text-[11px] text-slate-400 font-medium">Beneficiary Reach</div>
            <div className="text-xl font-bold text-amber-300 mt-1">
              {(impactSummary?.totalBeneficiaries || 0).toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-amber-300/80 mt-0.5">Across {impactSummary?.districtsCovered || 4} Districts</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3.5 border border-white/10">
            <div className="text-[11px] text-slate-400 font-medium">CSR Capital Deployed</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {impactSummary?.formattedCsrSpend || "₹2.61 Cr"}
            </div>
            <div className="text-[10px] text-emerald-300/80 mt-0.5">Of {impactSummary?.formattedGrantCommitted || "₹4.50 Cr"} Committed</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3.5 border border-white/10">
            <div className="text-[11px] text-slate-400 font-medium">Patents &amp; Tech Transfer</div>
            <div className="text-xl font-bold text-indigo-300 mt-1">
              {impactSummary?.patentsGenerated || 4} Patents
            </div>
            <div className="text-[10px] text-indigo-300/80 mt-0.5">Joint IP Protected</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3.5 border border-white/10">
            <div className="text-[11px] text-slate-400 font-medium">Rural Jobs Created</div>
            <div className="text-xl font-bold text-cyan-300 mt-1">
              {impactSummary?.jobsCreated || 148}+
            </div>
            <div className="text-[10px] text-cyan-300/80 mt-0.5">Tech &amp; Maintenance</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3.5 border border-white/10">
            <div className="text-[11px] text-slate-400 font-medium">Field Testbed Nodes</div>
            <div className="text-xl font-bold text-white mt-1 flex items-center gap-1.5">
              {impactSummary?.activeTestbedCount || 4}
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-slate-300 mt-0.5">Active Telemetry Sites</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3.5 border border-white/10">
            <div className="text-[11px] text-slate-400 font-medium">Corporate ROI Index</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {impactSummary?.avgRoiPercentage || 142.8}%
            </div>
            <div className="text-[10px] text-emerald-300/80 mt-0.5">R&amp;D Commercial Value</div>
          </div>
        </div>
      </div>

      {/* 2. Main Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Financial Trend Chart (Committed vs Disbursed) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Quarterly Capital Trajectory
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Committed CSR Capital vs. Verified Milestone Disbursements
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-3 h-3 rounded-sm bg-indigo-200" />
                  Committed
                </span>
                <span className="flex items-center gap-1.5 text-slate-900 font-semibold">
                  <span className="w-3 h-3 rounded-sm bg-indigo-600" />
                  Disbursed
                </span>
              </div>
            </div>

            {/* Custom Bar Chart Visual */}
            <div className="pt-6 space-y-4">
              {quarterlyTrends.map((trend) => {
                const committedVal = Number(trend.committedAmount) || 1;
                const disbursedVal = Number(trend.disbursedAmount) || 0;
                const maxVal = Math.max(...quarterlyTrends.map((t) => Number(t.committedAmount) || 1));
                const committedWidthPct = Math.min((committedVal / maxVal) * 100, 100);
                const disbursedWidthPct = Math.min((disbursedVal / maxVal) * 100, 100);
                const isHovered = hoveredQuarter === trend.quarter;

                return (
                  <div
                    key={trend.quarter}
                    onMouseEnter={() => setHoveredQuarter(trend.quarter)}
                    onMouseLeave={() => setHoveredQuarter(null)}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                      isHovered ? "bg-indigo-50/60 border border-indigo-200" : "bg-slate-50/50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-800 flex items-center gap-2">
                        {trend.quarter}
                        <span className="text-[10px] font-normal text-slate-400">({trend.year})</span>
                      </span>
                      <div className="flex items-center gap-3 font-mono text-xs">
                        <span className="text-slate-500">Committed: {trend.formattedCommittedAmount}</span>
                        <span className="font-bold text-indigo-700">Disbursed: {trend.formattedDisbursedAmount}</span>
                      </div>
                    </div>

                    {/* Dual Progress Bars */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-indigo-300 h-full rounded-full transition-all duration-500"
                          style={{ width: `${committedWidthPct}%` }}
                        />
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${disbursedWidthPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Subtext info */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
                      <span>{trend.activePilotsCount} Active Pilots • {trend.testbedDeployments} Testbeds</span>
                      <span className="text-amber-600 font-semibold">
                        {(trend.beneficiariesImpacted || 0).toLocaleString("en-IN")} Citizens Impacted
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Milestone audit: 100% verified by University Faculty PIs</span>
            <button
              onClick={() => onNavigateTab && onNavigateTab("funding")}
              className="text-indigo-600 font-semibold hover:underline cursor-pointer"
            >
              View CSR Ledger →
            </button>
          </div>
        </div>

        {/* Right: Domain Breakdown Donut Chart */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Domain-Wise CSR Capital
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Schedule VII Item (ix) Allocation Breakdown
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                100% MCA Compliant
              </span>
            </div>

            {/* Donut & List Visual */}
            <div className="pt-6 flex flex-col sm:flex-row items-center gap-6">
              {/* SVG Donut */}
              <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    className="text-slate-100"
                    strokeWidth="12"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  {domainBreakdown.map((item) => {
                    const strokeDash = ((item.percentage || 25) / 100) * circumference;
                    const strokeDashoffset = -cumulativeOffset;
                    cumulativeOffset += strokeDash;
                    const color = SECTOR_COLORS[item.sector] || SECTOR_COLORS.RENEWABLE_ENERGY;

                    return (
                      <circle
                        key={item.sector}
                        cx="50"
                        cy="50"
                        r={radius}
                        strokeWidth="12"
                        strokeDasharray={`${strokeDash} ${circumference}`}
                        strokeDashoffset={strokeDashoffset}
                        stroke={color.stroke}
                        fill="transparent"
                        className="transition-all duration-300 cursor-pointer"
                        onMouseEnter={() => setHoveredSector(item.sector)}
                        onMouseLeave={() => setHoveredSector(null)}
                      />
                    );
                  })}
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-base font-extrabold text-slate-900">
                    {impactSummary?.formattedGrantCommitted || "₹4.5 Cr"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Committed</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="flex-1 space-y-2.5 w-full">
                {domainBreakdown.map((sector) => {
                  const color = SECTOR_COLORS[sector.sector] || SECTOR_COLORS.RENEWABLE_ENERGY;
                  const isHovered = hoveredSector === sector.sector;

                  return (
                    <div
                      key={sector.sector}
                      onMouseEnter={() => setHoveredSector(sector.sector)}
                      onMouseLeave={() => setHoveredSector(null)}
                      className={`p-2 rounded-lg transition-all ${
                        isHovered ? "bg-slate-100/80" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-medium text-slate-800">
                          <span className={`w-2.5 h-2.5 rounded-full ${color.bar}`} />
                          <span className="truncate max-w-[130px]">{sector.sectorName || sector.sector}</span>
                        </span>
                        <span className="font-bold text-slate-900 font-mono">{sector.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className={`h-full ${color.bar} rounded-full`}
                          style={{ width: `${sector.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            Audited annually under Companies (CSR Policy) Rules, 2014
          </div>
        </div>
      </div>

      {/* 3. District Beneficiary Footprint & Technology Validation Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Jharkhand District Reach &amp; Observability Footprint
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Field testbed telemetry nodes and active community beneficiaries by district
            </p>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab("testbeds")}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            Manage Field Testbeds →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Ranchi District</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                2 Live Sites
              </span>
            </div>
            <div className="text-lg font-bold text-slate-900">3,450 Citizens</div>
            <div className="text-[11px] text-slate-500">Solar Microgrid &amp; Cold Chain IoT</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Dhanbad District</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                1 Live Site
              </span>
            </div>
            <div className="text-lg font-bold text-slate-900">2,100 Citizens</div>
            <div className="text-[11px] text-slate-500">Mine Water Filtration &amp; Treatment</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">East Singhbhum</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                1 Site Validated
              </span>
            </div>
            <div className="text-lg font-bold text-slate-900">1,820 Citizens</div>
            <div className="text-[11px] text-slate-500">Tribal Healthcare Tele-Diagnostic</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Hazaribagh District</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                Planned
              </span>
            </div>
            <div className="text-lg font-bold text-slate-900">800 Citizens</div>
            <div className="text-[11px] text-slate-500">Smart Agriculture Moisture Array</div>
          </div>
        </div>
      </div>
    </div>
  );
}
