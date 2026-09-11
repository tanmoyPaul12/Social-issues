import { ImpactSummary, QuarterlyTrend } from "../types/analytics";
import { SectorEngagement } from "../types/industryDashboard";
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
 * 1. Fetch CSR impact and innovation summary metrics
 */
export async function fetchImpactSummary(token?: string | null): Promise<ImpactSummary> {
  const url = `${API_BASE_URL}/industry/dashboard/analytics/impact-summary`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(token),
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(extractApiErrorMessage(err, `Failed to load impact summary (${response.status})`));
  }

  return response.json();
}

/**
 * 2. Fetch quarterly financial commitments vs disbursements trend
 */
export async function fetchQuarterlyFinancialTrends(
  token?: string | null
): Promise<QuarterlyTrend[]> {
  const url = `${API_BASE_URL}/industry/dashboard/analytics/financial-trend`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(token),
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(extractApiErrorMessage(err, `Failed to load quarterly financial trends (${response.status})`));
  }

  return response.json();
}

/**
 * 3. Fetch domain/sector CSR capital breakdown
 */
export async function fetchDomainBreakdown(
  token?: string | null
): Promise<SectorEngagement[]> {
  const url = `${API_BASE_URL}/industry/dashboard/analytics/domain-breakdown`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(token),
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(extractApiErrorMessage(err, `Failed to load domain breakdown (${response.status})`));
  }

  return response.json();
}
