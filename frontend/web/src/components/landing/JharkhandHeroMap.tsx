"use client";

import React, { useState } from "react";
import { JHARKHAND_GEO_DISTRICTS, GeoDistrict } from "./jharkhandGeoData";

export function JharkhandHeroMap() {
  const [selectedDistrict, setSelectedDistrict] = useState<GeoDistrict | null>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<GeoDistrict | null>(null);

  const activeDistrict = hoveredDistrict || selectedDistrict;

  const getColorClasses = (colorType: "pink" | "green" | "blue", isHighlighted: boolean) => {
    if (isHighlighted) {
      return "fill-amber-300 stroke-slate-950 stroke-[1.8] filter brightness-105";
    }
    switch (colorType) {
      case "green":
        return "fill-[#65e022] hover:fill-[#58c71b] stroke-slate-800 stroke-[1.2]";
      case "blue":
        return "fill-[#60cdff] hover:fill-[#38bdf8] stroke-slate-800 stroke-[1.2]";
      case "pink":
      default:
        return "fill-[#fcd5dc] hover:fill-[#f9a8d4] stroke-slate-800 stroke-[1.2]";
    }
  };

  return (
    <div className="w-full max-w-lg lg:max-w-none mx-auto select-none bg-transparent">
      {/* ── Completely Transparent Authentic Real GIS Vector Map ── */}
      <div className="relative w-full h-[420px] sm:h-[480px] flex items-center justify-center bg-transparent">
        
        <svg
          viewBox="0 0 600 500"
          className="w-full h-full object-contain filter drop-shadow-[0_16px_28px_rgba(0,0,0,0.2)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Exact Official GeoJSON Vector Paths */}
          {JHARKHAND_GEO_DISTRICTS.map((district) => {
            const isSelected = selectedDistrict?.id === district.id;
            const isHovered = hoveredDistrict?.id === district.id;
            const isHighlighted = isSelected || isHovered;

            return (
              <g
                key={district.id}
                className="cursor-pointer transition-all duration-150 group"
                onClick={() => setSelectedDistrict(isSelected ? null : district)}
                onMouseEnter={() => setHoveredDistrict(district)}
                onMouseLeave={() => setHoveredDistrict(null)}
              >
                {/* Official District Boundary Vector */}
                <path
                  d={district.path}
                  className={`transition-colors duration-150 ${getColorClasses(district.colorType, isHighlighted)}`}
                />

                {/* District Name Label */}
                <text
                  x={district.labelX}
                  y={district.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`text-[8.5px] font-sans font-bold pointer-events-none select-none transition-all ${
                    isHighlighted ? "fill-slate-950 font-black text-[9.5px]" : "fill-slate-900"
                  }`}
                >
                  {district.shortName.includes("\n") ? (
                    district.shortName.split("\n").map((line, idx) => (
                      <tspan
                        key={idx}
                        x={district.labelX}
                        dy={idx === 0 ? "-0.4em" : "1em"}
                      >
                        {line}
                      </tspan>
                    ))
                  ) : (
                    district.shortName
                  )}
                </text>
              </g>
            );
          })}
        </svg>

        {/* ── District Telemetry Popover (Appears right over map on hover/click) ── */}
        {activeDistrict && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-11/12 max-w-sm bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3.5 shadow-xl text-slate-800 transition-all z-30 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">
                    {activeDistrict.name}
                  </h4>
                  <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-semibold">
                    {activeDistrict.division}
                  </span>
                  {activeDistrict.isCapital && (
                    <span className="text-[9.5px] text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded font-bold">
                      ★ Capital
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                  {activeDistrict.focusArea}
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-xs sm:text-sm font-mono font-bold text-slate-900 block leading-tight">
                  {activeDistrict.activeIssues}
                </span>
                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">
                  Issues Logged
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2 pt-2 border-t border-slate-100 text-[10.5px]">
              <div>
                <span className="text-slate-400 block text-[9px] font-semibold">Assigned Lab / HEI:</span>
                <span className="font-semibold text-slate-800 block truncate">{activeDistrict.assignedUniversity}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] font-semibold">CSR Partner:</span>
                <span className="font-semibold text-indigo-700 block truncate">{activeDistrict.csrPartner}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
