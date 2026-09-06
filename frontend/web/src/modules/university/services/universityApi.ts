import {
  RoutedChallenge,
  UniversityProject,
  ChallengeClaimRequest,
  CreateProjectRequest,
  TeamMember,
  IndustryOffer,
  UniversityProjectStage,
} from "../types";

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
    headers["Authorization"] = token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`;
  }
  return headers;
}

export const universityApi = {
  /**
   * 1. Get challenges routed/matched by AI engine to this university
   */
  async getRoutedChallenges(aisheCode: string, token?: string | null): Promise<RoutedChallenge[]> {
    const res = await fetch(`${API_BASE_URL}/university/challenges/routed?aisheCode=${encodeURIComponent(aisheCode)}`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch routed challenges");
    return res.json();
  },

  /**
   * 2. Browse all open challenges across Jharkhand to request/claim
   */
  async getAllOpenChallenges(
    params?: { sector?: string; district?: string },
    token?: string | null
  ): Promise<RoutedChallenge[]> {
    const query = new URLSearchParams();
    if (params?.sector && params.sector !== "ALL") query.set("sector", params.sector);
    if (params?.district && params.district !== "All 24 Districts") query.set("district", params.district);

    const res = await fetch(`${API_BASE_URL}/university/challenges/open?${query.toString()}`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch open challenges");
    return res.json();
  },

  /**
   * 3. Claim an open community challenge
   */
  async claimChallenge(data: ChallengeClaimRequest, token?: string | null): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/university/challenges/claim`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to submit challenge claim");
    return res.json();
  },

  /**
   * 4. Create / Activate University R&D project with multidisciplinary team
   */
  async createProject(data: CreateProjectRequest, token?: string | null): Promise<UniversityProject> {
    const res = await fetch(`${API_BASE_URL}/university/projects`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create project");
    return res.json();
  },

  /**
   * 5. Get active projects for this university
   */
  async getProjects(aisheCode: string, token?: string | null): Promise<UniversityProject[]> {
    const res = await fetch(`${API_BASE_URL}/university/projects?aisheCode=${encodeURIComponent(aisheCode)}`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch university projects");
    return res.json();
  },

  /**
   * 6. Update project stage
   */
  async updateProjectStage(
    projectId: number,
    data: { stage: UniversityProjectStage; progressPercentage?: number; milestoneDesc?: string },
    token?: string | null
  ): Promise<UniversityProject> {
    const res = await fetch(`${API_BASE_URL}/university/projects/${projectId}/stage`, {
      method: "PATCH",
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update project stage");
    return res.json();
  },

  /**
   * 7. Add team member to project
   */
  async addTeamMember(
    projectId: number,
    member: TeamMember,
    token?: string | null
  ): Promise<TeamMember> {
    const res = await fetch(`${API_BASE_URL}/university/projects/${projectId}/team`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(member),
    });
    if (!res.ok) throw new Error("Failed to add team member");
    return res.json();
  },

  /**
   * 8. Remove team member
   */
  async removeTeamMember(
    projectId: number,
    memberId: number,
    token?: string | null
  ): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/university/projects/${projectId}/team/${memberId}`, {
      method: "DELETE",
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to remove team member");
  },

  /**
   * 9. Get industry & CSR collaboration offers
   */
  async getIndustryOffers(aisheCode: string, token?: string | null): Promise<IndustryOffer[]> {
    const res = await fetch(`${API_BASE_URL}/university/industry-offers?aisheCode=${encodeURIComponent(aisheCode)}`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch industry offers");
    return res.json();
  },
};
