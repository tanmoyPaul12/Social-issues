import React, { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useIssueStore, GrassrootIssueRecord } from "@/lib/store/useIssueStore";
import { toast } from "@/components/dashboard/ToastStack";
import { NodalAiAuditCard } from "@/components/dashboard/NodalAiAuditCard";
import { ProblemAiVerificationDrawer } from "./ProblemAiVerificationDrawer";
import { GovernmentPagination } from "./GovernmentPagination";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

interface RegisteredUniversity {
  id: string;
  code: string;
  name: string;
  district: string;
  state?: string;
}

// Helper to extract real AI matched HEI from saved database record (validationReportJson or recommendedHeisJson)
export function extractAiRecommendation(issue: GrassrootIssueRecord): {
  hasAiRecommendation: boolean;
  heiName?: string;
  matchScore?: number;
  domain?: string;
} {
  // 1. Check recommendedHeisJson
  if (issue.recommendedHeisJson) {
    try {
      const rec = typeof issue.recommendedHeisJson === "string"
        ? JSON.parse(issue.recommendedHeisJson)
        : issue.recommendedHeisJson;
      if (Array.isArray(rec) && rec.length > 0) {
        const top = rec[0];
        const rawScore = top.match_score || top.total_score || top.score || 0.85;
        const scorePct = rawScore <= 1 ? Math.round(rawScore * 100) : Math.round(rawScore);
        return {
          hasAiRecommendation: true,
          heiName: top.university_name || top.name || top.hei_name || top.assigned_hei,
          matchScore: scorePct,
          domain: top.domain
        };
      }
    } catch {}
  }

  // 2. Check validationReportJson
  if (issue.validationReportJson) {
    try {
      const rep = typeof issue.validationReportJson === "string"
        ? JSON.parse(issue.validationReportJson)
        : issue.validationReportJson;
      if (rep?.scored_universities && Array.isArray(rep.scored_universities) && rep.scored_universities.length > 0) {
        const top = rep.scored_universities[0];
        const rawScore = top.total_score || top.match_score || 0.85;
        const scorePct = rawScore <= 1 ? Math.round(rawScore * 100) : Math.round(rawScore);
        return {
          hasAiRecommendation: true,
          heiName: top.university_name,
          matchScore: scorePct,
          domain: rep.validation?.domain || rep.requirements?.domain
        };
      }
    } catch {}
  }

  return { hasAiRecommendation: false };
}

interface AiRoutingMasterOversightProps {
  userDistrict?: string;
}

