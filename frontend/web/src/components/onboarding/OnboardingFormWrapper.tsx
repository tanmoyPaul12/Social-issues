"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { SiteNavbar } from "@/components/common/SiteNavbar";
import { SiteFooter } from "@/components/common/SiteFooter";

export interface OnboardingFormWrapperProps {
  roleTitle: string;
  roleTagline: string;
  roleBadge?: string;
  trustBadge?: string;
  timeEstimate?: string;
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
  steps,
  currentStepIndex,
  onPrevStep,
  isComplete,
  referenceId,
  completedSummary,
  dashboardRole = "citizen",
  children,
}: OnboardingFormWrapperProps) {
  const getLoginUrl = () => {
    switch (dashboardRole) {
      case "university":
        return "/auth/login/university";
      case "industry":
        return "/auth/login/industry";
      case "government":
        return "/auth/login/government";
      default:
        return "/auth/login";
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <SiteNavbar />

      <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-[540px] bg-white border border-[#e5e7eb] rounded-2xl p-7 sm:p-9 shadow-xs">
          {!isComplete ? (
            <div>
              {/* Header Title & Subtitle */}
              <div className="text-center mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {roleTitle}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  {roleTagline}
                </p>
              </div>

              {/* Minimal Clean Step Bar */}
              {steps.length > 1 && (
                <div className="mb-6 pb-4 border-b border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-slate-700">
                      Step {currentStepIndex + 1} of {steps.length}: <span className="text-blue-600 font-bold">{steps[currentStepIndex]}</span>
                    </span>
                    {currentStepIndex > 0 && (
                      <button
                        type="button"
                        onClick={onPrevStep}
                        className="text-slate-400 hover:text-slate-700 font-medium transition-colors cursor-pointer flex items-center gap-1"
                      >
                        ← Back
                      </button>
                    )}
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                      style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Form Content */}
              <div>{children}</div>

              {/* Already have an account */}
              <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
                Already registered?{" "}
                <Link href={getLoginUrl()} className="font-bold text-blue-600 hover:underline">
                  Sign In
                </Link>
              </div>
            </div>
          ) : (
            /* Simple Clean Completion View */
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Registration Successful
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Your account has been registered with the Jharkhand Innovation Platform.
                </p>
              </div>

              {/* Clean Reference Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Reference ID:</span>
                  <span className="font-mono font-bold text-blue-700">{referenceId}</span>
                </div>

                {completedSummary?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-slate-600">
                    <span className="text-slate-500">{item.label}:</span>
                    <span className="font-medium text-slate-800">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 space-y-2">
                <Link
                  href={`/dashboard?role=${dashboardRole}`}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Go to {dashboardRole.charAt(0).toUpperCase() + dashboardRole.slice(1)} Dashboard →</span>
                </Link>
                <Link
                  href="/"
                  className="block w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-medium text-center"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
