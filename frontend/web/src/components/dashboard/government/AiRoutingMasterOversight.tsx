"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useIssueStore, GrassrootIssueRecord } from "@/lib/store/useIssueStore";
import { toast } from "@/components/dashboard/ToastStack";
import { NodalAiAuditCard } from "@/components/dashboard/NodalAiAuditCard";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export const JHARKHAND_OFFICIAL_HEIS = [
  {
    hei_id: "BIT_MESRA",
    name: "Birla Institute of Technology (BIT) Mesra, Ranchi",
    domains: ["Water Management & Hydrology", "Rural Infrastructure & Transport", "Energy & Electricity", "Agriculture & Agro-Tech"],
    district: "Ranchi",
    aishe: "U-0205"
  },
  {
    hei_id: "IIT_ISM_DHANBAD",
    name: "IIT (ISM) Dhanbad",
    domains: ["Environment & Climate Resilience", "Energy & Electricity", "Water Management & Hydrology"],
    district: "Dhanbad",
    aishe: "U-0206"
  },
  {
    hei_id: "BAU_RANCHI",
    name: "Birsa Agricultural University (BAU), Kanke",
    domains: ["Agriculture & Agro-Tech", "Livelihood & Rural Employment", "Water Management & Hydrology"],
    district: "Ranchi",
    aishe: "U-0208"
  },
  {
    hei_id: "RANCHI_UNIV",
    name: "Ranchi University",
    domains: ["Education & Skilling", "Healthcare & Public Health", "Governance & Public Service Delivery"],
    district: "Ranchi",
    aishe: "U-0209"
  },
  {
    hei_id: "NIT_JAMSHEDPUR",
    name: "National Institute of Technology (NIT) Jamshedpur",
    domains: ["Rural Infrastructure & Transport", "Sanitation & Waste Management", "Energy & Electricity"],
    district: "East Singhbhum",
    aishe: "U-0207"
  }
];

// Helper to compute best AI matched HEI based on domain and district
export function calculateAiHeiRecommendation(issue: GrassrootIssueRecord) {
  const domainText = (issue.domain || issue.sector || "").toLowerCase();
  const districtText = (issue.district || "").toLowerCase();

  let bestMatch = JHARKHAND_OFFICIAL_HEIS[0];
  let highestScore = 0.5;

  for (const hei of JHARKHAND_OFFICIAL_HEIS) {
    let score = 0.5;
    const hasDomain = hei.domains.some((d) => domainText.includes(d.split(" ")[0].toLowerCase()));
    if (hasDomain) score += 0.35;
    if (districtText.includes(hei.district.toLowerCase())) score += 0.15;

    if (score > highestScore) {
      highestScore = score;
      bestMatch = hei;
    }
  }

  const matchPercent = Math.min(99, Math.round(highestScore * 100));
  return {
    hei: bestMatch,
    matchScore: matchPercent,
    rationale: `AI matched ${bestMatch.name} based on domain '${issue.domain || issue.sector}' and regional capabilities in ${bestMatch.district}.`
  };
}

