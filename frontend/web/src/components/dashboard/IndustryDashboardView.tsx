"use client";

import React, { useState } from "react";
import { OFFICIAL_RESEARCH_DOMAINS } from "@/app/page";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "@/components/dashboard/ToastStack";

interface CoFundedEngagement {
  id: string;
  projectTitle: string;
  domain: string;
  university: string;
  leadInvestigator: string;
  grantCommitted: string;
  disbursedAmount: string;
  stage: "Prototyping" | "Field Pilot" | "Scaling";
  progress: number;
  csrScheduleVII: string;
}

interface MarketplaceProject {
  id: string;
  title: string;
  domain: string;
  university: string;
  stage: string;
  requiredFunding: string;
  coFunders: string;
  summary: string;
}

interface IndustryDashboardViewProps {
  activeTab?: string;
}

export function IndustryDashboardView({ activeTab = "overview" }: IndustryDashboardViewProps) {
  const { user } = useAuthStore();
  const companyName = user?.orgName || "Corporate CSR Partner";
  const corporateId = user?.gstin ? `GSTIN: ${user.gstin}` : (user?.cinNumber ? `CIN: ${user.cinNumber}` : "Verified CSR Partner");

  const [selectedDomainFilter, setSelectedDomainFilter] = useState("All");
  const [engagements, setEngagements] = useState<CoFundedEngagement[]>([]);
  const [marketplaceProjects] = useState<MarketplaceProject[]>([]);
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);
  const [selectedMktProject, setSelectedMktProject] = useState<MarketplaceProject | null>(null);

  // Commit form state
  const [commitAmount, setCommitAmount] = useState("₹15,00,000");
  const [mentorNominee, setMentorNominee] = useState(user?.name ? `${user.name} (${user.designation || "CSR SPOC"})` : "Corporate Mentor");

  const handleOpenCommit = (proj: MarketplaceProject) => {
    setSelectedMktProject(proj);
    setIsCommitModalOpen(true);
  };

  const handleConfirmCommit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMktProject) return;

    const newEng: CoFundedEngagement = {
      id: `CSR-ENG-0${engagements.length + 1}`,
      projectTitle: selectedMktProject.title,
      domain: selectedMktProject.domain,
      university: selectedMktProject.university,
      leadInvestigator: "Faculty Lead",
      grantCommitted: commitAmount,
      disbursedAmount: "₹5,00,000 (Tranche 1)",
      stage: "Prototyping",
      progress: 30,
      csrScheduleVII: "Item (ix) - Contribution to Public Funded Universities & Incubators",
    };

    setEngagements([newEng, ...engagements]);
    setIsCommitModalOpen(false);
    setSelectedMktProject(null);
    toast.success(`Grant commitment signed for "${newEng.projectTitle}" (${newEng.grantCommitted})`);
  };

  const filteredMarketplace = selectedDomainFilter === "All"
    ? marketplaceProjects
    : marketplaceProjects.filter((p) => p.domain === selectedDomainFilter);

  return (
    <div className="p-6 sm:p-8 space-y-6 animate-in fade-in">
      {/* Top Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Industry &amp; CSR Co-Funding Portal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Welcome, <strong>{companyName}</strong>. Browse university research innovations, commit CSR co-funding, and sponsor grassroots pilot deployments across Jharkhand.
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <span className="text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded">
            {companyName} • {corporateId}
          </span>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "CSR Capital Committed", value: engagements.length > 0 ? `₹${(engagements.length * 15.0).toFixed(1)}L` : "₹0.0L" },
          { label: "Active Co-Funded Pilots", value: engagements.length },
          { label: "Testbeds Sponsored", value: engagements.length > 0 ? `${engagements.length} Locations` : "0 Locations" },
          { label: "MCA CSR-1 Compliance", value: "Verified" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-300/80 p-5 rounded-sm shadow-2xs">
            <div className="text-xs font-bold text-slate-700">{stat.label}</div>
            <div className="text-3xl font-black text-slate-900 mt-2 font-mono">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Main Content Area based on activeTab */}
      {(activeTab === "overview" || activeTab === "marketplace") && (
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                University R&amp;D Marketplace ({filteredMarketplace.length})
              </h2>
              <p className="text-xs text-slate-500">Filter projects by domain to commit CSR grants and sponsor testbeds</p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center flex-wrap gap-1.5">
              {["All", ...OFFICIAL_RESEARCH_DOMAINS.slice(0, 5)].map((dom) => (
                <button
                  key={dom}
                  type="button"
                  onClick={() => setSelectedDomainFilter(dom)}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    selectedDomainFilter === dom
                      ? "bg-slate-900 text-white"
                      : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {dom}
                </button>
              ))}
            </div>
          </div>

          {filteredMarketplace.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-sm shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-slate-900">No Marketplace Projects in Queue</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                As academic institutions register innovative capstone prototypes requiring industry validation, they will be listed here for co-funding sponsorship.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Project Title</th>
                    <th className="py-3 px-4">Domain</th>
                    <th className="py-3 px-4">Host University</th>
                    <th className="py-3 px-4">Stage</th>
                    <th className="py-3 px-4">Required Budget</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredMarketplace.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{item.title}</div>
                        <div className="text-[11px] text-slate-500 max-w-xs truncate">{item.summary}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">{item.domain}</td>
                      <td className="py-3.5 px-4 text-slate-800">{item.university}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                          {item.stage}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{item.requiredFunding}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenCommit(item)}
                          className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                        >
                          Commit Grant →
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

      {/* Engagements Tab */}
      {(activeTab === "engagements" || activeTab === "testbeds") && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Active Co-Funded Projects &amp; Testbeds ({engagements.length})
          </h2>

          {engagements.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-sm shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-slate-900">No Active Co-Funded Engagements</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Browse university R&amp;D innovations in the Marketplace to commit CSR co-funding and sponsor field pilots.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {engagements.map((eng) => (
                <div key={eng.id} className="p-4 bg-white border border-slate-200 rounded-sm shadow-2xs space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">{eng.id}</span>
                        <strong className="text-sm text-slate-900">{eng.projectTitle}</strong>
                      </div>
                      <span className="text-slate-500 mt-0.5 block">{eng.university} • Lead: {eng.leadInvestigator}</span>
                    </div>
                    <div className="text-right font-mono">
                      <strong className="text-emerald-700 text-sm block">{eng.grantCommitted}</strong>
                      <span className="text-slate-400 text-[10px]">Disbursed: {eng.disbursedAmount}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span>{eng.csrScheduleVII}</span>
                    <span className="font-bold text-slate-800">Progress: {eng.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CSR Compliance Tab */}
      {activeTab === "csr" && (
        <div className="space-y-4 pt-2 max-w-2xl">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            MCA Form CSR-1 Compliance &amp; Audit Trail
          </h2>

          <div className="bg-white border border-slate-200 rounded-sm p-4 space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Corporate Name:</span>
              <strong className="text-slate-900">{companyName}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Corporate Registration:</span>
              <strong className="text-slate-900 font-mono">{corporateId}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Eligible Head:</span>
              <strong className="text-slate-900">Schedule VII Item (ix) - Public Funded Universities</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Audited CSR Spend:</span>
              <strong className="text-emerald-700 font-mono text-sm">
                {engagements.length > 0 ? `₹${(engagements.length * 15.0).toFixed(1)} Lakhs Disbursed` : "₹0.0 Disbursed"}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Commit Grant */}
      {isCommitModalOpen && selectedMktProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-md max-w-lg w-full p-6 shadow-2xl border border-slate-300 relative max-h-[90vh] overflow-y-auto text-xs">
            <button
              type="button"
              onClick={() => setIsCommitModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-base font-black text-slate-900">Commit CSR Co-Funding</h3>
            <p className="text-slate-500 mt-1">
              Co-fund <strong>{selectedMktProject.title}</strong> at <strong>{selectedMktProject.university}</strong>.
            </p>

            <form onSubmit={handleConfirmCommit} className="mt-4 space-y-3.5 font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Grant Amount to Commit:</label>
                <input
                  type="text"
                  value={commitAmount}
                  onChange={(e) => setCommitAmount(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900 font-mono font-bold outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Nominate Corporate Mentor:</label>
                <input
                  type="text"
                  value={mentorNominee}
                  onChange={(e) => setMentorNominee(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900 outline-none focus:border-slate-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all cursor-pointer"
              >
                Sign Tripartite Grant Commitment →
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
