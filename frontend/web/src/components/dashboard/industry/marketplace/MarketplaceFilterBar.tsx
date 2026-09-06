"use client";

import React from "react";
import {
  MarketplaceFilterState,
  MarketplaceMeta,
  MarketplaceSortOption,
} from "@/modules/industry/types/marketplace";

interface MarketplaceFilterBarProps {
  filters: MarketplaceFilterState;
  meta: MarketplaceMeta;
  totalResults: number;
  onSetDomain: (domain: string) => void;
  onSetStage: (stage: string) => void;
  onSetUniversity: (university: string) => void;
  onSetFundingRange: (range: string) => void;
  onSetSearch: (search: string) => void;
  onSetSortBy: (sortBy: MarketplaceSortOption) => void;
  onResetFilters: () => void;
}

const DOMAIN_OPTIONS = [
  { id: "All", label: "All Sectors" },
  { id: "AGRICULTURE", label: "Agriculture" },
  { id: "WATER", label: "Water & Sanitation" },
  { id: "HEALTH", label: "Healthcare" },
  { id: "ELECTRICITY", label: "Clean Energy" },
  { id: "EDUCATION", label: "EdTech & Skilling" },
  { id: "ROADS_AND_TRANSPORT", label: "Infrastructure" },
];

const STAGE_OPTIONS = [
  { id: "All", label: "All Stages" },
  { id: "PROTOTYPE", label: "Prototype" },
  { id: "NEEDS_FUNDING", label: "Needs Funding" },
  { id: "NEEDS_MENTOR", label: "Needs Mentor" },
  { id: "READY_FOR_TESTBED", label: "Ready for Testbed" },
];

const FUNDING_RANGE_OPTIONS = [
  { id: "ALL", label: "All Budget Ranges" },
  { id: "UNDER_5L", label: "Under ₹5 Lakhs" },
  { id: "5L_25L", label: "₹5L – ₹25 Lakhs" },
  { id: "25L_50L", label: "₹25L – ₹50 Lakhs" },
  { id: "ABOVE_50L", label: "Above ₹50 Lakhs" },
];

const SORT_OPTIONS: { id: MarketplaceSortOption; label: string }[] = [
  { id: "NEWEST", label: "Newest First" },
  { id: "FUNDING_ASK_HIGH", label: "Highest Budget Ask" },
  { id: "FUNDING_ASK_LOW", label: "Lowest Budget Ask" },
  { id: "MOST_COMMITTED", label: "Most Co-Funded" },
  { id: "CLOSING_SOON", label: "Closing Soon" },
];

export function MarketplaceFilterBar({
  filters,
  meta,
  totalResults,
  onSetDomain,
  onSetStage,
  onSetUniversity,
  onSetFundingRange,
  onSetSearch,
  onSetSortBy,
  onResetFilters,
}: MarketplaceFilterBarProps) {
  const hasActiveFilters =
    filters.domain !== "All" ||
    filters.stage !== "All" ||
    filters.university !== "All" ||
    filters.fundingRange !== "ALL" ||
    filters.search.trim().length > 0;

  return (
    <div className="bg-white border border-slate-200/90 rounded-lg p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top Row: Search Input + Sorting Selector + Result Count */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search prototypes, faculty PIs, or technical abstracts..."
            value={filters.search}
            onChange={(e) => onSetSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-slate-400 transition-all"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onSetSearch("")}
              className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Right Controls: Sort Option & Match Badge */}
        <div className="flex items-center gap-3 self-end md:self-auto flex-wrap">
          <span className="text-xs text-slate-500 font-medium">
            Found <strong className="text-slate-900 font-bold">{totalResults}</strong> matching proposals
          </span>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sort:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => onSetSortBy(e.target.value as MarketplaceSortOption)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Middle Row: Domain Sector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {DOMAIN_OPTIONS.map((dom) => {
          const isActive = filters.domain === dom.id;
          const count = dom.id === "All" ? meta.totalPublishedProjects : meta.sectorCounts[dom.id] || 0;

          return (
            <button
              key={dom.id}
              type="button"
              onClick={() => onSetDomain(dom.id)}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span>{dom.label}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? "bg-slate-800 text-slate-200" : "bg-slate-200/70 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Dropdowns Row: Stage, University, Funding Range */}
      <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 text-xs">
        {/* Stage Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5">
          <span className="text-[11px] font-bold text-slate-400">Stage:</span>
          <select
            value={filters.stage}
            onChange={(e) => onSetStage(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
          >
            {STAGE_OPTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* University Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5">
          <span className="text-[11px] font-bold text-slate-400">University:</span>
          <select
            value={filters.university}
            onChange={(e) => onSetUniversity(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer max-w-[180px] truncate"
          >
            <option value="All">All Universities (HEIs)</option>
            {meta.availableUniversities?.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        {/* Budget Range Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5">
          <span className="text-[11px] font-bold text-slate-400">Budget:</span>
          <select
            value={filters.fundingRange}
            onChange={(e) => onSetFundingRange(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
          >
            {FUNDING_RANGE_OPTIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-bold transition-all cursor-pointer ml-auto"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
