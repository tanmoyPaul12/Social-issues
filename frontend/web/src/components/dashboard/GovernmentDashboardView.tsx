"use client";

import React, { useState } from "react";
import { OFFICIAL_RESEARCH_DOMAINS } from "@/app/page";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "@/components/dashboard/ToastStack";

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

export function GovernmentDashboardView({ activeTab = "overview" }: GovernmentDashboardViewProps) {
  const { user } = useAuthStore();
  const departmentName = user?.orgName || "Department of Higher & Technical Education";
  const serviceCode = user?.orgCode || "e-Pramaan SSO • Level 4 State Clearance";

  const [selectedDistrict, setSelectedDistrict] = useState("All 24 Districts");
  const [escalations, setEscalations] = useState<EscalationItem[]>([]);
  const [resolvedEscalations, setResolvedEscalations] = useState<string[]>([]);

  const handleResolveEscalation = (id: string) => {
    setResolvedEscalations([...resolvedEscalations, id]);
    toast.success("Inter-departmental clearance granted successfully.");
  };

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
          { label: "Grassroots Ingestions", value: "0" },
          { label: "Assigned HEI Labs", value: "0 Labs" },
          { label: "CSR Capital Mobilized", value: "₹0.0 Cr" },
          { label: "Average Resolution SLA", value: "0 Days" },
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
                District-Level Ingestion &amp; Lab Performance (24 Districts)
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
                <span className="text-lg font-black text-blue-700 font-mono block">0</span>
                <span className="text-[10px] text-slate-400 font-mono">₹0.0L CSR</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Escalations Tab */}
      {(activeTab === "escalations") && (
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Inter-Departmental Escalations &amp; Fast-Track Approvals ({escalations.length - resolvedEscalations.length})
          </h2>

          {escalations.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-sm shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-slate-900">No Inter-Departmental Escalations Pending</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                All field pilot regulatory clearances and administrative approvals are up to date across all 24 districts.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {escalations.map((esc) => {
                const isResolved = resolvedEscalations.includes(esc.id);
                return (
                  <div key={esc.id} className="p-4 bg-white border border-slate-200 rounded-sm shadow-2xs flex justify-between items-center text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{esc.ticketId}</span>
                        <strong className="text-sm text-slate-900">{esc.title}</strong>
                      </div>
                      <span className="text-slate-500 mt-1 block">{esc.department} • {esc.reason}</span>
                    </div>
                    {isResolved ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Approved</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleResolveEscalation(esc.id)}
                        className="px-3 py-1.5 rounded bg-slate-900 text-white font-bold hover:bg-slate-800"
                      >
                        {esc.actionRequired} →
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            State Cabinet Policy &amp; Impact Reports
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Jharkhand Grassroots Innovation Annual Brief", date: "FY 2026-27" },
              { title: "University R&D Capstone Participation Index", date: "Statewide Summary" },
              { title: "CSR Co-Investment & Village Deployments CSV", date: "Live Feed" },
            ].map((r, i) => (
              <div key={i} className="p-4 bg-white border border-slate-200 rounded-sm space-y-3 text-xs">
                <h4 className="font-bold text-slate-900">{r.title}</h4>
                <span className="text-slate-400 block">{r.date}</span>
                <button type="button" className="w-full py-1.5 rounded bg-slate-900 text-white font-bold hover:bg-slate-800">
                  Download Brief PDF →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
