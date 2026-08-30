"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import {
  ActivePilotSummary,
  ActivePilotDetail,
  ActivePilotsOverview,
  ActivePilotsFilterState,
  ActivePilotsSortOption,
  PilotHealthStatus,
  PilotDocumentType,
  ReviewMilestonePayload,
  ReleaseDisbursementPayload,
  PostDiscussionPayload,
} from "../types/activePilots";
import {
  fetchActivePilots,
  fetchPilotsOverview,
  fetchPilotDetail,
  reviewMilestone,
  releaseDisbursement,
  postDiscussion,
  uploadDocument,
  deleteDocument,
  updatePilotHealth,
} from "../services/activePilotsApi";
import { toast } from "@/components/dashboard/ToastStack";

const DEFAULT_FILTERS: ActivePilotsFilterState = {
  status: "ALL",
  healthStatus: "ALL",
  stage: "ALL",
  search: "",
  sortBy: "NEWEST",
  page: 0,
  size: 10,
};

const DEFAULT_OVERVIEW: ActivePilotsOverview = {
  totalPilotsCount: 0,
  activePilotsCount: 0,
  pendingMilestonesCount: 0,
  atRiskPilotsCount: 0,
  completedPilotsCount: 0,
  totalCommittedAmount: 0,
  totalCommittedFormatted: "₹0",
  totalDisbursedAmount: 0,
  totalDisbursedFormatted: "₹0",
  overallDisbursedPercentage: 0,
};

