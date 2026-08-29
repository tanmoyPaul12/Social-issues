"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteNavbar } from "@/components/common/SiteNavbar";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function IndustryLoginPage() {
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
      portalRole: "INDUSTRY",
    });

    if (res.success) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-blue-100">
      <SiteNavbar />

      <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10">
        {/* Industry Identity Header */}
        <div className="w-full max-w-[490px] mb-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
            <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>Corporate &amp; CSR Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Industry R&amp;D Sign In
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Access CSR matching funds, R&amp;D technology licensing &amp; district pilot consoles
          </p>
        </div>

        <div className="w-full max-w-[490px] bg-white border border-[#e2e8f0] rounded-2xl p-7 sm:p-10 shadow-xs">
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
                <div className="flex items-start gap-2">
                  <span className="text-sm shrink-0 mt-0.5">
                    {errorCode === "ACCOUNT_NOT_FOUND" ? "⚠️" : "✕"}
                  </span>
                  <div className="space-y-1.5">
                    <p className="font-semibold leading-normal">{error}</p>
                    {errorCode === "ACCOUNT_NOT_FOUND" && (
                      <Link
                        href="/onboarding/industry"
                        className="inline-flex items-center gap-1 text-[11.5px] font-bold text-amber-800 hover:text-amber-950 underline"
                      >
                        Register this Corporate / CSR Account Now →
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
            {/* Corporate Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Corporate / Foundation Email
              </label>
              <input
                type="email"
                required
                placeholder="nodal.csr@company.com"
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
                  Corporate Account Password
                </label>
                <Link
                  href="/auth/forgot-password?role=industry"
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
                    className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${
                      captchaChecked
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
                    Verify corporate authorization
                  </span>
                </div>
                <div className="flex flex-col items-end opacity-70">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-500 tracking-wider">SECURE KYC</span>
                  </div>
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
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Access Industry Portal</span>
                )}
              </button>
            </div>
          </form>

          {/* Dedicated Onboarding CTA */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center space-y-3">
            <p className="text-xs text-slate-600">
              Not registered as an Industry or CSR Partner yet?
            </p>
            <Link
              href="/onboarding/industry"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-900 text-xs font-bold rounded-xl transition-all"
            >
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Register Corporate Partner (GSTIN / CSR)</span>
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
  );
}
