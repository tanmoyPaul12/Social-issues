import {
  CsrBudgetSummary,
  CsrLedgerEntry,
  CsrUtilizationCertificate,
  McaCsr2Report,
  CsrAuditTrailEntry,
  SetCsrBudgetPayload,
  VerifyCertificatePayload,
  CsrLedgerFilterState,
} from "../types/csrCompliance";
import { PageResponse } from "../types/industryDashboard";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080/api";

function extractErrorMessage(errData: any, defaultMsg: string): string {
  if (!errData) return defaultMsg;
  if (typeof errData === "string") return errData;
  if (typeof errData.error === "string") return errData.error;
  if (typeof errData.error?.message === "string") return errData.error.message;
  if (typeof errData.message === "string") return errData.message;
  return defaultMsg;
}

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
 * 1. Fetch CSR Budget and Section 135 summary for given financial year
 */
export async function fetchCsrSummary(
  token?: string | null,
  financialYear: string = "2026-2027"
): Promise<CsrBudgetSummary> {
  const url = new URL(`${API_BASE_URL}/industry/dashboard/csr/summary`);
  url.searchParams.append("financialYear", financialYear);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getHeaders(token),
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(err, `Failed to fetch CSR budget summary (Status ${response.status})`));
  }

  return response.json();
}

/**
 * 2. Set/Update Annual CSR Budget & Obligation
 */
export async function setCsrBudget(
  token: string | null | undefined,
  payload: SetCsrBudgetPayload
): Promise<CsrBudgetSummary> {
  const url = `${API_BASE_URL}/industry/dashboard/csr/budget`;

  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(err, `Failed to update CSR annual budget (Status ${response.status})`));
  }

  return response.json();
}

/**
 * 3. Fetch Paginated CSR Disbursements Ledger
 */
export async function fetchCsrLedger(
  token?: string | null,
  filters?: Partial<CsrLedgerFilterState>
): Promise<PageResponse<CsrLedgerEntry>> {
  const url = new URL(`${API_BASE_URL}/industry/dashboard/csr/ledger`);

  if (filters?.financialYear) {
    url.searchParams.append("financialYear", filters.financialYear);
  }
  if (filters?.category) {
    url.searchParams.append("category", filters.category);
  }
  if (filters?.pilotId) {
    url.searchParams.append("pilotId", String(filters.pilotId));
  }
  if (filters?.search && filters.search.trim()) {
    url.searchParams.append("search", filters.search.trim());
  }
  url.searchParams.append("page", String(filters?.page ?? 0));
  url.searchParams.append("size", String(filters?.size ?? 20));

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getHeaders(token),
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(err, `Failed to fetch CSR ledger entries (Status ${response.status})`));
  }

  return response.json();
}

/**
 * 4. Fetch Form GFR 12-A / CA Utilization Certificates
 */
export async function fetchUtilizationCertificates(
  token?: string | null,
  financialYear?: string,
  isVerified?: boolean,
  pilotId?: number
): Promise<CsrUtilizationCertificate[]> {
  const url = new URL(`${API_BASE_URL}/industry/dashboard/csr/certificates`);

  if (financialYear) {
    url.searchParams.append("financialYear", financialYear);
  }
  if (isVerified !== undefined) {
    url.searchParams.append("isVerified", String(isVerified));
  }
  if (pilotId) {
    url.searchParams.append("pilotId", String(pilotId));
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getHeaders(token),
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(err, `Failed to fetch utilization certificates (Status ${response.status})`));
  }

  return response.json();
}

/**
 * 5. Upload Scanned Utilization Certificate (Multipart)
 */
export async function uploadUtilizationCertificate(
  token: string | null | undefined,
  formData: FormData
): Promise<CsrUtilizationCertificate> {
  const url = `${API_BASE_URL}/industry/dashboard/csr/certificates/upload`;

  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaderOnly(token),
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(err, `Failed to upload utilization certificate (Status ${response.status})`));
  }

  return response.json();
}

/**
 * 6. Verify Utilization Certificate with UDIN & Audit Notes
 */
export async function verifyUtilizationCertificate(
  token: string | null | undefined,
  id: number,
  payload: VerifyCertificatePayload
): Promise<CsrUtilizationCertificate> {
  const url = `${API_BASE_URL}/industry/dashboard/csr/certificates/${id}/verify`;

  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(err, `Failed to verify certificate (Status ${response.status})`));
  }

  return response.json();
}

/**
 * 7. Fetch MCA Form CSR-2 Statutory Report
 */
export async function fetchMcaCsr2Report(
  token?: string | null,
  financialYear: string = "2026-2027"
): Promise<McaCsr2Report> {
  const url = new URL(`${API_BASE_URL}/industry/dashboard/csr/reports/csr2`);
  url.searchParams.append("financialYear", financialYear);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getHeaders(token),
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(err, `Failed to fetch MCA Form CSR-2 report (Status ${response.status})`));
  }

  return response.json();
}

/**
 * 8. Export MCA Form CSR-2 CSV Spreadsheet
 */
export async function exportMcaCsr2Csv(
  token?: string | null,
  financialYear: string = "2026-2027"
): Promise<Blob> {
  const url = new URL(`${API_BASE_URL}/industry/dashboard/csr/reports/csr2/export/csv`);
  url.searchParams.append("financialYear", financialYear);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getHeaders(token),
  });

  if (!response.ok) {
    throw new Error(`Failed to export MCA CSR-2 CSV (Status ${response.status})`);
  }

  return response.blob();
}

/**
 * 9. Export MCA Form CSR-2 Statutory PDF / Text Report
 */
export async function exportMcaCsr2Pdf(
  token?: string | null,
  financialYear: string = "2026-2027"
): Promise<Blob> {
  const url = new URL(`${API_BASE_URL}/industry/dashboard/csr/reports/csr2/export/pdf`);
  url.searchParams.append("financialYear", financialYear);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getHeaders(token),
  });

  if (!response.ok) {
    throw new Error(`Failed to export MCA CSR-2 PDF (Status ${response.status})`);
  }

  return response.blob();
}

/**
 * 10. Fetch Paginated Cryptographic SHA-256 Compliance Audit Trail
 */
export async function fetchCsrAuditTrail(
  token?: string | null,
  financialYear?: string,
  page: number = 0,
  size: number = 20
): Promise<PageResponse<CsrAuditTrailEntry>> {
  const url = new URL(`${API_BASE_URL}/industry/dashboard/csr/audit-trail`);

  if (financialYear) {
    url.searchParams.append("financialYear", financialYear);
  }
  url.searchParams.append("page", String(page));
  url.searchParams.append("size", String(size));

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getHeaders(token),
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(err, `Failed to fetch CSR audit trail (Status ${response.status})`));
  }

  return response.json();
}
