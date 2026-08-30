import {
  IndustryOverviewResponse,
  IndustryActivity,
  PageResponse,
} from "../types/industryDashboard";

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
 * Fetch consolidated industry dashboard overview metrics, stat cards,
 * quick actions, domain breakdown, and recent activities.
 */
export async function fetchIndustryOverview(
  token?: string | null,
  financialYear?: string
): Promise<IndustryOverviewResponse> {
  const url = new URL(`${API_BASE_URL}/industry/dashboard/overview`);
  if (financialYear) {
    url.searchParams.append("financialYear", financialYear);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getHeaders(token),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error ||
        errorData.message ||
        `Failed to fetch industry overview (Status ${response.status})`
    );
  }

  return response.json();
}

/**
 * Fetch paginated activity log for the industry partner.
 */
export async function fetchIndustryActivities(
  token?: string | null,
  page: number = 0,
  size: number = 10,
  eventType?: string
): Promise<PageResponse<IndustryActivity>> {
  const url = new URL(`${API_BASE_URL}/industry/dashboard/activities`);
  url.searchParams.append("page", String(page));
  url.searchParams.append("size", String(size));
  if (eventType) {
    url.searchParams.append("eventType", eventType);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getHeaders(token),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch activities (Status ${response.status})`);
  }

  return response.json();
}

/**
 * Mark a specific activity entry as read.
 */
export async function markActivityAsRead(
  token?: string | null,
  activityId?: number
): Promise<{ success: boolean; message: string }> {
  if (!activityId) return { success: false, message: "Invalid activity ID" };

  const response = await fetch(
    `${API_BASE_URL}/industry/dashboard/activities/${activityId}/read`,
    {
      method: "PATCH",
      headers: getHeaders(token),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to mark activity as read`);
  }

  return response.json();
}

/**
 * Trigger test notification via Redis Pub/Sub (for demo / verification).
 */
export async function triggerTestNotification(
  token?: string | null,
  payload?: { title?: string; message?: string }
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(
    `${API_BASE_URL}/industry/dashboard/test-notification`,
    {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(payload || {}),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to trigger test notification");
  }

  return response.json();
}
