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

  async createIpRecord(
    projectId: number,
    data: CreateIpRecordRequest,
    token?: string | null
  ): Promise<IpRecordDto> {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/ip-records`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to register IP record");
    return res.json();
  },
};
