"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SiteNavbar } from "@/components/common/SiteNavbar";
import { JharkhandHeroMap } from "@/components/landing/JharkhandHeroMap";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

// Types
type RoleType = "citizen" | "officer" | "university" | "industry";

interface ScenarioData {
  id: string;
  title: string;
  tag: string;
  district: string;
  problem: string;
  aiClustering: string;
  assignedTo: string;
  funding: string;
  stage: string;
  stageProgress: number;
  impact: string;
  ticketId: string;
}

interface TicketRecord {
  id: string;
  district: string;
  title: string;
  category: string;
  submittedBy: string;
  date: string;
  status: "Under AI Triage" | "Assigned to Lab" | "Prototype Testing" | "Field Deployment" | "Resolved";
  progress: number;
  assignedInstitute: string;
  leadInvestigator: string;
  csrPartner: string;
  grantAmount: string;
  aiSummary: string;
  timeline: { title: string; date: string; done: boolean; desc: string }[];
}

export const OFFICIAL_RESEARCH_DOMAINS = [
  "Education",
  "Agriculture",
  "Healthcare",
  "Water Resources",
  "Environment",
  "Energy",
  "Urban Development",
  "Accessibility",
  "Public Administration",
  "Rural Livelihoods",
] as const;

export type ResearchDomain = (typeof OFFICIAL_RESEARCH_DOMAINS)[number];

const SECTOR_TO_DOMAIN_MAP: Record<string, ResearchDomain> = {
  WATER: "Water Resources",
  HEALTH: "Healthcare",
  EDUCATION: "Education",
  INFRASTRUCTURE: "Urban Development",
  AGRICULTURE: "Agriculture",
  ELECTRICITY: "Energy",
  SANITATION: "Accessibility",
  LIVELIHOOD: "Rural Livelihoods",
  ENVIRONMENT: "Environment",
  GOVERNANCE: "Public Administration",
  OTHER: "Rural Livelihoods"
};

