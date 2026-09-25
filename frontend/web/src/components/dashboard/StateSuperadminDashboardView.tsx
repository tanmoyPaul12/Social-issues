"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useIssueStore, GrassrootIssueRecord } from "@/lib/store/useIssueStore";
import { toast } from "@/components/dashboard/ToastStack";
import { AiRoutingMasterOversight } from "./government/AiRoutingMasterOversight";
import { GovernmentProjectLifecycleOversight } from "./government/GovernmentProjectLifecycleOversight";
import { GovernmentDistrictReportsView } from "./government/GovernmentDistrictReportsView";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const JHARKHAND_24_DISTRICTS = [
  "Ranchi", "Dhanbad", "East Singhbhum (Jamshedpur)", "Bokaro", "Hazaribagh",
  "Deoghar", "Dumka", "Giridih", "Ramgarh", "Palamu", "West Singhbhum (Chaibasa)",
  "Saraikela Kharsawan", "Garhwa", "Chatra", "Godda", "Gumla", "Jamtara",
  "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Sahibganj", "Simdega"
];

interface DistrictStatusItem {
  district: string;
  isStateSuperAdmin?: boolean;
  isAssigned: boolean;
  nodalOfficerName: string | null;
  serviceCode: string | null;
  designation: string | null;
}

interface StateSuperadminDashboardViewProps {
  activeTab?: string;
  onNavigateTab?: (tabId: string) => void;
}

