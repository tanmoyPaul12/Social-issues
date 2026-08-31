"use client";

import React from "react";
import { McaCsr2Report } from "@/modules/industry/types/csrCompliance";

interface McaCsr2ReportSectionProps {
  report: McaCsr2Report | null;
  financialYear: string;
  isLoading: boolean;
  onExportCsv: () => void;
  onExportPdf: () => void;
}

export function McaCsr2ReportSection({
  report,
  financialYear,
  isLoading,
  onExportCsv,
  onExportPdf,
}: McaCsr2ReportSectionProps) {
  if (isLoading && !report) {
    return (
      <div className="space-y-4">
        <div className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="h-80 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const formatLakhs = (val?: number) => {
    if (!val) return "₹0.00 Lakhs";
    return `₹${(val / 100000).toFixed(2)} Lakhs`;
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* 1. Header & Download Action Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white px-2.5 py-0.5 rounded-full">
              MCA Form CSR-2 Specification
            </span>
            <span className="text-xs font-mono font-bold text-slate-500">
              Ref: {report?.reportReferenceNumber || `CSR2/${financialYear}/GEN-01`}
            </span>
          </div>
          <h3 className="text-base font-black text-slate-900 tracking-tight">
            Report on Corporate Social Responsibility (CSR) Activities
          </h3>
          <p className="text-xs text-slate-500">
            Pursuant to Section 135 of the Companies Act, 2013 and Companies (CSR Policy) Rules, 2014
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={onExportCsv}
            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download CSV (Excel)</span>
          </button>
          <button
            type="button"
            onClick={onExportPdf}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>Download Statutory PDF Report</span>
          </button>
        </div>
      </div>

      {/* 2. Company Particulars & Statutory Computations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Particulars */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            1. Corporate Particulars
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Corporate Identity Number (CIN):</span>
              <strong className="font-mono text-slate-900">{report?.cinNumber || "L27100WB1907PLC000260"}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Company Name:</span>
              <strong className="text-slate-900">{report?.companyName || "Tata Steel Industrial Research"}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Registered Office:</span>
              <span className="text-slate-700 text-right max-w-xs">{report?.registeredOfficeAddress || "Bombay House, Mumbai / Jamshedpur"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Official Email:</span>
              <span className="font-mono text-slate-700">{report?.email || "csr.compliance@tatasteel.com"}</span>
            </div>
          </div>
        </div>

        {/* Section 135 Financial Computation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            2. Section 135(5) Financial Computation
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Avg. Net Profit (Preceding 3 FYs):</span>
              <strong className="font-mono text-slate-900">{formatLakhs(report?.averageNetProfitPrecedingThreeYears || 1250000000)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Two Percent (2%) Mandatory Obligation:</span>
              <strong className="font-mono text-indigo-900 font-black">{formatLakhs(report?.mandatoryTwoPercentObligation || 25000000)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount Spent on Ongoing Projects:</span>
              <strong className="font-mono text-emerald-800 font-black">{formatLakhs(report?.totalCsrAmountSpentOngoingProjects || 15000000)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Unspent Balance to Separate Bank Account:</span>
              <strong className="font-mono text-amber-800 font-black">{formatLakhs(report?.unspentSurplusBalance || 10000000)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Annexure II: Ongoing Projects Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-3 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              3. Annexure II — Details of CSR Ongoing Projects (HEI Testbeds)
            </h4>
            <p className="text-[11px] text-slate-500">
              Disclosures under Schedule VII Item (ix) for contributions to public funded universities
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {report?.ongoingProjects?.length || 0} Ongoing Projects
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 font-bold text-slate-600 uppercase text-[10px]">
                <th className="py-2.5 px-3">Sl.</th>
                <th className="py-2.5 px-3">Project Title &amp; Schedule VII</th>
                <th className="py-2.5 px-3">Location (State/District)</th>
                <th className="py-2.5 px-3 text-right">Approved Budget</th>
                <th className="py-2.5 px-3 text-right">FY Spend</th>
                <th className="py-2.5 px-3">Implementing Agency (HEI) &amp; CSR-1</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {(!report?.ongoingProjects || report.ongoingProjects.length === 0) ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No ongoing project disclosures generated for this period.
                  </td>
                </tr>
              ) : (
                report.ongoingProjects.map((proj, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-400">
                      {proj.projectSerialNumber || `0${idx + 1}`}
                    </td>
                    <td className="py-3 px-3 max-w-xs">
                      <div className="font-bold text-slate-900 line-clamp-1">{proj.projectTitle}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{proj.scheduleVIIItem || "Item (ix)"}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div>{proj.localAreaDistrict || "Ranchi / Dhanbad"}</div>
                      <div className="text-[10px] text-slate-400">{proj.localAreaState || "Jharkhand"}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatLakhs(proj.totalBudgetApproved)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-800 whitespace-nowrap">
                      {formatLakhs(proj.amountSpentInCurrentFy)}
                    </td>
                    <td className="py-3 px-3 max-w-[200px]">
                      <div className="font-bold text-slate-900 truncate">{proj.implementingAgencyName}</div>
                      <div className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded inline-block">
                        {proj.implementingAgencyCsr1RegNumber || "CSR00018942"}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {proj.status || "ON_GOING"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
