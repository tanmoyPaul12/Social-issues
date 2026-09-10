"use client";

import React from "react";
import Link from "next/link";
import { GuestOnlyGuard } from "@/components/auth/GuestOnlyGuard";

interface RoleHubItem {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  trustLevel: string;
  trustBadgeColor: string;
  timeEstimate: string;
  tagline: string;
  description: string;
  verificationMethod: string;
  route: string;
  iconPath: string;
  keyPermissions: string[];
}

const ROLE_HUB_ITEMS: RoleHubItem[] = [
  {
    id: "university",
    title: "College & University (HEI)",
    badge: "Academic Lab Grants",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    trustLevel: "High (Institutional Review)",
    trustBadgeColor: "bg-purple-100 text-purple-800",
    timeEstimate: "~3 Minutes",
    tagline: "For Vice Chancellors, Dean R&D, Faculty Mentors, and Student Innovators",
    description:
      "Receive vetted grassroots challenges matched to your departments. Form multidisciplinary student capstone teams, access NEP 2020 Innovation grants, and earn Academic Bank of Credits (ABC).",
    verificationMethod: "Official Academic Domain Email (.ac.in) + AISHE / UGC Code",
    route: "/onboarding/university",
    iconPath: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
    keyPermissions: [
      "Browse routed district problems matching academic disciplines",
      "Assemble multidisciplinary student and faculty research teams",
      "Apply for SIH-1831 NEP Capstone Prototyping Grants",
      "Publish working prototypes, patents, and ABC credit logs",
    ],
  },
  {
    id: "industry",
    title: "Industry, Startup & CSR Partner",
    badge: "CSR Co-Funding",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    trustLevel: "High (Corporate KYC)",
    trustBadgeColor: "bg-amber-100 text-amber-800",
    timeEstimate: "~3 Minutes",
    tagline: "For Corporate CSR Foundations, MSMEs, Startups & R&D Incubators",
    description:
      "Browse vetted university problem-solution prototypes across Jharkhand. Commit CSR funding, provide engineering mentorship, sponsor field pilot testbeds, and co-develop intellectual property.",
    verificationMethod: "CIN / GSTIN / Udyam Number + MCA Form CSR-1 Registration",
    route: "/onboarding/industry",
    iconPath: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    keyPermissions: [
      "Browse university R&D prototype marketplace across 24 districts",
      "Commit CSR grants & capital for rural pilot scale-ups",
      "Assign industry engineering mentors to student capstone teams",
      "Execute digital tripartite IP agreements and technology transfer",
    ],
  },
  {
    id: "government",
    title: "Government & Nodal Officials",
    badge: "Administrative Triage",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    trustLevel: "High (Govt Provisioning)",
    trustBadgeColor: "bg-blue-100 text-blue-800",
    timeEstimate: "Govt SSO / Provisioned",
    tagline: "For District Magistrates, BDOs, Mukhiyas, Nagar Nigams & Line Ministries",
    description:
      "Oversee district challenge intake, validate AI categorization, assign priority ratings, allocate challenges to universities in your jurisdiction, and monitor real-time social outcome dashboards.",
    verificationMethod: "Official @jharkhand.gov.in Email + Service ID / State e-Pramaan SSO",
    route: "/onboarding/government",
    iconPath: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    keyPermissions: [
      "Access district-wide triage queue of all submitted citizen problems",
      "Override or validate AI problem classifications & priority scores",
      "Assign vetted problems to regional universities and research centres",
      "View district resolution heatmaps, GIS charts, and social impact metrics",
    ],
  },
  {
    id: "citizen",
    title: "Citizen & Community Member",
    badge: "Direct Intake & OTP",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    trustLevel: "Low (Direct Access)",
    trustBadgeColor: "bg-emerald-100 text-emerald-800",
    timeEstimate: "< 1 Minute",
    tagline: "For grassroots residents, farmers, youth, and local panchayat members",
    description:
      "Submit local community problems via voice note, photos, or text in native languages (Santhali, Hindi, Bengali, Ho). Track live AI triage, university R&D lab matches, and rate final resolution pilots.",
    verificationMethod: "Mobile Number + Instant SMS OTP (Aadhaar optional)",
    route: "/onboarding/citizen",
    iconPath: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    keyPermissions: [
      "Submit grassroots problems with geotagging and photos directly",
      "Track live AI clustering & HEI assignment status",
      "Participate in village prototype field testing",
      "Provide resolution sign-off & feedback rating",
    ],
  },
];

export default function OnboardingHubPage() {
  return (
    <GuestOnlyGuard>
      <div className="min-h-screen bg-[#f8fafc] text-[#090e1a] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200/90 px-4 sm:px-8 py-3.5 sticky top-0 z-30 shadow-xs backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0a1128] to-[#1c2d5a] flex items-center justify-center text-white shadow-xs border border-slate-700/30">
              <svg className="w-5 h-5 text-[#fbbf24]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-[0.14em] text-slate-500 uppercase leading-none">
                GOVERNMENT OF JHARKHAND
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-black text-slate-950 tracking-tight">Innovation</span>
                <span className="text-lg font-bold text-blue-600 tracking-tight">Platform</span>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span>Nodal Helpline:</span>
              <span className="font-mono font-bold text-slate-900">1800-345-6588</span>
            </div>

            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
            >
              <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Dashboard Hub</span>
            </Link>

            <Link
              href="/"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Portal Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-[11px] font-bold tracking-wider uppercase mb-3">
            <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>MULTI-STAKEHOLDER ONBOARDING</span>
            <span>•</span>
            <span>SIH-1831</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Join the Jharkhand Innovation Ecosystem
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-2 max-w-2xl mx-auto">
            Select your stakeholder role to launch your dedicated onboarding registration with role-tailored credentials and verification workflows.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ROLE_HUB_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.route}
              className="bg-white border-2 border-slate-200/90 hover:border-blue-500 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-xl transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${item.trustBadgeColor}`}>
                    {item.trustLevel}
                  </span>
                </div>

                <div className="flex items-start gap-3.5 mt-2">
                  <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-800 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.iconPath} />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">{item.tagline}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-4 leading-relaxed">{item.description}</p>

                <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                    Required Verification:
                  </div>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5">
                    {item.verificationMethod}
                  </div>
                </div>

                <div className="mt-4 space-y-1.5">
                  <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                    Key Capabilities:
                  </div>
                  {item.keyPermissions.map((perm, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                      <svg className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{perm}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  Est. Time: <strong className="text-slate-700">{item.timeEstimate}</strong>
                </span>
                <span className="px-4 py-2 rounded-full bg-slate-900 group-hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors">
                  <span>Start Onboarding</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-5 px-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Government of Jharkhand • Department of Higher &amp; Technical Education</span>
          <span className="text-slate-400">SIH-1831 • Multi-Stakeholder Innovation Portal</span>
        </div>
      </footer>
    </div>
  </GuestOnlyGuard>
  );
}
