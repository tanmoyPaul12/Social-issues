"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OnboardingFormWrapper } from "@/components/onboarding/OnboardingFormWrapper";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "@/components/dashboard/ToastStack";
import { GuestOnlyGuard } from "@/components/auth/GuestOnlyGuard";

const JHARKHAND_DISTRICTS = [
  "Ranchi",
  "Dhanbad",
  "East Singhbhum (Jamshedpur)",
  "Bokaro",
  "Hazaribagh",
  "Deoghar",
  "Dumka",
  "Giridih",
  "Ramgarh",
  "Palamu",
  "West Singhbhum (Chaibasa)",
  "Saraikela Kharsawan",
  "Garhwa",
  "Chatra",
  "Godda",
  "Gumla",
  "Jamtara",
  "Khunti",
  "Koderma",
  "Latehar",
  "Lohardaga",
  "Pakur",
  "Sahibganj",
  "Simdega",
];

const GOVT_DEPARTMENTS = [
  "Department of Higher & Technical Education",
  "Department of Agriculture & Animal Husbandry",
  "Health, Medical Education & Family Welfare",
  "Department of Drinking Water & Sanitation",
  "Department of Forest, Environment & Climate Change",
  "Department of Energy & JREDA",
  "Department of Urban Development & Housing",
  "Women, Child Development & Social Security",
  "Personnel, Administrative Reforms & Rajbhasha",
  "Rural Development & Panchayati Raj",
];

