"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";

interface NavDropdownItem {
  label: string;
  href: string;
  hasArrow?: boolean;
}

export function SiteNavbar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobilePortalsOpen, setMobilePortalsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
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

  const handleTrackClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      const inputEl = document.getElementById("ticket-search-input");
      if (inputEl) {
        inputEl.scrollIntoView({ behavior: "smooth", block: "center" });
        inputEl.focus();
      }
    }
  };

  const portalItems: NavDropdownItem[] = [
    { label: "College & University (HEI) Portal", href: "/onboarding/university", hasArrow: true },
    { label: "Industry & CSR Partnership Gateway", href: "/onboarding/industry", hasArrow: true },
    { label: "Government Nodal Officer Portal", href: "/onboarding/government", hasArrow: true },
    { label: "Citizen Problem Submission", href: "/auth/login", hasArrow: true },
    { label: "Academic & CSR Consortium", href: "/#institutions-section", hasArrow: false },
  ];

  return (
    <header ref={navRef} className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 font-sans text-slate-800 shadow-2xs select-none">
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-6">
        <div className="flex items-center justify-between h-[58px] sm:h-[66px] gap-2 lg:gap-4">
          
          {/* Left Brand Identity: Official State Emblem & Bilingual Typography */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 min-w-0 shrink group py-1">
            <div className="w-7 sm:w-8 h-9 sm:h-10 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/emblem.png"
                alt="State Emblem of India"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col text-left justify-center min-w-0">
              <span className="text-[11px] xs:text-[12px] sm:text-[13px] xl:text-[14px] font-black text-slate-950 tracking-tight leading-tight truncate sm:whitespace-normal">
                झारखंड विज्ञान, प्रौद्योगिकी और नवाचार पोर्टल
              </span>
              <span className="text-[9px] xs:text-[10px] sm:text-[11px] xl:text-[11.5px] font-bold text-slate-700 tracking-tight leading-tight mt-0.5 truncate sm:whitespace-normal">
                Jharkhand Science, Technology and Innovation Portal
              </span>
            </div>
          </Link>

          {/* Center Navigation Links: Clean, Meaningful & Exact Rectangular Underline Hover Effect */}
          <nav className="hidden lg:flex items-center h-[66px] text-[13px] 2xl:text-[13.5px] font-medium text-[#004b75] whitespace-nowrap shrink-0">
            <Link
              href="/"
              className="px-3 2xl:px-4 h-full flex items-center transition-colors border-b-2 border-transparent hover:bg-[#dff0fa] hover:text-[#00486c] hover:border-[#004b75]"
            >
              Home
            </Link>

            <Link
              href="/#challenges-feed"
              className="px-3 2xl:px-4 h-full flex items-center transition-colors border-b-2 border-transparent hover:bg-[#dff0fa] hover:text-[#00486c] hover:border-[#004b75]"
            >
              Explore Challenges
            </Link>

            <Link
              href="/#pipeline-section"
              className="px-3 2xl:px-4 h-full flex items-center transition-colors border-b-2 border-transparent hover:bg-[#dff0fa] hover:text-[#00486c] hover:border-[#004b75]"
            >
              How It Works
            </Link>

            <Link
              href="/industry-rd"
              className="px-3 2xl:px-4 h-full flex items-center transition-colors border-b-2 border-transparent hover:bg-[#dff0fa] hover:text-[#00486c] hover:border-[#004b75]"
            >
              Industry &amp; CSR
            </Link>

            {/* Portals & Roles Dropdown with Exact Active/Hover Box Design */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => handleMouseEnter("portals")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === "portals" ? null : "portals")}
                className={`flex items-center gap-1.5 px-3 2xl:px-4 h-full transition-colors cursor-pointer outline-none font-medium whitespace-nowrap border-b-2 ${
                  activeMenu === "portals"
                    ? "bg-[#dff0fa] text-[#00486c] border-[#004b75]"
                    : "border-transparent hover:bg-[#dff0fa] hover:text-[#00486c] hover:border-[#004b75]"
                }`}
              >
                <span>Portals &amp; Roles</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeMenu === "portals" ? "rotate-180 text-[#00486c]" : "text-[#004b75]"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {activeMenu === "portals" && (
                <div
                  className="absolute left-0 top-full w-80 bg-white border border-[#cbe3f1] border-t-0 shadow-2xl z-50 animate-in fade-in duration-100"
                  onMouseEnter={() => handleMouseEnter("portals")}
                  onMouseLeave={handleMouseLeave}
                >
                  {portalItems.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={() => setActiveMenu(null)}
                      className="px-5 py-3.5 flex items-center justify-between text-[13.5px] font-medium transition-colors border-b border-[#edf4f9] last:border-0 bg-white text-[#00486c] hover:bg-[#f0f7fb]"
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

          {/* Right Action Area: Track Ticket + Auth Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 whitespace-nowrap">
            {/* Quick Track Ticket Action */}
            <Link
              href="/#ticket-search-input"
              onClick={handleTrackClick}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/50 text-[#004b75] text-xs font-semibold transition-all shadow-2xs cursor-pointer"
              title="Track Submitted Problem Ticket"
            >
              <svg className="w-3.5 h-3.5 text-[#004b75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Track Ticket</span>
            </Link>

            {isAuthenticated ? (
              /* Authenticated View: Role-based Portal Dashboard & Profile & Sign Out */
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap">
                {/* User chip */}
                <div className="flex items-center gap-1.5 pl-1.5 pr-2 py-0.5 sm:pr-2.5 sm:py-1 rounded bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-colors shrink-0 whitespace-nowrap shadow-2xs">
                  <div className="w-5.5 h-5.5 rounded bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-[10.5px] flex items-center justify-center shadow-xs shrink-0">
                    {(user?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:flex flex-col text-left leading-none">
                    <span className="text-[11px] font-bold text-slate-800 max-w-[85px] xl:max-w-[110px] truncate">{user?.name}</span>
                    <span className="text-[8.5px] font-semibold text-blue-600 uppercase tracking-wider mt-0.5">{user?.role || "Citizen"}</span>
                  </div>
                </div>

                {/* Role-based Portal Dashboard Button */}
                <Link
                  href={getRoleDashboardUrl()}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-gradient-to-r from-[#0077b6] to-[#0096c7] hover:from-[#005f92] hover:to-[#0077b6] text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all duration-200 shrink-0 whitespace-nowrap group active:scale-95"
                >
                  <svg className="w-3.5 h-3.5 text-blue-200 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span>Dashboard</span>
                </Link>

                {/* Sign Out Button */}
                <button
                  type="button"
                  onClick={() => logout()}
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50/60 hover:bg-rose-100/80 border border-rose-200/70 hover:border-rose-300 transition-all duration-150 cursor-pointer shrink-0 whitespace-nowrap active:scale-95"
                  title="Sign Out"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              /* Unauthenticated View: Sign In & Register Buttons Hidden on Mobile (Visible in Drawer) */
              <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center px-3.5 py-1.5 rounded border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-all shadow-2xs shrink-0 whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  href="/onboarding"
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
              className="lg:hidden p-1.5 sm:p-2 rounded text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0"
              aria-label="Toggle navigation"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <Link
              href="/"
              className="block px-3 py-2 rounded hover:bg-slate-100 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>

            <Link
              href="/#challenges-feed"
              className="block px-3 py-2 rounded hover:bg-slate-100 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Explore Challenges
            </Link>

            <Link
              href="/#pipeline-section"
              className="block px-3 py-2 rounded hover:bg-slate-100 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>

            <Link
              href="/industry-rd"
              className="block px-3 py-2 rounded hover:bg-slate-100 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Industry &amp; CSR
            </Link>

            {/* Mobile Portals Accordion */}
            <div className="border border-slate-200 rounded p-2 bg-[#f8fbfe]">
              <button
                type="button"
                onClick={() => setMobilePortalsOpen(!mobilePortalsOpen)}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-bold text-[#00486c] uppercase tracking-wider"
              >
                <span>Portals &amp; Roles</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform ${mobilePortalsOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {mobilePortalsOpen && (
                <div className="mt-2 space-y-1 pt-1 border-t border-[#cbe3f1]">
                  {portalItems.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded hover:bg-[#dff0fa] text-xs font-medium text-[#00486c]"
                    >
                      <span>{item.label}</span>
                      {item.hasArrow && (
                        <svg className="w-3.5 h-3.5 text-[#00486c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/#ticket-search-input"
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleTrackClick(e);
              }}
              className="block px-3 py-2 rounded bg-[#dff0fa] text-[#00486c] font-semibold"
            >
              Track Ticket
            </Link>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    href={getRoleDashboardUrl()}
                    className="block px-3 py-2 rounded bg-[#0077b6] text-white text-center font-semibold"
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
                    className="block w-full px-3 py-2 rounded bg-red-50 text-red-600 text-center font-semibold"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/auth/login"
                    className="block px-3 py-2 rounded bg-slate-100 text-slate-800 text-center font-semibold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/onboarding"
                    className="block px-3 py-2 rounded bg-[#0077b6] text-white text-center font-semibold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
