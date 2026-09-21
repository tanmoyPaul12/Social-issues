"use client";

import React from "react";
import Link from "next/link";
import { SiteNavbar } from "@/components/common/SiteNavbar";
import { SiteFooter } from "@/components/common/SiteFooter";
import { GuestOnlyGuard } from "@/components/auth/GuestOnlyGuard";

const ONBOARDING_ROLES = [
  {
    id: "citizen",
    title: "Citizen & Resident",
    description: "Report local civic issues, vote on community priorities & track remediation",
    route: "/auth/signup",
    icon: (
      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: "university",
    title: "College & University (HEI)",
    description: "Claim student capstone problems, R&D grants & submit working prototypes",
    route: "/onboarding/university",
    icon: (
      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    ),
  },
  {
    id: "industry",
    title: "Industry & CSR Partner",
    description: "Commit CSR funding, sponsor field testbeds & mentor student innovators",
    route: "/onboarding/industry",
    icon: (
      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    id: "government",
    title: "Government & Nodal Officer",
    description: "Triage district grievances, allocate challenges & oversee social impact",
    route: "/onboarding/government",
    icon: (
      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

export default function OnboardingHubPage() {
  return (
    <GuestOnlyGuard>
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
        <SiteNavbar />

        <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-8 sm:py-12">
          <div className="w-full max-w-[520px] bg-white border border-[#e5e7eb] rounded-2xl p-7 sm:p-9 shadow-xs">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Create an Account
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Select your stakeholder role to begin registration
              </p>
            </div>

            {/* Role Options */}
            <div className="space-y-3">
              {ONBOARDING_ROLES.map((role) => (
                <Link
                  key={role.id}
                  href={role.route}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all group bg-white"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:border-blue-200 transition-colors">
                      {role.icon}
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {role.title}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                        {role.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all text-sm font-bold pl-2">
                    →
                  </span>
                </Link>
              ))}
            </div>

            {/* Sign in footer */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-bold text-blue-600 hover:underline">
                Sign In
              </Link>
            </div>
          </div>

          {/* Quick links to login portals */}
          <div className="w-full max-w-[520px] mt-4 p-4 rounded-2xl bg-white border border-[#e5e7eb] shadow-xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2.5 text-center">
              Institutional &amp; Partner Logins
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <Link
                href="/auth/login/industry"
                className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 text-center text-slate-700 font-semibold transition-all flex flex-col items-center gap-1"
              >
                <span>Industry</span>
              </Link>
              <Link
                href="/auth/login/university"
                className="p-2.5 rounded-xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/40 text-center text-slate-700 font-semibold transition-all flex flex-col items-center gap-1"
              >
                <span>University</span>
              </Link>
              <Link
                href="/auth/login/government"
                className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-center text-slate-700 font-semibold transition-all flex flex-col items-center gap-1"
              >
                <span>Govt Officer</span>
              </Link>
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>
    </GuestOnlyGuard>
  );
}
