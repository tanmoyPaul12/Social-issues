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
    badgeStyle: "bg-white/15 text-white border-white/30",
    defaultDesignation: "Verified Resident",
    defaultJurisdiction: "District Resident",
  },
  university: {
    roleName: "Academic R&D Hub (HEI)",
    subPortal: "Academic R&D & Capstone Command Center",
    badgeStyle: "bg-white/15 text-white border-white/30",
    defaultDesignation: "Institutional SPOC",
    defaultJurisdiction: "Academic R&D Network",
  },
  industry: {
    roleName: "Industry & CSR Portal",
    subPortal: "Corporate Co-Funding & Technology Marketplace",
    badgeStyle: "bg-white/15 text-white border-white/30",
    defaultDesignation: "CSR Nodal Officer",
    defaultJurisdiction: "Corporate CSR Partner",
  },
  government: {
    roleName: "District Nodal Admin Portal",
    subPortal: "District Collectorate Triage & Oversight",
    badgeStyle: "bg-white/15 text-white border-white/30",
    defaultDesignation: "District Nodal Officer",
    defaultJurisdiction: "District Collectorate Jurisdiction",
  },
  superadmin: {
    roleName: "State Directorate Command Center",
    subPortal: "Jharkhand Statewide Innovation, Triage & R&D Authority",
    badgeStyle: "bg-white/20 text-white border-white/40 shadow-xs",
    defaultDesignation: "State Nodal Director / Superadmin",
    defaultJurisdiction: "State Directorate (All 24 Districts)",
  },
  admin: {
    roleName: "Platform Governance Portal",
    subPortal: "Platform Governance & SDC Command Center",
    badgeStyle: "bg-white/15 text-white border-white/30",
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
    <header className="bg-[#4fa4fc] border-b border-[#3894f0] sticky top-0 z-40 text-white shadow-sm">
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Emblem & Government of Jharkhand Command Center branding */}
        <div className="flex items-center gap-3.5">
          <Link href="/" className="flex items-center gap-3 group py-0.5">
            <div className="w-8 sm:w-9 h-11 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform bg-white/20 p-1 backdrop-blur-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/emblem.png"
                alt="State Emblem of India"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex flex-col text-left justify-center">
              <span className="text-[13px] sm:text-[14.5px] font-black text-white tracking-tight leading-tight">
                झारखंड विज्ञान, प्रौद्योगिकी और नवाचार पोर्टल
              </span>
              <span className="text-[10.5px] sm:text-[11.5px] font-semibold text-blue-50 tracking-tight leading-tight mt-0.5">
                Jharkhand Science, Technology and Innovation Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Verified Role Badge + User Profile + Return Link */}
        <div className="flex items-center gap-3">
          {/* Verified Official Stakeholder Badge */}
          <div className={`flex items-center gap-1.5 py-1 px-3 border text-xs font-bold whitespace-nowrap shrink-0 ${currentInfo.badgeStyle}`}>
            <span>{currentInfo.roleName}</span>
          </div>

          {/* User Profile */}
          <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-white/25">
            <div className="w-8 h-8 bg-white text-[#2563eb] flex items-center justify-center font-bold text-xs shadow-xs">
              {avatarInitial}
            </div>
            <div className="flex flex-col text-left leading-none max-w-[180px]">
              <span className="text-xs font-bold text-white truncate">{displayName}</span>
              <span className="text-[10px] text-blue-50 mt-0.5 truncate">{displaySubtitle}</span>
            </div>
          </div>

          {/* Portal Home Link */}
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-white/30 hover:border-white/50 bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all shadow-2xs backdrop-blur-xs"
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden md:inline">Portal Home</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
