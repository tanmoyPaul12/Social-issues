import { useAuthStore } from "@/lib/store/useAuthStore";
import {
  CompanyProfile,
  UpdateCompanyProfilePayload,
  IndustryTeamMember,
  InviteTeamMemberPayload,
  UpdateTeamMemberRolePayload,
  CorporateNotificationPreferences,
  UpdateNotificationPreferencesPayload,
  TeamMemberStatus,
} from "../types/companySettings";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080/api";

function getHeaders(token?: string | null): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  }
  return headers;
}

function getStoredProfile(): CompanyProfile {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("social_issues_company_profile_v1");
      if (stored) return JSON.parse(stored);
    } catch (e) {}
  }
  const user = useAuthStore.getState().user;
  const companyName = user?.orgName || user?.companyName || user?.name || "Corporate CSR Partner";
  return {
    id: 1,
    companyName: companyName,
    companyType: "Public Limited Enterprise",
    partnerCategory: "LARGE_ENTERPRISE",
    dpiitRecognitionNumber: "",
    udyamRegistrationNumber: "",
    taxExemptionNumber: "",
    institutionRegNumber: "",
    gstin: "",
    cinNumber: "",
    csrNumber: "",
    panNumber: "",
    registeredAddress: "",
    state: "Jharkhand",
    district: "East Singhbhum",
    pincode: "831001",
    website: "",
    contactEmail: user?.email || "csr@company.com",
    contactPhone: user?.phone || "+91 98350 12345",
    annualCsrBudget: 25000000,
    annualCsrBudgetFormatted: "₹2.50 Cr",
    companyScale: "Large Enterprise",
    aboutCompany: "Registered corporate enterprise participating in societal innovation & CSR co-funding.",
    spocName: user?.name || "Corporate Admin",
    designation: user?.designation || "Head of Corporate Social Responsibility",
    verificationStatus: "APPROVED",
    sectorList: ["AGRICULTURE", "WATER", "ENVIRONMENT", "EDUCATION"],
    totalTeamMembersCount: 1,
    activePilotsCount: 0,
  };
}

/**
 * 1. Fetch Comprehensive Corporate Profile & Statutory Particulars
 */
export async function fetchCompanyProfile(token?: string | null): Promise<CompanyProfile> {
  try {
    const url = `${API_BASE_URL}/industry/profile`;
    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(token),
      cache: "no-store",
    });

    if (response.ok) {
      const data = await response.json();
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("social_issues_company_profile_v1", JSON.stringify(data));
        } catch (e) {}
      }
      return data;
    }
  } catch (err) {
    console.warn("Backend fetch company profile notice (falling back to local store):", err);
  }

  return getStoredProfile();
}

/**
 * 2. Update Corporate Profile & Statutory Particulars
 */
export async function updateCompanyProfile(
  token: string | null | undefined,
  payload: UpdateCompanyProfilePayload
): Promise<CompanyProfile> {
  const current = getStoredProfile();
  const updatedProfile: CompanyProfile = {
    ...current,
    ...payload,
    companyName: payload.companyName || current.companyName,
    sectorList: payload.sectors || current.sectorList,
    annualCsrBudgetFormatted: payload.annualCsrBudget
      ? `₹${(payload.annualCsrBudget / 10000000).toFixed(2)} Cr`
      : current.annualCsrBudgetFormatted,
  };

  // 1. Save locally to localStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("social_issues_company_profile_v1", JSON.stringify(updatedProfile));
    } catch (e) {}
  }

  // 2. Update AuthStore User state so app headers/dashboards reflect updated name immediately
  if (payload.companyName) {
    try {
      useAuthStore.setState((state) => ({
        user: state.user
          ? { ...state.user, orgName: payload.companyName, companyName: payload.companyName }
          : state.user,
      }));

      // 3. Save to registered industries list for University pitches
      const storedInds = localStorage.getItem("social_issues_registered_industries_v1");
      const list: string[] = storedInds ? JSON.parse(storedInds) : [];
      if (!list.includes(payload.companyName.trim())) {
        list.push(payload.companyName.trim());
        localStorage.setItem("social_issues_registered_industries_v1", JSON.stringify(list));
      }
    } catch (e) {}
  }

  // 4. Try backend save if token is present
  try {
    const url = `${API_BASE_URL}/industry/profile`;
    const response = await fetch(url, {
      method: "PUT",
      headers: getHeaders(token),
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const serverProfile = await response.json();
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("social_issues_company_profile_v1", JSON.stringify(serverProfile));
        } catch (e) {}
      }
      return serverProfile;
    }
  } catch (err) {
    console.warn("Backend update company profile notice (saved locally):", err);
  }

  return updatedProfile;
}

/**
 * 3. Fetch All Corporate Team Members & Role Permissions
 */
