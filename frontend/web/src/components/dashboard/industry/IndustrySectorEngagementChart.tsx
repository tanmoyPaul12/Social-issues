"use client";

import React, { useState } from "react";
import { SectorEngagement } from "@/modules/industry/types/industryDashboard";

interface IndustrySectorEngagementChartProps {
  sectorData: SectorEngagement[];
  totalCommittedFormatted?: string;
}

const SECTOR_COLOR_MAP: Record<string, { bar: string; ring: string; badge: string; text: string; stroke: string }> = {
  AGRICULTURE: {
    bar: "bg-emerald-500",
    ring: "text-emerald-500",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    text: "text-emerald-700",
    stroke: "#10b981",
  },
  WATER_MANAGEMENT: {
    bar: "bg-blue-500",
    ring: "text-blue-500",
    badge: "bg-blue-50 text-blue-800 border-blue-200",
    text: "text-blue-700",
    stroke: "#3b82f6",
  },
  RENEWABLE_ENERGY: {
    bar: "bg-amber-500",
    ring: "text-amber-500",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
    text: "text-amber-700",
    stroke: "#f59e0b",
  },
  HEALTHCARE: {
    bar: "bg-rose-500",
    ring: "text-rose-500",
    badge: "bg-rose-50 text-rose-800 border-rose-200",
    text: "text-rose-700",
    stroke: "#f43f5e",
  },
  EDUCATION: {
    bar: "bg-indigo-500",
    ring: "text-indigo-500",
    badge: "bg-indigo-50 text-indigo-800 border-indigo-200",
    text: "text-indigo-700",
    stroke: "#6366f1",
  },
  RURAL_INFRASTRUCTURE: {
    bar: "bg-violet-500",
    ring: "text-violet-500",
    badge: "bg-violet-50 text-violet-800 border-violet-200",
    text: "text-violet-700",
    stroke: "#8b5cf6",
  },
  OTHER: {
    bar: "bg-slate-500",
    ring: "text-slate-500",
    badge: "bg-slate-100 text-slate-800 border-slate-200",
    text: "text-slate-700",
    stroke: "#64748b",
  },
};

export function IndustrySectorEngagementChart({
  sectorData,
  totalCommittedFormatted = "₹0",
}: IndustrySectorEngagementChartProps) {
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);

  const data = sectorData || [];
  const totalProjects = data.reduce((acc, curr) => acc + (curr.projectCount || 0), 0);

  // Compute SVG Donut segments
  let cumulativeOffset = 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // ~251.32

  return (
    <div className="bg-white border border-slate-200/90 rounded-lg p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Domain-Wise CSR Engagement
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80">
              Schedule VII Analysis
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Sectors receiving highest academic co-funding &amp; pilot testbed sponsorship
          </p>
        </div>

        <div className="self-start sm:self-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-600">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total:</span>
            <span className="font-mono font-bold text-emerald-700">{totalCommittedFormatted}</span>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="py-12 text-center text-slate-500 space-y-2 flex-1 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <h4 className="text-xs font-bold text-slate-800">No Domain Allocations Yet</h4>
          <p className="text-xs text-slate-500 max-w-sm">
            As you commit CSR funding to university capstone projects, sector-wise breakdown will appear here in real-time.
          </p>
        </div>
      ) : (
        /* Main Visual: Donut Chart + Horizontal Allocation Bars */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 items-center">
          {/* Left: SVG Donut Visual */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50/60 rounded-lg border border-slate-100">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="text-slate-200"
                  strokeWidth="12"
                  stroke="currentColor"
                  fill="transparent"
                />
                {/* Sector segments */}
                {data.map((item, idx) => {
                  const strokeDash = (item.percentage / 100) * circumference;
                  const strokeDashoffset = -cumulativeOffset;
                  cumulativeOffset += strokeDash;
                  const color = SECTOR_COLOR_MAP[item.sector] || SECTOR_COLOR_MAP.OTHER;
                  const isHovered = hoveredSector === item.sector;

                  return (
                    <circle
                      key={idx}
                      cx="50"
                      cy="50"
                      r={radius}
                      stroke={color.stroke}
                      strokeWidth={isHovered ? "15" : "12"}
                      strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
                      strokeDashoffset={strokeDashoffset}
                      fill="transparent"
                      className="transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setHoveredSector(item.sector)}
                      onMouseLeave={() => setHoveredSector(null)}
                    />
                  );
                })}
              </svg>

              {/* Donut Center Metrics */}
              <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-xl font-black text-slate-900 font-mono">
                  {totalProjects}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                  Active Pilots
                </span>
              </div>
            </div>

            <div className="mt-3 text-center">
              <span className="text-[11px] font-medium text-slate-500">
                {hoveredSector
                  ? data.find((d) => d.sector === hoveredSector)?.sectorName || "Dominant Sector"
                  : "Hover sector for telemetry"}
              </span>
            </div>
          </div>

          {/* Right: Detailed Sector Allocation Meters */}
          <div className="lg:col-span-8 space-y-3.5">
            {data.map((item, idx) => {
              const color = SECTOR_COLOR_MAP[item.sector] || SECTOR_COLOR_MAP.OTHER;
              const isHovered = hoveredSector === item.sector;
              const amountInLakhs = (item.committedAmount / 100000).toFixed(1);

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredSector(item.sector)}
                  onMouseLeave={() => setHoveredSector(null)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isHovered
                      ? "bg-slate-50 border-slate-300 shadow-2xs"
                      : "bg-white border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${color.bar}`} />
                      <span className="font-bold text-slate-800">{item.sectorName}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${color.badge}`}>
                        {item.projectCount} {item.projectCount === 1 ? "Project" : "Projects"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 font-mono">
                      <span className="font-bold text-slate-900">₹{amountInLakhs} L</span>
                      <span className={`font-black text-xs ${color.text}`}>
                        {item.percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Meter Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${color.bar}`}
                      style={{ width: `${Math.max(4, item.percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
