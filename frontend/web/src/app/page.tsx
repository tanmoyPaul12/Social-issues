"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SiteNavbar } from "@/components/common/SiteNavbar";

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

const SCENARIOS: (ScenarioData & { domain: ResearchDomain })[] = [];

const SAMPLE_TICKETS: Record<string, TicketRecord> = {};

export default function LandingPage() {
  const [activeRole] = useState<RoleType>("citizen");
  const [selectedScenario, setSelectedScenario] = useState<ScenarioData | null>(null);
  const [ticketInput, setTicketInput] = useState("");
  const [activeTicketModal, setActiveTicketModal] = useState<TicketRecord | null>(null);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState("All");

  const handleTrackTicket = (idToTrack?: string) => {
    const searchId = (idToTrack || ticketInput).trim().toUpperCase();
    if (!searchId) return;

    if (SAMPLE_TICKETS[searchId]) {
      setActiveTicketModal(SAMPLE_TICKETS[searchId]);
    } else {
      // Dynamic fallback for any ticket ID entered
      setActiveTicketModal({
        id: searchId,
        district: "Ranchi",
        title: "Grassroots Innovation Request: " + searchId,
        category: "Cross-Disciplinary Community Challenge",
        submittedBy: "Verified Citizen Contributor",
        date: "Recent",
        status: "Under AI Triage",
        progress: 35,
        assignedInstitute: "Jharkhand University R&D Consortium",
        leadInvestigator: "Pending Lab Matching",
        csrPartner: "Govt Innovation Sandbox",
        grantAmount: "Evaluation in progress",
        aiSummary:
          "Ticket is undergoing automated NLP classification, duplicate grouping, and multi-criteria research capability mapping.",
        timeline: [
          {
            title: "Problem Logged in System",
            date: "Today",
            done: true,
            desc: "Recorded in Jharkhand Grassroots Registry.",
          },
          {
            title: "AI Semantic Structuring",
            date: "In Progress",
            done: true,
            desc: "Categorizing technical scope and estimating research complexity.",
          },
          {
            title: "HEI Faculty Review & Allocation",
            date: "Upcoming (48h)",
            done: false,
            desc: "Matching with leading engineering and scientific faculty across Jharkhand.",
          },
        ],
      });
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
          3. HERO SECTION (MATCHING THE DESIGN IMAGE PLAN)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 text-center overflow-hidden bg-gradient-to-b from-[#f8fafc] via-[#fbfcfd] to-white">
        {/* Subtle decorative background ambient orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[360px] bg-gradient-to-tr from-blue-100/30 via-emerald-100/20 to-teal-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb] text-[11.5px] sm:text-xs font-bold tracking-wide uppercase shadow-2xs mb-8 transition-transform hover:scale-102">
            <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span>NEP 2020 ALIGNED INNOVATION ECOSYSTEM • SIH-1831</span>
          </div>

          {/* Main Huge Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight text-[#090e1a] leading-[1.12]">
            Connecting Jharkhand&apos;s
            <br />
            Grassroots Problems to
            <br />
            <span className="inline-block mt-3 px-6 py-1.5 rounded-2xl bg-[#dcfce7] border border-[#86efac] text-[#047857] shadow-xs">
              University R&amp;D
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-[19px] text-slate-600 max-w-2xl sm:max-w-3xl mx-auto mt-7 leading-relaxed font-normal">
            An AI-orchestrated pipeline turning citizen challenges into multidisciplinary
            university research projects with startup prototyping and industry CSR funding
            across all 24 districts.
          </p>

          {/* CTA Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-8">
            <Link
              href="/auth/login"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#080d1a] hover:bg-slate-900 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md hover:shadow-xl transition-all group active:scale-95 cursor-pointer"
            >
              <span>Submit Grassroots Problem</span>
              <span className="transition-transform group-hover:translate-x-1 font-bold">→</span>
            </Link>

            <button
              onClick={() => {
                const searchEl = document.getElementById("ticket-search-input");
                searchEl?.focus();
              }}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-800 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span>Track Resolution Ticket</span>
            </button>
          </div>

          {/* Ticket ID Interactive Search Bar */}
          <div className="mt-8 max-w-xl mx-auto">
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
                onChange={(e) => setTicketInput(e.target.value)}
                placeholder="Enter Ticket ID (e.g. JH-2026-00784)..."
                className="w-full bg-transparent text-sm font-mono text-slate-800 placeholder-slate-400 outline-none"
              />

              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#1d63ed] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex-shrink-0 cursor-pointer"
              >
                Track
              </button>
            </form>

            {/* Quick Ticket Pill Triggers */}
            <div className="flex items-center justify-center flex-wrap gap-2 mt-3 text-[11px] text-slate-500">
              <span>Active District Tracking:</span>
              <button
                onClick={() => {
                  setTicketInput("JH-2026-00784");
                  handleTrackTicket("JH-2026-00784");
                }}
                className="text-blue-600 hover:underline font-mono font-medium bg-blue-50 px-2 py-0.5 rounded-md"
              >
                JH-2026-00784 (Dumka)
              </button>
              <button
                onClick={() => {
                  setTicketInput("JH-2026-01429");
                  handleTrackTicket("JH-2026-01429");
                }}
                className="text-blue-600 hover:underline font-mono font-medium bg-blue-50 px-2 py-0.5 rounded-md"
              >
                JH-2026-01429 (Gumla)
              </button>
              <button
                onClick={() => {
                  setTicketInput("JH-2026-02105");
                  handleTrackTicket("JH-2026-02105");
                }}
                className="text-blue-600 hover:underline font-mono font-medium bg-blue-50 px-2 py-0.5 rounded-md"
              >
                JH-2026-02105 (Dhanbad)
              </button>
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
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-extrabold tracking-widest text-emerald-600 uppercase bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            END-TO-END INNOVATION PIPELINE
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 tracking-tight">
            How a Grassroots Complaint Becomes a Working University Solution
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Transforming unstructured citizen challenges across Jharkhand into funded academic R&amp;D,
            patentable prototypes, and district-level CSR deployments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            {
              step: "01",
              title: "Grassroots Ingestion",
              desc: "Citizens submit voice notes, photos or SMS in Santhali, Hindi, Bengali or Ho without advance signup.",
              iconPath: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z",
              badge: "Vernacular NLP",
            },
            {
              step: "02",
              title: "AI Triage & Clustering",
              desc: "Engine de-duplicates identical village issues and extracts research-grade problem statements.",
              iconPath: "M13 10V3L4 14h7v7l9-11h-7z",
              badge: "Semantic Engine",
            },
            {
              step: "03",
              title: "University R&D Match",
              desc: "Allocated to faculty & student labs at BIT Mesra, IIT ISM, NIT Jamshedpur under NEP 2020.",
              iconPath: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
              badge: "18 HEI Labs",
            },
            {
              step: "04",
              title: "Rapid Prototyping",
              desc: "M.Tech / B.Tech / PhD capstone build working IoT, Agri, or Bio-Remediation hardware.",
              iconPath: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
              badge: "Testbed Sandbox",
            },
            {
              step: "05",
              title: "Industry CSR Grant",
              desc: "Tata Steel, Coal India, JSPL & NABARD fund village-scale manufacturing.",
              iconPath: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
              badge: "₹4.2 Cr Pipeline",
            },
            {
              step: "06",
              title: "District Rollout",
              desc: "District Commissioners deploy validated solutions with live citizen impact tracking.",
              iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
              badge: "24 Districts",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-center justify-between text-slate-400 font-mono text-xs font-bold mb-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                    {item.step}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.iconPath} />
                    </svg>
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{item.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              </div>
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
                Active Grassroots Challenges &amp; Assigned University Labs
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
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    selectedFilterCategory === cat
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid or Clean Live Registry State */}
          {SCENARIOS.filter((item) =>
            selectedFilterCategory === "All" ? true : item.domain === selectedFilterCategory
          ).length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-xs">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-base font-black text-slate-900">Grassroots Problem Statement Registry</h3>
              <p className="text-xs text-slate-500 max-w-lg mx-auto mt-1 mb-5 leading-relaxed">
                As verified citizens and local panchayats log grassroots problems across Jharkhand&apos;s 24 districts, they are processed by the State AI clustering engine and published here with real-time academic lab matches.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <span>Submit Grassroots Problem →</span>
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
              {SCENARIOS.filter((item) =>
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
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#111c38] flex items-center justify-center text-[#fbbf24] font-bold">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-black text-sm">GOVERNMENT OF JHARKHAND</p>
                <p className="text-slate-400 text-[11px]">Department of Higher &amp; Technical Education</p>
              </div>
            </div>
            <p className="text-slate-400 text-xs mt-3 max-w-md leading-relaxed">
              SIH-1831: NEP 2020 Aligned Innovation Ecosystem uniting grassroots citizens,
              engineering faculty, and CSR funding for rapid local impact.
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
                        className={`absolute left-[11px] top-6 w-[2px] h-full ${
                          step.done ? "bg-emerald-400" : "bg-slate-200"
                        }`}
                      />
                    )}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 z-10 ${
                        step.done
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
