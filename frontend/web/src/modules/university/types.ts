export type UniversityProjectStage =
  | "TEAM_FORMATION"
  | "LAB_PROTOTYPING"
  | "FIELD_PILOT"
  | "DEPLOYMENT_HANDOVER"
  | "COMPLETED";

export type TeamMemberRole =
  | "FACULTY_MENTOR"
  | "CO_FACULTY_GUIDE"
  | "STUDENT_INNOVATOR"
  | "DEPARTMENT_HEAD"
  | "LAB_TECHNICIAN";

export interface TeamMember {
  id?: number;
  role: TeamMemberRole;
  name: string;
  identifier?: string;
  department?: string;
  email?: string;
  phone?: string;
  yearOrDesignation?: string;
  abcCredits?: number;
  isLead?: boolean;
}

export interface UniversityProject {
  id: number;
  projectCode: string;
  issueId?: number;
  ticketId?: string;
  aisheCode: string;
  universityName: string;
  title: string;
  abstractDescription?: string;
  domain?: string;
  district?: string;
  stage: UniversityProjectStage;
  progress: number;
  facultyMentor?: string;
  studentLead?: string;
  grantFunded?: number;
  allocatedGrant?: number;
  csrPartner?: string;
  milestoneDesc?: string;
  
  // Citizen & Municipal Field Verification Loop
  citizenVerificationStatus?: "AWAITING_DEPLOYMENT" | "PENDING_VERIFICATION" | "VERIFIED" | "REVISION_REQUESTED";
  citizenRating?: number;
  citizenFeedback?: string;
  citizenProofImageUrl?: string;
  verifiedByCitizenName?: string;

  // Industry CSR Sponsorship & Mentorship Hub
  isSeekingCsrGrant?: boolean;
  requestedCsrAmount?: number;
  csrPitchDescription?: string;
  csrMentorNeeds?: string;
  csrFundedAmount?: number;
  csrSponsorCompany?: string;

  teamMembers?: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export interface ModalityBreakdownData {
  text_analysis?: { category?: string; priority_score?: number; confidence?: number; keywords?: string[] };
  image_analysis?: { category?: string; priority_score?: number; confidence?: number; detected_hazards?: string[]; visual_verification?: string };
  document_analysis?: { category?: string; priority_score?: number; confidence?: number; extracted_metrics?: string };
  location_analysis?: { is_valid?: boolean; district?: string; is_in_jharkhand?: boolean; urgency_bonus?: number; geofence_status?: string };
}

export interface GeneralizedConsensusData {
  final_category: string;
  average_priority_score: number;
  final_priority_level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | string;
  consensus_reason: string;
}

export interface AiTriageRecommendation {
  recommendedTechnology?: string;
  suggestedDepartment?: string;
  targetTechStack?: string[];
  requiredSkills?: string[];
  estimatedTimelineWeeks?: number;
  seedBudgetINR?: number;
  deliverables?: string[];
}

export interface RoutedChallenge {
  id: number;
  ticketId: string;
  title: string;
  description: string;
  domain: string;
  sector: string;
  district: string;
  block?: string;
  villageOrWard?: string;
  addressDescription?: string;
  latitude?: number | null;
  longitude?: number | null;
  urgency: string;
  matchScore: string;
  problemSnippet: string;
  affectedPopulation?: number;
  status: string;
  createdAt: string;

  // Citizen Voice & Origin
  originalText?: string;
  normalizedText?: string;
  citizenName?: string;
  citizenPhone?: string;
  citizenEmail?: string;

  // Two-Track & Societal Challenge Cluster Fields
  track?: "RESEARCH_INNOVATION" | "MUNICIPAL_DISPATCH";
  clusterCode?: string;
  clusterTitle?: string;
  clusterIncidentCount?: number;
  clusterTotalPopulation?: number;
  clusterDistricts?: string[];
  clusterFacilities?: string[];
  clusterEvidence?: Array<{
    id: string;
    ticketId: string;
    location: string;
    reporter: string;
    date: string;
    summary: string;
    originalQuote?: string;
    imageUrl?: string;
    status: string;
    isPrimary?: boolean;
  }>;
  patentPotential?: string;

  // Attachments & Evidence
  imageUrl?: string | null;
  pdfUrl?: string | null;
  pdfFileName?: string;
  pdfExtractedText?: string;
  attachmentCount?: number;

