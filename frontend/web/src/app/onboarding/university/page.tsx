"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OnboardingFormWrapper } from "@/components/onboarding/OnboardingFormWrapper";
import { useAuthStore } from "@/lib/store/useAuthStore";

const KNOWN_UNIVERSITIES = [
  "Birla Institute of Technology (BIT) Mesra, Ranchi",
  "Indian Institute of Technology (IIT - ISM) Dhanbad",
  "National Institute of Technology (NIT) Jamshedpur",
  "Birsa Agricultural University (BAU) Kanke, Ranchi",
  "Indian Institute of Management (IIM) Ranchi",
  "All India Institute of Medical Sciences (AIIMS) Deoghar",
  "Rajendra Institute of Medical Sciences (RIMS) Ranchi",
  "Central University of Jharkhand (CUJ) Brambe",
  "Ranchi University (RU) Ranchi",
  "Dr. Shyama Prasad Mukherjee University (DSPMU) Ranchi",
  "Kolhan University, Chaibasa",
  "Sido Kanhu Murmu University (SKMU) Dumka",
  "Vinoba Bhave University (VBU) Hazaribagh",
  "Binod Bihari Mahto Koyalanchal University (BBMKU) Dhanbad",
  "Government Engineering College, Ramgarh",
  "Government Engineering College, Chaibasa",
  "Other Affiliated College / Institution (Specify Name)",
];

const JHARKHAND_DISTRICTS = [
  "Ranchi",
  "Dhanbad",
  "East Singhbhum (Jamshedpur)",
  "Bokaro",
  "Hazaribagh",
  "Deoghar",
  "Dumka",
  "Ramgarh",
  "Giridih",
  "Palamu",
  "West Singhbhum (Chaibasa)",
  "Saraikela Kharsawan",
  "Garhwa",
  "Chatra",
  "Koderma",
  "Jamtara",
  "Godda",
  "Sahibganj",
  "Pakur",
  "Lohardaga",
  "Gumla",
  "Simdega",
  "Latehar",
  "Khunti",
];

const DISCIPLINES_LIST = [
  { id: "edtech", title: "Education & Vernacular Pedagogy", desc: "Digital classrooms, tribal dialect tools, STEM labs" },
  { id: "agri", title: "Agritech & Soil Diagnostics", desc: "Crop disease AI, precision irrigation, organic soil test" },
  { id: "health", title: "MedTech & Rural Health Devices", desc: "Point-of-care diagnostics, maternal health sensors" },
  { id: "water", title: "Water Resources & IoT Sensors", desc: "Groundwater depletion sensors, arsenic/fluoride filtration" },
  { id: "ecology", title: "Mining Ecology & Bioremediation", desc: "Coal overburden revival, dust mitigation, afforestation" },
  { id: "clean_energy", title: "Clean Energy & Microgrids", desc: "Solar microgrids, battery storage, rural off-grid power" },
  { id: "urban", title: "Smart City & Solid Waste Tech", desc: "Municipal GIS, decentralized composting, drainage telemetry" },
  { id: "assistive", title: "Assistive Tech & Rural Mobility", desc: "Divyangjan assistive devices, rural transport electrification" },
  { id: "ai_iot", title: "AI/ML & Cyber-Physical Systems", desc: "Computer vision, predictive logistics, edge sensor networks" },
  { id: "livelihoods", title: "Forest Produce & Agri-Logistics", desc: "Minor forest produce processing, cold storage, supply chain" },
];

