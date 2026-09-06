"use client";

import React, { useState } from "react";
import { MarketplaceProject, OfferMentorshipPayload } from "@/modules/industry/types/marketplace";
import { useAuthStore } from "@/lib/store/useAuthStore";

interface OfferMentorshipModalProps {
  project: MarketplaceProject | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectId: number, payload: OfferMentorshipPayload) => Promise<boolean>;
}

export function OfferMentorshipModal({
  project,
  isOpen,
  onClose,
  onSubmit,
}: OfferMentorshipModalProps) {
  const { user } = useAuthStore();

  const [mentorName, setMentorName] = useState<string>(user?.name || "");
  const [mentorDesignation, setMentorDesignation] = useState<string>(user?.designation || "Technical Lead / SME");
  const [mentorEmail, setMentorEmail] = useState<string>(user?.email || "");
  const [domainExpertise, setDomainExpertise] = useState<string>(project?.sectorName || "Engineering & IoT");
  const [weeklyHours, setWeeklyHours] = useState<number>(2);
  const [messageNotes, setMessageNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorName.trim()) return;

    setIsSubmitting(true);
    const success = await onSubmit(project.id, {
      mentorName,
      mentorDesignation,
      mentorEmail,
      domainExpertise,
      weeklyHoursCommitted: weeklyHours,
      messageNotes,
    });
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-300 relative max-h-[90vh] overflow-y-auto text-xs">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </span>
          <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wide">
            Industry R&amp;D Mentorship
          </span>
        </div>
        <h3 className="text-lg font-black text-slate-900 tracking-tight">
          Nominate Corporate Technical Mentor
        </h3>
        <p className="text-slate-500 mt-1">
          Support faculty and student researchers at <strong>{project.universityName}</strong> for <strong>{project.title}</strong>.
        </p>

        {/* Mentorship Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Nominee Name:</label>
            <input
              type="text"
              required
              value={mentorName}
              onChange={(e) => setMentorName(e.target.value)}
              placeholder="e.g. Dr. Priyanshu Das"
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Designation:</label>
              <input
                type="text"
                value={mentorDesignation}
                onChange={(e) => setMentorDesignation(e.target.value)}
                placeholder="e.g. Principal Architect"
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Corporate Email:</label>
              <input
                type="email"
                value={mentorEmail}
                onChange={(e) => setMentorEmail(e.target.value)}
                placeholder="mentor@company.com"
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Domain Expertise:</label>
              <input
                type="text"
                value={domainExpertise}
                onChange={(e) => setDomainExpertise(e.target.value)}
                placeholder="e.g. Cloud IoT / Agritech"
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Time Commitment:</label>
              <select
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 outline-none focus:border-indigo-500"
              >
                <option value={1}>1 hour / week (Bi-weekly sync)</option>
                <option value={2}>2 hours / week (Weekly sync)</option>
                <option value={4}>4 hours / week (Deep co-design)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Message to University Faculty PI (Optional):</label>
            <textarea
              rows={3}
              value={messageNotes}
              onChange={(e) => setMessageNotes(e.target.value)}
              placeholder="e.g. Interested in offering advice on field trial architecture and component testing..."
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-lg bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Dispatch Mentorship Nomination →</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
