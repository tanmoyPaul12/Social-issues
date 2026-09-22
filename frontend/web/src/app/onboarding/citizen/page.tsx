"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingFormWrapper } from "@/components/onboarding/OnboardingFormWrapper";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { GuestOnlyGuard } from "@/components/auth/GuestOnlyGuard";

const JHARKHAND_DISTRICTS = [
  "Dumka", "Gumla", "Dhanbad", "Ranchi", "East Singhbhum (Jamshedpur)",
  "West Singhbhum (Chaibasa)", "Hazaribagh", "Bokaro", "Palamu", "Deoghar",
  "Giridih", "Garhwa", "Chatra", "Godda", "Jamtara", "Khunti", "Koderma",
  "Latehar", "Lohardaga", "Pakur", "Ramgarh", "Sahibganj", "Seraikela Kharsawan", "Simdega"
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
  const [district, setDistrict] = useState(JHARKHAND_DISTRICTS[3]); // Ranchi
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
      router.push("/onboarding");
    }
  };

  return (
    <GuestOnlyGuard>
      <OnboardingFormWrapper
        roleTitle="Citizen & Community Registration"
        roleTagline="Quick registration to submit community issues, track resolving labs, and rate solutions"
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
        ]}
        dashboardRole="citizen"
      >
        {currentStep === 0 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Mobile Number
              </label>
              <div className="flex gap-2">
                <span className="px-3.5 py-3 rounded-xl bg-slate-100 border border-slate-300 text-sm font-semibold text-slate-600 flex items-center">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                />
              </div>
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={() => setOtpSent(true)}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                Send OTP via SMS →
              </button>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-semibold">
                    OTP sent to +91 {phone || "9876543210"}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">Valid for 5 mins</span>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Enter 6-Digit OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="000000"
                    className="w-full text-center tracking-[0.4em] font-mono font-bold text-lg py-2.5 rounded-xl border border-slate-300 bg-white outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  Verify &amp; Continue →
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Ramesh Soren"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Home District
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

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Preferred Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              >
                <option>हिन्दी (Hindi)</option>
                <option>ᱥᱟᱱᱛᱟᱲᱤ (Santhali)</option>
                <option>বাংলা (Bengali)</option>
                <option>मुंडारी (Mundari)</option>
                <option>हो (Ho)</option>
                <option>English</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                Complete Registration →
              </button>
            </div>
          </div>
        )}
      </OnboardingFormWrapper>
    </GuestOnlyGuard>
  );
}
