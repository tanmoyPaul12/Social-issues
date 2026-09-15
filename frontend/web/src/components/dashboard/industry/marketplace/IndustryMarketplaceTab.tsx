"use client";

import React, { useState } from "react";
import { useMarketplace } from "@/modules/industry/hooks/useMarketplace";
import { MarketplaceProject } from "@/modules/industry/types/marketplace";
import { MarketplaceFilterBar } from "./MarketplaceFilterBar";
import { MarketplaceProjectCard } from "./MarketplaceProjectCard";
import { CommitFundingModal } from "./CommitFundingModal";
import { OfferMentorshipModal } from "./OfferMentorshipModal";
import { ProjectDossierModal } from "./ProjectDossierModal";
import { useIndustryPitchStore } from "@/lib/store/useIndustryPitchStore";
import { toast } from "@/components/dashboard/ToastStack";

interface IndustryMarketplaceTabProps {
  onNavigateTab?: (tabId: string) => void;
}

export function IndustryMarketplaceTab({ onNavigateTab }: IndustryMarketplaceTabProps) {
  const {
    projects,
    totalElements,
    totalPages,
    meta,
    filters,
    isLoading,
    isFiltering,
    error,
    setDomain,
    setStage,
    setUniversity,
    setFundingRange,
    setSearch,
    setSortBy,
    setPage,
    resetFilters,
    commitFunding,
    offerMentorship,
    expressInterest,
    refetch,
  } = useMarketplace();

  // Modal States
  const [selectedProject, setSelectedProject] = useState<MarketplaceProject | null>(null);
  const [isCommitOpen, setIsCommitOpen] = useState(false);
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"GRID" | "TABLE">("GRID");

  const handleOpenCommit = (project: MarketplaceProject) => {
    setSelectedProject(project);
    setIsCommitOpen(true);
  };

  const handleOpenMentorship = (project: MarketplaceProject) => {
    setSelectedProject(project);
    setIsMentorOpen(true);
  };

  const handleOpenInterest = async (project: MarketplaceProject) => {
    await expressInterest(project.id, {
      pilotInterestScope: "General R&D Collaboration & Testbed Evaluation",
    });
  };

  const handleCommitFundingWrapper = async (projectId: number, payload: any) => {
    const success = await commitFunding(projectId, payload);
    if (selectedProject) {
      useIndustryPitchStore.getState().addCoFundedProject({
        projectId: selectedProject.id,
        title: selectedProject.title,
        university: selectedProject.universityName,
        leadInvestigator: selectedProject.leadFacultyMentor || "Faculty Lead PI",
        grantCommitted: `₹${(payload.grantAmount || 500000).toLocaleString("en-IN")}`,
        disbursedAmount: `₹${Math.round((payload.grantAmount || 500000) * 0.33).toLocaleString("en-IN")} (Tranche 1)`,
        domain: selectedProject.sectorName || selectedProject.sector || "R&D Innovation",
        district: selectedProject.targetDistrict || "Jharkhand",
        stage: "Prototyping",
        progress: 30,
        csrScheduleVII: payload.csrScheduleViiHead || "Schedule VII CSR Provision",
      });

      toast.success(`Grant commitment signed for "${selectedProject.title}"! Project added to My Co-Funded Projects.`);
      if (onNavigateTab) {
        onNavigateTab("collaborations");
      }
    }
    return success;
  };

  const handleOpenDossier = (project: MarketplaceProject) => {
    setSelectedProject(project);
    setIsDossierOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              University R&amp;D Marketplace
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
              Academic Innovation Hub
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Browse verified capstone prototypes, commit Schedule VII CSR grants, and sponsor grassroots field pilots.
          </p>
        </div>

        {/* View Mode Toggle + Sync */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Grid / Table Toggle */}
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200/60">
            <button
              type="button"
              onClick={() => setViewMode("GRID")}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === "GRID" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Card Grid View"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("TABLE")}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === "TABLE" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Table Ledger View"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Sync Button */}
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFiltering}
            title="Refresh marketplace proposals"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs active:scale-95 transition-all cursor-pointer"
          >
            <svg
              className={`w-3.5 h-3.5 ${isFiltering ? "animate-spin text-slate-900" : "text-slate-500"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <MarketplaceFilterBar
        filters={filters}
        meta={meta}
        totalResults={totalElements}
        onSetDomain={setDomain}
        onSetStage={setStage}
        onSetUniversity={setUniversity}
        onSetFundingRange={setFundingRange}
        onSetSearch={setSearch}
        onSetSortBy={setSortBy}
        onResetFilters={resetFilters}
      />

      {/* Error Message if Any */}
      {error && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => refetch()} className="font-bold underline hover:text-amber-950 cursor-pointer">
            Retry Connection
          </button>
        </div>
      )}

      {/* Main Content Area: Loading vs Empty vs Grid / Table */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-6 bg-slate-300 rounded w-3/4"></div>
              <div className="h-16 bg-slate-100 rounded w-full"></div>
              <div className="h-8 bg-slate-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 sm:p-16 text-center bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 border border-amber-200/60 shadow-2xs">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-slate-900">No R&amp;D Proposals Match Current Filters</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            There are currently no academic research projects registered under these criteria. Try adjusting your sector or stage filters, or reset filters to browse all proposals.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      ) : viewMode === "GRID" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => (
            <MarketplaceProjectCard
              key={project.id}
              project={project}
              onOpenCommit={handleOpenCommit}
              onOpenMentorship={handleOpenMentorship}
              onOpenInterest={handleOpenInterest}
              onOpenDossier={handleOpenDossier}
            />
          ))}
        </div>
      ) : (
        /* Table Ledger View */
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Project Title &amp; Abstract</th>
                <th className="py-3.5 px-4">Domain</th>
                <th className="py-3.5 px-4">Host Institution</th>
                <th className="py-3.5 px-4">Stage</th>
                <th className="py-3.5 px-4">Budget Ask</th>
                <th className="py-3.5 px-4">Co-Funded</th>
                <th className="py-3.5 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {projects.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 max-w-sm">
                    <div
                      onClick={() => handleOpenDossier(item)}
                      className="font-bold text-slate-900 hover:text-indigo-900 cursor-pointer"
                    >
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{item.abstractDescription}</div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-700">{item.sectorName}</td>
                  <td className="py-3.5 px-4 text-slate-800">{item.universityName}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                      {item.stageLabel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{item.fundingAskFormatted}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                    {item.fundingCommittedFormatted} ({item.fundedPercentage}%)
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenCommit(item)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                    >
                      Commit CSR →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
          <span className="text-slate-500">
            Page <strong className="text-slate-900">{filters.page + 1}</strong> of <strong>{totalPages}</strong>
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              disabled={filters.page === 0}
              onClick={() => setPage(filters.page - 1)}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 font-bold transition-all cursor-pointer"
            >
              ← Previous
            </button>
            <button
              type="button"
              disabled={filters.page >= totalPages - 1}
              onClick={() => setPage(filters.page + 1)}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 font-bold transition-all cursor-pointer"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Workflow Modals */}
      <CommitFundingModal
        project={selectedProject}
        isOpen={isCommitOpen}
        onClose={() => setIsCommitOpen(false)}
        onSubmit={handleCommitFundingWrapper}
      />

      <OfferMentorshipModal
        project={selectedProject}
        isOpen={isMentorOpen}
        onClose={() => setIsMentorOpen(false)}
        onSubmit={offerMentorship}
      />

      <ProjectDossierModal
        project={selectedProject}
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        onOpenCommit={handleOpenCommit}
        onOpenMentorship={handleOpenMentorship}
      />
    </div>
  );
}
