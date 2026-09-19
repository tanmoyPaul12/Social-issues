import { extractApiErrorMessage } from "@/lib/api/apiErrorHelper";

// ==========================================
// IP & Technology Transfer Types
// ==========================================
export type IpType =
  | "SHARED_PATENT"
  | "OPEN_SOURCE"
  | "COMMERCIAL_LICENSE"
  | "COPYRIGHT_SOFTWARE";

export type IpStatus =
  | "IDEA_DISCLOSURE"
  | "PRIOR_ART_SEARCH"
  | "PROVISIONAL_FILED"
  | "COMPLETE_SPEC_FILED"
  | "PUBLISHED"
  | "EXAMINATION"
  | "GRANTED"
  | "COMMERCIALLY_LICENSED";

export interface IpRecordDto {
  id: number;
  projectId: number;
  title: string;
  abstractDescription?: string;
  ipType: IpType;
  patentApplicationNumber?: string;
  filingDate?: string;
  grantDate?: string;
  patentOffice?: string;
  status: IpStatus;
  heiOwnershipShare: number;
  studentInnovatorsShare: number;
  industryPartnerShare: number;
  inventorsList?: string;
  commercialPartnerName?: string;
  mouDocumentUrl?: string;
  mouDocumentStorageKey?: string;
  royaltyTerms?: string;
  submittedByUserId?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateIpRecordRequest {
  title: string;
  abstractDescription?: string;
  ipType: IpType;
  patentApplicationNumber?: string;
  filingDate?: string;
  patentOffice?: string;
  status?: IpStatus;
  heiOwnershipShare?: number;
  studentInnovatorsShare?: number;
  industryPartnerShare?: number;
  inventorsList?: string;
  commercialPartnerName?: string;
  mouDocumentUrl?: string;
  mouDocumentStorageKey?: string;
  royaltyTerms?: string;
}

export interface UpdateIpStatusRequest {
  status: IpStatus;
  patentApplicationNumber?: string;
  filingDate?: string;
  grantDate?: string;
  patentOffice?: string;
  commercialPartnerName?: string;
  royaltyTerms?: string;
  mouDocumentUrl?: string;
}

// ==========================================
// Stage Approvals & Closed Loop Types
// ==========================================
export type ApprovalStage =
  | "PROTOTYPE"
  | "FIELD_PILOT"
  | "DEPLOYMENT_HANDOVER"
  | "FINAL_RESOLUTION";

export type ApproverRole =
  | "UNIVERSITY_FACULTY"
  | "STUDENT_INNOVATOR"
  | "INDUSTRY_CSR_ADMIN"
  | "NODAL_GOVT_OFFICER"
  | "CITIZEN_REPORTER";

export type ApprovalStatus =
  | "PENDING"
  | "APPROVED"
  | "CHANGES_REQUESTED"
  | "REJECTED";

export interface ApprovalSignoffDto {
  id: number;
  projectId: number;
  stage: ApprovalStage;
  approverRole: ApproverRole;
  approverUserId?: number;
  approverName?: string;
  approverDesignation?: string;
  approverOrgName?: string;
  approvalStatus: ApprovalStatus;
  remarks?: string;
  digitalSignatureHash?: string;
  evidenceDocumentUrl?: string;
  signedAt?: string;
  createdAt?: string;
}

export interface SubmitSignoffRequest {
  stage: ApprovalStage;
  approverRole: ApproverRole;
  approverName?: string;
  approvalStatus: ApprovalStatus;
  remarks?: string;
  citizenRating?: number;
  closureCertificateStorageKey?: string;
  closureCertificateUrl?: string;
  digitalSignatureHash?: string;
  evidenceDocumentUrl?: string;
}

export interface DualClosedLoopStatusDto {
  projectId: number;
  citizenReporterSigned: boolean;
  citizenReporterSignedAt?: string;
  citizenReporterName?: string;
  nodalOfficerSigned: boolean;
  nodalOfficerSignedAt?: string;
  nodalOfficerName?: string;
  bothPartiesSigned: boolean;
  overallResolutionStatus: string;
}

// ==========================================
// Testing & TRL Progression Types
// ==========================================
export type TestType =
  | "LAB_BENCH_TEST"
  | "SIMULATION_ANALYSIS"
  | "CONTROLLED_FIELD_TRIAL"
  | "STRESS_LOAD_TEST"
  | "USER_ACCEPTANCE_TEST"
  | "SAFETY_COMPLIANCE_AUDIT";

export interface TestResultDto {
  id: number;
  projectId: number;
  testTitle: string;
  testType: TestType;
  trlLevel: number;
  passStatus: boolean;
  testDate?: string;
  testLocation?: string;
  testerUserId?: number;
  testerName?: string;
  testerDesignation?: string;
  observationsNotes?: string;
  metricsDataJson?: string;
  testReportDocumentUrl?: string;
  createdAt?: string;
}

export interface RecordTestResultRequest {
  testTitle: string;
  testType: TestType;
  trlLevel: number;
  passStatus: boolean;
  testDate?: string;
  testLocation?: string;
  observationsNotes?: string;
  metricsDataJson?: string;
  testReportDocumentUrl?: string;
}

// ==========================================
// API Helpers
// ==========================================
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

// ==========================================
// Industry Lifecycle API Client
// ==========================================
export const industryLifecycleApi = {
  // ----------------------------------------------------
  // IP & Tech Transfer Catalog Endpoints
  // ----------------------------------------------------
  /**
   * Fetch platform-wide IP & Tech Transfer Catalog
   * GET /api/ip/catalog
   */
  async getIpCatalog(
    filters?: { ipType?: string; status?: string },
    token?: string | null
  ): Promise<IpRecordDto[]> {
    const url = new URL(`${API_BASE_URL}/ip/catalog`);
    if (filters?.ipType && filters.ipType !== "ALL") {
      url.searchParams.append("ipType", filters.ipType);
    }
    if (filters?.status && filters.status !== "ALL") {
      url.searchParams.append("status", filters.status);
    }

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: getAuthHeaderOnly(token),
    });

