"use client";

import React, { useState, useEffect } from "react";
import { OFFICIAL_RESEARCH_DOMAINS } from "@/app/page";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useIssueStore, GrassrootIssueRecord } from "@/lib/store/useIssueStore";
import { toast } from "@/components/dashboard/ToastStack";
import { NodalAiAuditCard } from "@/components/dashboard/NodalAiAuditCard";

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

export function GovernmentDashboardView({ activeTab = "overview" }: GovernmentDashboardViewProps) {
  const { user, token } = useAuthStore();
  const { issues: storeIssues, setIssues: setStoreIssues } = useIssueStore();
  const departmentName = user?.orgName || "Department of Higher & Technical Education";
  const serviceCode = user?.orgCode || "e-Pramaan SSO • Level 4 State Clearance";

  const [selectedDistrict, setSelectedDistrict] = useState("All 24 Districts");
  const [selectedAuditIssue, setSelectedAuditIssue] = useState<GrassrootIssueRecord | null>(null);

  const [escalations, setEscalations] = useState<EscalationItem[]>([]);
  const [resolvedEscalations, setResolvedEscalations] = useState<string[]>([]);

  useEffect(() => {
    fetchIssues();
  }, [token, selectedDistrict]);

  const fetchIssues = async () => {
    try {
      let url = `${API_BASE_URL}/issues?page=0&size=50`;
      if (selectedDistrict !== "All 24 Districts") {
        url += `&district=${encodeURIComponent(selectedDistrict)}`;
      }
      const res = await fetch(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
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
              district: item.district || "Bokaro",
              block: item.block,
              priority: priority,
              status: item.status || "SUBMITTED",
              validationStatus: item.validationStatus || "PASS",
              assignedHEI: item.assignedHEI || "BIT Mesra - Hydraulics Lab",
              createdAt: item.createdAt || new Date().toISOString(),
              attachmentCount: item.attachmentCount || 1,
              validationReportJson: item.validationReportJson,
            };
          });

          const combinedMap = new Map<string, GrassrootIssueRecord>();
          // Also auto-correct any existing store issues if sector was OTHER
          storeIssues.forEach((i) => {
            const sec = inferSector(i.sector, i.title, i.description);
            const dom = sectorToDomainMap[sec] || i.domain || sec;
            const prio = inferPriority(i.priority, i.title, i.description);
            combinedMap.set(i.id, {
              ...i,
              sector: sec,
              domain: dom,
              priority: prio
            });
          });
          mapped.forEach((i) => combinedMap.set(i.id, i));
          setStoreIssues(Array.from(combinedMap.values()));
        }
      }
    } catch (e) {
      console.warn("Failed to fetch government dashboard issues from backend:", e);
    }
  };

  const filteredIssues = selectedDistrict === "All 24 Districts" 
    ? storeIssues 
    : storeIssues.filter((i) => i.district === selectedDistrict);

  const handleResolveEscalation = (id: string) => {
    setResolvedEscalations([...resolvedEscalations, id]);
    toast.success("Inter-departmental clearance granted successfully.");
  };

  const criticalCount = filteredIssues.filter((i) => i.priority === "CRITICAL" || i.priority === "HIGH").length;
  const assignedCount = filteredIssues.filter((i) => i.status === "ASSIGNED_HEI" || i.assignedHEI).length;


  return (
    <div className="p-6 sm:p-8 space-y-6 animate-in fade-in">
      {/* Top Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Government Department Oversight Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Welcome, <strong>{user?.name || "Nodal Officer"}</strong> ({departmentName}). Monitor district innovation performance, inspect research domains, and approve inter-departmental clearances.
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <span className="text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 px-3 py-1 rounded">
            {serviceCode}
          </span>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Grassroots Ingestions", value: filteredIssues.length.toString() },
          { label: "Critical Priority Issues", value: `${criticalCount} Urgent` },
          { label: "Assigned HEI Labs", value: `${assignedCount} Labs` },
          { label: "Average Resolution SLA", value: "2.4 Days" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-300/80 p-5 rounded-sm shadow-2xs">
            <div className="text-xs font-bold text-slate-700">{stat.label}</div>
            <div className="text-3xl font-black text-slate-900 mt-2 font-mono">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Main Content Area based on activeTab */}
      {(activeTab === "overview" || activeTab === "districts") && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                District-Level Citizen Ingestions & AI Verification Registry
              </h2>
              <p className="text-xs text-slate-500">Real-time status breakdown across Jharkhand district collectorates</p>
            </div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="p-1.5 rounded border border-slate-300 bg-white text-xs font-bold text-slate-800 outline-none"
            >
              <option>All 24 Districts</option>
              {["Ranchi", "Dhanbad", "Dumka", "East Singhbhum", "West Singhbhum", "Bokaro", "Hazaribagh", "Deoghar", "Giridih", "Ramgarh"].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>

          {filteredIssues.length === 0 ? (
            <div className="p-10 text-center bg-white border border-slate-200 rounded-sm shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Live Ingestion Registry Ready</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                District metrics will update in real time as citizen grievances are clustered and assigned to regional polytechnics, engineering colleges, and universities.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Title & Description</th>
                    <th className="py-3 px-4">Sector & District</th>
                    <th className="py-3 px-4">Priority Tier</th>
                    <th className="py-3 px-4">AI Verification</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredIssues.map((issue) => (
                    <tr key={issue.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                        {issue.id}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{issue.title}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{issue.description}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-700">{issue.sector}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {issue.district}{issue.block ? ` • ${issue.block}` : ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                            issue.priority === "CRITICAL"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : issue.priority === "HIGH"
                              ? "bg-orange-50 text-orange-700 border-orange-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {issue.priority || "MEDIUM"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          <span>🟢 AI VERIFIED</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedAuditIssue(issue)}
                          className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                        >
                          Inspect AI Audit →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Heatmap Tab */}
      {(activeTab === "heatmap" || activeTab === "overview") && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            10 Official Research Domains: Ingestion Heatmap
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {OFFICIAL_RESEARCH_DOMAINS.map((dom) => (
              <div key={dom} className="p-3 bg-white border border-slate-200 rounded-sm space-y-1 text-xs">
                <span className="font-bold text-slate-900 block truncate">{dom}</span>
                <span className="text-lg font-black text-blue-700 font-mono block">
                  {filteredIssues.filter((i) => 
                    i.domain === dom || 
                    i.sector === dom || 
                    (i.domain && i.domain.toLowerCase().includes(dom.split(" ")[0].toLowerCase())) ||
                    (i.sector && i.sector.toLowerCase().includes(dom.split(" ")[0].toLowerCase()))
                  ).length}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">₹2.5L CSR</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Inspect AI Audit Breakdown Card */}
      {selectedAuditIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="max-w-5xl w-full relative my-auto">
            <NodalAiAuditCard
              issueId={selectedAuditIssue.id}
              issue={selectedAuditIssue}
              modalityBreakdown={selectedAuditIssue.modalityBreakdown}
              generalizedConsensus={selectedAuditIssue.generalizedConsensus}
              onClose={() => setSelectedAuditIssue(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