  // AI Multimodal Intelligence & Triage
  validationStatus?: string;
  validationReportJson?: string;
  isDuplicate?: boolean;
  duplicateClusterId?: string;
  modalityBreakdown?: ModalityBreakdownData;
  generalizedConsensus?: GeneralizedConsensusData;
  aiRecommendation?: AiTriageRecommendation;
}

export interface ChallengeClaimRequest {
  issueId: number;
  aisheCode: string;
  universityName?: string;
  nodalSpocName?: string;
  leadFacultyName?: string;
  proposedApproach: string;
  estimatedTimelineMonths?: number;
}

export interface CreateProjectRequest {
  issueId?: number;
  ticketId?: string;
  aisheCode: string;
  universityName?: string;
  title: string;
  abstractDescription?: string;
  domain?: string;
  district?: string;
  leadFacultyMentor?: string;
  leadStudentInnovator?: string;
  allocatedGrant?: number;
  csrPartner?: string;
  milestoneDesc?: string;
  teamMembers?: TeamMember[];
}

export interface IndustryOffer {
  id: number;
  projectId?: number;
  projectTitle: string;
  company: string;
  industryProfileName?: string;
  engagementType: string;
  offeredAmount: number;
  mentorName?: string;
  mentorDesignation?: string;
  mentorEmail?: string;
  status: string;
  messageNotes?: string;
  createdAt?: string;
}

export interface CsrPitchRequest {
  requestedAmount: number;
  pitchDescription: string;
  mentorNeeds?: string;
  targetSponsorCompany?: string;
}

export interface CitizenVerificationRequest {
  citizenRating: number;
  feedback: string;
  proofImageUrl?: string;
  verifiedByCitizenName?: string;
}

export interface AccreditationReport {
  institutionName: string;
  aisheCode: string;
  totalProjects: number;
  completedDeployments: number;
  activePrototypes: number;
  totalCommunityHours: number;
  totalAbcCreditsDisbursed: number;
  totalCitizenBeneficiaries: number;
  participatingStudentsCount: number;
  participatingFacultyCount: number;
  naacCriteriaScore: string;
  nirfRankContribution: string;
  sdgBreakdown: Record<string, number>;
}

export interface LiveNotificationEvent {
  eventId: string;
  eventType: string;
  title: string;
  message: string;
  recipientUserId?: string;
  severity: "INFO" | "SUCCESS" | "WARNING" | "URGENT";
  actionUrl?: string;
  timestamp: string;
}

// ==========================================
// Project Lifecycle Management Types
// ==========================================

export type DeliverableType =
  | "HARDWARE_SCHEMATIC"
  | "SOURCE_CODE_REPO"
  | "LAB_REPORT"
  | "FIELD_TEST_DATA"
  | "VIDEO_DEMO"
  | "USER_MANUAL"
  | "MOU_AGREEMENT"
  | "DOCUMENT"
  | "CAD_DESIGN"
  | "SOURCE_CODE"
  | "TEST_BENCH_DATA"
  | "FIELD_TRIAL_REPORT"
  | "PATENT_DRAFT"
  | "USER_FEEDBACK_SIGN_OFF"
  | "OTHER";

export type MilestoneStatus =
  | "UPCOMING"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "SUBMITTED_FOR_REVIEW"
  | "APPROVED"
  | "REVISION_REQUESTED"
  | "NOT_STARTED";

export interface DeliverableDto {
  id: number;
  milestoneId?: number;
  title: string;
  description?: string;
  deliverableType: DeliverableType;
  fileUrl?: string;
  fileStorageKey?: string;
  fileSizeBytes?: number;
  externalRepoUrl?: string;
  submittedByUserId?: number;
  submittedByName?: string;
  submittedBy?: string;
  submittedAt?: string;
  isApproved?: boolean;
  isVerified?: boolean;
  reviewNotes?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MilestoneDto {
  id: number;
  projectId: number;
  milestoneNumber?: number;
  stageOrder?: number;
  title: string;
  deliverableSummary?: string;
  description?: string;
  targetDate?: string;
  targetDueDate?: string;
  completedDate?: string;
  status: MilestoneStatus;
  targetTrl?: number;
  trancheAmount?: number;
  completionPercentage?: number;
  reviewRemarks?: string;
  reviewNotes?: string;
  reviewedByUserId?: number;
  reviewedBy?: string;
  reviewedAt?: string;
  deliverables: DeliverableDto[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMilestoneRequest {
  milestoneNumber?: number;
  stageOrder?: number;
  title: string;
  deliverableSummary?: string;
  description?: string;
  targetDate?: string;
  targetDueDate?: string;
  targetTrl?: number;
  trancheAmount?: number;
}

export interface SubmitDeliverableRequest {
  title: string;
  description?: string;
  deliverableType: DeliverableType;
  fileUrl?: string;
  fileStorageKey?: string;
  fileSizeBytes?: number;
  externalRepoUrl?: string;
  submittedByName?: string;
  submittedBy?: string;
  notes?: string;
}

export interface ReviewMilestoneRequest {
  status: MilestoneStatus;
  reviewRemarks?: string;
  reviewNotes?: string;
  reviewedBy?: string;
}

export type TestType =
  | "LAB_BENCHMARK"
  | "SIMULATION"
  | "SANDBOX_PILOT"
  | "DISTRICT_FIELD_TRIAL"
  | "SAFETY_COMPLIANCE"
  | "BENCH_TEST"
  | "FIELD_TRIAL"
  | "USER_STUDY"
  | "SAFETY_CERTIFICATION";

export type TestPassStatus =
  | "PASSED"
  | "FAILED"
  | "CONDITIONALLY_PASSED"
  | "CONDITIONAL_PASS"
  | "UNDER_EVALUATION"
  | "INCONCLUSIVE";

export interface TestResultDto {
  id: number;
  projectId: number;
  testTitle?: string;
  title?: string;
  testType: TestType;
  trlLevel: number;
  testLocation?: string;
  testedLocation?: string;
  testDate?: string;
  testedAt?: string;
  testedBy?: string;
  testedByUserId?: number;
  parametersJson?: string;
  quantitativeMetrics?: string;
  passStatus?: TestPassStatus;
  status?: TestPassStatus;
  observations?: string;
  evidenceAttachmentUrl?: string;
  evidenceDocumentUrl?: string;
  evidenceStorageKey?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecordTestResultRequest {
  testTitle?: string;
  title?: string;
  testType: TestType;
  trlLevel: number;
  testLocation?: string;
  testedLocation?: string;
  testDate?: string;
  testedAt?: string;
  testedBy?: string;
  parametersJson?: string;
  quantitativeMetrics?: string;
  passStatus?: TestPassStatus;
  status?: TestPassStatus;
  observations?: string;
  evidenceAttachmentUrl?: string;
  evidenceDocumentUrl?: string;
}

export type ApprovalStage =
  | "PROPOSAL"
  | "PROTOTYPE"
  | "FIELD_PILOT"
  | "DEPLOYMENT_HANDOVER"
  | "FINAL_RESOLUTION"
  | "LAB_PROTOTYPE_SIGN_OFF"
  | "FIELD_TEST_SIGN_OFF"
  | "MOU_APPROVAL";

export type ApproverRole =
  | "FACULTY_MENTOR"
  | "HEI_DEAN_SPOC"
  | "INDUSTRY_CSR_ADMIN"
  | "CITIZEN_REPORTER"
  | "NODAL_GOVT_OFFICER"
  | "INDUSTRY_SPONSOR";

export type ApprovalStatus =
  | "APPROVED"
  | "REJECTED"
  | "CHANGES_REQUESTED"
  | "REQUESTED_CHANGES"
  | "WAIVED_BY_ADMIN"
  | "PENDING";

export interface ApprovalSignoffDto {
  id: number;
  projectId: number;
  stage: ApprovalStage;
  approverRole: ApproverRole;
  approverUserId?: number;
  approverName?: string;
  approverDesignation?: string;
  approverEntity?: string;
  approvalStatus?: ApprovalStatus;
  status?: ApprovalStatus;
  remarks?: string;
  feedbackNotes?: string;
  digitalSignatureHash?: string;
  citizenRating?: number;
  satisfactionRating?: number;
  closureCertificateStorageKey?: string;
  closureCertificateUrl?: string;
  signedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubmitSignoffRequest {
  stage: ApprovalStage;
  approverRole: ApproverRole;
  approverName?: string;
  approverDesignation?: string;
  approverEntity?: string;
  approvalStatus?: ApprovalStatus;
  status?: ApprovalStatus;
  remarks?: string;
  feedbackNotes?: string;
  citizenRating?: number;
  satisfactionRating?: number;
  closureCertificateStorageKey?: string;
  closureCertificateUrl?: string;
}

export interface DualClosedLoopStatusDto {
  projectId: number;
  issueId?: number;
  citizenSignedOff?: boolean;
  citizenSigned?: boolean;
  citizenRating?: number;
  citizenRemarks?: string;
  citizenSignedAt?: string;
  citizenSignerName?: string;
  nodalOfficerSignedOff?: boolean;
  govtSigned?: boolean;
  nodalOfficerName?: string;
  govtSignerName?: string;
  govtDesignation?: string;
  closureCertificateUrl?: string;
  resolutionCertificateId?: string;
  nodalOfficerSignedAt?: string;
  govtSignedAt?: string;
  isFullyClosedAndResolved?: boolean;
  isFullyResolved?: boolean;
  isFullyClosed?: boolean;
}

export type IpType =
  | "OPEN_SOURCE"
  | "SHARED_PATENT"
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
  heiOwnershipShare?: number;
  studentInnovatorsShare?: number;
  industryPartnerShare?: number;
  govtOwnershipShare?: number;
  inventorsList?: string;
  commercialPartnerName?: string;
  mouDocumentUrl?: string;
  royaltyTerms?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateIpRecordRequest {
  title: string;
  abstractDescription?: string;
  ipType: IpType;
  patentApplicationNumber?: string;
  filingDate?: string;
  grantDate?: string;
  patentOffice?: string;
  status?: IpStatus;
  heiOwnershipShare?: number;
  studentInnovatorsShare?: number;
  industryPartnerShare?: number;
  govtOwnershipShare?: number;
  inventorsList?: string;
  commercialPartnerName?: string;
  mouDocumentUrl?: string;
  royaltyTerms?: string;
}

export interface ProjectLifecycleDossierDto {
  project: UniversityProject;
  milestones: MilestoneDto[];
  testResults: TestResultDto[];
  highestTrl: number;
  signoffs: ApprovalSignoffDto[];
  closedLoopStatus?: DualClosedLoopStatusDto;
  ipRecords: IpRecordDto[];
  totalDeliverablesCount: number;
  approvedDeliverablesCount: number;
  isNodalSignoffPending: boolean;
}

