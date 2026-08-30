export type ActivitySeverity = "INFO" | "SUCCESS" | "WARNING" | "ACTION_REQUIRED";

export interface CsrComplianceSummary {
  csr1Status: string;
  annualBudget: number;
  commitmentPercentage: number;
  mcaFilingStatus: "ON_TRACK" | "PENDING_REVIEW" | "FILED" | "ATTENTION_REQUIRED" | string;
  complianceScore: number;
}

export interface IndustryStatCards {
  csrCapitalCommitted: number;
  csrCapitalDisbursed: number;
  csrCapitalCommittedFormatted: string;
  csrCapitalDisbursedFormatted: string;
  activeCoFundedPilotsCount: number;
  pendingMilestonesCount: number;
  testbedsSponsoredCount: number;
  districtsCoveredCount: number;
  estimatedBeneficiariesCount: number;
  csrCompliance: CsrComplianceSummary;
}

export interface QuickActions {
  pendingApprovalsCount: number;
  proposalsAwaitingReviewCount: number;
  unreadAlertsCount: number;
}

export interface SectorEngagement {
  sector: string;
  sectorName: string;
  committedAmount: number;
  projectCount: number;
  percentage: number;
}

export interface IndustryActivity {
  id: number;
  eventType: string;
  title: string;
  description: string;
  referenceEntityType?: string;
  referenceEntityId?: number;
  severity: ActivitySeverity;
  relativeTime: string;
  timestamp: string;
  read?: boolean;
}

export interface FinancialTrendPoint {
  month: string;
  committed: number;
  disbursed: number;
}

export interface IndustryOverviewResponse {
  companyName: string;
  cinNumber: string;
  csr1RegistrationNumber: string;
  financialYear: string;
  statCards: IndustryStatCards;
  quickActions: QuickActions;
  sectorEngagement: SectorEngagement[];
  recentActivities: IndustryActivity[];
  capitalDisbursementTrend: FinancialTrendPoint[];
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
