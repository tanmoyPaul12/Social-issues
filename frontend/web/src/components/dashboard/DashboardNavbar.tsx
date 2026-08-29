"use client";


import Link from "next/link";

import { useAuthStore } from "@/lib/store/useAuthStore";

export type DashboardRole = "citizen" | "university" | "industry" | "government" | "admin";

interface DashboardNavbarProps {
  activeRole: DashboardRole;
  onRoleChange?: (role: DashboardRole) => void;
}

const ROLES_CONFIG: Record<
  DashboardRole,
  {
    label: string;
    badgeText: string;
    badgeColor: string;
    defaultName: string;
    userDesignation: string;
    jurisdiction: string;
  }
> = {
  citizen: {
    label: "Citizen",
    badgeText: "Resident Portal",
    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    defaultName: "Citizen User",
    userDesignation: "Verified Resident",
    jurisdiction: "District Resident",
  },
  university: {
    label: "University (HEI)",
    badgeText: "Academic Lab Hub",
    badgeColor: "bg-purple-50 text-purple-800 border-purple-200",
    defaultName: "Institutional SPOC",
    userDesignation: "Academic Lead",
    jurisdiction: "Academic R&D Network",
  },
  industry: {
    label: "Industry / CSR",
    badgeText: "CSR Co-Funding",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    defaultName: "Corporate CSR Partner",
    userDesignation: "Nodal CSR Officer",
    jurisdiction: "Corporate CSR Partner",
  },
  government: {
    label: "Government",
    badgeText: "Nodal Oversight",
    badgeColor: "bg-blue-50 text-blue-800 border-blue-200",
    defaultName: "Department Nodal Officer",
    userDesignation: "State Nodal Officer",
    jurisdiction: "24 Districts Jurisdiction",
  },
  admin: {
    label: "Platform Admin",
    badgeText: "System Governance",
    badgeColor: "bg-rose-50 text-rose-800 border-rose-200",
    defaultName: "Platform SuperAdmin",
    userDesignation: "Platform Governance & Security",
    jurisdiction: "Jharkhand State Data Centre",
  },
};

export function DashboardNavbar({ activeRole, onRoleChange }: DashboardNavbarProps) {
  const { user } = useAuthStore();
  const currentConfig = ROLES_CONFIG[activeRole];
  const displayName = user?.name || currentConfig.defaultName;
  const displayDistrict = user?.orgName || (user?.district ? `${user.district} District` : currentConfig.jurisdiction);

  return (
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-xs backdrop-blur-md bg-white/95">
      {/* Top Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0a1128] to-[#1c2d5a] flex items-center justify-center text-white shadow-xs border border-slate-700/30 flex-shrink-0">
              <svg className="w-5 h-5 text-[#fbbf24]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[9.5px] font-bold tracking-[0.14em] text-slate-500 uppercase leading-none">
                GOVERNMENT OF JHARKHAND
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-base font-black text-slate-950 tracking-tight">Innovation</span>
                <span className="text-base font-bold text-blue-600 tracking-tight">Platform</span>
              </div>
            </div>
          </Link>

          {/* Current Role Badge */}
          <div className={`hidden sm:inline-flex items-center ml-2 px-3 py-0.5 rounded-full border text-xs font-bold ${currentConfig.badgeColor}`}>
            {currentConfig.badgeText}
          </div>
        </div>

        {/* Right User Controls & Portal Home */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Jurisdiction Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{displayDistrict}</span>
          </div>

          {/* User Profile Chip */}
          <div className="flex items-center gap-2.5 pl-2 sm:pl-3 sm:border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center justify-center font-black text-xs">
              {displayName.charAt(0)}
            </div>
            <div className="hidden md:flex flex-col text-left leading-tight">
              <span className="text-xs font-bold text-slate-900">{displayName}</span>
              <span className="text-[10px] text-slate-500 font-medium">{user ? "Active Verified Account" : currentConfig.userDesignation}</span>
            </div>
          </div>

          {/* Return Home Link */}
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">Portal Home</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
