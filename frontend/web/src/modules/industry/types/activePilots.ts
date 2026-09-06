export type PilotHealthStatus = "ON_TRACK" | "DELAYED" | "AT_RISK" | "COMPLETED";

export type MilestoneStatus =
  | "UPCOMING"
  | "IN_PROGRESS"
  | "SUBMITTED_FOR_REVIEW"
  | "APPROVED"
  | "REVISION_REQUESTED";

export type DisbursementStatus =
  | "SCHEDULED"
  | "PENDING_APPROVAL"
  | "DISBURSED"
  | "HELD";

export type PilotDocumentType =
  | "PROJECT_PROPOSAL"
  | "MILESTONE_DELIVERABLE"
  | "LAB_REPORT"
  | "TESTBED_EVALUATION"
  | "UTILIZATION_CERTIFICATE"
  | "MOU_AGREEMENT"
  | "OTHER";

export type PilotStage =
  | "PROPOSAL"
  | "FEASIBILITY"
  | "PROTOTYPING"
  | "LAB_TESTING"
  | "FIELD_TRIAL"
  | "DEPLOYED";

export type PilotStatus =
  | "PROPOSED"
  | "UNDER_REVIEW"
  | "ACTIVE"
  | "MILESTONE_PENDING"
  | "COMPLETED"
  | "ON_HOLD";

export interface ActivePilotSummary {
  id: number;
  title: string;
  abstractDescription: string;
  sector: string;
  sectorName: string;
  universityId: number;
  universityName: string;
  facultyLeadName?: string;
  studentLeadName?: string;
  corporateMentorName?: string;
  targetDistrict?: string;

  stage: PilotStage;
  stageLabel: string;
  status: PilotStatus;
  statusLabel: string;
  healthStatus: PilotHealthStatus;
  healthStatusLabel: string;

  currentMilestone: number;
  totalMilestones: number;
  progressPercentage: number;

  totalBudget: number;
  totalBudgetFormatted: string;
  disbursedBudget: number;
  disbursedBudgetFormatted: string;
  disbursedPercentage: number;

  nextDeliverableDate?: string;
  targetCompletionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: number;
  pilotId: number;
  milestoneNumber: number;
  title: string;
  deliverableSummary: string;
  targetDate?: string;
  completedDate?: string;
  status: MilestoneStatus;
  statusLabel: string;
  trancheAmount: number;
  trancheAmountFormatted: string;
  completionPercentage: number;
  evidenceDocUrl?: string;
  submissionRemarks?: string;
  reviewRemarks?: string;
  reviewedAt?: string;
}

export interface DisbursementTranche {
  id: number;
  pilotId: number;
  milestoneId?: number;
  trancheNumber: number;
  trancheLabel: string;
  disbursementReference: string;
  amount: number;
  amountFormatted: string;
  status: DisbursementStatus;
  statusLabel: string;
  scheduledDate?: string;
  disbursedDate?: string;
  paymentMethod?: string;
  utrNumber?: string;
  receiptDocUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface DiscussionMessage {
  id: number;
  pilotId: number;
  senderUserId: number;
  senderName: string;
  senderRole: string;
  message: string;
  attachmentUrl?: string;
  attachmentName?: string;
  isPinned: boolean;
  createdAt: string;
}

export interface PilotDocument {
  id: number;
  pilotId: number;
  title: string;
  docType: PilotDocumentType;
  docTypeLabel: string;
  fileUrl: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  mimeType?: string;
  uploadedByName?: string;
  uploadedByRole?: string;
  uploadedAt: string;
}

export interface ActivePilotDetail {
  project: ActivePilotSummary;
  milestones: Milestone[];
  disbursements: DisbursementTranche[];
  recentDiscussions: DiscussionMessage[];
  documents: PilotDocument[];

  totalMilestonesCount: number;
  completedMilestonesCount: number;
  pendingReviewMilestonesCount: number;

  totalCommittedGrant: number;
  totalCommittedFormatted: string;
  totalDisbursedGrant: number;
  totalDisbursedFormatted: string;
  remainingGrant: number;
  remainingFormatted: string;
}

export interface ActivePilotsOverview {
  totalPilotsCount: number;
  activePilotsCount: number;
  pendingMilestonesCount: number;
  atRiskPilotsCount: number;
  completedPilotsCount: number;

  totalCommittedAmount: number;
  totalCommittedFormatted: string;
  totalDisbursedAmount: number;
  totalDisbursedFormatted: string;
  overallDisbursedPercentage: number;
}

export type ActivePilotsSortOption =
  | "NEWEST"
  | "NEXT_DUE"
  | "PROGRESS_HIGH"
  | "PROGRESS_LOW"
  | "BUDGET_HIGH"
  | "BUDGET_LOW";

export interface ActivePilotsFilterState {
  status: string;
  healthStatus: string;
  stage: string;
  search: string;
  sortBy: ActivePilotsSortOption;
  page: number;
  size: number;
}

export interface ReviewMilestonePayload {
  action: "APPROVE" | "REQUEST_REVISION";
  reviewRemarks?: string;
}

export interface ReleaseDisbursementPayload {
  disbursementId: number;
  paymentMethod?: string;
  utrNumber?: string;
  receiptDocUrl?: string;
  notes?: string;
  disbursedDate?: string;
}

export interface PostDiscussionPayload {
  message: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface UpdatePilotHealthPayload {
  healthStatus: PilotHealthStatus;
}
