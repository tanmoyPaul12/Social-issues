"use client";

import React, { ReactNode } from "react";
import Link from "next/link";

export interface OnboardingFormWrapperProps {
  roleTitle: string;
  roleTagline: string;
  roleBadge: string;
  trustBadge: string;
  timeEstimate: string;
  steps: string[];
  currentStepIndex: number;
  onPrevStep: () => void;
  onNextStep?: () => void;
  onFillSampleData?: () => void;
  isComplete: boolean;
  referenceId: string;
  completedSummary?: { label: string; value: string }[];
  dashboardRole?: "citizen" | "university" | "industry" | "government";
  children: ReactNode;
}

export function OnboardingFormWrapper({
  roleTitle,
  roleTagline,
  roleBadge,
  trustBadge,
  timeEstimate,
  steps,
  currentStepIndex,
  onPrevStep,
  onNextStep,
  isComplete,
  referenceId,
  completedSummary,
  dashboardRole = "citizen",
  children,
}: OnboardingFormWrapperProps) {
  return (
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
              <span>Nodal Support:</span>
              <span className="font-mono font-bold text-slate-900">1800-345-6588</span>
            </div>

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

      {/* Main Form Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* Banner */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-[11px] font-bold tracking-wider uppercase mb-3">
            <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>{roleBadge}</span>
            <span>•</span>
            <span>{trustBadge}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            {roleTitle}
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
            {roleTagline}
          </p>
        </div>

        {/* Card Frame */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-9 shadow-md">
          {!isComplete ? (
            <div>
              {/* Progress Stepper & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <button
                  type="button"
                  onClick={onPrevStep}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>{currentStepIndex === 0 ? "Back to Portal" : "Previous Step"}</span>
                </button>

                {/* Steps indicator */}
                <div className="flex items-center gap-2">
                  {steps.map((stepName, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                          idx === currentStepIndex
                            ? "bg-blue-600 text-white shadow-xs"
                            : idx < currentStepIndex
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {idx < currentStepIndex ? (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span
                        className={`text-xs hidden sm:inline font-bold ${
                          idx === currentStepIndex ? "text-slate-900" : "text-slate-400"
                        }`}
                      >
                        {stepName}
                      </span>
                      {idx < steps.length - 1 && <div className="w-4 h-0.5 bg-slate-200" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Content */}
              <div className="mt-8">{children}</div>
            </div>
          ) : (
            /* Completion View */
            <div className="text-center py-8 space-y-5 animate-in fade-in">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-2xl font-black text-slate-900">
                Onboarding Submitted Successfully
              </h2>

              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Your registration has been logged in the Jharkhand Higher Education &amp; Innovation System.
              </p>

              {/* Summary Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left max-w-md mx-auto text-xs space-y-2.5">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Reference Code:</span>
                  <strong className="font-mono text-sm text-blue-700 font-black">{referenceId}</strong>
                </div>

                {completedSummary?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-slate-500">{item.label}:</span>
                    <strong className="text-slate-800 font-semibold">{item.value}</strong>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3">
                <Link
                  href={`/dashboard?role=${dashboardRole}`}
                  className="px-7 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Launch {dashboardRole.toUpperCase()} Dashboard →</span>
                </Link>
                <Link
                  href="/"
                  className="px-6 py-3 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors shadow-2xs text-center cursor-pointer"
                >
                  Return to Portal Home
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer info notice */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <span>Est. Completion Time: <strong>{timeEstimate}</strong> • Secured by Government of Jharkhand Innovation Infrastructure</span>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-5 px-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Government of Jharkhand • Department of Higher &amp; Technical Education</span>
          <span className="text-slate-400">SIH-1831 • NEP 2020 Innovation Architecture</span>
        </div>
      </footer>
    </div>
  );
}
