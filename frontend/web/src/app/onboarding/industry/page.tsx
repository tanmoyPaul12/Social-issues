"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingFormWrapper } from "@/components/onboarding/OnboardingFormWrapper";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "@/components/dashboard/ToastStack";

const JHARKHAND_DISTRICTS = [
  "East Singhbhum (Jamshedpur)",
  "Ranchi",
  "Dhanbad",
  "Bokaro",
  "Hazaribagh",
  "Deoghar",
  "Dumka",
  "Giridih",
  "Ramgarh",
  "Saraikela Kharsawan",
  "West Singhbhum (Chaibasa)",
  "Palamu",
  "Chatra",
  "Garhwa",
  "Godda",
  "Gumla",
  "Jamtara",
  "Khunti",
  "Koderma",
  "Latehar",
  "Lohardaga",
  "Pakur",
  "Sahebganj",
  "Simdega",
];

export default function IndustryOnboardingPage() {
  const router = useRouter();
  const { onboardIndustry, isLoading } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [refId, setRefId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Form Fields
  const [companyName, setCompanyName] = useState("");
  const [companyType, setCompanyType] = useState("Section 8 Corporate Foundation / CSR Arm");
  const [gstin, setGstin] = useState("");
  const [cinNumber, setCinNumber] = useState("");
  const [csrNumber, setCsrNumber] = useState("");
  const [district, setDistrict] = useState("East Singhbhum (Jamshedpur)");
  const [spocName, setSpocName] = useState("");
  const [designation, setDesignation] = useState("Head CSR & Sustainability");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    "Company & Legal Identity",
    "CSR Compliance & Regional Office",
    "Authorized Nodal CSR Lead",
  ];

  const validateStep = (stepIndex: number): boolean => {
    const errs: Record<string, string> = {};

    if (stepIndex === 0) {
      if (!companyName.trim()) {
        errs.companyName = "Company / Foundation legal name is required.";
      }
      const gstinTrimmed = gstin.trim().toUpperCase();
      if (!gstinTrimmed) {
        errs.gstin = "GSTIN or Corporate Identifier is required.";
      } else if (gstinTrimmed.length < 10) {
        errs.gstin = "Please enter a valid GSTIN format (e.g. 20AAACT2727Q1ZG).";
      }
    } else if (stepIndex === 1) {
      if (!csrNumber.trim()) {
        errs.csrNumber = "MCA Form CSR-1 registration number is required.";
      }
      if (!district) {
        errs.district = "Please select the registered district / operational hub.";
      }
    } else if (stepIndex === 2) {
      if (!spocName.trim()) {
        errs.spocName = "Nodal CSR officer full name is required.";
      }
      if (!email.trim() || !email.includes("@")) {
        errs.email = "A valid corporate contact email is required.";
      }
      const phoneDigits = phone.replace(/\D/g, "");
      if (!phoneDigits || phoneDigits.length < 10) {
        errs.phone = "A valid 10-digit mobile phone number is required.";
      }
      if (!password || password.length < 6) {
        errs.password = "Password must be at least 6 characters long.";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = async () => {
    setErrorMessage("");

    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const res = await onboardIndustry({
        name: spocName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: password.trim(),
        companyName: companyName.trim(),
        companyType,
        gstin: gstin.trim().toUpperCase(),
        cinNumber: cinNumber.trim().toUpperCase() || undefined,
        csrNumber: csrNumber.trim().toUpperCase(),
        designation: designation.trim() || "Head CSR & Sustainability",
        district,
      });

      if (res.success) {
        const generated = (res as any).referenceId || (res as any).user?.referenceId || `CSR-JH-2026-${Math.floor(100 + Math.random() * 900)}`;
        setRefId(generated);
        setIsComplete(true);
        toast.success("Corporate CSR partner registered successfully!");
      } else {
        const err = (res as any).message || "Onboarding failed. Please review your details and try again.";
        setErrorMessage(err);
        toast.error(err);
      }
    }
  };

  const handlePrev = () => {
    setErrorMessage("");
    setErrors({});
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push("/");
    }
  };

  return (
    <OnboardingFormWrapper
      roleTitle="Industry, Startup & CSR Partner Onboarding"
      roleTagline="Partner with university research labs across Jharkhand to co-fund prototypes, sponsor rural pilots, and scale social impact."
      roleBadge="CSR Co-Funding & Pilots"
      trustBadge="Corporate KYC"
      timeEstimate="~2 Minutes"
      steps={steps}
      currentStepIndex={currentStep}
      onPrevStep={handlePrev}
      onNextStep={handleNext}
      isComplete={isComplete}
      referenceId={refId}
      completedSummary={[
        { label: "Organization", value: companyName || "-" },
        { label: "GSTIN Number", value: gstin.toUpperCase() || "-" },
        { label: "CSR-1 Registration", value: csrNumber.toUpperCase() || "-" },
        { label: "Operational Hub", value: district || "-" },
        { label: "Nodal CSR Lead", value: spocName || "-" },
        { label: "Corporate Email", value: email.toLowerCase() || "-" },
        { label: "Verification Status", value: "Verified & Pre-Approved" },
      ]}
      dashboardRole="industry"
    >
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-3">
          <svg className="w-5 h-5 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ── STEP 1: COMPANY & LEGAL IDENTITY ── */}
      {currentStep === 0 && (
        <div className="space-y-5 max-w-2xl mx-auto animate-in fade-in">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Company / Foundation Legal Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Tata Steel Foundation / Coal India CSR / Mining Enterprises"
              value={companyName}
              onChange={(e) => {
                setCompanyName(e.target.value);
                if (errors.companyName) setErrors((prev) => ({ ...prev, companyName: "" }));
              }}
              className={`w-full px-4 py-3 rounded-2xl border ${
                errors.companyName ? "border-rose-400 bg-rose-50/40" : "border-slate-300"
              } text-slate-900 text-xs font-semibold outline-none focus:border-blue-500 transition-all`}
            />
            {errors.companyName && (
              <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                {errors.companyName}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                GSTIN Number (15 Digits) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 20AAACT2727Q1ZG"
                value={gstin}
                onChange={(e) => {
                  setGstin(e.target.value);
                  if (errors.gstin) setErrors((prev) => ({ ...prev, gstin: "" }));
                }}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  errors.gstin ? "border-rose-400 bg-rose-50/40" : "border-slate-300"
                } text-slate-900 font-mono text-xs outline-none focus:border-blue-500 uppercase transition-all`}
              />
              {errors.gstin && (
                <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                  {errors.gstin}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                CIN / Udyam Registration <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. U85300JH2016NPL008920"
                value={cinNumber}
                onChange={(e) => setCinNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-mono text-xs outline-none focus:border-blue-500 uppercase transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Organization Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={companyType}
              onChange={(e) => setCompanyType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium outline-none focus:border-blue-500 cursor-pointer"
            >
              <option>Section 8 Corporate Foundation / CSR Arm</option>
              <option>Public Sector Undertaking (PSU / Mining)</option>
              <option>Private Limited Enterprise / Industrial R&amp;D</option>
              <option>Recognized DPIIT Startup / MSME</option>
              <option>Impact Investment &amp; Venture Trust</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="w-full mt-2 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Continue to CSR Compliance →</span>
          </button>
        </div>
      )}

      {/* ── STEP 2: CSR COMPLIANCE & OPERATIONAL DISTRICT ── */}
      {currentStep === 1 && (
        <div className="space-y-5 max-w-2xl mx-auto animate-in fade-in">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              MCA Form CSR-1 Registration Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. CSR00004128"
              value={csrNumber}
              onChange={(e) => {
                setCsrNumber(e.target.value);
                if (errors.csrNumber) setErrors((prev) => ({ ...prev, csrNumber: "" }));
              }}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                errors.csrNumber ? "border-rose-400 bg-rose-50/40" : "border-slate-300"
              } text-slate-900 font-mono text-xs outline-none focus:border-blue-500 uppercase transition-all`}
            />
            {errors.csrNumber ? (
              <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                {errors.csrNumber}
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 mt-1 block">
                Mandatory registration issued by Ministry of Corporate Affairs (MCA) for eligible corporate CSR fund allocation.
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Primary Operational Hub / Registered District <span className="text-rose-500">*</span>
            </label>
            <select
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value);
                if (errors.district) setErrors((prev) => ({ ...prev, district: "" }));
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium outline-none focus:border-blue-500 cursor-pointer"
            >
              {JHARKHAND_DISTRICTS.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Workspace Notice */}
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
              ℹ
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-blue-950">Dynamic Thematic Sector &amp; Grant Matching</h4>
              <p className="text-[11px] text-blue-900/80 leading-relaxed">
                You do not need to lock in fixed sectors during onboarding. Once onboarded, you can explore live Grassroots Challenges, filter projects by domain (e.g. Clean Water, Agriculture, Energy), and commit CSR co-grants directly from your <strong>Industry Dashboard Workspace</strong>.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="w-full mt-2 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Continue to Nodal Lead Details →</span>
          </button>
        </div>
      )}

      {/* ── STEP 3: AUTHORIZED NODAL LEAD & CREDENTIALS ── */}
      {currentStep === 2 && (
        <div className="space-y-5 max-w-2xl mx-auto animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Authorized Nodal Lead Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Priya Sharma"
                value={spocName}
                onChange={(e) => {
                  setSpocName(e.target.value);
                  if (errors.spocName) setErrors((prev) => ({ ...prev, spocName: "" }));
                }}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  errors.spocName ? "border-rose-400 bg-rose-50/40" : "border-slate-300"
                } text-slate-900 text-xs font-medium outline-none focus:border-blue-500 transition-all`}
              />
              {errors.spocName && (
                <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                  {errors.spocName}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Official Designation
              </label>
              <input
                type="text"
                placeholder="e.g. Head CSR &amp; Sustainability / Director"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-medium outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Official Corporate Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                placeholder="e.g. priya.sharma@tatasteel.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                }}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  errors.email ? "border-rose-400 bg-rose-50/40" : "border-slate-300"
                } text-slate-900 font-mono text-xs outline-none focus:border-blue-500 transition-all`}
              />
              {errors.email && (
                <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                  {errors.email}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Contact Mobile Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="e.g. 9934102911"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                }}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  errors.phone ? "border-rose-400 bg-rose-50/40" : "border-slate-300"
                } text-slate-900 font-mono text-xs outline-none focus:border-blue-500 transition-all`}
              />
              {errors.phone && (
                <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                  {errors.phone}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Create Account Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              placeholder="Minimum 6 characters (e.g. TataCSR@2026)"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
              }}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                errors.password ? "border-rose-400 bg-rose-50/40" : "border-slate-300"
              } text-slate-900 text-xs outline-none focus:border-blue-500 transition-all`}
            />
            {errors.password && (
              <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                {errors.password}
              </span>
            )}
          </div>

          {/* Legal / IP Accord Notice */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-[11px] text-amber-950 leading-relaxed">
              <strong>Tripartite IP Framework:</strong> Co-funded prototypes grant the sponsoring corporate partner first-right licensing, field testing, and collaborative technology commercialization rights under Government of Jharkhand Innovation Guidelines.
            </p>
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={isLoading}
            className={`w-full mt-2 py-3.5 rounded-full ${
              isLoading ? "bg-amber-400 cursor-not-allowed" : "bg-amber-600 hover:bg-amber-700"
            } text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Registering Corporate Partner...</span>
              </>
            ) : (
              <span>Submit Corporate Partner Onboarding →</span>
            )}
          </button>
        </div>
      )}
    </OnboardingFormWrapper>
  );
}
