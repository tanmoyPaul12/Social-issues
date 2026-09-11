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
    title: "Citizen Workspace",
    items: [
      { id: "overview", label: "Overview" },
      { id: "submissions", label: "My Submissions" },
      { id: "report", label: "Report Challenge" },
      { id: "community", label: "Community Feed" },
      { id: "alerts", label: "Alerts & Notifications" },
      { id: "profile", label: "Profile" },
    ],
  },
  university: {
    title: "University Workspace",
    items: [
      { id: "overview", label: "Overview" },
      { id: "inbox", label: "Assigned Challenges" },
      { id: "challenges", label: "Challenge Pool" },
      { id: "projects", label: "Capstone Projects" },
      { id: "accreditation", label: "NAAC & NEP Credits", badge: "NEW" },
      { id: "teams", label: "Team Allocator" },
      { id: "industry", label: "Industry CSR Hub" },
      { id: "users", label: "Student & Faculty Accounts" },
    ],
  },
  industry: {
    title: "Industry Workspace",
    items: [
      { id: "overview", label: "Overview" },
      { id: "challenges", label: "Explore Challenges" },
      { id: "collaborations", label: "My Collaborations" },
      { id: "funding", label: "Mentorship & Funding" },
      { id: "prototyping", label: "Prototyping & Testing" },
      { id: "ip", label: "IP & Tech Transfer", badge: "NEW" },
      { id: "analytics", label: "Analytics", badge: "PLANNED" },
      { id: "communication", label: "Communication", badge: "PLANNED" },
      { id: "profile", label: "Profile & Capabilities" },
    ],
  },
  government: {
    title: "Government Oversight",
    items: [
      { id: "overview", label: "Overview" },
      { id: "districts", label: "District Ingestion" },
      { id: "heatmap", label: "Domain Heatmap" },
      { id: "escalations", label: "Escalations & Approvals" },
      { id: "reports", label: "State Reports" },
    ],
  },
  admin: {
    title: "Platform Administration",
    items: [
      { id: "overview", label: "Overview" },
      { id: "verifications", label: "Entity Verifications" },
      { id: "taxonomy", label: "Domain Taxonomy" },
      { id: "moderation", label: "Content Moderation" },
      { id: "system", label: "System Health & SDC" },
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