export function useActivePilots() {
  const { token, user } = useAuthStore();
  const [filters, setFilters] = useState<ActivePilotsFilterState>(DEFAULT_FILTERS);
  const [pilots, setPilots] = useState<ActivePilotSummary[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [overview, setOverview] = useState<ActivePilotsOverview>(DEFAULT_OVERVIEW);

  const [selectedDetail, setSelectedDetail] = useState<ActivePilotDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef<boolean>(true);

  // 1. Fetch Overview stats
  const loadOverview = useCallback(async () => {
    try {
      const data = await fetchPilotsOverview(token);
      if (isMountedRef.current) {
        setOverview(data);
      }
    } catch {
      // ignore
    }
  }, [token]);

  // 2. Fetch pilots with active filters
  const loadPilots = useCallback(
    async (isBackground = false) => {
      if (!isBackground) {
        setIsLoading(true);
      } else {
        setIsFiltering(true);
      }
      setError(null);

      try {
        const res = await fetchActivePilots(token, filters);
        if (isMountedRef.current) {
          setPilots(res.content || []);
          setTotalElements(res.totalElements || 0);
          setTotalPages(res.totalPages || 0);
        }
      } catch (err: any) {
        if (isMountedRef.current) {
          setPilots([]);
          setTotalElements(0);
          setTotalPages(0);
          if (!err.message?.includes("401") && !err.message?.includes("Authentication")) {
            setError(err.message || "Failed to load active pilots");
          }
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsFiltering(false);
        }
      }
    },
    [token, filters]
  );

  // 3. Fetch single project dossier
  const loadDetail = useCallback(
    async (pilotId: number) => {
      setIsDetailLoading(true);
      try {
        const detail = await fetchPilotDetail(token, pilotId);
        if (isMountedRef.current) {
          setSelectedDetail(detail);
        }
        return detail;
      } catch (err: any) {
        toast.error(err.message || "Failed to load project dossier");
        return null;
      } finally {
        if (isMountedRef.current) {
          setIsDetailLoading(false);
        }
      }
    },
    [token]
  );

  useEffect(() => {
    isMountedRef.current = true;
    loadOverview();
    return () => {
      isMountedRef.current = false;
    };
  }, [loadOverview]);

  useEffect(() => {
    loadPilots(false);
  }, [loadPilots]);

  // Real-time EventSource listener
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
          if (
            parsed &&
            (parsed.eventType?.includes("PILOT") ||
              parsed.eventType?.includes("MILESTONE") ||
              parsed.eventType?.includes("TRANCHE") ||
              parsed.eventType?.includes("GRANT"))
          ) {
            loadPilots(true);
            loadOverview();
            if (selectedDetail) {
              loadDetail(selectedDetail.project.id);
            }
          }
        } catch {
          // ignore
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
  }, [user, loadPilots, loadOverview, selectedDetail, loadDetail]);

  // Actions
  const handleReviewMilestone = async (
    pilotId: number,
    milestoneId: number,
    payload: ReviewMilestonePayload
  ) => {
    try {
      const res = await reviewMilestone(token, pilotId, milestoneId, payload);
      toast.success(res.message || "Milestone review submitted");
      loadPilots(true);
      loadOverview();
      if (selectedDetail && selectedDetail.project.id === pilotId) {
        loadDetail(pilotId);
      }
      return true;
    } catch (e: any) {
      toast.error(e.message || "Failed to submit milestone review");
      return false;
    }
  };

  const handleReleaseDisbursement = async (
    pilotId: number,
    payload: ReleaseDisbursementPayload
  ) => {
    try {
      const res = await releaseDisbursement(token, pilotId, payload);
      toast.success(res.message || "Grant tranche released");
      loadPilots(true);
      loadOverview();
      if (selectedDetail && selectedDetail.project.id === pilotId) {
        loadDetail(pilotId);
      }
      return true;
    } catch (e: any) {
      toast.error(e.message || "Failed to release disbursement tranche");
      return false;
    }
  };

  const handlePostDiscussion = async (pilotId: number, payload: PostDiscussionPayload) => {
    try {
      const res = await postDiscussion(token, pilotId, payload);
      toast.success("Message dispatched to research team");
      if (selectedDetail && selectedDetail.project.id === pilotId) {
        loadDetail(pilotId);
      }
      return res.discussion;
    } catch (e: any) {
      toast.error(e.message || "Failed to post discussion message");
      return null;
    }
  };

  const handleUploadDocument = async (
    pilotId: number,
    title: string,
    docType: PilotDocumentType,
    file: File
  ) => {
    try {
      const res = await uploadDocument(token, pilotId, title, docType, file);
      toast.success(res.message || "Document uploaded successfully");
      if (selectedDetail && selectedDetail.project.id === pilotId) {
        loadDetail(pilotId);
      }
      return true;
    } catch (e: any) {
      toast.error(e.message || "Failed to upload document");
      return false;
    }
  };

  const handleDeleteDocument = async (pilotId: number, docId: number) => {
    try {
      const res = await deleteDocument(token, pilotId, docId);
      toast.success(res.message || "Document deleted");
      if (selectedDetail && selectedDetail.project.id === pilotId) {
        loadDetail(pilotId);
      }
      return true;
    } catch (e: any) {
      toast.error(e.message || "Failed to delete document");
      return false;
    }
  };

  const handleUpdateHealth = async (pilotId: number, healthStatus: PilotHealthStatus) => {
    try {
      const res = await updatePilotHealth(token, pilotId, { healthStatus });
      toast.success(res.message || "Pilot health updated");
      loadPilots(true);
      loadOverview();
      if (selectedDetail && selectedDetail.project.id === pilotId) {
        loadDetail(pilotId);
      }
      return true;
    } catch (e: any) {
      toast.error(e.message || "Failed to update pilot health");
      return false;
    }
  };

  // Filter setters
  const setStatus = (status: string) => setFilters((prev) => ({ ...prev, status, page: 0 }));
  const setHealthStatus = (healthStatus: string) =>
    setFilters((prev) => ({ ...prev, healthStatus, page: 0 }));
  const setStage = (stage: string) => setFilters((prev) => ({ ...prev, stage, page: 0 }));
  const setSearch = (search: string) => setFilters((prev) => ({ ...prev, search, page: 0 }));
  const setSortBy = (sortBy: ActivePilotsSortOption) =>
    setFilters((prev) => ({ ...prev, sortBy, page: 0 }));
  const setPage = (page: number) => setFilters((prev) => ({ ...prev, page }));
  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  return {
    pilots,
    totalElements,
    totalPages,
    overview,
    selectedDetail,
    setSelectedDetail,
    filters,
    isLoading,
    isFiltering,
    isDetailLoading,
    error,
    setStatus,
    setHealthStatus,
    setStage,
    setSearch,
    setSortBy,
    setPage,
    resetFilters,
    loadDetail,
    reviewMilestone: handleReviewMilestone,
    releaseDisbursement: handleReleaseDisbursement,
    postDiscussion: handlePostDiscussion,
    uploadDocument: handleUploadDocument,
    deleteDocument: handleDeleteDocument,
    updateHealth: handleUpdateHealth,
    refetch: () => {
      loadPilots(true);
      loadOverview();
    },
  };
}
