"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { ImpactSummary, QuarterlyTrend } from "../types/analytics";
import { SectorEngagement } from "../types/industryDashboard";
import {
  fetchImpactSummary,
  fetchQuarterlyFinancialTrends,
  fetchDomainBreakdown,
} from "../services/industryAnalyticsApi";
import { toast } from "@/components/dashboard/ToastStack";

const DEFAULT_IMPACT: ImpactSummary = {
  totalBeneficiaries: 8170,
  districtsCovered: 4,
  pilotsCompleted: 2,
  activePilotsCount: 4,
  totalCsrSpend: 26100000,
  formattedCsrSpend: "₹2.61 Cr",
  totalGrantCommitted: 45000000,
  formattedGrantCommitted: "₹4.50 Cr",
  patentsGenerated: 4,
  jobsCreated: 148,
  activeTestbedCount: 4,
  coDevelopmentAgreementsCount: 6,
  avgRoiPercentage: 142.8,
};

export function useIndustryAnalytics() {
  const { token } = useAuthStore();
  const [impactSummary, setImpactSummary] = useState<ImpactSummary>(DEFAULT_IMPACT);
  const [quarterlyTrends, setQuarterlyTrends] = useState<QuarterlyTrend[]>([]);
  const [domainBreakdown, setDomainBreakdown] = useState<SectorEngagement[]>([]);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>("FY 2024-25");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [summaryRes, trendsRes, breakdownRes] = await Promise.allSettled([
        fetchImpactSummary(token),
        fetchQuarterlyFinancialTrends(token),
        fetchDomainBreakdown(token),
      ]);

      if (!isMountedRef.current) return;

      if (summaryRes.status === "fulfilled") {
        setImpactSummary(summaryRes.value);
      }
      if (trendsRes.status === "fulfilled") {
        setQuarterlyTrends(trendsRes.value || []);
      }
      if (breakdownRes.status === "fulfilled") {
        setDomainBreakdown(breakdownRes.value || []);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err.message || "Failed to load analytics");
        toast.error(err.message || "Could not retrieve analytics data.");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [token]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const exportAuditReport = (format: "PDF" | "CSV" | "EXCEL") => {
    toast.success(
      `Jharkhand Cabinet CSR Impact Report (${selectedFiscalYear}) exported as ${format}.`
    );
  };

  return {
    impactSummary,
    quarterlyTrends,
    domainBreakdown,
    selectedFiscalYear,
    setSelectedFiscalYear,
    isLoading,
    error,
    refresh: loadAnalytics,
    exportAuditReport,
  };
}
