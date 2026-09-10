"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/useAuthStore";

interface DropdownItem {
  label: string;
  href: string;
  hasArrow?: boolean;
  isFirstActive?: boolean;
}

export function SiteNavbar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleMouseEnter = (menuKey: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveMenu(menuKey);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 150);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Compute dynamic RBAC dashboard link based on authenticated user's role
  const getRoleDashboardUrl = () => {
    if (!user || !user.role) return "/dashboard";
    const r = user.role.toUpperCase();
    if (r.includes("UNIVERSITY") || r.includes("HEI") || r.includes("FACULTY") || r.includes("STUDENT")) {
      return "/dashboard?role=university";
    }
    if (r.includes("INDUSTRY") || r.includes("CSR")) {
      return "/dashboard?role=industry";
    }
    if (r.includes("GOVERNMENT") || r.includes("NODAL")) {
      return "/dashboard?role=government";
    }
    if (r.includes("ADMIN")) {
      return "/dashboard?role=admin";
    }
    return "/dashboard?role=citizen";
  };

  const opportunitiesItems: DropdownItem[] = isAuthenticated
    ? [
        { label: "Student Capstone Grants", href: "/#opportunities", hasArrow: true, isFirstActive: true },
        { label: "Faculty & Lab R&D Funding", href: "/#opportunities", hasArrow: true },
        { label: "State STI Innovation Challenges", href: "/#opportunities", hasArrow: true },
        { label: "Patent & IPR Filing Support", href: "/#opportunities", hasArrow: false },
        { label: "CSR Co-Funding Marketplace", href: "/dashboard?role=industry", hasArrow: true },
        { label: "District Pilot Opportunities", href: "/#opportunities", hasArrow: false },
      ]
    : [
        { label: "College & University (HEI) Sign In", href: "/auth/login/university", hasArrow: true, isFirstActive: true },
        { label: "Register College / University (AISHE)", href: "/onboarding/university", hasArrow: true },
        { label: "Student Capstone Grants", href: "/onboarding/university", hasArrow: true },
        { label: "Faculty & Lab R&D Funding", href: "/onboarding/university", hasArrow: true },
        { label: "Government Opportunities & POC", href: "/onboarding/government", hasArrow: true },
        { label: "CSR Co-Funding Marketplace", href: "/onboarding/industry", hasArrow: true },
        { label: "State STI Innovation Challenges", href: "/#opportunities", hasArrow: false },
        { label: "Patent & IPR Filing Support", href: "/#opportunities", hasArrow: false },
      ];

  const industryItems: DropdownItem[] = isAuthenticated
    ? [
        { label: "CSR Co-Funding Marketplace", href: "/dashboard?role=industry", hasArrow: true, isFirstActive: true },
        { label: "Industry R&D Portal Overview", href: "/industry-rd", hasArrow: false },
        { label: "Lab Technology Licensing & POCs", href: "/industry-rd#licensing", hasArrow: true },
        { label: "Active District Pilot Projects", href: "/dashboard?role=industry", hasArrow: true },
      ]
    : [
        { label: "Industry & CSR Sign In", href: "/auth/login/industry", hasArrow: true, isFirstActive: true },
        { label: "Register Corporate / CSR Partner", href: "/onboarding/industry", hasArrow: true },
        { label: "CSR Co-Funding Marketplace", href: "/dashboard?role=industry", hasArrow: true },
        { label: "Lab Technology Licensing & POCs", href: "/onboarding/industry", hasArrow: true },
        { label: "Industry R&D Portal Overview", href: "/industry-rd", hasArrow: false },
      ];

  const segmentsItems: DropdownItem[] = isAuthenticated
    ? [
        { label: "Government Opportunities & POC", href: "/#segments", hasArrow: true, isFirstActive: true },
        { label: "International Partnerships", href: "/#international", hasArrow: false },
        { label: "Women in STEM", href: "/#women-stem", hasArrow: false },
        { label: "School Innovation", href: "/#school-innovation", hasArrow: true },
        { label: "AMRIT - RuTAGe Smart Village Centres", href: "/#rsvc-amrit", hasArrow: true },
        { label: "Impact Assessment Partners", href: "/#impact", hasArrow: false },
        { label: "City STI Clusters", href: "/#clusters", hasArrow: false },
      ]
    : [
        { label: "Government Opportunities and POC", href: "/onboarding/government", hasArrow: true, isFirstActive: true },
        { label: "International Partnerships", href: "/#international", hasArrow: false },
        { label: "Women in STEM", href: "/#women-stem", hasArrow: false },
        { label: "School Innovation", href: "/#school-innovation", hasArrow: true },
        { label: "AMRIT - RuTAGe Smart Village Centres", href: "/#rsvc-amrit", hasArrow: true },
        { label: "Impact Assessment Partners", href: "/#impact", hasArrow: false },
        { label: "City STI Clusters", href: "/#clusters", hasArrow: false },
      ];

  const eventsItems: DropdownItem[] = [
    { label: "Jharkhand Innovation Hackathon 2026", href: "/#events", hasArrow: true, isFirstActive: true },
    { label: "NEP 2020 Capstone Showcase", href: "/#events", hasArrow: true },
    { label: "District Triage & Triage Workshops", href: "/#events", hasArrow: true },
    { label: "Grassroots Technology Demo Day", href: "/#events", hasArrow: false },
    { label: "State Annual Science & Tech Exhibition", href: "/#exhibitions", hasArrow: false },
  ];

  return (
    <header ref={navRef} className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 font-sans text-slate-800 shadow-2xs select-none">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Left Brand Identity: Official Jharkhand Govt Shield & Text */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group py-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0a1128] to-[#1c2d5a] flex items-center justify-center text-white shadow-xs border border-slate-700/30 shrink-0 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 text-[#fbbf24]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
            </div>
            <div className="flex flex-col text-left leading-tight">
              <span className="text-[9px] font-bold tracking-[0.14em] text-slate-500 uppercase">
                GOVERNMENT OF JHARKHAND
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-[17px] font-black text-slate-950 tracking-tight">Innovation</span>
                <span className="text-[17px] font-bold text-blue-600 tracking-tight">Platform</span>
              </div>
            </div>
          </Link>

          {/* Center Navigation Links (With hover box stack dropdowns) */}
          <nav className="hidden lg:flex items-center h-full text-[13px] xl:text-[13.5px] font-medium text-[#004b75] whitespace-nowrap shrink-0">
            <Link
              href="/"
              className="px-2 xl:px-2.5 py-2 hover:text-blue-700 transition-colors h-full flex items-center whitespace-nowrap shrink-0"
            >
              Home
            </Link>

            <Link
              href="/#co-partners"
              className="px-2 xl:px-2.5 py-2 hover:text-blue-700 transition-colors h-full flex items-center whitespace-nowrap shrink-0"
            >
              Co-Partners
            </Link>

            {/* Opportunities Dropdown */}
            <div
              className="relative h-full flex items-center shrink-0"
              onMouseEnter={() => handleMouseEnter("opportunities")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === "opportunities" ? null : "opportunities")}
                className={`flex items-center gap-1 px-2 xl:px-2.5 h-full transition-colors cursor-pointer outline-none font-medium whitespace-nowrap shrink-0 ${
                  activeMenu === "opportunities" ? "bg-[#dff0fa] text-[#00486c]" : "hover:text-blue-700"
                }`}
              >
                <span>Opportunities</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${activeMenu === "opportunities" ? "rotate-180 text-[#00486c]" : "text-[#004b75]"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {activeMenu === "opportunities" && (
                <div
                  className="absolute left-0 top-full w-84 bg-white border border-[#cbe3f1] border-t-0 shadow-2xl z-50 animate-in fade-in duration-100"
                  onMouseEnter={() => handleMouseEnter("opportunities")}
                  onMouseLeave={handleMouseLeave}
                >
                  {opportunitiesItems.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={() => setActiveMenu(null)}
                      className={`px-5 py-3.5 flex items-center justify-between text-[13.5px] font-medium transition-colors border-b border-[#edf4f9] last:border-0 ${
                        item.isFirstActive
                          ? "bg-[#dff0fa] text-[#00486c] hover:bg-[#d3e9f5]"
                          : "bg-white text-[#00486c] hover:bg-[#f0f7fb]"
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.hasArrow && (
                        <svg className="w-4 h-4 text-[#00486c] shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Industry R&D Dropdown with Direct Login & Register Options */}
            <div
              className="relative h-full flex items-center shrink-0"
              onMouseEnter={() => handleMouseEnter("industry")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === "industry" ? null : "industry")}
                className={`flex items-center gap-1 px-2 xl:px-2.5 h-full transition-colors cursor-pointer outline-none font-medium whitespace-nowrap shrink-0 ${
                  activeMenu === "industry" ? "bg-[#dff0fa] text-[#00486c]" : "hover:text-blue-700"
                }`}
              >
                <span>Industry R&amp;D</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${activeMenu === "industry" ? "rotate-180 text-[#00486c]" : "text-[#004b75]"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {activeMenu === "industry" && (
                <div
                  className="absolute left-0 top-full w-88 bg-white border border-[#cbe3f1] border-t-0 shadow-2xl z-50 animate-in fade-in duration-100"
                  onMouseEnter={() => handleMouseEnter("industry")}
                  onMouseLeave={handleMouseLeave}
                >
                  {industryItems.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={() => setActiveMenu(null)}
                      className={`px-5 py-3.5 flex items-center justify-between text-[13.5px] font-medium transition-colors border-b border-[#edf4f9] last:border-0 ${
                        item.isFirstActive
                          ? "bg-[#dff0fa] text-[#00486c] hover:bg-[#d3e9f5]"
                          : "bg-white text-[#00486c] hover:bg-[#f0f7fb]"
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.hasArrow && (
                        <svg className="w-4 h-4 text-[#00486c] shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Segments Dropdown (Box Stack design) */}
            <div
              className="relative h-full flex items-center shrink-0"
              onMouseEnter={() => handleMouseEnter("segments")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === "segments" ? null : "segments")}
                className={`flex items-center gap-1 px-2 xl:px-2.5 h-full transition-colors cursor-pointer outline-none font-medium whitespace-nowrap shrink-0 ${
                  activeMenu === "segments" ? "bg-[#dff0fa] text-[#00486c]" : "hover:text-blue-700"
                }`}
              >
                <span>Segments</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${activeMenu === "segments" ? "rotate-180 text-[#00486c]" : "text-[#004b75]"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {activeMenu === "segments" && (
                <div
                  className="absolute left-0 top-full w-88 bg-white border border-[#cbe3f1] border-t-0 shadow-2xl z-50 animate-in fade-in duration-100"
                  onMouseEnter={() => handleMouseEnter("segments")}
                  onMouseLeave={handleMouseLeave}
                >
                  {segmentsItems.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={() => setActiveMenu(null)}
                      className={`px-5 py-3.5 flex items-center justify-between text-[13.5px] font-medium transition-colors border-b border-[#edf4f9] last:border-0 ${
                        item.isFirstActive
                          ? "bg-[#dff0fa] text-[#00486c] hover:bg-[#d3e9f5]"
                          : "bg-white text-[#00486c] hover:bg-[#f0f7fb]"
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.hasArrow && (
                        <svg className="w-4 h-4 text-[#00486c] shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/#rsvc-amrit"
              className="px-2 xl:px-2.5 py-2 hover:text-blue-700 transition-colors h-full flex items-center whitespace-nowrap shrink-0"
            >
              RSVC - Amrit
            </Link>

            <Link
              href="/#exhibitions"
              className="px-2 xl:px-2.5 py-2 hover:text-blue-700 transition-colors h-full flex items-center whitespace-nowrap shrink-0"
            >
              Exhibitions
            </Link>

            {/* Events Dropdown */}
            <div
              className="relative h-full flex items-center shrink-0"
              onMouseEnter={() => handleMouseEnter("events")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === "events" ? null : "events")}
                className={`flex items-center gap-1 px-2 xl:px-2.5 h-full transition-colors cursor-pointer outline-none font-medium whitespace-nowrap shrink-0 ${
                  activeMenu === "events" ? "bg-[#dff0fa] text-[#00486c]" : "hover:text-blue-700"
                }`}
              >
                <span>Events</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${activeMenu === "events" ? "rotate-180 text-[#00486c]" : "text-[#004b75]"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {activeMenu === "events" && (
                <div
                  className="absolute right-0 top-full w-88 bg-white border border-[#cbe3f1] border-t-0 shadow-2xl z-50 animate-in fade-in duration-100"
                  onMouseEnter={() => handleMouseEnter("events")}
                  onMouseLeave={handleMouseLeave}
                >
                  {eventsItems.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={() => setActiveMenu(null)}
                      className={`px-5 py-3.5 flex items-center justify-between text-[13.5px] font-medium transition-colors border-b border-[#edf4f9] last:border-0 ${
                        item.isFirstActive
                          ? "bg-[#dff0fa] text-[#00486c] hover:bg-[#d3e9f5]"
                          : "bg-white text-[#00486c] hover:bg-[#f0f7fb]"
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.hasArrow && (
                        <svg className="w-4 h-4 text-[#00486c] shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 whitespace-nowrap">
            {isAuthenticated ? (
              /* Authenticated View: Role-based Portal Dashboard & Profile & Sign Out */
              <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 whitespace-nowrap">
                {/* User chip */}
                <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 shadow-2xs shrink-0 whitespace-nowrap">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                    {(user?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-[11.5px] font-bold text-slate-800 max-w-[110px] truncate">{user?.name}</span>
                    <span className="text-[9px] font-semibold text-blue-600 uppercase mt-0.5">{user?.role || "Citizen"}</span>
                  </div>
                </div>

                {/* Role-based Portal Dashboard Button (Visible only when user is logged in with valid session) */}
                <Link
                  href={getRoleDashboardUrl()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#0077b6] bg-[#0077b6] hover:bg-[#005f92] text-white text-xs font-semibold transition-all shadow-2xs shrink-0 whitespace-nowrap"
                >
                  <svg className="w-3.5 h-3.5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span>Portal Dashboard</span>
                </Link>

                <button
                  type="button"
                  onClick={() => logout()}
                  className="px-2.5 py-1.5 rounded text-xs font-medium text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer shrink-0 whitespace-nowrap"
                  title="Sign Out"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              /* Unauthenticated View: Sign In & Register Buttons Only */
              <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 whitespace-nowrap">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center px-3.5 py-1.5 rounded border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-all shadow-2xs shrink-0 whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center px-3.5 py-1.5 rounded border border-[#0077b6] bg-[#0077b6] hover:bg-[#005f92] text-white text-xs font-medium transition-all shadow-2xs shrink-0 whitespace-nowrap"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Drawer Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded text-slate-700 hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle navigation"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 py-4 px-2 space-y-2 text-sm text-[#004b75] bg-white animate-in fade-in duration-150">
            <Link href="/" className="block px-3 py-2 rounded hover:bg-slate-100" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link href="/#co-partners" className="block px-3 py-2 rounded hover:bg-slate-100" onClick={() => setMobileMenuOpen(false)}>
              Co-Partners
            </Link>
            <Link href="/onboarding/university" className="block px-3 py-2 rounded hover:bg-slate-100" onClick={() => setMobileMenuOpen(false)}>
              Opportunities
            </Link>
            <Link href="/industry-rd" className="block px-3 py-2 rounded hover:bg-slate-100 font-semibold" onClick={() => setMobileMenuOpen(false)}>
              Industry R&amp;D Portal
            </Link>
            <Link href="/#segments" className="block px-3 py-2 rounded hover:bg-slate-100" onClick={() => setMobileMenuOpen(false)}>
              Segments
            </Link>
            <Link href="/#rsvc-amrit" className="block px-3 py-2 rounded hover:bg-slate-100" onClick={() => setMobileMenuOpen(false)}>
              RSVC - Amrit
            </Link>
            <Link href="/#exhibitions" className="block px-3 py-2 rounded hover:bg-slate-100" onClick={() => setMobileMenuOpen(false)}>
              Exhibitions
            </Link>
            <Link href="/#events" className="block px-3 py-2 rounded hover:bg-slate-100" onClick={() => setMobileMenuOpen(false)}>
              Events
            </Link>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    href={getRoleDashboardUrl()}
                    className="block px-3 py-2 rounded bg-blue-600 text-white text-center font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Portal Dashboard ({user?.role || "Citizen"})
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full px-3 py-2 rounded bg-red-50 text-red-600 text-center font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="block px-3 py-2 rounded bg-slate-50 text-center font-medium" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                  <Link href="/auth/signup" className="block px-3 py-2 rounded bg-blue-600 text-white text-center font-medium" onClick={() => setMobileMenuOpen(false)}>
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
