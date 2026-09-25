"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { GrassrootIssueRecord } from "@/lib/store/useIssueStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useIndustryPitchStore } from "@/lib/store/useIndustryPitchStore";
import { IpRecordDto } from "@/modules/industry/services/industryLifecycleApi";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080/api";

interface GovernmentAnalyticsOverviewProps {
  issues?: GrassrootIssueRecord[];
  selectedDistrict?: string;
  onSelectDistrict?: (district: string) => void;
  isDistrictScoped?: boolean;
  onNavigateTab?: (tabId: string) => void;
}

const OFFICIAL_DOMAINS = [
  "Agriculture",
  "Water Resources",
  "Healthcare",
  "Clean Energy",
  "Education",
  "Rural Infra",
  "Sanitation",
  "Environment",
  "Public Admin",
  "Livelihoods",
];

const ALL_JHARKHAND_DISTRICTS = [
  "Ranchi",
  "Dhanbad",
  "East Singhbhum",
  "Bokaro",
  "Hazaribagh",
  "Deoghar",
  "Palamu",
  "Dumka",
  "Giridih",
  "Ramgarh",
  "West Singhbhum",
  "Latehar",
  "Sahibganj",
  "Khunti",
  "Gumla",
  "Simdega",
  "Garhwa",
  "Godda",
  "Chatra",
  "Koderma",
  "Jamtara",
  "Pakur",
  "Lohardaga",
  "Saraikela Kharsawan",
];

