const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080/api";

export type ReportPeriodType =
  | "FINANCIAL_YEAR"
  | "HALF_YEARLY"
  | "QUARTERLY"
  | "MONTHLY"
  | "CUSTOM";

export type ReportType =
  | "DISTRICT_SUMMARY"
  | "PROJECT_LIFECYCLES"
  | "IP_AND_PATENTS"
  | "CHALLENGE_INCIDENTS";

export interface PeriodItemDto {
  id: string;
  label: string;
}

export interface ReportPeriodOptionsDto {
  availableFinancialYears: string[];
  currentFinancialYear: string;
  currentQuarter: string;
  quarters: PeriodItemDto[];
  halfYears: PeriodItemDto[];
  months: PeriodItemDto[];
  districts: string[];
  domains: string[];
}

export interface DistrictReportRowDto {
  district: string;
  challengesSubmitted: number;
  challengesTriaged: number;
  challengesAssignedHEI: number;
  challengesResolved: number;
  resolutionRate: number;
  activeProjects: number;
  completedProjects: number;
  avgTrlLevel: number;
  highestTrl: number;
  patentsFiled: number;
  patentsGranted: number;
  csrFundsAllocatedInr: number;
  participatingUniversities: string[];
  topDomainNeed: string;
}

export interface DistrictReportSummaryResponse {
  periodLabel: string;
  periodType: ReportPeriodType;
  startDate?: string;
  endDate?: string;
  selectedDistrict?: string;
  selectedSector?: string;
  totalGrievancesSubmitted: number;
  totalGrievancesTriaged: number;
  totalGrievancesAssignedHEI: number;
  totalGrievancesResolved: number;
  statewideResolutionRate: number;
  totalActiveProjects: number;
  totalCompletedProjects: number;
  overallAvgTrl: number;
  statewideHighestTrl: number;
  totalPatentsFiled: number;
  totalPatentsGranted: number;
  totalCsrAllocatedInr: number;
  totalParticipatingUniversitiesCount: number;
  districtBreakdown: DistrictReportRowDto[];
}

export interface DistrictReportFilterRequest {
  periodType?: ReportPeriodType;
  financialYear?: string;
  quarter?: string;
  halfYear?: string;
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
  district?: string;
  sector?: string;
  reportType?: ReportType;
}

function getHeaders(token?: string | null): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  }
  return headers;
}

function buildQueryParams(filter: DistrictReportFilterRequest): URLSearchParams {
  const params = new URLSearchParams();
  if (filter.periodType) params.append("periodType", filter.periodType);
  if (filter.financialYear) params.append("financialYear", filter.financialYear);
  if (filter.quarter) params.append("quarter", filter.quarter);
  if (filter.halfYear) params.append("halfYear", filter.halfYear);
  if (filter.year !== undefined) params.append("year", String(filter.year));
  if (filter.month !== undefined) params.append("month", String(filter.month));
  if (filter.startDate) params.append("startDate", filter.startDate);
  if (filter.endDate) params.append("endDate", filter.endDate);
  if (filter.district && filter.district !== "ALL" && filter.district !== "All 24 Districts") {
    params.append("district", filter.district);
  }
  if (filter.sector && filter.sector !== "ALL") {
    params.append("sector", filter.sector);
  }
  if (filter.reportType) params.append("reportType", filter.reportType);
  return params;
}

export const districtReportApi = {
  /**
   * Fetch available period options for reports (financial years, quarters, etc.)
   */
  async getPeriodOptions(token?: string | null): Promise<ReportPeriodOptionsDto> {
    const url = `${API_BASE_URL}/reports/district/periods`;
    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(token),
    });
    if (!response.ok) {
      throw new Error(`Failed to load period options: ${response.status}`);
    }
    return response.json();
  },

  /**
   * Fetch summary and breakdown report data for live preview
   */
  async getReportPreview(
    filter: DistrictReportFilterRequest,
    token?: string | null
  ): Promise<DistrictReportSummaryResponse> {
    const params = buildQueryParams(filter);
    const url = `${API_BASE_URL}/reports/district/preview?${params.toString()}`;
    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(token),
    });
    if (!response.ok) {
      throw new Error(`Failed to load district report preview: ${response.status}`);
    }
    return response.json();
  },

  /**
   * Download CSV export
   */
  async downloadCsv(
    filter: DistrictReportFilterRequest,
    token?: string | null
  ): Promise<{ blob: Blob; filename: string }> {
    const params = buildQueryParams(filter);
    const url = `${API_BASE_URL}/reports/district/export/csv?${params.toString()}`;
    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(token),
    });
    if (!response.ok) {
      throw new Error(`Failed to download report CSV: ${response.status}`);
    }

    const disposition = response.headers.get("Content-Disposition");
    let filename = `district_report_${Date.now()}.csv`;
    if (disposition && disposition.includes("filename=")) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    const blob = await response.blob();
    return { blob, filename };
  },
};
