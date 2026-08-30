export type MarketplaceStage =
  | "PROTOTYPE"
  | "NEEDS_FUNDING"
  | "NEEDS_MENTOR"
  | "READY_FOR_TESTBED";

export type MarketplaceSortOption =
  | "NEWEST"
  | "FUNDING_ASK_HIGH"
  | "FUNDING_ASK_LOW"
  | "MOST_COMMITTED"
  | "CLOSING_SOON";

export interface MarketplaceProject {
  id: number;
  title: string;
  abstractDescription: string;
  sector: string;
  sectorName: string;
  stage: MarketplaceStage;
  stageLabel: string;
  universityId?: number;
  universityName: string;
  leadFacultyMentor: string;
  studentLead?: string;
  teamSize: number;
  fundingAskAmount: number;
  fundingAskFormatted: string;
  fundingCommittedAmount: number;
  fundingCommittedFormatted: string;
  fundedPercentage: number;
  trlLevel: number;
  targetDistrict: string;
  proposalPdfUrl?: string;
  prototypeImageUrl?: string;
  status: "PUBLISHED" | "UNDER_REVIEW" | "FULLY_FUNDED" | "CLOSED";
  closingDate?: string;
  createdAt: string;
}

export interface MarketplaceFilterState {
  domain: string;
  stage: string;
  university: string;
  fundingRange: string;
  search: string;
  sortBy: MarketplaceSortOption;
  page: number;
  size: number;
}

export interface MarketplaceMeta {
  totalPublishedProjects: number;
  availableUniversities: string[];
  sectorCounts: Record<string, number>;
  stageCounts: Record<string, number>;
}

export interface CommitFundingPayload {
  grantAmount: number;
  csrCategory?: string;
  csrScheduleViiHead?: string;
  corporateMentorName?: string;
  corporateMentorDesignation?: string;
  messageNotes?: string;
  financialYear?: string;
}

export interface OfferMentorshipPayload {
  mentorName: string;
  mentorDesignation?: string;
  mentorEmail?: string;
  domainExpertise?: string;
  weeklyHoursCommitted?: number;
  messageNotes?: string;
}

export interface ExpressInterestPayload {
  contactPersonName?: string;
  contactEmail?: string;
  messageNotes?: string;
  pilotInterestScope?: string;
}
