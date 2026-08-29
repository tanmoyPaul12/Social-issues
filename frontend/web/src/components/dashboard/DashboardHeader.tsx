"use client";

import React from "react";
import Link from "next/link";
import { DashboardRole } from "./DashboardNavbar";
import { useAuthStore } from "@/lib/store/useAuthStore";

interface DashboardHeaderProps {
  activeRole: DashboardRole;
  onRoleChange?: (role: DashboardRole) => void;
}

const ROLES_INFO: Record<
  DashboardRole,
  {
    roleName: string;
    subPortal: string;
    badgeStyle: string;
    defaultDesignation: string;
    defaultJurisdiction: string;
  }
> = {
  citizen: {
    roleName: "Citizen Resident Portal",
    subPortal: "Grassroots Problem Intake & Tracking",
    badgeStyle: "bg-emerald-50 text-emerald-800 border-emerald-200",
    defaultDesignation: "Verified Resident",
    defaultJurisdiction: "District Resident",
  },
  university: {
    roleName: "Academic R&D Hub (HEI)",
    subPortal: "Academic R&D & Capstone Command Center",
    badgeStyle: "bg-purple-50 text-purple-800 border-purple-200",
    defaultDesignation: "Institutional SPOC",
    defaultJurisdiction: "Academic R&D Network",
  },
  industry: {
    roleName: "Industry & CSR Portal",
    subPortal: "Corporate Co-Funding & Technology Marketplace",
    badgeStyle: "bg-amber-50 text-amber-900 border-amber-200",
    defaultDesignation: "CSR Nodal Officer",
    defaultJurisdiction: "Corporate CSR Partner",
  },
  government: {
    roleName: "Government Department Portal",
    subPortal: "State & District Oversight Command Center",
    badgeStyle: "bg-blue-50 text-blue-800 border-blue-200",
    defaultDesignation: "Department Nodal Officer",
    defaultJurisdiction: "24 Districts Jurisdiction",
  },
  admin: {
    roleName: "Platform Governance Portal",
    subPortal: "Platform Governance & SDC Command Center",
    badgeStyle: "bg-rose-50 text-rose-800 border-rose-200",
    defaultDesignation: "Platform Governance & Security",
    defaultJurisdiction: "Jharkhand State Data Centre",
  },
};

export function DashboardHeader({ activeRole }: DashboardHeaderProps) {
  const { user } = useAuthStore();
  const currentInfo = ROLES_INFO[activeRole];

  const displayName = user?.name || "Authorized User";
  const displaySubtitle = user?.orgName || user?.designation || (user?.district ? `${user.district} District` : currentInfo.defaultJurisdiction);
  const avatarInitial = displayName.charAt(0).toUpperCase() || "U";

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Emblem & Government of Jharkhand Command Center branding */}
        <div className="flex items-center gap-3.5">
          <Link href="/" className="flex items-center gap-3 group">
            {/* Government Shield Emblem */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0a1128] to-[#1c2d5a] flex items-center justify-center text-white border border-slate-700/30 flex-shrink-0 shadow-2xs">
              <svg className="w-5 h-5 text-[#fbbf24]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
            </div>

            <div className="flex flex-col text-left leading-tight">
              <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Government of Jharkhand
              </span>
              <span className="text-[11px] text-slate-500 font-medium tracking-wide">
                Command Center Portal &amp; Innovation Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Verified Role Badge + User Profile + Return Link */}
        <div className="flex items-center gap-3">
          {/* Verified Official Stakeholder Badge */}
          <div className={`flex items-center gap-1.5 py-1 px-3 rounded border text-xs font-bold shadow-2xs ${currentInfo.badgeStyle}`}>
            <span className="w-2 h-2 rounded-full bg-current opacity-80 shrink-0" />
            <span>{currentInfo.roleName}</span>
          </div>

          {/* User Profile */}
          <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-200">
            <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              {avatarInitial}
            </div>
            <div className="flex flex-col text-left leading-none max-w-[180px]">
              <span className="text-xs font-bold text-slate-900 truncate">{displayName}</span>
              <span className="text-[10px] text-slate-500 mt-0.5 truncate">{displaySubtitle}</span>
            </div>
          </div>

          {/* Portal Home Link */}
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden md:inline">Portal Home</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
