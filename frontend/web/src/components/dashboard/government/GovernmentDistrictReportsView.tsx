"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Download,
  Filter,
  RefreshCw,
  Layers,
  Award,
  ShieldCheck,
  FileText,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BarChart3,
  Search,
  Sparkles,
  ChevronRight,
  Star,
  Users,
} from "@/components/dashboard/icons";
import { toast } from "@/components/dashboard/ToastStack";
import { useAuthStore } from "@/lib/store/useAuthStore";
import {
  districtReportApi,
  DistrictReportSummaryResponse,
  ReportPeriodOptionsDto,
  ReportPeriodType,
  ReportType,
  DistrictReportFilterRequest,
  DistrictReportRowDto,
} from "@/lib/api/districtReportApi";
import {
  getCurrentFinancialYear,
  generateAvailableFinancialYears,
  generateAvailableCalendarYears,
  getCurrentQuarter,
  getCurrentHalfYear,
} from "@/lib/utils/financialYear";

interface GovernmentDistrictReportsViewProps {
  userDistrict?: string;
}

export function GovernmentDistrictReportsView({ userDistrict }: GovernmentDistrictReportsViewProps = {}) {
  const { token, user } = useAuthStore();

  const rawDistrict = userDistrict || user?.district?.trim() || "";
  const isDistrictScoped = Boolean(
    rawDistrict &&
    rawDistrict.toLowerCase() !== "statewide" &&
    rawDistrict.toLowerCase() !== "all" &&
    rawDistrict.toLowerCase() !== "all 24 districts" &&
    rawDistrict.toLowerCase() !== "jharkhand"
  );

  // Period Options from Backend
  const [periodOptions, setPeriodOptions] = useState<ReportPeriodOptionsDto | null>(null);

  // Filters State with automatic current temporal defaults
  const [periodType, setPeriodType] = useState<ReportPeriodType>("FINANCIAL_YEAR");
  const [financialYear, setFinancialYear] = useState<string>(() => getCurrentFinancialYear());
  const [quarter, setQuarter] = useState<string>(() => getCurrentQuarter());
  const [halfYear, setHalfYear] = useState<string>(() => getCurrentHalfYear());
  const [year, setYear] = useState<number>(() => new Date().getFullYear());
  const [month, setMonth] = useState<number>(() => new Date().getMonth() + 1);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>(
    isDistrictScoped ? rawDistrict : "All 24 Districts"
  );
  const [selectedSector, setSelectedSector] = useState<string>("ALL");
  const [reportType, setReportType] = useState<ReportType>("DISTRICT_SUMMARY");

  // Dynamically computed financial & calendar years to ensure UI is never empty and ages seamlessly
  const availableFinancialYears = useMemo(() => {
    if (periodOptions?.availableFinancialYears && periodOptions.availableFinancialYears.length > 0) {
      return periodOptions.availableFinancialYears;
    }
    return generateAvailableFinancialYears();
  }, [periodOptions]);

  const availableCalendarYears = useMemo(() => {
    return generateAvailableCalendarYears();
  }, []);

  useEffect(() => {
    if (isDistrictScoped) {
      setSelectedDistrict(rawDistrict);
    }
  }, [isDistrictScoped, rawDistrict]);

  // Search in table
  const [tableSearch, setTableSearch] = useState<string>("");

  // Data & Loading States
  const [reportData, setReportData] = useState<DistrictReportSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExportingCsv, setIsExportingCsv] = useState<boolean>(false);

  // 1. Fetch Dynamic Period Options on mount
  useEffect(() => {
    async function loadOptions() {
      try {
        const opts = await districtReportApi.getPeriodOptions(token);
        setPeriodOptions(opts);
        if (opts.currentFinancialYear) {
          setFinancialYear(opts.currentFinancialYear);
        }
        if (opts.currentQuarter) {
          setQuarter(opts.currentQuarter);
        }
      } catch (err: any) {
        console.warn("Could not fetch period options:", err);
      }
    }
    loadOptions();
  }, [token]);

  // 2. Fetch Live Report Summary Preview
  const loadReportPreview = useCallback(async () => {
    setIsLoading(true);
    try {
      const filter: DistrictReportFilterRequest = {
        periodType,
        financialYear,
        quarter: periodType === "QUARTERLY" ? quarter : undefined,
        halfYear: periodType === "HALF_YEARLY" ? halfYear : undefined,
        year: periodType === "MONTHLY" ? year : undefined,
        month: periodType === "MONTHLY" ? month : undefined,
        startDate: periodType === "CUSTOM" && startDate ? startDate : undefined,
        endDate: periodType === "CUSTOM" && endDate ? endDate : undefined,
        district: selectedDistrict !== "All 24 Districts" ? selectedDistrict : undefined,
        sector: selectedSector !== "ALL" ? selectedSector : undefined,
        reportType,
      };

      const data = await districtReportApi.getReportPreview(filter, token);
      setReportData(data);
    } catch (err: any) {
      console.warn("Failed to load district report preview:", err);
      setReportData(null);
    } finally {
      setIsLoading(false);
    }
  }, [
    periodType,
    financialYear,
    quarter,
    halfYear,
    year,
    month,
    startDate,
    endDate,
    selectedDistrict,
    selectedSector,
    reportType,
    token,
  ]);

  useEffect(() => {
    loadReportPreview();
  }, [loadReportPreview]);

  // 3. Handle CSV Export
  const handleExportCsv = async () => {
    setIsExportingCsv(true);
    try {
      let downloadBlob: Blob;
      let downloadFilename: string;

      const filter: DistrictReportFilterRequest = {
        periodType,
        financialYear,
        quarter: periodType === "QUARTERLY" ? quarter : undefined,
        halfYear: periodType === "HALF_YEARLY" ? halfYear : undefined,
        year: periodType === "MONTHLY" ? year : undefined,
        month: periodType === "MONTHLY" ? month : undefined,
        startDate: periodType === "CUSTOM" && startDate ? startDate : undefined,
        endDate: periodType === "CUSTOM" && endDate ? endDate : undefined,
        district: selectedDistrict !== "All 24 Districts" ? selectedDistrict : undefined,
        sector: selectedSector !== "ALL" ? selectedSector : undefined,
        reportType,
      };

      try {
        const res = await districtReportApi.downloadCsv(filter, token);
        downloadBlob = res.blob;
        downloadFilename = res.filename;
      } catch (backendErr) {
        console.warn("Backend CSV API unavailable, generating client fallback CSV:", backendErr);
        
        // Dynamic client-side CSV generation with UTF-8 BOM
        const cleanLabel = (reportData?.periodLabel || `FY_${financialYear}`).replace(/[^a-zA-Z0-9_-]/g, "_");
        const distSlug = selectedDistrict !== "All 24 Districts" ? selectedDistrict.replace(/\s+/g, "_") : "All_Districts";
        downloadFilename = `JH_Report_${reportType}_${distSlug}_${cleanLabel}.csv`;

        const csvLines: string[] = [];
        csvLines.push("JHARKHAND STATE GOVERNMENT - STATUTORY DISTRICT INNOVATION & GRIEVANCE REPORT");
        csvLines.push(`Reporting Period: "${reportData?.periodLabel || `FY ${financialYear}`}"`);
        csvLines.push(`District Jurisdiction: ${selectedDistrict}`);
        csvLines.push(`Generated On: ${new Date().toISOString().split("T")[0]}`);
        csvLines.push("");
        csvLines.push("District,Total Challenges,Triaged & Verified,Assigned to HEI,Resolved & Closed,Resolution Rate (%),Active R&D Projects,Completed Projects,Average TRL,Highest TRL,Patents Filed,Patents Granted,CSR Funds Allocated (INR),Top Domain Need,Participating Universities");

        const breakdown = reportData?.districtBreakdown || (selectedDistrict !== "All 24 Districts" ? [{
          district: selectedDistrict,
          challengesSubmitted: 0,
          challengesTriaged: 0,
          challengesAssignedHEI: 0,
          challengesResolved: 0,
          resolutionRate: 0,
          activeProjects: 0,
          completedProjects: 0,
          avgTrlLevel: 1.0,
          highestTrl: 1,
          patentsFiled: 0,
          patentsGranted: 0,
          csrFundsAllocatedInr: 0,
          participatingUniversities: [],
          topDomainNeed: selectedSector !== "ALL" ? selectedSector : "Agriculture",
        }] : allDistrictsList.map((d) => ({
          district: d,
          challengesSubmitted: 0,
          challengesTriaged: 0,
          challengesAssignedHEI: 0,
          challengesResolved: 0,
          resolutionRate: 0,
          activeProjects: 0,
          completedProjects: 0,
          avgTrlLevel: 1.0,
          highestTrl: 1,
          patentsFiled: 0,
          patentsGranted: 0,
          csrFundsAllocatedInr: 0,
          participatingUniversities: [],
          topDomainNeed: "Agriculture",
        })));

        for (const r of breakdown) {
          const row = [
            `"${r.district.replace(/"/g, '""')}"`,
            r.challengesSubmitted,
            r.challengesTriaged,
            r.challengesAssignedHEI,
            r.challengesResolved,
            `"${(r.resolutionRate || 0).toFixed(2)}%"`,
            r.activeProjects,
            r.completedProjects,
            `"TRL ${(r.avgTrlLevel || 1).toFixed(1)}"`,
            `"TRL ${r.highestTrl || 1}"`,
            r.patentsFiled,
            r.patentsGranted,
            `"${r.csrFundsAllocatedInr || 0}"`,
            `"${(r.topDomainNeed || 'Agriculture').replace(/"/g, '""')}"`,
            `"${(r.participatingUniversities && r.participatingUniversities.length > 0 ? r.participatingUniversities.join("; ") : '-').replace(/"/g, '""')}"`
          ];
          csvLines.push(row.join(","));
        }

        csvLines.push("");
        const totals = [
          "STATEWIDE TOTALS",
          reportData?.totalGrievancesSubmitted || 0,
          reportData?.totalGrievancesTriaged || 0,
          reportData?.totalGrievancesAssignedHEI || 0,
          reportData?.totalGrievancesResolved || 0,
          `"${(reportData?.statewideResolutionRate || 0).toFixed(2)}%"`,
          reportData?.totalActiveProjects || 0,
          reportData?.totalCompletedProjects || 0,
          `"TRL ${(reportData?.overallAvgTrl || 1).toFixed(1)}"`,
          `"TRL ${reportData?.statewideHighestTrl || 1}"`,
          reportData?.totalPatentsFiled || 0,
          reportData?.totalPatentsGranted || 0,
          `"${reportData?.totalCsrAllocatedInr || 0}"`,
          "-",
          `"${reportData?.totalParticipatingUniversitiesCount || 0} Universities"`
        ];
        csvLines.push(totals.join(","));

        // UTF-8 BOM for Microsoft Excel compatibility
        const csvString = "\uFEFF" + csvLines.join("\r\n");
        downloadBlob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      }

      // Trigger browser download
      const url = window.URL.createObjectURL(downloadBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Exported ${downloadFilename} successfully!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to download CSV report");
    } finally {
      setIsExportingCsv(false);
    }
  };

  // Filtered district rows based on table search input
  const filteredRows = useMemo(() => {
    if (!reportData?.districtBreakdown) return [];
    if (!tableSearch.trim()) return reportData.districtBreakdown;

    const q = tableSearch.toLowerCase();
    return reportData.districtBreakdown.filter(
      (r) =>
        r.district.toLowerCase().includes(q) ||
        (r.topDomainNeed && r.topDomainNeed.toLowerCase().includes(q)) ||
        r.participatingUniversities.some((u) => u.toLowerCase().includes(q))
    );
  }, [reportData, tableSearch]);

  const allDistrictsList = periodOptions?.districts || [
    "Ranchi", "Dhanbad", "East Singhbhum", "Bokaro", "Hazaribagh",
    "Deoghar", "Palamu", "Dumka", "Giridih", "Ramgarh",
    "West Singhbhum", "Latehar", "Sahibganj", "Khunti", "Gumla",
    "Simdega", "Garhwa", "Godda", "Chatra", "Koderma",
    "Jamtara", "Pakur", "Lohardaga", "Saraikela"
  ];

  const allDomainsList = periodOptions?.domains || [
    "Agriculture", "Water Resources", "Healthcare", "Clean Energy",
    "Education", "Rural Infra", "Sanitation", "Environment",
    "Public Admin", "Livelihoods"
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-[#4a4a4a]">
      {/* ── TOP HEADER & ACTIONS ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#d9d9d9] pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#F2efff] text-[#1a0e3d] text-xs font-black uppercase tracking-wider mb-1">
            <span>Statutory District Analytics &amp; CSV Ledger</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-[#1a0e3d] tracking-tight">
              {isDistrictScoped ? `${rawDistrict} District Statutory Reports & Export` : "District-Wise Innovation, TRL & Grievance Reports"}
            </h2>
            {isDistrictScoped && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1  text-xs font-black bg-[#ececec] text-[#002110] border border-[#a3e635] whitespace-nowrap shrink-0 leading-none">
                {rawDistrict} Nodal Jurisdiction
              </span>
            )}
          </div>
          <p className="text-xs text-[#4a4a4a] mt-0.5">
            {isDistrictScoped
              ? `Official temporal performance scorecards, university R&D progress, patent disclosures, and downloadable CSV datasets for ${rawDistrict} Collectorate.`
              : "Official temporal performance scorecards, university R&D progress, patent disclosures, and downloadable CSV datasets across Jharkhand."}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
          {/* Report Type Selector */}
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as ReportType)}
            className="px-3.5 py-2.5 bg-white border border-[#d9d9d9] rounded-xl text-xs font-bold text-[#1a0e3d] outline-none shadow-2xs cursor-pointer focus:border-[#1a0e3d] whitespace-nowrap shrink-0"
          >
            <option value="DISTRICT_SUMMARY">District Summary Ledger</option>
            <option value="PROJECT_LIFECYCLES">University R&amp;D Projects &amp; TRL</option>
            <option value="IP_AND_PATENTS">Intellectual Property &amp; Patents</option>
            <option value="CHALLENGE_INCIDENTS">Citizen Grievance Resolution Audit</option>
          </select>

          {/* Download CSV Button */}
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={isExportingCsv}
            className="px-4 py-2.5 rounded-xl bg-[#1a0e3d] hover:bg-[#2e1764] active:scale-[0.98] text-white font-bold text-xs inline-flex items-center gap-2 shadow-md cursor-pointer transition-all disabled:opacity-50 whitespace-nowrap shrink-0"
            title="Download CSV Report dataset"
          >
            {isExportingCsv ? (
              <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
            ) : (
              <Download className="w-4 h-4 text-white shrink-0" />
            )}
            <span>Export CSV Report</span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={loadReportPreview}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-white border border-[#d9d9d9] hover:border-[#1a0e3d] text-[#1a0e3d] transition-all cursor-pointer shadow-2xs shrink-0 flex items-center justify-center"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── TEMPORAL SCOPE & FILTER TOOLBAR ── */}
      <div className="bg-white p-5 rounded-3xl border border-[#d9d9d9] shadow-xs space-y-4">
        {/* Row 1: Period Type Toggle Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#f1f5f9] pb-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-bold text-[#64748b] uppercase mr-1">Period:</span>
            {[
              { id: "FINANCIAL_YEAR", label: "Financial Year (FY)" },
              { id: "QUARTERLY", label: "Quarterly (Q1-Q4)" },
              { id: "HALF_YEARLY", label: "Half-Yearly (H1-H2)" },
              { id: "MONTHLY", label: "Monthly" },
              { id: "CUSTOM", label: "Custom Dates" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriodType(p.id as ReportPeriodType)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  periodType === p.id
                    ? "bg-[#1a0e3d] text-white shadow-xs"
                    : "bg-[#f8fafc] text-[#64748b] hover:bg-[#F2efff] hover:text-[#1a0e3d] border border-[#e2e8f0]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-[#1a0e3d] bg-[#F2efff] border border-[#dcd3ff] px-3 py-1 rounded-lg">
              {reportData?.periodLabel || "Calculating Reporting Period..."}
            </span>
          </div>
        </div>

        {/* Row 2: Dynamic Period Sub-Selectors & Scope Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Financial Year Selector */}
          {periodType === "FINANCIAL_YEAR" && (
            <div className="space-y-1">
              <label className="font-bold text-[#1a0e3d] block text-[11px]">Select Financial Year</label>
              <select
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                className="w-full p-2 bg-[#f8fafc] border border-[#d9d9d9] rounded-xl font-bold text-[#1a0e3d] outline-none cursor-pointer focus:border-[#1a0e3d]"
              >
                {availableFinancialYears.map((fy) => (
                  <option key={fy} value={fy}>
                    FY {fy} (Apr - Mar)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quarterly Selectors */}
          {periodType === "QUARTERLY" && (
            <>
              <div className="space-y-1">
                <label className="font-bold text-[#1a0e3d] block text-[11px]">Financial Year</label>
                <select
                  value={financialYear}
                  onChange={(e) => setFinancialYear(e.target.value)}
                  className="w-full p-2 bg-[#f8fafc] border border-[#d9d9d9] rounded-xl font-bold text-[#1a0e3d] outline-none cursor-pointer focus:border-[#1a0e3d]"
                >
                  {availableFinancialYears.map((fy) => (
                    <option key={fy} value={fy}>
                      FY {fy}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1a0e3d] block text-[11px]">Quarter</label>
                <select
                  value={quarter}
                  onChange={(e) => setQuarter(e.target.value)}
                  className="w-full p-2 bg-[#f8fafc] border border-[#d9d9d9] rounded-xl font-bold text-[#1a0e3d] outline-none cursor-pointer focus:border-[#1a0e3d]"
                >
                  <option value="Q1">Q1 (Apr 1 - Jun 30)</option>
                  <option value="Q2">Q2 (Jul 1 - Sep 30)</option>
                  <option value="Q3">Q3 (Oct 1 - Dec 31)</option>
                  <option value="Q4">Q4 (Jan 1 - Mar 31)</option>
                </select>
              </div>
            </>
          )}

          {/* Half-Yearly Selectors */}
          {periodType === "HALF_YEARLY" && (
            <>
              <div className="space-y-1">
                <label className="font-bold text-[#1a0e3d] block text-[11px]">Financial Year</label>
                <select
                  value={financialYear}
                  onChange={(e) => setFinancialYear(e.target.value)}
                  className="w-full p-2 bg-[#f8fafc] border border-[#d9d9d9] rounded-xl font-bold text-[#1a0e3d] outline-none cursor-pointer focus:border-[#1a0e3d]"
                >
                  {availableFinancialYears.map((fy) => (
                    <option key={fy} value={fy}>
                      FY {fy}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1a0e3d] block text-[11px]">Half-Year Interval</label>
                <select
                  value={halfYear}
                  onChange={(e) => setHalfYear(e.target.value)}
                  className="w-full p-2 bg-[#f8fafc] border border-[#d9d9d9] rounded-xl font-bold text-[#1a0e3d] outline-none cursor-pointer focus:border-[#1a0e3d]"
                >
                  <option value="H1">H1 (Apr 1 - Sep 30)</option>
                  <option value="H2">H2 (Oct 1 - Mar 31)</option>
                </select>
              </div>
            </>
          )}

          {/* Monthly Selectors */}
          {periodType === "MONTHLY" && (
            <>
              <div className="space-y-1">
                <label className="font-bold text-[#1a0e3d] block text-[11px]">Calendar Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full p-2 bg-[#f8fafc] border border-[#d9d9d9] rounded-xl font-bold text-[#1a0e3d] outline-none cursor-pointer focus:border-[#1a0e3d]"
                >
                  {availableCalendarYears.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1a0e3d] block text-[11px]">Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-full p-2 bg-[#f8fafc] border border-[#d9d9d9] rounded-xl font-bold text-[#1a0e3d] outline-none"
                >
                  {[
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                  ].map((mName, idx) => (
                    <option key={mName} value={idx + 1}>{mName}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Custom Date Range Selectors */}
          {periodType === "CUSTOM" && (
            <>
              <div className="space-y-1">
                <label className="font-bold text-[#1a0e3d] block text-[11px]">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 bg-[#f8fafc] border border-[#d9d9d9] rounded-xl font-bold text-[#1a0e3d] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1a0e3d] block text-[11px]">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 bg-[#f8fafc] border border-[#d9d9d9] rounded-xl font-bold text-[#1a0e3d] outline-none"
                />
              </div>
            </>
          )}

          

          {/* Domain Scope */}
          <div className="space-y-1">
            <label className="font-bold text-[#1a0e3d] block text-[11px]">Research Domain</label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full p-2 bg-[#f8fafc] border border-[#d9d9d9] rounded-xl font-bold text-[#1a0e3d] outline-none"
            >
              <option value="ALL">All 10 Domains</option>
              {allDomainsList.map((dom) => (
                <option key={dom} value={dom}>{dom}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── 4 EXECUTIVE SCORECARD KPI TILES ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1: Grievance Resolution */}
        <div className="bg-white p-5 rounded-3xl border border-[#d9d9d9] shadow-xs space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-[#4a4a4a] uppercase tracking-wider truncate">
              Challenges &amp; Grievances
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F2efff] text-[#1a0e3d] whitespace-nowrap shrink-0 inline-flex items-center leading-none">
              {reportData?.statewideResolutionRate || 0}% Res. Rate
            </span>
          </div>
          <div className="text-3xl font-black text-[#1a0e3d] font-mono">
            {reportData?.totalGrievancesSubmitted || 0}
          </div>
          <p className="text-[10px] text-[#64748b]">
            <strong>{reportData?.totalGrievancesResolved || 0}</strong> resolved &amp; closed out
          </p>
        </div>

        {/* Tile 2: R&D Projects & TRL */}
        <div className="bg-white p-5 rounded-3xl border border-[#d9d9d9] shadow-xs space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-[#803800] uppercase tracking-wider truncate">
              University R&amp;D Projects
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FFF5ea] text-[#803800] whitespace-nowrap shrink-0 inline-flex items-center leading-none">
              Max TRL {reportData?.statewideHighestTrl || 1}
            </span>
          </div>
          <div className="text-3xl font-black text-[#803800] font-mono">
            {reportData?.totalActiveProjects || 0}
          </div>
          <p className="text-[10px] text-[#64748b]">
            Across <strong>{reportData?.totalParticipatingUniversitiesCount || 0}</strong> universities &amp; polytechnics
          </p>
        </div>

        {/* Tile 3: Patents & IP */}
        <div className="bg-white p-5 rounded-3xl border border-[#d9d9d9] shadow-xs space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-[#002110] uppercase tracking-wider truncate">
              Patents &amp; IP Disclosures
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F2fcef] text-[#002110] whitespace-nowrap shrink-0 inline-flex items-center leading-none">
              IPO Kolkata
            </span>
          </div>
          <div className="text-3xl font-black text-[#002110] font-mono">
            {reportData?.totalPatentsFiled || 0}
          </div>
          <p className="text-[10px] text-[#64748b]">
            <strong>{reportData?.totalPatentsGranted || 0}</strong> patents officially granted
          </p>
        </div>

        {/* Tile 4: CSR & Innovation Funds */}
        <div className="bg-white p-5 rounded-3xl border border-[#d9d9d9] shadow-xs space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-[#1a0e3d] uppercase tracking-wider truncate">
              CSR &amp; Grant Funds
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F2efff] text-[#1a0e3d] whitespace-nowrap shrink-0 inline-flex items-center leading-none">
              Co-Funded
            </span>
          </div>
          <div className="text-3xl font-black text-[#1a0e3d] font-mono">
            ₹{((reportData?.totalCsrAllocatedInr || 0) / 100000).toFixed(1)}L
          </div>
          <p className="text-[10px] text-[#64748b]">
            Disbursed to university laboratory testbeds
          </p>
        </div>
      </div>

      {/* ── DISTRICT COMPARATIVE TABLE ── */}
      <div className="bg-white border border-[#d9d9d9] rounded-3xl shadow-xs overflow-hidden space-y-3 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-[#1a0e3d] uppercase tracking-wider">
              District-by-District Innovation Performance Ledger
            </h3>
            <p className="text-xs text-[#64748b]">
              Comparative breakdown for <strong>{reportData?.periodLabel || "Current Period"}</strong>
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Search district, domain, university..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#f8fafc] border border-[#d9d9d9] rounded-xl text-xs text-[#1a0e3d] outline-none focus:border-[#1a0e3d] font-medium"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#1a0e3d] animate-spin mx-auto" />
            <p className="text-xs font-bold text-[#1a0e3d]">Loading district analytics...</p>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="p-10 text-center bg-[#f8fafc] border border-dashed border-[#d9d9d9] rounded-2xl space-y-2">
            <Layers className="w-8 h-8 text-[#64748b] mx-auto" />
            <h4 className="text-xs font-bold text-[#1a0e3d]">No District Records Found for Selected Period</h4>
            <p className="text-[11px] text-[#64748b]">
              Try changing your financial year, quarter, or district filter parameters above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F2efff] border-b border-[#d9d9d9] text-[#1a0e3d] font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">District</th>
                  <th className="py-3 px-4">Challenges (Sub / Res)</th>
                  <th className="py-3 px-4">Resolution %</th>
                  <th className="py-3 px-4">Active R&amp;D Projects</th>
                  <th className="py-3 px-4">Average TRL</th>
                  <th className="py-3 px-4">Patents / IP</th>
                  <th className="py-3 px-4">CSR Funds (INR)</th>
                  <th className="py-3 px-4">Top Domain</th>
                  <th className="py-3 px-4">Lead Universities</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d9d9d9]/60 font-medium">
                {filteredRows.map((r) => (
                  <tr key={r.district} className="hover:bg-[#F2efff]/20 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#1a0e3d]">
                      {r.district}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#1a0e3d]">
                        {r.challengesSubmitted} submitted
                      </div>
                      <div className="text-[10px] text-[#64748b]">
                        {r.challengesResolved} resolved ({r.challengesAssignedHEI} at HEIs)
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                        r.resolutionRate >= 75
                          ? "bg-[#F2fcef] text-[#002110] border-[#a3e635]"
                          : r.resolutionRate >= 50
                          ? "bg-[#FFF5ea] text-[#803800] border-[#fed7aa]"
                          : "bg-[#F2efff] text-[#1a0e3d] border-[#dcd3ff]"
                      }`}>
                        {r.resolutionRate.toFixed(1)}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#1a0e3d]">{r.activeProjects} Active</div>
                      {r.completedProjects > 0 && (
                        <div className="text-[10px] text-[#002110] font-bold">
                          {r.completedProjects} Deployed
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-xs text-[#1a0e3d] bg-[#F2efff] px-2 py-0.5 rounded border border-[#dcd3ff]">
                        TRL {r.avgTrlLevel.toFixed(1)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#1a0e3d]">
                        {r.patentsFiled} Filed
                      </div>
                      {r.patentsGranted > 0 && (
                        <div className="text-[10px] text-[#002110] font-bold">
                          {r.patentsGranted} Granted
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-[#1a0e3d]">
                      ₹{(Number(r.csrFundsAllocatedInr || 0) / 100000).toFixed(1)}L
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded bg-[#F2efff] text-[#1a0e3d] font-bold text-[10px]">
                        {r.topDomainNeed || "General"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-[11px] text-[#1a0e3d] font-bold max-w-xs truncate">
                        {r.participatingUniversities.length > 0
                          ? r.participatingUniversities.join(", ")
                          : "-"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
