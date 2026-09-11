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
          <Link href="/" className="flex items-center gap-3 group py-0.5">
            <div className="w-8 sm:w-9 h-11 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/emblem.png"
                alt="State Emblem of India"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col text-left justify-center">
              <span className="text-[13px] sm:text-[14.5px] font-black text-slate-950 tracking-tight leading-tight">
                झारखंड विज्ञान, प्रौद्योगिकी और नवाचार पोर्टल
              </span>
              <span className="text-[10.5px] sm:text-[11.5px] font-bold text-slate-800 tracking-tight leading-tight mt-0.5">
                Jharkhand Science, Technology and Innovation Portal
              </span>
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
