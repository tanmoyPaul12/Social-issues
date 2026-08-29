"use client";

import React from "react";
import Link from "next/link";
import { SiteNavbar } from "@/components/common/SiteNavbar";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function IndustryRDPortalPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#fbfcfd] text-slate-900 flex flex-col font-sans selection:bg-blue-100">
      <SiteNavbar />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 via-[#0d1b2a] to-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <span>Corporate &amp; Enterprise R&amp;D Gateway</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Industry R&amp;D &amp; CSR Co-Funding Portal
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300">
            Partner with top higher education institutions and state research labs across Jharkhand. 
            Co-fund applied prototypes, sponsor verified rural pilot deployments, and drive grassroots technological transformation.
          </p>

          {/* Quick Dual CTA Cards */}
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
            <Link
              href="/auth/login/industry"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0077b6] hover:bg-[#005f92] text-white text-sm font-bold transition-all shadow-md"
            >
              <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Industry &amp; CSR Sign In</span>
            </Link>

            <Link
              href="/onboarding/industry"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-sm font-bold transition-all shadow-md"
            >
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Register Corporate Partner</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Highlights Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-12">
        {/* Three Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              1
            </div>
            <h2 className="text-base font-bold text-slate-900">1:1 CSR Co-Funding Matching</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Match your corporate CSR grants directly with Jharkhand state STI innovation funds to double research throughput on urgent district challenges.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              2
            </div>
            <h2 className="text-base font-bold text-slate-900">University Lab Access</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Connect with professors, PhD scholars, and specialized equipment across BIT Mesra, IIT ISM Dhanbad, and NIT Jamshedpur for rapid product R&amp;D.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              3
            </div>
            <h2 className="text-base font-bold text-slate-900">Verified District POCs</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Deploy field trials with real-time feedback loops from Panchayats and district administrations across 24 districts of Jharkhand.
            </p>
          </div>
        </div>

        {/* Action Banner */}
        <div className="bg-slate-100 border border-slate-200 rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Ready to initiate an industry R&amp;D partnership?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            Complete the 3-minute corporate KYC onboarding or access your CSR management dashboard.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/onboarding/industry"
              className="px-5 py-2.5 rounded-lg bg-[#0077b6] hover:bg-[#005f92] text-white text-xs font-bold transition-all shadow-xs"
            >
              Start Corporate Onboarding
            </Link>
            <Link
              href="/auth/login/industry"
              className="px-5 py-2.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
            >
              Sign In to Existing Account
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
