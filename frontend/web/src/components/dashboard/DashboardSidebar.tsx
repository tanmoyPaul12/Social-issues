"use client";

import React from "react";
import { DashboardRole } from "./DashboardNavbar";

export interface SidebarItem {
  id: string;
  label: string;
  badge?: string;
}

interface DashboardSidebarProps {
  activeRole: DashboardRole;
  activeItem: string;
  onSelectItem: (id: string) => void;
}

const SIDEBAR_CONFIG: Record<DashboardRole, { title: string; items: SidebarItem[] }> = {
  citizen: {
    title: "Citizen Portal",
    items: [
      { id: "overview", label: "Dashboard Overview" },
      { id: "submissions", label: "My Submissions" },
      { id: "report", label: "Report New Challenge" },
      { id: "community", label: "District Community Feed" },
      { id: "alerts", label: "Notifications & Alerts" },
      { id: "profile", label: "Citizen Profile" },
    ],
  },
  university: {
    title: "University (HEI) Portal",
    items: [
      { id: "overview", label: "Dashboard Overview" },
      { id: "inbox", label: "Routed AI Challenges" },
      { id: "projects", label: "Active Capstone Projects" },
      { id: "teams", label: "Team & Faculty Allocator" },
      { id: "industry", label: "Industry CSR Offers" },
      { id: "users", label: "Faculty & Student Accounts" },
    ],
  },
  industry: {
    title: "Industry & CSR Portal",
    items: [
      { id: "overview", label: "Dashboard Overview" },
      { id: "marketplace", label: "University R&D Marketplace" },
      { id: "engagements", label: "Active Co-Funded Projects" },
      { id: "csr", label: "CSR Compliance & Ledger" },
      { id: "testbeds", label: "Field Testbed Deployments" },
      { id: "settings", label: "Company Profile & Settings" },
    ],
  },
  government: {
    title: "Government Oversight",
    items: [
      { id: "overview", label: "Dashboard Overview" },
      { id: "districts", label: "District-Wise Ingestion" },
      { id: "heatmap", label: "Domain Analytics Heatmap" },
      { id: "escalations", label: "Escalations & Approvals" },
      { id: "reports", label: "State Cabinet Reports (PDF)" },
    ],
  },
  admin: {
    title: "Platform Administration",
    items: [
      { id: "overview", label: "Dashboard Overview" },
      { id: "verifications", label: "HEI & CSR Verifications" },
      { id: "taxonomy", label: "Research Domain Taxonomy" },
      { id: "moderation", label: "Content Moderation & Flags" },
      { id: "system", label: "System Health & SDC Audit" },
      { id: "sessions", label: "Session Management" },
    ],
  },
};

export function DashboardSidebar({ activeRole, activeItem, onSelectItem }: DashboardSidebarProps) {
  const roleConfig = SIDEBAR_CONFIG[activeRole];

  return (
    <aside className="w-60 sm:w-64 bg-[#f8fafc] border-r border-slate-200 h-full flex-shrink-0 flex flex-col justify-between overflow-y-auto select-none">
      {/* Sidebar navigation list */}
      <nav className="divide-y divide-slate-200/80">
        {roleConfig.items.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem(item.id)}
              className={`w-full text-left px-5 py-3.5 text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                isActive
                  ? "bg-slate-200/90 text-slate-950 font-black border-l-4 border-slate-900"
                  : "bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isActive ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
