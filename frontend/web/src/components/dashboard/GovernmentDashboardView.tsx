"use client";

import React, { useState, useEffect } from "react";
import { OFFICIAL_RESEARCH_DOMAINS } from "@/app/page";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useIssueStore, GrassrootIssueRecord } from "@/lib/store/useIssueStore";
import { toast } from "@/components/dashboard/ToastStack";
import { NodalAiAuditCard } from "@/components/dashboard/NodalAiAuditCard";
import { GovernmentAnalyticsOverview } from "./government/GovernmentAnalyticsOverview";
import { AiRoutingMasterOversight } from "./government/AiRoutingMasterOversight";
import { GovernmentProjectLifecycleOversight } from "./government/GovernmentProjectLifecycleOversight";
import { GovernmentDistrictReportsView } from "./government/GovernmentDistrictReportsView";
import { WorkspacePlaceholderTab } from "./WorkspacePlaceholderTab";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

interface EscalationItem {
  id: string;
  ticketId: string;
  title: string;
  department: string;
  reason: string;
  severity: "High" | "Medium" | "Low";
  actionRequired: string;
}

interface GovernmentDashboardViewProps {
  activeTab?: string;
  onNavigateTab?: (tabId: string) => void;
}

const sectorToDomainMap: Record<string, string> = {
  "WATER": "Water Resources",
  "HEALTH": "Healthcare",
  "EDUCATION": "Education",
  "INFRASTRUCTURE": "Urban Development",
  "AGRICULTURE": "Agriculture",
  "ELECTRICITY": "Energy",
  "SANITATION": "Sanitation & Waste",
  "LIVELIHOOD": "Rural Livelihoods",
  "ENVIRONMENT": "Environment",
  "GOVERNANCE": "Public Administration",
  "OTHER": "Other Grassroot Need"
};

const inferSector = (rawSector: string, title: string, description: string): string => {
  if (rawSector && rawSector !== "OTHER") {
    return rawSector;
  }
  const text = `${title || ""} ${description || ""}`.toLowerCase();
  if (text.includes("rice") || text.includes("paddy") || text.includes("crop") || text.includes("blast") || text.includes("kisan") || text.includes("farmer")) {
    return "AGRICULTURE";
  }
  if (text.includes("water") || text.includes("pump") || text.includes("dam") || text.includes("handpump")) {
    return "WATER";
  }
  if (text.includes("pollution") || text.includes("smoke") || text.includes("kiln") || text.includes("dust")) {
    return "ENVIRONMENT";
  }
  return rawSector || "OTHER";
};

const inferPriority = (rawPriority: string, title: string, description: string): string => {
  const text = `${title || ""} ${description || ""}`.toLowerCase();
  if (text.includes("outbreak") || text.includes("failure") || text.includes("blast") || text.includes("critical") || text.includes("epidemic")) {
    return "HIGH";
  }
  return rawPriority || "MEDIUM";
};

