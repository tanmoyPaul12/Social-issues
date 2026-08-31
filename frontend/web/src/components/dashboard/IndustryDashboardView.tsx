"use client";

import React, { useState } from "react";
import { OFFICIAL_RESEARCH_DOMAINS } from "@/app/page";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "@/components/dashboard/ToastStack";

import { IndustryOverviewTab } from "./industry/IndustryOverviewTab";
import { IndustryMarketplaceTab } from "./industry/marketplace/IndustryMarketplaceTab";
import { ActivePilotsTab } from "./industry/pilots/ActivePilotsTab";
import { CsrComplianceTab } from "./industry/csr/CsrComplianceTab";
import { CompanySettingsTab } from "./industry/settings/CompanySettingsTab";

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
  onNavigateTab?: (tabId: string) => void;
}

export function IndustryDashboardView({
  activeTab = "overview",
  onNavigateTab,
}: IndustryDashboardViewProps) {
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

  const handleNavigate = (tab: string) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
    }
  };

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

  return (
    <div className="p-6 sm:p-8 space-y-6 animate-in fade-in">
      {/* Top Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Industry &amp; CSR Co-Funding Portal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Section 135 MCA Compliance Dashboard • Public-Private University R&amp;D Testbeds
          </p>
        </div>

        {/* Corporate Status Chip */}
        <button
          type="button"
          onClick={() => handleNavigate("settings")}
          className="flex items-center gap-2.5 bg-white border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/80 px-3.5 py-2 rounded-xl shadow-2xs transition-all cursor-pointer text-left"
          title="Click to view & edit Corporate Profile & Team Settings"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="text-right">
            <span className="text-xs font-bold text-slate-800 block leading-none">{companyName}</span>
            <span className="text-[10px] text-slate-400 font-mono">{corporateId}</span>
          </div>
          <svg className="w-3.5 h-3.5 text-slate-400 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Tab 1: Dashboard Overview */}
      {activeTab === "overview" && (
        <IndustryOverviewTab onNavigateTab={handleNavigate} />
      )}

      {/* Tab 2: University R&D Marketplace */}
      {activeTab === "marketplace" && (
        <IndustryMarketplaceTab onNavigateTab={handleNavigate} />
      )}

      {/* Tab 3: Active Co-Funded Projects & Testbeds */}
      {(activeTab === "engagements" || activeTab === "testbeds") && (
        <ActivePilotsTab onNavigateTab={handleNavigate} />
      )}

      {/* Tab 4: CSR Compliance & Statutory Ledger */}
      {activeTab === "csr" && (
        <CsrComplianceTab onNavigateTab={handleNavigate} />
      )}

      {/* Tab 7: Company Profile & Corporate Settings */}
      {(activeTab === "settings" || activeTab === "profile") && (
        <CompanySettingsTab onNavigateTab={handleNavigate} />
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
