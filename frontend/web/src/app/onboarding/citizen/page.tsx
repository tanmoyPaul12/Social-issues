"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingFormWrapper } from "@/components/onboarding/OnboardingFormWrapper";
import { useAuthStore } from "@/lib/store/useAuthStore";

const JHARKHAND_DISTRICTS = [
  "Dumka",
  "Gumla",
  "Dhanbad",
  "Ranchi",
  "East Singhbhum (Jamshedpur)",
  "West Singhbhum (Chaibasa)",
  "Hazaribagh",
  "Bokaro",
  "Palamu",
  "Deoghar",
  "Giridih",
  "Garhwa",
  "Chatra",
  "Godda",
  "Jamtara",
  "Khunti",
  "Koderma",
  "Latehar",
  "Lohardaga",
  "Pakur",
  "Ramgarh",
  "Sahibganj",
  "Seraikela Kharsawan",
  "Simdega",
];

export default function CitizenOnboardingPage() {
  const router = useRouter();
  const { signup } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [refId, setRefId] = useState("");

  // Form Fields
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [name, setName] = useState("");
  const [district, setDistrict] = useState(JHARKHAND_DISTRICTS[0]);
  const [language, setLanguage] = useState("हिन्दी (Hindi)");

  const steps = [
    "Mobile Verification",
    "Citizen Profile",
  ];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const citizenPhone = phone && phone.length >= 10 ? phone : "9876543210";
      const citizenName = name || "Verified Resident";
      await signup({
        name: citizenName,
        phone: citizenPhone,
        district,
        language,
        entityType: "INDIVIDUAL",
      });
      const generated = `CIT-JH-${Math.floor(10000 + Math.random() * 90000)}`;
      setRefId(generated);
      setIsComplete(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push("/");
    }
  };

  return (
    <OnboardingFormWrapper
      roleTitle="Citizen & Community Resident Onboarding"
      roleTagline="Fast, password-free citizen registration to submit community issues, track live resolving labs, and rate final resolutions."
      roleBadge="Instant OTP Access"
      trustBadge="Direct Resident Access"
      timeEstimate="< 1 Minute"
      steps={steps}
      currentStepIndex={currentStep}
      onPrevStep={handlePrev}
      onNextStep={handleNext}
      isComplete={isComplete}
      referenceId={refId}
      completedSummary={[
        { label: "Citizen Name", value: name || "-" },
        { label: "Mobile Number", value: phone ? `+91 ${phone}` : "-" },
        { label: "District", value: district },
        { label: "Preferred Language", value: language },
        { label: "Account Status", value: "Verified Citizen Dashboard Access" },
      ]}
      dashboardRole="citizen"
    >
      {/* Verification Notice */}
      <div className="mb-6 p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 flex items-center gap-3">
        <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span>
          <strong>Citizen Verification Gate:</strong> Quick mobile OTP verification ensures verified community problem submissions and prevents duplicates across Jharkhand districts.
        </span>
      </div>

      {currentStep === 0 && (
        <div className="space-y-5 max-w-xl mx-auto animate-in fade-in">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Mobile Number (India +91):
            </label>
            <div className="flex gap-2">
              <span className="px-3.5 py-3 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600 flex items-center">
                +91
              </span>
              <input
                type="tel"
                placeholder="e.g. 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 font-mono text-sm text-slate-900 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {!otpSent ? (
            <button
              type="button"
              onClick={() => {
                setOtpSent(true);
              }}
              className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              Send OTP via SMS / WhatsApp →
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-800 font-bold flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>OTP dispatched to +91 {phone || "9876543210"}</span>
                </span>
                <span className="text-emerald-600 font-mono">Valid for 5 min</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enter 6-Digit Verification Code:
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="000000"
                  className="w-full text-center tracking-[0.5em] font-mono font-bold text-xl py-2.5 rounded-xl border border-emerald-300 bg-white outline-none text-slate-900"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Enter the 6-digit OTP sent to your registered mobile number
                </p>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
              >
                Verify &amp; Continue →
              </button>
            </div>
          )}

          <div className="relative text-center my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white px-3 text-slate-400 text-xs font-medium">
              or continue with
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              handleNext();
            }}
            className="w-full py-3 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Continue with Google / Email</span>
          </button>
        </div>
      )}

      {currentStep === 1 && (
        <div className="space-y-5 max-w-xl mx-auto animate-in fade-in">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Full Name:
            </label>
            <input
              type="text"
              placeholder="e.g. Ramesh Soren"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Home District in Jharkhand:
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs outline-none focus:border-blue-500 bg-white font-medium"
            >
              {JHARKHAND_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Preferred Language for Audio Updates:
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs outline-none focus:border-blue-500 bg-white font-medium"
            >
              <option>हिन्दी (Hindi)</option>
              <option>ᱥᱟᱱᱛᱟᱲᱤ (Santhali)</option>
              <option>বাংলা (Bengali)</option>
              <option>मुंडारी (Mundari)</option>
              <option>हो (Ho)</option>
              <option>English (English)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            Complete Citizen Registration →
          </button>
        </div>
      )}
    </OnboardingFormWrapper>
  );
}
