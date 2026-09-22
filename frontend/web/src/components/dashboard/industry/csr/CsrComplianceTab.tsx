"use client";

import React, { useState } from "react";
import { useCsrCompliance } from "@/modules/industry/hooks/useCsrCompliance";
import { CsrUtilizationCertificate } from "@/modules/industry/types/csrCompliance";

import { CsrBudgetOverviewSection } from "./CsrBudgetOverviewSection";
import { MentorshipEngagementsSection } from "./MentorshipEngagementsSection";
import { CsrLedgerTable } from "./CsrLedgerTable";
import { CsrCertificatesSection } from "./CsrCertificatesSection";
import { McaCsr2ReportSection } from "./McaCsr2ReportSection";
import { CsrAuditTrailSection } from "./CsrAuditTrailSection";

import { SetCsrBudgetModal } from "./SetCsrBudgetModal";
import { UploadCertificateModal } from "./UploadCertificateModal";
import { VerifyCertificateModal } from "./VerifyCertificateModal";

interface CsrComplianceTabProps {
  onNavigateTab?: (tabId: string) => void;
}

export function CsrComplianceTab({ onNavigateTab }: CsrComplianceTabProps) {
  const {
    financialYear,
    setFinancialYear,
    activeSubTab,
    setActiveSubTab,

    // Summary
    summary,
    isLoadingSummary,

    // Ledger
    ledgerEntries,
    ledgerTotalElements,
    ledgerTotalPages,
    ledgerFilters,
    setLedgerFilters,
    loadLedger,
    isLoadingLedger,

    // Certificates
    certificates,
    isLoadingCerts,

    // MCA Report
    mcaReport,
    isLoadingReport,

    // Audit Trail
    auditTrails,
    auditTotalPages,
    auditPage,
    setAuditPage,
    loadAuditTrail,
    isLoadingAudit,

    // Actions
    isActionLoading,
    updateBudget,
    uploadCertificate,
    verifyCertificate,
    exportCsv,
    exportPdf,
    refetchAll,
  } = useCsrCompliance("2026-2027");

  // Modals state
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [verifyTargetCert, setVerifyTargetCert] = useState<CsrUtilizationCertificate | null>(null);

  const handleOpenVerifyModal = (cert: CsrUtilizationCertificate) => {
    setVerifyTargetCert(cert);
  };

  const handleCloseVerifyModal = () => {
    setVerifyTargetCert(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* 1. Header Toolbar: FY Selector + Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Left: Financial Year Selector & Title */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <span>Fiscal Year:</span>
            <select
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className="py-1.5 px-3 rounded-lg border border-slate-300 bg-slate-50 font-mono font-bold text-slate-900 outline-none focus:border-slate-500 cursor-pointer"
            >
              <option value="2026-2027">FY 2026-2027 (Current)</option>
              <option value="2025-2026">FY 2025-2026</option>
              <option value="2024-2025">FY 2024-2025</option>
            </select>
          </div>

          <div className="hidden sm:block h-5 w-px bg-slate-200" />

          <div className="text-xs text-slate-500 font-medium">
            Section 135 Mandate • Schedule VII Item (ix) Public HEIs
          </div>
        </div>

        {/* Right: Quick Action Exports */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportCsv}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
            title="Download MCA CSR-2 CSV"
          >
            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>CSV</span>
          </button>
          <button
            type="button"
            onClick={exportPdf}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            title="Download Statutory PDF Report"
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>MCA PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveSubTab("overview")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === "overview"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          Overview &amp; Obligations
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("mentorship")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === "mentorship"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <span>Corporate Mentorship &amp; Advisory</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("ledger")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === "ledger"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <span>Disbursements Ledger</span>
          {ledgerTotalElements > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeSubTab === "ledger" ? "bg-slate-700 text-white" : "bg-slate-200 text-slate-700"
              }`}
            >
              {ledgerTotalElements}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("certificates")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === "certificates"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <span>Form GFR 12-A UCs</span>
          {certificates.length > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeSubTab === "certificates" ? "bg-slate-700 text-white" : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {certificates.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("reports")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === "reports"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          MCA Form CSR-2 Filing
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("audit")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === "audit"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>SHA-256 Audit Trail</span>
        </button>
      </div>

      {/* 3. Render Active Sub-View */}
      <div>
        {activeSubTab === "overview" && (
          <CsrBudgetOverviewSection
            summary={summary}
            isLoading={isLoadingSummary}
            onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onNavigateSubTab={setActiveSubTab}
          />
        )}

        {activeSubTab === "mentorship" && (
          <MentorshipEngagementsSection onNavigateSubTab={(sub) => setActiveSubTab(sub as any)} />
        )}

        {activeSubTab === "ledger" && (
          <CsrLedgerTable
            entries={ledgerEntries}
            totalElements={ledgerTotalElements}
            totalPages={ledgerTotalPages}
            filters={ledgerFilters}
            onFilterChange={(newFilters) => {
              const updated = { ...ledgerFilters, ...newFilters };
              setLedgerFilters(updated);
              loadLedger(updated);
            }}
            isLoading={isLoadingLedger}
            onNavigateToUcs={() => setActiveSubTab("certificates")}
          />
        )}

        {activeSubTab === "certificates" && (
          <CsrCertificatesSection
            certificates={certificates}
            isLoading={isLoadingCerts}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onOpenVerifyModal={handleOpenVerifyModal}
          />
        )}

        {activeSubTab === "reports" && (
          <McaCsr2ReportSection
            report={mcaReport}
            financialYear={financialYear}
            isLoading={isLoadingReport}
            onExportCsv={exportCsv}
            onExportPdf={exportPdf}
          />
        )}

        {activeSubTab === "audit" && (
          <CsrAuditTrailSection
            auditTrails={auditTrails}
            totalPages={auditTotalPages}
            currentPage={auditPage}
            onPageChange={(p) => {
              setAuditPage(p);
              loadAuditTrail(financialYear, p);
            }}
            isLoading={isLoadingAudit}
            onRefresh={() => loadAuditTrail(financialYear, auditPage)}
          />
        )}
      </div>

      {/* 4. Modals */}
      <SetCsrBudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSave={updateBudget}
        currentSummary={summary}
        financialYear={financialYear}
        isSaving={isActionLoading}
      />

      <UploadCertificateModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={uploadCertificate}
        financialYear={financialYear}
        isUploading={isActionLoading}
      />

      <VerifyCertificateModal
        isOpen={verifyTargetCert !== null}
        onClose={handleCloseVerifyModal}
        certificate={verifyTargetCert}
        onVerify={verifyCertificate}
        isVerifying={isActionLoading}
      />
    </div>
  );
}
