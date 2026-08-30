"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import {
  IndustryOverviewResponse,
  IndustryActivity,
} from "../types/industryDashboard";
import {
  fetchIndustryOverview,
  markActivityAsRead,
  triggerTestNotification,
} from "../services/industryDashboardApi";

// Clean initial zero/empty state for when no database records exist
const EMPTY_OVERVIEW: IndustryOverviewResponse = {
  companyName: "",
  cinNumber: "",
  csr1RegistrationNumber: "",
  financialYear: "2026-2027",
  statCards: {
    csrCapitalCommitted: 0,
    csrCapitalDisbursed: 0,
    csrCapitalCommittedFormatted: "₹0",
    csrCapitalDisbursedFormatted: "₹0",
    activeCoFundedPilotsCount: 0,
    pendingMilestonesCount: 0,
    testbedsSponsoredCount: 0,
    districtsCoveredCount: 0,
    estimatedBeneficiariesCount: 0,
    csrCompliance: {
      csr1Status: "VALIDATED",
      annualBudget: 0,
      commitmentPercentage: 0,
      mcaFilingStatus: "ON_TRACK",
      complianceScore: 100,
    },
  },
  quickActions: {
    pendingApprovalsCount: 0,
    proposalsAwaitingReviewCount: 0,
    unreadAlertsCount: 0,
  },
  sectorEngagement: [],
  recentActivities: [],
  capitalDisbursementTrend: [],
};

export function useIndustryOverview() {
  const { token, user } = useAuthStore();
  const [financialYear, setFinancialYear] = useState<string>("2026-2027");
  const [overview, setOverview] = useState<IndustryOverviewResponse>(EMPTY_OVERVIEW);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef<boolean>(true);

  const loadOverview = useCallback(
    async (isBackground = false) => {
      if (!isBackground) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      try {
        const data = await fetchIndustryOverview(token, financialYear);
        if (isMountedRef.current) {
          // Merge with user metadata if available
          const enriched: IndustryOverviewResponse = {
            ...data,
            companyName: user?.orgName || data.companyName || user?.name || "Corporate CSR Partner",
            cinNumber: user?.cinNumber || data.cinNumber || "",
            csr1RegistrationNumber: user?.csrNumber || data.csr1RegistrationNumber || "",
          };
          setOverview(enriched);
        }
      } catch (err: any) {
        if (isMountedRef.current) {
          // Fall back gracefully with clean empty structure
          setOverview((prev) => ({
            ...EMPTY_OVERVIEW,
            companyName: user?.orgName || prev.companyName || user?.name || "Corporate CSR Partner",
            cinNumber: user?.cinNumber || prev.cinNumber || "",
            csr1RegistrationNumber: user?.csrNumber || prev.csr1RegistrationNumber || "",
          }));
          // Only show non-auth error banners
          if (!err.message?.includes("401") && !err.message?.includes("Authentication")) {
            setError(err.message || "Failed to load live overview");
          }
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [token, financialYear, user]
  );

  useEffect(() => {
    isMountedRef.current = true;
    loadOverview();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadOverview]);

  // Real-time EventSource connection to notification service stream via API gateway
  useEffect(() => {
    if (typeof window === "undefined") return;

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
    const streamUrl = `${API_BASE}/notifications/stream?userId=${user?.id || "anonymous"}`;
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource(streamUrl);

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed && parsed.eventType) {
            // Real-time activity pushed: prepend to recent activities and refresh metrics
            setOverview((prev) => {
              const newActivity: IndustryActivity = {
                id: Date.now(),
                eventType: parsed.eventType,
                title: parsed.title || "New Real-time Notification",
                description: parsed.message || "Activity registered on platform",
                severity: (parsed.severity as any) || "INFO",
                relativeTime: "Just now",
                timestamp: new Date().toISOString(),
                read: false,
              };
              return {
                ...prev,
                recentActivities: [newActivity, ...prev.recentActivities.slice(0, 9)],
                quickActions: {
                  ...prev.quickActions,
                  unreadAlertsCount: prev.quickActions.unreadAlertsCount + 1,
                },
              };
            });
          }
        } catch {
          // ignore heartbeat / ping frames
        }
      };

      eventSource.onerror = () => {
        eventSource?.close();
      };
    } catch {
      // SSE not available, fallback to pull
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [user?.id]);

  const handleMarkAsRead = async (activityId: number) => {
    try {
      await markActivityAsRead(token, activityId);
      setOverview((prev) => ({
        ...prev,
        recentActivities: prev.recentActivities.map((a) =>
          a.id === activityId ? { ...a, read: true } : a
        ),
      }));
    } catch {
      // Optimistic local toggle
      setOverview((prev) => ({
        ...prev,
        recentActivities: prev.recentActivities.map((a) =>
          a.id === activityId ? { ...a, read: true } : a
        ),
      }));
    }
  };

  const handleTriggerTest = async () => {
    try {
      await triggerTestNotification(token, {
        title: "New Deliverable Uploaded from BIT Mesra",
        message: "Soil Salinity IoT node telemetry received and ready for review.",
      });
      await loadOverview(true);
    } catch (e: any) {
      console.warn("Test notification trigger failed", e);
    }
  };

  return {
    overview,
    isLoading,
    isRefreshing,
    error,
    financialYear,
    setFinancialYear,
    refetch: () => loadOverview(true),
    markAsRead: handleMarkAsRead,
    triggerTestNotification: handleTriggerTest,
  };
}
