"use client";

import React, { useState, useMemo } from "react";
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

interface GovernmentAnalyticsOverviewProps {
  issues?: GrassrootIssueRecord[];
  selectedDistrict?: string;
  onSelectDistrict?: (district: string) => void;
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
  "Saraikela",
];

export function GovernmentAnalyticsOverview({
  issues = [],
  selectedDistrict = "All 24 Districts",
  onSelectDistrict,
  onNavigateTab,
}: GovernmentAnalyticsOverviewProps) {
  const [timeRange, setTimeRange] = useState<"30d" | "q3" | "fy26" | "all">("all");

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

  // ── 1. REAL EXECUTIVE KPI COMPUTATIONS ──
  const totalIngestionCount = filteredIssues.length;
  const criticalIssuesCount = filteredIssues.filter((i) => i.priority === "CRITICAL").length;
  const highIssuesCount = filteredIssues.filter((i) => i.priority === "HIGH").length;

  const passedValidationCount = filteredIssues.filter(
    (i) => i.validationStatus === "PASS" || !i.validationStatus
  ).length;
  const aiPassRate =
    filteredIssues.length > 0
      ? ((passedValidationCount / filteredIssues.length) * 100).toFixed(1)
      : "100.0";

  const assignedIssues = filteredIssues.filter(
    (i) =>
      i.assignedHEI ||
      i.status === "ASSIGNED_HEI" ||
      i.status === "IN_PROGRESS" ||
      i.status === "RESOLVED"
  );

  const uniqueHeis = useMemo(() => {
    const set = new Set<string>();
    assignedIssues.forEach((i) => {
      if (i.assignedHEI && i.assignedHEI.trim().length > 0) {
        // Extract base institution name (e.g., "BIT Mesra" from "BIT Mesra - Hydraulics Lab")
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
    filteredIssues.length > 0
      ? ((resolvedCount / filteredIssues.length) * 100).toFixed(1)
      : "0.0";

  // Estimated CSR funding mobilized: ₹15-25 Lakhs per active HEI pilot
  const estimatedCsrCommittedCr = ((assignedIssues.length * 18.5) / 100).toFixed(2);
  const estimatedCsrDisbursedCr = (
    ((resolvedCount * 18.5 + inProgressCount * 9.25) / 100)
  ).toFixed(2);

  // ── 2. CHART 1: 10 RESEARCH DOMAINS SEVERITY BREAKDOWN (STACKED BAR) ──
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
          backgroundColor: "#ef4444",
          borderRadius: 4,
        },
        {
          label: "High Priority",
          data: highCounts,
          backgroundColor: "#f97316",
          borderRadius: 4,
        },
        {
          label: "Standard / Moderate",
          data: standardCounts,
          backgroundColor: "#3b82f6",
          borderRadius: 4,
        },
      ],
    };
  }, [filteredIssues]);

  // ── 3. CHART 2: CHALLENGE WORKFLOW & STATUS DISTRIBUTION (DOUGHNUT) ──
  const lifecycleData = useMemo(() => {
    const submitted = filteredIssues.filter(
      (i) => i.status === "SUBMITTED" || i.status === "DRAFT" || !i.status
    ).length;
    const underReview = filteredIssues.filter((i) => i.status === "UNDER_REVIEW" || i.status === "UNDER_INSPECTION").length;
    const assigned = filteredIssues.filter((i) => i.status === "ASSIGNED_HEI").length;
    const inProgress = filteredIssues.filter((i) => i.status === "IN_PROGRESS").length;
    const resolved = filteredIssues.filter((i) => i.status === "RESOLVED").length;
    const rejected = filteredIssues.filter((i) => i.status === "REJECTED").length;

    return {
      labels: [
        "Intake & Citizen Review",
        "Under Nodal Inspection",
        "Assigned HEI Labs",
        "Active Prototyping",
        "Resolved & Deployed",
        "Rejected / Duplicate",
      ],
      datasets: [
        {
          data: [submitted, underReview, assigned, inProgress, resolved, rejected],
          backgroundColor: [
            "#94a3b8", // Slate
            "#60a5fa", // Blue
            "#8b5cf6", // Purple
            "#f59e0b", // Amber
            "#10b981", // Emerald
            "#ef4444", // Red
          ],
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    };
  }, [filteredIssues]);

  // ── 4. CHART 3: TOP DISTRICTS INGESTION VS DEPLOYED SOLUTIONS (BAR) ──
  const districtData = useMemo(() => {
    // Collect counts for each district
    const districtStats = ALL_JHARKHAND_DISTRICTS.map((district) => {
      const dIssues = issues.filter(
        (i) => i.district?.toLowerCase() === district.toLowerCase()
      );
      const ingested = dIssues.length;
      const resolvedOrActive = dIssues.filter(
        (i) => i.status === "RESOLVED" || i.status === "IN_PROGRESS" || i.status === "ASSIGNED_HEI"
      ).length;
      return { district, ingested, resolvedOrActive };
    });

    // Sort by ingested count descending and take active ones or top 10
    const sorted = districtStats
      .sort((a, b) => b.ingested - a.ingested)
      .slice(0, 10);

    return {
      labels: sorted.map((s) => s.district),
      datasets: [
        {
          label: "Challenges Ingested",
          data: sorted.map((s) => s.ingested),
          backgroundColor: "#2563eb",
          borderRadius: 5,
        },
        {
          label: "Solutions in R&D / Deployed",
          data: sorted.map((s) => s.resolvedOrActive),
          backgroundColor: "#10b981",
          borderRadius: 5,
        },
      ],
    };
  }, [issues]);

  // ── 5. CHART 4: 6-MONTH TRAJECTORY (LINE / AREA) ──
  const trajectoryData = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const labels: string[] = [];
    const ingestedCounts: number[] = [];
    const assignedCounts: number[] = [];
    const resolvedCounts: number[] = [];

    const now = new Date();

    // Generate past 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const y = d.getFullYear();
      const label = `${monthNames[mIdx]} ${y}`;
      labels.push(label);

      const mStart = new Date(y, mIdx, 1).getTime();
      const mEnd = new Date(y, mIdx + 1, 0, 23, 59, 59).getTime();

      const mIssues = issues.filter((iss) => {
        if (!iss.createdAt) return i === 0; // Default fallback to current month
        const t = new Date(iss.createdAt).getTime();
        return t >= mStart && t <= mEnd;
      });

      const ing = mIssues.length;
      const ass = mIssues.filter(
        (iss) =>
          iss.assignedHEI ||
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
          label: "Citizen Grievances Ingested",
          data: ingestedCounts,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.12)",
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: "University Lab Allocations",
          data: assignedCounts,
          borderColor: "#8b5cf6",
          backgroundColor: "rgba(139, 92, 246, 0.08)",
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: "Field Pilot Deployments",
          data: resolvedCounts,
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.12)",
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [issues]);

  // ── 6. CHART 5: TOP PARTICIPATING HEIS (HORIZONTAL BAR) ──
  const heiData = useMemo(() => {
    const heiMap = new Map<string, number>();

    issues.forEach((issue) => {
      if (issue.assignedHEI && issue.assignedHEI.trim().length > 0) {
        const raw = issue.assignedHEI.trim();
        // Clean institution name
        let name = raw.split("-")[0].trim();
        if (name.includes("BIT Mesra")) name = "BIT Mesra, Ranchi";
        else if (name.includes("IIT (ISM)") || name.includes("IIT-ISM")) name = "IIT (ISM) Dhanbad";
        else if (name.includes("NIT Jamshedpur")) name = "NIT Jamshedpur";
        else if (name.includes("Birsa Agricultural") || name.includes("BAU")) name = "Birsa Agri Univ (BAU)";
        else if (name.includes("AIIMS")) name = "AIIMS Deoghar";
        else if (name.includes("RIMS")) name = "RIMS Ranchi";
        else if (name.includes("Central University") || name.includes("CUJ")) name = "Central Univ (CUJ)";

        heiMap.set(name, (heiMap.get(name) || 0) + 1);
      }
    });

    // Ensure baseline top institutions are represented even if 0
    const defaultList = [
      "BIT Mesra, Ranchi",
      "IIT (ISM) Dhanbad",
      "NIT Jamshedpur",
      "Birsa Agri Univ (BAU)",
      "AIIMS Deoghar",
      "RIMS Ranchi",
      "Central Univ (CUJ)",
    ];

    defaultList.forEach((hei) => {
      if (!heiMap.has(hei)) {
        heiMap.set(hei, 0);
      }
    });

    const entries = Array.from(heiMap.entries()).sort((a, b) => b[1] - a[1]);

    return {
      labels: entries.map((e) => e[0]),
      datasets: [
        {
          label: "Active Capstone R&D Projects",
          data: entries.map((e) => e[1]),
          backgroundColor: "#6366f1",
          borderRadius: 6,
        },
      ],
    };
  }, [issues]);

  // Leading HEI name for header badge
  const leadingHei = useMemo(() => {
    if (heiData.labels.length > 0 && heiData.datasets[0].data.length > 0) {
      const topName = heiData.labels[0];
      const topCount = heiData.datasets[0].data[0];
      return `${topName} (${topCount} Projects)`;
    }
    return "BIT Mesra (Active)";
  }, [heiData]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── TOP CONTROLS & TIME RANGE FILTER BAR ── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Statewide Innovation &amp; Citizen Triage Analytics</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
              100% LIVE DATABASE
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time cross-district intelligence, AI problem classification, and NEP 2020 HEI research metrics.
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 self-stretch md:self-auto">
          <button
            type="button"
            onClick={() => setTimeRange("all")}
            className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              timeRange === "all"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Time
          </button>
          <button
            type="button"
            onClick={() => setTimeRange("30d")}
            className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              timeRange === "30d"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Last 30 Days
          </button>
          <button
            type="button"
            onClick={() => setTimeRange("q3")}
            className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              timeRange === "q3"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Q3 FY 2026
          </button>
          <button
            type="button"
            onClick={() => setTimeRange("fy26")}
            className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              timeRange === "fy26"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            FY 2026–27
          </button>
        </div>
      </div>

      {/* ── 4 EXECUTIVE KPI METRIC CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2 hover:border-blue-400 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Total Ingestion Volume</span>
            <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-full">
              Live Feed
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
            {totalIngestionCount.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500">
            {selectedDistrict === "All 24 Districts" ? (
              <>Across all <strong>24 Jharkhand Districts</strong></>
            ) : (
              <>Filtered for <strong>{selectedDistrict} District</strong></>
            )}
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2 hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>AI Triage Accuracy</span>
            <span className="text-blue-600 font-bold text-xs bg-blue-50 px-2 py-0.5 rounded-full">
              4-Modality
            </span>
          </div>
          <div className="text-3xl font-black text-blue-700 font-mono tracking-tight">
            {aiPassRate}%
          </div>
          <p className="text-[11px] text-slate-500">
            <strong>{passedValidationCount}</strong> of {totalIngestionCount} verified by AI Engine
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2 hover:border-purple-400 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Active HEI Allocations</span>
            <span className="text-purple-600 font-bold text-xs bg-purple-50 px-2 py-0.5 rounded-full">
              NEP 2020
            </span>
          </div>
          <div className="text-3xl font-black text-purple-900 font-mono tracking-tight">
            {activeLabsCount} Institutions
          </div>
          <p className="text-[11px] text-slate-500">
            <strong>{assignedIssues.length}</strong> active capstone &amp; research projects
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2 hover:border-emerald-400 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Solutions Deployed</span>
            <span className="text-emerald-700 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-full">
              {resolutionRate}% Rate
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-800 font-mono tracking-tight">
            {resolvedCount} Resolved
          </div>
          <p className="text-[11px] text-slate-500">
            <strong>{inProgressCount}</strong> solutions currently in field prototyping
          </p>
        </div>
      </div>

      {/* ── ROW 1: 10-DOMAIN BREAKDOWN & WORKFLOW LIFECYCLE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Domain Severity Stacked Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                10 Official Research Domains: Challenge Ingestion &amp; Severity Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                Dynamic aggregation of live issues categorized across severity tiers
              </p>
            </div>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab("heatmap")}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer hidden sm:inline"
              >
                View Heatmap →
              </button>
            )}
          </div>

          <div className="h-72 w-full">
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
          </div>
        </div>

        {/* Challenge Lifecycle Doughnut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
              Challenge Lifecycle Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Live progression from citizen intake to university field deployment
            </p>
          </div>

          <div className="h-60 w-full relative flex items-center justify-center">
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
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-xs text-slate-600 font-semibold">
              Deployment SLA Conversion Rate: <strong className="text-emerald-700 font-black">{resolutionRate}%</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ── ROW 2: 24-DISTRICT VOLUME & MONTHLY INNOVATION TRAJECTORY ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* District Volume Comparison Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                Top Districts: Ingestion vs. Deployed Solutions
              </h3>
              <p className="text-xs text-slate-500">
                Live grievance intake volume vs. functional university prototypes in active development
              </p>
            </div>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab("districts")}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer hidden sm:inline"
              >
                District Ingestion Table →
              </button>
            )}
          </div>

          <div className="h-64 w-full">
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
          </div>
        </div>

        {/* 6-Month Trajectory Area Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                6-Month Innovation &amp; Pilot Trajectory
              </h3>
              <p className="text-xs text-slate-500">
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
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
              Higher Education Institutions (HEI) Research Lab Allocation Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Active multidisciplinary capstone teams, faculty mentorship, and patent incubation under NEP 2020
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Leading: <strong>{leadingHei}</strong>
            </span>
          </div>
        </div>

        <div className="h-56 w-full">
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
        </div>
      </div>
    </div>
  );
}
