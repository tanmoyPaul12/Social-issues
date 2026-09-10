import {
  MarketplaceProject,
  MarketplaceFilterState,
  MarketplaceMeta,
  CommitFundingPayload,
  OfferMentorshipPayload,
  ExpressInterestPayload,
} from "../types/marketplace";
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

/**
 * Fetch paginated & filtered academic marketplace projects
 */
export async function fetchMarketplaceProjects(
  token?: string | null,
  filters?: Partial<MarketplaceFilterState>
): Promise<PageResponse<MarketplaceProject>> {
  const url = new URL(`${API_BASE_URL}/industry/dashboard/marketplace/projects`);

  if (filters?.domain && filters.domain !== "All" && filters.domain !== "ALL") {
    url.searchParams.append("domain", filters.domain);
  }
  if (filters?.stage && filters.stage !== "All" && filters.stage !== "ALL") {
    url.searchParams.append("stage", filters.stage);
  }
  if (filters?.university && filters.university !== "All" && filters.university !== "ALL") {
    url.searchParams.append("university", filters.university);
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

  // Funding range parsing
  if (filters?.fundingRange) {
    switch (filters.fundingRange) {
      case "UNDER_5L":
        url.searchParams.append("maxFunding", "500000");
        break;
      case "5L_25L":
        url.searchParams.append("minFunding", "500000");
        url.searchParams.append("maxFunding", "2500000");
        break;
      case "25L_50L":
        url.searchParams.append("minFunding", "2500000");
        url.searchParams.append("maxFunding", "5000000");
        break;
      case "ABOVE_50L":
        url.searchParams.append("minFunding", "5000000");
        break;
    }
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getHeaders(token),
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(extractApiErrorMessage(err, `Failed to fetch marketplace projects (Status ${response.status})`));
  }

  return response.json();
}

/**
 * Fetch detailed dossier for a single project
 */
export async function fetchProjectDossier(
  token: string | null | undefined,
  projectId: number
): Promise<MarketplaceProject> {
  const response = await fetch(`${API_BASE_URL}/industry/dashboard/marketplace/projects/${projectId}`, {
    method: "GET",
    headers: getHeaders(token),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(extractApiErrorMessage(err, `Failed to load project dossier (Status ${response.status})`));
  }

  return response.json();
}

/**
 * Action 1: Commit CSR Grant Funding
 */
export async function commitCsrGrant(
  token: string | null | undefined,
  projectId: number,
  payload: CommitFundingPayload
): Promise<{ success: boolean; message: string; project: MarketplaceProject }> {
  const response = await fetch(`${API_BASE_URL}/industry/dashboard/marketplace/projects/${projectId}/commit`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(extractApiErrorMessage(err, "Failed to submit CSR grant commitment"));
  }

  return response.json();
}

/**
 * Action 2: Offer Corporate Mentorship
 */
export async function submitMentorshipOffer(
  token: string | null | undefined,
  projectId: number,
  payload: OfferMentorshipPayload
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/industry/dashboard/marketplace/projects/${projectId}/mentor`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(extractApiErrorMessage(err, "Failed to submit mentorship nomination"));
  }

  return response.json();
}

/**
 * Action 3: Express Letter of Intent / Interest
 */
export async function expressProjectInterest(
  token: string | null | undefined,
  projectId: number,
  payload: ExpressInterestPayload
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/industry/dashboard/marketplace/projects/${projectId}/interest`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(extractApiErrorMessage(err, "Failed to dispatch expression of interest"));
  }

  return response.json();
}

/**
 * Fetch dynamic facet & aggregate filter metadata
 */
export async function fetchMarketplaceMeta(token?: string | null): Promise<MarketplaceMeta> {
  const response = await fetch(`${API_BASE_URL}/industry/dashboard/marketplace/meta`, {
    method: "GET",
    headers: getHeaders(token),
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      totalPublishedProjects: 0,
      availableUniversities: [],
      sectorCounts: {},
      stageCounts: {},
    };
  }

  return response.json();
}
