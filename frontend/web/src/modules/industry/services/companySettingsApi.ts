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

function extractErrorMessage(errData: any, defaultMsg: string): string {
  if (!errData) return defaultMsg;
  if (typeof errData === "string") return errData;
  if (typeof errData.error === "string") return errData.error;
  if (typeof errData.error?.message === "string") return errData.error.message;
  if (typeof errData.message === "string") return errData.message;
  return defaultMsg;
}

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

/**
 * 1. Fetch Comprehensive Corporate Profile & Statutory Particulars
 */
export async function fetchCompanyProfile(token?: string | null): Promise<CompanyProfile> {
  const url = `${API_BASE_URL}/industry/profile`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(token),
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(err, `Failed to load corporate profile (Status ${response.status})`));
  }

  return response.json();
}

/**
 * 2. Update Corporate Profile & Statutory Particulars
 */
export async function updateCompanyProfile(
  token: string | null | undefined,
  payload: UpdateCompanyProfilePayload
): Promise<CompanyProfile> {
  const url = `${API_BASE_URL}/industry/profile`;

  const response = await fetch(url, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(err, `Failed to update corporate profile (Status ${response.status})`));
  }

  return response.json();
}

/**
 * 3. Fetch All Corporate Team Members & Role Permissions
 */
export async function fetchCompanyTeamMembers(token?: string | null): Promise<IndustryTeamMember[]> {
  const url = `${API_BASE_URL}/industry/profile/team`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(token),
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(err, `Failed to load corporate team (Status ${response.status})`));
  }

  return response.json();
}

/**
 * 4. Invite New Corporate Team Member
 */
export async function inviteCompanyTeamMember(
  token: string | null | undefined,
  payload: InviteTeamMemberPayload
): Promise<IndustryTeamMember> {
  const url = `${API_BASE_URL}/industry/profile/team/invite`;

  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(err, `Failed to invite team member (Status ${response.status})`));
  }

  return response.json();
}

/**
 * 5. Update Team Member Corporate Role & Granular Permissions
 */
export async function updateCompanyTeamMemberRole(
  token: string | null | undefined,
  memberId: number,
  payload: UpdateTeamMemberRolePayload
): Promise<IndustryTeamMember> {
  const url = `${API_BASE_URL}/industry/profile/team/${memberId}/role`;

  const response = await fetch(url, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(err, `Failed to update member role (Status ${response.status})`));
  }

  return response.json();
}

/**
 * 6. Update Team Member Status (Active / Suspended)
 */
export async function updateCompanyTeamMemberStatus(
  token: string | null | undefined,
  memberId: number,
  status: TeamMemberStatus
): Promise<IndustryTeamMember> {
  const url = `${API_BASE_URL}/industry/profile/team/${memberId}/status?status=${status}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: getHeaders(token),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(err, `Failed to update member status (Status ${response.status})`));
  }

  return response.json();
}

/**
 * 7. Remove Team Member from Company Account
 */
export async function deleteCompanyTeamMember(
  token: string | null | undefined,
  memberId: number
): Promise<void> {
  const url = `${API_BASE_URL}/industry/profile/team/${memberId}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: getHeaders(token),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(err, `Failed to remove member (Status ${response.status})`));
  }
}

/**
 * 8. Resend Invitation Token Email
 */
export async function resendCompanyInvitation(
  token: string | null | undefined,
  memberId: number
): Promise<IndustryTeamMember> {
  const url = `${API_BASE_URL}/industry/profile/team/resend-invite/${memberId}`;

  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(token),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(err, `Failed to resend invitation (Status ${response.status})`));
  }

  return response.json();
}

/**
 * 9. Fetch Research Domain Subscriptions & Notification Preferences
 */
export async function fetchNotificationPreferences(
  token?: string | null
): Promise<CorporateNotificationPreferences> {
  const url = `${API_BASE_URL}/industry/profile/preferences`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(token),
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(err, `Failed to load alert preferences (Status ${response.status})`));
  }

  return response.json();
}

/**
 * 10. Update Research Domain Subscriptions & Notification Preferences
 */
export async function updateNotificationPreferences(
  token: string | null | undefined,
  payload: UpdateNotificationPreferencesPayload
): Promise<CorporateNotificationPreferences> {
  const url = `${API_BASE_URL}/industry/profile/preferences`;

  const response = await fetch(url, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(err, `Failed to save alert preferences (Status ${response.status})`));
  }

  return response.json();
}
