"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import {
  TestbedSponsorship,
  TestbedDistrictSummary,
  CreateTestbedPayload,
  UpdateTestbedStatusPayload,
  DeploymentStatus,
} from "../types/testbeds";
import {
  fetchTestbeds,
  fetchTestbedDistrictSummary,
  fetchTestbedById,
  createTestbed,
  updateTestbedStatus,
  uploadTestbedEvidence,
  deleteTestbed,
  TestbedFilterParams,
} from "../services/fieldTestbedApi";
import { toast } from "@/components/dashboard/ToastStack";

export interface FieldTestbedFilterState {
  district: string;
  status: string;
  search: string;
  page: number;
  size: number;
}

const DEFAULT_FILTERS: FieldTestbedFilterState = {
  district: "ALL",
  status: "ALL",
  search: "",
  page: 0,
  size: 9,
};

export function useFieldTestbeds() {
  const { token } = useAuthStore();
  const [filters, setFilters] = useState<FieldTestbedFilterState>(DEFAULT_FILTERS);
  const [testbeds, setTestbeds] = useState<TestbedSponsorship[]>([]);
  const [districtSummary, setDistrictSummary] = useState<TestbedDistrictSummary[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [selectedTestbed, setSelectedTestbed] = useState<TestbedSponsorship | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 1. Fetch District Summary
  const loadDistrictSummary = useCallback(async () => {
    try {
      const data = await fetchTestbedDistrictSummary(token);
      if (isMountedRef.current) {
        setDistrictSummary(data);
      }
    } catch (err: any) {
      // Non-blocking
      console.warn("Failed to load district summary:", err.message);
    }
  }, [token]);

  // 2. Fetch paginated testbeds
  const loadTestbeds = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchTestbeds(token, {
        district: filters.district,
        status: filters.status,
        search: filters.search,
        page: filters.page,
        size: filters.size,
      });

      if (isMountedRef.current) {
        setTestbeds(response.content || []);
        setTotalElements(response.totalElements || 0);
        setTotalPages(response.totalPages || 0);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err.message || "Failed to load field testbeds");
        toast.error(err.message || "Could not retrieve field testbeds.");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [token, filters]);

  // Trigger on mount and filter changes
  useEffect(() => {
    loadTestbeds();
  }, [loadTestbeds]);

  useEffect(() => {
    loadDistrictSummary();
  }, [loadDistrictSummary]);

  // Actions
  const handleCreateTestbed = async (payload: CreateTestbedPayload): Promise<boolean> => {
    setIsSaving(true);
    try {
      const created = await createTestbed(token, payload);
      toast.success(`Field site '${created.testbedName}' registered in ${created.district}.`);
      await loadTestbeds();
      await loadDistrictSummary();
      return true;
    } catch (err: any) {
      toast.error(err.message || "Could not register new testbed site.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (
    testbedId: number,
    payload: UpdateTestbedStatusPayload
  ): Promise<boolean> => {
    setIsSaving(true);
    try {
      const updated = await updateTestbedStatus(token, testbedId, payload);
      toast.success(`Testbed status set to ${updated.deploymentStatusLabel}.`);
      setTestbeds((prev) => prev.map((t) => (t.id === testbedId ? updated : t)));
      if (selectedTestbed && selectedTestbed.id === testbedId) {
        setSelectedTestbed(updated);
      }
      await loadDistrictSummary();
      return true;
    } catch (err: any) {
      toast.error(err.message || "Could not update testbed deployment status.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadEvidence = async (
    testbedId: number,
    files: File[]
  ): Promise<boolean> => {
    setIsSaving(true);
    try {
      const updated = await uploadTestbedEvidence(token, testbedId, files);
      toast.success(`${files.length} verification photos uploaded successfully.`);
      setTestbeds((prev) => prev.map((t) => (t.id === testbedId ? updated : t)));
      if (selectedTestbed && selectedTestbed.id === testbedId) {
        setSelectedTestbed(updated);
      }
      return true;
    } catch (err: any) {
      toast.error(err.message || "Could not upload evidence photos.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTestbed = async (testbedId: number): Promise<boolean> => {
    try {
      await deleteTestbed(token, testbedId);
      toast.success("Field testbed sponsorship record deleted.");
      setTestbeds((prev) => prev.filter((t) => t.id !== testbedId));
      if (selectedTestbed && selectedTestbed.id === testbedId) {
        setSelectedTestbed(null);
      }
      await loadDistrictSummary();
      return true;
    } catch (err: any) {
      toast.error(err.message || "Could not delete testbed.");
      return false;
    }
  };

  const setFilterValue = (key: keyof FieldTestbedFilterState, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 0, // Reset page on filter change
    }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const totalBeneficiariesAll = testbeds.reduce(
    (sum, t) => sum + (t.beneficiariesImpacted || 0),
    0
  );
  const liveCountAll = testbeds.filter((t) => t.deploymentStatus === "LIVE").length;
  const completedCountAll = testbeds.filter((t) => t.deploymentStatus === "COMPLETED").length;

  return {
    testbeds,
    districtSummary,
    totalElements,
    totalPages,
    selectedTestbed,
    setSelectedTestbed,
    isLoading,
    isSaving,
    error,
    filters,
    totalBeneficiariesAll,
    liveCountAll,
    completedCountAll,
    setFilterValue,
    resetFilters,
    handleCreateTestbed,
    handleUpdateStatus,
    handleUploadEvidence,
    handleDeleteTestbed,
    refresh: loadTestbeds,
  };
}
