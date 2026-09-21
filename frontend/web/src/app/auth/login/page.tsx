"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteNavbar } from "@/components/common/SiteNavbar";
import { SiteFooter } from "@/components/common/SiteFooter";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "@/components/dashboard/ToastStack";

function PublicLoginForm() {
  const router = useRouter();
  const { login, isLoading, error, errorCode, clearError } = useAuthStore();

  const [emailOrPhone, setEmailOrPhone] = useState("");
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
      email: emailOrPhone.trim(),
      identifier: emailOrPhone.trim(),
      password,
      loginType: "password",
      rememberMe,
      portalRole: "CITIZEN",
    });

    if (res.success) {
      toast.success("Login successful");
      router.push("/dashboard");
    }
  };

  return (
    <div className="w-full max-w-[490px] bg-white border border-[#e5e7eb] rounded-2xl p-4 sm:p-7 md:p-10 shadow-xs">
      {/* Citizen & Public Portal Header */}
      <div className="text-center mb-5 sm:mb-6">
        <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
          Citizen &amp; Public Sign In
        </h1>
        <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
          Access your submitted community issues, track remediation status &amp; participate in local polls
        </p>
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
                    href="/auth/signup"
                    className="inline-flex items-center gap-1 text-[11.5px] font-bold text-blue-700 hover:text-blue-950 underline"
                  >
                    Register a New Citizen Account Now →
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
        <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          Please check the reCAPTCHA box to verify you are human.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Mobile or Email Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            Mobile Number or Email Address
          </label>
          <input
            type="text"
            required
            placeholder="10-digit mobile or citizen email"
            value={emailOrPhone}
            onChange={(e) => {
              setEmailOrPhone(e.target.value);
              if (error) clearError();
            }}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-blue-600 hover:underline font-semibold"
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
            className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
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

        {/* Remember Me */}
        <div className="flex items-center justify-between pt-0.5 text-xs text-slate-600">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
            />
            <span>Remember this device</span>
          </label>
        </div>

        {/* Simulated reCAPTCHA v2 Box */}
        <div className="pt-2">
          <div
            onClick={handleCaptchaClick}
            className="flex items-center justify-between p-3.5 bg-[#f8fafc] border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors select-none"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${captchaChecked
                    ? "bg-blue-600 border-blue-600 text-white"
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
                I&apos;m not a robot
              </span>
            </div>
            <div className="flex flex-col items-end opacity-70">
              <div className="w-6 h-6 bg-slate-300 rounded flex items-center justify-center text-[10px] font-bold text-slate-600">
                ♻
              </div>
              <span className="text-[9px] text-slate-400 mt-0.5">reCAPTCHA</span>
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
              <span>Sign In</span>
            )}
          </button>
        </div>
      </form>

      {/* Citizen Registration Link */}
      <div className="mt-6 pt-5 border-t border-slate-200 text-center">
        <p className="text-xs text-slate-600">
          New citizen or community member?{" "}
          <Link href="/auth/signup" className="text-blue-600 hover:underline font-bold">
            Create an Account
          </Link>
        </p>
      </div>

      {/* Institutional Portals Navigation Card */}
      <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2.5">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
          Institutional &amp; Partner Portals
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <Link
            href="/auth/login/industry"
            className="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-100/70 text-slate-800 font-semibold flex items-center justify-between transition-all"
          >
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Industry / CSR</span>
            </span>
            <span className="text-slate-400 text-[10px]">→</span>
          </Link>
          <Link
            href="/auth/login/university"
            className="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-100/70 text-slate-800 font-semibold flex items-center justify-between transition-all"
          >
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
              </svg>
              <span>University</span>
            </span>
            <span className="text-slate-400 text-[10px]">→</span>
          </Link>
          <Link
            href="/auth/login/government"
            className="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-100/70 text-slate-800 font-semibold flex items-center justify-between transition-all"
          >
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Govt Officer</span>
            </span>
            <span className="text-slate-400 text-[10px]">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-blue-100">
      <SiteNavbar />

      <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10">
        <Suspense fallback={<div className="text-xs text-slate-400">Loading sign in...</div>}>
          <PublicLoginForm />
        </Suspense>
      </main>

      <SiteFooter />
    </div>
  );
}
