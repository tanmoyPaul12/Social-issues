"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useIndustryPitchStore } from "@/lib/store/useIndustryPitchStore";
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
      { id: "communication", label: "Communication & Messaging", badge: "LIVE" },
    ],
  },
  industry: {
    title: "Industry Workspace",
    items: [
      { id: "overview", label: "Overview" },
      { id: "marketplace", label: "Explore Innovations" },
      { id: "collaborations", label: "My Co-Funded Projects" },
      { id: "testbeds", label: "Field Testbeds", badge: "LIVE" },
      { id: "funding", label: "CSR Co-Funding & Mentorship" },
      { id: "ip", label: "IP & Tech Transfer" },
      { id: "analytics", label: "Impact & Analytics" },
      { id: "notifications", label: "Notifications", badge: "3" },
      { id: "communication", label: "Communication" },
      { id: "settings", label: "Company Settings" },
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
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pendingPitchesCount = useIndustryPitchStore((state) =>
    state.pitches.filter((p) => p.status === "PENDING").length
  );

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const displayName = user?.name || user?.orgName || "Authorized User";
  const displaySubtitle = user?.role ? user.role.replace(/_/g, " ") : activeRole.toUpperCase();
  const avatarInitial = displayName.charAt(0).toUpperCase() || "U";

  return (
    <aside className="w-60 sm:w-64 bg-[#f8fafc] border-r border-slate-200 h-full flex-shrink-0 flex flex-col justify-between overflow-y-auto select-none">
      {/* Sidebar navigation list */}
      <nav className="divide-y divide-slate-200/80">
        {roleConfig.items.map((item) => {
          const isActive = activeItem === item.id;
          const displayBadge =
            item.id === "notifications" && activeRole === "industry"
              ? pendingPitchesCount > 0
                ? String(pendingPitchesCount)
                : undefined
              : item.badge;

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
              {displayBadge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    item.id === "notifications" || item.id === "alerts"
                      ? "bg-rose-500 text-white rounded-full px-2"
                      : isActive
                      ? "bg-slate-900 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {displayBadge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile & Logout Footer */}
      <div className="p-3 border-t border-slate-200 bg-white/80 space-y-2 mt-auto">
        {/* User Mini Card */}
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-2xs">
            {avatarInitial}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-bold text-slate-900 truncate">
              {displayName}
            </p>
            <p className="text-[10px] text-slate-500 font-medium truncate uppercase">
              {displaySubtitle}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 rounded-lg transition-all border border-rose-200 hover:border-rose-600 cursor-pointer shadow-2xs"
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
