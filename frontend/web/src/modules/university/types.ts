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

export interface RoutedChallenge {
  id: number;
  ticketId: string;
  title: string;
  description: string;
  domain: string;
  sector: string;
  district: string;
  block?: string;
  urgency: string;
  matchScore: string;
  problemSnippet: string;
  affectedPopulation?: number;
  status: string;
  createdAt: string;
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
