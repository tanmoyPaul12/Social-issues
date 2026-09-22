"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OnboardingFormWrapper } from "@/components/onboarding/OnboardingFormWrapper";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "@/components/dashboard/ToastStack";
import { GuestOnlyGuard } from "@/components/auth/GuestOnlyGuard";

const JHARKHAND_DISTRICTS = [
  "Ranchi", "Dhanbad", "East Singhbhum (Jamshedpur)", "Bokaro", "Hazaribagh",
  "Deoghar", "Dumka", "Giridih", "Ramgarh", "Palamu", "West Singhbhum (Chaibasa)",
  "Saraikela Kharsawan", "Garhwa", "Chatra", "Godda", "Gumla", "Jamtara",
  "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Sahibganj", "Simdega"
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
  const [showPassword, setShowPassword] = useState(false);

  // Step 3: Jurisdiction Scope, Triage Mandate & Authorization
  const [panchayatCode, setPanchayatCode] = useState("");
  const [authorizedDeclaration, setAuthorizedDeclaration] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    "Department & Identity",
    "Nodal Credentials",
    "Scope & Authorization",
  ];

  const validateStep = (stepIndex: number): boolean => {
    const errs: Record<string, string> = {};

    if (stepIndex === 0) {
      if (!govtDepartment.trim()) {
        errs.govtDepartment = "Please select your department.";
      }
      if (!serviceCode.trim()) {
        errs.serviceCode = "Official Service ID / Employee Code is required.";
      }
      if (!govtDesignation.trim()) {
        errs.govtDesignation = "Official designation is required (e.g. BDO / Nodal Officer).";
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
      if (!phoneDigits || phoneDigits.length < 10) {
        errs.govtPhone = "Official 10-digit mobile number is required.";
      }
      if (!password || password.length < 6) {
        errs.password = "Password must be at least 6 characters long.";
      }
    } else if (stepIndex === 2) {
      if (!authorizedDeclaration) {
        errs.authorizedDeclaration = "You must accept the official authorization declaration.";
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
        const err = (res as any).message || "Provisioning failed. Please review your details.";
        setErrorMessage(err);
      }
    }
  };

  const handlePrev = () => {
    setErrorMessage("");
    setErrors({});
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push("/onboarding");
    }
  };

  return (
    <GuestOnlyGuard>
      <OnboardingFormWrapper
        roleTitle="Government &amp; Nodal Officer Registration"
        roleTagline="Access administrative triage consoles, review AI classifications, and route validated challenges"
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
        ]}
        dashboardRole="government"
      >
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            <p className="font-semibold">{errorMessage}</p>
          </div>
        )}

        {/* Step 0: Department & Identity */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Government Department / Ministry
              </label>
              <select
                value={govtDepartment}
                onChange={(e) => {
                  setGovtDepartment(e.target.value);
                  if (errors.govtDepartment) setErrors((prev) => ({ ...prev, govtDepartment: "" }));
                }}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              >
                {GOVT_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Assigned District Jurisdiction
              </label>
              <select
                value={govtDistrict}
                onChange={(e) => setGovtDistrict(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              >
                <option value="Statewide (All 24 Districts)">Statewide (All 24 Districts)</option>
                {JHARKHAND_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d} District
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Officer Service ID / Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. JH-IAS-2022-041"
                  value={serviceCode}
                  onChange={(e) => {
                    setServiceCode(e.target.value);
                    if (errors.serviceCode) setErrors((prev) => ({ ...prev, serviceCode: "" }));
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all uppercase font-mono"
                />
                {errors.serviceCode && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.serviceCode}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Designation
                </label>
                <input
                  type="text"
                  placeholder="e.g. BDO / Nodal Officer"
                  value={govtDesignation}
                  onChange={(e) => {
                    setGovtDesignation(e.target.value);
                    if (errors.govtDesignation) setErrors((prev) => ({ ...prev, govtDesignation: "" }));
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                />
                {errors.govtDesignation && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.govtDesignation}</p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                Continue to Credentials →
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Nodal Credentials & Security */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Nodal Officer Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Rajeev Ranjan"
                value={nodalName}
                onChange={(e) => {
                  setNodalName(e.target.value);
                  if (errors.nodalName) setErrors((prev) => ({ ...prev, nodalName: "" }));
                }}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              />
              {errors.nodalName && (
                <p className="text-[11px] text-red-600 font-medium">{errors.nodalName}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Official Email (@jharkhand.gov.in / @nic.in)
              </label>
              <input
                type="email"
                placeholder="officer@jharkhand.gov.in"
                value={govtEmail}
                onChange={(e) => {
                  setGovtEmail(e.target.value);
                  if (errors.govtEmail) setErrors((prev) => ({ ...prev, govtEmail: "" }));
                }}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              />
              {errors.govtEmail && (
                <p className="text-[11px] text-red-600 font-medium">{errors.govtEmail}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Official Mobile Number
              </label>
              <div className="flex gap-2">
                <span className="px-3.5 py-3 rounded-xl bg-slate-100 border border-slate-300 text-sm font-semibold text-slate-600 flex items-center">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={govtPhone}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, "");
                    setGovtPhone(cleaned);
                    if (errors.govtPhone) setErrors((prev) => ({ ...prev, govtPhone: "" }));
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-mono"
                />
              </div>
              {errors.govtPhone && (
                <p className="text-[11px] text-red-600 font-medium">{errors.govtPhone}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Create Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                }}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              />
              {errors.password && (
                <p className="text-[11px] text-red-600 font-medium">{errors.password}</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                Continue to Authorization →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Jurisdiction & Authorization */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Block / Ward Code (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. WARD-04 / BLOCK-01"
                value={panchayatCode}
                onChange={(e) => setPanchayatCode(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all uppercase font-mono"
              />
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block">Scope Summary:</span>
              <p>Jurisdiction: <strong>{govtDistrict}</strong> • Department: <strong>{govtDepartment}</strong></p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
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
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs text-slate-700 leading-normal">
                  I declare that I am an authorized government official/nodal lead in the State of Jharkhand.
                </span>
              </label>
              {errors.authorizedDeclaration && (
                <p className="text-[11px] text-red-600 font-medium mt-1 pl-7">
                  {errors.authorizedDeclaration}
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={handleNext}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Provisioning Officer Account...</span>
                  </>
                ) : (
                  <span>Complete Government Registration →</span>
                )}
              </button>
            </div>
          </div>
        )}
      </OnboardingFormWrapper>
    </GuestOnlyGuard>
  );
}
