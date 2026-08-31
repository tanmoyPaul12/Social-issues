"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import {
  CsrBudgetSummary,
  CsrLedgerEntry,
  CsrUtilizationCertificate,
  McaCsr2Report,
  CsrAuditTrailEntry,
  SetCsrBudgetPayload,
  VerifyCertificatePayload,
  CsrLedgerFilterState,
} from "../types/csrCompliance";
import {
  fetchCsrSummary,
  setCsrBudget,
  fetchCsrLedger,
  fetchUtilizationCertificates,
  uploadUtilizationCertificate,
  verifyUtilizationCertificate,
  fetchMcaCsr2Report,
  exportMcaCsr2Csv,
  exportMcaCsr2Pdf,
  fetchCsrAuditTrail,
} from "../services/csrComplianceApi";
import { toast } from "@/components/dashboard/ToastStack";

export type CsrSubTab = "overview" | "ledger" | "certificates" | "reports" | "audit";

const DEFAULT_LEDGER_FILTERS: CsrLedgerFilterState = {
  financialYear: "2026-2027",
  search: "",
  category: "",
  page: 0,
  size: 20,
};

export function useCsrCompliance(initialFy: string = "2026-2027") {
  const { token } = useAuthStore();
  const [financialYear, setFinancialYear] = useState<string>(initialFy);
  const [activeSubTab, setActiveSubTab] = useState<CsrSubTab>("overview");

  // State slices
  const [summary, setSummary] = useState<CsrBudgetSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(true);

  const [ledgerEntries, setLedgerEntries] = useState<CsrLedgerEntry[]>([]);
  const [ledgerTotalElements, setLedgerTotalElements] = useState<number>(0);
  const [ledgerTotalPages, setLedgerTotalPages] = useState<number>(0);
  const [ledgerFilters, setLedgerFilters] = useState<CsrLedgerFilterState>({
    ...DEFAULT_LEDGER_FILTERS,
    financialYear: initialFy,
  });
  const [isLoadingLedger, setIsLoadingLedger] = useState<boolean>(false);

  const [certificates, setCertificates] = useState<CsrUtilizationCertificate[]>([]);
  const [isLoadingCerts, setIsLoadingCerts] = useState<boolean>(false);

  const [mcaReport, setMcaReport] = useState<McaCsr2Report | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false);

  const [auditTrails, setAuditTrails] = useState<CsrAuditTrailEntry[]>([]);
  const [auditTotalPages, setAuditTotalPages] = useState<number>(0);
  const [auditPage, setAuditPage] = useState<number>(0);
  const [isLoadingAudit, setIsLoadingAudit] = useState<boolean>(false);

  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const isMountedRef = useRef<boolean>(true);

  // 1. Fetch Summary
  const loadSummary = useCallback(async (fy: string) => {
    setIsLoadingSummary(true);
    try {
      const data = await fetchCsrSummary(token, fy);
      if (isMountedRef.current) {
        setSummary(data);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        console.warn("CSR summary fetch note:", err?.message || err);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingSummary(false);
      }
    }
  }, [token]);

  // 2. Fetch Ledger
  const loadLedger = useCallback(async (filters: CsrLedgerFilterState) => {
    setIsLoadingLedger(true);
    try {
      const res = await fetchCsrLedger(token, filters);
      if (isMountedRef.current) {
        setLedgerEntries(res.content || []);
        setLedgerTotalElements(res.totalElements || 0);
        setLedgerTotalPages(res.totalPages || 0);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        console.warn("CSR ledger fetch note:", err?.message || err);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingLedger(false);
      }
    }
  }, [token]);

  // 3. Fetch Certificates
  const loadCertificates = useCallback(async (fy: string) => {
    setIsLoadingCerts(true);
    try {
      const certs = await fetchUtilizationCertificates(token, fy);
      if (isMountedRef.current) {
        setCertificates(certs || []);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        console.warn("CSR certificates fetch note:", err?.message || err);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingCerts(false);
      }
    }
  }, [token]);

  // 4. Fetch MCA CSR-2 Report
  const loadMcaReport = useCallback(async (fy: string) => {
    setIsLoadingReport(true);
    try {
      const report = await fetchMcaCsr2Report(token, fy);
      if (isMountedRef.current) {
        setMcaReport(report);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        console.warn("CSR MCA CSR-2 report fetch note:", err?.message || err);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingReport(false);
      }
    }
  }, [token]);

  // 5. Fetch Audit Trail
  const loadAuditTrail = useCallback(async (fy: string, page: number = 0) => {
    setIsLoadingAudit(true);
    try {
      const trail = await fetchCsrAuditTrail(token, fy, page, 20);
      if (isMountedRef.current) {
        setAuditTrails(trail.content || []);
        setAuditTotalPages(trail.totalPages || 0);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        console.warn("CSR audit trail fetch note:", err?.message || err);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingAudit(false);
      }
    }
  }, [token]);

  // Trigger loads on financial year change or subtab change
  useEffect(() => {
    isMountedRef.current = true;
    loadSummary(financialYear);
    loadLedger({ ...ledgerFilters, financialYear });
    loadCertificates(financialYear);
    loadMcaReport(financialYear);
    loadAuditTrail(financialYear, auditPage);

    return () => {
      isMountedRef.current = false;
    };
  }, [financialYear]);

  // Update FY handler
  const handleSetFinancialYear = (fy: string) => {
    setFinancialYear(fy);
    setLedgerFilters((prev) => ({ ...prev, financialYear: fy, page: 0 }));
  };

  // Set Budget Mutation
  const handleUpdateBudget = async (payload: SetCsrBudgetPayload): Promise<boolean> => {
    setIsActionLoading(true);
    try {
      const updated = await setCsrBudget(token, payload);
      setSummary(updated);
      toast.success(`CSR Annual Budget for FY ${payload.financialYear} updated successfully.`);
      loadAuditTrail(financialYear, 0);
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to update CSR Budget");
      return false;
    } finally {
      setIsActionLoading(false);
    }
  };

  // Upload UC Mutation
  const handleUploadCertificate = async (formData: FormData): Promise<boolean> => {
    setIsActionLoading(true);
    try {
      const uploaded = await uploadUtilizationCertificate(token, formData);
      toast.success(`Utilization Certificate ${uploaded.certificateNumber} uploaded successfully.`);
      loadCertificates(financialYear);
      loadSummary(financialYear);
      loadLedger({ ...ledgerFilters, financialYear });
      loadAuditTrail(financialYear, 0);
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to upload Utilization Certificate");
      return false;
    } finally {
      setIsActionLoading(false);
    }
  };

  // Verify UC Mutation
  const handleVerifyCertificate = async (
    id: number,
    payload: VerifyCertificatePayload
  ): Promise<boolean> => {
    setIsActionLoading(true);
    try {
      const verified = await verifyUtilizationCertificate(token, id, payload);
      toast.success(`Certificate ${verified.certificateNumber} verified with UDIN ${payload.udinNumber}.`);
      loadCertificates(financialYear);
      loadSummary(financialYear);
      loadAuditTrail(financialYear, 0);
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to verify certificate");
      return false;
    } finally {
      setIsActionLoading(false);
    }
  };

  // Export CSV
  const handleExportCsv = async () => {
    try {
      toast.info("Generating MCA Form CSR-2 CSV...");
      const blob = await exportMcaCsr2Csv(token, financialYear);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `MCA_CSR2_Report_${financialYear.replace("-", "_")}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("MCA Form CSR-2 CSV exported successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to export CSV");
    }
  };

  // Export PDF
  const handleExportPdf = async () => {
    try {
      toast.info("Generating MCA Form CSR-2 Statutory PDF...");
      const blob = await exportMcaCsr2Pdf(token, financialYear);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `MCA_CSR2_Compliance_${financialYear.replace("-", "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("MCA Form CSR-2 PDF exported successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to export PDF");
    }
  };

  // Refetch all
  const refetchAll = () => {
    loadSummary(financialYear);
    loadLedger(ledgerFilters);
    loadCertificates(financialYear);
    loadMcaReport(financialYear);
    loadAuditTrail(financialYear, auditPage);
  };

  return {
    financialYear,
    setFinancialYear: handleSetFinancialYear,
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
    updateBudget: handleUpdateBudget,
    uploadCertificate: handleUploadCertificate,
    verifyCertificate: handleVerifyCertificate,
    exportCsv: handleExportCsv,
    exportPdf: handleExportPdf,
    refetchAll,
  };
}
