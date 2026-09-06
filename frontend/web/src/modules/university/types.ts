export type UniversityProjectStage =
  | "TEAM_FORMATION"
  | "LAB_PROTOTYPING"
  | "FIELD_PILOT"
  | "DEPLOYMENT_HANDOVER"
  | "COMPLETED";

export type TeamMemberRole =
  | "FACULTY_MENTOR"
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
