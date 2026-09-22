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

export interface MentorshipEngagement {
  id: number;
  projectId: number;
  projectTitle: string;
  universityName: string;
  leadFacultyName: string;
  sector: string;
  mentorName: string;
  mentorDesignation?: string;
  mentorEmail?: string;
  domainExpertise?: string;
  weeklyHoursCommitted: number;
  status: "PENDING_ACCEPTANCE" | "ACTIVE" | "PAUSED" | "COMPLETED";
  sessionCount: number;
  nextScheduledSession?: string;
  meetingLink?: string;
  advisoryNotes?: string;
  messageNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LogSessionPayload {
  sessionSummary: string;
  nextSessionDate?: string;
  meetingLink?: string;
  actionItems?: string[];
  hoursSpent?: number;
}

export const mentorshipApi = {
  /**
   * 1. Get all mentorship engagements for industry partner
   * GET /api/industry/mentorship or /api/industry/dashboard/mentorships
   */
  async getMentorships(token?: string | null, status?: string): Promise<MentorshipEngagement[]> {
    const url = new URL(`${API_BASE_URL}/industry/mentorship`);
    if (status && status !== "ALL") {
      url.searchParams.append("status", status);
    }

    try {
      const res = await fetch(url.toString(), {
        headers: getHeaders(token),
        cache: "no-store",
      });
      if (res.ok) {
        return res.json();
      }
    } catch {}

    // Fallback to dashboard path
    const dashUrl = new URL(`${API_BASE_URL}/industry/dashboard/mentorships`);
    if (status && status !== "ALL") {
      dashUrl.searchParams.append("status", status);
    }
    const dashRes = await fetch(dashUrl.toString(), {
      headers: getHeaders(token),
      cache: "no-store",
    });
    if (!dashRes.ok) {
      throw new Error(`Failed to fetch mentorships (Status ${dashRes.status})`);
    }
    return dashRes.json();
  },

  /**
   * 2. Get detailed mentorship engagement
   */
  async getMentorshipDetail(token: string | null | undefined, id: number): Promise<MentorshipEngagement> {
    const res = await fetch(`${API_BASE_URL}/industry/dashboard/mentorships/${id}`, {
      headers: getHeaders(token),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(extractApiErrorMessage(err, "Failed to fetch mentorship details"));
    }
    return res.json();
  },

  /**
   * 3. Offer mentorship for a project
   * POST /api/industry/mentorship or POST /api/industry/dashboard/mentorships/offer/{projectId}
   */
  async offerMentorship(
    token: string | null | undefined,
    projectId: number,
    payload: {
      mentorName: string;
      mentorDesignation?: string;
      mentorEmail?: string;
      domainExpertise?: string;
      weeklyHoursCommitted?: number;
      messageNotes?: string;
    }
  ): Promise<MentorshipEngagement> {
    try {
      const res = await fetch(`${API_BASE_URL}/industry/mentorship?projectId=${projectId}`, {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify({ ...payload, projectId }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.mentorship || json;
      }
    } catch {}

    const dashRes = await fetch(`${API_BASE_URL}/industry/dashboard/mentorships/offer/${projectId}`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(payload),
    });
    if (!dashRes.ok) {
      const err = await dashRes.json().catch(() => ({}));
      throw new Error(extractApiErrorMessage(err, "Failed to submit mentorship offer"));
    }
    return dashRes.json();
  },

  /**
   * 4. Update mentorship status (ACTIVE, PAUSED, COMPLETED)
   */
  async updateStatus(
    token: string | null | undefined,
    id: number,
    status: "ACTIVE" | "PAUSED" | "COMPLETED"
  ): Promise<MentorshipEngagement> {
    const res = await fetch(`${API_BASE_URL}/industry/dashboard/mentorships/${id}/status`, {
      method: "PATCH",
      headers: getHeaders(token),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(extractApiErrorMessage(err, "Failed to update mentorship status"));
    }
    return res.json();
  },

  /**
   * 5. Log mentorship session
   */
  async logSession(
    token: string | null | undefined,
    id: number,
    payload: LogSessionPayload
  ): Promise<MentorshipEngagement> {
    const res = await fetch(`${API_BASE_URL}/industry/dashboard/mentorships/${id}/session`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(extractApiErrorMessage(err, "Failed to log mentorship session"));
    }
    return res.json();
  },
};