export default function UniversityOnboardingPage() {
  const router = useRouter();
  const { onboardUniversity, isLoading } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [refId, setRefId] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);

  // Form Fields - Step 1: Institution Identity
  const [selectedUnivOption, setSelectedUnivOption] = useState(KNOWN_UNIVERSITIES[0]);
  const [customUnivName, setCustomUnivName] = useState("");
  const [aisheCode, setAisheCode] = useState("");
  const [univCategory, setUnivCategory] = useState("Institute of National Importance (IIT/NIT/IIM)");
  const [district, setDistrict] = useState("Ranchi");

  // Form Fields - Step 2: Nodal SPOC & Account Security
  const [spocName, setSpocName] = useState("");
  const [spocDesignation, setSpocDesignation] = useState("");
  const [spocEmail, setSpocEmail] = useState("");
  const [spocPhone, setSpocPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields - Step 3: Research Disciplines & Capabilities
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([
    "Agritech & Soil Diagnostics",
    "Water Resources & IoT Sensors",
  ]);
  const [hasIncubationCenter, setHasIncubationCenter] = useState(true);

  // Field validation errors object
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    "Institution Identity",
    "Nodal SPOC & Account Security",
    "Research Disciplines",
  ];

  const getEffectiveUnivName = () => {
    if (selectedUnivOption.startsWith("Other")) {
      return customUnivName.trim();
    }
    return selectedUnivOption.trim();
  };

  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};

    if (step === 0) {
      if (selectedUnivOption.startsWith("Other") && !customUnivName.trim()) {
        errs.customUnivName = "Please enter your institution / college name.";
      }
      if (!aisheCode.trim()) {
        errs.aisheCode = "AISHE Code or UGC ID is required.";
      }
      if (!district.trim()) {
        errs.district = "Please select the institutional district.";
      }
    } else if (step === 1) {
      if (!spocName.trim()) {
        errs.spocName = "Nodal SPOC Full Name is required.";
      }
      if (!spocDesignation.trim()) {
        errs.spocDesignation = "SPOC designation is required.";
      }
      if (!spocEmail.trim()) {
        errs.spocEmail = "Contact email is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(spocEmail.trim())) {
        errs.spocEmail = "Please enter a valid email address.";
      }

      const cleanPhone = spocPhone.replace(/\D/g, "");
      if (!spocPhone.trim()) {
        errs.spocPhone = "Phone number is required.";
      } else if (cleanPhone.length < 10) {
        errs.spocPhone = "Please enter a valid 10-digit mobile number.";
      }

      if (!password) {
        errs.password = "Password is required.";
      } else if (password.length < 6) {
        errs.password = "Password must be at least 6 characters.";
      }
    } else if (step === 2) {
      if (selectedDisciplines.length === 0) {
        errs.disciplines = "Please select at least 1 specialized research discipline.";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = async () => {
    setServerError(null);
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Final Step Submission
      const finalUnivName = getEffectiveUnivName();
      const res = await onboardUniversity({
        name: spocName.trim(),
        email: spocEmail.trim().toLowerCase(),
        phone: spocPhone.trim(),
        password: password.trim(),
        district,
        designation: spocDesignation.trim(),
        univName: finalUnivName,
        aisheCode: aisheCode.trim(),
        univCategory,
        disciplines: selectedDisciplines,
        hasIncubationCenter,
      });

      if (res.success) {
        const generated = (res as any).referenceId || (res as any).user?.referenceId || `HEI-JH-2026-${Math.floor(100 + Math.random() * 900)}`;
        setRefId(generated);
        setIsComplete(true);
      } else {
        setServerError((res as any).message || "Failed to complete onboarding. Please check your details.");
      }
    }
  };

  const handlePrev = () => {
    setServerError(null);
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      router.push("/");
    }
  };

  const toggleDiscipline = (title: string) => {
    if (selectedDisciplines.includes(title)) {
      setSelectedDisciplines(selectedDisciplines.filter((d) => d !== title));
    } else {
      setSelectedDisciplines([...selectedDisciplines, title]);
    }
    if (errors.disciplines) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.disciplines;
        return copy;
      });
    }
  };

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { label: "", color: "", width: "0%" };
    if (password.length < 6) return { label: "Too Short", color: "bg-rose-500", width: "25%" };
    if (password.length < 8) return { label: "Fair", color: "bg-amber-500", width: "50%" };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { label: "Strong", color: "bg-emerald-500", width: "100%" };
    }
    return { label: "Good", color: "bg-blue-500", width: "75%" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <OnboardingFormWrapper
      roleTitle="College & University (HEI) Onboarding"
      roleTagline="Register your institution to receive routed grassroots challenges, form student capstone teams, and access NEP 2020 Capstone R&D Grants."
      roleBadge="Academic Lab Grants"
      trustBadge="Institutional Review"
      timeEstimate="~3 Minutes"
      steps={steps}
      currentStepIndex={currentStep}
      onPrevStep={handlePrev}
      onNextStep={handleNext}
      isComplete={isComplete}
      referenceId={refId}
      completedSummary={[
        { label: "Institution", value: getEffectiveUnivName() },
        { label: "AISHE Code", value: aisheCode || "-" },
        { label: "District", value: district },
        { label: "Nodal SPOC", value: spocName || "-" },
        { label: "Contact Email", value: spocEmail || "-" },
        { label: "Verification SLA", value: "Instant Active Account" },
      ]}
      dashboardRole="university"
    >
      {/* Global Server Error Banner */}
      {serverError && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 animate-in fade-in">
          <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
            ✕
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-rose-900">Onboarding Notice</h4>
            <p className="text-xs text-rose-700 mt-0.5">{serverError}</p>
            {serverError.includes("already registered") && (
              <div className="mt-2">
                <Link
                  href="/auth/login/university"
                  className="inline-flex items-center gap-1 text-xs font-bold text-rose-900 underline hover:text-rose-950"
                >
                  Sign in to your University account instead →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 0: Institution Identity */}
      {currentStep === 0 && (
        <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-300">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
              <span>Institution Name (UGC / AICTE Approved): <span className="text-rose-500">*</span></span>
              <span className="text-[11px] font-normal text-slate-500">Jharkhand Higher Education Institutions</span>
            </label>
            <select
              value={selectedUnivOption}
              onChange={(e) => {
                setSelectedUnivOption(e.target.value);
                setErrors((prev) => {
                  const copy = { ...prev };
                  delete copy.customUnivName;
                  return copy;
                });
              }}
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 bg-white text-slate-900 text-xs font-semibold outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-2xs"
            >
              {KNOWN_UNIVERSITIES.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Conditional Custom Institution Input */}
          {selectedUnivOption.startsWith("Other") && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Enter Full College / Institution Name: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Cambridge Institute of Technology, Tatisilwai, Ranchi"
                value={customUnivName}
                onChange={(e) => {
                  setCustomUnivName(e.target.value);
                  if (errors.customUnivName) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.customUnivName;
                      return copy;
                    });
                  }
                }}
                className={`w-full px-4 py-3 rounded-xl border text-slate-900 text-xs outline-none transition-all ${
                  errors.customUnivName
                    ? "border-rose-400 bg-rose-50/30 focus:ring-2 focus:ring-rose-400"
                    : "border-slate-300 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                }`}
              />
              {errors.customUnivName && (
                <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                  <span>⚠️</span> {errors.customUnivName}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                <span>AISHE Code / UGC ID: <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="text"
                placeholder="e.g. U-0284 or C-41258"
                value={aisheCode}
                onChange={(e) => {
                  setAisheCode(e.target.value.toUpperCase());
                  if (errors.aisheCode) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.aisheCode;
                      return copy;
                    });
                  }
                }}
                className={`w-full px-4 py-2.5 rounded-xl border font-mono text-xs text-slate-900 outline-none transition-all ${
                  errors.aisheCode
                    ? "border-rose-400 bg-rose-50/30 focus:ring-2 focus:ring-rose-400"
                    : "border-slate-300 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                }`}
              />
              {errors.aisheCode ? (
                <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                  <span>⚠️</span> {errors.aisheCode}
                </p>
              ) : (
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Found on aishe.gov.in institutional certificate
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Institution Category:
              </label>
              <select
                value={univCategory}
                onChange={(e) => setUnivCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              >
                <option>Institute of National Importance (IIT/NIT/IIM)</option>
                <option>Deemed University / Autonomous HEI</option>
                <option>State Public University</option>
                <option>Affiliated Engineering College</option>
                <option>Polytechnic / Agricultural College</option>
                <option>Science & Research Institute</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Institution Campus District: <span className="text-rose-500">*</span>
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-semibold outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
            >
              {JHARKHAND_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-100 flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs text-purple-950 leading-relaxed">
              <strong>Institutional Policy:</strong> Registered institutions receive direct grassroots problem routing from Panchayats and ULBs, enabling eligibility for State Capstone Seed Grants (₹5L–₹25L).
            </p>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="w-full py-3.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue to Nodal SPOC & Security</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      )}

      {/* Step 1: Nodal SPOC & Account Security */}
      {currentStep === 1 && (
        <div className="space-y-5 max-w-2xl mx-auto animate-in fade-in duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Nodal SPOC Full Name: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Animesh Kumar Sinha"
                value={spocName}
                onChange={(e) => {
                  setSpocName(e.target.value);
                  if (errors.spocName) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.spocName;
                      return copy;
                    });
                  }
                }}
                className={`w-full px-4 py-2.5 rounded-xl border text-slate-900 text-xs outline-none transition-all ${
                  errors.spocName
                    ? "border-rose-400 bg-rose-50/30 focus:ring-2 focus:ring-rose-400"
                    : "border-slate-300 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                }`}
              />
              {errors.spocName && (
                <p className="text-[11px] text-rose-600 font-medium mt-1">⚠️ {errors.spocName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Institutional Designation: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Dean (R&D) / HOD Computer Science"
                value={spocDesignation}
                onChange={(e) => {
                  setSpocDesignation(e.target.value);
                  if (errors.spocDesignation) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.spocDesignation;
                      return copy;
                    });
                  }
                }}
                className={`w-full px-4 py-2.5 rounded-xl border text-slate-900 text-xs outline-none transition-all ${
                  errors.spocDesignation
                    ? "border-rose-400 bg-rose-50/30 focus:ring-2 focus:ring-rose-400"
                    : "border-slate-300 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                }`}
              />
              {errors.spocDesignation && (
                <p className="text-[11px] text-rose-600 font-medium mt-1">⚠️ {errors.spocDesignation}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
              <span>Official Institutional Email: <span className="text-rose-500">*</span></span>
              <span className="text-[11px] text-purple-700 font-medium">Used for College Portal Sign In</span>
            </label>
            <input
              type="email"
              placeholder="e.g. dean.rnd@bitmesra.ac.in or dr.sinha@university.edu"
              value={spocEmail}
              onChange={(e) => {
                setSpocEmail(e.target.value);
                if (errors.spocEmail) {
                  setErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.spocEmail;
                    return copy;
                  });
                }
              }}
              className={`w-full px-4 py-2.5 rounded-xl border font-mono text-xs text-slate-900 outline-none transition-all ${
                errors.spocEmail
                  ? "border-rose-400 bg-rose-50/30 focus:ring-2 focus:ring-rose-400"
                  : "border-slate-300 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              }`}
            />
            {errors.spocEmail ? (
              <p className="text-[11px] text-rose-600 font-medium mt-1">⚠️ {errors.spocEmail}</p>
            ) : (
              <span className="text-[11px] text-slate-400 mt-1 block">
                Official institutional email for state communication &amp; grant notifications
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Direct Contact Mobile Number: <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs font-bold">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                placeholder="9876543210"
                value={spocPhone}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "");
                  setSpocPhone(cleaned);
                  if (errors.spocPhone) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.spocPhone;
                      return copy;
                    });
                  }
                }}
                className={`w-full pl-12 pr-4 py-2.5 rounded-xl border font-mono text-xs text-slate-900 outline-none transition-all ${
                  errors.spocPhone
                    ? "border-rose-400 bg-rose-50/30 focus:ring-2 focus:ring-rose-400"
                    : "border-slate-300 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                }`}
              />
            </div>
            {errors.spocPhone && (
              <p className="text-[11px] text-rose-600 font-medium mt-1">⚠️ {errors.spocPhone}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Create Portal Password: <span className="text-rose-500">*</span>
              </label>
              {password && (
                <span className="text-[11px] font-bold text-slate-600">
                  Strength: <span className={passwordStrength.label === "Strong" ? "text-emerald-600" : "text-amber-600"}>{passwordStrength.label}</span>
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.password;
                      return copy;
                    });
                  }
                }}
                className={`w-full px-4 pr-12 py-2.5 rounded-xl border text-slate-900 text-xs outline-none transition-all ${
                  errors.password
                    ? "border-rose-400 bg-rose-50/30 focus:ring-2 focus:ring-rose-400"
                    : "border-slate-300 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* Password strength bar */}
            {password && (
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: passwordStrength.width }}
                />
              </div>
            )}

            {errors.password && (
              <p className="text-[11px] text-rose-600 font-medium mt-1">⚠️ {errors.password}</p>
            )}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="w-full py-3.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            <span>Continue to Research Capabilities</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      )}

      {/* Step 2: Research Disciplines & Capabilities */}
      {currentStep === 2 && (
        <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-300">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-800">
                Select Specialized Research Disciplines &amp; Laboratories: <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-bold text-purple-700">
                {selectedDisciplines.length} Selected
              </span>
            </div>

            {errors.disciplines && (
              <p className="text-[11px] text-rose-600 font-medium mb-3 p-2 bg-rose-50 rounded-lg border border-rose-200">
                ⚠️ {errors.disciplines}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DISCIPLINES_LIST.map((disc) => {
                const isSelected = selectedDisciplines.includes(disc.title);
                return (
                  <button
                    key={disc.id}
                    type="button"
                    onClick={() => toggleDiscipline(disc.title)}
                    className={`p-3.5 rounded-2xl border text-left flex items-start justify-between gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-purple-50/80 border-purple-500 ring-1 ring-purple-500/20 text-purple-950 shadow-2xs"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50/80 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex-1">
                      <span className={`text-xs block font-bold ${isSelected ? "text-purple-950" : "text-slate-800"}`}>
                        {disc.title}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                        {disc.desc}
                      </span>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs transition-colors ${
                        isSelected ? "bg-purple-600 text-white font-bold" : "border border-slate-300 text-transparent"
                      }`}
                    >
                      ✓
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-4">
            <div>
              <span className="font-bold text-xs text-slate-900 block">
                Atal Incubation Centre / IIC / TBI Status:
              </span>
              <span className="text-[11px] text-slate-500">
                Enables student startup fast-track funding and prototype commercialization.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setHasIncubationCenter(!hasIncubationCenter)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
                hasIncubationCenter
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {hasIncubationCenter && <span>✓</span>}
              <span>{hasIncubationCenter ? "Active Lab / IIC" : "No Incubation Centre"}</span>
            </button>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={handleNext}
            className={`w-full py-4 rounded-full bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isLoading ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Registering College &amp; Allocating Grants...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Submit College Onboarding &amp; Access Gateway</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            )}
          </button>
        </div>
      )}
    </OnboardingFormWrapper>
  );
}
