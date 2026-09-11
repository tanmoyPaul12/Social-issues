export type CorporateRole = "CSR_ADMIN" | "FINANCE_APPROVER" | "PROJECT_MANAGER" | "CSR_VIEWER";
export type TeamMemberStatus = "INVITED" | "ACTIVE" | "SUSPENDED";
export type EmailDigestFrequency = "INSTANT" | "DAILY_DIGEST" | "WEEKLY_DIGEST" | "MUTED";

export type PartnerCategory =
  | "LARGE_ENTERPRISE"
  | "STARTUP"
  | "MSME"
  | "CSR_ORGANIZATION"
  | "RESEARCH_INSTITUTION"
  | "INNOVATION_HUB";

export interface PartnerCategoryOption {
  id: PartnerCategory;
  label: string;
  description: string;
}

export const PARTNER_CATEGORY_OPTIONS: PartnerCategoryOption[] = [
  { id: "LARGE_ENTERPRISE", label: "Large Enterprise / Corporate", description: "Companies with > ₹500 Cr turnover or statutory CSR obligations" },
  { id: "STARTUP", label: "Startup (DPIIT Recognized)", description: "Early-stage or growth tech startups registered with DPIIT" },
  { id: "MSME", label: "MSME (Udyam Registered)", description: "Micro, Small & Medium Enterprises with Udyam Registration" },
  { id: "CSR_ORGANIZATION", label: "CSR Organization / Foundation / NGO", description: "Non-profit foundations, CSR implementing agencies (12A/80G)" },
  { id: "RESEARCH_INSTITUTION", label: "Research Institution / Lab", description: "Academic institutions, CSIR / ICAR / DST laboratories" },
  { id: "INNOVATION_HUB", label: "Innovation Hub / Incubator / Accelerator", description: "Technology Business Incubators (TBIs), CoEs, Science Parks" },
];

export interface ResearchDomainOption {
  id: string;
  label: string;
  scheduleViiRef?: string;
}

export const JHARKHAND_RESEARCH_DOMAINS: ResearchDomainOption[] = [
  { id: "AGRICULTURE", label: "Smart Agriculture & Post-Harvest Agritech", scheduleViiRef: "Item (iv) - Agro forestry & rural livelihoods" },
  { id: "WATER", label: "Clean Water Treatment & Groundwater Recharge", scheduleViiRef: "Item (i) - Eradicating hunger, poverty and malnutrition, promoting health care and sanitation" },
  { id: "HEALTH", label: "Public Health & Remote Diagnostics", scheduleViiRef: "Item (i) - Preventive health care" },
  { id: "EDUCATION", label: "STEM Education & Tribal Youth Skilling", scheduleViiRef: "Item (ii) - Promoting education & employment enhancing vocation skills" },
  { id: "ENVIRONMENT", label: "Mining Sustainability & Ecological Restoration", scheduleViiRef: "Item (iv) - Ensuring environmental sustainability & ecological balance" },
  { id: "ELECTRICITY", label: "Renewable Energy & Off-Grid Solar Systems", scheduleViiRef: "Item (iv) - Conservation of natural resources" },
  { id: "INFRASTRUCTURE", label: "Rural Infrastructure & Cold Chain Logistics", scheduleViiRef: "Item (x) - Rural development projects" },
  { id: "LIVELIHOOD", label: "Tribal Handicrafts & Women Entrepreneurship", scheduleViiRef: "Item (iii) - Promoting gender equality & empowering women" },
  { id: "GOVERNANCE", label: "Civic Technology & Public Delivery Systems", scheduleViiRef: "Item (ix) - Public funded incubators & research institutions" },
];

export interface CompanyProfile {
  id: number;
  ownerUserId?: number;
  companyName: string;
  companyType: string;
  partnerCategory?: PartnerCategory;
  dpiitRecognitionNumber?: string;
  udyamRegistrationNumber?: string;
  taxExemptionNumber?: string;
  institutionRegNumber?: string;
  gstin: string;
  cinNumber: string;
  csrNumber: string;
  panNumber: string;

  registeredAddress: string;
  state: string;
  district: string;
  pincode: string;
  website: string;
  contactEmail: string;
  contactPhone: string;

  annualCsrBudget: number;
  annualCsrBudgetFormatted: string;
  companyScale: string;
  aboutCompany: string;

  spocName: string;
  designation: string;
  sectorList: string[];

  verificationStatus: "APPROVED" | "PENDING" | "REJECTED";
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt?: string;
  updatedAt?: string;

  totalTeamMembersCount: number;
  activePilotsCount: number;
}

export interface UpdateCompanyProfilePayload {
  companyName: string;
  companyType?: string;
  partnerCategory?: PartnerCategory;
  dpiitRecognitionNumber?: string;
  udyamRegistrationNumber?: string;
  taxExemptionNumber?: string;
  institutionRegNumber?: string;
  gstin?: string;
  cinNumber?: string;
  csrNumber?: string;
  panNumber?: string;
  registeredAddress?: string;
  state?: string;
  district?: string;
  pincode?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  annualCsrBudget?: number;
  companyScale?: string;
  aboutCompany?: string;
  spocName?: string;
  designation?: string;
  sectors?: string[];
}

export interface IndustryTeamMember {
  id: number;
  industryProfileId: number;
  userId?: number;
  fullName: string;
  email: string;
  phone?: string;
  designation?: string;
  corporateRole: CorporateRole;
  roleDescription: string;

  canCommitGrants: boolean;
  canApproveDisbursements: boolean;
  canManageTeam: boolean;
  canEditProfile: boolean;
  canVerifyUcs: boolean;

  status: TeamMemberStatus;
  invitationToken?: string;
  invitedByUserId?: number;
  invitedByName?: string;
  invitedAt?: string;
  joinedAt?: string;
  lastActiveAt?: string;
  createdAt: string;
}

export interface InviteTeamMemberPayload {
  fullName: string;
  email: string;
  phone?: string;
  designation?: string;
  corporateRole: CorporateRole;
  canCommitGrants?: boolean;
  canApproveDisbursements?: boolean;
  canManageTeam?: boolean;
  canEditProfile?: boolean;
  canVerifyUcs?: boolean;
}

export interface UpdateTeamMemberRolePayload {
  corporateRole: CorporateRole;
  designation?: string;
  canCommitGrants?: boolean;
  canApproveDisbursements?: boolean;
  canManageTeam?: boolean;
  canEditProfile?: boolean;
  canVerifyUcs?: boolean;
}

export interface CorporateNotificationPreferences {
  id: number;
  industryProfileId: number;
  preferredSectors: string[];
  minReadinessLevel: string;
  notifyNewMatchingProjects: boolean;
  notifyMilestoneSubmissions: boolean;
  notifyDisbursementTrancheDue: boolean;
  notifyComplianceDeadlines: boolean;
  notifyDiscussionMessages: boolean;
  emailDigestFrequency: EmailDigestFrequency;
  alertEmail: string;
}

export interface UpdateNotificationPreferencesPayload {
  preferredSectors?: string[];
  minReadinessLevel?: string;
  notifyNewMatchingProjects?: boolean;
  notifyMilestoneSubmissions?: boolean;
  notifyDisbursementTrancheDue?: boolean;
  notifyComplianceDeadlines?: boolean;
  notifyDiscussionMessages?: boolean;
  emailDigestFrequency?: EmailDigestFrequency;
  alertEmail?: string;
}
