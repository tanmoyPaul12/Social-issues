"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteNavbar } from "@/components/common/SiteNavbar";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { GuestOnlyGuard } from "@/components/auth/GuestOnlyGuard";

export default function UniversityLoginPage() {
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
      portalRole: "UNIVERSITY",
    });

    if (res.success) {
      router.push("/dashboard");
    }
  };

  return (
    <GuestOnlyGuard>
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-purple-100">
        <SiteNavbar />

        <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10">
          {/* University Identity Header */}
          <div className="w-full max-w-[490px] mb-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-800 text-xs font-bold uppercase tracking-wider mb-2">
              <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
              <span>Academic &amp; Research Gateway</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              University &amp; Lab Sign In
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Access AISHE-verified Capstone problem allocations, R&amp;D grants &amp; testing console
            </p>
          </div>

          <div className="w-full max-w-[490px] bg-white border border-[#e2e8f0] rounded-2xl p-7 sm:p-10 shadow-xs">
            {/* Error Banner */}
            {error && (
              <div
                className={`mb-5 p-3.5 rounded-xl border text-xs ${errorCode === "ACCOUNT_NOT_FOUND"
                    ? "bg-amber-50/90 border-amber-200 text-amber-900"
                    : "bg-red-50 border-red-200 text-red-700"
                  }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <span className="text-sm shrink-0 mt-0.5">
                      {errorCode === "ACCOUNT_NOT_FOUND" ? "⚠️" : "✕"}
                    </span>
                    <div className="space-y-1.5">
                      <p className="font-semibold leading-normal">{error}</p>
                      {errorCode === "ACCOUNT_NOT_FOUND" && (
                        <Link
                          href={`/onboarding/university`}
                          className="inline-flex items-center gap-1 text-[11.5px] font-bold text-amber-800 hover:text-amber-950 underline"
                        >
                          Register this College / Department Now →
                        </Link>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearError}
                    className="text-slate-400 hover:text-slate-700 font-bold ml-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {captchaError && (
              <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                Please complete the verification check before signing in.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Institutional Email Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Institutional Email (AISHE / Univ Domain)
                </label>
                <input
                  type="email"
                  required
                  placeholder="faculty.lead@bitmesra.ac.in"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) clearError();
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-[#0077b6] focus:ring-1 focus:ring-[#0077b6] transition-all"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Account Password
                  </label>
                  <Link
                    href="/auth/forgot-password?role=university"
                    className="text-xs text-[#0077b6] hover:underline font-semibold"
                  >
                    Forgot password?
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-[#0077b6] focus:ring-1 focus:ring-[#0077b6] transition-all"
                />
              </div>

              {/* Show Password Toggle */}
              <div className="pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                  />
                  <span>Show Password</span>
                </label>
              </div>

              {/* Simulated Captcha */}
              <div className="pt-2">
                <div
                  onClick={handleCaptchaClick}
                  className="flex items-center justify-between p-3.5 bg-[#f8fafc] border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors select-none"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${captchaChecked
                          ? "bg-emerald-600 border-emerald-600 text-white"
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
                      Verify academic accreditation
                    </span>
                  </div>
                  <div className="flex flex-col items-end opacity-70">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-slate-500 tracking-wider">AISHE SECURE</span>
                    </div>
                    <span className="text-[9px] text-slate-400">Govt of Jharkhand</span>
                  </div>
                </div>
              </div>

              {/* Sign In Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-[#0077b6] hover:bg-[#005f92] text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying AISHE Credentials...</span>
                    </>
                  ) : (
                    <span>Sign In to University Portal →</span>
                  )}
                </button>
              </div>
            </form>

            {/* Dedicated Onboarding CTA */}
            <div className="mt-8 pt-6 border-t border-slate-200 text-center space-y-3">
              <p className="text-xs text-slate-600">
                New college, department, or incubation lab?
              </p>
              <Link
                href="/onboarding/university"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-900 text-xs font-bold rounded-xl transition-all"
              >
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Register College / University (AISHE Code)</span>
              </Link>
            </div>

            {/* Switch Portal Link */}
            <div className="mt-6 text-center">
              <Link
                href="/auth/login"
                className="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors"
              >
                ← Back to Citizen &amp; Public Sign In
              </Link>
            </div>
          </div>
        </main>
      </div>
    </GuestOnlyGuard>
  );
}
