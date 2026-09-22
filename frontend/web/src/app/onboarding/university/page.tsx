"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OnboardingFormWrapper } from "@/components/onboarding/OnboardingFormWrapper";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { GuestOnlyGuard } from "@/components/auth/GuestOnlyGuard";

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
  "Ranchi", "Dhanbad", "East Singhbhum (Jamshedpur)", "Bokaro", "Hazaribagh",
  "Deoghar", "Dumka", "Ramgarh", "Giridih", "Palamu", "West Singhbhum (Chaibasa)",
  "Saraikela Kharsawan", "Garhwa", "Chatra", "Koderma", "Jamtara", "Godda",
  "Sahibganj", "Pakur", "Lohardaga", "Gumla", "Simdega", "Latehar", "Khunti"
];

const DISCIPLINES_LIST = [
  { id: "edtech", title: "Education & Vernacular Pedagogy", desc: "Digital classrooms, tribal dialect tools, STEM labs" },
  { id: "agri", title: "Agritech & Soil Diagnostics", desc: "Crop disease AI, precision irrigation, soil tests" },
  { id: "health", title: "MedTech & Rural Health", desc: "Point-of-care diagnostics, maternal health sensors" },
  { id: "water", title: "Water Resources & IoT", desc: "Groundwater monitoring, filtration systems" },
  { id: "ecology", title: "Mining Ecology & Bioremediation", desc: "Overburden revival, dust mitigation, afforestation" },
  { id: "clean_energy", title: "Clean Energy & Microgrids", desc: "Solar microgrids, battery storage, rural power" },
  { id: "urban", title: "Smart City & Waste Tech", desc: "Municipal GIS, decentralized composting, drainage" },
  { id: "ai_iot", title: "AI/ML & IoT Sensors", desc: "Computer vision, predictive logistics, sensor nets" },
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
    "Water Resources & IoT",
  ]);
  const [hasIncubationCenter, setHasIncubationCenter] = useState(true);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    "Institution Identity",
    "Nodal SPOC Details",
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
        errs.disciplines = "Please select at least 1 research discipline.";
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
        const generated = (res as any).referenceId || (res as any).user?.referenceId || `HEI-JH-${Math.floor(1000 + Math.random() * 9000)}`;
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
      router.push("/onboarding");
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

  return (
    <GuestOnlyGuard>
      <OnboardingFormWrapper
        roleTitle="University &amp; College Registration"
        roleTagline="Register your institution to claim capstone problems, R&D grants, and form student research teams"
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
        ]}
        dashboardRole="university"
      >
        {/* Error Banner */}
        {serverError && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            <p className="font-semibold">{serverError}</p>
            {serverError.includes("already registered") && (
              <Link
                href="/auth/login/university"
                className="inline-block mt-1 font-bold text-red-800 underline hover:text-red-950"
              >
                Sign in to your University account →
              </Link>
            )}
          </div>
        )}

        {/* Step 0: Institution Identity */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Institution Name
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
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              >
                {KNOWN_UNIVERSITIES.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            {selectedUnivOption.startsWith("Other") && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Specify College / Institution Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cambridge Institute of Technology, Ranchi"
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                />
                {errors.customUnivName && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.customUnivName}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  AISHE Code / UGC ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. U-0205"
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-mono"
                />
                {errors.aisheCode && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.aisheCode}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Campus District
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                >
                  {JHARKHAND_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Institution Category
              </label>
              <select
                value={univCategory}
                onChange={(e) => setUnivCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              >
                <option>Institute of National Importance (IIT/NIT/IIM)</option>
                <option>Deemed University / Autonomous HEI</option>
                <option>State Public University</option>
                <option>Affiliated Engineering College</option>
                <option>Polytechnic / Agricultural College</option>
                <option>Science &amp; Research Institute</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                Continue to SPOC Details →
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Nodal SPOC & Account Security */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  SPOC Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. A. K. Sinha"
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
                  placeholder="e.g. Dean R&D / HOD"
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                />
                {errors.spocDesignation && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.spocDesignation}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Institutional Email (for sign-in)
              </label>
              <input
                type="email"
                placeholder="faculty.lead@bitmesra.ac.in"
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
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              />
              {errors.spocEmail && (
                <p className="text-[11px] text-red-600 font-medium">{errors.spocEmail}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Contact Mobile Number
              </label>
              <div className="flex gap-2">
                <span className="px-3.5 py-3 rounded-xl bg-slate-100 border border-slate-300 text-sm font-semibold text-slate-600 flex items-center">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="10-digit mobile number"
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-mono"
                />
              </div>
              {errors.spocPhone && (
                <p className="text-[11px] text-red-600 font-medium">{errors.spocPhone}</p>
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
                  if (errors.password) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.password;
                      return copy;
                    });
                  }
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
                Continue to Research Focus →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Research Disciplines */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Select Research Disciplines
                </label>
                <span className="text-xs font-semibold text-blue-600">
                  {selectedDisciplines.length} selected
                </span>
              </div>

              {errors.disciplines && (
                <p className="text-[11px] text-red-600 font-medium">{errors.disciplines}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {DISCIPLINES_LIST.map((disc) => {
                  const isSelected = selectedDisciplines.includes(disc.title);
                  return (
                    <button
                      key={disc.id}
                      type="button"
                      onClick={() => toggleDiscipline(disc.title)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? "bg-blue-50/70 border-blue-500 text-blue-900"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="text-xs font-semibold leading-tight">
                        {disc.title}
                      </div>
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0 ${
                          isSelected ? "bg-blue-600 text-white" : "border border-slate-300"
                        }`}
                      >
                        {isSelected ? "✓" : ""}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Active Incubation / Innovation Cell (IIC)?
                </span>
                <span className="text-[11px] text-slate-500">
                  Allows student startup seed grant allocation
                </span>
              </div>
              <input
                type="checkbox"
                checked={hasIncubationCenter}
                onChange={(e) => setHasIncubationCenter(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
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
                    <span>Registering Institution...</span>
                  </>
                ) : (
                  <span>Complete University Registration →</span>
                )}
              </button>
            </div>
          </div>
        )}
      </OnboardingFormWrapper>
    </GuestOnlyGuard>
  );
}