export function GovernmentDashboardView({
  activeTab = "overview",
  onNavigateTab,
}: GovernmentDashboardViewProps) {
  const { user, token } = useAuthStore();
  const { issues: storeIssues, setIssues: setStoreIssues, updateIssue } = useIssueStore();
  const departmentName = user?.orgName || "Department of Higher & Technical Education";

  const rawDistrict = user?.district?.trim() || "";
  const isDistrictScoped = Boolean(
    rawDistrict &&
    rawDistrict.toLowerCase() !== "statewide" &&
    rawDistrict.toLowerCase() !== "all" &&
    rawDistrict.toLowerCase() !== "all 24 districts" &&
    rawDistrict.toLowerCase() !== "jharkhand"
  );
  const districtJurisdiction = isDistrictScoped ? rawDistrict : "All 24 Districts";

  const [selectedDistrict, setSelectedDistrict] = useState<string>(districtJurisdiction);
  const [selectedAuditIssue, setSelectedAuditIssue] = useState<GrassrootIssueRecord | null>(null);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);

  const [escalations, setEscalations] = useState<EscalationItem[]>([]);
  const [resolvedEscalations, setResolvedEscalations] = useState<string[]>([]);

  // Keep selected district in sync if user changes or is scoped
  useEffect(() => {
    if (isDistrictScoped) {
      setSelectedDistrict(rawDistrict);
    }
  }, [isDistrictScoped, rawDistrict]);

  const activeDistrictFilter = isDistrictScoped ? rawDistrict : selectedDistrict;

  useEffect(() => {
    fetchIssues();
  }, [token, activeDistrictFilter]);

  const fetchIssues = async () => {
    setIsLoadingQueue(true);
    try {
      let districtParam = "";
      if (activeDistrictFilter !== "All 24 Districts") {
        districtParam = `&district=${encodeURIComponent(activeDistrictFilter)}`;
      }

      // Step 1: Try fetching real Nodal Triage Queue
      let url = `${API_BASE_URL}/triage/queue?page=0&size=200${districtParam}`;
      let res = await fetch(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      // Step 2: Fallback to /issues if not yet authorized as nodal or during transition
      if (!res.ok) {
        url = `${API_BASE_URL}/issues?page=0&size=200${districtParam}`;
        res = await fetch(url, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
      }

      if (res.ok) {
        const data = await res.json();
        if (data.content && Array.isArray(data.content) && data.content.length > 0) {
          const mapped: GrassrootIssueRecord[] = data.content.map((item: any) => {
            const title = item.title || "";
            const description = item.description || item.snippet || title;
            const sector = inferSector(item.sector, title, description);
            const domain = sectorToDomainMap[sector] || sector || "Agriculture";
            const priority = inferPriority(item.priority, title, description);

            return {
              id: item.issueNumber || `GRI-${item.id}`,
              numericId: item.id,
              title: title,
              description: description,
              sector: sector,
              domain: domain,
              district: item.district || "Ranchi",
              block: item.block,
              priority: priority,
              status: item.status || "SUBMITTED",
              validationStatus: item.validationStatus || "PASS",
              assignedHEI: item.assignedHEI || undefined,
              createdAt: item.createdAt || new Date().toISOString(),
              attachmentCount: item.attachmentCount || 1,
              validationReportJson: item.validationReportJson,
              isDuplicate: item.isDuplicate || false,
              duplicateClusterId: item.duplicateClusterId,
              potentialDuplicatesJson: item.potentialDuplicatesJson,
            };
          });

          setStoreIssues(mapped);
        } else {
          setStoreIssues([]);
        }
      } else {
        setStoreIssues([]);
      }
    } catch (e) {
      console.warn("Failed to fetch government dashboard issues from backend:", e);
    } finally {
      setIsLoadingQueue(false);
    }
  };

  const handleQuickValidate = async (issue: GrassrootIssueRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (issue.numericId) {
        const res = await fetch(`${API_BASE_URL}/triage/${issue.numericId}/validate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ notes: "Quick validated via Government Dashboard" })
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to validate grievance");
        }
      }
      updateIssue(issue.id, {
        status: "TRIAGED",
        validationStatus: "PASS"
      });
      toast.success(`Ticket #${issue.id} verified and marked TRIAGED.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to validate grievance");
    }
  };

  const filteredIssues = activeDistrictFilter === "All 24 Districts" 
    ? storeIssues 
    : storeIssues.filter((i) => i.district?.toLowerCase() === activeDistrictFilter.toLowerCase());

  const handleResolveEscalation = (id: string) => {
    setResolvedEscalations([...resolvedEscalations, id]);
    toast.success("Inter-departmental clearance granted successfully.");
  };

  const criticalCount = filteredIssues.filter((i) => i.priority === "CRITICAL" || i.priority === "HIGH").length;
  const assignedCount = filteredIssues.filter((i) => i.status === "ASSIGNED_HEI" || i.assignedHEI).length;

  return (
    <div className="p-6 sm:p-8 space-y-6 animate-in fade-in text-[#4a4a4a]">
      {/* Top Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#d9d9d9] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#1a0e3d] tracking-tight">
              Government Department Oversight Dashboard
            </h1>
            {isDistrictScoped ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-black bg-[#F2fcef] text-[#002110] border border-[#a3e635]">
                {rawDistrict} Collectorate Jurisdiction
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-black bg-[#F2efff] text-[#1a0e3d] border border-[#dcd3ff]">
                State Directorate Clearance (All 24 Districts)
              </span>
            )}
          </div>
          <p className="text-xs text-[#4a4a4a] mt-1">
            Welcome, <strong>{user?.name || "Nodal Officer"}</strong> ({departmentName}). {isDistrictScoped ? `Authorized jurisdiction: ${rawDistrict} District Collectorate.` : "Statewide jurisdiction: All 24 Jharkhand Districts."} Monitor innovation performance, inspect research domains, and approve inter-departmental clearances.
          </p>
        </div>

        <div className="text-right flex-shrink-0 flex items-center gap-2">
          {isDistrictScoped ? (
            <span className="text-xs font-bold text-[#002110] bg-[#F2fcef] border border-[#a3e635] px-3 py-1.5 shadow-2xs flex items-center gap-1.5">
              {rawDistrict} Nodal SSO
            </span>
          ) : (
            <span className="text-xs font-bold text-[#1a0e3d] bg-[#F2efff] border border-[#dcd3ff] px-3 py-1.5 shadow-2xs">
              {user?.orgCode || "e-Pramaan SSO • Level 4 State Clearance"}
            </span>
          )}
        </div>
      </div>

      {/* ── TAB 1: EXECUTIVE ANALYTICS OVERVIEW (CHART.JS) ── */}
      {activeTab === "overview" && (
        <GovernmentAnalyticsOverview
          issues={storeIssues}
          selectedDistrict={activeDistrictFilter}
          onSelectDistrict={isDistrictScoped ? undefined : setSelectedDistrict}
          isDistrictScoped={isDistrictScoped}
          onNavigateTab={onNavigateTab}
        />
      )}

      {/* ── TAB: MASTER AI ROUTING & HEI ALLOCATIONS ── */}
      {activeTab === "routing" && (
        <AiRoutingMasterOversight userDistrict={isDistrictScoped ? rawDistrict : undefined} />
      )}

      {/* ── TAB: STATEWIDE PROJECT LIFECYCLES & TRL MILESTONES ── */}
      {activeTab === "projects" && (
        <GovernmentProjectLifecycleOversight userDistrict={isDistrictScoped ? rawDistrict : undefined} />
      )}

      {/* ── TAB 2: DISTRICT INGESTION & REGISTRY TABLE ── */}
      {activeTab === "districts" && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#1a0e3d] uppercase tracking-wide">
                {isDistrictScoped ? `${rawDistrict} District Citizen Ingestions & AI Verification Registry` : "District-Level Citizen Ingestions & AI Verification Registry"}
              </h2>
              <p className="text-xs text-[#4a4a4a]">
                {isDistrictScoped ? `Live grievance triage queue for ${rawDistrict} Collectorate` : "Real-time status breakdown across Jharkhand district collectorates"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isDistrictScoped && (
                <span className="text-[11px] font-bold text-[#002110] bg-[#F2fcef] border border-[#a3e635] px-2.5 py-1">
                  Locked Jurisdiction
                </span>
              )}
              <select
                value={activeDistrictFilter}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                disabled={isDistrictScoped}
                className={`p-2 rounded-xl border border-[#d9d9d9] bg-white text-xs font-bold text-[#1a0e3d] outline-none shadow-xs focus:ring-1 focus:ring-[#1a0e3d] ${isDistrictScoped ? "bg-[#f5f5f5] opacity-80 cursor-not-allowed" : "cursor-pointer"}`}
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
            </div>
          </div>

          {filteredIssues.length === 0 ? (
            <div className="p-10 text-center bg-white border border-[#d9d9d9] rounded-2xl shadow-xs">
              <div className="w-10 h-10 rounded-full bg-[#F2efff] text-[#1a0e3d] flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-[#1a0e3d]">Live Ingestion Registry Ready</h3>
              <p className="text-xs text-[#4a4a4a] max-w-md mx-auto mt-1">
                District metrics will update in real time as citizen grievances are clustered and assigned to regional polytechnics, engineering colleges, and universities.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-[#d9d9d9] rounded-2xl shadow-xs overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F2efff] border-b border-[#d9d9d9] text-[#1a0e3d] font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Title &amp; Description</th>
                    <th className="py-3 px-4">Sector &amp; District</th>
                    <th className="py-3 px-4">Priority Tier</th>
                    <th className="py-3 px-4">Status &amp; Verification</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d9d9d9]/60 font-medium">
                  {filteredIssues.map((issue) => (
                    <tr key={issue.id} className="hover:bg-[#F2efff]/20 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#1a0e3d]">
                        {issue.id}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#1a0e3d]">{issue.title}</div>
                        <div className="text-[11px] text-[#4a4a4a] truncate max-w-xs">{issue.description}</div>
                        {issue.assignedHEI && (
                          <div className="text-[10px] text-[#32174a] font-bold mt-0.5">
                            HEI: {issue.assignedHEI}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#1a0e3d]">{issue.sector}</div>
                        <div className="text-[11px] text-[#4a4a4a] font-mono">
                          {issue.district}{issue.block ? ` • ${issue.block}` : ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[11px] font-bold border ${
                            issue.priority === "CRITICAL"
                              ? "bg-[#FFF8f8] text-[#3a0907] border-[#fecaca]"
                              : issue.priority === "HIGH"
                              ? "bg-[#FFF7e6] text-[#612500] border-[#fed7aa]"
                              : "bg-[#F2efff] text-[#1a0e3d] border-[#dcd3ff]"
                          }`}
                        >
                          {issue.priority || "MEDIUM"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          {issue.isDuplicate ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold bg-[#FFF5ea] text-[#803800] border border-[#fed7aa]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#d97706]" />
                              <span>DUPLICATE FLAGGED</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold bg-[#F2fcef] text-[#002110] border border-[#a3e635]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                              <span>AI VERIFIED</span>
                            </span>
                          )}

                          <span className={`text-[10px] font-bold px-2 py-0.5 border ${
                            issue.status === 'ASSIGNED_HEI'
                              ? 'bg-[#F2fcef] text-[#002110] border-[#a3e635]'
                              : issue.status === 'TRIAGED'
                              ? 'bg-[#F2efff] text-[#1a0e3d] border-[#dcd3ff]'
                              : issue.status === 'REJECTED'
                              ? 'bg-[#FFF8f8] text-[#3a0907] border-[#fecaca]'
                              : 'bg-[#FFF7e6] text-[#612500] border-[#fed7aa]'
                          }`}>
                            {issue.status || 'SUBMITTED'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {issue.status === 'SUBMITTED' && (
                            <button
                              type="button"
                              onClick={(e) => handleQuickValidate(issue, e)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#F2efff] text-[#1a0e3d] hover:bg-[#e4ddff] border border-[#dcd3ff] font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              Validate
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedAuditIssue(issue)}
                            className="px-3 py-1.5 rounded-lg bg-[#1a0e3d] hover:bg-[#2e1764] text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                          >
                            Inspect AI Audit →
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: DOMAIN HEATMAP ── */}
      {activeTab === "heatmap" && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#1a0e3d] uppercase tracking-wide">
                10 Official Research Domains: Ingestion Heatmap
              </h2>
              <p className="text-xs text-[#4a4a4a]">
                Live domain intensity &amp; CSR co-funding allocation benchmarks across Jharkhand
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {OFFICIAL_RESEARCH_DOMAINS.map((dom) => (
              <div key={dom} className="p-4 bg-white border border-[#d9d9d9] rounded-2xl shadow-xs space-y-1 text-xs hover:border-[#1a0e3d] transition-all">
                <span className="font-bold text-[#32174a] block truncate">{dom}</span>
                <span className="text-2xl font-black text-[#1a0e3d] font-mono block">
                  {filteredIssues.filter((i) => 
                    i.domain === dom || 
                    i.sector === dom || 
                    (i.domain && i.domain.toLowerCase().includes(dom.split(" ")[0].toLowerCase())) ||
                    (i.sector && i.sector.toLowerCase().includes(dom.split(" ")[0].toLowerCase()))
                  ).length}
                </span>
                <span className="inline-block text-[10px] text-[#803800] bg-[#FFF5ea] border border-[#fed7aa] px-2 py-0.5 font-mono font-bold">
                  ₹2.5L CSR Baseline
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Escalations & Approvals Tab */}
      {activeTab === "escalations" && (
        <WorkspacePlaceholderTab
          title="Government Escalations & Approvals"
          subtitle="Inter-Departmental Clearances & Bottleneck Triage"
          description="Review flagged citizen grievances requiring inter-departmental permissions, land clearances, or emergency funding sign-offs."
          role="government"
          tabId="escalations"
          features={[
            "Multi-Department Jurisdictional Escalation Matrix",
            "Expedited Statutory Clearances for Pilot Projects",
            "District Magistrate & Nodal Officer Direct Action Log",
            "Emergency Disaster Mitigation Protocol Dispatch",
          ]}
          onNavigateTab={onNavigateTab}
        />
      )}

      {/* ── TAB 4: DISTRICT-WISE STATUTORY REPORTS & CSV LEDGER ── */}
      {activeTab === "reports" && (
        <GovernmentDistrictReportsView userDistrict={isDistrictScoped ? rawDistrict : undefined} />
      )}

      {/* Catch-all fallback for unrecognized government tabs */}
      {![
        "overview",
        "routing",
        "projects",
        "districts",
        "heatmap",
        "escalations",
        "reports",
      ].includes(activeTab) && (
        <WorkspacePlaceholderTab
          title="Government Oversight Module"
          description="This module workspace is being provisioned according to platform specifications."
          role="government"
          tabId={activeTab}
          onNavigateTab={onNavigateTab}
        />
      )}

      {/* Modal: Inspect AI Audit Breakdown Card */}
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
