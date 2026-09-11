"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteNavbar } from "@/components/common/SiteNavbar";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { GuestOnlyGuard } from "@/components/auth/GuestOnlyGuard";

const JHARKHAND_DISTRICTS = [
  "Ranchi", "Dhanbad", "Dumka", "East Singhbhum (Jamshedpur)", "Bokaro", "Hazaribagh",
  "Deoghar", "Giridih", "West Singhbhum (Chaibasa)", "Palamu", "Ramgarh", "Seraikela Kharsawan",
  "Chatra", "Garhwa", "Godda", "Gumla", "Jamtara", "Khunti",
  "Koderma", "Latehar", "Lohardaga", "Pakur", "Sahebganj", "Simdega"
];

function PublicSignupForm() {
  const router = useRouter();
  const { signup, isLoading, error, clearError } = useAuthStore();

  const [entityType, setEntityType] = useState<"INDIVIDUAL" | "GROUP" | "ORGANIZATION">("INDIVIDUAL");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState(JHARKHAND_DISTRICTS[0]);
  const [block, setBlock] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // reCAPTCHA State
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

    if (!phone || phone.length < 10) {
      alert("Please provide a valid 10-digit mobile number.");
      return;
    }

    const res = await signup({
      entityType,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password: password.trim(),
      district,
      block: block.trim() || undefined,
    });

    if (res.success) {
      router.push("/dashboard?role=citizen");
    }
  };

  return (
    <div className="w-full max-w-[530px] bg-white border border-[#e5e7eb] rounded-2xl p-7 sm:p-10 shadow-xs">
      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Create your account
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Join the public civic network to report, upvote, and track local development challenges
        </p>
      </div>

      {/* Entity Type Selector */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
          Registering As
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setEntityType("INDIVIDUAL")}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${entityType === "INDIVIDUAL"
                ? "bg-blue-50 border-blue-600 text-blue-700 shadow-2xs"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
          >
            Individual
          </button>
          <button
            type="button"
            onClick={() => setEntityType("GROUP")}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${entityType === "GROUP"
                ? "bg-blue-50 border-blue-600 text-blue-700 shadow-2xs"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
          >
            SHG / Group
          </button>
          <button
            type="button"
            onClick={() => setEntityType("ORGANIZATION")}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${entityType === "ORGANIZATION"
                ? "bg-blue-50 border-blue-600 text-blue-700 shadow-2xs"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
          >
            Panchayat / Org
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={clearError}
            className="text-red-500 hover:text-red-800 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {captchaError && (
        <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
          Please verify you are human before proceeding.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            {entityType === "INDIVIDUAL" ? "Full Name" : entityType === "GROUP" ? "SHG / Group Name" : "Panchayat / Village Name"}
          </label>
          <input
            type="text"
            required
            placeholder={entityType === "INDIVIDUAL" ? "e.g. Ramesh Soren" : "e.g. Birsa Munda Mahila SHG"}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) clearError();
            }}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
          />
        </div>

        {/* Email & Phone Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) clearError();
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Mobile Number
            </label>
            <input
              type="tel"
              required
              maxLength={10}
              placeholder="10-digit mobile"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value.replace(/\D/g, ""));
                if (error) clearError();
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
            />
          </div>
        </div>

        {/* District & Block Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              District
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
            >
              {JHARKHAND_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Block / Ward (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Chainpur Block"
              value={block}
              onChange={(e) => setBlock(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            Create Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            required
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) clearError();
            }}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
          />
        </div>

        {/* Show Password */}
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

        {/* Simulated reCAPTCHA */}
        <div className="pt-2">
          <div
            onClick={handleCaptchaClick}
            className="flex items-center justify-between p-3 bg-[#f8fafc] border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors select-none"
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
              <span className="text-xs font-medium text-slate-700">
                I&apos;m not a robot
              </span>
            </div>
            <div className="flex flex-col items-end opacity-70">
              <div className="w-5 h-5 bg-slate-300 rounded flex items-center justify-center text-[9px] font-bold text-slate-600">
                ♻
              </div>
              <span className="text-[8px] text-slate-400 mt-0.5">reCAPTCHA</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-[#0077b6] hover:bg-[#005f92] text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </div>
      </form>

      {/* Sign In Link */}
      <div className="mt-6 pt-5 border-t border-slate-200 text-center">
        <p className="text-xs text-slate-600">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-600 hover:underline font-bold">
            Sign In
          </Link>
        </p>
      </div>

      {/* Institutional Onboarding Gateways Callout */}
      <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            Are you registering an Institution?
          </span>
          <span className="text-[10px] font-bold text-blue-600 uppercase">Dedicated KYC</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-tight">
          Universities, Corporate CSR Partners, and Government Nodal Officers have dedicated multi-step onboarding flows with AISHE/GSTIN verification:
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href="/onboarding/industry"
            className="text-[11.5px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>Industry / CSR Onboarding →</span>
          </Link>
          <Link
            href="/onboarding/university"
            className="text-[11.5px] font-semibold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </svg>
            <span>University (AISHE) Onboarding →</span>
          </Link>
          <Link
            href="/onboarding/government"
            className="text-[11.5px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Nodal Officer Onboarding →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <GuestOnlyGuard>
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-blue-100">
        <SiteNavbar />

        <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10">
          <Suspense fallback={<div className="text-xs text-slate-400">Loading registration...</div>}>
            <PublicSignupForm />
          </Suspense>
        </main>
      </div>
    </GuestOnlyGuard>
  );
}
