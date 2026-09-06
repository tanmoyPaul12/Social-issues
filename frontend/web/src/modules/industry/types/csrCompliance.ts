export interface ScheduleVIICategorySummary {
  categoryCode: string;
  categoryName: string;
  projectsCount: number;
  committedAmount: number;
  committedFormatted: string;
  disbursedAmount: number;
  disbursedFormatted: string;
  sharePercentage: number;
}

export interface CsrBudgetSummary {
  financialYear: string;
  corporateName: string;
  cinNumber?: string;
  gstin?: string;
  mandatoryCsrObligation: number;
  mandatoryCsrObligationFormatted: string;
  earmarkedForHeis: number;
  earmarkedForHeisFormatted: string;
  totalCommittedAmount: number;
  totalCommittedFormatted: string;
  totalDisbursedAmount: number;
  totalDisbursedFormatted: string;
  verifiedUtilizedAmount: number;
  verifiedUtilizedFormatted: string;
  unspentBalanceAmount: number;
  unspentBalanceFormatted: string;
  obligationUtilizationPercentage: number;
  earmarkedUtilizationPercentage: number;
  totalActivePilotsCount: number;
  totalAuditedUcsCount: number;
  categoryBreakdown: ScheduleVIICategorySummary[];
}

export interface CsrLedgerEntry {
  id: number;
  disbursementId: number;
  pilotId: number;
  pilotTitle: string;
  universityName: string;
  targetDistrict: string;
  financialYear: string;
  trancheLabel: string;
  disbursementReference: string;
  csrProjectCode: string;
  scheduleVIICategory: string;
  scheduleVIIClause: string;
  amount: number;
  amountFormatted: string;
  status: "SCHEDULED" | "APPROVED" | "DISBURSED" | "UTILIZED" | string;
  transactionDate: string;
  paymentMethod: string;
  utrNumber?: string;
  receiptDocUrl?: string;
  notes?: string;
  hasUtilizationCertificate: boolean;
  ucNumber?: string;
}

export interface CsrUtilizationCertificate {
  id: number;
  pilotId: number;
  pilotTitle: string;
  certificateNumber: string;
  formType: "GFR_12A" | "CA_CERTIFIED" | string;
  financialYear: string;
  universityName: string;
  grantSanctionOrderRef?: string;
  certifiedDisbursedAmount: number;
  certifiedDisbursedFormatted: string;
  certifiedUtilizedAmount: number;
  certifiedUtilizedFormatted: string;
  unspentBalanceAmount: number;
  unspentBalanceFormatted: string;
  caAuditorName?: string;
  caFirmName?: string;
  caMembershipNumber?: string;
  udinNumber?: string;
  issueDate?: string;
  certificateDocUrl?: string;
  isVerified: boolean;
  verifiedAt?: string;
  verificationRemarks?: string;
  createdAt: string;
}

export interface OngoingProjectFiling {
  projectSerialNumber: string;
  projectTitle: string;
  scheduleVIIItem: string;
  localAreaState: string;
  localAreaDistrict: string;
  projectDurationMonths: number;
  totalBudgetApproved: number;
  amountSpentInCurrentFy: number;
  cumulativeSpendTillDate: number;
  modeOfImplementation: string;
  implementingAgencyName: string;
  implementingAgencyCsr1RegNumber: string;
  status: "ON_GOING" | "COMPLETED" | string;
}

export interface ImplementingAgencyFiling {
  csr1RegistrationNumber: string;
  agencyName: string;
  agencyType: string;
  pan?: string;
  state?: string;
  district?: string;
}

export interface McaCsr2Report {
  reportReferenceNumber: string;
  financialYear: string;
  generatedDate: string;
  cinNumber: string;
  companyName: string;
  registeredOfficeAddress: string;
  email: string;
  website: string;
  averageNetProfitPrecedingThreeYears: number;
  mandatoryTwoPercentObligation: number;
  unspentCarriedForwardFromPreviousYears: number;
  totalCsrBudgetToSpend: number;
  totalCsrAmountSpentOngoingProjects: number;
  totalCsrAmountSpentOtherThanOngoing: number;
  totalCsrAmountTransferredToUnspentAccount: number;
  unspentSurplusBalance: number;
  ongoingProjects: OngoingProjectFiling[];
  implementingAgencies: ImplementingAgencyFiling[];
}

export interface CsrAuditTrailEntry {
  id: number;
  financialYear: string;
  actionType: string;
  actionTitle: string;
  detailsJson?: string;
  actorName: string;
  actorRole: string;
  entityType?: string;
  entityId?: number;
  previousHash?: string;
  hashSha256: string;
  timestamp: string;
}

export interface SetCsrBudgetPayload {
  financialYear: string;
  mandatoryCsrObligation: number;
  earmarkedForHeis: number;
  boardApprovalDate?: string;
  remarks?: string;
}

export interface VerifyCertificatePayload {
  udinNumber: string;
  verificationRemarks: string;
}

export interface CsrLedgerFilterState {
  financialYear: string;
  category?: string;
  pilotId?: number;
  search: string;
  page: number;
  size: number;
}
