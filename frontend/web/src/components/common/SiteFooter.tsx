"use client";

import React from "react";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-[#070b13] border-t border-[#1b2434] text-slate-400 text-xs py-10 px-4 sm:px-8 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-12 shrink-0 flex items-center justify-center pt-0.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/emblem.png"
                alt="State Emblem of India"
                className="w-full h-full object-contain filter brightness-0 invert opacity-95"
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-white font-black text-sm sm:text-[15px] leading-snug tracking-tight">
                झारखंड विज्ञान, प्रौद्योगिकी और नवाचार पोर्टल
              </span>
              <span className="text-slate-200 font-bold text-xs sm:text-[13px] leading-tight mt-0.5">
                Jharkhand Science, Technology and Innovation Portal
              </span>
              <span className="text-slate-400 text-[11px] mt-1">
                Department of Higher &amp; Technical Education, Government of Jharkhand
              </span>
            </div>
          </div>
          <p className="text-slate-400 text-xs mt-3.5 max-w-md leading-relaxed">
            NEP 2020 Aligned Innovation Ecosystem uniting grassroots citizens,
            university R&amp;D labs, MSMEs, and CSR funding for real district-wide impact.
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
            Direct Portals
          </h4>
          <ul className="space-y-2.5">
            <li>
              <Link
                href="/auth/login"
                className="hover:text-white transition-colors block"
              >
                Citizen Problem Submission (Direct)
              </Link>
            </li>
            <li>
              <Link
                href="/challenges"
                className="hover:text-white transition-colors block"
              >
                Ticket Resolution Tracking
              </Link>
            </li>
            <li>
              <Link href="/onboarding/university" className="hover:text-white transition-colors block">
                College &amp; University Registration (AISHE)
              </Link>
            </li>
            <li>
              <Link href="/onboarding/industry" className="hover:text-white transition-colors block">
                Industry &amp; CSR Co-Funding Sandbox
              </Link>
            </li>
            <li>
              <Link href="/onboarding/government" className="hover:text-blue-400 text-blue-300 font-semibold transition-colors block">
                Government Nodal Officer Onboarding (SSO)
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
            Emergency &amp; Support
          </h4>
          <p className="text-slate-400">Toll-free Citizen Helpline:</p>
          <p className="text-white font-mono font-bold text-sm mt-0.5">1800-345-6588</p>
          <p className="text-slate-400 mt-2">Email: support-innovation@jharkhand.gov.in</p>
          <p className="text-slate-500 text-[11px] mt-3">
            © 2026 Government of Jharkhand. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
