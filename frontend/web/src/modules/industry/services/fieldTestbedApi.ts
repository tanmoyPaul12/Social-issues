import {
  TestbedSponsorship,
  TestbedDistrictSummary,
  CreateTestbedPayload,
  UpdateTestbedStatusPayload,
} from "../types/testbeds";
import { PageResponse } from "../types/industryDashboard";
import { extractApiErrorMessage } from "@/lib/api/apiErrorHelper";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080/api";

function getHeaders(token?: string | null): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  }
  return headers;
}

function getAuthHeaderOnly(token?: string | null): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  }
  return headers;
}

export interface TestbedFilterParams {
  district?: string;
  status?: string;
  search?: string;
  page?: number;
  size?: number;
}

/**
 * 1. Fetch paginated list of field testbeds with district, status and search filters
 */
export async function fetchTestbeds(
  token?: string | null,
  filters?: TestbedFilterParams
): Promise<PageResponse<TestbedSponsorship>> {
  const url = new URL(`${API_BASE_URL}/industry/dashboard/testbeds`);

  if (filters?.district && filters.district !== "ALL") {
    url.searchParams.append("district", filters.district);
  }
  if (filters?.status && filters.status !== "ALL") {
    url.searchParams.append("status", filters.status);
  }
  if (filters?.search && filters.search.trim()) {
    url.searchParams.append("search", filters.search.trim());
  }
  if (filters?.page !== undefined) {
    url.searchParams.append("page", String(filters.page));
  }
  if (filters?.size !== undefined) {
    url.searchParams.append("size", String(filters.size));
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getHeaders(token),
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(extractApiErrorMessage(err, `Failed to load field testbeds (${response.status})`));
  }

  return response.json();
}

/**
 * 2. Fetch district-level testbed deployment summary
 */
export async function fetchTestbedDistrictSummary(
  token?: string | null
): Promise<TestbedDistrictSummary[]> {
  const url = `${API_BASE_URL}/industry/dashboard/testbeds/district-summary`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(token),
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(extractApiErrorMessage(err, `Failed to load district testbed summary (${response.status})`));
  }

  return response.json();
}

/**
 * 3. Fetch single testbed deployment details
 */
export async function fetchTestbedById(
  token: string | null | undefined,
  testbedId: number
): Promise<TestbedSponsorship> {
  const url = `${API_BASE_URL}/industry/dashboard/testbeds/${testbedId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(token),
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(extractApiErrorMessage(err, `Failed to load testbed details (${response.status})`));
  }

  return response.json();
}

/**
 * 4. Commission new field testbed sponsorship
 */
export async function createTestbed(
  token: string | null | undefined,
  payload: CreateTestbedPayload
): Promise<TestbedSponsorship> {
  const url = `${API_BASE_URL}/industry/dashboard/testbeds`;

  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(extractApiErrorMessage(err, `Failed to create testbed deployment (${response.status})`));
  }

  return response.json();
}

/**
 * 5. Update testbed deployment status
 */
export async function updateTestbedStatus(
  token: string | null | undefined,
  testbedId: number,
  payload: UpdateTestbedStatusPayload
): Promise<TestbedSponsorship> {
  const url = `${API_BASE_URL}/industry/dashboard/testbeds/${testbedId}/status`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(extractApiErrorMessage(err, `Failed to update testbed status (${response.status})`));
  }

  return response.json();
}

/**
 * 6. Upload field verification evidence photos
 */
export async function uploadTestbedEvidence(
  token: string | null | undefined,
  testbedId: number,
  files: File[]
): Promise<TestbedSponsorship> {
  const url = `${API_BASE_URL}/industry/dashboard/testbeds/${testbedId}/evidence`;

  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaderOnly(token),
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(extractApiErrorMessage(err, `Failed to upload evidence photos (${response.status})`));
  }

  return response.json();
}

/**
 * 7. Delete testbed deployment
 */
export async function deleteTestbed(
  token: string | null | undefined,
  testbedId: number
): Promise<{ message: string; id: number }> {
  const url = `${API_BASE_URL}/industry/dashboard/testbeds/${testbedId}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: getHeaders(token),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(extractApiErrorMessage(err, `Failed to delete testbed deployment (${response.status})`));
  }

  return response.json();
}
