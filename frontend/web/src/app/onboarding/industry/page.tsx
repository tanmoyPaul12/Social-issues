"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingFormWrapper } from "@/components/onboarding/OnboardingFormWrapper";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "@/components/dashboard/ToastStack";
import { GuestOnlyGuard } from "@/components/auth/GuestOnlyGuard";
import { PartnerCategory, PARTNER_CATEGORY_OPTIONS } from "@/modules/industry/types/companySettings";

const JHARKHAND_DISTRICTS = [
  "East Singhbhum (Jamshedpur)", "Ranchi", "Dhanbad", "Bokaro", "Hazaribagh",
  "Deoghar", "Dumka", "Giridih", "Ramgarh", "Saraikela Kharsawan",
  "West Singhbhum (Chaibasa)", "Palamu", "Chatra", "Garhwa", "Godda",
  "Gumla", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur",
  "Sahebganj", "Simdega"
];

export default function IndustryOnboardingPage() {
  const router = useRouter();
  const { onboardIndustry, isLoading } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [refId, setRefId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Form Fields
  const [partnerCategory, setPartnerCategory] = useState<PartnerCategory>("LARGE_ENTERPRISE");
  const [companyName, setCompanyName] = useState("");
  const [companyType, setCompanyType] = useState("Public Limited Enterprise");
  const [dpiitRecognitionNumber, setDpiitRecognitionNumber] = useState("");
  const [udyamRegistrationNumber, setUdyamRegistrationNumber] = useState("");
  const [taxExemptionNumber, setTaxExemptionNumber] = useState("");
  const [institutionRegNumber, setInstitutionRegNumber] = useState("");
  const [gstin, setGstin] = useState("");
  const [cinNumber, setCinNumber] = useState("");
  const [csrNumber, setCsrNumber] = useState("");
  const [district, setDistrict] = useState("East Singhbhum (Jamshedpur)");
  const [primaryTrack, setPrimaryTrack] = useState<"FUNDING" | "MENTORSHIP" | "PROTOTYPING" | "TECH_TRANSFER">("FUNDING");
  const [spocName, setSpocName] = useState("");
  const [designation, setDesignation] = useState("Head CSR & Sustainability");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    "Entity & Category",
    "Collaboration Track",
    "Authorized Lead",
  ];

  const validateStep = (stepIndex: number): boolean => {
    const errs: Record<string, string> = {};

    if (stepIndex === 0) {
      if (!companyName.trim()) {
        errs.companyName = "Organization legal name is required.";
      }

      if (partnerCategory === "STARTUP") {
        if (!dpiitRecognitionNumber.trim()) {
          errs.dpiitRecognitionNumber = "DPIIT Recognition Number is required.";
        }
      } else if (partnerCategory === "MSME") {
        if (!udyamRegistrationNumber.trim()) {
          errs.udyamRegistrationNumber = "Udyam Registration Number is required.";
        }
      } else if (partnerCategory === "CSR_ORGANIZATION") {
        if (!taxExemptionNumber.trim()) {
          errs.taxExemptionNumber = "12A / 80G Tax Exemption Number is required.";
        }
      } else if (partnerCategory === "RESEARCH_INSTITUTION" || partnerCategory === "INNOVATION_HUB") {
        if (!institutionRegNumber.trim()) {
          errs.institutionRegNumber = "Registration ID is required.";
        }
      } else {
        const gstinTrimmed = gstin.trim().toUpperCase();
        if (!gstinTrimmed) {
          errs.gstin = "GSTIN Number is required.";
        }
      }
    } else if (stepIndex === 1) {
      if (!district) {
        errs.district = "Please select the operational district.";
      }
    } else if (stepIndex === 2) {
      if (!spocName.trim()) {
        errs.spocName = "Authorized lead full name is required.";
      }
      if (!email.trim() || !email.includes("@")) {
        errs.email = "A valid contact email is required.";
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
      const effectiveGstin = gstin.trim().toUpperCase() ||
        dpiitRecognitionNumber.trim().toUpperCase() ||
        udyamRegistrationNumber.trim().toUpperCase() ||
        taxExemptionNumber.trim().toUpperCase() ||
        institutionRegNumber.trim().toUpperCase() ||
        "NOT_APPLICABLE";

      const res = await onboardIndustry({
        name: spocName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: password.trim(),
        companyName: companyName.trim(),
        companyType,
        partnerCategory,
        dpiitRecognitionNumber: dpiitRecognitionNumber.trim().toUpperCase() || undefined,
        udyamRegistrationNumber: udyamRegistrationNumber.trim().toUpperCase() || undefined,
        taxExemptionNumber: taxExemptionNumber.trim().toUpperCase() || undefined,
        institutionRegNumber: institutionRegNumber.trim().toUpperCase() || undefined,
        gstin: effectiveGstin,
        cinNumber: cinNumber.trim().toUpperCase() || undefined,
        csrNumber: csrNumber.trim().toUpperCase() || undefined,
        designation: designation.trim() || "Authorized Lead",
        district,
      });

      if (res.success) {
        const generated = (res as any).referenceId || (res as any).user?.referenceId || `JH-${partnerCategory.substring(0, 3)}-2026-${Math.floor(100 + Math.random() * 900)}`;
        setRefId(generated);
        setIsComplete(true);
        toast.success("Industry Partner registered successfully!");
      } else {
        const err = (res as any).message || "Onboarding failed. Please review your details.";
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

  const activeCategoryLabel = PARTNER_CATEGORY_OPTIONS.find((o) => o.id === partnerCategory)?.label || "Corporate Enterprise";

  return (
    <GuestOnlyGuard>
      <OnboardingFormWrapper
        roleTitle="Industry &amp; CSR Partner Registration"
        roleTagline="Partner with universities across Jharkhand for Mentoring, CSR Grants, Pilot Testbeds, and R&D"
        steps={steps}
        currentStepIndex={currentStep}
        onPrevStep={handlePrev}
        onNextStep={handleNext}
        isComplete={isComplete}
        referenceId={refId}
        completedSummary={[
          { label: "Entity Category", value: activeCategoryLabel },
          { label: "Organization", value: companyName || "-" },
          { label: "Operational District", value: district || "-" },
          { label: "Authorized Lead", value: spocName || "-" },
          { label: "Contact Email", value: email.toLowerCase() || "-" },
        ]}
        dashboardRole="industry"
      >
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            <p className="font-semibold">{errorMessage}</p>
          </div>
        )}

        {/* Step 0: Entity Category & Registration */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Partner Category
              </label>
              <select
                value={partnerCategory}
                onChange={(e) => {
                  setPartnerCategory(e.target.value as any);
                  setErrors({});
                }}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              >
                {PARTNER_CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label} — {opt.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Legal Entity / Company Name
              </label>
              <input
                type="text"
                placeholder="e.g. Tata Steel / Coal India / Tech Startup"
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  if (errors.companyName) setErrors((prev) => ({ ...prev, companyName: "" }));
                }}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              />
              {errors.companyName && (
                <p className="text-[11px] text-red-600 font-medium">{errors.companyName}</p>
              )}
            </div>

            {/* Dynamic Registration Fields */}
            {partnerCategory === "STARTUP" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  DPIIT Startup Recognition Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. DIPP12345"
                  value={dpiitRecognitionNumber}
                  onChange={(e) => {
                    setDpiitRecognitionNumber(e.target.value);
                    if (errors.dpiitRecognitionNumber) setErrors((prev) => ({ ...prev, dpiitRecognitionNumber: "" }));
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all uppercase font-mono"
                />
                {errors.dpiitRecognitionNumber && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.dpiitRecognitionNumber}</p>
                )}
              </div>
            )}

            {partnerCategory === "MSME" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Udyam Registration Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. UDYAM-JH-01-0012345"
                  value={udyamRegistrationNumber}
                  onChange={(e) => {
                    setUdyamRegistrationNumber(e.target.value);
                    if (errors.udyamRegistrationNumber) setErrors((prev) => ({ ...prev, udyamRegistrationNumber: "" }));
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all uppercase font-mono"
                />
                {errors.udyamRegistrationNumber && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.udyamRegistrationNumber}</p>
                )}
              </div>
            )}

            {partnerCategory === "CSR_ORGANIZATION" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  12A / 80G Tax Exemption Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. AABCT1234F20214"
                  value={taxExemptionNumber}
                  onChange={(e) => {
                    setTaxExemptionNumber(e.target.value);
                    if (errors.taxExemptionNumber) setErrors((prev) => ({ ...prev, taxExemptionNumber: "" }));
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all uppercase font-mono"
                />
                {errors.taxExemptionNumber && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.taxExemptionNumber}</p>
                )}
              </div>
            )}

            {partnerCategory === "LARGE_ENTERPRISE" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  GSTIN Number (15 Digits)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 20AAACT2727Q1ZG"
                  value={gstin}
                  onChange={(e) => {
                    setGstin(e.target.value);
                    if (errors.gstin) setErrors((prev) => ({ ...prev, gstin: "" }));
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all uppercase font-mono"
                />
                {errors.gstin && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.gstin}</p>
                )}
              </div>
            )}

            {(partnerCategory === "RESEARCH_INSTITUTION" || partnerCategory === "INNOVATION_HUB") && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Institution / Incubator Reg Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. CSIR-NML-2026 / DST-TBI-JH-04"
                  value={institutionRegNumber}
                  onChange={(e) => {
                    setInstitutionRegNumber(e.target.value);
                    if (errors.institutionRegNumber) setErrors((prev) => ({ ...prev, institutionRegNumber: "" }));
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all uppercase font-mono"
                />
                {errors.institutionRegNumber && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.institutionRegNumber}</p>
                )}
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                Continue to Collaboration Track →
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Collaboration Track & Regional Hub */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Primary Collaboration Track
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "FUNDING", label: "CSR Grants & Funding", desc: "Co-fund projects" },
                  { id: "MENTORSHIP", label: "Mentorship", desc: "Guide student teams" },
                  { id: "PROTOTYPING", label: "Field Testbeds", desc: "Field prototyping" },
                  { id: "TECH_TRANSFER", label: "IP & Tech Transfer", desc: "Commercialization" },
                ].map((track) => {
                  const isSelected = primaryTrack === track.id;
                  return (
                    <button
                      type="button"
                      key={track.id}
                      onClick={() => setPrimaryTrack(track.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-blue-500 bg-blue-50/70 text-blue-900 font-bold"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="text-xs font-semibold">{track.label}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{track.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Primary District in Jharkhand
              </label>
              <select
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  if (errors.district) setErrors((prev) => ({ ...prev, district: "" }));
                }}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              >
                {JHARKHAND_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>

            {(partnerCategory === "LARGE_ENTERPRISE" || partnerCategory === "CSR_ORGANIZATION") && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  MCA Form CSR-1 Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. CSR00004128"
                  value={csrNumber}
                  onChange={(e) => setCsrNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all uppercase font-mono"
                />
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                Continue to Authorized Lead →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Authorized Lead & Credentials */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Authorized Lead Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={spocName}
                  onChange={(e) => {
                    setSpocName(e.target.value);
                    if (errors.spocName) setErrors((prev) => ({ ...prev, spocName: "" }));
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                />
                {errors.spocName && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.spocName}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Designation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Head CSR / Director"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Official Contact Email
              </label>
              <input
                type="email"
                placeholder="lead@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                }}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              />
              {errors.email && (
                <p className="text-[11px] text-red-600 font-medium">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Direct Mobile Number
              </label>
              <div className="flex gap-2">
                <span className="px-3.5 py-3 rounded-xl bg-slate-100 border border-slate-300 text-sm font-semibold text-slate-600 flex items-center">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, "");
                    setPhone(cleaned);
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-mono"
                />
              </div>
              {errors.phone && (
                <p className="text-[11px] text-red-600 font-medium">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Create Password
              </label>
              <input
                type="password"
                placeholder="Minimum 6 characters"
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
                disabled={isLoading}
                onClick={handleNext}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Registering Partner...</span>
                  </>
                ) : (
                  <span>Complete Industry Registration →</span>
                )}
              </button>
            </div>
          </div>
        )}
      </OnboardingFormWrapper>
    </GuestOnlyGuard>
  );
}
