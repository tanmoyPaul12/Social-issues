"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteNavbar } from "@/components/common/SiteNavbar";
import { SiteFooter } from "@/components/common/SiteFooter";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { GuestOnlyGuard } from "@/components/auth/GuestOnlyGuard";

export default function SuperadminLoginPage() {
  const router = useRouter();
  const { login, isLoading, error, errorCode, clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [captchaError, setCaptchaError] = useState(false);
  const [captchaVerifying, setCaptchaVerifying] = useState(false);

  const handleCaptchaClick = () => {
    if (captchaChecked) {
      setCaptchaChecked(false);
      return;
    }
    setCaptchaVerifying(true);
    setCaptchaError(false);
    setTimeout(() => {
      setCaptchaVerifying(false);
      setCaptchaChecked(true);
    }, 450);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!captchaChecked) {
      setCaptchaError(true);
      return;
    }

    const res = await login({
      email: email.trim(),
      identifier: email.trim(),
      password,
      loginType: "password",
      rememberMe,
      portalRole: "STATE_SUPERADMIN",
    });

    if (res.success) {
      router.push("/dashboard?role=superadmin");
    }
  };

  return (
    <GuestOnlyGuard>
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-indigo-100">
        <SiteNavbar />

        <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10">
          {/* State Directorate Identity Header */}
          <div className="w-full max-w-[490px] mb-4 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-900 text-xs font-black uppercase tracking-wider mb-2.5">
              <svg className="w-3.5 h-3.5 text-indigo-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
              <span>State Directorate • Superadmin SSO</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Statewide Directorate Sign In
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
              Exclusive statewide access for the State Nodal Director, Higher &amp; Technical Education Directorate, and Cabinet Oversight Authority.
            </p>
          </div>

          <div className="w-full max-w-[490px] bg-white border border-[#e2e8f0] rounded-2xl p-7 sm:p-10 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700" />

            {/* Official State Directorate Security Banner */}
            <div className="mb-5 p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200/80 text-indigo-950 text-xs flex items-start gap-2.5">
              <svg className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div className="space-y-0.5">
                <span className="font-bold block text-indigo-950">Singleton State Superadmin Seat</span>
                <span className="text-[11.5px] leading-tight text-indigo-900/80 block">
                  Provides full statewide jurisdiction over all 24 Jharkhand District Collectorates, HEI Capstone Centers, and Innovation Clearances.
                </span>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div
                className={`mb-5 p-3.5 rounded-xl border text-xs ${
                  errorCode === "ACCOUNT_NOT_FOUND"
                    ? "bg-amber-50/90 border-amber-200 text-amber-900"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    {errorCode === "ACCOUNT_NOT_FOUND" ? (
                      <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-red-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    <div className="space-y-1.5">
                      <p className="font-semibold leading-normal">{error}</p>
                      {errorCode === "ACCOUNT_NOT_FOUND" && (
                        <Link
                          href="/onboarding/government"
                          className="inline-flex items-center gap-1 text-[11.5px] font-bold text-indigo-800 hover:text-indigo-950 underline"
                        >
                          Provision Statewide Superadmin Account →
                        </Link>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearError}
                    className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors cursor-pointer shrink-0"
                    aria-label="Dismiss error"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {captchaError && (
              <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                Please complete the State Directorate SSO authorization check.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Directorate Official Email Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Directorate Email or Official ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="director.nodal@jharkhand.gov.in"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) clearError();
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-medium"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Directorate Password / Security PIN
                  </label>
                  <Link
                    href="/auth/forgot-password?role=government"
                    className="text-xs text-indigo-700 hover:underline font-semibold"
                  >
                    Reset credentials
                  </Link>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) clearError();
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
                />
              </div>

              {/* Show Password Toggle */}
              <div className="pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                  />
                  <span>Show Password</span>
                </label>
              </div>

              {/* Simulated Gov Captcha */}
              <div className="pt-2">
                <div
                  onClick={handleCaptchaClick}
                  className="flex items-center justify-between p-3.5 bg-[#f8fafc] border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors select-none"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${
                        captchaChecked
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "border-slate-400 bg-white"
                      }`}
                    >
                      {captchaVerifying ? (
                        <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                      ) : captchaChecked ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : null}
                    </div>
                    <span className="text-xs font-semibold text-slate-700">
                      Verify Directorate SSO authority
                    </span>
                  </div>
                  <div className="flex flex-col items-end opacity-70">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                      <span className="text-[10px] font-bold text-slate-500 tracking-wider">STATE DIRECTORATE</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sign In Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-indigo-900 hover:bg-indigo-950 text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authorizing Statewide Command...</span>
                    </>
                  ) : (
                    <span>Access State Superadmin Command Center</span>
                  )}
                </button>
              </div>
            </form>

            {/* Provisioning / Onboarding CTA */}
            <div className="mt-8 pt-6 border-t border-slate-200 text-center space-y-3">
              <p className="text-xs text-slate-600">
                Vacant State Superadmin seat or need initial provisioning?
              </p>
              <Link
                href="/onboarding/government"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-900 text-xs font-bold rounded-xl transition-all"
              >
                <svg className="w-4 h-4 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                <span>State Directorate Onboarding Form</span>
              </Link>
            </div>

            {/* Switch Portal Link */}
            <div className="mt-6 flex items-center justify-between text-xs text-slate-500 font-medium">
              <Link
                href="/auth/login/government"
                className="hover:text-indigo-900 transition-colors"
              >
                ← District Nodal Sign In
              </Link>
              <Link
                href="/auth/login"
                className="hover:text-slate-800 transition-colors"
              >
                Citizen Portal →
              </Link>
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>
    </GuestOnlyGuard>
  );
}