export function AiRoutingMasterOversight({ userDistrict }: AiRoutingMasterOversightProps = {}) {
  const { user, token } = useAuthStore();
  const {
    issues,
    isLoading,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    fetchPaginatedIssues,
    approveIssueAllocation,
    reassignIssueHEI,
    revokeIssueAllocation
  } = useIssueStore();

  const rawDistrict = userDistrict || user?.district?.trim() || "";
  const isDistrictScoped = Boolean(
    rawDistrict &&
    rawDistrict.toLowerCase() !== "statewide" &&
    rawDistrict.toLowerCase() !== "all" &&
    rawDistrict.toLowerCase() !== "all 24 districts" &&
    rawDistrict.toLowerCase() !== "jharkhand"
  );

  // Dynamic registered universities from database
  const [registeredUniversities, setRegisteredUniversities] = useState<RegisteredUniversity[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>(
    isDistrictScoped ? rawDistrict : "All 24 Districts"
  );
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING_APPROVAL" | "ALLOCATED" | "REVOKED">("PENDING_APPROVAL");
  const [sectorFilter, setSectorFilter] = useState("ALL");

  // Local Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (isDistrictScoped) {
      setSelectedDistrict(rawDistrict);
    }
  }, [isDistrictScoped, rawDistrict]);

  // Fetch registered universities from database API
  useEffect(() => {
    async function loadUniversities() {
      try {
        const res = await fetch(`${API_BASE_URL}/triage/universities`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setRegisteredUniversities(data);
          }
        }
      } catch (e) {
        console.warn("Could not fetch registered universities from database:", e);
      }
    }
    loadUniversities();
  }, [token]);

  // Server-driven paginated fetch
  const loadData = useCallback(() => {
    const activeDistrict = isDistrictScoped ? rawDistrict : (selectedDistrict === "All 24 Districts" ? undefined : selectedDistrict);
    const backendStatus =
      statusFilter === "ALLOCATED"
        ? "ASSIGNED_HEI"
        : statusFilter === "PENDING_APPROVAL"
        ? "SUBMITTED"
        : undefined;

    fetchPaginatedIssues({
      district: activeDistrict,
      status: backendStatus,
      sector: sectorFilter !== "ALL" ? sectorFilter : undefined,
      search: searchQuery.trim() || undefined,
      page,
      size: rowsPerPage,
      token: token || undefined
    });
  }, [fetchPaginatedIssues, isDistrictScoped, rawDistrict, selectedDistrict, statusFilter, sectorFilter, searchQuery, page, rowsPerPage, token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Modals state
  const [selectedIssueForReroute, setSelectedIssueForReroute] = useState<GrassrootIssueRecord | null>(null);
  const [targetHeiName, setTargetHeiName] = useState("");
  const [rerouteJustification, setRerouteJustification] = useState("");
  const [isRerouting, setIsRerouting] = useState(false);

  // Set default target HEI when universities load or modal opens
  useEffect(() => {
    if (registeredUniversities.length > 0 && !targetHeiName) {
      setTargetHeiName(registeredUniversities[0].name);
    }
  }, [registeredUniversities, targetHeiName]);

  const [selectedIssueForRevoke, setSelectedIssueForRevoke] = useState<GrassrootIssueRecord | null>(null);
  const [revocationReason, setRevocationReason] = useState("Administrative reallocation by State Nodal Department");
  const [customRevokeNote, setCustomRevokeNote] = useState("");
  const [isRevoking, setIsRevoking] = useState(false);

  const [selectedAuditIssue, setSelectedAuditIssue] = useState<GrassrootIssueRecord | null>(null);
  const [selectedVerificationIssue, setSelectedVerificationIssue] = useState<GrassrootIssueRecord | null>(null);

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
  const totalIngested = totalElements || issues.length;
  const activeAllocated = issues.filter((i) => i.status === "ASSIGNED_HEI" && i.assignedHEI).length;
  const pendingApprovals = issues.filter((i) => i.status !== "ASSIGNED_HEI" && (!i.validationReportJson || !i.validationReportJson.includes("revocationHistory"))).length;
  const revokedCount = issues.filter((i) => i.validationReportJson && i.validationReportJson.includes("revocationHistory")).length;

  // Handler: Verify & Approve AI Recommendation
  const handleApproveAiRecommendation = async (issue: GrassrootIssueRecord) => {
    const aiRec = extractAiRecommendation(issue);
    const targetHei = aiRec.hasAiRecommendation && aiRec.heiName 
      ? aiRec.heiName 
      : (registeredUniversities[0]?.name || "University");
    const scorePct = aiRec.matchScore || 85;

    try {
      if (issue.numericId) {
        const res = await fetch(`${API_BASE_URL}/triage/${issue.numericId}/assign`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            heiName: targetHei,
            notes: `Verified & Approved by State Nodal Officer. AI Match Score: ${scorePct}%`
          })
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.warn("Backend assign endpoint notice:", err.error);
        }
      }

      approveIssueAllocation(issue.id, targetHei, `AI Recommendation Approved (${scorePct}% Confidence)`);
      toast.success(`Ticket #${issue.id} verified and officially allocated to ${targetHei}!`);
      loadData();
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
      loadData();
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
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to revoke allocation");
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="space-y-6 pt-1 text-[#4a4a4a]">
      {/* Top Banner & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#d9d9d9] rounded-xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#1a0e3d] tracking-tight">
              {isDistrictScoped ? `${rawDistrict} District AI Routing & HEI Allocation Control` : "Government Master AI Routing & HEI Allocation Control"}
            </h2>
            {isDistrictScoped ? (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#F2fcef] text-[#002110] border border-[#a3e635]">
                {rawDistrict} JURISDICTION (LOCKED)
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#e6fffb] text-[#002329] border border-[#99f6e4]">
                STATE NODAL CLEARANCE
              </span>
            )}
          </div>
          <p className="text-xs text-[#4a4a4a] mt-1 max-w-3xl leading-relaxed">
            {isDistrictScoped
              ? `Authorized jurisdiction for ${rawDistrict} District Collectorate. Audit algorithmic match confidence for local grievances, verify and approve HEI capstone allocations, and reassign target institutions.`
              : "Full administrative authority over automated AI problem routing. Audit algorithmic match confidence, approve university allocations, override target institutions, or revoke challenges back to the statewide pool."}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#F2efff] border border-[#d9d9d9] text-xs font-bold text-[#1a0e3d] cursor-pointer transition-colors"
            title="Refresh issues"
          >
            <svg className={`w-3.5 h-3.5 text-[#1a0e3d] ${isLoading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{isLoading ? "Refreshing..." : "Refresh"}</span>
          </button>
          
        </div>
      </div>

      {/* KPI Cards (Brand Palette: Primary Violet, Green Success, Orange Warning, Red Danger) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-[#d9d9d9] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-[#4a4a4a] uppercase tracking-wider block">Total Ingested</span>
          <div className="text-2xl font-black text-[#1a0e3d] font-mono mt-1">{totalIngested}</div>
          <span className="text-[10px] text-slate-500 font-medium">{isDistrictScoped ? `${rawDistrict} Collectorate` : "All 24 Districts"}</span>
        </div>

        <div className="bg-white border border-[#d9d9d9] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-[#4a4a4a] uppercase tracking-wider block">Active Allocations</span>
          <div className="text-2xl font-black text-[#002110] font-mono mt-1">{activeAllocated}</div>
          <span className="text-[10px] text-[#059669] font-medium font-mono">HEI Capstones Assigned</span>
        </div>

        <div className="bg-white border border-[#d9d9d9] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-[#4a4a4a] uppercase tracking-wider block">Pending Verification</span>
          <div className="text-2xl font-black text-[#612500] font-mono mt-1">{pendingApprovals}</div>
          <span className="text-[10px] text-[#d97706] font-medium font-mono">Awaiting Nodal Sign-off</span>
        </div>

        <div className="bg-white border border-[#d9d9d9] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-[#4a4a4a] uppercase tracking-wider block">Revoked from HEIs</span>
          <div className="text-2xl font-black text-[#3a0907] font-mono mt-1">{revokedCount}</div>
          <span className="text-[10px] text-[#dc2626] font-medium font-mono">Returned to State Pool</span>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-white border border-[#d9d9d9] rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Search by Ticket ID, challenge title, keyword, or allocated college..."
              className="w-full px-3.5 py-2 bg-[#F2efff]/30 border border-[#d9d9d9] rounded-lg text-xs text-[#1a0e3d] outline-none focus:bg-white focus:ring-1 focus:ring-[#1a0e3d] font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setPage(0);
              }}
              disabled={isDistrictScoped}
              className={`px-3 py-2 bg-white border border-[#d9d9d9] rounded-lg text-xs font-bold text-[#1a0e3d] outline-none focus:ring-1 focus:ring-[#1a0e3d] ${isDistrictScoped ? "bg-[#f5f5f5] opacity-80 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {isDistrictScoped ? (
                <option value={rawDistrict}>{rawDistrict} (Locked)</option>
              ) : (
                <>
                  <option value="All 24 Districts">All 24 Districts</option>
                  {[
                    "Ranchi", "Dhanbad", "Dumka", "East Singhbhum", "West Singhbhum",
                    "Bokaro", "Hazaribagh", "Deoghar", "Giridih", "Ramgarh",
                    "Palamu", "Latehar", "Sahibganj", "Khunti", "Gumla",
                    "Simdega", "Garhwa", "Godda", "Chatra", "Koderma",
                    "Jamtara", "Pakur", "Lohardaga", "Saraikela Kharsawan"
                  ].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </>
              )}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPage(0);
              }}
              className="px-3 py-2 bg-white border border-[#d9d9d9] rounded-lg text-xs font-bold text-[#1a0e3d] outline-none cursor-pointer focus:ring-1 focus:ring-[#1a0e3d]"
            >
              <option value="ALL">All Allocation States</option>
              <option value="PENDING_APPROVAL">Pending Nodal Approval</option>
              <option value="ALLOCATED">Active HEI Allocation</option>
              <option value="REVOKED">Govt Revoked / Pool</option>
            </select>

            <select
              value={sectorFilter}
              onChange={(e) => {
                setSectorFilter(e.target.value);
                setPage(0);
              }}
              className="px-3 py-2 bg-white border border-[#d9d9d9] rounded-lg text-xs font-bold text-[#1a0e3d] outline-none cursor-pointer focus:ring-1 focus:ring-[#1a0e3d]"
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

      {/* Master Allocation Table */}
      <div className="bg-white border border-[#d9d9d9] rounded-xl shadow-xs overflow-hidden">
        {issues.length === 0 ? (
          <div className="p-12 text-center text-[#4a4a4a] text-xs space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#F2efff] text-[#1a0e3d] flex items-center justify-center mx-auto">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="font-bold text-[#1a0e3d]">No Challenges Matching Current Filter</div>
            <p className="max-w-md mx-auto text-[#4a4a4a]">
              Adjust your search keywords, district filter, or allocation status to view challenges.
            </p>
          </div>
        ) : (
          <div className="w-full">
            <table className="w-full table-fixed text-left text-xs">
              <thead>
                <tr className="bg-[#F2efff] border-b border-[#d9d9d9] text-[#1a0e3d] font-bold uppercase text-[10px]">
                  <th className="py-3 px-3.5 w-[125px]">Ticket ID</th>
                  <th className="py-3 px-3">Problem &amp; Domain</th>
                  <th className="py-3 px-3 w-[105px]">District</th>
                  <th className="py-3 px-3 w-[180px]">AI Match &amp; HEI</th>
                  <th className="py-3 px-3 w-[150px]">Allocation Status</th>
                  <th className="py-3 px-3.5 w-[140px] text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d9d9d9]/60 font-medium">
                {issues.map((issue, idx) => {
                  const aiRec = extractAiRecommendation(issue);
                  const isAssigned = Boolean(issue.assignedHEI && issue.assignedHEI !== "Pending Assignment" && issue.status === "ASSIGNED_HEI");
                  const hasRevocationHistory = issue.validationReportJson && issue.validationReportJson.includes("revocationHistory");

                  return (
                    <tr key={`${issue.id}-${idx}`} className="hover:bg-[#F2efff]/20 transition-colors">
                      {/* Ticket ID */}
                      <td className="py-3 px-3.5 font-mono font-bold text-[#1a0e3d] truncate">
                        {issue.id}
                      </td>

                      {/* Problem Statement */}
                      <td className="py-3 px-3 truncate">
                        <span className="font-bold text-[#1a0e3d] mr-1.5">{issue.title}</span>
                        <span className="text-[11px] text-[#32174a] font-normal">
                          ({issue.domain || issue.sector || "Civic Tech"})
                        </span>
                      </td>

                      {/* District */}
                      <td className="py-3 px-3 text-[#4a4a4a] font-mono text-[11px] truncate">
                        {issue.district}
                      </td>

                      {/* AI Match & Active HEI */}
                      <td className="py-3 px-3 truncate">
                        {isAssigned ? (
                          <div className="flex items-center gap-1 truncate" title={`Active: ${issue.assignedHEI}`}>
                            <span className="font-bold text-[#1a0e3d] truncate">{issue.assignedHEI}</span>
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#F2fcef] text-[#002110] border border-[#a3e635] shrink-0">
                              ACTIVE
                            </span>
                          </div>
                        ) : aiRec.hasAiRecommendation ? (
                          <div className="flex items-center gap-1.5 truncate" title={`AI Suggestion: ${aiRec.heiName}`}>
                            <span className="font-bold text-[#1a0e3d] truncate">{aiRec.heiName}</span>
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#F2efff] text-[#1a0e3d] border border-[#dcd3ff] shrink-0">
                              {aiRec.matchScore}%
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 truncate text-[#4a4a4a]">
                            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                              Pending AI Analysis
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        {isAssigned ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#F2fcef] text-[#002110] border border-[#a3e635] truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#059669] shrink-0" />
                            <span className="truncate">ALLOCATED</span>
                          </span>
                        ) : hasRevocationHistory ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF8f8] text-[#3a0907] border border-[#fecaca] truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626] shrink-0" />
                            <span className="truncate">REVOKED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF7e6] text-[#612500] border border-[#fed7aa] truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] animate-pulse shrink-0" />
                            <span className="truncate">PENDING</span>
                          </span>
                        )}
                      </td>

                      {/* Single Action: Check / Verify Button (Primary Violet #1a0e3d) */}
                      <td className="py-3 px-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedVerificationIssue(issue)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1a0e3d] hover:bg-[#2e1764] text-white font-bold text-[11px] shadow-xs hover:shadow transition-all cursor-pointer group shrink-0"
                          title="Open full AI verification dossier and faculty matching"
                        >
                          
                          <span>Check & Verify</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Bar */}
      <GovernmentPagination
        currentPage={page}
        totalPages={totalPages}
        pageSize={rowsPerPage}
        totalElements={totalElements}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newSize) => {
          setRowsPerPage(newSize);
          setPage(0);
        }}
        isLoading={isLoading}
      />

      {/* ── MODAL 1: RE-ROUTE / OVERRIDE UNIVERSITY ALLOCATION ── */}
      {selectedIssueForReroute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-white border border-[#d9d9d9] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#d9d9d9] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#32174a]">Master Allocation Override</span>
                <h3 className="text-base font-bold text-[#1a0e3d]">
                  Re-route Challenge #{selectedIssueForReroute.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIssueForReroute(null)}
                className="w-7 h-7 rounded-lg bg-white hover:bg-[#F2efff] text-[#4a4a4a] hover:text-[#1a0e3d] border border-[#d9d9d9] font-bold flex items-center justify-center cursor-pointer transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F2efff]/50 border border-[#dcd3ff] rounded-lg space-y-1">
                <div className="font-bold text-[#1a0e3d]">{selectedIssueForReroute.title}</div>
                <div className="text-[#4a4a4a] truncate">{selectedIssueForReroute.description}</div>
                <div className="text-[11px] text-[#4a4a4a] font-mono mt-1">
                  District: {selectedIssueForReroute.district} • Domain: {selectedIssueForReroute.domain || selectedIssueForReroute.sector}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#1a0e3d] uppercase text-[10px] tracking-wider block">
                  Select Target Higher Education Institution (Jharkhand HEI)
                </label>
                <select
                  value={targetHeiName}
                  onChange={(e) => setTargetHeiName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#d9d9d9] rounded-lg text-xs font-bold text-[#1a0e3d] outline-none focus:ring-1 focus:ring-[#1a0e3d] cursor-pointer"
                >
                  {registeredUniversities.length === 0 ? (
                    <option value="">Loading registered universities...</option>
                  ) : isDistrictScoped ? (
                    <>
                      {registeredUniversities.filter((u) => u.district?.toLowerCase() === rawDistrict.toLowerCase()).length > 0 && (
                        <optgroup label={`Local ${rawDistrict} District Institutions (High Proximity)`}>
                          {registeredUniversities
                            .filter((u) => u.district?.toLowerCase() === rawDistrict.toLowerCase())
                            .map((uni) => (
                              <option key={uni.id || uni.code} value={uni.name}>
                                {uni.name} ({uni.district || rawDistrict}) — Local District
                              </option>
                            ))}
                        </optgroup>
                      )}
                      <optgroup label="Other Jharkhand State Institutions">
                        {registeredUniversities
                          .filter((u) => u.district?.toLowerCase() !== rawDistrict.toLowerCase())
                          .map((uni) => (
                            <option key={uni.id || uni.code} value={uni.name}>
                              {uni.name} ({uni.district || "Jharkhand"})
                            </option>
                          ))}
                      </optgroup>
                    </>
                  ) : (
                    registeredUniversities.map((uni) => (
                      <option key={uni.id || uni.code} value={uni.name}>
                        {uni.name} ({uni.district || "Jharkhand"})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#1a0e3d] uppercase text-[10px] tracking-wider block">
                  Nodal Officer Justification / Administrative Note
                </label>
                <textarea
                  value={rerouteJustification}
                  onChange={(e) => setRerouteJustification(e.target.value)}
                  placeholder="State the statutory reason or departmental priority for this institutional routing..."
                  rows={3}
                  className="w-full p-2.5 bg-white border border-[#d9d9d9] rounded-lg text-xs text-[#1a0e3d] outline-none focus:ring-1 focus:ring-[#1a0e3d]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#d9d9d9]">
              <button
                type="button"
                onClick={() => setSelectedIssueForReroute(null)}
                className="px-4 py-2 text-xs font-bold text-[#4a4a4a] hover:bg-[#F2efff] rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRerouting}
                onClick={handleConfirmReroute}
                className="px-5 py-2 text-xs font-bold bg-[#1a0e3d] hover:bg-[#2e1764] text-white rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50"
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
          <div className="w-full max-w-lg bg-white border border-[#d9d9d9] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#d9d9d9] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3a0907]">Master Administrative Revocation</span>
                <h3 className="text-base font-bold text-[#1a0e3d]">
                  Revoke Allocation for #{selectedIssueForRevoke.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIssueForRevoke(null)}
                className="w-7 h-7 rounded-lg bg-white hover:bg-[#F2efff] text-[#4a4a4a] hover:text-[#1a0e3d] border border-[#d9d9d9] font-bold flex items-center justify-center cursor-pointer transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F2efff]/50 border border-[#dcd3ff] rounded-lg space-y-1">
                <div className="font-bold text-[#1a0e3d]">{selectedIssueForRevoke.title}</div>
                <div className="text-[#4a4a4a]">
                  Currently Assigned To: <strong>{selectedIssueForRevoke.assignedHEI}</strong>
                </div>
              </div>

              <div className="p-3 bg-[#FFF7e6] border border-[#fed7aa] rounded-lg text-[#612500] text-[11px] leading-relaxed">
                <strong>Administrative Notice:</strong> Revoking this challenge will immediately withdraw it from the university&apos;s active research roster and return it to the Statewide Open Pool for reassignment.
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#1a0e3d] uppercase text-[10px] tracking-wider block">
                  Select Statutory Revocation Reason
                </label>
                <select
                  value={revocationReason}
                  onChange={(e) => setRevocationReason(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#d9d9d9] rounded-lg text-xs font-bold text-[#1a0e3d] outline-none focus:ring-1 focus:ring-[#1a0e3d] cursor-pointer"
                >
                  <option value="Administrative reallocation by State Nodal Department">Administrative reallocation by State Nodal Department</option>
                  <option value="Institutional capacity/timeline milestone non-compliance">Institutional capacity/timeline milestone non-compliance</option>
                  <option value="Geographical jurisdiction realignment">Geographical jurisdiction realignment</option>
                  <option value="Inter-departmental clearance priority shift">Inter-departmental clearance priority shift</option>
                  <option value="Other statutory reason">Other statutory reason</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#1a0e3d] uppercase text-[10px] tracking-wider block">
                  Additional Revocation Audit Notes (Optional)
                </label>
                <textarea
                  value={customRevokeNote}
                  onChange={(e) => setCustomRevokeNote(e.target.value)}
                  placeholder="Enter specific audit remarks to record in the permanent ledger..."
                  rows={2}
                  className="w-full p-2.5 bg-white border border-[#d9d9d9] rounded-lg text-xs text-[#1a0e3d] outline-none focus:ring-1 focus:ring-[#1a0e3d]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#d9d9d9]">
              <button
                type="button"
                onClick={() => setSelectedIssueForRevoke(null)}
                className="px-4 py-2 text-xs font-bold text-[#4a4a4a] hover:bg-[#F2efff] rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRevoking}
                onClick={handleConfirmRevoke}
                className="px-5 py-2 text-xs font-bold bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50"
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

      {/* ── DEDICATED RIGHT-SIDE AI VERIFICATION & FACULTY DOSSIER DRAWER ── */}
      {selectedVerificationIssue && (
        <ProblemAiVerificationDrawer
          issue={selectedVerificationIssue}
          onClose={() => setSelectedVerificationIssue(null)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