export function StateSuperadminDashboardView({
  activeTab = "overview",
  onNavigateTab,
}: StateSuperadminDashboardViewProps) {
  const { user, token } = useAuthStore();
  const { issues: storeIssues, setIssues: setStoreIssues, updateIssue } = useIssueStore();

  const [selectedDistrict, setSelectedDistrict] = useState<string>("All 24 Districts");
  const [districtStatuses, setDistrictStatuses] = useState<DistrictStatusItem[]>([]);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);
  const [officerSearch, setOfficerSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ASSIGNED" | "VACANT">("ALL");

  // Load district statuses from backend
  useEffect(() => {
    async function loadDistricts() {
      setIsLoadingDistricts(true);
      try {
        const res = await fetch(`${API_BASE_URL}/onboarding/government/districts-status`, {
          cache: "no-store",
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setDistrictStatuses(data);
          }
        }
      } catch (err) {
        console.warn("Could not load district statuses:", err);
      } finally {
        setIsLoadingDistricts(false);
      }
    }
    loadDistricts();
  }, [token]);

  // Load statewide or district-filtered issues
  useEffect(() => {
    async function fetchStateIssues() {
      setIsLoadingQueue(true);
      try {
        let districtParam = "";
        if (selectedDistrict !== "All 24 Districts") {
          districtParam = `&district=${encodeURIComponent(selectedDistrict)}`;
        }

        let url = `${API_BASE_URL}/triage/queue?page=0&size=200${districtParam}`;
        let res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (!res.ok) {
          url = `${API_BASE_URL}/issues?page=0&size=200${districtParam}`;
          res = await fetch(url, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
        }

        if (res.ok) {
          const data = await res.json();
          if (data.content && Array.isArray(data.content)) {
            const mapped: GrassrootIssueRecord[] = data.content.map((item: any) => ({
              id: item.issueNumber || `GRI-${item.id}`,
              numericId: item.id,
              title: item.title || "",
              description: item.description || item.snippet || item.title || "",
              sector: item.sector || "OTHER",
              domain: item.domain || "Civic Technology",
              district: item.district || "Ranchi",
              block: item.block,
              priority: item.priority || "MEDIUM",
              status: item.status || "SUBMITTED",
              validationStatus: item.validationStatus || "PASS",
              assignedHEI: item.assignedHEI || undefined,
              createdAt: item.createdAt || new Date().toISOString(),
              attachmentCount: item.attachmentCount || 1,
              validationReportJson: item.validationReportJson,
              isDuplicate: item.isDuplicate || false,
              duplicateClusterId: item.duplicateClusterId,
              potentialDuplicatesJson: item.potentialDuplicatesJson,
            }));
            setStoreIssues(mapped);
          } else {
            setStoreIssues([]);
          }
        }
      } catch (err) {
        console.warn("Error fetching statewide issues:", err);
      } finally {
        setIsLoadingQueue(false);
      }
    }
    fetchStateIssues();
  }, [token, selectedDistrict, setStoreIssues]);

  // Metrics computation
  const totalIssues = storeIssues.length;
  const triagedIssues = storeIssues.filter((i) => i.status === "TRIAGED" || i.validationStatus === "PASS").length;
  const activeProjectsCount = storeIssues.filter((i) => i.assignedHEI).length;
  const assignedNodalCount = districtStatuses.filter((d) => !d.isStateSuperAdmin && d.isAssigned).length;
  const vacantNodalCount = 24 - assignedNodalCount;

  // Filtered district nodal officer roster
  const filteredNodalList = useMemo(() => {
    return districtStatuses
      .filter((d) => !d.isStateSuperAdmin)
      .filter((d) => {
        if (statusFilter === "ASSIGNED") return d.isAssigned;
        if (statusFilter === "VACANT") return !d.isAssigned;
        return true;
      })
      .filter((d) => {
        if (!officerSearch.trim()) return true;
        const q = officerSearch.toLowerCase();
        return (
          d.district.toLowerCase().includes(q) ||
          (d.nodalOfficerName && d.nodalOfficerName.toLowerCase().includes(q)) ||
          (d.serviceCode && d.serviceCode.toLowerCase().includes(q)) ||
          (d.designation && d.designation.toLowerCase().includes(q))
        );
      });
  }, [districtStatuses, statusFilter, officerSearch]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Top Directorate Command Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-indigo-50/70 via-blue-50/40 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-0.5 text-[11px] font-black tracking-wide bg-indigo-100 text-indigo-900 border border-indigo-200">
                STATE DIRECTORATE EXECUTIVE COMMAND
              </span>
              
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              Jharkhand State Innovation & R&D Directorate
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Welcome, <strong>{user?.name || "State Nodal Director"}</strong> ({user?.orgName || "Department of Higher & Technical Education"}). 
              State-level authority active across all 24 Jharkhand District Collectorates, HEI Capstone Centers, and Industry CSR Co-funding Partners.
            </p>
          </div>

          {/* Quick District Switcher for Statewide Superadmin */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
              <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Active View:</span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 outline-none focus:ring-1 focus:ring-indigo-600 cursor-pointer shadow-2xs"
              >
                <option value="All 24 Districts">All 24 Districts (Statewide)</option>
                {JHARKHAND_24_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d} District
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => onNavigateTab ? onNavigateTab("reports") : null}
              type="button"
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Cabinet Dossier</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statewide Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Districts Monitored</span>
            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">24</span>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-slate-900">24 / 24</span>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">100% State Coverage</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nodal Officers</span>
            <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </span>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-slate-900">{assignedNodalCount} <span className="text-xs text-slate-400 font-bold">/ 24</span></span>
            <p className="text-[11px] text-slate-600 font-medium mt-0.5">{vacantNodalCount > 0 ? `${vacantNodalCount} seats unassigned` : "Fully provisioned"}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Ingestions</span>
            <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </span>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-slate-900">{totalIssues}</span>
            <p className="text-[11px] text-slate-600 font-medium mt-0.5">Grassroots challenges</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Triaged / Verified</span>
            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </span>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-emerald-700">{triagedIssues}</span>
            <p className="text-[11px] text-slate-600 font-medium mt-0.5">
              {totalIssues > 0 ? `${Math.round((triagedIssues / totalIssues) * 100)}% Pass Rate` : "100% SLA"}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active R&D Pipelines</span>
            <span className="w-6 h-6 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </span>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-purple-900">{activeProjectsCount}</span>
            <p className="text-[11px] text-purple-700 font-medium mt-0.5">Cross-HEI Allocations</p>
          </div>
        </div>
      </div>

      {/* Main Tab Routing */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* 24-District Interactive Innovation & Triage Radar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  24 Jharkhand Districts • Real-Time Innovation & Triage Radar
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live status, nodal officer assignments, and grievance triage capacity across all collectorates.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Quick Filter:</span>
                <button
                  type="button"
                  onClick={() => setSelectedDistrict("All 24 Districts")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    selectedDistrict === "All 24 Districts"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  All (Statewide)
                </button>
              </div>
            </div>

            {/* 24 Districts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {JHARKHAND_24_DISTRICTS.map((dist) => {
                const distInfo = districtStatuses.find(
                  (d) => d.district.toLowerCase() === dist.toLowerCase() ||
                         d.district.toLowerCase().includes(dist.toLowerCase())
                );
                const isSelected = selectedDistrict.toLowerCase() === dist.toLowerCase();
                const districtIssuesCount = storeIssues.filter(
                  (i) => i.district && i.district.toLowerCase().includes(dist.toLowerCase())
                ).length;

                return (
                  <div
                    key={dist}
                    onClick={() => setSelectedDistrict(dist)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-600"
                        : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50/80 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-black text-slate-900 truncate">{dist}</span>
                      <span
                        className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                          distInfo?.isAssigned
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {distInfo?.isAssigned ? "Assigned" : "Vacant"}
                      </span>
                    </div>

                    <div className="text-[11px] space-y-0.5">
                      <p className="text-slate-600 truncate">
                        Officer: <strong className="text-slate-900">{distInfo?.nodalOfficerName || "Unassigned"}</strong>
                      </p>
                      <p className="text-slate-500 font-mono text-[10px] truncate">
                        {distInfo?.serviceCode || "No Service ID"}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                      <span>{districtIssuesCount} Grievances</span>
                      <span className="text-indigo-600 font-bold hover:underline">Inspect →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Statewide AI Master Routing Quick Preview */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Statewide Grievance Ingestions & AI Verification Feed ({selectedDistrict})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time pipeline of incoming challenges awaiting academic team assignment or ministerial clearance.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigateTab ? onNavigateTab("routing") : null}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Open Full Master Routing</span>
                <span>→</span>
              </button>
            </div>

            {isLoadingQueue ? (
              <div className="py-12 text-center text-slate-500 text-xs font-bold">
                <span className="inline-block w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2 align-middle" />
                Loading Statewide Intake Pipeline...
              </div>
            ) : storeIssues.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs font-medium">
                No active challenges found for the selected district scope ({selectedDistrict}).
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-y border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Ticket ID</th>
                      <th className="py-2.5 px-3">Challenge Title</th>
                      <th className="py-2.5 px-3">District</th>
                      <th className="py-2.5 px-3">Sector</th>
                      <th className="py-2.5 px-3">Priority</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {storeIssues.slice(0, 8).map((issue) => (
                      <tr key={issue.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{issue.id}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-900 max-w-xs truncate">{issue.title}</td>
                        <td className="py-2.5 px-3">{issue.district}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                            {issue.sector}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              issue.priority === "HIGH"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : issue.priority === "MEDIUM"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {issue.priority}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {issue.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => onNavigateTab ? onNavigateTab("routing") : null}
                            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[11px] font-bold text-slate-800 transition-colors"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: 24 District Nodal Officers Administration & Directory */}
      {activeTab === "nodal_officers" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                24 District Nodal Officers Roster & Governance
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage, audit, and direct the designated district officers across all 24 Jharkhand collectorates.
              </p>
            </div>

            {/* Filter and Search Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <input
                type="text"
                placeholder="Search district, officer, service ID..."
                value={officerSearch}
                onChange={(e) => setOfficerSearch(e.target.value)}
                className="px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:ring-1 focus:ring-indigo-600 w-64 font-medium"
              />

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setStatusFilter("ALL")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    statusFilter === "ALL" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All ({districtStatuses.filter((d) => !d.isStateSuperAdmin).length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("ASSIGNED")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    statusFilter === "ASSIGNED" ? "bg-emerald-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Assigned ({assignedNodalCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("VACANT")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    statusFilter === "VACANT" ? "bg-amber-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Vacant ({vacantNodalCount})
                </button>
              </div>
            </div>
          </div>

          {/* Nodal Officers Grid / Table */}
          {isLoadingDistricts ? (
            <div className="py-16 text-center text-slate-500 text-xs font-bold">
              <span className="inline-block w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2 align-middle" />
              Loading Official Nodal Directory...
            </div>
          ) : filteredNodalList.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs font-medium">
              No district records match your search criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNodalList.map((d) => (
                <div
                  key={d.district}
                  className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col justify-between gap-3.5 hover:bg-white hover:border-indigo-200 transition-all shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 tracking-tight">{d.district} District</h3>
                      <span className="text-[11px] text-slate-500 font-medium">{d.designation || "District Collectorate"}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        d.isAssigned
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                          : "bg-amber-100 text-amber-900 border border-amber-200"
                      }`}
                    >
                      {d.isAssigned ? "Active Officer" : "Seat Vacant"}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs bg-white p-3 rounded-lg border border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Nodal Officer:</span>
                      <strong className="text-slate-900 font-bold">{d.nodalOfficerName || "Not Provisioned"}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Service Code:</span>
                      <span className="font-mono text-slate-700 text-[11px] font-bold">{d.serviceCode || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Jurisdiction:</span>
                      <span className="text-slate-700 text-[11px] font-medium">District Exclusive</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDistrict(d.district);
                        if (onNavigateTab) onNavigateTab("routing");
                      }}
                      className="flex-1 py-1.5 bg-slate-900 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all text-center shadow-2xs"
                    >
                      Audit Queue
                    </button>
                    <button
                      type="button"
                      onClick={() => toast.success(`State Directive dispatched to ${d.nodalOfficerName || d.district} Collectorate.`)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-all shadow-2xs"
                    >
                      Directive
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Master AI Routing & Allocations */}
      {activeTab === "routing" && (
        <AiRoutingMasterOversight
          userDistrict={selectedDistrict === "All 24 Districts" ? undefined : selectedDistrict}
        />
      )}

      {/* Tab 4: Statewide R&D Lifecycle & Clearances */}
      {activeTab === "projects" && (
        <GovernmentProjectLifecycleOversight
          userDistrict={selectedDistrict === "All 24 Districts" ? undefined : selectedDistrict}
        />
      )}

      {/* Tab 5: Cabinet & Statutory Reports */}
      {activeTab === "reports" && (
        <GovernmentDistrictReportsView
          userDistrict={selectedDistrict === "All 24 Districts" ? undefined : selectedDistrict}
        />
      )}
    </div>
  );
}