export default function LandingPage() {
  const [activeRole] = useState<RoleType>("citizen");
  const [scenarios, setScenarios] = useState<(ScenarioData & { domain: ResearchDomain })[]>([]);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioData | null>(null);
  const [ticketInput, setTicketInput] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [activeTicketModal, setActiveTicketModal] = useState<TicketRecord | null>(null);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState("All");

  useEffect(() => {
    async function loadChallenges() {
      setIsLoadingChallenges(true);
      try {
        const res = await fetch(`${API_BASE_URL}/issues?page=0&size=20&sortBy=createdAt&sortDir=desc`);
        if (res.ok) {
          const data = await res.json();
          const items = data.content || [];
          if (Array.isArray(items) && items.length > 0) {
            const mapped: (ScenarioData & { domain: ResearchDomain })[] = items.map((item: any) => {
              const domain: ResearchDomain = SECTOR_TO_DOMAIN_MAP[item.sector] || "Rural Livelihoods";
              const progress =
                item.status === "RESOLVED"
                  ? 100
                  : item.status === "IN_PROGRESS"
                  ? 65
                  : item.status === "ASSIGNED_HEI"
                  ? 40
                  : 20;
              const stage =
                item.status === "RESOLVED"
                  ? "Field Deployment & Impact"
                  : item.status === "IN_PROGRESS"
                  ? "Lab Prototype Testing"
                  : item.status === "ASSIGNED_HEI"
                  ? "Assigned to University Lab"
                  : "Under AI Triage";
              const funding =
                item.status === "RESOLVED" || item.status === "IN_PROGRESS"
                  ? "Govt Grant & CSR Supported"
                  : "Sandbox Under Review";
              const ticketId = item.issueNumber || `JH-${item.id}`;
              return {
                id: String(item.id),
                title: item.title,
                tag: domain,
                domain,
                district: item.district || "Jharkhand",
                problem: item.snippet || item.description || item.title,
                aiClustering: item.validationStatus || "PASS",
                assignedTo: item.assignedHEI || "Matching University Lab (AI Triage)",
                funding,
                stage,
                stageProgress: progress,
                impact: `Est. ${item.affectedPopulation || 1200}+ Citizens`,
                ticketId,
              };
            });
            setScenarios(mapped);
          }
        }
      } catch (e) {
        console.warn("Could not fetch challenges for landing page:", e);
      } finally {
        setIsLoadingChallenges(false);
      }
    }
    loadChallenges();
  }, []);

  const handleTrackTicket = async (idToTrack?: string) => {
    const searchId = (idToTrack || ticketInput).trim().toUpperCase();
    if (!searchId) return;

    setIsTracking(true);
    setTrackError(null);

    try {
      let res = await fetch(`${API_BASE_URL}/issues/ticket/${encodeURIComponent(searchId)}`);
      if (!res.ok) {
        res = await fetch(`${API_BASE_URL}/issues/number/${encodeURIComponent(searchId)}`);
      }
      if (!res.ok && !isNaN(Number(searchId))) {
        res = await fetch(`${API_BASE_URL}/issues/${encodeURIComponent(searchId)}`);
      }

      if (res.ok) {
        const data = await res.json();
        const domainName = SECTOR_TO_DOMAIN_MAP[data.sector] || data.sector || "Grassroot Need";
        const progress =
          data.status === "RESOLVED"
            ? 100
            : data.status === "IN_PROGRESS"
            ? 75
            : data.status === "ASSIGNED_HEI"
            ? 50
            : 25;

        let statusLabel: TicketRecord["status"] = "Under AI Triage";
        if (data.status === "RESOLVED") statusLabel = "Resolved";
        else if (data.status === "IN_PROGRESS") statusLabel = "Prototype Testing";
        else if (data.status === "ASSIGNED_HEI") statusLabel = "Assigned to Lab";

        const formattedDate = data.createdAt
          ? new Date(data.createdAt).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Recent";

        const timeline = [
          {
            title: "Problem Logged in System",
            date: formattedDate,
            done: true,
            desc: "Recorded in Jharkhand Grassroots Registry.",
          },
          {
            title: "AI Semantic Structuring & Validation",
            date: data.validationStatus ? "Validated" : "In Progress",
            done: Boolean(data.validationStatus && data.validationStatus !== "PENDING"),
            desc: `Categorized under ${domainName}. AI Validation: ${data.validationStatus || "PASS"}.`,
          },
          {
            title: "University Lab Allocation & R&D",
            date: data.assignedHEI ? "Assigned" : "Pending Match",
            done: Boolean(
              data.assignedHEI ||
                data.status === "ASSIGNED_HEI" ||
                data.status === "IN_PROGRESS" ||
                data.status === "RESOLVED"
            ),
            desc: data.assignedHEI
              ? `Allocated to ${data.assignedHEI}`
              : "Matching with leading state university faculty & labs across Jharkhand.",
          },
          {
            title: "Field Deployment & Resolution",
            date: data.resolvedAt
              ? new Date(data.resolvedAt).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Pending",
            done: data.status === "RESOLVED",
            desc:
              data.status === "RESOLVED"
                ? "Solution verified and deployed in community."
                : "Field validation and final deployment in progress.",
          },
        ];

        setActiveTicketModal({
          id: data.issueNumber || `JH-${data.id}`,
          district: data.district || "Jharkhand",
          title: data.title,
          category: domainName,
          submittedBy:
            data.submitterName || (data.isAnonymous ? "Anonymous Citizen" : "Verified Citizen"),
          date: formattedDate,
          status: statusLabel,
          progress: progress,
          assignedInstitute: data.assignedHEI || "Matching State University Lab",
          leadInvestigator: data.assignedHEI
            ? `${data.assignedHEI} Principal Investigator`
            : "Pending Lab Matching",
          csrPartner: data.fundingPartner || "State Innovation Sandbox / CSR",
          grantAmount:
            data.status === "IN_PROGRESS" || data.status === "RESOLVED"
              ? "Grant Allocated"
              : "Evaluation in progress",
          aiSummary:
            data.description ||
            "Ticket is undergoing automated NLP classification, duplicate grouping, and multi-criteria research capability mapping.",
          timeline,
        });
      } else {
        setTrackError(
          `Ticket "${searchId}" was not found in the official registry. Please verify the ticket number and try again.`
        );
      }
    } catch (err) {
      console.error("Error tracking ticket:", err);
      setTrackError("Unable to reach the registry server. Please try again in a moment.");
    } finally {
      setIsTracking(false);
    }
  };

  // Role info mapping
  const roleDisplayInfo = {
    citizen: {
      portalBadge: "Citizen Portal",
      userName: "Ramesh Soren",
      userRole: "CITIZEN",
      accent: "#10b981",
    },
    officer: {
      portalBadge: "Officer Portal",
      userName: "Rajeev Ranjan IAS",
      userRole: "DISTRICT MAGISTRATE",
      accent: "#3b82f6",
    },
    university: {
      portalBadge: "Academic Portal",
      userName: "Dr. Animesh Sinha",
      userRole: "BIT MESRA • DEPT CSE",
      accent: "#8b5cf6",
    },
    industry: {
      portalBadge: "Industry CSR Portal",
      userName: "Priya Sharma",
      userRole: "TATA STEEL CSR LEAD",
      accent: "#f59e0b",
    },
  };

  return (
    <div className="min-h-screen bg-[#fbfcfd] text-[#090e1a] flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* ─────────────────────────────────────────────────────────────
          ENTERPRISE NAVBAR: CO-PARTNERS, OPPORTUNITIES, SEGMENTS, EVENTS
      ───────────────────────────────────────────────────────────── */}
      <SiteNavbar />

      {/* ─────────────────────────────────────────────────────────────
          3. HERO SECTION (RESPONSIVE TWO-COLUMN LAYOUT WITH JHARKHAND MAP)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-8 sm:pt-12 pb-14 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#f8fafc] via-[#fbfcfd] to-white">
        {/* Subtle decorative background ambient orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-blue-100/30 via-emerald-100/20 to-indigo-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Narrative & Action Controls (Centered on mobile, Left-aligned on Desktop/Laptop) */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              {/* Top Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200/90 bg-white/90 backdrop-blur-sm text-slate-700 text-xs shadow-2xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="font-bold text-slate-900 tracking-tight">NEP 2020 Aligned</span>
                <span className="text-slate-300 font-light">|</span>
                <span className="text-slate-600 font-medium">Jharkhand Innovation Ecosystem</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3.5xl sm:text-4.5xl lg:text-[46px] xl:text-[52px] font-black tracking-tight text-[#090e1a] leading-[1.12]">
                Connecting Jharkhand&apos;s
                <br />
                Real-World Challenges to
                <br />
                <span className="inline-block mt-2.5 px-5 py-1.5 rounded-2xl bg-[#dcfce7] border border-[#86efac] text-[#047857] shadow-xs">
                  University R&amp;D
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base lg:text-[17.5px] text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Empowering citizens to report local challenges, and connecting them directly with
                universities, startups, and industries to build funded, real-world solutions
                across all 24 districts of Jharkhand.
              </p>

              {/* Primary Action Button */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-1">
                <Link
                  href="/auth/login"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#080d1a] hover:bg-slate-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md hover:shadow-xl transition-all group active:scale-95 cursor-pointer"
                >
                  <span>Submit Community Challenge</span>
                  <span className="transition-transform group-hover:translate-x-1 font-bold">→</span>
                </Link>
              </div>

              {/* Ticket ID Interactive Search Bar */}
              <div className="max-w-lg mx-auto lg:mx-0 pt-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleTrackTicket();
                  }}
                  className="bg-white border border-slate-200/90 hover:border-blue-300 focus-within:border-blue-500 rounded-full p-1.5 pl-4 sm:pl-5 flex items-center gap-2.5 shadow-xs transition-all"
                >
                  <svg
                    className="w-4 h-4 text-slate-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>

                  <input
                    id="ticket-search-input"
                    type="text"
                    value={ticketInput}
                    onChange={(e) => {
                      setTicketInput(e.target.value);
                      if (trackError) setTrackError(null);
                    }}
                    placeholder="Enter Ticket ID (e.g. JH-2026-00784)..."
                    className="w-full bg-transparent text-xs sm:text-sm font-mono text-slate-800 placeholder-slate-400 outline-none"
                  />

                  <button
                    type="submit"
                    disabled={isTracking}
                    className="px-4 py-2 rounded-full bg-[#1d63ed] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex-shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
                  >
                    {isTracking ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      <span>Track</span>
                    )}
                  </button>
                </form>

                {/* Track Error Alert */}
                {trackError && (
                  <div className="mt-2.5 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-left">
                    <svg className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1 text-xs text-red-700 font-medium">
                      {trackError}
                    </div>
                    <button
                      onClick={() => setTrackError(null)}
                      className="text-red-500 hover:text-red-800 text-xs font-bold"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Quick Ticket Pill Triggers */}
                <div className="flex items-center justify-center lg:justify-start flex-wrap gap-1.5 mt-2.5 text-[11px] text-slate-500">
                  <span>Active District Tracking:</span>
                  {(scenarios.length > 0 ? scenarios.slice(0, 3) : [
                    { ticketId: "JH-2026-00784", district: "Dumka" },
                    { ticketId: "JH-2026-01429", district: "Gumla" },
                    { ticketId: "JH-2026-02105", district: "Dhanbad" }
                  ]).map((item) => (
                    <button
                      key={item.ticketId}
                      onClick={() => {
                        setTicketInput(item.ticketId);
                        handleTrackTicket(item.ticketId);
                      }}
                      className="text-blue-600 hover:underline font-mono font-medium bg-blue-50 px-2 py-0.5 rounded-md cursor-pointer"
                    >
                      {item.ticketId} ({item.district})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Jharkhand Innovation Grid Map (Hidden on mobile, Visible on laptop/desktop & tablet) */}
            <div className="hidden lg:flex lg:col-span-5 items-center justify-center">
              <JharkhandHeroMap />
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            4. FOUR STATISTIC CARDS (MATCHING THE IMAGE)
        ───────────────────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto mt-14 px-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {/* Card 1: Citizen Submissions */}
            <div className="bg-white border border-slate-200/70 hover:border-emerald-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                  CITIZEN SUBMISSIONS
                </span>
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-3 tracking-tight">
                2,451
              </div>
              <div className="text-xs text-slate-400 font-medium mt-1">Across 24 Districts</div>
            </div>

            {/* Card 2: Universities (HEIs) */}
            <div className="bg-white border border-slate-200/70 hover:border-blue-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                  UNIVERSITIES (HEIS)
                </span>
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 14l9-5-9-5-9 5 9 5z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-3 tracking-tight">
                18
              </div>
              <div className="text-xs text-slate-400 font-medium mt-1">BIT, NIT, IIT (ISM)...</div>
            </div>

            {/* Card 3: Active R&D Projects */}
            <div className="bg-white border border-slate-200/70 hover:border-purple-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                  ACTIVE R&amp;D PROJECTS
                </span>
                <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-3 tracking-tight">
                142
              </div>
              <div className="text-xs text-slate-400 font-medium mt-1">Prototypes &amp; Pilots</div>
            </div>

            {/* Card 4: Industry & CSR */}
            <div className="bg-white border border-slate-200/70 hover:border-amber-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                  INDUSTRY &amp; CSR
                </span>
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-3 tracking-tight">
                ₹4.2 Cr
              </div>
              <div className="text-xs text-slate-400 font-medium mt-1">Impacted Citizens</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. HOW THE PIPELINE WORKS: 6-STAGE ENGINE
      ───────────────────────────────────────────────────────────── */}
      <section id="pipeline-section" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-100 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
            HOW IT WORKS
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tracking-tight">
            How Your Reported Issue Gets Solved
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-2 max-w-xl mx-auto">
            From community submission to university R&amp;D, prototype testing, and ground deployment.
          </p>
        </div>

        {/* ── Modern Tech Minimal Process Flow ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {[
            {
              step: "01",
              title: "Report a Local Problem",
              desc: "Citizens, panchayats, and community members submit issues faced in their villages or towns—such as water scarcity, crop storage, or rural healthcare—using simple text, photos, or voice notes in regional languages.",
              iconPath: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z",
            },
            {
              step: "02",
              title: "Verified & Published",
              desc: "The submitted issue is verified, enriched with district geolocation data, and converted into an open, research-grade problem statement published on the Jharkhand Innovation Registry for public visibility.",
              iconPath: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
            },
            {
              step: "03",
              title: "Colleges Adopt R&D Projects",
              desc: "Professors, engineering departments, and university student teams choose the challenge as an academic capstone, final-year thesis, or applied R&D project aligned with NEP 2020 experiential learning.",
              iconPath: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
            },
            {
              step: "04",
              title: "Build & Test Solutions",
              desc: "Student innovators, university incubation labs, and startup teams design, build, and test practical physical prototypes, IoT systems, or software models in real-world field conditions.",
              iconPath: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
            },
            {
              step: "05",
              title: "Industry Grants & Mentorship",
              desc: "Leading industrial enterprises, MSMEs, and CSR organizations evaluate working prototypes to provide financial grants, technical mentorship, pilot testbeds, and production funding.",
              iconPath: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
            },
            {
              step: "06",
              title: "District-Wide Deployment",
              desc: "The validated, industry-backed solution is manufactured and rolled out across the affected district by local administrations, solving the problem and delivering measurable community impact.",
              iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="flex flex-col items-start text-left group"
            >
              {/* Header: Icon + Step Indicator */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-center text-slate-700 shadow-2xs group-hover:border-slate-400 group-hover:text-slate-900 group-hover:bg-slate-100 transition-all">
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={item.iconPath} />
                  </svg>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Step {item.step}
                </span>
              </div>

              {/* Step Title */}
              <h3 className="font-bold text-slate-900 text-base leading-snug">
                {item.title}
              </h3>

              {/* Comprehensive Description */}
              <p className="text-xs sm:text-[13px] text-slate-500 mt-2 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. LIVE DISTRICT CHALLENGES & AI MATCH FEED
      ───────────────────────────────────────────────────────────── */}
      <section id="challenges-feed" className="py-14 px-4 sm:px-6 lg:px-8 bg-slate-50/60 border-t border-slate-200/70 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-extrabold tracking-widest text-blue-600 uppercase bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                LIVE ECOSYSTEM FEED
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
                Active Community Challenges &amp; Assigned University Labs
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Real-time problem statements submitted across Jharkhand districts.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center flex-wrap gap-1.5">
              {["All", ...OFFICIAL_RESEARCH_DOMAINS].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedFilterCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${selectedFilterCategory === cat
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid, Loading Skeletons, or Clean Live Registry State */}
          {isLoadingChallenges ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs animate-pulse space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-24 bg-slate-200 rounded-full" />
                    <div className="h-4 w-28 bg-slate-200 rounded" />
                  </div>
                  <div className="h-6 w-3/4 bg-slate-200 rounded" />
                  <div className="h-12 w-full bg-slate-100 rounded" />
                  <div className="h-16 w-full bg-slate-100 rounded-xl" />
                  <div className="h-9 w-full bg-slate-200 rounded-xl" />
                </div>
              ))}
            </div>
          ) : scenarios.filter((item) =>
            selectedFilterCategory === "All" ? true : item.domain === selectedFilterCategory
          ).length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-xs">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-base font-black text-slate-900">Community Problem Statement Registry</h3>
              <p className="text-xs text-slate-500 max-w-lg mx-auto mt-1 mb-5 leading-relaxed">
                As verified citizens and local panchayats log community challenges across Jharkhand&apos;s 24 districts, they are processed by the State AI clustering engine and published here with real-time academic lab matches.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <span>Submit Community Challenge →</span>
                </Link>
                <Link
                  href="/onboarding/university"
                  className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs inline-flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <span>Register University Lab</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {scenarios.filter((item) =>
                selectedFilterCategory === "All" ? true : item.domain === selectedFilterCategory
              ).map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{item.district}</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {item.ticketId}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{item.problem}</p>

                    <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                      <div>
                        <span className="text-slate-400 font-medium">Assigned R&amp;D Institute:</span>
                        <p className="font-bold text-slate-800">{item.assignedTo}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">CSR &amp; Grant:</span>
                        <p className="font-semibold text-emerald-700">{item.funding}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5">
                      <span>{item.stage}</span>
                      <span>{item.stageProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700"
                        style={{ width: `${item.stageProgress}%` }}
                      />
                    </div>
                    <button
                      onClick={() => {
                        setTicketInput(item.ticketId);
                        handleTrackTicket(item.ticketId);
                      }}
                      className="w-full mt-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold text-center transition-all cursor-pointer"
                    >
                      View Deep Resolution Timeline →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. INSTITUTIONAL NETWORK (HEIs & CSR LEADERS)
      ───────────────────────────────────────────────────────────── */}
      <section id="institutions-section" className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center scroll-mt-20">
        <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">
          ACADEMIC R&amp;D CONSORTIUM &amp; STRATEGIC CSR PARTNERS
        </span>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 mt-6 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all">
          <div className="font-black text-slate-700 text-base tracking-tight flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-blue-900 text-white flex items-center justify-center text-xs font-bold">
              IIT
            </span>
            IIT (ISM) DHANBAD
          </div>
          <div className="font-black text-slate-700 text-base tracking-tight flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-red-800 text-white flex items-center justify-center text-xs font-bold">
              BIT
            </span>
            BIT MESRA
          </div>
          <div className="font-black text-slate-700 text-base tracking-tight flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
              NIT
            </span>
            NIT JAMSHEDPUR
          </div>
          <div className="font-black text-slate-700 text-base tracking-tight flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-800 text-white flex items-center justify-center text-xs font-bold">
              BAU
            </span>
            BIRSA AGRI UNIVERSITY
          </div>
          <div className="font-black text-slate-700 text-base tracking-tight flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-blue-700 text-white flex items-center justify-center text-xs font-bold">
              TATA
            </span>
            TATA STEEL FOUNDATION
          </div>
          <div className="font-black text-slate-700 text-base tracking-tight flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-amber-700 text-white flex items-center justify-center text-xs font-bold">
              CIL
            </span>
            COAL INDIA CSR
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. FOOTER
      ───────────────────────────────────────────────────────────── */}
      <footer className="mt-auto bg-[#070b13] border-t border-[#1b2434] text-slate-400 text-xs py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-13 shrink-0 flex items-center justify-center pt-0.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/emblem.png"
                  alt="State Emblem of India"
                  className="w-full h-full object-contain filter brightness-0 invert opacity-95"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-white font-black text-sm sm:text-[15px] leading-snug tracking-tight">
                  झारखंड विज्ञान, प्रौद्योगिकी और नवाचार पोर्टल
                </span>
                <span className="text-slate-200 font-bold text-xs sm:text-[13px] leading-tight mt-0.5">
                  Jharkhand Science, Technology and Innovation Portal
                </span>
                <span className="text-slate-400 text-[11px] mt-1">
                  Department of Higher &amp; Technical Education, Government of Jharkhand
                </span>
              </div>
            </div>
            <p className="text-slate-400 text-xs mt-3.5 max-w-md leading-relaxed">
              NEP 2020 Aligned Innovation Ecosystem uniting grassroots citizens,
              university R&amp;D labs, MSMEs, and CSR funding for real district-wide impact.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Direct Portals
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/auth/login"
                  className="hover:text-white transition-colors block"
                >
                  Citizen Problem Submission (Direct)
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    const searchEl = document.getElementById("ticket-search-input");
                    searchEl?.focus();
                    searchEl?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Ticket Resolution Tracking
                </button>
              </li>
              <li>
                <Link href="/onboarding/university" className="hover:text-white transition-colors block">
                  College &amp; University Registration (AISHE)
                </Link>
              </li>
              <li>
                <Link href="/onboarding/industry" className="hover:text-white transition-colors block">
                  Industry &amp; CSR Co-Funding Sandbox
                </Link>
              </li>
              <li>
                <Link href="/onboarding/government" className="hover:text-blue-400 text-blue-300 font-semibold transition-colors block">
                  Government Nodal Officer Onboarding (SSO)
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Emergency &amp; Support
            </h4>
            <p className="text-slate-400">Toll-free Citizen Helpline:</p>
            <p className="text-white font-mono font-bold text-sm mt-0.5">1800-345-6588</p>
            <p className="text-slate-400 mt-2">Email: support-innovation@jharkhand.gov.in</p>
            <p className="text-slate-500 text-[11px] mt-3">
              © 2026 Government of Jharkhand. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: TICKET STATUS & RESOLUTION TIMELINE
      ───────────────────────────────────────────────────────────── */}
      {activeTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveTicketModal(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer"
            >
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                {activeTicketModal.id}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                {activeTicketModal.status}
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-900 mt-2">{activeTicketModal.title}</h3>
            <p className="text-xs text-slate-500 mt-1">
              District: {activeTicketModal.district} • Submitted by: {activeTicketModal.submittedBy} •{" "}
              {activeTicketModal.date}
            </p>

            {/* AI Summary Box */}
            <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-200/80">
              <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs uppercase tracking-wider mb-1">
                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>AI Research Statement &amp; Formulation:</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-normal">
                {activeTicketModal.aiSummary}
              </p>
            </div>

            {/* University & Grant Spec */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  Assigned HEI Lab
                </span>
                <p className="text-xs font-bold text-slate-900 mt-0.5">
                  {activeTicketModal.assignedInstitute}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  CSR / Funding Partner
                </span>
                <p className="text-xs font-bold text-emerald-700 mt-0.5">
                  {activeTicketModal.csrPartner}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  Approved Budget
                </span>
                <p className="text-xs font-mono font-bold text-slate-900 mt-0.5">
                  {activeTicketModal.grantAmount}
                </p>
              </div>
            </div>

            {/* Step-by-Step Resolution Timeline */}
            <div className="mt-5">
              <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-3">
                Lifecycle &amp; Redressal Timeline:
              </h4>

              <div className="space-y-4 pl-2">
                {activeTicketModal.timeline.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 relative">
                    {idx < activeTicketModal.timeline.length - 1 && (
                      <div
                        className={`absolute left-[11px] top-6 w-[2px] h-full ${step.done ? "bg-emerald-400" : "bg-slate-200"
                          }`}
                      />
                    )}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 z-10 ${step.done
                          ? "bg-emerald-500 text-white shadow-xs"
                          : "bg-slate-200 text-slate-500"
                        }`}
                    >
                      {step.done ? (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{step.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({step.date})</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveTicketModal(null)}
                className="px-5 py-2 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
              >
                Close Timeline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 3: SCENARIO DEEP-DIVE DRAWER
      ───────────────────────────────────────────────────────────── */}
      {selectedScenario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedScenario(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer"
            >
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                {selectedScenario.tag}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Ticket: {selectedScenario.ticketId}
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-900 mt-3">{selectedScenario.title}</h3>
            <p className="text-xs text-slate-500 font-semibold">{selectedScenario.district}</p>

            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-3">
              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px]">
                  Grassroots Challenge:
                </span>
                <p className="text-slate-800 mt-0.5">{selectedScenario.problem}</p>
              </div>

              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px]">
                  AI Technology Cluster:
                </span>
                <p className="text-blue-700 font-semibold mt-0.5">{selectedScenario.aiClustering}</p>
              </div>

              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px]">
                  University R&amp;D Team:
                </span>
                <p className="text-slate-900 font-bold mt-0.5">{selectedScenario.assignedTo}</p>
              </div>

              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px]">
                  Measured Community Impact:
                </span>
                <p className="text-emerald-700 font-bold mt-0.5">{selectedScenario.impact}</p>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => {
                  const tId = selectedScenario.ticketId;
                  setSelectedScenario(null);
                  handleTrackTicket(tId);
                }}
                className="flex-1 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs text-center transition-colors"
              >
                Track Live Resolution Timeline
              </button>
              <button
                onClick={() => setSelectedScenario(null)}
                className="px-4 py-2.5 rounded-full border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
