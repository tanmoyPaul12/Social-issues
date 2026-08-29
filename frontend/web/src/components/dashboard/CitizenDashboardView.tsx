"use client";

import React, { useState } from "react";
import { OFFICIAL_RESEARCH_DOMAINS } from "@/app/page";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "@/components/dashboard/ToastStack";

interface CitizenSubmission {
  id: string;
  title: string;
  domain: string;
  district: string;
  date: string;
  status: "Submitted" | "Under Review" | "Assigned to University" | "In Progress" | "Resolved & Deployed";
  assignedHEI?: string;
  fundingPartner?: string;
  progress: number;
  description: string;
  upvotes: number;
}

interface CommunityChallenge {
  id: string;
  title: string;
  district: string;
  domain: string;
  upvotes: number;
  author: string;
  hasUpvoted: boolean;
}

interface CitizenDashboardViewProps {
  activeTab?: string;
}

export function CitizenDashboardView({ activeTab = "overview" }: CitizenDashboardViewProps) {
  const { user } = useAuthStore();
  const citizenDistrict = user?.district || "Your District";
  const citizenName = user?.name || "Citizen";

  const [submissions, setSubmissions] = useState<CitizenSubmission[]>([]);
  const [communityIssues, setCommunityIssues] = useState<CommunityChallenge[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<CitizenSubmission | null>(null);

  // New report form state
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState<string>(OFFICIAL_RESEARCH_DOMAINS[1] || "Agriculture & Agro-Tech");
  const [description, setDescription] = useState("");
  const [locationPin, setLocationPin] = useState(user?.district ? `${user.district} (Gram Panchayat)` : "Gram Panchayat");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newSub: CitizenSubmission = {
        id: `JH-2026-0${Math.floor(6000 + Math.random() * 3000)}`,
        title: title.trim(),
        domain,
        district: user?.district || "Ranchi",
        date: "Just now",
        status: "Submitted",
        progress: 10,
        description: description.trim(),
        upvotes: 1,
      };
      setSubmissions([newSub, ...submissions]);
      setIsSubmitting(false);
      setIsReportModalOpen(false);
      setTitle("");
      setDescription("");
      toast.success(`Grassroots challenge "${newSub.title}" submitted to State AI Routing System.`);
    }, 400);
  };

  const handleToggleUpvote = (id: string) => {
    setCommunityIssues(
      communityIssues.map((c) => {
        if (c.id === id) {
          const nextState = !c.hasUpvoted;
          toast.info(nextState ? `Upvoted challenge "${c.title}"` : `Upvote removed for "${c.title}"`);
          return {
            ...c,
            upvotes: nextState ? c.upvotes + 1 : c.upvotes - 1,
            hasUpvoted: nextState,
          };
        }
        return c;
      })
    );
  };

  const pendingCount = submissions.filter((s) => s.status === "Submitted" || s.status === "Under Review").length;
  const inProgressCount = submissions.filter((s) => s.status === "Assigned to University" || s.status === "In Progress").length;
  const resolvedCount = submissions.filter((s) => s.status === "Resolved & Deployed").length;

  return (
    <div className="p-6 sm:p-8 space-y-6 animate-in fade-in">
      {/* Top Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Citizen Problem Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Welcome, <strong>{citizenName}</strong>. Report local civic, agricultural, and environmental problems for automatic triage to Jharkhand university R&amp;D labs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsReportModalOpen(true)}
          className="px-4 py-2 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-2xs cursor-pointer flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Report New Challenge</span>
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "My Reported Challenges", value: submissions.length },
          { label: "Pending AI Triage", value: pendingCount },
          { label: "Active in HEI Labs", value: inProgressCount },
          { label: "Resolved & Deployed", value: resolvedCount },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-300/80 p-5 rounded-sm shadow-2xs">
            <div className="text-xs font-bold text-slate-700">{stat.label}</div>
            <div className="text-3xl font-black text-slate-900 mt-2 font-mono">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Main Content Area based on activeTab */}
      {(activeTab === "overview" || activeTab === "submissions") && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Reported Community Problems &amp; Lifecycle Progress
            </h2>
            <span className="text-xs text-slate-500 font-mono">{submissions.length} Total Records</span>
          </div>

          {submissions.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-sm shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-slate-900">No Grassroots Challenges Reported Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                Have a civic, agricultural, water, or public service problem in your panchayat? Click below to report a challenge directly to state university R&amp;D labs.
              </p>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="px-4 py-2 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer"
              >
                + Report New Challenge
              </button>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Challenge Title</th>
                    <th className="py-3 px-4">Domain</th>
                    <th className="py-3 px-4">Assigned University Lab</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{sub.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{sub.title}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{sub.description}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">{sub.domain}</td>
                      <td className="py-3.5 px-4 text-purple-800 font-semibold">
                        {sub.assignedHEI || "AI Triage In Progress"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            sub.status === "Resolved & Deployed"
                              ? "bg-emerald-100 text-emerald-800"
                              : sub.status === "In Progress"
                              ? "bg-purple-100 text-purple-800"
                              : sub.status === "Assigned to University"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedSubmission(sub)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                        >
                          Inspect →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Community District Feed */}
      {(activeTab === "community" || activeTab === "overview") && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Community Issues in {citizenDistrict}
              </h2>
              <p className="text-xs text-slate-500">Upvote common issues to accelerate university team matching</p>
            </div>
          </div>

          {communityIssues.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-sm shadow-2xs">
              <p className="text-xs text-slate-500">
                No active community issues in {citizenDistrict}. Submissions from your block will appear here for collective community upvoting.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {communityIssues.map((issue) => (
                <div key={issue.id} className="p-4 bg-white border border-slate-200 rounded-sm shadow-2xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {issue.domain}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleUpvote(issue.id)}
                      className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        issue.hasUpvoted
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                      </svg>
                      <span>{issue.upvotes}</span>
                    </button>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{issue.title}</h3>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span>{issue.district}</span>
                    <span>By {issue.author}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Report New Challenge */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-md max-w-lg w-full p-6 shadow-2xl border border-slate-300 relative max-h-[90vh] overflow-y-auto text-xs">
            <button
              type="button"
              onClick={() => setIsReportModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-base font-black text-slate-900">Report Grassroots Challenge</h3>
            <p className="text-slate-500 mt-1">
              Submit a civic, agricultural, water, or health problem. AI will cluster and route it to relevant university capstone teams.
            </p>

            <form onSubmit={handleCreateChallenge} className="mt-4 space-y-3.5 font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Problem Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tube-well drinking water salinity in block"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900 outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Domain Classification:</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900 outline-none focus:border-slate-500"
                >
                  {OFFICIAL_RESEARCH_DOMAINS.map((d, i) => (
                    <option key={i} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Location / Gram Panchayat:</label>
                <input
                  type="text"
                  value={locationPin}
                  onChange={(e) => setLocationPin(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900 outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Detailed Description:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the issue, affected residents, and urgency..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900 outline-none focus:border-slate-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Submitting..." : "Submit to State AI Routing System →"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Inspect Submission Detail */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-md max-w-lg w-full p-6 shadow-2xl border border-slate-300 relative max-h-[90vh] overflow-y-auto text-xs space-y-4">
            <button
              type="button"
              onClick={() => setSelectedSubmission(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {selectedSubmission.id}
                </span>
                <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {selectedSubmission.domain}
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900">{selectedSubmission.title}</h3>
            </div>

            <p className="text-slate-600 bg-slate-50 p-3 rounded border border-slate-100">
              {selectedSubmission.description}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Lifecycle Status</span>
                <strong className="text-slate-900">{selectedSubmission.status}</strong>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Assigned University</span>
                <strong className="text-purple-800">{selectedSubmission.assignedHEI || "AI Triage Underway"}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedSubmission(null)}
              className="w-full py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
