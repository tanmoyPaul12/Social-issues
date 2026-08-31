"use client";

import React, { useState, useEffect } from "react";
import {
  CorporateNotificationPreferences,
  EmailDigestFrequency,
  UpdateNotificationPreferencesPayload,
  JHARKHAND_RESEARCH_DOMAINS,
} from "@/modules/industry/types/companySettings";

interface NotificationPreferencesSectionProps {
  preferences: CorporateNotificationPreferences | null;
  isLoading: boolean;
  isSaving: boolean;
  onSave: (payload: UpdateNotificationPreferencesPayload) => Promise<boolean>;
}

export function NotificationPreferencesSection({
  preferences,
  isLoading,
  isSaving,
  onSave,
}: NotificationPreferencesSectionProps) {
  const [formData, setFormData] = useState<UpdateNotificationPreferencesPayload>({
    preferredSectors: ["AGRICULTURE", "WATER", "ENVIRONMENT", "EDUCATION"],
    minReadinessLevel: "PROTOTYPING",
    notifyNewMatchingProjects: true,
    notifyMilestoneSubmissions: true,
    notifyDisbursementTrancheDue: true,
    notifyComplianceDeadlines: true,
    notifyDiscussionMessages: true,
    emailDigestFrequency: "INSTANT",
    alertEmail: "",
  });

  useEffect(() => {
    if (preferences) {
      setFormData({
        preferredSectors: preferences.preferredSectors || ["AGRICULTURE", "WATER", "ENVIRONMENT", "EDUCATION"],
        minReadinessLevel: preferences.minReadinessLevel || "PROTOTYPING",
        notifyNewMatchingProjects: preferences.notifyNewMatchingProjects !== false,
        notifyMilestoneSubmissions: preferences.notifyMilestoneSubmissions !== false,
        notifyDisbursementTrancheDue: preferences.notifyDisbursementTrancheDue !== false,
        notifyComplianceDeadlines: preferences.notifyComplianceDeadlines !== false,
        notifyDiscussionMessages: preferences.notifyDiscussionMessages !== false,
        emailDigestFrequency: preferences.emailDigestFrequency || "INSTANT",
        alertEmail: preferences.alertEmail || "",
      });
    }
  }, [preferences]);

  const handleToggleSector = (sectorId: string) => {
    const current = formData.preferredSectors || [];
    if (current.includes(sectorId)) {
      if (current.length > 1) {
        setFormData({ ...formData, preferredSectors: current.filter((s: string) => s !== sectorId) });
      }
    } else {
      setFormData({ ...formData, preferredSectors: [...current, sectorId] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  if (isLoading && !preferences) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-xs">
        <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-bold text-slate-600">Loading alert subscriptions &amp; preferences...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Domain Subscriptions &amp; Notification Matrix
              </h3>
              <p className="text-xs text-slate-500">
                Configure auto-matching alerts for new university capstones, milestone approvals, and statutory deadlines
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving Rules...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                Save Alert Rules
              </>
            )}
          </button>
        </div>
      </div>

      {/* Section 1: Subscribed Research Domains */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-2xs space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900">1. Subscribed Research &amp; Co-Funding Domains</h4>
            <p className="text-xs text-slate-500">
              Receive automatic alerts when university R&amp;D teams submit challenges in these focus areas
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-2">
          {JHARKHAND_RESEARCH_DOMAINS.map((domain) => {
            const isSubscribed = (formData.preferredSectors || []).includes(domain.id);
            return (
              <button
                key={domain.id}
                type="button"
                onClick={() => handleToggleSector(domain.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  isSubscribed
                    ? "bg-indigo-50/80 border-indigo-300 text-indigo-950 font-bold shadow-2xs"
                    : "bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="truncate">
                  <span className="text-xs block truncate">{domain.label}</span>
                  <span className="text-[10px] text-slate-400 font-normal block mt-0.5">{domain.scheduleViiRef ? "Schedule VII" : "R&D Focus"}</span>
                </div>
                <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                  isSubscribed ? "bg-indigo-600 text-white" : "border border-slate-300 bg-white"
                }`}>
                  {isSubscribed && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 2: Technology Readiness Level & Alert Toggles */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-2xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900">2. Event Trigger &amp; Delivery Matrix</h4>
            <p className="text-xs text-slate-500">Fine-tune automated triggers and compliance reminders</p>
          </div>
        </div>

        {/* TRL Filter & Email Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Minimum Project Readiness Level (TRL Filter)
            </label>
            <select
              value={formData.minReadinessLevel}
              onChange={(e) => setFormData({ ...formData, minReadinessLevel: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="CONCEPT">TRL-2 to TRL-3: Conceptual Formulation &amp; Feasibility</option>
              <option value="PROTOTYPING">TRL-4 to TRL-5: Lab Prototyping &amp; Validated Models</option>
              <option value="FIELD_PILOT">TRL-6 to TRL-7: Field Testbed Deployment in Jharkhand</option>
              <option value="COMMERCIALIZATION">TRL-8 to TRL-9: Full Scale Commercial Rollout</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Delivery Email Address for Compliance Notices
            </label>
            <input
              type="email"
              value={formData.alertEmail || ""}
              onChange={(e) => setFormData({ ...formData, alertEmail: e.target.value })}
              placeholder="e.g. csr.compliance@tatasteel.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* 5 Event Notification Switches */}
        <div className="divide-y divide-slate-100 pt-2 font-medium">
          {[
            {
              key: "notifyNewMatchingProjects",
              title: "New Matching University R&D Submissions",
              desc: "Instant alert when a university or incubation lab publishes a project matching your subscribed sectors",
              checked: formData.notifyNewMatchingProjects,
              icon: (
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
            },
            {
              key: "notifyMilestoneSubmissions",
              title: "Milestone Deliverable Approvals Needed",
              desc: "Notify when a co-funded research team submits milestone reports and testbed results for sign-off",
              checked: formData.notifyMilestoneSubmissions,
              icon: (
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              ),
            },
            {
              key: "notifyDisbursementTrancheDue",
              title: "Payment Tranche Due Dates & Release Notices",
              desc: "Alert financial controllers when a co-funded pilot unlocks its next disbursement tranche",
              checked: formData.notifyDisbursementTrancheDue,
              icon: (
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ),
            },
            {
              key: "notifyComplianceDeadlines",
              title: "MCA CSR-2 & Form GFR 12-A Statutory Deadlines",
              desc: "Automated reminders 30 days prior to annual MCA CSR filing and pending CA Utilization Certificates",
              checked: formData.notifyComplianceDeadlines,
              icon: (
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
            {
              key: "notifyDiscussionMessages",
              title: "University Research Team Direct Inquiries",
              desc: "Receive updates when faculty PIs and student innovators message your corporate mentorship inbox",
              checked: formData.notifyDiscussionMessages,
              icon: (
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              ),
            },
          ].map((item) => (
            <div key={item.key} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{item.title}</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">{item.desc}</span>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={Boolean(item.checked)}
                  onChange={(e) => setFormData({ ...formData, [item.key]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900" />
              </label>
            </div>
          ))}
        </div>

        {/* Digest Frequency Selector */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-slate-900 block">Email Digest Cadence</span>
            <span className="text-[11px] text-slate-500 block">Consolidate periodic updates into structured summary digests</span>
          </div>

          <div className="flex items-center gap-1.5">
            {[
              { id: "INSTANT", label: "Instant Alerts" },
              { id: "DAILY_DIGEST", label: "Daily Digest" },
              { id: "WEEKLY_DIGEST", label: "Weekly Summary" },
              { id: "MUTED", label: "Muted" },
            ].map((freq) => (
              <button
                key={freq.id}
                type="button"
                onClick={() => setFormData({ ...formData, emailDigestFrequency: freq.id as EmailDigestFrequency })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  formData.emailDigestFrequency === freq.id
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {freq.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving Preferences...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              Save Alert Rules
            </>
          )}
        </button>
      </div>
    </form>
  );
}
