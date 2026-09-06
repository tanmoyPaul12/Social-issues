import {
  ActivePilotSummary,
  ActivePilotDetail,
  ActivePilotsOverview,
  ActivePilotsFilterState,
  Milestone,
  DisbursementTranche,
  DiscussionMessage,
  PilotDocument,
  PilotDocumentType,
  ReviewMilestonePayload,
  ReleaseDisbursementPayload,
  PostDiscussionPayload,
  UpdatePilotHealthPayload,
} from "../types/activePilots";
import { PageResponse } from "../types/industryDashboard";

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

/**
 * 1. Fetch paginated list of active co-funded pilots with filters
 */
export async function fetchActivePilots(
  token?: string | null,
  filters?: Partial<ActivePilotsFilterState>
): Promise<PageResponse<ActivePilotSummary>> {
  const url = new URL(`${API_BASE_URL}/industry/dashboard/pilots`);

  if (filters?.status && filters.status !== "ALL") {
    url.searchParams.append("status", filters.status);
  }
  if (filters?.healthStatus && filters.healthStatus !== "ALL") {
    url.searchParams.append("healthStatus", filters.healthStatus);
  }
  if (filters?.stage && filters.stage !== "ALL") {
    url.searchParams.append("stage", filters.stage);
  }
  if (filters?.search && filters.search.trim().length > 0) {
    url.searchParams.append("search", filters.search.trim());
  }
  if (filters?.sortBy) {
    url.searchParams.append("sortBy", filters.sortBy);
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
    throw new Error(err.error || `Failed to load active pilots (Status ${response.status})`);
  }

  return response.json();
}

/**
 * 2. Fetch aggregate header metrics for active pilots
 */
export async function fetchPilotsOverview(token?: string | null): Promise<ActivePilotsOverview> {
  const response = await fetch(`${API_BASE_URL}/industry/dashboard/pilots/overview`, {
    method: "GET",
    headers: getHeaders(token),
    cache: "no-store",
  });

  if (!response.ok) {
    return {
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
  }

  return response.json();
}

/**
 * 3. Fetch comprehensive project dossier with milestones, tranches, discussions, docs
 */
export async function fetchPilotDetail(
  token: string | null | undefined,
  pilotId: number
): Promise<ActivePilotDetail> {
  const response = await fetch(`${API_BASE_URL}/industry/dashboard/pilots/${pilotId}`, {
    method: "GET",
    headers: getHeaders(token),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to load project dossier (Status ${response.status})`);
  }

  return response.json();
}

/**
 * 4. Update health status of a pilot
 */
export async function updatePilotHealth(
  token: string | null | undefined,
  pilotId: number,
  payload: UpdatePilotHealthPayload
): Promise<{ success: boolean; message: string; pilot: ActivePilotSummary }> {
  const response = await fetch(`${API_BASE_URL}/industry/dashboard/pilots/${pilotId}/health`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update pilot health status");
  }

  return response.json();
}

/**
 * 5. Review & approve / request revision on a milestone deliverable
 */
export async function reviewMilestone(
  token: string | null | undefined,
  pilotId: number,
  milestoneId: number,
  payload: ReviewMilestonePayload
): Promise<{ success: boolean; message: string; milestone: Milestone }> {
  const response = await fetch(
    `${API_BASE_URL}/industry/dashboard/pilots/${pilotId}/milestones/${milestoneId}/review`,
    {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to submit milestone review");
  }

  return response.json();
}

/**
 * 6. Record / execute release of a grant tranche disbursement
 */
export async function releaseDisbursement(
  token: string | null | undefined,
  pilotId: number,
  payload: ReleaseDisbursementPayload
): Promise<{ success: boolean; message: string; disbursement: DisbursementTranche }> {
  const response = await fetch(
    `${API_BASE_URL}/industry/dashboard/pilots/${pilotId}/disbursements/release`,
    {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to record tranche release");
  }

  return response.json();
}

/**
 * 7. Fetch discussion messages for a pilot
 */
export async function fetchDiscussions(
  token: string | null | undefined,
  pilotId: number
): Promise<DiscussionMessage[]> {
  const response = await fetch(`${API_BASE_URL}/industry/dashboard/pilots/${pilotId}/discussions`, {
    method: "GET",
    headers: getHeaders(token),
  });

  if (!response.ok) {
    return [];
  }

  return response.json();
}

/**
 * 8. Post a discussion message
 */
export async function postDiscussion(
  token: string | null | undefined,
  pilotId: number,
  payload: PostDiscussionPayload
): Promise<{ success: boolean; message: string; discussion: DiscussionMessage }> {
  const response = await fetch(`${API_BASE_URL}/industry/dashboard/pilots/${pilotId}/discussions`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to post discussion message");
  }

  return response.json();
}

/**
 * 9. Fetch project documents
 */
export async function fetchDocuments(
  token: string | null | undefined,
  pilotId: number,
  docType?: PilotDocumentType
): Promise<PilotDocument[]> {
  const url = new URL(`${API_BASE_URL}/industry/dashboard/pilots/${pilotId}/documents`);
  if (docType) {
    url.searchParams.append("docType", docType);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getHeaders(token),
  });

  if (!response.ok) {
    return [];
  }

  return response.json();
}

/**
 * 10. Upload a project document
 */
export async function uploadDocument(
  token: string | null | undefined,
  pilotId: number,
  title: string,
  docType: PilotDocumentType,
  file: File
): Promise<{ success: boolean; message: string; document: PilotDocument }> {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("docType", docType);
  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/industry/dashboard/pilots/${pilotId}/documents/upload`,
    {
      method: "POST",
      headers: getAuthHeaderOnly(token),
      body: formData,
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to upload project document");
  }

  return response.json();
}

/**
 * 11. Delete a project document
 */
export async function deleteDocument(
  token: string | null | undefined,
  pilotId: number,
  docId: number
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(
    `${API_BASE_URL}/industry/dashboard/pilots/${pilotId}/documents/${docId}`,
    {
      method: "DELETE",
      headers: getHeaders(token),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to delete project document");
  }

  return response.json();
}