export function GovernmentAnalyticsOverview({
  issues = [],
  selectedDistrict = "All 24 Districts",
  onSelectDistrict,
  isDistrictScoped = false,
  onNavigateTab,
}: GovernmentAnalyticsOverviewProps) {
  const { token } = useAuthStore();
  const { pitches, fetchPitches } = useIndustryPitchStore();
  const [timeRange, setTimeRange] = useState<"30d" | "q3" | "fy26" | "all">("all");
  const [ipRecords, setIpRecords] = useState<IpRecordDto[]>([]);
  const [isLoadingIp, setIsLoadingIp] = useState<boolean>(false);

  // ── FETCH REAL DATA FROM BACKEND APIS ──
  useEffect(() => {
    fetchPitches(token || undefined);
  }, [token, fetchPitches]);

  useEffect(() => {
    async function loadPlatformIpCatalog() {
      setIsLoadingIp(true);
      try {
        const res = await fetch(`${API_BASE_URL}/ip/catalog`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setIpRecords(data);
          }
        }
      } catch (err) {
        console.warn("Could not fetch real IP catalog from backend:", err);
      } finally {
        setIsLoadingIp(false);
      }
    }
    loadPlatformIpCatalog();
  }, [token]);

  // ── FILTERED ISSUES BASED ON DISTRICT & TIME RANGE ──
  const filteredIssues = useMemo(() => {
    let result = [...issues];

    // District filter
    if (selectedDistrict && selectedDistrict !== "All 24 Districts") {
      result = result.filter(
        (i) => i.district?.toLowerCase() === selectedDistrict.toLowerCase()
      );
    }

    // Time range filter
    if (timeRange !== "all") {
      const now = Date.now();
      let cutoff = 0;
      if (timeRange === "30d") {
        cutoff = now - 30 * 24 * 60 * 60 * 1000;
      } else if (timeRange === "q3") {
        cutoff = now - 90 * 24 * 60 * 60 * 1000;
      } else if (timeRange === "fy26") {
        cutoff = now - 365 * 24 * 60 * 60 * 1000;
      }
      result = result.filter((i) => {
        if (!i.createdAt) return true;
        const createdTime = new Date(i.createdAt).getTime();
        return isNaN(createdTime) || createdTime >= cutoff;
      });
    }

    return result;
  }, [issues, selectedDistrict, timeRange]);

  // ── 1. REAL EXECUTIVE KPI COMPUTATIONS (STRICTLY FROM DATABASE) ──
  const totalIngestionCount = filteredIssues.length;
  const criticalIssuesCount = filteredIssues.filter((i) => i.priority === "CRITICAL").length;
  const highIssuesCount = filteredIssues.filter((i) => i.priority === "HIGH").length;

  const passedValidationCount = filteredIssues.filter(
    (i) => i.validationStatus === "PASS"
  ).length;
  const aiPassRate =
    totalIngestionCount > 0
      ? ((passedValidationCount / totalIngestionCount) * 100).toFixed(1)
      : "0.0";

  const assignedIssues = filteredIssues.filter(
    (i) =>
      (i.assignedHEI && i.assignedHEI !== "Pending Assignment") ||
      i.status === "ASSIGNED_HEI" ||
      i.status === "IN_PROGRESS" ||
      i.status === "RESOLVED"
  );

  const uniqueHeis = useMemo(() => {
    const set = new Set<string>();
    assignedIssues.forEach((i) => {
      if (i.assignedHEI && i.assignedHEI.trim().length > 0 && i.assignedHEI !== "Pending Assignment") {
        const base = i.assignedHEI.split("-")[0].trim();
        set.add(base);
      }
    });
    return set;
  }, [assignedIssues]);

  const activeLabsCount = uniqueHeis.size;

  const resolvedCount = filteredIssues.filter((i) => i.status === "RESOLVED").length;
  const inProgressCount = filteredIssues.filter((i) => i.status === "IN_PROGRESS").length;
  const resolutionRate =
    totalIngestionCount > 0
      ? ((resolvedCount / totalIngestionCount) * 100).toFixed(1)
      : "0.0";

  // ── 2. 10 RESEARCH DOMAINS SEVERITY BREAKDOWN (STACKED BAR) ──
  const matchDomain = (issue: GrassrootIssueRecord, domainIndex: number): boolean => {
    const text = `${issue.sector || ""} ${issue.domain || ""} ${issue.title || ""} ${issue.description || ""}`.toLowerCase();
    switch (domainIndex) {
      case 0: // Agriculture
        return text.includes("agri") || text.includes("crop") || text.includes("rice") || text.includes("soil") || text.includes("farmer") || text.includes("paddy") || text.includes("blast");
      case 1: // Water Resources
        return (text.includes("water") && !text.includes("sanitation")) || text.includes("handpump") || text.includes("fluoride") || text.includes("arsenic") || text.includes("borewell") || text.includes("tube well") || text.includes("reservoir") || text.includes("irrigation");
      case 2: // Healthcare
        return text.includes("health") || text.includes("medical") || text.includes("clinic") || text.includes("silicosis") || text.includes("hospital") || text.includes("anemia") || text.includes("vaccine") || text.includes("ultrasound") || text.includes("screening");
      case 3: // Clean Energy
        return text.includes("energy") || text.includes("solar") || text.includes("electric") || text.includes("microgrid") || text.includes("inverter") || text.includes("hydro") || text.includes("power") || text.includes("turbine");
      case 4: // Education
        return text.includes("education") || text.includes("school") || text.includes("classroom") || text.includes("student") || text.includes("vidyavahini") || text.includes("connectivity") || text.includes("attendance");
      case 5: // Rural Infra
        return text.includes("infra") || text.includes("road") || text.includes("bridge") || text.includes("culvert") || text.includes("transport") || text.includes("building") || text.includes("approach");
      case 6: // Sanitation
        return text.includes("sanitation") || text.includes("waste") || text.includes("drain") || text.includes("dumping") || text.includes("garbage") || text.includes("toilet") || text.includes("sewage") || text.includes("solid waste");
      case 7: // Environment
        return text.includes("environ") || text.includes("pollution") || text.includes("fly ash") || text.includes("mine fire") || text.includes("seam fire") || text.includes("forest") || text.includes("climate") || text.includes("coal dust");
      case 8: // Public Admin
        return text.includes("governance") || text.includes("admin") || text.includes("kiosk") || text.includes("pragya") || text.includes("pension") || text.includes("biometric") || text.includes("public service") || text.includes("panchayat");
      case 9: // Livelihoods
        return text.includes("livelihood") || text.includes("lac") || text.includes("artisan") || text.includes("dokra") || text.includes("tribal") || text.includes("shg") || text.includes("craft") || text.includes("handloom") || text.includes("kiln");
      default:
        return false;
    }
  };

  const domainData = useMemo(() => {
    const criticalCounts: number[] = [];
    const highCounts: number[] = [];
    const standardCounts: number[] = [];

    OFFICIAL_DOMAINS.forEach((_, idx) => {
      const issuesInDomain = filteredIssues.filter((i) => matchDomain(i, idx));
      const crit = issuesInDomain.filter((i) => i.priority === "CRITICAL").length;
      const high = issuesInDomain.filter((i) => i.priority === "HIGH").length;
      const std = issuesInDomain.filter((i) => i.priority !== "CRITICAL" && i.priority !== "HIGH").length;

      criticalCounts.push(crit);
      highCounts.push(high);
      standardCounts.push(std);
    });

    return {
      labels: OFFICIAL_DOMAINS,
      datasets: [
        {
          label: "Critical Tier (Urgent)",
          data: criticalCounts,
          backgroundColor: "#dc2626",
          borderRadius: 4,
        },
        {
          label: "High Priority",
          data: highCounts,
          backgroundColor: "#ea580c",
          borderRadius: 4,
        },
        {
          label: "Standard / Moderate",
          data: standardCounts,
          backgroundColor: "#1a0e3d",
          borderRadius: 4,
        },
      ],
    };
  }, [filteredIssues]);

  // ── 3. CHALLENGE LIFECYCLE DISTRIBUTION (DOUGHNUT) ──
  const lifecycleData = useMemo(() => {
    const submitted = filteredIssues.filter(
      (i) => i.status === "SUBMITTED" || i.status === "DRAFT" || !i.status
    ).length;
    const underReview = filteredIssues.filter((i) => i.status === "UNDER_REVIEW" || i.status === "UNDER_INSPECTION" || i.status === "TRIAGED").length;
    const assigned = filteredIssues.filter((i) => i.status === "ASSIGNED_HEI").length;
    const inProgress = filteredIssues.filter((i) => i.status === "IN_PROGRESS").length;
    const resolved = filteredIssues.filter((i) => i.status === "RESOLVED").length;
    const rejected = filteredIssues.filter((i) => i.status === "REJECTED").length;

    return {
      labels: [
        "Submitted / Intake",
        "Under Nodal Triage",
        "Assigned to HEI Lab",
        "Active Prototyping",
        "Resolved & Deployed",
        "Rejected / Invalid",
      ],
      datasets: [
        {
          data: [submitted, underReview, assigned, inProgress, resolved, rejected],
          backgroundColor: [
            "#6b7280",
            "#2563eb",
            "#1a0e3d",
            "#d97706",
            "#059669",
            "#dc2626",
          ],
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    };
  }, [filteredIssues]);

  // ── 4. TOP DISTRICTS: INGESTION VS DEPLOYED SOLUTIONS (BAR) ──
  const districtData = useMemo(() => {
    const activeDistricts = ALL_JHARKHAND_DISTRICTS.map((district) => {
      const dIssues = issues.filter(
        (i) => i.district?.toLowerCase() === district.toLowerCase()
      );
      const ingested = dIssues.length;
      const resolvedOrActive = dIssues.filter(
        (i) => i.status === "RESOLVED" || i.status === "IN_PROGRESS" || i.status === "ASSIGNED_HEI"
      ).length;
      return { district, ingested, resolvedOrActive };
    }).filter((d) => d.ingested > 0);

    // If no data, show empty state cleanly
    const displayList = activeDistricts.length > 0
      ? activeDistricts.sort((a, b) => b.ingested - a.ingested).slice(0, 10)
      : [];

    return {
      labels: displayList.map((s) => s.district),
      datasets: [
        {
          label: "Challenges Ingested",
          data: displayList.map((s) => s.ingested),
          backgroundColor: "#1a0e3d",
          borderRadius: 5,
        },
        {
          label: "Solutions in R&D / Deployed",
          data: displayList.map((s) => s.resolvedOrActive),
          backgroundColor: "#059669",
          borderRadius: 5,
        },
      ],
    };
  }, [issues]);

  // ── 5. 6-MONTH TRAJECTORY (LINE) ──
  const trajectoryData = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const labels: string[] = [];
    const ingestedCounts: number[] = [];
    const assignedCounts: number[] = [];
    const resolvedCounts: number[] = [];

    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const y = d.getFullYear();
      const label = `${monthNames[mIdx]} ${y}`;
      labels.push(label);

      const mStart = new Date(y, mIdx, 1).getTime();
      const mEnd = new Date(y, mIdx + 1, 0, 23, 59, 59).getTime();

      const mIssues = issues.filter((iss) => {
        if (!iss.createdAt) return false;
        const t = new Date(iss.createdAt).getTime();
        return t >= mStart && t <= mEnd;
      });

      const ing = mIssues.length;
      const ass = mIssues.filter(
        (iss) =>
          (iss.assignedHEI && iss.assignedHEI !== "Pending Assignment") ||
          iss.status === "ASSIGNED_HEI" ||
          iss.status === "IN_PROGRESS" ||
          iss.status === "RESOLVED"
      ).length;
      const res = mIssues.filter((iss) => iss.status === "RESOLVED").length;

      ingestedCounts.push(ing);
      assignedCounts.push(ass);
      resolvedCounts.push(res);
    }

    return {
      labels,
      datasets: [
        {
          label: "Challenges Ingested",
          data: ingestedCounts,
          borderColor: "#1a0e3d",
          backgroundColor: "rgba(26, 14, 61, 0.08)",
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: "University Allocations",
          data: assignedCounts,
          borderColor: "#d97706",
          backgroundColor: "rgba(217, 119, 6, 0.08)",
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: "Field Deployments",
          data: resolvedCounts,
          borderColor: "#059669",
          backgroundColor: "rgba(5, 150, 105, 0.08)",
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [issues]);

  // ── 6. PARTICIPATING HEIS (HORIZONTAL BAR) ──
  const heiData = useMemo(() => {
    const heiMap = new Map<string, number>();

    issues.forEach((issue) => {
      if (issue.assignedHEI && issue.assignedHEI.trim().length > 0 && issue.assignedHEI !== "Pending Assignment") {
        const raw = issue.assignedHEI.trim();
        const name = raw.split("-")[0].trim();
        heiMap.set(name, (heiMap.get(name) || 0) + 1);
      }
    });

    const entries = Array.from(heiMap.entries()).sort((a, b) => b[1] - a[1]);

    return {
      labels: entries.map((e) => e[0]),
      datasets: [
        {
          label: "Active Projects",
          data: entries.map((e) => e[1]),
          backgroundColor: "#32174a",
          borderRadius: 6,
        },
      ],
    };
  }, [issues]);

  const leadingHei = useMemo(() => {
    if (heiData.labels.length > 0 && heiData.datasets[0].data.length > 0) {
      const topName = heiData.labels[0];
      const topCount = heiData.datasets[0].data[0];
      return `${topName} (${topCount} Projects)`;
    }
    return null;
  }, [heiData]);

  // ── 7. REAL INNOVATION OUTCOMES & IP RECORDS ──
  const realPatentsFiled = ipRecords.filter(
    (r) => r.ipType === "SHARED_PATENT" || r.patentApplicationNumber
  ).length;
  const realPatentsGranted = ipRecords.filter((r) => r.status === "GRANTED").length;
  const realTechTransfers = ipRecords.filter(
    (r) => r.status === "COMMERCIALLY_LICENSED" || r.ipType === "COMMERCIAL_LICENSE"
  ).length;
  const realPrototypeConversion =
    assignedIssues.length > 0
      ? Math.round(((resolvedCount + inProgressCount) / assignedIssues.length) * 100)
      : 0;

  // ── 8. REAL INDUSTRY COLLABORATIONS & CSR DATA ──
  const realIndustryStats = useMemo(() => {
    const acceptedPitches = pitches.filter((p) => p.status === "ACCEPTED");
    const totalCommitted = acceptedPitches.reduce((acc, p) => acc + (p.requestedAmount || 0), 0);
    const totalCommittedCr = (totalCommitted / 10000000).toFixed(2);

    const distinctCompanies = new Set<string>();
    pitches.forEach((p) => {
      if (p.targetCompany && p.targetCompany.trim().length > 0) {
        distinctCompanies.add(p.targetCompany.trim());
      }
    });

    return {
      pitchesCount: pitches.length,
      acceptedCount: acceptedPitches.length,
      partnersCount: distinctCompanies.size,
      committedCr: totalCommittedCr,
    };
  }, [pitches]);

  // ── 9. REAL COMMUNITY IMPACT ──
  const realImpact = useMemo(() => {
    const resolvedDistricts = new Set<string>();
    filteredIssues
      .filter((i) => i.status === "RESOLVED" || i.status === "IN_PROGRESS")
      .forEach((i) => {
        if (i.district) resolvedDistricts.add(i.district);
      });

    return {
      resolvedIssuesCount: resolvedCount,
      inProgressCount: inProgressCount,
      activeImpactDistricts: resolvedDistricts.size,
    };
  }, [filteredIssues, resolvedCount, inProgressCount]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 text-[#4a4a4a]">
      {/* ── TOP CONTROLS & TIME RANGE FILTER BAR ── */}
      <div className="bg-white p-4 rounded-2xl border border-[#d9d9d9] shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-[#1a0e3d] tracking-tight flex items-center gap-2">
            <span>
              {isDistrictScoped ? `${selectedDistrict} District Innovation & Triage Analytics` : "Statewide Innovation & Citizen Triage Analytics"}
            </span>
          </h2>
          <p className="text-xs text-[#4a4a4a] mt-0.5">
            {isDistrictScoped
              ? `Real-time intelligence for ${selectedDistrict} Collectorate, AI problem classification, and local HEI research metrics.`
              : "Real-time cross-district intelligence, AI problem classification, and verified institutional research metrics."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* District Selector / Locked Badge */}
          <div className="flex items-center gap-1.5">
            {isDistrictScoped ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F2fcef] text-[#002110] border border-[#a3e635] text-xs font-bold shadow-2xs">
                {selectedDistrict} District (Locked)
              </span>
            ) : onSelectDistrict ? (
              <select
                value={selectedDistrict}
                onChange={(e) => onSelectDistrict(e.target.value)}
                className="p-1.5 px-3 rounded-xl border border-[#d9d9d9] bg-white text-xs font-bold text-[#1a0e3d] outline-none shadow-xs focus:ring-1 focus:ring-[#1a0e3d] cursor-pointer"
              >
                <option value="All 24 Districts">All 24 Districts</option>
                {ALL_JHARKHAND_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            ) : null}
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F2efff]/50 border border-[#dcd3ff] self-stretch lg:self-auto">
            <button
              type="button"
              onClick={() => setTimeRange("all")}
              className={`flex-1 lg:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === "all"
                  ? "bg-[#1a0e3d] text-white shadow-xs"
                  : "text-[#4a4a4a] hover:text-[#1a0e3d]"
              }`}
            >
              All Time
            </button>
            <button
              type="button"
              onClick={() => setTimeRange("30d")}
              className={`flex-1 lg:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === "30d"
                  ? "bg-[#1a0e3d] text-white shadow-xs"
                  : "text-[#4a4a4a] hover:text-[#1a0e3d]"
              }`}
            >
              Last 30 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeRange("q3")}
              className={`flex-1 lg:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === "q3"
                  ? "bg-[#1a0e3d] text-white shadow-xs"
                  : "text-[#4a4a4a] hover:text-[#1a0e3d]"
              }`}
            >
              Q3 FY 2026
            </button>
            <button
              type="button"
              onClick={() => setTimeRange("fy26")}
              className={`flex-1 lg:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === "fy26"
                  ? "bg-[#1a0e3d] text-white shadow-xs"
                  : "text-[#4a4a4a] hover:text-[#1a0e3d]"
              }`}
            >
              FY 2026–27
            </button>
          </div>
        </div>
      </div>

      {/* ── 4 EXECUTIVE KPI METRIC CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-[#d9d9d9] shadow-xs space-y-2 hover:border-[#1a0e3d] transition-all">
          <div className="flex items-center justify-between gap-2 text-xs font-bold text-[#4a4a4a] uppercase tracking-wider">
            <span className="truncate">Total Challenges Registered</span>
            <span className="text-[#1a0e3d] font-bold text-xs bg-[#F2efff] border border-[#dcd3ff] px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 inline-flex items-center leading-none">
              Live Registry
            </span>
          </div>
          <div className="text-3xl font-black text-[#1a0e3d] font-mono tracking-tight">
            {totalIngestionCount.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#4a4a4a]">
            {selectedDistrict === "All 24 Districts" ? (
              <>Across all <strong>24 Jharkhand Districts</strong></>
            ) : (
              <>Filtered for <strong>{selectedDistrict} District</strong></>
            )}
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-[#d9d9d9] shadow-xs space-y-2 hover:border-[#059669] transition-all">
          <div className="flex items-center justify-between gap-2 text-xs font-bold text-[#4a4a4a] uppercase tracking-wider">
            <span className="truncate">Triage &amp; Verification Rate</span>
            <span className="text-[#002110] font-bold text-xs bg-[#F2fcef] border border-[#a3e635] px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 inline-flex items-center leading-none">
              Verified
            </span>
          </div>
          <div className="text-3xl font-black text-[#002110] font-mono tracking-tight">
            {aiPassRate}%
          </div>
          <p className="text-[11px] text-[#4a4a4a]">
            <strong>{passedValidationCount}</strong> of {totalIngestionCount} verified &amp; triaged
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-[#d9d9d9] shadow-xs space-y-2 hover:border-[#32174a] transition-all">
          <div className="flex items-center justify-between gap-2 text-xs font-bold text-[#4a4a4a] uppercase tracking-wider">
            <span className="truncate">Allocated Academic Institutions</span>
            <span className="text-[#32174a] font-bold text-xs bg-[#F6effb] border border-[#e9d5ff] px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 inline-flex items-center leading-none">
              NEP 2020
            </span>
          </div>
          <div className="text-3xl font-black text-[#32174a] font-mono tracking-tight">
            {activeLabsCount} Institutions
          </div>
          <p className="text-[11px] text-[#4a4a4a]">
            <strong>{assignedIssues.length}</strong> active capstone &amp; research projects
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-[#d9d9d9] shadow-xs space-y-2 hover:border-[#d97706] transition-all">
          <div className="flex items-center justify-between gap-2 text-xs font-bold text-[#4a4a4a] uppercase tracking-wider">
            <span className="truncate">Solutions Deployed</span>
            <span className="text-[#803800] font-bold text-xs bg-[#FFF5ea] border border-[#fed7aa] px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 inline-flex items-center leading-none">
              {resolutionRate}% Rate
            </span>
          </div>
          <div className="text-3xl font-black text-[#803800] font-mono tracking-tight">
            {resolvedCount} Resolved
          </div>
          <p className="text-[11px] text-[#4a4a4a]">
            <strong>{inProgressCount}</strong> solutions currently in field prototyping
          </p>
        </div>
      </div>

      {/* ── ROW 1: 10-DOMAIN BREAKDOWN & WORKFLOW LIFECYCLE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Domain Severity Stacked Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#d9d9d9] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[#1a0e3d] uppercase tracking-wide">
                10 Official Research Domains: Challenge Distribution &amp; Severity
              </h3>
              <p className="text-xs text-[#4a4a4a]">
                Aggregation of challenges categorized across thematic domains and severity tiers
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            {totalIngestionCount === 0 ? (
              <div className="h-full flex items-center justify-center border border-dashed border-[#d9d9d9] rounded-xl text-xs text-[#64748b]">
                No challenge submissions recorded yet.
              </div>
            ) : (
              <Bar
                data={domainData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      stacked: true,
                      grid: { display: false },
                      ticks: { font: { size: 10, weight: 600 } },
                    },
                    y: {
                      stacked: true,
                      grid: { color: "#f1f5f9" },
                      ticks: { font: { size: 10 }, stepSize: 1 },
                    },
                  },
                  plugins: {
                    legend: {
                      position: "top" as const,
                      labels: { boxWidth: 12, font: { size: 11, weight: 600 } },
                    },
                    tooltip: {
                      padding: 10,
                      cornerRadius: 8,
                    },
                  },
                }}
              />
            )}
          </div>
        </div>

        {/* Challenge Lifecycle Doughnut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-[#d9d9d9] shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[#1a0e3d] uppercase tracking-wide">
              Challenge Lifecycle Distribution
            </h3>
            <p className="text-xs text-[#4a4a4a]">
              Live progression from citizen intake to university field deployment
            </p>
          </div>

          <div className="h-60 w-full relative flex items-center justify-center">
            {totalIngestionCount === 0 ? (
              <div className="h-full w-full flex items-center justify-center border border-dashed border-[#d9d9d9] rounded-xl text-xs text-[#64748b]">
                No active lifecycle records.
              </div>
            ) : (
              <Doughnut
                data={lifecycleData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: "68%",
                  plugins: {
                    legend: {
                      position: "bottom" as const,
                      labels: { boxWidth: 10, font: { size: 9.5, weight: 600 } },
                    },
                  },
                }}
              />
            )}
          </div>

          <div className="p-3 bg-[#F2fcef] rounded-xl border border-[#a3e635] text-center">
            <span className="text-xs text-[#002110] font-semibold">
              Deployment SLA Conversion Rate: <strong className="text-[#002110] font-black">{resolutionRate}%</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ── ROW 2: 24-DISTRICT VOLUME & MONTHLY INNOVATION TRAJECTORY ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* District Volume Comparison Chart */}
        <div className="bg-white p-6 rounded-2xl border border-[#d9d9d9] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[#1a0e3d] uppercase tracking-wide">
                Top Districts: Challenges vs. Deployed Solutions
              </h3>
              <p className="text-xs text-[#4a4a4a]">
                District challenge intake volume vs. functional university prototypes in active development
              </p>
            </div>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab("routing")}
                className="text-xs font-bold text-[#1a0e3d] hover:text-[#2e1764] cursor-pointer hidden sm:inline"
              >
                Open AI Routing &amp; Allocations →
              </button>
            )}
          </div>

          <div className="h-64 w-full">
            {districtData.labels.length === 0 ? (
              <div className="h-full flex items-center justify-center border border-dashed border-[#d9d9d9] rounded-xl text-xs text-[#64748b]">
                No district challenge data available yet.
              </div>
            ) : (
              <Bar
                data={districtData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      grid: { display: false },
                      ticks: { font: { size: 9.5, weight: 600 } },
                    },
                    y: {
                      grid: { color: "#f1f5f9" },
                      ticks: { font: { size: 10 }, stepSize: 1 },
                    },
                  },
                  plugins: {
                    legend: {
                      position: "top" as const,
                      labels: { boxWidth: 12, font: { size: 11, weight: 600 } },
                    },
                  },
                }}
              />
            )}
          </div>
        </div>

        {/* 6-Month Trajectory Area Chart */}
        <div className="bg-white p-6 rounded-2xl border border-[#d9d9d9] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[#1a0e3d] uppercase tracking-wide">
                6-Month Innovation &amp; Pilot Trajectory
              </h3>
              <p className="text-xs text-[#4a4a4a]">
                Growth curve of citizen problems, HEI allocations &amp; pilot releases
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <Line
              data={trajectoryData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { font: { size: 10, weight: 600 } },
                  },
                  y: {
                    grid: { color: "#f1f5f9" },
                    ticks: { font: { size: 10 }, stepSize: 1 },
                  },
                },
                plugins: {
                  legend: {
                    position: "top" as const,
                    labels: { boxWidth: 12, font: { size: 11, weight: 600 } },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* ── ROW 3: TOP HEI LAB ENGAGEMENT MATRIX ── */}
      <div className="bg-white p-6 rounded-2xl border border-[#d9d9d9] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-[#1a0e3d] uppercase tracking-wide">
              Higher Education Institutions (HEI) Research Lab Allocation Matrix
            </h3>
            <p className="text-xs text-[#4a4a4a]">
              Active multidisciplinary capstone teams, faculty mentorship, and research incubation under NEP 2020
            </p>
          </div>
          {leadingHei && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#1a0e3d] bg-[#F2efff] border border-[#dcd3ff] px-3 py-1 rounded-full whitespace-nowrap shrink-0 inline-flex items-center leading-none">
                Leading: <strong>{leadingHei}</strong>
              </span>
            </div>
          )}
        </div>

        <div className="h-56 w-full">
          {heiData.labels.length === 0 ? (
            <div className="h-full flex items-center justify-center border border-dashed border-[#d9d9d9] rounded-xl text-xs text-[#64748b]">
              No university allocations made yet. Assign issues in the AI Routing tab to view live HEI performance.
            </div>
          ) : (
            <Bar
              data={heiData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: "y" as const,
                scales: {
                  x: {
                    grid: { color: "#f1f5f9" },
                    ticks: { font: { size: 10 }, stepSize: 1 },
                  },
                  y: {
                    grid: { display: false },
                    ticks: { font: { size: 10, weight: 600 } },
                  },
                },
                plugins: {
                  legend: { display: false },
                },
              }}
            />
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION A: INNOVATION OUTCOMES, PATENTS & STARTUPS (REAL API)
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#d9d9d9] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e2e8f0] pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#F2efff] text-[#1a0e3d] text-xs font-black uppercase tracking-wider mb-1">
              <span>Intellectual Property &amp; Enterprise Pipeline</span>
            </div>
            <h3 className="text-lg font-black text-[#1a0e3d] tracking-tight">
              Innovation Outcomes, Patents &amp; Intellectual Property
            </h3>
            <p className="text-xs text-[#4a4a4a] mt-0.5">
              Official IP disclosures and patent applications registered across state institutions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-[#F2fcef] text-[#002110] border border-[#a3e635] text-xs font-bold">
              {realPrototypeConversion}% Prototype-to-Field SLA
            </span>
          </div>
        </div>

        {/* Real Outcome Stat Badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#F2efff]/60 border border-[#dcd3ff] space-y-1">
            <span className="text-[11px] font-bold text-[#1a0e3d] uppercase tracking-wider block">
              Patents Filed
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#1a0e3d] font-mono">
              {realPatentsFiled}
            </div>
            <p className="text-[10px] text-[#4a4a4a]">
              <strong>{realPatentsGranted}</strong> granted • {Math.max(0, realPatentsFiled - realPatentsGranted)} in examination
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F2fcef]/60 border border-[#a3e635]/60 space-y-1">
            <span className="text-[11px] font-bold text-[#002110] uppercase tracking-wider block">
              Tech Transfers (TTO)
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#002110] font-mono">
              {realTechTransfers}
            </div>
            <p className="text-[10px] text-[#4a4a4a]">
              Commercially licensed technologies
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F6effb]/60 border border-[#e9d5ff] space-y-1">
            <span className="text-[11px] font-bold text-[#32174a] uppercase tracking-wider block">
              Total IP Disclosures
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#32174a] font-mono">
              {ipRecords.length}
            </div>
            <p className="text-[10px] text-[#4a4a4a]">
              Cataloged in platform IP registry
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFF5ea]/60 border border-[#fed7aa] space-y-1">
            <span className="text-[11px] font-bold text-[#803800] uppercase tracking-wider block">
              Prototype Conversion
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#803800] font-mono">
              {realPrototypeConversion}%
            </div>
            <p className="text-[10px] text-[#4a4a4a]">
              From challenge to functional laboratory prototype
            </p>
          </div>
        </div>

        {/* Real IP Disclosures List or Empty State */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-extrabold text-[#1a0e3d] uppercase tracking-wider">
            Live IP &amp; Patent Disclosures Catalog
          </h4>

          {isLoadingIp ? (
            <div className="p-6 text-center text-xs text-[#64748b]">
              Loading platform IP catalog...
            </div>
          ) : ipRecords.length === 0 ? (
            <div className="p-8 text-center bg-[#f8fafc] border border-dashed border-[#d9d9d9] rounded-2xl space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#F2efff] text-[#1a0e3d] flex items-center justify-center mx-auto">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-xs font-bold text-[#1a0e3d]">No IP Disclosures or Patents Registered Yet</p>
              <p className="text-[11px] text-[#64748b] max-w-md mx-auto">
                When university research labs file patent applications or disclose intellectual property through the platform, they will appear here in real-time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ipRecords.slice(0, 6).map((rec) => (
                <div key={rec.id} className="p-4 bg-white rounded-xl border border-[#d9d9d9] shadow-2xs space-y-1.5 hover:border-[#1a0e3d] transition-all">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-[#1a0e3d] truncate">{rec.title}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#F2fcef] text-[#002110] border border-[#a3e635] flex-shrink-0">
                      {rec.status}
                    </span>
                  </div>
                  {rec.abstractDescription && (
                    <p className="text-[11px] text-[#4a4a4a] line-clamp-2">{rec.abstractDescription}</p>
                  )}
                  <div className="text-[10px] text-[#64748b] font-mono pt-1 border-t border-[#f1f5f9] flex items-center justify-between">
                    <span>Type: {rec.ipType}</span>
                    {rec.patentApplicationNumber && <span>App: {rec.patentApplicationNumber}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION B: REAL INDUSTRY COLLABORATIONS & CSR OFFERS
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#d9d9d9] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e2e8f0] pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#FFF5ea] text-[#803800] text-xs font-black uppercase tracking-wider mb-1">
              <span>Public-Private Partnership (PPP) Ledger</span>
            </div>
            <h3 className="text-lg font-black text-[#1a0e3d] tracking-tight">
              Industry Collaborations &amp; CSR Co-Funding Proposals
            </h3>
            <p className="text-xs text-[#4a4a4a] mt-0.5">
              Official corporate proposals and co-funding commitments across registered industry partners.
            </p>
          </div>
        </div>

        {/* 3 Real Industry KPI Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-[#d9d9d9] shadow-2xs space-y-1 hover:border-[#1a0e3d] transition-all">
            <span className="text-[11px] font-bold text-[#4a4a4a] uppercase tracking-wider block">
              CSR Grant Committed
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#1a0e3d] font-mono">
              ₹ {realIndustryStats.committedCr} Cr
            </div>
            <p className="text-[10px] text-[#4a4a4a]">
              From accepted industry proposals
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#d9d9d9] shadow-2xs space-y-1 hover:border-[#059669] transition-all">
            <span className="text-[11px] font-bold text-[#4a4a4a] uppercase tracking-wider block">
              Total Industry Proposals
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#059669] font-mono">
              {realIndustryStats.pitchesCount}
            </div>
            <p className="text-[10px] text-[#4a4a4a]">
              <strong>{realIndustryStats.acceptedCount}</strong> accepted by corporate partners
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#d9d9d9] shadow-2xs space-y-1 hover:border-[#32174a] transition-all">
            <span className="text-[11px] font-bold text-[#4a4a4a] uppercase tracking-wider block">
              Corporate Partners Engaged
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#32174a] font-mono">
              {realIndustryStats.partnersCount}
            </div>
            <p className="text-[10px] text-[#4a4a4a]">
              Distinct corporate entities in communication
            </p>
          </div>
        </div>

        {/* Real Proposals List or Clean Empty State */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-extrabold text-[#1a0e3d] uppercase tracking-wider">
            Live Industry Co-Funding Proposals
          </h4>

          {pitches.length === 0 ? (
            <div className="p-8 text-center bg-[#f8fafc] border border-dashed border-[#d9d9d9] rounded-2xl space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#FFF5ea] text-[#803800] flex items-center justify-center mx-auto">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-xs font-bold text-[#1a0e3d]">No Industry Proposals Registered Yet</p>
              <p className="text-[11px] text-[#64748b] max-w-md mx-auto">
                University R&amp;D pitches and industry collaboration offers will be listed here as they are published to corporate partners.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pitches.slice(0, 6).map((pitch) => (
                <div key={pitch.id} className="p-4 bg-white rounded-xl border border-[#d9d9d9] shadow-2xs space-y-2 hover:border-[#1a0e3d] transition-all">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-[#1a0e3d] truncate">{pitch.projectTitle}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                      pitch.status === 'ACCEPTED'
                        ? 'bg-[#F2fcef] text-[#002110] border-[#a3e635]'
                        : pitch.status === 'REJECTED'
                        ? 'bg-[#FFF8f8] text-[#3a0907] border-[#fecaca]'
                        : 'bg-[#FFF5ea] text-[#803800] border-[#fed7aa]'
                    }`}>
                      {pitch.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#4a4a4a]">
                    Target: <strong>{pitch.targetCompany || "Corporate Partner"}</strong>
                  </div>
                  <div className="text-[10px] text-[#64748b] font-mono flex items-center justify-between pt-1 border-t border-[#f1f5f9]">
                    <span>HEI: {pitch.universityName}</span>
                    <span className="font-bold text-[#002110]">₹ {((pitch.requestedAmount || 0) / 100000).toFixed(1)}L</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION C: COMMUNITY IMPACT LEDGER (REAL DATABASE DRIVEN)
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#d9d9d9] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e2e8f0] pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#F2fcef] text-[#002110] text-xs font-black uppercase tracking-wider mb-1">
              <span>District Impact &amp; Resolution Audit</span>
            </div>
            <h3 className="text-lg font-black text-[#1a0e3d] tracking-tight">
              Community Impact &amp; Resolution Audit
            </h3>
            <p className="text-xs text-[#4a4a4a] mt-0.5">
              Real-time resolution metrics across Jharkhand districts derived from submitted and resolved challenges.
            </p>
          </div>
        </div>

        {/* 3 Real Community Impact Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F2fcef] to-white border border-[#a3e635] space-y-1">
            <span className="text-[11px] font-bold text-[#002110] uppercase tracking-wider block">
              Resolved &amp; Deployed Solutions
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#002110] font-mono">
              {realImpact.resolvedIssuesCount}
            </div>
            <p className="text-[10px] text-[#4a4a4a]">
              Challenges completely resolved with field solution
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F2efff] to-white border border-[#dcd3ff] space-y-1">
            <span className="text-[11px] font-bold text-[#1a0e3d] uppercase tracking-wider block">
              Active Field Prototyping
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#1a0e3d] font-mono">
              {realImpact.inProgressCount}
            </div>
            <p className="text-[10px] text-[#4a4a4a]">
              Solutions currently in lab prototyping / testing
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FFF5ea] to-white border border-[#fed7aa] space-y-1">
            <span className="text-[11px] font-bold text-[#803800] uppercase tracking-wider block">
              Districts with Active Solutions
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#803800] font-mono">
              {realImpact.activeImpactDistricts} of 24
            </div>
            <p className="text-[10px] text-[#4a4a4a]">
              Jharkhand districts with deployed or active R&amp;D
            </p>
          </div>
        </div>

        {realImpact.resolvedIssuesCount === 0 && realImpact.inProgressCount === 0 && (
          <div className="p-6 text-center bg-[#f8fafc] border border-dashed border-[#d9d9d9] rounded-2xl space-y-1">
            <p className="text-xs font-bold text-[#1a0e3d]">No Field Deployments Yet</p>
            <p className="text-[11px] text-[#64748b]">
              As assigned HEI projects complete prototyping and deploy solutions to villages, district resolution metrics will update automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