export default function GovernmentOnboardingPage() {
  const router = useRouter();
  const { onboardGovernment, isLoading } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [refId, setRefId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Step 1: Department & Administrative Identity
  const [govtDepartment, setGovtDepartment] = useState(GOVT_DEPARTMENTS[0]);
  const [govtDistrict, setGovtDistrict] = useState("Statewide (All 24 Districts)");
  const [serviceCode, setServiceCode] = useState("");
  const [govtDesignation, setGovtDesignation] = useState("");

  // Step 2: Nodal Officer Credentials & Security
  const [nodalName, setNodalName] = useState("");
  const [govtEmail, setGovtEmail] = useState("");
  const [govtPhone, setGovtPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 3: Jurisdiction Scope, Triage Mandate & Authorization
  const [panchayatCode, setPanchayatCode] = useState("");
  const [authorizedDeclaration, setAuthorizedDeclaration] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    "Department & Identity",
    "Nodal Credentials & Security",
    "Jurisdiction & Authorization",
  ];

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { label: "", color: "", width: "0%" };
    if (password.length < 6) return { label: "Too Short", color: "bg-rose-500", width: "25%" };
    if (password.length < 8) return { label: "Fair", color: "bg-amber-500", width: "50%" };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
      return { label: "Strong", color: "bg-emerald-500", width: "100%" };
    }
    return { label: "Good", color: "bg-blue-500", width: "75%" };
  };

  const passwordStrength = getPasswordStrength();

  const validateStep = (stepIndex: number): boolean => {
    const errs: Record<string, string> = {};

    if (stepIndex === 0) {
      if (!govtDepartment.trim()) {
        errs.govtDepartment = "Please select your government department / ministry.";
      }
      if (!govtDistrict.trim()) {
        errs.govtDistrict = "Please select the assigned district jurisdiction.";
      }
      if (!serviceCode.trim()) {
        errs.serviceCode = "Official Officer Service ID / Employee Code is required.";
      } else if (serviceCode.trim().length < 3) {
        errs.serviceCode = "Service Code must be at least 3 characters.";
      }
      if (!govtDesignation.trim()) {
        errs.govtDesignation = "Official designation is required (e.g. District Nodal Officer, BDO).";
      }
    } else if (stepIndex === 1) {
      if (!nodalName.trim()) {
        errs.nodalName = "Nodal officer full name is required.";
      }
      if (!govtEmail.trim()) {
        errs.govtEmail = "Official government email is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(govtEmail.trim())) {
        errs.govtEmail = "Please enter a valid email address.";
      }
      const phoneDigits = govtPhone.replace(/\D/g, "");
      if (!phoneDigits) {
        errs.govtPhone = "Official contact mobile number is required.";
      } else if (phoneDigits.length < 10) {
        errs.govtPhone = "Please enter a valid 10-digit mobile number.";
      }
      if (!password) {
        errs.password = "Password is required for account security.";
      } else if (password.length < 6) {
        errs.password = "Password must be at least 6 characters long.";
      }
      if (!confirmPassword) {
        errs.confirmPassword = "Please confirm your password.";
      } else if (password !== confirmPassword) {
        errs.confirmPassword = "Passwords do not match.";
      }
    } else if (stepIndex === 2) {
      if (!authorizedDeclaration) {
        errs.authorizedDeclaration = "You must accept the official service authorization declaration.";
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
      // Final submission to backend API
      const res = await onboardGovernment({
        name: nodalName.trim(),
        email: govtEmail.trim().toLowerCase(),
        phone: govtPhone.replace(/\D/g, ""),
        password: password.trim(),
        district: govtDistrict,
        designation: govtDesignation.trim(),
        govtDepartment: govtDepartment.trim(),
        serviceCode: serviceCode.trim().toUpperCase(),
        panchayatCode: panchayatCode.trim() || undefined,
      });

      if (res.success) {
        const generated =
          (res as any).referenceId ||
          (res as any).user?.referenceId ||
          `GOV-JH-2026-${Math.floor(100 + Math.random() * 900)}`;
        setRefId(generated);
        setIsComplete(true);
        toast.success("Government Nodal Officer provisioned successfully!");
      } else {
        const err = (res as any).message || "Provisioning failed. Please review your details and try again.";
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
    <GuestOnlyGuard>
      <OnboardingFormWrapper
        roleTitle="Government & Nodal Official Onboarding"
        roleTagline="Access administrative triage consoles, review AI problem clustering, and route validated grassroots challenges to regional universities."
        roleBadge="Administrative Triage Console"
        trustBadge="Government Provisioned"
        timeEstimate="~2 Minutes"
        steps={steps}
        currentStepIndex={currentStep}
        onPrevStep={handlePrev}
        onNextStep={handleNext}
        isComplete={isComplete}
        referenceId={refId}
        completedSummary={[
          { label: "Department", value: govtDepartment || "-" },
          { label: "Jurisdiction", value: govtDistrict || "-" },
          { label: "Officer Name", value: nodalName || "-" },
          { label: "Designation", value: govtDesignation || "-" },
          { label: "Service ID", value: serviceCode.toUpperCase() || "-" },
          { label: "Official Email", value: govtEmail.toLowerCase() || "-" },
          { label: "Access Level", value: "NODAL_ADMIN (District Triage & Routing)" },
        ]}
        dashboardRole="government"
      >
        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-3">
            <svg className="w-5 h-5 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ── STEP 1: DEPARTMENT & ADMINISTRATIVE IDENTITY ── */}
        {currentStep === 0 && (
          <div className="space-y-5 max-w-2xl mx-auto animate-in fade-in">
            {/* Department Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Government Department / Line Ministry <span className="text-rose-500">*</span>
              </label>
              <select
                value={govtDepartment}
                onChange={(e) => {
                  setGovtDepartment(e.target.value);
                  if (errors.govtDepartment) setErrors((prev) => ({ ...prev, govtDepartment: "" }));
                }}
                className={`w-full px-4 py-3 rounded-2xl border ${
                  errors.govtDepartment ? "border-rose-400 bg-rose-50/40" : "border-slate-300 bg-white"
                } text-slate-900 text-xs font-semibold outline-none focus:border-blue-500 transition-all`}
              >
                {GOVT_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              {errors.govtDepartment && (
                <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                  {errors.govtDepartment}
                </span>
              )}
            </div>

            {/* Jurisdiction District */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Assigned District Jurisdiction in Jharkhand <span className="text-rose-500">*</span>
              </label>
              <select
                value={govtDistrict}
                onChange={(e) => {
                  setGovtDistrict(e.target.value);
                  if (errors.govtDistrict) setErrors((prev) => ({ ...prev, govtDistrict: "" }));
                }}
                className={`w-full px-4 py-3 rounded-2xl border ${
                  errors.govtDistrict ? "border-rose-400 bg-rose-50/40" : "border-slate-300 bg-white"
                } text-slate-900 text-xs font-bold outline-none focus:border-blue-500 transition-all`}
              >
                <option value="Statewide (All 24 Districts)">Statewide (All 24 Districts - State HQ)</option>
                {JHARKHAND_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d} District
                  </option>
                ))}
              </select>
              {errors.govtDistrict && (
                <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                  {errors.govtDistrict}
                </span>
              )}
            </div>

            {/* Service Code & Designation Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Officer Service ID / Employee Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. JH-IAS-2022-041 / JH-DHTE-105"
                  value={serviceCode}
                  onChange={(e) => {
                    setServiceCode(e.target.value);
                    if (errors.serviceCode) setErrors((prev) => ({ ...prev, serviceCode: "" }));
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.serviceCode ? "border-rose-400 bg-rose-50/40" : "border-slate-300"
                  } text-slate-900 font-mono text-xs uppercase outline-none focus:border-blue-500 transition-all`}
                />
                {errors.serviceCode && (
                  <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                    {errors.serviceCode}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Official Designation <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. District Nodal Officer / BDO / Joint Secretary"
                  value={govtDesignation}
                  onChange={(e) => {
                    setGovtDesignation(e.target.value);
                    if (errors.govtDesignation) setErrors((prev) => ({ ...prev, govtDesignation: "" }));
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.govtDesignation ? "border-rose-400 bg-rose-50/40" : "border-slate-300"
                  } text-slate-900 text-xs outline-none focus:border-blue-500 transition-all`}
                />
                {errors.govtDesignation && (
                  <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                    {errors.govtDesignation}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3">
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                Continue to Nodal Credentials & Security →
              </button>
            </div>

            {/* Existing Account Login Link */}
            <div className="pt-2 text-center">
              <span className="text-xs text-slate-500">
                Already have a provisioned government account?{" "}
                <Link
                  href="/auth/login/government"
                  className="font-bold text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Sign in here →
                </Link>
              </span>
            </div>
          </div>
        )}

        {/* ── STEP 2: NODAL CREDENTIALS & SECURITY ── */}
        {currentStep === 1 && (
          <div className="space-y-5 max-w-2xl mx-auto animate-in fade-in">
            {/* Nodal Officer Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nodal Officer Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Rajeev Ranjan / Anita Soren"
                value={nodalName}
                onChange={(e) => {
                  setNodalName(e.target.value);
                  if (errors.nodalName) setErrors((prev) => ({ ...prev, nodalName: "" }));
                }}
                className={`w-full px-4 py-3 rounded-2xl border ${
                  errors.nodalName ? "border-rose-400 bg-rose-50/40" : "border-slate-300"
                } text-slate-900 text-xs font-semibold outline-none focus:border-blue-500 transition-all`}
              />
              {errors.nodalName && (
                <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                  {errors.nodalName}
                </span>
              )}
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Official Gov Email (@jharkhand.gov.in / @nic.in) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. rajeev.ranjan@jharkhand.gov.in"
                  value={govtEmail}
                  onChange={(e) => {
                    setGovtEmail(e.target.value);
                    if (errors.govtEmail) setErrors((prev) => ({ ...prev, govtEmail: "" }));
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.govtEmail ? "border-rose-400 bg-rose-50/40" : "border-slate-300"
                  } text-slate-900 font-mono text-xs outline-none focus:border-blue-500 transition-all`}
                />
                {errors.govtEmail && (
                  <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                    {errors.govtEmail}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Official Mobile Number (10 Digits) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="e.g. 9876543210"
                  value={govtPhone}
                  onChange={(e) => {
                    setGovtPhone(e.target.value.replace(/\D/g, ""));
                    if (errors.govtPhone) setErrors((prev) => ({ ...prev, govtPhone: "" }));
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.govtPhone ? "border-rose-400 bg-rose-50/40" : "border-slate-300"
                  } text-slate-900 font-mono text-xs outline-none focus:border-blue-500 transition-all`}
                />
                {errors.govtPhone && (
                  <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                    {errors.govtPhone}
                  </span>
                )}
              </div>
            </div>

            {/* Password & Confirm Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Official Password / PIN <span className="text-rose-500">*</span>
                  </label>
                  {password && (
                    <span className="text-[10px] font-bold text-slate-500">
                      Strength: {passwordStrength.label}
                    </span>
                  )}
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.password ? "border-rose-400 bg-rose-50/40" : "border-slate-300"
                  } text-slate-900 text-xs outline-none focus:border-blue-500 transition-all`}
                />
                {password && (
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-1.5">
                    <div
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      style={{ width: passwordStrength.width }}
                    />
                  </div>
                )}
                {errors.password && (
                  <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                    {errors.password}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.confirmPassword ? "border-rose-400 bg-rose-50/40" : "border-slate-300"
                  } text-slate-900 text-xs outline-none focus:border-blue-500 transition-all`}
                />
                {errors.confirmPassword && (
                  <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                    {errors.confirmPassword}
                  </span>
                )}
              </div>
            </div>

            {/* Show Password Toggle */}
            <div className="flex items-center gap-2 select-none">
              <input
                type="checkbox"
                id="showGovPassword"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
              />
              <label htmlFor="showGovPassword" className="text-xs text-slate-600 font-medium cursor-pointer">
                Show password in plain text
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-3">
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                Continue to Jurisdiction & Authorization →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: JURISDICTION & AUTHORIZATION ── */}
        {currentStep === 2 && (
          <div className="space-y-5 max-w-2xl mx-auto animate-in fade-in">
            {/* Optional Panchayat / ULB Code */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Block / ULB / Panchayat Code <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. JH-RNC-BL01 / WARD-04"
                value={panchayatCode}
                onChange={(e) => setPanchayatCode(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-mono text-xs uppercase outline-none focus:border-blue-500 transition-all"
              />
            </div>

            {/* RBAC Scoping Alert Box */}
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="text-xs text-blue-950 space-y-1">
                <p className="font-bold">
                  Tenant Scope: {govtDistrict} • {govtDepartment}
                </p>
                <p className="text-blue-800 leading-relaxed">
                  As an authorized Nodal Administrator, your role will be provisioned with district problem triage authority, AI sector classification review, and university routing capabilities under NEP 2020.
                </p>
              </div>
            </div>

            {/* Official Declaration Checkbox */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={authorizedDeclaration}
                  onChange={(e) => {
                    setAuthorizedDeclaration(e.target.checked);
                    if (errors.authorizedDeclaration) {
                      setErrors((prev) => ({ ...prev, authorizedDeclaration: "" }));
                    }
                  }}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                />
                <span className="text-xs text-slate-700 leading-relaxed">
                  I hereby declare that I am an authorized government officer / departmental nodal lead in the State of Jharkhand. I confirm that all credentials provided are accurate and provisioned under administrative authority.
                </span>
              </label>
              {errors.authorizedDeclaration && (
                <span className="text-[11px] text-rose-600 font-medium mt-2 block pl-7">
                  {errors.authorizedDeclaration}
                </span>
              )}
            </div>

            {/* Submit Action Button */}
            <div className="pt-3">
              <button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className="w-full py-3.5 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Provisioning Nodal Console...</span>
                  </>
                ) : (
                  <span>Activate Nodal Administration Console →</span>
                )}
              </button>
            </div>
          </div>
        )}
      </OnboardingFormWrapper>
    </GuestOnlyGuard>
  );
}

