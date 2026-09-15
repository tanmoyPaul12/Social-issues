"use client";

import { useState, useEffect, useCallback } from "react";
import { universityApi } from "../services/universityApi";
import { useIssueStore } from "@/lib/store/useIssueStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
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

const ACCEPTED_CHALLENGES_KEY = "social_issues_accepted_challenges_v1";
const LOCAL_PROJECTS_KEY = "social_issues_local_projects_v1";

function getAcceptedChallengeIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(ACCEPTED_CHALLENGES_KEY);
    const arr: string[] = raw ? JSON.parse(raw) : [];
    return new Set(arr);
  } catch { return new Set(); }
}

function addAcceptedChallengeId(ticketId: string) {
  if (typeof window === "undefined") return;
  try {
    const ids = getAcceptedChallengeIds();
    ids.add(ticketId);
    localStorage.setItem(ACCEPTED_CHALLENGES_KEY, JSON.stringify(Array.from(ids)));
  } catch {}
}

function getLocalProjects(): UniversityProject[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLocalProject(proj: UniversityProject) {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalProjects();
    const alreadyExists = existing.some((p) => p.id === proj.id || p.ticketId === proj.ticketId);
    if (!alreadyExists) {
      localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify([proj, ...existing]));
    }
  } catch {}
}

function updateLocalProject(proj: UniversityProject) {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalProjects();
    const updated = existing.map((p) => (p.id === proj.id ? proj : p));
    localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(updated));
  } catch {}
}

export function useUniversity(aisheCode: string = "U-0205", token?: string | null) {
  const { issues } = useIssueStore();
  const { user } = useAuthStore();
  const currentUniversityName = user?.orgName || "Birla Institute of Technology, Mesra";

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

      let apiRouted: RoutedChallenge[] = [];
      if (routed.status === "fulfilled" && Array.isArray(routed.value)) {
        apiRouted = routed.value;
      }

      let apiOpen: RoutedChallenge[] = [];
      if (open.status === "fulfilled" && Array.isArray(open.value)) {
        apiOpen = open.value;
      }

      // 1. Filter issues assigned by Govt Nodal Officer from useIssueStore
      const storeRouted: RoutedChallenge[] = issues
        .filter((i) => {
          if (!i.assignedHEI || i.assignedHEI === "Pending Assignment") return false;
          const target = i.assignedHEI.toLowerCase();
          const current = currentUniversityName.toLowerCase();
          return (
            target.includes(current) ||
            current.includes(target) ||
            i.status === "ASSIGNED_HEI" ||
            target.includes("mesra") ||
            target.includes("bit") ||
            target.includes("university") ||
            target.includes("hei")
          );
        })
        .map((i, idx) => ({
          id: i.numericId || idx + 9000,
          ticketId: i.id,
          title: i.title,
          description: i.description,
          domain: i.domain || "Civic Technology",
          sector: i.sector || "WATER",
          district: i.district || "Ranchi",
          block: i.block,
          urgency: i.priority || "HIGH",
          matchScore: "98% (State Nodal Assigned)",
          problemSnippet: i.originalText || i.description,
          affectedPopulation: 1200,
          status: "ASSIGNED_HEI",
          createdAt: i.createdAt || new Date().toISOString(),
        }));

      // Filter out already-accepted challenges using persisted localStorage list
      const acceptedIds = getAcceptedChallengeIds();
      const filteredStoreRouted = storeRouted.filter(
        (c) => !acceptedIds.has(c.ticketId)
      );

      const combinedRouted = [...filteredStoreRouted];
      for (const r of apiRouted) {
        if (!combinedRouted.some((c) => c.ticketId === r.ticketId || c.id === r.id) && !acceptedIds.has(r.ticketId)) {
          combinedRouted.push(r);
        }
      }
      setRoutedChallenges(combinedRouted);

      // Merge API projects with locally persisted projects
      const localProjs = getLocalProjects();
      let mergedProjects: UniversityProject[] = [...localProjs];
      if (proj.status === "fulfilled" && Array.isArray(proj.value)) {
        for (const apiProj of proj.value) {
          if (!mergedProjects.some((p) => p.id === apiProj.id || p.ticketId === apiProj.ticketId)) {
            mergedProjects.push(apiProj);
          }
        }
      }
      setProjects(mergedProjects);

      // 2. Filter unassigned open challenges from useIssueStore
      const storeOpen: RoutedChallenge[] = issues
        .filter((i) => !i.assignedHEI || i.assignedHEI === "Pending Assignment" || i.status === "SUBMITTED")
        .map((i, idx) => ({
          id: i.numericId || idx + 9500,
          ticketId: i.id,
          title: i.title,
          description: i.description,
          domain: i.domain || "Community Problem",
          sector: i.sector || "OTHER",
          district: i.district || "Ranchi",
          block: i.block,
          urgency: i.priority || "MEDIUM",
          matchScore: "85% (Open Pool)",
          problemSnippet: i.originalText || i.description,
          affectedPopulation: 500,
          status: "OPEN_POOL",
          createdAt: i.createdAt || new Date().toISOString(),
        }));

      const combinedOpen = [...storeOpen];
      for (const o of apiOpen) {
        if (!combinedOpen.some((c) => c.ticketId === o.ticketId || c.id === o.id)) {
          combinedOpen.push(o);
        }
      }
      setOpenChallenges(combinedOpen);

      if (offers.status === "fulfilled" && Array.isArray(offers.value)) {
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
  }, [aisheCode, token, issues, currentUniversityName]);

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
    // Persist the project and accepted challenge ID to localStorage
    saveLocalProject(newProj);
    if (data.ticketId) addAcceptedChallengeId(data.ticketId);
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
    // Persist updated project stage to localStorage
    updateLocalProject(updated);
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
