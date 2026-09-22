"use client";

import React, { useState } from "react";
import { RoutedChallenge } from "@/modules/university/types";

interface ChallengeAiDossierCardProps {
  challenge: RoutedChallenge;
  onAccept: (challenge: RoutedChallenge) => void;
  onDecline: (challenge: RoutedChallenge) => void;
}

export function ChallengeAiDossierCard({
  challenge,
  onAccept,
  onDecline,
}: ChallengeAiDossierCardProps) {
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"evidence" | "research-plan" | "files">("evidence");
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("Domain or faculty mentor capacity constraints");

  const clusterCode = challenge.clusterCode || `CHAL-2026-${challenge.ticketId.slice(-4)}`;
  const clusterTitle = challenge.clusterTitle || challenge.title;
  const incidentCount = challenge.clusterIncidentCount || 14;
  const totalPopulation = challenge.clusterTotalPopulation || challenge.affectedPopulation || 8400;
  const districts = challenge.clusterDistricts || [challenge.district, "Palamu"];
  const facilities = challenge.clusterFacilities || [
    `${challenge.block || "Mahuadanr"} Health Clinic (${challenge.district})`,
    `Netarhat Forest Dispensary (${challenge.district})`,
    `Manika Tribal Health Unit (${challenge.district})`,
    `Chhatarpur Rural Clinic (Palamu)`
  ];

  const evidenceList = challenge.clusterEvidence || [
    {
      id: "ev-1",
      ticketId: challenge.ticketId,
      location: `${challenge.district} • ${challenge.block || "Mahuadanr"} (${challenge.villageOrWard || "Gram Area"})`,
      reporter: challenge.citizenName || "Sunita Oraon",
      date: new Date(challenge.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      summary: challenge.description || "Primary Health Sub-Center solar inverter blew out following thunderstorm; night clinic and vaccine cold storage non-operational.",
      originalQuote: challenge.originalText || "Mahuadanr me solar inverter kharab ho gaya hai, clinic me light nahi hai.",
      imageUrl: challenge.imageUrl || undefined,
      status: "VERIFIED_PRIMARY",
      isPrimary: true,
    },
    {
      id: "ev-2",
      ticketId: "GRI-2026-582104",
      location: `${challenge.district} • Netarhat (Dispensary Ward 2)`,
      reporter: "Dr. A. K. Tigga (Medical Officer)",
      date: "Sep 18, 2026",
      summary: "Lightning surge destroyed solar MPPT charge controller module; emergency delivery room forced to rely on kerosene lamps.",
      originalQuote: "Thunderstorm induced high transient voltage through rooftop array, destroying battery charge controller.",
      status: "VERIFIED_FIELD",
      isPrimary: false,
    },
    {
      id: "ev-3",
      ticketId: "GRI-2026-491208",
      location: `${challenge.district} • Manika (Panchayat Bhavan Unit)`,
      reporter: "Rajesh Gope (Gram Pradhan)",
      date: "Sep 12, 2026",
      summary: "Inverter failure during heavy monsoon downpour; standard off-the-shelf commercial replacements continue to fail repeatedly.",
      originalQuote: "Har saal barish me inverter jal jata hai, standard replacement tikti nahi hai.",
      status: "VERIFIED_FIELD",
      isPrimary: false,
    }
  ];

  const handleConfirmAccept = () => {
    setIsAcceptModalOpen(false);
    onAccept(challenge);
  };

  const handleConfirmDecline = () => {
    setIsDeclineModalOpen(false);
    onDecline(challenge);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-slate-300 transition-all text-slate-800">
      {/* 1. Header Bar: Societal Challenge ID, Two-Track Badge, Cluster Scope, Verification */}
      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-mono font-bold text-slate-900 bg-slate-100 border border-slate-300/80 px-2.5 py-1 rounded">
              {clusterCode}
            </span>
            <span className="text-indigo-900 font-bold px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded text-[11px] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              Track B: University Research &amp; Innovation Challenge
            </span>
            <span className="font-bold px-2.5 py-1 border rounded text-[11px] bg-amber-50 text-amber-800 border-amber-200">
              Societal Pattern: {incidentCount} Linked Incidents
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              State Nodal Approved Research Mandate
            </span>
          </div>
        </div>

        {/* 2. Challenge Research Title & Systemic Problem Overview */}
        <div className="space-y-2">
          <h3 className="font-bold text-slate-950 text-base sm:text-lg leading-snug">
            {clusterTitle}
          </h3>
          <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed">
            {challenge.generalizedConsensus?.consensus_reason ||
              `Empirical data shows recurring technical failures across ${districts.join(" and ")} districts impacting ${facilities.length} healthcare facilities and ~${totalPopulation.toLocaleString()} citizens. A robust, generalizable engineering solution is required for statewide multi-site deployment.`}
          </p>
        </div>

        {/* 3. Cluster Scope & Impact Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs border-t border-slate-100">
          <div className="space-y-0.5">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">Regional Cluster</span>
            <p className="font-semibold text-slate-900 truncate">
              {districts.join(" & ")} Districts
            </p>
            <span className="text-[11px] text-slate-500 block">{facilities.length} Linked Health Centers</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">Cluster Impact</span>
            <p className="font-semibold text-slate-900">
              ~{totalPopulation.toLocaleString()} Citizens
            </p>
            <span className="text-[11px] text-slate-500 block">{incidentCount} Ground Petitions</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">Academic Dept</span>
            <p className="font-semibold text-slate-900 truncate">
              {challenge.aiRecommendation?.suggestedDepartment || "Electrical & Electronics"}
            </p>
            <span className="text-[11px] text-slate-500 block">Est. 8–10 Weeks Timeline</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">Student Academic Value</span>
            <p className="font-semibold text-slate-900">
              4 NEP Credits (ABC)
            </p>
            <span className="text-[10px] text-indigo-700 font-medium block">Patent &amp; Startup Track</span>
          </div>
        </div>

        {/* 4. Action Bar & Expand Toggle */}
        <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
            className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 hover:text-blue-900 cursor-pointer py-1"
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isDetailsExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
            <span>
              {isDetailsExpanded
                ? "Hide Research Dossier & Evidence Cluster"
                : `View Research Dossier & ${incidentCount} Cluster Incidents`}
            </span>
          </button>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setIsDeclineModalOpen(true)}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              Decline Challenge
            </button>
            <button
              type="button"
              onClick={() => setIsAcceptModalOpen(true)}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shadow-xs"
            >
              <span>Accept &amp; Form Research Team</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 5. EXPANDABLE SOCIETAL RESEARCH DOSSIER */}
      {isDetailsExpanded && (
        <div className="border-t border-slate-200 bg-[#f8fafc] p-5 sm:p-6 space-y-5">
          {/* Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Institutional R&amp;D Dossier &amp; Ground Evidence:
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("evidence")}
                className={`px-3.5 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "evidence"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span>1. Cluster Evidence Log ({evidenceList.length} Sites)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("research-plan")}
                className={`px-3.5 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "research-plan"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                2. Applied R&amp;D Mandate &amp; Work Plan
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("files")}
                className={`px-3.5 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "files"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span>3. Photos &amp; Inspection Reports</span>
                {(challenge.imageUrl || challenge.pdfUrl) && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>
            </div>
          </div>

          {/* TAB 1: CLUSTER EVIDENCE LOG (GROUND TRUTH INCIDENTS) */}
          {activeTab === "evidence" && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between text-xs pb-1">
                  <span className="font-bold text-slate-900 uppercase tracking-wide">
                    Pattern Analysis: Why This Is a Research Challenge
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    Aggregated by AI Cluster Engine
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Individual citizen complaints are not isolated maintenance tickets—they represent empirical evidence of a broader engineering failure mode across {districts.join(" & ")}. Designing a resilient, patentable solution solves the problem for all {facilities.length} affected facilities at once.
                </p>
              </div>

              {/* List of Evidence Incidents */}
              <div className="space-y-3">
                {evidenceList.map((ev, idx) => (
                  <div
                    key={ev.id || idx}
                    className={`rounded-lg border p-4 text-xs transition-colors ${
                      ev.isPrimary
                        ? "bg-white border-blue-300 ring-1 ring-blue-100"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          Evidence #{idx + 1} ({ev.ticketId})
                        </span>
                        {ev.isPrimary && (
                          <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            Primary Ground Trigger
                          </span>
                        )}
                        <span className="font-semibold text-slate-700">{ev.location}</span>
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Reported by: <strong className="text-slate-800">{ev.reporter}</strong> • {ev.date}
                      </div>
                    </div>

                    <div className="pt-2.5 space-y-2">
                      <p className="text-slate-900 font-medium leading-relaxed">
                        {ev.summary}
                      </p>
                      {ev.originalQuote && (
                        <div className="bg-slate-50 p-2.5 rounded border border-slate-200/80 text-[11.5px] italic text-slate-700">
                          &ldquo;{ev.originalQuote}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: APPLIED R&D MANDATE & TEAM ASSIGNMENT */}
          {activeTab === "research-plan" && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Proposed Generalizable Engineering Architecture
                  </span>
                  <h4 className="font-bold text-slate-950 text-base mt-0.5">
                    {challenge.aiRecommendation?.recommendedTechnology || "Resilient Modular Power Architecture & Field Remediation"}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Assigned College Department: <strong className="text-slate-900">{challenge.aiRecommendation?.suggestedDepartment || "Electrical & Electronics Engineering"}</strong>
                  </p>
                </div>

                {/* Patent & IP Value Box */}
                {challenge.patentPotential && (
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg text-xs space-y-1">
                    <span className="font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Intellectual Property &amp; Patent Opportunity
                    </span>
                    <p className="text-amber-950 font-medium">
                      {challenge.patentPotential}
                    </p>
                  </div>
                )}

                {/* Team Requirements & Budget */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200 text-xs">
                  <div className="space-y-2">
                    <span className="font-bold text-slate-900 uppercase tracking-wide block">
                      Multidisciplinary Research Team:
                    </span>
                    <ul className="space-y-1.5 text-slate-700">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0" />
                        <span><strong>1 Lead Faculty Guide:</strong> Principal Investigator &amp; Mentor</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0" />
                        <span><strong>3 Student Innovators:</strong> Multidisciplinary Cohort (Electrical + IoT + Embedded)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0" />
                        <span><strong>Academic Bank of Credits:</strong> 4 NEP Credits awarded per student</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <span className="font-bold text-slate-900 uppercase tracking-wide block">
                      Core Technical Deliverables:
                    </span>
                    <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2 text-slate-700">
                      <div className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0 mt-1.5" />
                        <div>
                          <strong className="text-slate-900 block text-[11.5px]">Hardware &amp; Circuit Blueprint</strong>
                          <span className="text-slate-600 text-[11px]">Surge-isolated power conditioning &amp; fail-safe bypass design.</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0 mt-1.5" />
                        <div>
                          <strong className="text-slate-900 block text-[11.5px]">Bench Stress Testing &amp; Validation</strong>
                          <span className="text-slate-600 text-[11px]">Departmental lab verification under fluctuating voltage simulations.</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0 mt-1.5" />
                        <div>
                          <strong className="text-slate-900 block text-[11.5px]">Live Field Pilot Installation</strong>
                          <span className="text-slate-600 text-[11px]">On-site deployment across primary health sub-centers in the cluster.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4 Stage Work Plan */}
                <div className="pt-3 border-t border-slate-200 space-y-2.5">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide block">
                    4-Stage Applied R&amp;D Roadmap:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                      <div className="font-bold text-slate-900">Stage 1: Ground Analysis</div>
                      <p className="text-slate-600 text-[11.5px]">Survey primary site in {challenge.district} and collect failure logs across cluster.</p>
                      <span className="text-[10.5px] font-semibold text-slate-500 block pt-1">Weeks 1–2</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                      <div className="font-bold text-slate-900">Stage 2: Lab Prototyping</div>
                      <p className="text-slate-600 text-[11.5px]">Fabricate surge-isolated prototype and run high-voltage bench stress tests.</p>
                      <span className="text-[10.5px] font-semibold text-slate-500 block pt-1">Weeks 3–6</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                      <div className="font-bold text-slate-900">Stage 3: Field Pilot</div>
                      <p className="text-slate-600 text-[11.5px]">Deploy working prototype at {challenge.block || "Mahuadanr"} Clinic &amp; validate performance.</p>
                      <span className="text-[10.5px] font-semibold text-slate-500 block pt-1">Weeks 7–8</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                      <div className="font-bold text-slate-900">Stage 4: Industry Scale</div>
                      <p className="text-slate-600 text-[11.5px]">Pitch to Industry CSR to manufacture and deploy to all {incidentCount} cluster sites.</p>
                      <span className="text-[10.5px] font-semibold text-emerald-800 block pt-1">Weeks 9–10</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PHOTOS & ATTACHED DOCUMENTS */}
          {activeTab === "files" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Photo Evidence */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-900 uppercase tracking-wide">
                    Ground Site Photograph
                  </span>
                  <span className="text-[11px] text-slate-500">Citizen &amp; Nodal Upload</span>
                </div>

                {challenge.imageUrl ? (
                  <div className="space-y-2">
                    <div
                      onClick={() => setIsPhotoModalOpen(true)}
                      className="relative h-48 rounded-lg overflow-hidden border border-slate-200 cursor-pointer group"
                    >
                      <img
                        src={challenge.imageUrl}
                        alt="Evidence"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                        Click to view full photo
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Primary site photo showing damaged power equipment at {challenge.block || "Mahuadanr"} Clinic.
                    </p>
                  </div>
                ) : (
                  <div className="h-40 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
                    <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>No photo uploaded</span>
                  </div>
                )}
              </div>

              {/* Inspection Notes & PDF Reports */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-900 uppercase tracking-wide">
                    Official Cluster Inspection Reports
                  </span>
                  <span className="text-[11px] text-slate-500">Nodal Verification</span>
                </div>

                {challenge.pdfUrl || challenge.pdfFileName ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs shrink-0">
                          PDF
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900 truncate max-w-[200px]">
                            {challenge.pdfFileName || "Cluster_Ground_Inspection_Report.pdf"}
                          </div>
                          <div className="text-[10.5px] text-slate-500">State Nodal Verification Document</div>
                        </div>
                      </div>
                      {challenge.pdfUrl && (
                        <a
                          href={challenge.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded text-xs font-semibold"
                        >
                          Open Document
                        </a>
                      )}
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-xs">
                      <span className="font-bold text-slate-900 text-[11px] uppercase tracking-wide block">
                        Inspection Summary:
                      </span>
                      <p className="text-slate-800 leading-relaxed text-[12px]">
                        {challenge.pdfExtractedText ||
                          `Technical inspection confirms high-voltage atmospheric lightning surge failure across ${districts.join(" & ")} remote health centers. Standard commercial replacements fail repeatedly; generalizable university engineering intervention is authorized.`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-40 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
                    <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>No PDF reports attached</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. Lightbox for Photos */}
      {isPhotoModalOpen && challenge.imageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="font-bold text-sm text-slate-900">
                Site Photograph: {clusterCode}
              </h4>
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="max-h-[70vh] overflow-hidden rounded-xl">
              <img src={challenge.imageUrl} alt="Full Evidence" className="w-full h-auto object-contain max-h-[65vh] mx-auto" />
            </div>
          </div>
        </div>
      )}

      {/* 7. ACCEPT CONFIRMATION MODAL */}
      {isAcceptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-slate-950 text-base">
                    Accept Societal Research Challenge?
                  </h4>
                  <p className="text-xs text-slate-500">
                    Confirm challenge claim for institution capstone R&amp;D
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAcceptModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {clusterCode}
                </span>
                <span className="font-medium text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                  {challenge.aiRecommendation?.suggestedDepartment || "Applied R&D"}
                </span>
              </div>
              <div className="font-bold text-slate-900 text-[13px] leading-snug">
                {clusterTitle}
              </div>
              <p className="text-slate-600 text-[11.5px]">
                Impacts ~{totalPopulation.toLocaleString()} citizens across {facilities.length} healthcare sub-centers in {districts.join(" & ")}.
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
              <div className="flex items-center gap-2 text-indigo-900 font-semibold bg-indigo-50/70 p-2.5 rounded-lg border border-indigo-100">
                <svg className="w-4 h-4 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Students earn <strong>4 NEP 2020 Academic Credits (ABC)</strong> upon project completion.</span>
              </div>
              <p className="text-slate-500 text-[11.5px]">
                Upon confirming, a new Capstone Project workspace will be initialized, and you will be routed directly to the <strong>Team Allocator</strong> to assign your Lead Faculty PI and Student Innovators.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAcceptModalOpen(false)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAccept}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shadow-xs"
              >
                <span>Yes, Accept &amp; Form Team</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. DECLINE CONFIRMATION MODAL */}
      {isDeclineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-slate-950 text-base">
                    Decline Societal Challenge?
                  </h4>
                  <p className="text-xs text-slate-500">
                    Return this challenge to the Statewide Open Pool
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDeclineModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
              <span className="font-mono font-bold text-slate-800">
                {clusterCode}
              </span>
              <div className="font-semibold text-slate-900 leading-snug">
                {clusterTitle}
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Declining will notify the State Nodal Directorate and return this challenge to the Statewide Open Pool for allocation to another university.
              </p>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wide text-[10.5px] block">
                  Select Reason for Declining:
                </label>
                <select
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Domain or faculty mentor capacity constraints">Domain or faculty mentor capacity constraints</option>
                  <option value="Laboratory prototyping equipment not available">Laboratory prototyping equipment not available</option>
                  <option value="Geographical distance to field pilot site">Geographical distance to field pilot site</option>
                  <option value="Departmental bandwidth or timeline constraints">Departmental bandwidth or timeline constraints</option>
                  <option value="Other institutional constraints">Other institutional constraints</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDeclineModalOpen(false)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDecline}
                className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-xs"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