export function AiRoutingMasterOversight() {
  const { user, token } = useAuthStore();
  const { issues, approveIssueAllocation, reassignIssueHEI, revokeIssueAllocation } = useIssueStore();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("All 24 Districts");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING_APPROVAL" | "ALLOCATED" | "REVOKED">("ALL");
  const [sectorFilter, setSectorFilter] = useState("ALL");

  // Modals state
  const [selectedIssueForReroute, setSelectedIssueForReroute] = useState<GrassrootIssueRecord | null>(null);
  const [targetHeiName, setTargetHeiName] = useState(JHARKHAND_OFFICIAL_HEIS[0].name);
  const [rerouteJustification, setRerouteJustification] = useState("");
  const [isRerouting, setIsRerouting] = useState(false);

  const [selectedIssueForRevoke, setSelectedIssueForRevoke] = useState<GrassrootIssueRecord | null>(null);
  const [revocationReason, setRevocationReason] = useState("Administrative reallocation by State Nodal Department");
  const [customRevokeNote, setCustomRevokeNote] = useState("");
  const [isRevoking, setIsRevoking] = useState(false);

  const [selectedAuditIssue, setSelectedAuditIssue] = useState<GrassrootIssueRecord | null>(null);

  // Filter issues
  const filteredIssues = issues.filter((issue) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchQ =
        issue.id.toLowerCase().includes(q) ||
        issue.title.toLowerCase().includes(q) ||
        (issue.description && issue.description.toLowerCase().includes(q)) ||
        (issue.assignedHEI && issue.assignedHEI.toLowerCase().includes(q));
      if (!matchQ) return false;
    }

    // District filter
    if (selectedDistrict !== "All 24 Districts" && issue.district !== selectedDistrict) {
      return false;
    }

    // Sector filter
    if (sectorFilter !== "ALL") {
      const sec = (issue.sector || issue.domain || "").toUpperCase();
      if (!sec.includes(sectorFilter)) return false;
    }

    // Status filter
    const isAssigned = Boolean(issue.assignedHEI && issue.assignedHEI !== "Pending Assignment" && issue.status === "ASSIGNED_HEI");
    const hasRevocationHistory = issue.validationReportJson && issue.validationReportJson.includes("revocationHistory");

    if (statusFilter === "ALLOCATED") {
      return isAssigned;
    }
    if (statusFilter === "PENDING_APPROVAL") {
      return !isAssigned && !hasRevocationHistory;
    }
    if (statusFilter === "REVOKED") {
      return !isAssigned && hasRevocationHistory;
    }

    return true;
  });

  // KPI Calculations
  const totalIngested = issues.length;
  const activeAllocated = issues.filter((i) => i.status === "ASSIGNED_HEI" && i.assignedHEI).length;
  const pendingApprovals = issues.filter((i) => i.status !== "ASSIGNED_HEI" && (!i.validationReportJson || !i.validationReportJson.includes("revocationHistory"))).length;
  const revokedCount = issues.filter((i) => i.validationReportJson && i.validationReportJson.includes("revocationHistory")).length;

  // Handler: Verify & Approve AI Recommendation
  const handleApproveAiRecommendation = async (issue: GrassrootIssueRecord) => {
    const recommendation = calculateAiHeiRecommendation(issue);
    try {
      if (issue.numericId) {
        const res = await fetch(`${API_BASE_URL}/triage/${issue.numericId}/assign`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            heiName: recommendation.hei.name,
            notes: `Verified & Approved by State Nodal Officer. AI Match Score: ${recommendation.matchScore}%`
          })
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.warn("Backend assign endpoint notice:", err.error);
        }
      }

      approveIssueAllocation(issue.id, recommendation.hei.name, `AI Recommendation Approved (${recommendation.matchScore}% Confidence)`);
      toast.success(`Ticket #${issue.id} verified and officially allocated to ${recommendation.hei.name}!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to approve allocation");
    }
  };

  // Handler: Re-route / Override University
  const handleConfirmReroute = async () => {
    if (!selectedIssueForReroute) return;
    setIsRerouting(true);
    try {
      if (selectedIssueForReroute.numericId) {
        const res = await fetch(`${API_BASE_URL}/triage/${selectedIssueForReroute.numericId}/assign`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            heiName: targetHeiName,
            notes: rerouteJustification || "Re-routed and assigned by State Nodal Officer."
          })
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.warn("Backend reassign notice:", err.error);
        }
      }

      reassignIssueHEI(selectedIssueForReroute.id, targetHeiName, rerouteJustification);
      toast.success(`Ticket #${selectedIssueForReroute.id} re-routed and allocated to ${targetHeiName}.`);
      setSelectedIssueForReroute(null);
      setRerouteJustification("");
    } catch (err: any) {
      toast.error(err.message || "Failed to re-route challenge");
    } finally {
      setIsRerouting(false);
    }
  };

  // Handler: Revoke Allocation
  const handleConfirmRevoke = async () => {
    if (!selectedIssueForRevoke) return;
    setIsRevoking(true);
    const finalReason = customRevokeNote.trim()
      ? `${revocationReason} - ${customRevokeNote.trim()}`
      : revocationReason;

    try {
      if (selectedIssueForRevoke.numericId) {
        const res = await fetch(`${API_BASE_URL}/triage/${selectedIssueForRevoke.numericId}/revoke`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            reason: finalReason
          })
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.warn("Backend revoke notice:", err.error);
        }
      }

      revokeIssueAllocation(selectedIssueForRevoke.id, finalReason);
      toast.warning(`Allocation revoked for Ticket #${selectedIssueForRevoke.id}. Problem returned to state pool.`);
      setSelectedIssueForRevoke(null);
      setCustomRevokeNote("");
    } catch (err: any) {
      toast.error(err.message || "Failed to revoke allocation");
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="space-y-6 pt-1 text-slate-800">
      {/* Top Banner & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Government Master AI Routing &amp; HEI Allocation Control
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300">
              STATE NODAL CLEARANCE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Full administrative authority over automated AI problem routing. Audit algorithmic match confidence, approve university allocations, override target institutions, or revoke challenges back to the statewide pool.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            AI MATCHER LIVE
          </span>
        </div>
      </div>

      {/* KPI Cards (Single Neutral Aesthetic) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Ingested</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">{totalIngested}</div>
          <span className="text-[10px] text-slate-400 font-medium">All 24 Districts</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Active Allocations</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">{activeAllocated}</div>
          <span className="text-[10px] text-slate-400 font-medium">HEI Capstones Assigned</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Pending Verification</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">{pendingApprovals}</div>
          <span className="text-[10px] text-slate-400 font-medium">Awaiting Nodal Sign-off</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Revoked from HEIs</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">{revokedCount}</div>
          <span className="text-[10px] text-slate-400 font-medium">Returned to State Pool</span>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Ticket ID, challenge title, keyword, or allocated college..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 outline-none focus:bg-white focus:ring-1 focus:ring-slate-400 font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option>All 24 Districts</option>
              {["Ranchi", "Dhanbad", "Dumka", "East Singhbhum", "West Singhbhum", "Bokaro", "Hazaribagh", "Deoghar", "Giridih", "Ramgarh", "Latehar", "Sahibganj"].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="ALL">All Allocation States</option>
              <option value="PENDING_APPROVAL">Pending Nodal Approval</option>
              <option value="ALLOCATED">Active HEI Allocation</option>
              <option value="REVOKED">Govt Revoked / Pool</option>
            </select>

            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="ALL">All Domains</option>
              <option value="WATER">Water Resources</option>
              <option value="AGRICULTURE">Agriculture</option>
              <option value="ENERGY">Energy &amp; Power</option>
              <option value="INFRASTRUCTURE">Infrastructure</option>
              <option value="HEALTH">Healthcare</option>
              <option value="ENVIRONMENT">Environment</option>
            </select>
          </div>
        </div>
      </div>

      {/* Master Allocation Table (Single-Line Compact, No Linebreaks, Sleek Single-Neutral, No Horizontal Scroll) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filteredIssues.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="font-bold text-slate-700">No Challenges Matching Current Filter</div>
            <p className="max-w-md mx-auto text-slate-400">
              Adjust your search keywords, district filter, or allocation status to view challenges.
            </p>
          </div>
        ) : (
          <div className="w-full">
            <table className="w-full table-fixed text-left text-xs">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3.5 w-[125px]">Ticket ID</th>
                  <th className="py-3 px-3">Problem &amp; Domain</th>
                  <th className="py-3 px-3 w-[105px]">District</th>
                  <th className="py-3 px-3 w-[180px]">AI Match &amp; HEI</th>
                  <th className="py-3 px-3 w-[150px]">Allocation Status</th>
                  <th className="py-3 px-3.5 w-[230px] text-right">Master Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredIssues.map((issue, idx) => {
                  const recommendation = calculateAiHeiRecommendation(issue);
                  const isAssigned = Boolean(issue.assignedHEI && issue.assignedHEI !== "Pending Assignment" && issue.status === "ASSIGNED_HEI");
                  const hasRevocationHistory = issue.validationReportJson && issue.validationReportJson.includes("revocationHistory");
                  const shortAssigned = issue.assignedHEI ? issue.assignedHEI.split(",")[0].replace("Birla Institute of Technology", "BIT").replace("Birsa Agricultural University", "BAU").replace("National Institute of Technology", "NIT") : "";
                  const shortAi = recommendation.hei.name.split(",")[0].replace("Birla Institute of Technology", "BIT").replace("Birsa Agricultural University", "BAU").replace("National Institute of Technology", "NIT");

                  return (
                    <tr key={`${issue.id}-${idx}`} className="hover:bg-slate-50/90 transition-colors">
                      {/* Ticket ID */}
                      <td className="py-3 px-3.5 font-mono font-bold text-slate-900 truncate">
                        {issue.id}
                      </td>

                      {/* Problem Statement */}
                      <td className="py-3 px-3 truncate">
                        <span className="font-bold text-slate-900 mr-1.5">{issue.title}</span>
                        <span className="text-[11px] text-slate-500 font-normal">
                          ({issue.domain || issue.sector || "Civic Tech"})
                        </span>
                      </td>

                      {/* District */}
                      <td className="py-3 px-3 text-slate-700 font-mono text-[11px] truncate">
                        {issue.district}
                      </td>

                      {/* AI Match & Active HEI */}
                      <td className="py-3 px-3 truncate">
                        {isAssigned ? (
                          <div className="flex items-center gap-1 truncate" title={`Active: ${issue.assignedHEI}`}>
                            <span className="font-bold text-slate-900 truncate">{shortAssigned}</span>
                            <span className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                              ACTIVE
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 truncate" title={`AI Suggestion: ${recommendation.hei.name}`}>
                            <span className="font-bold text-slate-800 truncate">{shortAi}</span>
                            <span className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                              {recommendation.matchScore}%
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        {isAssigned ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                            <span className="truncate">ALLOCATED</span>
                          </span>
                        ) : hasRevocationHistory ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                            <span className="truncate">REVOKED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
                            <span className="truncate">PENDING</span>
                          </span>
                        )}
                      </td>

                      {/* Master Action Controls */}
                      <td className="py-3 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Option 1: One-click Approve AI Match */}
                          {!isAssigned && (
                            <button
                              type="button"
                              onClick={() => handleApproveAiRecommendation(issue)}
                              className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-2xs shrink-0"
                              title={`Approve AI match and allocate to ${recommendation.hei.name}`}
                            >
                              Approve
                            </button>
                          )}

                          {/* Option 2: Re-route / Override College */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedIssueForReroute(issue);
                              setTargetHeiName(issue.assignedHEI || recommendation.hei.name);
                              setRerouteJustification("");
                            }}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-[11px] transition-colors cursor-pointer shrink-0"
                          >
                            {isAssigned ? "Re-route" : "Route"}
                          </button>

                          {/* Option 3: Revoke Allocation (Master Power) */}
                          {isAssigned && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedIssueForRevoke(issue);
                                setRevocationReason("Administrative reallocation by State Nodal Department");
                                setCustomRevokeNote("");
                              }}
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-rose-50 text-rose-700 hover:text-rose-800 border border-slate-300 hover:border-rose-300 font-bold text-[11px] transition-colors cursor-pointer shrink-0"
                            >
                              Revoke
                            </button>
                          )}

                          {/* Inspect Multi-Modal AI Dossier */}
                          <button
                            type="button"
                            onClick={() => setSelectedAuditIssue(issue)}
                            className="px-1.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 font-medium text-[11px] transition-colors cursor-pointer shrink-0"
                            title="Inspect AI Multi-Modal consensus and evidence"
                          >
                            AI →
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL 1: RE-ROUTE / OVERRIDE UNIVERSITY ALLOCATION ── */}
      {selectedIssueForReroute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-white border border-slate-300 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Master Allocation Override</span>
                <h3 className="text-base font-bold text-slate-900">
                  Re-route Challenge #{selectedIssueForReroute.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIssueForReroute(null)}
                className="w-7 h-7 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="font-bold text-slate-900">{selectedIssueForReroute.title}</div>
                <div className="text-slate-500 truncate">{selectedIssueForReroute.description}</div>
                <div className="text-[11px] text-slate-400 font-mono mt-1">
                  District: {selectedIssueForReroute.district} • Domain: {selectedIssueForReroute.domain || selectedIssueForReroute.sector}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block">
                  Select Target Higher Education Institution (Jharkhand HEI)
                </label>
                <select
                  value={targetHeiName}
                  onChange={(e) => setTargetHeiName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                >
                  {JHARKHAND_OFFICIAL_HEIS.map((hei) => (
                    <option key={hei.hei_id} value={hei.name}>
                      {hei.name} (AISHE {hei.aishe}) — {hei.district}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block">
                  Nodal Officer Justification / Administrative Note
                </label>
                <textarea
                  value={rerouteJustification}
                  onChange={(e) => setRerouteJustification(e.target.value)}
                  placeholder="State the statutory reason or departmental priority for this institutional routing..."
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedIssueForReroute(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRerouting}
                onClick={handleConfirmReroute}
                className="px-5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isRerouting ? "Dispatching..." : "Confirm & Dispatch Allocation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: MASTER REVOCATION CONFIRMATION ── */}
      {selectedIssueForRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-300 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Master Administrative Revocation</span>
                <h3 className="text-base font-bold text-slate-900">
                  Revoke Allocation for #{selectedIssueForRevoke.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIssueForRevoke(null)}
                className="w-7 h-7 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="font-bold text-slate-900">{selectedIssueForRevoke.title}</div>
                <div className="text-slate-600">
                  Currently Assigned To: <strong>{selectedIssueForRevoke.assignedHEI}</strong>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] leading-relaxed">
                <strong>Administrative Notice:</strong> Revoking this challenge will immediately withdraw it from the university&apos;s active research roster and return it to the Statewide Open Pool for reassignment.
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block">
                  Select Statutory Revocation Reason
                </label>
                <select
                  value={revocationReason}
                  onChange={(e) => setRevocationReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                >
                  <option value="Administrative reallocation by State Nodal Department">Administrative reallocation by State Nodal Department</option>
                  <option value="Institutional capacity/timeline milestone non-compliance">Institutional capacity/timeline milestone non-compliance</option>
                  <option value="Geographical jurisdiction realignment">Geographical jurisdiction realignment</option>
                  <option value="Inter-departmental clearance priority shift">Inter-departmental clearance priority shift</option>
                  <option value="Other statutory reason">Other statutory reason</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block">
                  Additional Revocation Audit Notes (Optional)
                </label>
                <textarea
                  value={customRevokeNote}
                  onChange={(e) => setCustomRevokeNote(e.target.value)}
                  placeholder="Enter specific audit remarks to record in the permanent ledger..."
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedIssueForRevoke(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRevoking}
                onClick={handleConfirmRevoke}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isRevoking ? "Revoking..." : "Confirm & Revoke Allocation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: DEEP AI MULTI-MODAL AUDIT CARD ── */}
      {selectedAuditIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="max-w-5xl w-full relative my-auto">
            <NodalAiAuditCard
              issueId={selectedAuditIssue.id}
              issue={selectedAuditIssue}
              modalityBreakdown={selectedAuditIssue.modalityBreakdown as any}
              generalizedConsensus={selectedAuditIssue.generalizedConsensus as any}
              onClose={() => setSelectedAuditIssue(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
