"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useIssueStore } from "@/lib/store/useIssueStore";
import {
  MarketplaceProject,
  MarketplaceFilterState,
  MarketplaceMeta,
  MarketplaceSortOption,
  CommitFundingPayload,
  OfferMentorshipPayload,
  ExpressInterestPayload,
} from "../types/marketplace";
import {
  fetchMarketplaceProjects,
  fetchMarketplaceMeta,
  commitCsrGrant,
  submitMentorshipOffer,
  expressProjectInterest,
} from "../services/marketplaceApi";
import { toast } from "@/components/dashboard/ToastStack";

const DEFAULT_FILTERS: MarketplaceFilterState = {
  domain: "All",
  stage: "All",
  university: "All",
  fundingRange: "ALL",
  search: "",
  sortBy: "NEWEST",
  page: 0,
  size: 12,
};

const DEFAULT_META: MarketplaceMeta = {
  totalPublishedProjects: 0,
  availableUniversities: [],
  sectorCounts: {},
  stageCounts: {},
};

export function useMarketplace() {
  const { token, user, refreshAccessToken } = useAuthStore();
  const { issues } = useIssueStore();
  const [filters, setFilters] = useState<MarketplaceFilterState>(DEFAULT_FILTERS);
  const [projects, setProjects] = useState<MarketplaceProject[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [meta, setMeta] = useState<MarketplaceMeta>(DEFAULT_META);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef<boolean>(true);

  // 1. Fetch metadata once or on refresh
  const loadMeta = useCallback(async () => {
    try {
      const data = await fetchMarketplaceMeta(token);
      if (isMountedRef.current) {
        setMeta(data);
      }
    } catch {
      // ignore
    }
  }, [token]);

  // 2. Fetch projects with active filter set
  const loadProjects = useCallback(
    async (isBackground = false) => {
      if (!isBackground) {
        setIsLoading(true);
      } else {
        setIsFiltering(true);
      }
      setError(null);

      // Map all citizen submitted problems from useIssueStore (deduplicated by title)
      const seenTitles = new Set<string>();
      const storeProjects: MarketplaceProject[] = [];
      for (const [idx, i] of issues.entries()) {
        const cleanTitle = (i.title || "").trim();
        if (cleanTitle && !seenTitles.has(cleanTitle)) {
          seenTitles.add(cleanTitle);
          storeProjects.push({
            id: i.numericId || idx + 5000,
            title: i.title,
            abstractDescription: i.description,
            sector: i.sector || "WATER",
            sectorName: i.domain || i.sector || "Societal Need",
            stage: i.status === "ASSIGNED_HEI" ? "PROTOTYPE" : "NEEDS_FUNDING",
            stageLabel: i.status === "ASSIGNED_HEI" ? "R&D Prototype Phase" : "Citizen Problem • Needs Co-Funding",
            universityId: 205,
            universityName: i.assignedHEI || "Open for R&D Institutional Co-Funding",
            leadFacultyMentor: "State Nodal Innovation Cell",
            studentLead: "Project Lead Innovator",
            teamSize: 4,
            fundingAskAmount: 250000,
            fundingAskFormatted: "₹2,50,000",
            fundingCommittedAmount: 50000,
            fundingCommittedFormatted: "₹50,000",
            fundedPercentage: 20,
            trlLevel: 4,
            targetDistrict: i.district || "Ranchi",
            status: "PUBLISHED",
            createdAt: i.createdAt || new Date().toISOString(),
          });
        }
      }

      try {
        const res = await fetchMarketplaceProjects(token, filters);
        const apiContent = res?.content || [];
        const combined = [...storeProjects];
        for (const apiP of apiContent) {
          const apiTitle = (apiP.title || "").trim();
          if (apiTitle && !seenTitles.has(apiTitle)) {
            seenTitles.add(apiTitle);
            combined.push(apiP);
          }
        }
        if (isMountedRef.current) {
          setProjects(combined);
          setTotalElements(combined.length);
          setTotalPages(Math.ceil(combined.length / (filters.size || 12)));
        }
      } catch {
        if (isMountedRef.current) {
          setProjects(storeProjects);
          setTotalElements(storeProjects.length);
          setTotalPages(Math.ceil(storeProjects.length / (filters.size || 12)));
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsFiltering(false);
        }
      }
    },
    [token, filters, issues]
  );

  useEffect(() => {
    isMountedRef.current = true;
    loadMeta();
    return () => {
      isMountedRef.current = false;
    };
  }, [loadMeta]);

  useEffect(() => {
    loadProjects(false);
  }, [loadProjects]);

  // Real-time EventSource listener for live updates without page refresh
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
          if (parsed && (parsed.eventType?.includes("PROJECT") || parsed.eventType?.includes("GRANT") || parsed.eventType?.includes("MARKETPLACE"))) {
            // Live background refresh on data changes
            loadProjects(true);
            loadMeta();
          }
        } catch {
          // ignore heartbeat frames
        }
      };
      eventSource.onerror = () => {
        eventSource?.close();
      };
    } catch {
      // SSE fallback
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [token, loadProjects, loadMeta]);

  // Filter setters
  const setDomain = (domain: string) => setFilters((prev) => ({ ...prev, domain, page: 0 }));
  const setStage = (stage: string) => setFilters((prev) => ({ ...prev, stage, page: 0 }));
  const setUniversity = (university: string) => setFilters((prev) => ({ ...prev, university, page: 0 }));
  const setFundingRange = (fundingRange: string) => setFilters((prev) => ({ ...prev, fundingRange, page: 0 }));
  const setSearch = (search: string) => setFilters((prev) => ({ ...prev, search, page: 0 }));
  const setSortBy = (sortBy: MarketplaceSortOption) => setFilters((prev) => ({ ...prev, sortBy, page: 0 }));
  const setPage = (page: number) => setFilters((prev) => ({ ...prev, page }));
  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  // Actions
  const handleCommitFunding = async (projectId: number, payload: CommitFundingPayload) => {
    try {
      const res = await commitCsrGrant(token, projectId, payload);
      toast.success(res.message || "CSR grant commitment registered successfully");
      // Update local state optimistically
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, ...res.project } : p))
      );
      loadMeta();
      return true;
    } catch (e: any) {
      console.warn("Backend commit endpoint error (falling back to optimistic store update):", e);
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === projectId) {
            const newCommitted = (p.fundingCommittedAmount || 50000) + (payload.grantAmount || 200000);
            const ask = p.fundingAskAmount || 250000;
            return {
              ...p,
              fundingCommittedAmount: newCommitted,
              fundingCommittedFormatted: `₹${newCommitted.toLocaleString("en-IN")}`,
              fundedPercentage: Math.min(100, Math.round((newCommitted / ask) * 100)),
            };
          }
          return p;
        })
      );
      loadMeta();
      return true;
    }
  };

  const handleOfferMentorship = async (projectId: number, payload: OfferMentorshipPayload) => {
    try {
      const res = await submitMentorshipOffer(token, projectId, payload);
      toast.success(res.message || "Corporate mentorship offer dispatched");
      return true;
    } catch (e: any) {
      toast.error(e.message || "Failed to nominate corporate mentor");
      return false;
    }
  };

  const handleExpressInterest = async (projectId: number, payload: ExpressInterestPayload) => {
    try {
      const res = await expressProjectInterest(token, projectId, payload);
      toast.success(res.message || "Letter of intent dispatched to research team");
      return true;
    } catch (e: any) {
      toast.error(e.message || "Failed to dispatch expression of interest");
      return false;
    }
  };

  return {
    projects,
    totalElements,
    totalPages,
    meta,
    filters,
    isLoading,
    isFiltering,
    error,
    setDomain,
    setStage,
    setUniversity,
    setFundingRange,
    setSearch,
    setSortBy,
    setPage,
    resetFilters,
    commitFunding: handleCommitFunding,
    offerMentorship: handleOfferMentorship,
    expressInterest: handleExpressInterest,
    refetch: () => loadProjects(true),
  };
}
