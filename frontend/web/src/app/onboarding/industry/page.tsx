"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingFormWrapper } from "@/components/onboarding/OnboardingFormWrapper";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "@/components/dashboard/ToastStack";
import { GuestOnlyGuard } from "@/components/auth/GuestOnlyGuard";
import { PartnerCategory, PARTNER_CATEGORY_OPTIONS } from "@/modules/industry/types/companySettings";

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
    "Entity Category & Registration",
    "Collaboration Track & Regional Hub",
    "Authorized Lead & Credentials",
  ];

  const validateStep = (stepIndex: number): boolean => {
    const errs: Record<string, string> = {};

    if (stepIndex === 0) {
      if (!companyName.trim()) {
        errs.companyName = "Organization / Entity legal name is required.";
      }

      if (partnerCategory === "STARTUP") {
        if (!dpiitRecognitionNumber.trim()) {
          errs.dpiitRecognitionNumber = "DPIIT Recognition Number is required (e.g. DIPP12345).";
        }
      } else if (partnerCategory === "MSME") {
        if (!udyamRegistrationNumber.trim()) {
          errs.udyamRegistrationNumber = "Udyam Registration Number is required (e.g. UDYAM-JH-01-0012345).";
        }
      } else if (partnerCategory === "CSR_ORGANIZATION") {
        if (!taxExemptionNumber.trim()) {
          errs.taxExemptionNumber = "12A / 80G Tax Exemption Number is required.";
        }
      } else if (partnerCategory === "RESEARCH_INSTITUTION") {
        if (!institutionRegNumber.trim()) {
          errs.institutionRegNumber = "Institution / Laboratory Registration Number is required.";
        }
      } else if (partnerCategory === "INNOVATION_HUB") {
        if (!institutionRegNumber.trim()) {
          errs.institutionRegNumber = "Incubation Centre / TBI / CoE ID is required.";
        }
      } else {
        // Large Enterprise
        const gstinTrimmed = gstin.trim().toUpperCase();
        if (!gstinTrimmed) {
          errs.gstin = "GSTIN Number is required for Large Enterprises.";
        } else if (gstinTrimmed.length < 10) {
          errs.gstin = "Please enter a valid GSTIN format (e.g. 20AAACT2727Q1ZG).";
        }
      }
    } else if (stepIndex === 1) {
      if ((partnerCategory === "LARGE_ENTERPRISE" || partnerCategory === "CSR_ORGANIZATION") && !csrNumber.trim()) {
        errs.csrNumber = "MCA Form CSR-1 registration number is required for CSR funding entities.";
      }
      if (!district) {
        errs.district = "Please select the primary operational hub / district.";
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
      // Final submission
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
        designation: designation.trim() || "Authorized Nodal Lead",
        district,
      });

      if (res.success) {
        const generated = (res as any).referenceId || (res as any).user?.referenceId || `JH-${partnerCategory.substring(0, 3)}-2026-${Math.floor(100 + Math.random() * 900)}`;
        setRefId(generated);
        setIsComplete(true);
        toast.success("Ecosystem Partner registered successfully!");
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

  const activeCategoryLabel = PARTNER_CATEGORY_OPTIONS.find((o) => o.id === partnerCategory)?.label || "Corporate Enterprise";

  return (
    <GuestOnlyGuard>
      <OnboardingFormWrapper
        roleTitle="Industry, Startup & Ecosystem Partner Onboarding"
        roleTagline="Collaborate with universities across Jharkhand for Mentoring, Co-Development, CSR Funding, Prototyping, Field Testbeds, and Technology Transfer."
        roleBadge={activeCategoryLabel}
        trustBadge="Ecosystem KYC"
        timeEstimate="~2 Minutes"
        steps={steps}
        currentStepIndex={currentStep}
        onPrevStep={handlePrev}
        onNextStep={handleNext}
        isComplete={isComplete}
        referenceId={refId}
        completedSummary={[
          { label: "Entity Category", value: activeCategoryLabel },
          { label: "Organization", value: companyName || "-" },
          {
            label: "Registration ID",
            value:
              partnerCategory === "STARTUP"
                ? dpiitRecognitionNumber.toUpperCase() || "-"
                : partnerCategory === "MSME"
                ? udyamRegistrationNumber.toUpperCase() || "-"
                : partnerCategory === "CSR_ORGANIZATION"
                ? taxExemptionNumber.toUpperCase() || "-"
                : partnerCategory === "RESEARCH_INSTITUTION" || partnerCategory === "INNOVATION_HUB"
                ? institutionRegNumber.toUpperCase() || "-"
                : gstin.toUpperCase() || "-",
          },
          { label: "Operational Hub", value: district || "-" },
          { label: "Authorized Lead", value: spocName || "-" },
          { label: "Contact Email", value: email.toLowerCase() || "-" },
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

        {/* ── STEP 1: ENTITY CATEGORY & STATUTORY REGISTRATION ── */}
        {currentStep === 0 && (
          <div className="space-y-5 max-w-2xl mx-auto animate-in fade-in">
            {/* Category Selector Cards */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                Select Your Partner Category / Organization Type <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PARTNER_CATEGORY_OPTIONS.map((opt) => {
                  const isSelected = partnerCategory === opt.id;
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => {
                        setPartnerCategory(opt.id);
                        setErrors({});
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/70 shadow-2xs ring-1 ring-indigo-500/30"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-bold ${isSelected ? "text-indigo-950" : "text-slate-800"}`}>
                          {opt.label}
                        </span>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {opt.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legal Entity Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Legal Entity / Organization Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder={
                  partnerCategory === "STARTUP"
                    ? "e.g. Agritech Innovations Pvt Ltd"
                    : partnerCategory === "MSME"
                    ? "e.g. Chotanagpur Engineering & Tooling Works"
                    : partnerCategory === "CSR_ORGANIZATION"
                    ? "e.g. Tata Steel Rural Development Society (TSRDS)"
                    : partnerCategory === "RESEARCH_INSTITUTION"
                    ? "e.g. CSIR-NML / Central Institute of Mining & Fuel Research"
                    : partnerCategory === "INNOVATION_HUB"
                    ? "e.g. BIT Mesra Technology Business Incubator"
                    : "e.g. Tata Steel Limited / Coal India Limited"
                }
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  if (errors.companyName) setErrors((prev) => ({ ...prev, companyName: "" }));
                }}
                className={`w-full px-4 py-3 rounded-2xl border ${
                  errors.companyName ? "border-rose-400 bg-rose-50/40" : "border-slate-300"
                } text-slate-900 text-xs font-semibold outline-none focus:border-indigo-500 transition-all`}
              />
              {errors.companyName && (
                <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                  {errors.companyName}
                </span>
              )}
            </div>

            {/* Dynamic Category Specific Statutory Fields */}
            {partnerCategory === "STARTUP" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-950 mb-1.5 flex items-center justify-between">
                    <span>DPIIT Recognition Number <span className="text-rose-500">*</span></span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Startup India</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DIPP84291"
                    value={dpiitRecognitionNumber}
                    onChange={(e) => {
                      setDpiitRecognitionNumber(e.target.value);
                      if (errors.dpiitRecognitionNumber) setErrors((prev) => ({ ...prev, dpiitRecognitionNumber: "" }));
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.dpiitRecognitionNumber ? "border-rose-400 bg-rose-50" : "border-emerald-300 bg-white"
                    } text-slate-900 font-mono text-xs font-bold outline-none focus:border-emerald-500 uppercase transition-all`}
                  />
                  {errors.dpiitRecognitionNumber && (
                    <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                      {errors.dpiitRecognitionNumber}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-950 mb-1.5">
                    GSTIN / PAN <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 20AAACT2727Q1ZG"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-emerald-300 bg-white text-slate-900 font-mono text-xs outline-none focus:border-emerald-500 uppercase transition-all"
                  />
                </div>
              </div>
            )}

            {partnerCategory === "MSME" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-sky-50/60 border border-sky-200/80 rounded-2xl p-4">
                <div>
                  <label className="block text-xs font-bold text-sky-950 mb-1.5 flex items-center justify-between">
                    <span>Udyam Registration Number <span className="text-rose-500">*</span></span>
                    <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded">MSME Portal</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UDYAM-JH-01-0012345"
                    value={udyamRegistrationNumber}
                    onChange={(e) => {
                      setUdyamRegistrationNumber(e.target.value);
                      if (errors.udyamRegistrationNumber) setErrors((prev) => ({ ...prev, udyamRegistrationNumber: "" }));
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.udyamRegistrationNumber ? "border-rose-400 bg-rose-50" : "border-sky-300 bg-white"
                    } text-slate-900 font-mono text-xs font-bold outline-none focus:border-sky-500 uppercase transition-all`}
                  />
                  {errors.udyamRegistrationNumber && (
                    <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                      {errors.udyamRegistrationNumber}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-sky-950 mb-1.5">
                    GSTIN / Trade Identifier <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 20AAACT2727Q1ZG"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-sky-300 bg-white text-slate-900 font-mono text-xs outline-none focus:border-sky-500 uppercase transition-all"
                  />
                </div>
              </div>
            )}

            {partnerCategory === "CSR_ORGANIZATION" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4">
                <div>
                  <label className="block text-xs font-bold text-amber-950 mb-1.5 flex items-center justify-between">
                    <span>12A / 80G Tax Exemption Number <span className="text-rose-500">*</span></span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">IT Act</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AABCT1234F20214"
                    value={taxExemptionNumber}
                    onChange={(e) => {
                      setTaxExemptionNumber(e.target.value);
                      if (errors.taxExemptionNumber) setErrors((prev) => ({ ...prev, taxExemptionNumber: "" }));
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.taxExemptionNumber ? "border-rose-400 bg-rose-50" : "border-amber-300 bg-white"
                    } text-slate-900 font-mono text-xs font-bold outline-none focus:border-amber-500 uppercase transition-all`}
                  />
                  {errors.taxExemptionNumber && (
                    <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                      {errors.taxExemptionNumber}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-950 mb-1.5">
                    PAN / DARPAN NGO ID <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. JH/2021/028194"
                    value={cinNumber}
                    onChange={(e) => setCinNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-amber-300 bg-white text-slate-900 font-mono text-xs outline-none focus:border-amber-500 uppercase transition-all"
                  />
                </div>
              </div>
            )}

            {(partnerCategory === "RESEARCH_INSTITUTION" || partnerCategory === "INNOVATION_HUB") && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-purple-50/60 border border-purple-200/80 rounded-2xl p-4">
                <div>
                  <label className="block text-xs font-bold text-purple-950 mb-1.5 flex items-center justify-between">
                    <span>
                      {partnerCategory === "RESEARCH_INSTITUTION" ? "Institution / Lab Reg Number" : "Incubator / CoE Reg ID"} <span className="text-rose-500">*</span>
                    </span>
                    <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded">R&amp;D Hub</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CSIR-NML-2026 / DST-TBI-JH-04"
                    value={institutionRegNumber}
                    onChange={(e) => {
                      setInstitutionRegNumber(e.target.value);
                      if (errors.institutionRegNumber) setErrors((prev) => ({ ...prev, institutionRegNumber: "" }));
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.institutionRegNumber ? "border-rose-400 bg-rose-50" : "border-purple-300 bg-white"
                    } text-slate-900 font-mono text-xs font-bold outline-none focus:border-purple-500 uppercase transition-all`}
                  />
                  {errors.institutionRegNumber && (
                    <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                      {errors.institutionRegNumber}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-950 mb-1.5">
                    Affiliated Council / Ministry <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CSIR / DST / NITI Aayog"
                    value={cinNumber}
                    onChange={(e) => setCinNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-purple-300 bg-white text-slate-900 text-xs outline-none focus:border-purple-500 transition-all"
                  />
                </div>
              </div>
            )}

            {partnerCategory === "LARGE_ENTERPRISE" && (
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
                    } text-slate-900 font-mono text-xs outline-none focus:border-indigo-500 uppercase transition-all`}
                  />
                  {errors.gstin && (
                    <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                      {errors.gstin}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    CIN Number (21 Digits) <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. L27100MH1907PLC000260"
                    value={cinNumber}
                    onChange={(e) => setCinNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-mono text-xs outline-none focus:border-indigo-500 uppercase transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="w-full mt-2 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Continue to Collaboration Track →</span>
            </button>
          </div>
        )}

        {/* ── STEP 2: COLLABORATION TRACK & OPERATIONAL DISTRICT ── */}
        {currentStep === 1 && (
          <div className="space-y-5 max-w-2xl mx-auto animate-in fade-in">
            {/* Primary Collaboration Focus */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                Primary Collaboration Track on Platform
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "FUNDING", label: "CSR & Grants", desc: "Co-fund university projects" },
                  { id: "MENTORSHIP", label: "Mentoring", desc: "Guide student & faculty teams" },
                  { id: "PROTOTYPING", label: "Testbeds", desc: "Field prototyping & trials" },
                  { id: "TECH_TRANSFER", label: "IP Transfer", desc: "Patents & commercialization" },
                ].map((track) => {
                  const isSelected = primaryTrack === track.id;
                  return (
                    <button
                      type="button"
                      key={track.id}
                      onClick={() => setPrimaryTrack(track.id as any)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50 text-indigo-950 font-bold shadow-2xs"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-xs block">{track.label}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{track.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CSR-1 Field for CSR & Large Enterprises */}
            {(partnerCategory === "LARGE_ENTERPRISE" || partnerCategory === "CSR_ORGANIZATION") && (
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
                  } text-slate-900 font-mono text-xs outline-none focus:border-indigo-500 uppercase transition-all`}
                />
                {errors.csrNumber ? (
                  <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                    {errors.csrNumber}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Mandatory registration issued by Ministry of Corporate Affairs (MCA) for statutory CSR disbursement.
                  </span>
                )}
              </div>
            )}

            {/* District Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Primary Operational Hub / Registered District in Jharkhand <span className="text-rose-500">*</span>
              </label>
              <select
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  if (errors.district) setErrors((prev) => ({ ...prev, district: "" }));
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium outline-none focus:border-indigo-500 cursor-pointer"
              >
                {JHARKHAND_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>

            {/* Notice banner */}
            <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                ℹ
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-indigo-950">Dynamic Track Unlocking</h4>
                <p className="text-[11px] text-indigo-900/80 leading-relaxed">
                  Your organization category ({activeCategoryLabel}) enables immediate access to all 6 core innovation tracks: <strong>Mentoring</strong>, <strong>Co-Development</strong>, <strong>Funding</strong>, <strong>Field Testbeds</strong>, <strong>Active Pilots</strong>, and <strong>IP Tech Transfer</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="w-full mt-2 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Continue to Authorized Lead Details →</span>
            </button>
          </div>
        )}

        {/* ── STEP 3: AUTHORIZED NODAL LEAD & CREDENTIALS ── */}
        {currentStep === 2 && (
          <div className="space-y-5 max-w-2xl mx-auto animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Authorized Lead / SPOC Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma / Dr. Arvind Roy"
                  value={spocName}
                  onChange={(e) => {
                    setSpocName(e.target.value);
                    if (errors.spocName) setErrors((prev) => ({ ...prev, spocName: "" }));
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.spocName ? "border-rose-400 bg-rose-50/40" : "border-slate-300"
                  } text-slate-900 text-xs font-medium outline-none focus:border-indigo-500 transition-all`}
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
                  placeholder="e.g. Founder &amp; CEO / Head CSR / Principal Scientist"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-medium outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Official Contact Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. spoc@organization.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.email ? "border-rose-400 bg-rose-50/40" : "border-slate-300"
                  } text-slate-900 font-mono text-xs outline-none focus:border-indigo-500 transition-all`}
                />
                {errors.email && (
                  <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                    {errors.email}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Direct Mobile Number <span className="text-rose-500">*</span>
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
                  } text-slate-900 font-mono text-xs outline-none focus:border-indigo-500 transition-all`}
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
                Create Secure Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Minimum 6 characters (e.g. PortalPass@2026)"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                }}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  errors.password ? "border-rose-400 bg-rose-50/40" : "border-slate-300"
                } text-slate-900 text-xs outline-none focus:border-indigo-500 transition-all`}
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
                <strong>Jharkhand Innovation Partnership Accord:</strong> Onboarding allows your organization to participate in joint R&amp;D with State universities, co-file patents under fair equity/royalty splits, and deploy field testbeds across Jharkhand districts.
              </p>
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={isLoading}
              className={`w-full mt-2 py-3.5 rounded-full ${
                isLoading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
              } text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Registering Partner...</span>
                </>
              ) : (
                <span>Complete Partner Registration →</span>
              )}
            </button>
          </div>
        )}
      </OnboardingFormWrapper>
    </GuestOnlyGuard>
  );
}
