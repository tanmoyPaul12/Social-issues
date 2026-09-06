"use client";

import { useState, useEffect, useCallback } from "react";
import { universityApi } from "../services/universityApi";
import {
  RoutedChallenge,
  UniversityProject,
  IndustryOffer,
  CreateProjectRequest,
  ChallengeClaimRequest,
  TeamMember,
  UniversityProjectStage,
  CsrPitchRequest,
  CitizenVerificationRequest,
  AccreditationReport,
} from "../types";

export function useUniversity(aisheCode: string = "U-0205", token?: string | null) {
  const [routedChallenges, setRoutedChallenges] = useState<RoutedChallenge[]>([]);
  const [openChallenges, setOpenChallenges] = useState<RoutedChallenge[]>([]);
  const [projects, setProjects] = useState<UniversityProject[]>([]);
  const [industryOffers, setIndustryOffers] = useState<IndustryOffer[]>([]);
  const [accreditation, setAccreditation] = useState<AccreditationReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [routed, open, proj, offers, acc] = await Promise.allSettled([
        universityApi.getRoutedChallenges(aisheCode, token),
        universityApi.getAllOpenChallenges({}, token),
        universityApi.getProjects(aisheCode, token),
        universityApi.getIndustryOffers(aisheCode, token),
        universityApi.getAccreditationMetrics(aisheCode, token),
      ]);

      if (routed.status === "fulfilled") {
        setRoutedChallenges(routed.value);
      }
      if (open.status === "fulfilled") {
        setOpenChallenges(open.value);
      }
      if (proj.status === "fulfilled") {
        setProjects(proj.value);
      }
      if (offers.status === "fulfilled") {
        setIndustryOffers(offers.value);
      }
      if (acc.status === "fulfilled") {
        setAccreditation(acc.value);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load university collaboration data");
    } finally {
      setIsLoading(false);
    }
  }, [aisheCode, token]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const claimChallenge = async (data: ChallengeClaimRequest) => {
    const res = await universityApi.claimChallenge(data, token);
    fetchAll();
    return res;
  };

  const createProject = async (data: CreateProjectRequest) => {
    const newProj = await universityApi.createProject(data, token);
    setProjects((prev) => [newProj, ...prev]);
    setRoutedChallenges((prev) => prev.filter((c) => c.ticketId !== data.ticketId));
    return newProj;
  };

  const updateStage = async (
    projectId: number,
    stage: UniversityProjectStage,
    progressPercentage?: number,
    milestoneDesc?: string
  ) => {
    const updated = await universityApi.updateProjectStage(
      projectId,
      { stage, progressPercentage, milestoneDesc },
      token
    );
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? updated : p))
    );
    return updated;
  };

  const submitCsrPitch = async (projectId: number, data: CsrPitchRequest) => {
    const updated = await universityApi.submitCsrPitch(projectId, data, token);
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? updated : p))
    );
    return updated;
  };

  const recordCitizenVerification = async (
    projectId: number,
    data: CitizenVerificationRequest
  ) => {
    const updated = await universityApi.recordCitizenVerification(projectId, data, token);
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? updated : p))
    );
    return updated;
  };

  const addTeamMember = async (projectId: number, member: TeamMember) => {
    const created = await universityApi.addTeamMember(projectId, member, token);
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const members = p.teamMembers || [];
          return { ...p, teamMembers: [...members, created] };
        }
        return p;
      })
    );
    return created;
  };

  const removeTeamMember = async (projectId: number, memberId: number) => {
    await universityApi.removeTeamMember(projectId, memberId, token);
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            teamMembers: (p.teamMembers || []).filter((m) => m.id !== memberId),
          };
        }
        return p;
      })
    );
  };

  return {
    routedChallenges,
    openChallenges,
    projects,
    industryOffers,
    accreditation,
    isLoading,
    error,
    refresh: fetchAll,
    claimChallenge,
    createProject,
    updateStage,
    submitCsrPitch,
    recordCitizenVerification,
    addTeamMember,
    removeTeamMember,
  };
}