function getDefaultTeamMembers(): IndustryTeamMember[] {
  const user = useAuthStore.getState().user;
  return [
    {
      id: 1,
      industryProfileId: 1,
      fullName: user?.name || "Corporate Admin",
      email: user?.email || "admin@company.com",
      designation: user?.designation || "Head of Corporate Social Responsibility",
      corporateRole: "CSR_ADMIN",
      roleDescription: "Full administrative access to CSR co-funding, RBAC and statutory compliance",
      canCommitGrants: true,
      canApproveDisbursements: true,
      canManageTeam: true,
      canEditProfile: true,
      canVerifyUcs: true,
      status: "ACTIVE",
      invitedAt: new Date().toISOString(),
      lastActiveAt: "Just now",
      createdAt: new Date().toISOString(),
    },
  ];
}

export async function fetchCompanyTeamMembers(token?: string | null): Promise<IndustryTeamMember[]> {
  try {
    const url = `${API_BASE_URL}/industry/profile/team`;
    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(token),
      cache: "no-store",
    });

    if (response.ok) {
      const data = await response.json();
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("social_issues_company_team_v1", JSON.stringify(data));
        } catch (e) {}
      }
      return data;
    }
  } catch (err) {
    console.warn("Backend fetch team members notice:", err);
  }

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("social_issues_company_team_v1");
      if (stored) return JSON.parse(stored);
    } catch (e) {}
  }
  return getDefaultTeamMembers();
}

/**
 * 4. Invite New Corporate Team Member
 */
export async function inviteCompanyTeamMember(
  token: string | null | undefined,
  payload: InviteTeamMemberPayload
): Promise<IndustryTeamMember> {
  const newMember: IndustryTeamMember = {
    id: Date.now(),
    industryProfileId: 1,
    fullName: payload.fullName,
    email: payload.email,
    designation: payload.designation || "CSR Manager",
    corporateRole: payload.corporateRole,
    roleDescription: "Corporate member participating in CSR grant allocations",
    canCommitGrants: payload.canCommitGrants ?? false,
    canApproveDisbursements: payload.canApproveDisbursements ?? false,
    canManageTeam: payload.canManageTeam ?? false,
    canEditProfile: payload.canEditProfile ?? false,
    canVerifyUcs: payload.canVerifyUcs ?? false,
    status: "INVITED",
    invitedAt: new Date().toISOString(),
    lastActiveAt: "Pending acceptance",
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const existing = await fetchCompanyTeamMembers(token);
      const updated = [...existing, newMember];
      localStorage.setItem("social_issues_company_team_v1", JSON.stringify(updated));
    } catch (e) {}
  }

  try {
    const url = `${API_BASE_URL}/industry/profile/team/invite`;
    const response = await fetch(url, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn("Backend invite team member notice:", err);
  }

  return newMember;
}

/**
 * 5. Update Team Member Corporate Role & Granular Permissions
 */
