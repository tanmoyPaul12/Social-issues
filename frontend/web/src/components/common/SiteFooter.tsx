"use client";

import React from "react";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-[#004b75] border-t border-[#003959] text-white py-10 sm:py-12 px-4 sm:px-8 font-sans select-none">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        
        {/* ── Top Row: Government Policy Links (Pipe Separated) ── */}
        <nav className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-1.5 text-[11.5px] sm:text-[13px] font-medium text-white/95 tracking-wide">
          <Link href="/#" className="hover:underline hover:text-white transition-colors">
            Accessibility Statement
          </Link>
          <span className="text-white/40 font-light select-none">|</span>
          <Link href="/#" className="hover:underline hover:text-white transition-colors">
            Copyright Policy
          </Link>
          <span className="text-white/40 font-light select-none">|</span>
          <Link href="/#" className="hover:underline hover:text-white transition-colors">
            Hyperlinking Policy
          </Link>
          <span className="text-white/40 font-light select-none">|</span>
          <Link href="/#" className="hover:underline hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <span className="text-white/40 font-light select-none">|</span>
          <Link href="/#" className="hover:underline hover:text-white transition-colors">
            Terms &amp; Conditions
          </Link>
          <span className="text-white/40 font-light select-none">|</span>
          <Link href="/#" className="hover:underline hover:text-white transition-colors">
            Website Policies
          </Link>
        </nav>

        {/* ── General Disclaimer Note ── */}
        <p className="text-[11px] sm:text-[12px] text-white/80 max-w-4xl mx-auto leading-relaxed mt-5 sm:mt-6 font-normal">
          General information is displayed by Department of Higher &amp; Technical Education, Government of Jharkhand and all transactional information/uploads are done by various stakeholders such as Industries, Institutes and Start-ups. Last updated on 21 September 2026.
        </p>

        {/* ── Contact Us Section ── */}
        <div className="mt-6 sm:mt-8 space-y-2">
          <h3 className="text-2xl sm:text-[28px] font-bold text-white tracking-tight">
            Contact Us
          </h3>
          <p className="text-xs sm:text-[13.5px] text-white/90 font-medium leading-relaxed">
            Nepal House, Doranda, Ranchi, Jharkhand - 834002 &bull; Toll-Free: 1800-345-6588 &bull; 9176645456
          </p>
        </div>

        {/* ── Dotted Divider Line ── */}
        <div className="w-full border-t border-dotted border-white/30 my-8 sm:my-9" />

        {/* ── Bottom Bar: Official Brand + Social Media Links ── */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-6">
          
          {/* Left: State Emblem + Bilingual Typography from Current Identity */}
          <div className="flex items-center gap-3.5 text-left">
            <div className="w-9 sm:w-10 h-12 sm:h-14 shrink-0 flex items-center justify-center pt-0.5">
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
              <span className="text-slate-100 font-bold text-xs sm:text-[12.5px] leading-tight mt-0.5">
                Jharkhand Science, Technology and Innovation Portal
              </span>
              <span className="text-white/75 text-[10.5px] sm:text-[11px] mt-0.5">
                Department of Higher &amp; Technical Education, Government of Jharkhand
              </span>
            </div>
          </div>

          {/* Right: Social Media Icons (Twitter/X, LinkedIn, Facebook, YouTube) */}
          <div className="flex items-center gap-5 text-white/90 shrink-0">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white hover:scale-110 transition-all p-1"
              aria-label="Twitter / X"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white hover:scale-110 transition-all p-1"
              aria-label="LinkedIn"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.22a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z"/>
              </svg>
            </a>

            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white hover:scale-110 transition-all p-1"
              aria-label="Facebook"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
              </svg>
            </a>

            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white hover:scale-110 transition-all p-1"
              aria-label="YouTube"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>

        </div>

      </div>
    </footer>
  );
}