    if (!res.ok) {
      throw new Error(await extractApiErrorMessage(res, "Failed to fetch platform IP catalog"));
    }
    return res.json();
  },

  /**
   * Fetch IP records for a specific project
   * GET /api/projects/{projectId}/ip-records
   */
  async getProjectIpRecords(projectId: number, token?: string | null): Promise<IpRecordDto[]> {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/ip-records`, {
      method: "GET",
      headers: getAuthHeaderOnly(token),
    });

    if (!res.ok) {
      throw new Error(await extractApiErrorMessage(res, `Failed to fetch IP records for project #${projectId}`));
    }
    return res.json();
  },

  /**
   * Get single IP record details
   * GET /api/projects/{projectId}/ip-records/{id}
   */
  async getIpRecordById(projectId: number, id: number, token?: string | null): Promise<IpRecordDto> {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/ip-records/${id}`, {
      method: "GET",
      headers: getAuthHeaderOnly(token),
    });

    if (!res.ok) {
      throw new Error(await extractApiErrorMessage(res, `Failed to fetch IP record #${id}`));
    }
    return res.json();
  },

  /**
   * Register a new IP disclosure / patent application
   * POST /api/projects/{projectId}/ip-records
   */
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

    if (!res.ok) {
      throw new Error(await extractApiErrorMessage(res, "Failed to register IP disclosure"));
    }
    return res.json();
  },

  /**
   * Update IP status / patent application details
   * PATCH /api/projects/{projectId}/ip-records/{id}/status
   */
  async updateIpStatus(
    projectId: number,
    id: number,
    data: UpdateIpStatusRequest,
    token?: string | null
  ): Promise<IpRecordDto> {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/ip-records/${id}/status`, {
      method: "PATCH",
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(await extractApiErrorMessage(res, `Failed to update IP record #${id}`));
    }
    return res.json();
  },

  /**
   * Delete an IP record
   * DELETE /api/projects/{projectId}/ip-records/{id}
   */
  async deleteIpRecord(
    projectId: number,
    id: number,
    token?: string | null
  ): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/ip-records/${id}`, {
      method: "DELETE",
      headers: getAuthHeaderOnly(token),
    });

    if (!res.ok) {
      throw new Error(await extractApiErrorMessage(res, `Failed to delete IP record #${id}`));
    }
    return res.json();
  },

  // ----------------------------------------------------
  // Stage Approval & Closed-Loop Signoff Endpoints
  // ----------------------------------------------------
  /**
   * Get all stage approval sign-offs for a project
   * GET /api/projects/{projectId}/signoffs
   */
  async getSignoffs(projectId: number, token?: string | null): Promise<ApprovalSignoffDto[]> {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/signoffs`, {
      method: "GET",
      headers: getAuthHeaderOnly(token),
    });

    if (!res.ok) {
      throw new Error(await extractApiErrorMessage(res, "Failed to fetch stage signoffs"));
    }
    return res.json();
  },

  /**
   * Submit stage approval / digital signature
   * POST /api/projects/{projectId}/signoffs
   */
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

    if (!res.ok) {
      throw new Error(await extractApiErrorMessage(res, "Failed to record stage approval sign-off"));
    }
    return res.json();
  },

  /**
   * Get dual closed-loop resolution status
   * GET /api/projects/{projectId}/closed-loop-status
   */
  async getDualClosedLoopStatus(
    projectId: number,
    token?: string | null
  ): Promise<DualClosedLoopStatusDto> {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/closed-loop-status`, {
      method: "GET",
      headers: getAuthHeaderOnly(token),
    });

    if (!res.ok) {
      throw new Error(await extractApiErrorMessage(res, "Failed to fetch dual closed-loop status"));
    }
    return res.json();
  },

  // ----------------------------------------------------
  // Testing Outcomes & TRL Progression Endpoints
  // ----------------------------------------------------
  /**
   * Get all testing records for a project
   * GET /api/projects/{projectId}/tests
   */
  async getTestResults(projectId: number, token?: string | null): Promise<TestResultDto[]> {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/tests`, {
      method: "GET",
      headers: getAuthHeaderOnly(token),
    });

    if (!res.ok) {
      throw new Error(await extractApiErrorMessage(res, "Failed to fetch test outcomes"));
    }
    return res.json();
  },

  /**
   * Log a new lab or field test outcome
   * POST /api/projects/{projectId}/tests
   */
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

    if (!res.ok) {
      throw new Error(await extractApiErrorMessage(res, "Failed to record test result"));
    }
    return res.json();
  },

  /**
   * Get highest verified TRL level for a project
   * GET /api/projects/{projectId}/tests/highest-trl
   */
  async getHighestTrl(projectId: number, token?: string | null): Promise<number> {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/tests/highest-trl`, {
      method: "GET",
      headers: getAuthHeaderOnly(token),
    });

    if (!res.ok) {
      throw new Error(await extractApiErrorMessage(res, "Failed to fetch highest verified TRL"));
    }
    const data = await res.json();
    if (typeof data === "number") return data;
    if (data && typeof data.highestVerifiedTrl === "number") return data.highestVerifiedTrl;
    return 1;
  },
};
