"use client";

import React, { useState } from "react";
import { useActivePilots } from "@/modules/industry/hooks/useActivePilots";
import { ActivePilotSummary, ActivePilotsSortOption } from "@/modules/industry/types/activePilots";
import { PilotsOverviewStats } from "./PilotsOverviewStats";
import { ActivePilotCard } from "./ActivePilotCard";
import { PilotDetailDossierModal } from "./PilotDetailDossierModal";

import { useIndustryPitchStore } from "@/lib/store/useIndustryPitchStore";

interface ActivePilotsTabProps {
  onNavigateTab?: (tabId: string) => void;
}

export function ActivePilotsTab({ onNavigateTab }: ActivePilotsTabProps) {
  const { coFundedProjects } = useIndustryPitchStore();
  const {
    pilots,
    overview,
    selectedDetail,
    setSelectedDetail,
    filters,
    isLoading,
    isFiltering,
    error,
    setStatus,
    setHealthStatus,
    setStage,
    setSearch,
    setSortBy,
    setPage,
    resetFilters,
    loadDetail,
    reviewMilestone,
    releaseDisbursement,
    postDiscussion,
    uploadDocument,
    deleteDocument,
    updateHealth,
    refetch,
  } = useActivePilots();

  const [initialDossierTab, setInitialDossierTab] = useState<
    "milestones" | "disbursements" | "discussions" | "documents"
  >("milestones");

  const handleOpenDossier = async (
    pilot: ActivePilotSummary,
    defaultTab: "milestones" | "disbursements" | "discussions" | "documents" = "milestones"
  ) => {
    setInitialDossierTab(defaultTab);
    await loadDetail(pilot.id);
  };

  const handleReviewShortcut = async (pilot: ActivePilotSummary) => {
    setInitialDossierTab("milestones");
    await loadDetail(pilot.id);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* ── ACCEPTED & CO-FUNDED CSR PROJECTS ── */}
      {coFundedProjects.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Active Co-Funded Projects &amp; CSR Pilots ({coFundedProjects.length})
              </h3>
              <p className="text-xs text-slate-500">
                Institutional R&amp;D innovations co-funded under Schedule VII MCA CSR provisions
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coFundedProjects.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-slate-200 p-5 space-y-3.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {p.stage} • 35% Progress
                    </span>
                    <span className="font-mono text-xs font-black text-indigo-900">
                      {p.grantCommitted}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm leading-snug">{p.title}</h4>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="font-medium text-slate-800">{p.university}</p>
                    <p className="text-[11px] text-slate-500">Lead PI: {p.leadInvestigator}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-slate-500">{p.disbursedAmount}</span>
                  <button
                    type="button"
                    onClick={() => onNavigateTab && onNavigateTab("communication")}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>Open Chat</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1. Header Overview Stats */}
      <PilotsOverviewStats overview={overview} />

      {/* 2. Filter & Search Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search co-funded pilots by title, university, or PI..."
              value={filters.search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50/50 text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:bg-white transition-all"
            />
          </div>

          {/* Controls: Stage & Sort */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Stage selector */}
            <select
              value={filters.stage}
              onChange={(e) => setStage(e.target.value)}
              className="py-2 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 font-semibold outline-none cursor-pointer"
            >
              <option value="ALL">All Development Stages</option>
              <option value="PROPOSAL">Proposal Phase</option>
              <option value="FEASIBILITY">Feasibility Study</option>
              <option value="PROTOTYPING">Prototyping</option>
              <option value="LAB_TESTING">Lab Testing</option>
              <option value="FIELD_TRIAL">Field Trial</option>
              <option value="DEPLOYED">District Deployed</option>
            </select>

            {/* Sort selector */}
            <select
              value={filters.sortBy}
              onChange={(e) => setSortBy(e.target.value as ActivePilotsSortOption)}
              className="py-2 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 font-semibold outline-none cursor-pointer"
            >
              <option value="NEWEST">Sort: Newest First</option>
              <option value="NEXT_DUE">Sort: Next Due Soonest</option>
              <option value="PROGRESS_HIGH">Sort: Progress (High to Low)</option>
              <option value="PROGRESS_LOW">Sort: Progress (Low to High)</option>
              <option value="BUDGET_HIGH">Sort: Budget Committed (High)</option>
            </select>

            {/* Refresh */}
            <button
              type="button"
              onClick={refetch}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              title="Sync latest live updates"
            >
              <svg className={`w-4 h-4 ${isFiltering ? "animate-spin text-indigo-600" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Health Status Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase">Health Filter:</span>

          <button
            type="button"
            onClick={() => setHealthStatus("ALL")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              filters.healthStatus === "ALL"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Health ({overview.totalPilotsCount})
          </button>

          <button
            type="button"
            onClick={() => setHealthStatus("ON_TRACK")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filters.healthStatus === "ON_TRACK"
                ? "bg-emerald-700 text-white"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            On Track
          </button>

          <button
            type="button"
            onClick={() => setHealthStatus("DELAYED")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filters.healthStatus === "DELAYED"
                ? "bg-amber-700 text-white"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Delayed
          </button>

          <button
            type="button"
            onClick={() => setHealthStatus("AT_RISK")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filters.healthStatus === "AT_RISK"
                ? "bg-rose-700 text-white"
                : "bg-rose-50 text-rose-800 hover:bg-rose-100"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            At Risk ({overview.atRiskPilotsCount})
          </button>

          <button
            type="button"
            onClick={() => setHealthStatus("COMPLETED")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filters.healthStatus === "COMPLETED"
                ? "bg-blue-700 text-white"
                : "bg-blue-50 text-blue-800 hover:bg-blue-100"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Completed ({overview.completedPilotsCount})
          </button>

          {(filters.search || filters.stage !== "ALL" || filters.healthStatus !== "ALL") && (
            <button
              type="button"
              onClick={resetFilters}
              className="ml-auto text-xs text-slate-500 hover:text-slate-900 font-bold underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 3. Pilots Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-6 bg-slate-200 rounded w-3/4" />
              <div className="h-12 bg-slate-100 rounded" />
              <div className="h-10 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white border border-rose-200 rounded-xl space-y-2">
          <p className="text-rose-700 font-bold text-xs">{error}</p>
          <button
            type="button"
            onClick={refetch}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs"
          >
            Retry Loading
          </button>
        </div>
      ) : pilots.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-slate-900">No Active Co-Funded Projects Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Browse verified academic R&amp;D innovations in the Marketplace and commit CSR grants to sponsor live testbeds.
          </p>
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab("marketplace")}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer"
            >
              Browse R&amp;D Marketplace
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pilots.map((pilot) => (
            <ActivePilotCard
              key={pilot.id}
              pilot={pilot}
              onOpenDossier={handleOpenDossier}
              onReviewMilestone={handleReviewShortcut}
            />
          ))}
        </div>
      )}

      {/* 4. Deep Project Workspace Dossier Modal */}
      {selectedDetail && (
        <PilotDetailDossierModal
          detail={selectedDetail}
          isOpen={true}
          initialTab={initialDossierTab}
          onClose={() => setSelectedDetail(null)}
          onReviewMilestone={reviewMilestone}
          onReleaseDisbursement={releaseDisbursement}
          onPostDiscussion={postDiscussion}
          onUploadDocument={uploadDocument}
          onDeleteDocument={deleteDocument}
          onUpdateHealth={updateHealth}
        />
      )}
    </div>
  );
}
