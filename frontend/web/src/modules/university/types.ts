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
  | "DOCUMENT"
  | "CAD_DESIGN"
  | "SOURCE_CODE"
  | "TEST_BENCH_DATA"
  | "FIELD_TRIAL_REPORT"
  | "PATENT_DRAFT"
  | "USER_FEEDBACK_SIGN_OFF"
  | "VIDEO_DEMO";

export type MilestoneStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "APPROVED"
  | "REVISION_REQUESTED";

export interface DeliverableDto {
  id: number;
  milestoneId: number;
  title: string;
  deliverableType: DeliverableType;
  fileUrl?: string;
  fileSizeBytes?: number;
  notes?: string;
  submittedBy?: string;
  submittedAt: string;
  isVerified: boolean;
}

export interface MilestoneDto {
  id: number;
  projectId: number;
  stageOrder: number;
  title: string;
  description: string;
  targetTrl: number;
  status: MilestoneStatus;
  targetDueDate?: string;
  completedDate?: string;
  reviewNotes?: string;
  reviewedBy?: string;
  deliverables: DeliverableDto[];
}

export interface CreateMilestoneRequest {
  stageOrder: number;
  title: string;
  description?: string;
  targetTrl?: number;
  targetDueDate?: string;
}

export interface SubmitDeliverableRequest {
  title: string;
  deliverableType: DeliverableType;
  fileUrl: string;
  fileSizeBytes?: number;
  notes?: string;
  submittedBy?: string;
}

export interface ReviewMilestoneRequest {
  status: MilestoneStatus;
  reviewNotes?: string;
  reviewedBy?: string;
}

export type TestType =
  | "SIMULATION"
  | "BENCH_TEST"
  | "FIELD_TRIAL"
  | "USER_STUDY"
  | "SAFETY_CERTIFICATION";

export type TestPassStatus =
  | "PASSED"
  | "FAILED"
  | "INCONCLUSIVE"
  | "CONDITIONAL_PASS";

export interface TestResultDto {
  id: number;
  projectId: number;
  testType: TestType;
  title: string;
  trlLevel: number;
  status: TestPassStatus;
  quantitativeMetrics?: string;
  evidenceDocumentUrl?: string;
  testedLocation?: string;
  testedAt: string;
  testedBy?: string;
}

export interface RecordTestResultRequest {
  testType: TestType;
  title: string;
  trlLevel: number;
  status: TestPassStatus;
  quantitativeMetrics?: string;
  evidenceDocumentUrl?: string;
  testedLocation?: string;
  testedBy?: string;
}

export type ApprovalStage =
  | "LAB_PROTOTYPE_SIGN_OFF"
  | "FIELD_TEST_SIGN_OFF"
  | "MOU_APPROVAL"
  | "FINAL_RESOLUTION";

export type ApproverRole =
  | "CITIZEN_REPORTER"
  | "NODAL_GOVT_OFFICER"
  | "FACULTY_MENTOR"
  | "INDUSTRY_SPONSOR";

export type ApprovalStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "REQUESTED_CHANGES";

export interface ApprovalSignoffDto {
  id: number;
  projectId: number;
  stage: ApprovalStage;
  approverRole: ApproverRole;
  approverName: string;
  approverDesignation?: string;
  approverEntity?: string;
  status: ApprovalStatus;
  digitalSignatureHash?: string;
  satisfactionRating?: number;
  feedbackNotes?: string;
  signedAt: string;
}

export interface SubmitSignoffRequest {
  stage: ApprovalStage;
  approverRole: ApproverRole;
  approverName: string;
  approverDesignation?: string;
  approverEntity?: string;
  status: ApprovalStatus;
  satisfactionRating?: number;
  feedbackNotes?: string;
}

export interface DualClosedLoopStatusDto {
  projectId: number;
  issueId?: number;
  citizenSigned: boolean;
  citizenSignedAt?: string;
  citizenSignerName?: string;
  citizenRating?: number;
  govtSigned: boolean;
  govtSignedAt?: string;
  govtSignerName?: string;
  govtDesignation?: string;
  isFullyResolved: boolean;
  resolutionCertificateId?: string;
}

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
  royaltyTerms?: string;
  createdAt: string;
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
  royaltyTerms?: string;
}

