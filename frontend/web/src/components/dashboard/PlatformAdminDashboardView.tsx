"use client";

import React, { useState } from "react";
import { OFFICIAL_RESEARCH_DOMAINS } from "@/app/page";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "@/components/dashboard/ToastStack";

interface PendingVerification {
  id: string;
  name: string;
  type: "HEI / University" | "Corporate CSR" | "Government Department";
  identifier: string;
  contactSpoc: string;
  submittedOn: string;
  status: "Pending" | "Approved" | "Rejected";
}

interface PlatformAdminDashboardViewProps {
  activeTab?: string;
}

export function PlatformAdminDashboardView({ activeTab = "overview" }: PlatformAdminDashboardViewProps) {
  const { user } = useAuthStore();
  const adminName = user?.name || "Super Administrator";

  const [pendingList, setPendingList] = useState<PendingVerification[]>([]);

  const handleAction = (id: string, newStatus: "Approved" | "Rejected") => {
    const item = pendingList.find((p) => p.id === id);
    setPendingList(
      pendingList.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
    );
    if (newStatus === "Approved") {
      toast.success(`Approved verification credentials for ${item?.name || id}`);
    } else {
      toast.warning(`Rejected verification request for ${item?.name || id}`);
    }
  };

  const pendingHEI = pendingList.filter((p) => p.type === "HEI / University" && p.status === "Pending").length;
  const pendingCSR = pendingList.filter((p) => p.type === "Corporate CSR" && p.status === "Pending").length;

  return (
    <div className="p-6 sm:p-8 space-y-6 animate-in fade-in">
      {/* Top Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            System Administrator Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Welcome, <strong>{adminName}</strong>. Manage institution credentials, configure domain taxonomy, and inspect SDC system health.
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <span className="text-xs font-bold text-rose-900 bg-rose-50 border border-rose-200 px-3 py-1 rounded">
            SuperAdmin • jh-sih-prod-01
          </span>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pending HEI Verifications", value: pendingHEI },
          { label: "Pending CSR Registrations", value: pendingCSR },
          { label: "Active Research Domains", value: OFFICIAL_RESEARCH_DOMAINS.length },
          { label: "SDC Health Uptime", value: "99.98%" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-300/80 p-5 rounded-sm shadow-2xs">
            <div className="text-xs font-bold text-slate-700">{stat.label}</div>
            <div className="text-3xl font-black text-slate-900 mt-2 font-mono">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Main Content Area based on activeTab */}
      {(activeTab === "overview" || activeTab === "verifications") && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Pending Institutional &amp; Corporate Verifications ({pendingList.filter((p) => p.status === "Pending").length})
              </h2>
              <p className="text-xs text-slate-500">Verify government AISHE and MCA Form CSR-1 credentials before unlocking full ecosystem access</p>
            </div>
          </div>

          {pendingList.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-sm shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-slate-900">All Verifications Cleared</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                No pending AISHE, GSTIN, or MCA CSR-1 verifications awaiting manual administrative audit.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Entity ID</th>
                    <th className="py-3 px-4">Organization Name</th>
                    <th className="py-3 px-4">Stakeholder Type</th>
                    <th className="py-3 px-4">Identifiers</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {pendingList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-800">{item.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[11px] text-slate-500">SPOC: {item.contactSpoc}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">{item.type}</td>
                      <td className="py-3.5 px-4 font-mono text-blue-700">{item.identifier}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            item.status === "Approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : item.status === "Rejected"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {item.status === "Pending" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleAction(item.id, "Approved")}
                              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAction(item.id, "Rejected")}
                              className="px-2 rounded border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-bold">{item.status}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Taxonomy Tab */}
      {(activeTab === "taxonomy" || activeTab === "overview") && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            10 Official Research Domains Taxonomy Configuration
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {OFFICIAL_RESEARCH_DOMAINS.map((domain, idx) => (
              <div key={domain} className="p-3 bg-white border border-slate-200 rounded-sm text-xs space-y-1">
                <div className="flex justify-between font-mono text-[10px] text-slate-400">
                  <span>#{idx + 1}</span>
                  <span className="text-emerald-700 font-bold">Active</span>
                </div>
                <strong className="text-slate-900 block truncate">{domain}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Moderation Tab */}
      {activeTab === "moderation" && (
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Content Moderation &amp; Duplicate Ingestion Triage
          </h2>

          <div className="p-8 text-center bg-white border border-slate-200 rounded-sm shadow-2xs">
            <p className="text-xs text-slate-500">
              No flagged content or duplicate submissions pending manual moderation.
            </p>
          </div>
        </div>
      )}

      {/* System Health / SDC */}
      {(activeTab === "system" || activeTab === "sessions") && (
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            State Data Centre (SDC) Telemetry &amp; Sessions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { service: "PostgreSQL Database Cluster", status: "Healthy", latency: "8ms", uptime: "99.99%" },
              { service: "Jharkhand e-Pramaan SSO Gateway", status: "Operational", latency: "42ms", uptime: "99.95%" },
              { service: "SMS OTP Delivery Gateway", status: "Normal", latency: "1.2s avg", uptime: "99.80%" },
            ].map((svc, i) => (
              <div key={i} className="p-4 bg-white border border-slate-200 rounded-sm space-y-1 text-xs">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{svc.service}</span>
                  <span className="text-emerald-700">● {svc.status}</span>
                </div>
                <div className="flex justify-between text-slate-500 pt-2 border-t border-slate-100 font-mono text-[11px]">
                  <span>Latency: {svc.latency}</span>
                  <span>Uptime: {svc.uptime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
