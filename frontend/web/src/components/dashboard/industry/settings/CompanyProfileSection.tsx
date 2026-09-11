"use client";

import React, { useState, useEffect } from "react";
import { CompanyProfile, UpdateCompanyProfilePayload, JHARKHAND_RESEARCH_DOMAINS, PARTNER_CATEGORY_OPTIONS, PartnerCategory } from "@/modules/industry/types/companySettings";

interface CompanyProfileSectionProps {
  profile: CompanyProfile | null;
  isLoading: boolean;
  isSaving: boolean;
  onSave: (payload: UpdateCompanyProfilePayload) => Promise<boolean>;
}

export function CompanyProfileSection({
  profile,
  isLoading,
  isSaving,
  onSave,
}: CompanyProfileSectionProps) {
  const [formData, setFormData] = useState<UpdateCompanyProfilePayload>({
    companyName: "",
    companyType: "Public Limited Enterprise",
    partnerCategory: "LARGE_ENTERPRISE",
    dpiitRecognitionNumber: "",
    udyamRegistrationNumber: "",
    taxExemptionNumber: "",
    institutionRegNumber: "",
    gstin: "",
    cinNumber: "",
    csrNumber: "",
    panNumber: "",
    registeredAddress: "",
    state: "Jharkhand",
    district: "East Singhbhum",
    pincode: "831001",
    website: "",
    contactEmail: "",
    contactPhone: "",
    annualCsrBudget: 25000000,
    companyScale: "Large Enterprise",
    aboutCompany: "",
    spocName: "",
    designation: "",
    sectors: ["AGRICULTURE", "WATER", "ENVIRONMENT", "EDUCATION"],
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        companyName: profile.companyName || "",
        companyType: profile.companyType || "Public Limited Enterprise",
        partnerCategory: profile.partnerCategory || "LARGE_ENTERPRISE",
        dpiitRecognitionNumber: profile.dpiitRecognitionNumber || "",
        udyamRegistrationNumber: profile.udyamRegistrationNumber || "",
        taxExemptionNumber: profile.taxExemptionNumber || "",
        institutionRegNumber: profile.institutionRegNumber || "",
        gstin: profile.gstin || "",
        cinNumber: profile.cinNumber || "",
        csrNumber: profile.csrNumber || "",
        panNumber: profile.panNumber || "",
        registeredAddress: profile.registeredAddress || "",
        state: profile.state || "Jharkhand",
        district: profile.district || "East Singhbhum",
        pincode: profile.pincode || "831001",
        website: profile.website || "",
        contactEmail: profile.contactEmail || "",
        contactPhone: profile.contactPhone || "",
        annualCsrBudget: profile.annualCsrBudget || 25000000,
        companyScale: profile.companyScale || "Large Enterprise",
        aboutCompany: profile.aboutCompany || "",
        spocName: profile.spocName || "",
        designation: profile.designation || "",
        sectors: profile.sectorList && profile.sectorList.length > 0
          ? profile.sectorList
          : ["AGRICULTURE", "WATER", "ENVIRONMENT", "EDUCATION"],
      });
    }
  }, [profile]);

  const handleToggleSector = (sector: string) => {
    const current = formData.sectors || [];
    if (current.includes(sector)) {
      if (current.length > 1) {
        setFormData({ ...formData, sectors: current.filter((s: string) => s !== sector) });
      }
    } else {
      setFormData({ ...formData, sectors: [...current, sector] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  if (isLoading && !profile) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-xs">
        <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-bold text-slate-600">Loading statutory corporate profile...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Verification & Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-radial from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                MCA &amp; Nodal Verified Entity
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ID: CSR-CORP-{profile?.id || 1}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {formData.companyName || "Corporate Profile & Statutory Credentials"}
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Maintained under Section 135 of the Companies Act, 2013 and Jharkhand Higher Education CSR Partnership Framework.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-sm hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  Save Profile Particulars
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Fieldset 1: Statutory Registry & Company Identifiers */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-2xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">1. Statutory Identification &amp; Corporate Structure</h3>
            <p className="text-xs text-slate-500">Government registry numbers filed with MCA, MSME, DPIIT &amp; GSTIN portals</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Partner Category Selector */}
          <div className="sm:col-span-2 lg:col-span-3 bg-gradient-to-r from-indigo-50/70 to-slate-50 border border-indigo-100 rounded-xl p-4">
            <label className="block text-xs font-bold text-indigo-950 mb-1.5 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Partner Category / Ecosystem Entity Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.partnerCategory || "LARGE_ENTERPRISE"}
              onChange={(e) => setFormData({ ...formData, partnerCategory: e.target.value as PartnerCategory })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-200 bg-white text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer shadow-xs"
            >
              {PARTNER_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label} — {opt.description}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-indigo-700/80 mt-1.5">
              Selecting your partner type customizes required statutory credentials and unlocks tailored engagement tracks (Mentorship, Prototyping, Co-Development, Field Testing).
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Legal Entity Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="e.g. Tata Steel Industrial Research"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Corporate Scale / Legal Structure
            </label>
            <select
              value={formData.companyScale}
              onChange={(e) => setFormData({ ...formData, companyScale: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
              <option value="Large Enterprise">Large Enterprise (&gt; ₹500 Cr Turnover)</option>
              <option value="Public Sector Undertaking (PSU)">Public Sector Undertaking (PSU)</option>
              <option value="Mid Corporate">Mid Corporate (₹50 Cr - ₹500 Cr)</option>
              <option value="Multinational Corporation">Multinational Corporation (MNC)</option>
              <option value="Startup">Early / Growth Startup</option>
              <option value="MSME">Micro / Small / Medium Enterprise</option>
              <option value="Philanthropic Foundation">Corporate Foundation / Trust / Section 8</option>
              <option value="Research Institution">Academic / Autonomous R&amp;D Institution</option>
              <option value="Innovation Hub">Incubator / CoE / TBI</option>
            </select>
          </div>

          {/* Conditional Category Specific Registration Numbers */}
          {formData.partnerCategory === "STARTUP" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>DPIIT Recognition Number</span>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Startup India</span>
              </label>
              <input
                type="text"
                value={formData.dpiitRecognitionNumber || ""}
                onChange={(e) => setFormData({ ...formData, dpiitRecognitionNumber: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50/20 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all uppercase"
                placeholder="DIPP12345"
              />
            </div>
          )}

          {formData.partnerCategory === "MSME" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Udyam Registration Number</span>
                <span className="text-[10px] font-semibold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">MSME Portal</span>
              </label>
              <input
                type="text"
                value={formData.udyamRegistrationNumber || ""}
                onChange={(e) => setFormData({ ...formData, udyamRegistrationNumber: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-sky-300 bg-sky-50/20 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all uppercase"
                placeholder="UDYAM-JH-01-0012345"
              />
            </div>
          )}

          {formData.partnerCategory === "CSR_ORGANIZATION" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>12A / 80G Tax Exemption No.</span>
                <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Income Tax Dept</span>
              </label>
              <input
                type="text"
                value={formData.taxExemptionNumber || ""}
                onChange={(e) => setFormData({ ...formData, taxExemptionNumber: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50/20 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all uppercase"
                placeholder="AAATE1234F"
              />
            </div>
          )}

          {(formData.partnerCategory === "RESEARCH_INSTITUTION" || formData.partnerCategory === "INNOVATION_HUB") && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Institution / Hub Registration No.</span>
                <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">DST / UGC / AICTE</span>
              </label>
              <input
                type="text"
                value={formData.institutionRegNumber || ""}
                onChange={(e) => setFormData({ ...formData, institutionRegNumber: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-purple-300 bg-purple-50/20 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all uppercase"
                placeholder="DST/TBI/2024/09"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              GST Identification Number (GSTIN) {formData.partnerCategory === "LARGE_ENTERPRISE" && <span className="text-rose-500">*</span>}
            </label>
            <input
              type="text"
              required={formData.partnerCategory === "LARGE_ENTERPRISE"}
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all uppercase"
              placeholder="20AAACT2727Q1ZW"
            />
          </div>

          {(formData.partnerCategory === "LARGE_ENTERPRISE" || !formData.partnerCategory) && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Corporate Identity Number (CIN)
              </label>
              <input
                type="text"
                value={formData.cinNumber}
                onChange={(e) => setFormData({ ...formData, cinNumber: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all uppercase"
                placeholder="L27100WB1907PLC000260"
              />
            </div>
          )}

          {(formData.partnerCategory === "LARGE_ENTERPRISE" || formData.partnerCategory === "CSR_ORGANIZATION") && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                MCA Form CSR-1 Registration No.
              </label>
              <input
                type="text"
                value={formData.csrNumber}
                onChange={(e) => setFormData({ ...formData, csrNumber: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all uppercase"
                placeholder="CSR00018942"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Permanent Account Number (PAN)
            </label>
            <input
              type="text"
              value={formData.panNumber}
              onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all uppercase"
              placeholder="AAACT2727Q"
            />
          </div>
        </div>
      </div>

      {/* Fieldset 2: Office Coordinates & Primary SPOC */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-2xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">2. Registered Office &amp; Nodal SPOC Coordinates</h3>
            <p className="text-xs text-slate-500">Official communication address and corporate focal point in Jharkhand</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Registered Corporate Address
            </label>
            <input
              type="text"
              value={formData.registeredAddress}
              onChange={(e) => setFormData({ ...formData, registeredAddress: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="e.g. Tata Steel Complex, Main Road, Jamshedpur"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              District (Jharkhand)
            </label>
            <input
              type="text"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="e.g. East Singhbhum / Ranchi"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              State
            </label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="Jharkhand"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Postal Pincode
            </label>
            <input
              type="text"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="831001"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Corporate Website / Portal
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="https://www.tatasteel.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Primary SPOC Full Name
            </label>
            <input
              type="text"
              value={formData.spocName}
              onChange={(e) => setFormData({ ...formData, spocName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="Rajiv Mathur"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              SPOC Corporate Designation
            </label>
            <input
              type="text"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="Chief General Manager & CSR Head"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Corporate Contact Email
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="csr.compliance@tatasteel.com"
            />
          </div>
        </div>
      </div>

      {/* Fieldset 3: Annual CSR Capacity & Focus Domains */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-2xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">3. Annual CSR Budget Capacity &amp; Research Focus</h3>
            <p className="text-xs text-slate-500">Statutory allocation capacity under Schedule VII and prioritized impact sectors</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Annual Statutory CSR Budget (₹ INR)
            </label>
            <input
              type="number"
              min="0"
              step="100000"
              value={formData.annualCsrBudget}
              onChange={(e) => setFormData({ ...formData, annualCsrBudget: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Formatted: <strong>₹{(formData.annualCsrBudget ? formData.annualCsrBudget / 10000000 : 0).toFixed(2)} Cr</strong>
            </span>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Corporate CSR Vision &amp; Mandate
            </label>
            <textarea
              rows={2}
              value={formData.aboutCompany}
              onChange={(e) => setFormData({ ...formData, aboutCompany: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
              placeholder="Pioneering industrial innovation and university R&D partnerships across Jharkhand..."
            />
          </div>
        </div>

        {/* Focus Sectors Multi-Select */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Priority Sectors of Interest (Click to toggle)
          </label>
          <div className="flex flex-wrap gap-2">
            {JHARKHAND_RESEARCH_DOMAINS.map((domain) => {
              const isSelected = (formData.sectors || []).includes(domain.id);
              return (
                <button
                  key={domain.id}
                  type="button"
                  onClick={() => handleToggleSector(domain.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200/60"
                  }`}
                >
                  <svg className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-400" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isSelected ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    )}
                  </svg>
                  {domain.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving Profile Particulars...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              Save Profile Particulars
            </>
          )}
        </button>
      </div>
    </form>
  );
}
