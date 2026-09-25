"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OnboardingFormWrapper } from "@/components/onboarding/OnboardingFormWrapper";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "@/components/dashboard/ToastStack";
import { GuestOnlyGuard } from "@/components/auth/GuestOnlyGuard";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

const JHARKHAND_DISTRICTS = [
  "Ranchi", "Dhanbad", "East Singhbhum (Jamshedpur)", "Bokaro", "Hazaribagh",
  "Deoghar", "Dumka", "Giridih", "Ramgarh", "Palamu", "West Singhbhum (Chaibasa)",
  "Saraikela Kharsawan", "Garhwa", "Chatra", "Godda", "Gumla", "Jamtara",
  "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Sahibganj", "Simdega"
];

interface DistrictStatus {
  district: string;
  isAssigned: boolean;
  nodalOfficerName: string | null;
  serviceCode: string | null;
  designation: string | null;
}

export default function GovernmentOnboardingPage() {
  const router = useRouter();
  const { onboardGovernment, isLoading } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [refId, setRefId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Districts status from backend API
  const [districtStatuses, setDistrictStatuses] = useState<DistrictStatus[]>([]);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(true);

  // Step 1: District Jurisdiction & Administrative Identity
  const [govtDistrict, setGovtDistrict] = useState("");
  const [serviceCode, setServiceCode] = useState("");
  const [govtDesignation, setGovtDesignation] = useState("District Nodal Officer");

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
    "District & Identity",
    "Nodal Credentials",
    "Scope & Authorization",
  ];

  // Fetch registered/available districts from backend API
  useEffect(() => {
    async function loadDistrictsStatus() {
      setIsLoadingDistricts(true);
      try {
        const res = await fetch(`${API_BASE_URL}/onboarding/government/districts-status`, {
          cache: "no-store"
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setDistrictStatuses(data);
            // Select first available district by default if not set
            const firstAvailable = data.find((d: DistrictStatus) => !d.isAssigned);
            if (firstAvailable) {
              setGovtDistrict((prev) => prev || firstAvailable.district);
            }
          }
        } else {
          // Fallback to local district list
          setDistrictStatuses(
            JHARKHAND_DISTRICTS.map((d) => ({
              district: d,
              isAssigned: false,
              nodalOfficerName: null,
              serviceCode: null,
              designation: null,
            }))
          );
        }
      } catch (e) {
        console.warn("Could not load districts status from backend:", e);
        setDistrictStatuses(
          JHARKHAND_DISTRICTS.map((d) => ({
            district: d,
            isAssigned: false,
            nodalOfficerName: null,
            serviceCode: null,
            designation: null,
          }))
        );
      } finally {
        setIsLoadingDistricts(false);
      }
    }
    loadDistrictsStatus();
  }, []);

  const validateStep = (stepIndex: number): boolean => {
    const errs: Record<string, string> = {};

    if (stepIndex === 0) {
      if (!govtDistrict.trim()) {
        errs.govtDistrict = "Please select your assigned district jurisdiction.";
      } else {
        const chosen = districtStatuses.find(
          (d) => d.district.toLowerCase() === govtDistrict.toLowerCase()
        );
        if (chosen?.isAssigned) {
          errs.govtDistrict = `A Nodal Officer (${chosen.nodalOfficerName || "Active Officer"}) is already registered for ${govtDistrict} District. Please select an available district.`;
        }
      }
      if (!serviceCode.trim()) {
        errs.serviceCode = "Official Service ID / Employee Code is required.";
      }
      if (!govtDesignation.trim()) {
        errs.govtDesignation = "Official designation is required (e.g. District Nodal Officer / BDO).";
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
      const isStatewide = govtDistrict.toLowerCase().includes("statewide");
      const res = await onboardGovernment({
        name: nodalName.trim(),
        email: govtEmail.trim().toLowerCase(),
        phone: govtPhone.replace(/\D/g, ""),
        password: password.trim(),
        district: isStatewide ? "Statewide" : govtDistrict,
        isStateSuperAdmin: isStatewide,
        designation: govtDesignation.trim(),
        govtDepartment: isStatewide
          ? "State Directorate of Higher & Technical Education"
          : `District Administration (${govtDistrict})`,
        serviceCode: serviceCode.trim().toUpperCase(),
        panchayatCode: panchayatCode.trim() || undefined,
      });

      if (res.success) {
        const generated =
          (res as any).referenceId ||
          (res as any).user?.referenceId ||
          (isStatewide ? `GOV-JH-STATE-${Math.floor(100 + Math.random() * 900)}` : `GOV-JH-2026-${Math.floor(100 + Math.random() * 900)}`);
        setRefId(generated);
        setIsComplete(true);
        toast.success(
          isStatewide
            ? "State Directorate Superadmin provisioned successfully!"
            : `Government Nodal Officer provisioned successfully for ${govtDistrict} District!`
        );
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

  // Count available districts
  const availableCount = districtStatuses.filter((d) => !d.isAssigned).length;

  return (
    <GuestOnlyGuard>
      <OnboardingFormWrapper
        roleTitle="District Nodal Officer Registration"
        roleTagline="1 Nodal Officer per District • Statewide Challenge Triage & Academic Routing"
        steps={steps}
        currentStepIndex={currentStep}
        onPrevStep={handlePrev}
        onNextStep={handleNext}
        isComplete={isComplete}
        referenceId={refId}
        completedSummary={[
          { label: "Assigned District", value: `${govtDistrict} District` || "-" },
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

        {/* Step 0: District Jurisdiction & Identity */}
        {currentStep === 0 && (
          <div className="space-y-4">
            {/* Informational District Governance Callout */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-950 leading-relaxed flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="space-y-0.5">
                <span className="font-bold block">1 Nodal Officer Per District Governance Model</span>
                <span className="text-slate-600 block text-[11px]">
                  Each of Jharkhand&apos;s 24 districts is governed by exactly one designated Nodal Officer responsible for grassroots grievance verification and academic routing.
                </span>
                <span className="inline-block font-mono text-[10px] font-bold text-blue-700 mt-1">
                  {availableCount} of 24 Districts Currently Open
                </span>
              </div>
            </div>

            {/* Assigned District Jurisdiction Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Select Your Assigned District Jurisdiction <span className="text-red-500">*</span>
              </label>
              <select
                value={govtDistrict}
                onChange={(e) => {
                  const val = e.target.value;
                  setGovtDistrict(val);
                  if (val.toLowerCase().includes("statewide")) {
                    setGovtDesignation("State Nodal Director / Superadmin");
                  } else if (govtDesignation === "State Nodal Director / Superadmin" || !govtDesignation) {
                    setGovtDesignation("District Nodal Officer");
                  }
                  if (errors.govtDistrict) setErrors((prev) => ({ ...prev, govtDistrict: "" }));
                }}
                disabled={isLoadingDistricts}
                className="w-full h-11 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-medium"
              >
                <option value="">-- Choose Your Jurisdiction --</option>
                {districtStatuses.map((d) => {
                  const isState = d.district.toLowerCase().includes("statewide");
                  return (
                    <option
                      key={d.district}
                      value={d.district}
                      disabled={d.isAssigned}
                      className={d.isAssigned ? "text-slate-400 bg-slate-100 font-normal" : isState ? "text-indigo-900 font-black bg-indigo-50/50" : "text-slate-900 font-bold"}
                    >
                      {isState ? `[State Directorate] ${d.district} (State Superadmin)` : `${d.district} District`} {d.isAssigned ? `— [Claimed by ${d.nodalOfficerName || "Active Officer"}]` : "— Available"}
                    </option>
                  );
                })}
              </select>
              {errors.govtDistrict && (
                <p className="text-[11px] text-red-600 font-medium">{errors.govtDistrict}</p>
              )}
            </div>

            {/* Service ID and Designation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide h-8 flex items-end">
                  <span>Officer Service ID / Code <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. JH-IAS-2022-041"
                  value={serviceCode}
                  onChange={(e) => {
                    setServiceCode(e.target.value);
                    if (errors.serviceCode) setErrors((prev) => ({ ...prev, serviceCode: "" }));
                  }}
                  className="w-full h-11 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all uppercase font-mono"
                />
                {errors.serviceCode && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.serviceCode}</p>
                )}
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide h-8 flex items-end">
                  <span>Official Designation <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. District Nodal Officer / BDO"
                  value={govtDesignation}
                  onChange={(e) => {
                    setGovtDesignation(e.target.value);
                    if (errors.govtDesignation) setErrors((prev) => ({ ...prev, govtDesignation: "" }));
                  }}
                  className="w-full h-11 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
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
                Nodal Officer Full Name <span className="text-red-500">*</span>
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
                Official Email (@jharkhand.gov.in / @nic.in) <span className="text-red-500">*</span>
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
                Official Mobile Number <span className="text-red-500">*</span>
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
                  Create Password <span className="text-red-500">*</span>
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
                Block / Sub-Division Code (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. BLOCK-01 / SUBDIV-HQ"
                value={panchayatCode}
                onChange={(e) => setPanchayatCode(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all uppercase font-mono"
              />
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block">District Jurisdiction Summary:</span>
              <p>Designated District: <strong className="text-slate-900">{govtDistrict} District</strong></p>
              <p>Officer: <strong className="text-slate-900">{nodalName}</strong> ({govtDesignation})</p>
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
                  I declare that I am the authorized district government official / designated nodal lead for <strong>{govtDistrict || "the selected district"}</strong> in the State of Jharkhand.
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
                    <span>Provisioning District Nodal Officer...</span>
                  </>
                ) : (
                  <span>Complete Nodal Registration →</span>
                )}
              </button>
            </div>
          </div>
        )}
      </OnboardingFormWrapper>
    </GuestOnlyGuard>
  );
}