export async function updateCompanyTeamMemberRole(
  token: string | null | undefined,
  memberId: number,
  payload: UpdateTeamMemberRolePayload
): Promise<IndustryTeamMember> {
  let updatedMember: IndustryTeamMember | null = null;
  if (typeof window !== "undefined") {
    try {
      const existing = await fetchCompanyTeamMembers(token);
      const updated = existing.map((m) => {
        if (m.id === memberId) {
          const u: IndustryTeamMember = {
            ...m,
            corporateRole: payload.corporateRole,
            designation: payload.designation || m.designation,
            canCommitGrants: payload.canCommitGrants ?? m.canCommitGrants,
            canApproveDisbursements: payload.canApproveDisbursements ?? m.canApproveDisbursements,
            canManageTeam: payload.canManageTeam ?? m.canManageTeam,
            canEditProfile: payload.canEditProfile ?? m.canEditProfile,
            canVerifyUcs: payload.canVerifyUcs ?? m.canVerifyUcs,
          };
          updatedMember = u;
          return u;
        }
        return m;
      });
      localStorage.setItem("social_issues_company_team_v1", JSON.stringify(updated));
    } catch (e) {}
  }

  try {
    const url = `${API_BASE_URL}/industry/profile/team/${memberId}/role`;
    const response = await fetch(url, {
      method: "PUT",
      headers: getHeaders(token),
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn("Backend update member role notice:", err);
  }

  return updatedMember || {
    id: memberId,
    industryProfileId: 1,
    fullName: "Team Member",
    email: "member@company.com",
    designation: payload.designation || "Corporate Manager",
    corporateRole: payload.corporateRole,
    roleDescription: "Updated corporate member permissions",
    canCommitGrants: payload.canCommitGrants ?? false,
    canApproveDisbursements: payload.canApproveDisbursements ?? false,
    canManageTeam: payload.canManageTeam ?? false,
    canEditProfile: payload.canEditProfile ?? false,
    canVerifyUcs: payload.canVerifyUcs ?? false,
    status: "ACTIVE",
    invitedAt: new Date().toISOString(),
    lastActiveAt: "Just now",
    createdAt: new Date().toISOString(),
  };
}

/**
 * 6. Update Team Member Status (Active / Suspended)
 */
export async function updateCompanyTeamMemberStatus(
  token: string | null | undefined,
  memberId: number,
  status: TeamMemberStatus
): Promise<IndustryTeamMember> {
  let updatedMember: IndustryTeamMember | null = null;
  if (typeof window !== "undefined") {
    try {
      const existing = await fetchCompanyTeamMembers(token);
      const updated = existing.map((m) => {
        if (m.id === memberId) {
          const u: IndustryTeamMember = { ...m, status: status };
          updatedMember = u;
          return u;
        }
        return m;
      });
      localStorage.setItem("social_issues_company_team_v1", JSON.stringify(updated));
    } catch (e) {}
  }

  try {
    const url = `${API_BASE_URL}/industry/profile/team/${memberId}/status?status=${status}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: getHeaders(token),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn("Backend update member status notice:", err);
  }

  return updatedMember || {
    id: memberId,
    industryProfileId: 1,
    fullName: "Team Member",
    email: "member@company.com",
    designation: "Corporate Manager",
    corporateRole: "CSR_ADMIN",
    roleDescription: "Corporate member account",
    canCommitGrants: true,
    canApproveDisbursements: true,
    canManageTeam: true,
    canEditProfile: true,
    canVerifyUcs: true,
    status: status,
    invitedAt: new Date().toISOString(),
    lastActiveAt: "Just now",
    createdAt: new Date().toISOString(),
  };
}

/**
 * 7. Remove Team Member from Company Account
 */
export async function deleteCompanyTeamMember(
  token: string | null | undefined,
  memberId: number
): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const existing = await fetchCompanyTeamMembers(token);
      const updated = existing.filter((m) => m.id !== memberId);
      localStorage.setItem("social_issues_company_team_v1", JSON.stringify(updated));
    } catch (e) {}
  }

  try {
    const url = `${API_BASE_URL}/industry/profile/team/${memberId}`;
    await fetch(url, {
      method: "DELETE",
      headers: getHeaders(token),
    });
  } catch (err) {
    console.warn("Backend delete team member notice:", err);
  }
}

/**
 * 8. Resend Invitation Token Email
 */
export async function resendCompanyInvitation(
  token: string | null | undefined,
  memberId: number
): Promise<IndustryTeamMember> {
  const existing = await fetchCompanyTeamMembers(token);
  const target = existing.find((m) => m.id === memberId) || {
    id: memberId,
    industryProfileId: 1,
    fullName: "Invited Partner",
    email: "partner@company.com",
    designation: "CSR Manager",
    corporateRole: "CSR_ADMIN" as const,
    roleDescription: "Invited corporate member",
    canCommitGrants: false,
    canApproveDisbursements: false,
    canManageTeam: false,
    canEditProfile: false,
    canVerifyUcs: false,
    status: "INVITED" as const,
    invitedAt: new Date().toISOString(),
    lastActiveAt: "Pending acceptance",
    createdAt: new Date().toISOString(),
  };

  try {
    const url = `${API_BASE_URL}/industry/profile/team/resend-invite/${memberId}`;
    const response = await fetch(url, {
      method: "POST",
      headers: getHeaders(token),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn("Backend resend invite notice:", err);
  }

  return target;
}

/**
 * 9. Fetch Research Domain Subscriptions & Notification Preferences
 */
function getDefaultPreferences(): CorporateNotificationPreferences {
  const user = useAuthStore.getState().user;
  return {
    id: 1,
    industryProfileId: 1,
    preferredSectors: ["AGRICULTURE", "WATER", "ENVIRONMENT", "EDUCATION"],
    minReadinessLevel: "TRL_3",
    notifyNewMatchingProjects: true,
    notifyMilestoneSubmissions: true,
    notifyDisbursementTrancheDue: true,
    notifyComplianceDeadlines: true,
    notifyDiscussionMessages: true,
    emailDigestFrequency: "DAILY_DIGEST",
    alertEmail: user?.email || "csr@company.com",
  };
}

export async function fetchNotificationPreferences(
  token?: string | null
): Promise<CorporateNotificationPreferences> {
  try {
    const url = `${API_BASE_URL}/industry/profile/preferences`;
    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(token),
      cache: "no-store",
    });

    if (response.ok) {
      const data = await response.json();
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("social_issues_company_prefs_v1", JSON.stringify(data));
        } catch (e) {}
      }
      return data;
    }
  } catch (err) {
    console.warn("Backend fetch preferences notice:", err);
  }

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("social_issues_company_prefs_v1");
      if (stored) return JSON.parse(stored);
    } catch (e) {}
  }

  return getDefaultPreferences();
}

/**
 * 10. Update Research Domain Subscriptions & Notification Preferences
 */
export async function updateNotificationPreferences(
  token: string | null | undefined,
  payload: UpdateNotificationPreferencesPayload
): Promise<CorporateNotificationPreferences> {
  const current = await fetchNotificationPreferences(token);
  const updated: CorporateNotificationPreferences = {
    ...current,
    ...payload,
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("social_issues_company_prefs_v1", JSON.stringify(updated));
    } catch (e) {}
  }

  try {
    const url = `${API_BASE_URL}/industry/profile/preferences`;
    const response = await fetch(url, {
      method: "PUT",
      headers: getHeaders(token),
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("social_issues_company_prefs_v1", JSON.stringify(data));
        } catch (e) {}
      }
      return data;
    }
  } catch (err) {
    console.warn("Backend update preferences notice:", err);
  }

  return updated;
}
