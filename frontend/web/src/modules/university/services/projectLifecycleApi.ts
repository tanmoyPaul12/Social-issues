import {
  MilestoneDto,
  DeliverableDto,
  TestResultDto,
  ApprovalSignoffDto,
  DualClosedLoopStatusDto,
  IpRecordDto,
  CreateMilestoneRequest,
  SubmitDeliverableRequest,
  ReviewMilestoneRequest,
  RecordTestResultRequest,
  SubmitSignoffRequest,
  CreateIpRecordRequest,
  ProjectLifecycleDossierDto,
  UniversityProject,
} from "../types";

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
    headers["Authorization"] = token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`;
  }
  return headers;
}

export const projectLifecycleApi = {
  // --- Milestones & Deliverables ---
  async getMilestones(projectId: number, token?: string | null): Promise<MilestoneDto[]> {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/milestones`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch project milestones");
    return res.json();
  },

  async setupDefaultMilestones(projectId: number, token?: string | null): Promise<MilestoneDto[]> {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/milestones/setup-defaults`, {
      method: "POST",
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to initialize standard 4-stage milestones");
    return res.json();
  },

  async createMilestone(
    projectId: number,
    data: CreateMilestoneRequest,
    token?: string | null
  ): Promise<MilestoneDto> {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/milestones`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create milestone");
    return res.json();
  },

  async submitDeliverable(
    projectId: number,
    milestoneId: number,
    data: SubmitDeliverableRequest,
    token?: string | null
  ): Promise<DeliverableDto> {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/milestones/${milestoneId}/deliverables`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to submit deliverable");
    return res.json();
  },

  async reviewMilestone(
    projectId: number,
    milestoneId: number,
    data: ReviewMilestoneRequest,
    token?: string | null
  ): Promise<MilestoneDto> {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/milestones/${milestoneId}/review`, {
      method: "PUT",
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to review milestone");
    return res.json();
  },

  // --- Testing Outcomes & TRL Progression ---
  async getTestResults(projectId: number, token?: string | null): Promise<TestResultDto[]> {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/tests`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch test outcomes");
    return res.json();
  },

  async recordTestResult(
    projectId: number,
    data: RecordTestResultRequest,
    token?: string | null
  ): Promise<TestResultDto> {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/tests`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to record test result");
    return res.json();
  },

  async getHighestTrl(projectId: number, token?: string | null): Promise<number> {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/tests/highest-trl`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch highest verified TRL");
    return res.json();
  },

  // --- Stage Approvals & Closed-Loop Dual Signoff ---
  async getSignoffs(projectId: number, token?: string | null): Promise<ApprovalSignoffDto[]> {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/signoffs`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch stage signoffs");
    return res.json();
  },

  async submitSignoff(
    projectId: number,
    data: SubmitSignoffRequest,
    token?: string | null
  ): Promise<ApprovalSignoffDto> {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/signoffs`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to record digital approval sign-off");
    return res.json();
  },

  async getClosedLoopStatus(projectId: number, token?: string | null): Promise<DualClosedLoopStatusDto> {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/closed-loop-status`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch dual closed-loop resolution status");
    return res.json();
  },

  // --- IP & Patent Records ---
  async getIpRecords(projectId: number, token?: string | null): Promise<IpRecordDto[]> {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/ip-records`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch intellectual property records");
    return res.json();
  },

  // --- Government Nodal & Statewide Oversight ---
  async getProjectsOversight(
    filters?: {
      district?: string;
      domain?: string;
      stage?: string;
      aisheCode?: string;
      search?: string;
      page?: number;
      size?: number;
    },
    token?: string | null
  ): Promise<{ content: UniversityProject[]; totalElements: number; totalPages: number; page: number; size: number }> {
    const params = new URLSearchParams();
    if (filters?.district && filters.district !== "All 24 Districts" && filters.district !== "ALL") {
      params.append("district", filters.district);
    }
    if (filters?.domain && filters.domain !== "ALL") {
      params.append("domain", filters.domain);
    }
    if (filters?.stage && filters.stage !== "ALL") {
      params.append("stage", filters.stage);
    }
    if (filters?.aisheCode && filters.aisheCode !== "ALL") {
      params.append("aisheCode", filters.aisheCode);
    }
    if (filters?.search && filters.search.trim().length > 0) {
      params.append("search", filters.search.trim());
    }
    if (typeof filters?.page === "number") {
      params.append("page", String(filters.page));
    }
    if (typeof filters?.size === "number") {
      params.append("size", String(filters.size));
    }

    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${API_BASE_URL}/projects${qs}`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch projects oversight list");
    const data = await res.json();
    if (Array.isArray(data)) {
      return {
        content: data,
        totalElements: data.length,
        totalPages: 1,
        page: 0,
        size: data.length
      };
    }
    return {
      content: data.content || [],
      totalElements: typeof data.totalElements === "number" ? data.totalElements : (data.content?.length || 0),
      totalPages: typeof data.totalPages === "number" ? data.totalPages : 1,
      page: typeof data.number === "number" ? data.number : (filters?.page || 0),
      size: typeof data.size === "number" ? data.size : (filters?.size || 10)
    };
  },

  async getProjectDossier(projectId: number, token?: string | null): Promise<ProjectLifecycleDossierDto> {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/dossier`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch 360-degree project dossier");
    return res.json();
  },

  async recordNodalSignoff(
    projectId: number,
    data: SubmitSignoffRequest,
    token?: string | null
  ): Promise<ApprovalSignoffDto> {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/nodal-signoff`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || "Failed to record Nodal sign-off");
    }
    return res.json();
  },

  async reviewDeliverable(
    projectId: number,
    deliverableId: number,
    isApproved: boolean,
    reviewNotes?: string,
    token?: string | null
  ): Promise<DeliverableDto> {
    const params = new URLSearchParams({ isApproved: String(isApproved) });
    if (reviewNotes) params.append("reviewNotes", reviewNotes);

    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/deliverables/${deliverableId}/review?${params.toString()}`, {
      method: "PATCH",
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to review deliverable");
    return res.json();
  },
};

