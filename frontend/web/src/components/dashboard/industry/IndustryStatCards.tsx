"use client";

import React from "react";
import { IndustryStatCards as IndustryStatCardsType } from "@/modules/industry/types/industryDashboard";

interface IndustryStatCardsProps {
  stats: IndustryStatCardsType;
  isLoading?: boolean;
}

export function IndustryStatCards({ stats, isLoading }: IndustryStatCardsProps) {
  const committedAmount = stats?.csrCapitalCommittedFormatted || "₹0";
  const disbursedAmount = stats?.csrCapitalDisbursedFormatted || "₹0";
  const activePilots = stats?.activeCoFundedPilotsCount ?? 0;
  const pendingMilestones = stats?.pendingMilestonesCount ?? 0;
  const testbeds = stats?.testbedsSponsoredCount ?? 0;
  const districts = stats?.districtsCoveredCount ?? 0;
  const beneficiaries = (stats?.estimatedBeneficiariesCount ?? 0).toLocaleString("en-IN");
  const compliance = stats?.csrCompliance || {
    csr1Status: "VALIDATED",
    annualBudget: 0,
    commitmentPercentage: 0,
    mcaFilingStatus: "ON_TRACK",
    complianceScore: 100,
  };

  const disbursementProgress =
    stats?.csrCapitalCommitted && stats.csrCapitalCommitted > 0
      ? Math.min(100, Math.round(((stats.csrCapitalDisbursed || 0) / stats.csrCapitalCommitted) * 100))
      : 0;

  const cards = [
    {
      title: "CSR Capital Committed",
      value: committedAmount,
      subValue: `Disbursed: ${disbursedAmount}`,
      subBadge: `${compliance.commitmentPercentage || 0}% Allocated`,
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      accentBorder: "border-l-emerald-600",
      icon: (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      meterValue: disbursementProgress,
      meterLabel: "Disbursement Progress",
    },
    {
      title: "Active Co-Funded Pilots",
      value: `${activePilots} Projects`,
      subValue: `${pendingMilestones} Milestone Approvals Pending`,
      subBadge: pendingMilestones > 0 ? "Action Required" : "All Clear",
      badgeColor: pendingMilestones > 0 ? "bg-amber-50 text-amber-900 border-amber-200" : "bg-slate-100 text-slate-700 border-slate-200",
      accentBorder: "border-l-indigo-600",
      icon: (
        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      meterValue: activePilots > 0 ? (pendingMilestones === 0 ? 100 : 50) : 0,
      meterLabel: "Pilot Milestones Completed",
    },
    {
      title: "Testbeds Sponsored",
      value: `${testbeds} Locations`,
      subValue: `${districts} Districts • ${beneficiaries} Citizens`,
      subBadge: "Grassroots Deployment",
      badgeColor: "bg-cyan-50 text-cyan-900 border-cyan-200",
      accentBorder: "border-l-cyan-600",
      icon: (
        <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      meterValue: Math.round((districts / 24) * 100),
      meterLabel: `Jharkhand State Coverage (${districts}/24)`,
    },
    {
      title: "MCA CSR-1 Compliance",
      value: `${compliance.complianceScore || 100}%`,
      subValue: `Status: ${compliance.csr1Status} • Filing: ${compliance.mcaFilingStatus}`,
      subBadge: "Schedule VII Validated",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      accentBorder: "border-l-amber-600",
      icon: (
        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      meterValue: compliance.complianceScore || 100,
      meterLabel: "MCA Audit Readiness Score",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-slate-200 p-5 rounded-md shadow-xs animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-slate-300 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-5/6"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`bg-white border border-slate-200/90 border-l-4 ${card.accentBorder} p-5 rounded-md shadow-xs hover:shadow-md transition-all flex flex-col justify-between`}
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {card.title}
              </span>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex-shrink-0">
                {card.icon}
              </div>
            </div>

            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                {card.value}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between gap-1 flex-wrap">
              <span className="text-[11px] font-medium text-slate-600 truncate max-w-[180px]">
                {card.subValue}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                {card.subBadge}
              </span>
            </div>
          </div>

          {/* Micro Progress Gauge */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex justify-between text-[10px] font-medium text-slate-500 mb-1">
              <span>{card.meterLabel}</span>
              <span className="font-bold text-slate-700">{card.meterValue}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-slate-900 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${card.meterValue}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
