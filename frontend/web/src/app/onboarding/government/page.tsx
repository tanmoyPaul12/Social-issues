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

export default function GovernmentOnboardingPage() {
  const router = useRouter();
  const { onboardGovernment, isLoading } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [refId, setRefId] = useState("");

  // Form Fields
  const [govtEmail, setGovtEmail] = useState("");
  const [govtDepartment, setGovtDepartment] = useState("Department of Higher & Technical Education");
  const [govtDesignation, setGovtDesignation] = useState("");
  const [govtDistrict, setGovtDistrict] = useState(JHARKHAND_DISTRICTS[0]);
  const [serviceCode, setServiceCode] = useState("");

  const steps = [
    "Official Credentials & SSO",
    "Department & Jurisdiction",
  ];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const res = await onboardGovernment({
        name: govtDesignation ? `${govtDesignation} • ${govtDistrict}` : "State Nodal Officer",
        email: govtEmail || "nodal.officer@jharkhand.gov.in",
        phone: "9876543203",
        district: govtDistrict,
        designation: govtDesignation || "State Nodal Officer",
        govtDepartment,
        serviceCode: serviceCode || "JH-IAS-4029",
      });
      const generated = res.user?.referenceId || `GOV-JH-2026-${Math.floor(100 + Math.random() * 900)}`;
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
      roleTitle="Government & Nodal Official Onboarding"
      roleTagline="Access administrative intake queues, review AI problem categorization, and route validated challenges to regional universities."
      roleBadge="Administrative Triage Console"
      trustBadge="Government Provisioned"
      timeEstimate="Instant SSO / ~2 Min"
      steps={steps}
      currentStepIndex={currentStep}
      onPrevStep={handlePrev}
      onNextStep={handleNext}
      isComplete={isComplete}
      referenceId={refId}
      completedSummary={[
        { label: "Official Email", value: govtEmail || "-" },
        { label: "Department", value: govtDepartment || "-" },
        { label: "Jurisdiction", value: govtDistrict || "-" },
        { label: "Designation", value: govtDesignation || "-" },
        { label: "Access Level", value: "NODAL_ADMIN (District Triage & Routing)" },
      ]}
      dashboardRole="government"
    >
      {currentStep === 0 && (
        <div className="space-y-5 max-w-2xl mx-auto animate-in fade-in">
          {/* State SSO Card */}
          <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <strong className="text-blue-950 block text-xs sm:text-sm">
                  Jharkhand e-Pramaan / State Single Sign-On (SSO)
                </strong>
                <p className="text-blue-700 text-xs mt-0.5">
                  Instant authentication using Jan Parichay / State e-Pramaan credentials.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                handleNext();
              }}
              className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex-shrink-0 cursor-pointer"
            >
              Sign in via e-Pramaan →
            </button>
          </div>

          <div className="relative text-center my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white px-3 text-slate-400 text-xs font-medium">
              or enter official government details manually
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Official Email (@jharkhand.gov.in / @nic.in):
            </label>
            <input
              type="email"
              placeholder="e.g. rajeev.ranjan@jharkhand.gov.in"
              value={govtEmail}
              onChange={(e) => setGovtEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-mono text-xs outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Department / Line Ministry:
              </label>
              <select
                value={govtDepartment}
                onChange={(e) => setGovtDepartment(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs outline-none focus:border-blue-500"
              >
                <option>Department of Higher &amp; Technical Education (Education)</option>
                <option>Department of Agriculture &amp; Animal Husbandry (Agriculture)</option>
                <option>Health, Medical Education &amp; Family Welfare (Healthcare)</option>
                <option>Department of Drinking Water &amp; Sanitation (Water Resources)</option>
                <option>Department of Forest, Environment &amp; Climate Change (Environment)</option>
                <option>Department of Energy &amp; JREDA (Energy)</option>
                <option>Department of Urban Development &amp; Housing (Urban Development)</option>
                <option>Women, Child Dev &amp; Social Security (Accessibility &amp; Welfare)</option>
                <option>Personnel, Admin Reforms &amp; Rajbhasha (Public Administration)</option>
                <option>Rural Development &amp; Panchayati Raj (Rural Livelihoods)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Official Designation:
              </label>
              <input
                type="text"
                placeholder="e.g. District Nodal Officer / BDO"
                value={govtDesignation}
                onChange={(e) => setGovtDesignation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            Continue to Jurisdiction Selection →
          </button>
        </div>
      )}

      {currentStep === 1 && (
        <div className="space-y-5 max-w-2xl mx-auto animate-in fade-in">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Assigned District Jurisdiction in Jharkhand:
            </label>
            <select
              value={govtDistrict}
              onChange={(e) => setGovtDistrict(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 bg-white text-slate-900 text-xs font-bold outline-none focus:border-blue-500"
            >
              <option value="Statewide (All 24 Districts)">Statewide (All 24 Districts - State HQ)</option>
              {JHARKHAND_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d} District
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Officer Service ID / Employee Code:
            </label>
            <input
              type="text"
              placeholder="e.g. JH-IAS-2018-044 / JH-DHTE-099"
              value={serviceCode}
              onChange={(e) => setServiceCode(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-mono text-xs outline-none focus:border-blue-500"
            />
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-700 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-xs text-blue-950 leading-relaxed">
              <strong>Tenant Scoping (RBAC):</strong> As a Nodal Admin for <strong>{govtDistrict}</strong>, your account permissions are scoped to validate, prioritize, and allocate problem submissions originating within your jurisdiction.
            </p>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="w-full py-3.5 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            Activate Nodal Administration Console →
          </button>
        </div>
      )}
    </OnboardingFormWrapper>
  );
}
