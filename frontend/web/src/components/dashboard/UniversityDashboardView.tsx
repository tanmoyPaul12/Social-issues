"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "@/components/dashboard/ToastStack";
import { useUniversity } from "@/modules/university/hooks/useUniversity";
import { WorkspacePlaceholderTab } from "./WorkspacePlaceholderTab";
import {
  RoutedChallenge,
  UniversityProject,
  TeamMember,
  TeamMemberRole,
  UniversityProjectStage,
  IndustryOffer,
} from "@/modules/university/types";
import { ProjectMilestoneTimeline } from "./university/ProjectMilestoneTimeline";
import { ChallengeAiDossierCard } from "./university/ChallengeAiDossierCard";
import { CommunicationWorkspace } from "./common/CommunicationWorkspace";
import {
  registerProjectPitchThread,
  postThreadMessage,
  CommunicationThread,
} from "@/modules/communication/services/communicationApi";
import { useIndustryPitchStore } from "@/lib/store/useIndustryPitchStore";

interface UniversityDashboardViewProps {
  activeTab?: string;
  onNavigateTab?: (tabId: string) => void;
}

export interface OnboardedIndustryPartner {
  id: string;
  name: string;
  division: string;
  grantCeiling: string;
  maxAmount: number;
  focusAreas: string[];
  mentors: { name: string; designation: string; email: string }[];
  pledgedBudgetTotal: string;
  status: string;
}

export const ONBOARDED_PARTNERS: OnboardedIndustryPartner[] = [];

export interface InstitutionalUser {
  id: string;
  name: string;
  role: TeamMemberRole;
  department: string;
  identifier: string;
  email: string;
  assignedProjectCode?: string;
  abcCredits?: number;
  status: string;
}

const INSTITUTIONAL_USERS_STORAGE_KEY = "social_issues_institutional_users_v1";

export function getLocalInstitutionalUsers(): InstitutionalUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(INSTITUTIONAL_USERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    const deduplicated: InstitutionalUser[] = [];
    for (const u of parsed) {
      const key = u.id || u.identifier || u.email;
      if (key && !seen.has(key)) {
        seen.add(key);
        deduplicated.push(u);
      }
    }
    return deduplicated;
  } catch {
    return [];
  }
}

export function saveLocalInstitutionalUsers(users: InstitutionalUser[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(INSTITUTIONAL_USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {}
}

export interface CsrPitchRecord {
  id: string;
  projectCode: string;
  projectTitle: string;
  sponsorCompany: string;
  requestedAmount: number;
  category: string;
  mentorNeeds: string;
  status: string;
  submittedAt: string;
}

const INITIAL_CSR_PITCHES: CsrPitchRecord[] = [];

const JHARKHAND_DISTRICTS = [
  "All Districts", "Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa",
  "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma",
  "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj",
  "Saraikela Kharsawan", "Simdega", "West Singhbhum"
];

const SECTOR_OPTIONS = [
  "ALL", "WATER", "AGRICULTURE", "HEALTH", "EDUCATION", "INFRASTRUCTURE", "ENVIRONMENT", "ELECTRICITY", "SANITATION"
];

const STAGE_ORDER: UniversityProjectStage[] = [
  "TEAM_FORMATION",
  "LAB_PROTOTYPING",
  "FIELD_PILOT",
  "DEPLOYMENT_HANDOVER",
  "COMPLETED"
];

const STAGE_LABELS: Record<UniversityProjectStage, string> = {
  TEAM_FORMATION: "Stage 1: Team Formation",
  LAB_PROTOTYPING: "Stage 2: Lab Prototyping",
  FIELD_PILOT: "Stage 3: Field Pilot Testing",
  DEPLOYMENT_HANDOVER: "Stage 4: Municipal Deployment",
  COMPLETED: "Stage 5: Verified & Closed"
};

const STAGE_PROGRESS: Record<UniversityProjectStage, number> = {
  TEAM_FORMATION: 20,
  LAB_PROTOTYPING: 45,
  FIELD_PILOT: 70,
  DEPLOYMENT_HANDOVER: 90,
  COMPLETED: 100
};

export function UniversityDashboardView({
  activeTab = "overview",
  onNavigateTab,
}: UniversityDashboardViewProps) {
  const { user, token } = useAuthStore();
  const aisheCode = user?.aisheCode || "U-0205";
  const institutionName = user?.orgName || "Birla Institute of Technology, Mesra";

  // Backend integration hook
  const {
    routedChallenges,
    openChallenges,
    projects,
    accreditation,
    industryOffers,
    claimChallenge,
    createProject,
    declineChallenge,
    submitProposal,
    updateStage,
    recordCitizenVerification,
    addTeamMember,
    removeTeamMember,
    submitCsrPitch,
  } = useUniversity(aisheCode, token);

  // Filter and Search State for Statewide Pool
  const [districtFilter, setDistrictFilter] = useState("All Districts");
  const [sectorFilter, setSectorFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals State
  const [selectedChallengeForAccept, setSelectedChallengeForAccept] = useState<RoutedChallenge | null>(null);
  const [selectedChallengeForDecline, setSelectedChallengeForDecline] = useState<RoutedChallenge | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [selectedChallengeForClaim, setSelectedChallengeForClaim] = useState<RoutedChallenge | null>(null);
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<UniversityProject | null>(null);
  const [selectedProjectForProposal, setSelectedProjectForProposal] = useState<UniversityProject | null>(null);
  const [proposalForm, setProposalForm] = useState({
    title: "",
    abstractDescription: "",
    domain: "",
    allocatedGrant: 250000,
    methodology: "",
  });
  const [isTeamRosterModalOpen, setIsTeamRosterModalOpen] = useState(false);
  const [selectedProjectForRoster, setSelectedProjectForRoster] = useState<UniversityProject | null>(null);

  // NAAC & NEP 2020 Modal State
  const [isSsrModalOpen, setIsSsrModalOpen] = useState(false);
  const [selectedStudentForCertificate, setSelectedStudentForCertificate] = useState<{
    name: string;
    identifier?: string;
    department: string;
    projectCode?: string;
    projectTitle?: string;
    abcCredits: number;
  } | null>(null);

  // Faculty & Student Directory State
  const [institutionalUsers, setInstitutionalUsers] = useState<InstitutionalUser[]>(() => getLocalInstitutionalUsers());
  const [selectedProjectIdForAllocation, setSelectedProjectIdForAllocation] = useState<number | null>(null);
  const [isAddResearcherModalOpen, setIsAddResearcherModalOpen] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState<"ALL" | "FACULTY" | "STUDENT">("ALL");
  const [userSearchQuery, setUserSearchQuery] = useState("");

  // Quick Allocate Form State for Team Allocator Tab
  const [allocMemberName, setAllocMemberName] = useState("");
  const [allocMemberRole, setAllocMemberRole] = useState<TeamMemberRole>("STUDENT_INNOVATOR");
  const [allocMemberDept, setAllocMemberDept] = useState("Computer Science & Engineering");
  const [allocMemberId, setAllocMemberId] = useState("");
  const [allocMemberCredits, setAllocMemberCredits] = useState(4);

  // Sync projects team members with institutional directory
  useEffect(() => {
    if (projects.length > 0) {
      setInstitutionalUsers((prev) => {
        const existing = [...prev];
        const seenIds = new Set(existing.map((u) => u.identifier || u.name));

        let changed = false;
        projects.forEach((p) => {
          if (p.facultyMentor && !seenIds.has(p.facultyMentor)) {
            seenIds.add(p.facultyMentor);
            existing.push({
              id: `fac-${p.id}`,
              name: p.facultyMentor,
              role: "FACULTY_MENTOR",
              department: p.domain ? `Dept of ${p.domain}` : "Academic Research Wing",
              identifier: `FAC-${p.id * 10 + 101}`,
              email: `${p.facultyMentor.toLowerCase().replace(/[^a-z0-9]/g, ".")}@bitmesra.ac.in`,
              assignedProjectCode: p.projectCode || `PROJ-${p.id}`,
              status: "Active & Verified",
            });
            changed = true;
          }
          (p.teamMembers || []).forEach((tm, idx) => {
            const key = tm.identifier || tm.name;
            if (key && !seenIds.has(key)) {
              seenIds.add(key);
              existing.push({
                id: `tm-${p.id}-${idx}`,
                name: tm.name,
                role: tm.role || "STUDENT_INNOVATOR",
                department: tm.department || "Engineering & Technology",
                identifier: tm.identifier || `22BTECH${100 + idx}`,
                email: `${tm.name.toLowerCase().replace(/[^a-z0-9]/g, ".")}@institution.edu.in`,
                assignedProjectCode: p.projectCode || `PROJ-${p.id}`,
                abcCredits: tm.abcCredits || 4,
                status: "Active & Verified",
              });
              changed = true;
            }
          });
        });

        if (changed) {
          saveLocalInstitutionalUsers(existing);
          return existing;
        }
        return prev;
      });
    }
  }, [projects]);

  // Add Researcher Form State
  const [newResearcherName, setNewResearcherName] = useState("");
  const [newResearcherRole, setNewResearcherRole] = useState<TeamMemberRole>("STUDENT_INNOVATOR");
  const [newResearcherDept, setNewResearcherDept] = useState("Computer Science & Engineering");
  const [newResearcherEmail, setNewResearcherEmail] = useState("");
  const [newResearcherId, setNewResearcherId] = useState("");
  const [newResearcherProjectCode, setNewResearcherProjectCode] = useState("");
  const [newResearcherCredits, setNewResearcherCredits] = useState(4);

  // Industry CSR Hub State
  const [isCsrPitchModalOpen, setIsCsrPitchModalOpen] = useState(false);
  const [activeCsrPitches, setActiveCsrPitches] = useState<CsrPitchRecord[]>(INITIAL_CSR_PITCHES);
  const [targetPartnerForPitch, setTargetPartnerForPitch] = useState("");
  const [customPartnerName, setCustomPartnerName] = useState("");
  const [selectedProjectIdForPitch, setSelectedProjectIdForPitch] = useState<number | "">("");
  const [pitchAmount, setPitchAmount] = useState<number>(350000);
  const [pitchCategory, setPitchCategory] = useState("Direct Hardware & Lab Equipment Grant");
  const [pitchMentorNeeds, setPitchMentorNeeds] = useState("");
  const [pitchDescription, setPitchDescription] = useState("");

  // Dynamic Registered Industry Partners — re-reads localStorage each time
  const readRegisteredPartners = useCallback((): OnboardedIndustryPartner[] => {
    const list: OnboardedIndustryPartner[] = [];
    const seenNames = new Set<string>();

    const addCompany = (name?: string, division?: string, email?: string, spoc?: string) => {
      if (!name || typeof name !== "string") return;
      const trimmed = name.trim();
      if (!trimmed || seenNames.has(trimmed.toLowerCase())) return;
      seenNames.add(trimmed.toLowerCase());
      list.push({
        id: `reg-${Date.now()}-${Math.random()}`,
        name: trimmed,
        division: division || "Registered Corporate CSR Division",
        grantCeiling: "Up to ₹5,00,000 / project",
        maxAmount: 500000,
        focusAreas: ["Clean Water", "Smart Agriculture", "Civic Tech", "Environment"],
        mentors: [{ name: spoc || "Corporate CSR Head", designation: "Head of CSR & Sustainability", email: email || "csr@company.com" }],
        pledgedBudgetTotal: "₹10,00,000",
        status: "Registered CSR Partner",
      });
    };

    // 1. Logged in user company (Industry role)
    if (user?.orgName) addCompany(user.orgName, "Registered Corporate CSR Division", user?.email, user?.name);
    if (user?.companyName) addCompany(user.companyName, "Registered Corporate CSR Division", user?.email, user?.name);

    if (typeof window !== "undefined") {
      // 2. Saved Industry company profile
      try {
        const storedProf = localStorage.getItem("social_issues_company_profile_v1");
        if (storedProf) {
          const p = JSON.parse(storedProf);
          if (p?.companyName) addCompany(p.companyName, p.companyType, p.contactEmail, p.spocName);
        }
      } catch (e) {}

      // 3. Registered industry list
      try {
        const storedInds = localStorage.getItem("social_issues_registered_industries_v1");
        if (storedInds) {
          const names = JSON.parse(storedInds);
          if (Array.isArray(names)) {
            names.forEach((item: any) => {
              const nameStr = typeof item === "string" ? item : item?.name;
              if (nameStr) addCompany(nameStr);
            });
          }
        }
      } catch (e) {}
    }
    return list;
  }, [user]);

  const [registeredPartners, setRegisteredPartners] = useState<OnboardedIndustryPartner[]>([]);

  // Re-read on mount and whenever localStorage changes (cross-tab sync)
  useEffect(() => {
    const refresh = () => setRegisteredPartners(readRegisteredPartners());
    refresh();
    window.addEventListener("storage", refresh);
    // Also poll every 3s so same-tab updates (Industry saving profile) are picked up
    const timer = setInterval(refresh, 3000);
    return () => {
      window.removeEventListener("storage", refresh);
      clearInterval(timer);
    };
  }, [readRegisteredPartners]);

  const registeredIndustryList = useMemo(() => registeredPartners.map((p) => p.name), [registeredPartners]);

  // Form State: Accept Challenge
  const defaultFaculty = user?.name ? `${user.name} (${user.designation || "Faculty SPOC"})` : "Faculty Project Guide";
  const [acceptFaculty, setAcceptFaculty] = useState(defaultFaculty);
  const [acceptDepartment, setAcceptDepartment] = useState("Department of Applied Sciences");
  const [acceptStudentLead, setAcceptStudentLead] = useState("");
  const [acceptStudentRoll, setAcceptStudentRoll] = useState("");
  const [acceptAbcCredits, setAcceptAbcCredits] = useState(4);

  // Form State: Claim Statewide Challenge
  const [claimFaculty, setClaimFaculty] = useState(user?.name || "Nodal Project Coordinator");
  const [claimApproach, setClaimApproach] = useState("");
  const [claimTimelineMonths, setClaimTimelineMonths] = useState(6);

  // Form State: Add Member
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<TeamMemberRole>("STUDENT_INNOVATOR");
  const [newMemberDept, setNewMemberDept] = useState("Computer Science & Engineering");
  const [newMemberId, setNewMemberId] = useState("");
  const [newMemberCredits, setNewMemberCredits] = useState(4);

  // Form State: Advance Progress
  const [advMilestoneNote, setAdvMilestoneNote] = useState("");

  // Filtered statewide challenges
  const filteredStatewideChallenges = useMemo(() => {
    return openChallenges.filter((ch) => {
      const matchDistrict = districtFilter === "All Districts" || ch.district === districtFilter;
      const matchSector = sectorFilter === "ALL" || ch.sector === sectorFilter;
      const matchSearch = !searchQuery.trim() ||
        ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.district.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDistrict && matchSector && matchSearch;
    });
  }, [openChallenges, districtFilter, sectorFilter, searchQuery]);

  // Derived student credit records for NEP 2020
  const studentCreditRecords = useMemo(() => {
    const fromProjects = projects.flatMap((p) =>
      (p.teamMembers || [])
        .filter((m) => m.role === "STUDENT_INNOVATOR")
        .map((m) => ({
          name: m.name,
          identifier: m.identifier || "22BTECH014",
          department: m.department || "Engineering",
          projectCode: p.projectCode || p.id.toString(),
          projectTitle: p.title,
          abcCredits: m.abcCredits || 4,
          grade: "Grade O (Outstanding)",
          status: "Verified & Disbursed",
        }))
    );

    const fromDirectory = institutionalUsers
      .filter((u) => u.role === "STUDENT_INNOVATOR")
      .map((u) => ({
        name: u.name,
        identifier: u.identifier,
        department: u.department,
        projectCode: u.assignedProjectCode || "BIT-CIVIC-2024",
        projectTitle: "Institutional Civic Technology Practicum",
        abcCredits: u.abcCredits || 4,
        grade: "Grade O (Outstanding)",
        status: "Verified & Disbursed",
      }));

    const map = new Map();
    [...fromProjects, ...fromDirectory].forEach((item) => {
      map.set(`${item.name}-${item.identifier}`, item);
    });
    return Array.from(map.values());
  }, [projects, institutionalUsers]);

  // Filtered institutional user directory
  const filteredInstitutionalUsers = useMemo(() => {
    return institutionalUsers.filter((u) => {
      const matchRole =
        userRoleFilter === "ALL" ||
        (userRoleFilter === "FACULTY" && u.role === "FACULTY_MENTOR") ||
        (userRoleFilter === "STUDENT" && u.role === "STUDENT_INNOVATOR");

      const matchSearch =
        !userSearchQuery.trim() ||
        u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.identifier.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.department.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearchQuery.toLowerCase());

      return matchRole && matchSearch;
    });
  }, [institutionalUsers, userRoleFilter, userSearchQuery]);

  // Handler: Open Pitch Modal with Preselected Partner
  const handleOpenCsrModal = (partnerName?: string, projId?: number) => {
    if (partnerName) {
      setTargetPartnerForPitch(partnerName);
    } else {
      // Auto-select first registered partner or switch to CUSTOM if none
      const freshList = readRegisteredPartners().map((p) => p.name);
      if (freshList.length > 0) {
        setTargetPartnerForPitch(freshList[0]);
      } else {
        setTargetPartnerForPitch("CUSTOM");
      }
    }
    if (projId !== undefined) {
      setSelectedProjectIdForPitch(projId);
    } else if (projects.length > 0) {
      setSelectedProjectIdForPitch(projects[0].id);
    }
    setIsCsrPitchModalOpen(true);
  };

  // Handler: Confirm CSR Pitch
  const handleConfirmCsrPitch = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate: a company must be selected or custom name entered
    if (!targetPartnerForPitch || targetPartnerForPitch === "") {
      toast.info("Please select a registered industry partner or enter a company name.");
      return;
    }
    if (targetPartnerForPitch === "CUSTOM" && !customPartnerName.trim()) {
      toast.info("Please enter the company name to pitch to.");
      return;
    }

    const finalPartner =
      targetPartnerForPitch === "CUSTOM"
        ? customPartnerName.trim()
        : targetPartnerForPitch;

    // Save newly entered custom company into localStorage so it persists for future pitches
    if (targetPartnerForPitch === "CUSTOM" && customPartnerName.trim()) {
      try {
        const stored = localStorage.getItem("social_issues_registered_industries_v1");
        const list = stored ? JSON.parse(stored) : [];
        if (!list.includes(customPartnerName.trim())) {
          list.push(customPartnerName.trim());
          localStorage.setItem("social_issues_registered_industries_v1", JSON.stringify(list));
        }
      } catch (e) {
        // ignore
      }
    }

    const proj = projects.find((p) => p.id === selectedProjectIdForPitch);
    const projCode = proj?.projectCode || `PROJ-${selectedProjectIdForPitch || "GEN"}`;
    const projTitle = proj?.title || "Civic Technology Prototype";

    try {
      if (selectedProjectIdForPitch && typeof selectedProjectIdForPitch === "number") {
        try {
          await submitCsrPitch(selectedProjectIdForPitch, {
            requestedAmount: pitchAmount,
            pitchDescription: pitchDescription || "Grant request for lab equipment and components.",
            mentorNeeds: pitchMentorNeeds || undefined,
            targetSponsorCompany: finalPartner,
          });
        } catch (backendErr) {
          console.warn("Backend submitCsrPitch notice (proceeding locally):", backendErr);
        }
      }

      const newPitch: CsrPitchRecord = {
        id: `pitch-${Date.now()}`,
        projectCode: projCode,
        projectTitle: projTitle,
        sponsorCompany: finalPartner,
        requestedAmount: pitchAmount,
        category: pitchCategory,
        mentorNeeds: pitchMentorNeeds,
        status: "Under Committee Review",
        submittedAt: new Date().toISOString().split("T")[0],
      };

      setActiveCsrPitches((prev) => [newPitch, ...prev]);

      // Register pitch thread in communication hub
      const threadId = Date.now();
      const createdThread = registerProjectPitchThread({
        id: threadId,
        pilotId: threadId,
        title: projTitle,
        partnerName: finalPartner,
        partnerRole: `CSR Sponsor • ${finalPartner}`,
        sector: pitchCategory || "CSR Grant Requisition",
        lastMessage: pitchDescription || `Pitched ₹${pitchAmount.toLocaleString()} CSR grant proposal.`,
        timestamp: "Just now",
        unreadCount: 1,
        type: "PILOT",
        avatarBg: "bg-indigo-600",
        companyName: finalPartner,
        universityName: institutionName || "Birla Institute of Technology (BIT) Mesra",
      });

      useIndustryPitchStore.getState().addPitch({
        id: `pitch-${threadId}`,
        threadId: createdThread.id,
        projectCode: projCode,
        projectTitle: projTitle,
        universityName: institutionName || "Birla Institute of Technology (BIT) Mesra",
        targetCompany: finalPartner,
        requestedAmount: pitchAmount,
        category: pitchCategory,
        description: pitchDescription || "Funding requisition for prototyping & prototype execution.",
        mentorNeeds: pitchMentorNeeds,
        submittedAt: new Date().toISOString(),
      });

      try {
        await postThreadMessage(
          token,
          createdThread.id,
          `📋 CSR GRANT PROPOSAL PITCH\n\nTarget Partner: ${finalPartner}\nRequested Funding: ₹${pitchAmount.toLocaleString()}\nGrant Category: ${pitchCategory}\n\nProposal Description:\n${pitchDescription || "Funding requisition for prototyping & execution."}\n\nTechnical Mentorship Needed:\n${pitchMentorNeeds || "Domain advisement & expert guidance."}`,
          undefined,
          undefined,
          createdThread.pilotId,
          user?.name || "University Lead PI",
          "FACULTY_PI",
          projTitle,
          "UNIVERSITY"
        );
      } catch (msgErr) {
        console.warn("Communication API postThreadMessage notice (handled locally):", msgErr);
      }

      setIsCsrPitchModalOpen(false);
      setCustomPartnerName("");
      setTargetPartnerForPitch("");
      setPitchMentorNeeds("");
      setPitchDescription("");
      toast.success(`Grant proposal pitched to ${finalPartner}. Active chat channel opened in Communication tab!`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit CSR proposal");
    }
  };

  // Handler: Add Researcher to Directory & Project
  const handleConfirmAddResearcher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResearcherName.trim()) return;

    const newUsr: InstitutionalUser = {
      id: `usr-${Date.now()}`,
      name: newResearcherName.trim(),
      role: newResearcherRole,
      department: newResearcherDept.trim(),
      identifier: newResearcherId.trim() || `ID-${Math.floor(1000 + Math.random() * 9000)}`,
      email: newResearcherEmail.trim() || `${newResearcherName.toLowerCase().replace(/\s+/g, ".")}@institution.edu.in`,
      assignedProjectCode: newResearcherProjectCode.trim() || undefined,
      abcCredits: newResearcherRole === "STUDENT_INNOVATOR" ? newResearcherCredits : undefined,
      status: "Active & Verified",
    };

    setInstitutionalUsers((prev) => {
      const updated = [newUsr, ...prev];
      saveLocalInstitutionalUsers(updated);
      return updated;
    });

    if (newResearcherProjectCode.trim()) {
      const matchProject = projects.find(
        (p) => (p.projectCode && p.projectCode === newResearcherProjectCode.trim()) || p.id.toString() === newResearcherProjectCode.trim()
      );
      if (matchProject) {
        try {
          await addTeamMember(matchProject.id, {
            role: newResearcherRole,
            name: newUsr.name,
            identifier: newUsr.identifier,
            department: newUsr.department,
            abcCredits: newUsr.abcCredits,
          });
        } catch (err) {
          console.error("Failed to link member to project", err);
        }
      }
    }

    setIsAddResearcherModalOpen(false);
    setNewResearcherName("");
    setNewResearcherEmail("");
    setNewResearcherId("");
    setNewResearcherProjectCode("");
    toast.success(`Registered ${newUsr.name} into institutional directory.`);
  };

  const handleDeleteResearcher = (id: string) => {
    setInstitutionalUsers((prev) => {
      const updated = prev.filter((u) => u.id !== id);
      saveLocalInstitutionalUsers(updated);
      return updated;
    });
    toast.success("Researcher account removed from directory.");
  };

  const handleAllocateMemberToProject = async (e: React.FormEvent, targetProjectId: number) => {
    e.preventDefault();
    if (!allocMemberName.trim()) return;

    try {
      await addTeamMember(targetProjectId, {
        role: allocMemberRole,
        name: allocMemberName.trim(),
        identifier: allocMemberId.trim() || undefined,
        department: allocMemberDept.trim(),
        abcCredits: allocMemberRole === "STUDENT_INNOVATOR" ? allocMemberCredits : undefined,
      });

      const matchProj = projects.find((p) => p.id === targetProjectId);
      const newUsr: InstitutionalUser = {
        id: `usr-${Date.now()}`,
        name: allocMemberName.trim(),
        role: allocMemberRole,
        department: allocMemberDept.trim(),
        identifier: allocMemberId.trim() || `ID-${Math.floor(1000 + Math.random() * 9000)}`,
        email: `${allocMemberName.toLowerCase().replace(/\s+/g, ".")}@institution.edu.in`,
        assignedProjectCode: matchProj?.projectCode || `PROJ-${targetProjectId}`,
        abcCredits: allocMemberRole === "STUDENT_INNOVATOR" ? allocMemberCredits : undefined,
        status: "Active & Verified",
      };

      setInstitutionalUsers((prev) => {
        const updated = [newUsr, ...prev];
        saveLocalInstitutionalUsers(updated);
        return updated;
      });

      setAllocMemberName("");
      setAllocMemberId("");
      toast.success(`Allocated ${newUsr.name} to project.`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to allocate team member");
    }
  };

  const handleUnassignMember = async (projectId: number, memberId: number, memberName: string) => {
    try {
      await removeTeamMember(projectId, memberId);
      toast.success(`Unassigned ${memberName} from project.`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to unassign member");
    }
  };

  // Handler: Accept Industry Co-Funding Offer
  const handleAcceptOffer = (offer: IndustryOffer) => {
    toast.success(`Accepted partnership with ${offer.company}. Legal MOU dispatched.`);
  };

  // Handler: Claim challenge and transition directly to Team Formation & Allocation Workspace
  const handleAcceptAndFormTeam = async (challenge: RoutedChallenge) => {
    try {
      const defaultFacultyName = user?.name || "Dr. S. K. Mahato";
      const dept = challenge.aiRecommendation?.suggestedDepartment || (challenge.domain ? `Dept of ${challenge.domain}` : "Department of Civil & Environmental Engineering");

      const initialTeam: TeamMember[] = [
        {
          role: "FACULTY_MENTOR",
          name: defaultFacultyName,
          department: dept,
          email: user?.email || "faculty.lead@bitmesra.ac.in",
          isLead: true,
        },
      ];

      const created = await createProject({
        issueId: challenge.id,
        ticketId: challenge.ticketId,
        aisheCode: aisheCode,
        universityName: institutionName,
        title: challenge.clusterTitle || challenge.title,
        abstractDescription: challenge.description,
        domain: challenge.domain,
        district: challenge.district,
        leadFacultyMentor: defaultFacultyName,
        leadStudentInnovator: "Pending Student Roster Allocation",
        allocatedGrant: 250000,
        csrPartner: "State Innovation Grant",
        milestoneDesc: "Project activated. Proceed with student innovator allocation and lab prototyping setup.",
        teamMembers: initialTeam,
      });

      // Register communication channel
      const threadId = challenge.id || Date.now();
      const projTitle = challenge.clusterTitle || challenge.title;
      const createdThread = registerProjectPitchThread({
        id: threadId,
        pilotId: threadId,
        title: projTitle,
        partnerName: "State Nodal CSR Cell",
        partnerRole: "Nodal Authority & Corporate Sponsor",
        sector: challenge.domain || "Civic Innovation",
        lastMessage: "Project challenge accepted and activated.",
        timestamp: "Just now",
        unreadCount: 0,
        type: "PILOT",
        avatarBg: "bg-emerald-600",
        universityName: institutionName || "Birla Institute of Technology (BIT) Mesra",
        companyName: "State Nodal CSR Cell",
      });

      try {
        await postThreadMessage(
          token,
          createdThread.id,
          `PROJECT ACTIVATED: ${projTitle}\n\nTicket ID: ${challenge.ticketId}\nLead Faculty: ${defaultFacultyName}\nAcademic Track: Capstone R&D (4 NEP Credits)\n\nDiscussion channel initialized for project milestones and deliverables.`,
          undefined,
          undefined,
          createdThread.pilotId,
          user?.name || defaultFacultyName,
          "FACULTY_PI",
          projTitle,
          "UNIVERSITY"
        );
      } catch {}

      // Select the newly formed project in the Team Allocator
      setSelectedProjectIdForAllocation(created.id);

      // Navigate to dedicated team formation tab
      if (onNavigateTab) {
        onNavigateTab("teams");
      }

      toast.success(`Challenge ${challenge.ticketId} claimed! Transitioned to Team Formation & Allocation Workspace.`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to accept challenge");
    }
  };

  // Handler: Confirm Acceptance of an Assigned Challenge
  const handleConfirmAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallengeForAccept) return;

    try {
      const initialTeam: TeamMember[] = [
        {
          role: "FACULTY_MENTOR",
          name: acceptFaculty || defaultFaculty,
          department: acceptDepartment,
          email: user?.email || "faculty@institution.edu.in",
          isLead: true,
        },
      ];

      if (acceptStudentLead.trim()) {
        initialTeam.push({
          role: "STUDENT_INNOVATOR",
          name: acceptStudentLead.trim(),
          identifier: acceptStudentRoll.trim() || undefined,
          department: acceptDepartment,
          yearOrDesignation: "Final Year Student",
          abcCredits: acceptAbcCredits,
          isLead: true,
        });
      }

      await createProject({
        issueId: selectedChallengeForAccept.id,
        ticketId: selectedChallengeForAccept.ticketId,
        aisheCode: aisheCode,
        universityName: institutionName,
        title: selectedChallengeForAccept.title,
        abstractDescription: selectedChallengeForAccept.description,
        domain: selectedChallengeForAccept.domain,
        district: selectedChallengeForAccept.district,
        leadFacultyMentor: acceptFaculty || defaultFaculty,
        leadStudentInnovator: acceptStudentLead.trim() || "Student Project Team",
        allocatedGrant: 250000,
        csrPartner: "State Innovation Grant",
        milestoneDesc: "Project activated. Faculty and student team registered for prototype design.",
        teamMembers: initialTeam,
      });

      // Register thread for activated project challenge
      const threadId = selectedChallengeForAccept.id || Date.now();
      const projTitle = selectedChallengeForAccept.title;
      const createdThread = registerProjectPitchThread({
        id: threadId,
        pilotId: threadId,
        title: projTitle,
        partnerName: "State Nodal CSR Cell",
        partnerRole: "Nodal Authority & Corporate Sponsor",
        sector: selectedChallengeForAccept.domain || "Civic Innovation",
        lastMessage: "Project challenge accepted and activated.",
        timestamp: "Just now",
        unreadCount: 0,
        type: "PILOT",
        avatarBg: "bg-emerald-600",
        universityName: institutionName || "Birla Institute of Technology (BIT) Mesra",
        companyName: "State Nodal CSR Cell",
      });

      try {
        await postThreadMessage(
          token,
          createdThread.id,
          `PROJECT ACTIVATED: ${projTitle}\n\nTicket ID: ${selectedChallengeForAccept.ticketId}\nLead Faculty: ${acceptFaculty || defaultFaculty}\nLead Student: ${acceptStudentLead.trim() || "Student Project Team"}\n\nDiscussion channel initialized for project milestones and deliverables.`,
          undefined,
          undefined,
          createdThread.pilotId,
          user?.name || acceptFaculty || "University Lead PI",
          "FACULTY_PI",
          projTitle,
          "UNIVERSITY"
        );
      } catch {}

      setSelectedChallengeForAccept(null);
      setAcceptStudentLead("");
      setAcceptStudentRoll("");
      toast.success(`Project successfully initiated for ticket ${selectedChallengeForAccept.ticketId}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to accept challenge");
    }
  };

  // Handler: Confirm Decline of an Assigned Challenge
  const handleConfirmDecline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallengeForDecline) return;

    try {
      await declineChallenge(
        selectedChallengeForDecline.id,
        selectedChallengeForDecline.ticketId,
        declineReason || "Institutional capacity or domain allocation constraints"
      );
      toast.info(`Challenge #${selectedChallengeForDecline.ticketId} declined and returned to statewide triage pool.`);
      setSelectedChallengeForDecline(null);
      setDeclineReason("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to decline challenge");
    }
  };

  // Handler: Open Proposal Modal for an Active Project
  const handleOpenProposalModal = (project: UniversityProject) => {
    setSelectedProjectForProposal(project);
    setProposalForm({
      title: project.title || "",
      abstractDescription: project.abstractDescription || "",
      domain: project.domain || "Applied Sciences & Engineering",
      allocatedGrant: project.allocatedGrant || 250000,
      methodology: project.milestoneDesc || "4-Stage TRL Capstone execution methodology.",
    });
  };

  // Handler: Confirm Proposal Submission / Update
  const handleConfirmProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectForProposal) return;

    try {
      await submitProposal(selectedProjectForProposal.id, {
        title: proposalForm.title,
        abstractDescription: proposalForm.abstractDescription,
        domain: proposalForm.domain,
        allocatedGrant: Number(proposalForm.allocatedGrant) || 250000,
        methodology: proposalForm.methodology,
      });
      setSelectedProjectForProposal(null);
      toast.success("Institutional capstone proposal successfully updated and submitted!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit proposal");
    }
  };

  // Handler: Confirm Claim for an Open Challenge
  const handleConfirmClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallengeForClaim) return;

    try {
      await claimChallenge({
        issueId: selectedChallengeForClaim.id,
        aisheCode: aisheCode,
        universityName: institutionName,
        nodalSpocName: user?.name || "Institutional SPOC",
        leadFacultyName: claimFaculty,
        proposedApproach: claimApproach,
        estimatedTimelineMonths: claimTimelineMonths,
      });

      setSelectedChallengeForClaim(null);
      setClaimApproach("");
      toast.success(`Claim submitted for ${selectedChallengeForClaim.ticketId}. Pending state review.`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit claim");
    }
  };

  // Handler: Advance Stage
  const handleAdvanceStage = async (project: UniversityProject) => {
    const currentIdx = STAGE_ORDER.indexOf(project.stage);
    if (currentIdx >= STAGE_ORDER.length - 1) {
      toast.info("This project has reached the final verification stage.");
      return;
    }

    const nextStage = STAGE_ORDER[currentIdx + 1];
    const nextProgress = STAGE_PROGRESS[nextStage];
    const defaultNote = advMilestoneNote.trim() || `Advanced to ${STAGE_LABELS[nextStage]} on ${new Date().toLocaleDateString()}`;

    try {
      await updateStage(project.id, nextStage, nextProgress, defaultNote);
      setAdvMilestoneNote("");
      toast.success(`Project updated to ${STAGE_LABELS[nextStage]} (${nextProgress}%)`);

      // Update currently viewed project if open
      if (selectedProjectForDetail?.id === project.id) {
        setSelectedProjectForDetail({
          ...project,
          stage: nextStage,
          progress: nextProgress,
          milestoneDesc: defaultNote
        });
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to update project stage");
    }
  };

  // Handler: Add Team Member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectForRoster || !newMemberName.trim()) return;

    try {
      await addTeamMember(selectedProjectForRoster.id, {
        role: newMemberRole,
        name: newMemberName.trim(),
        identifier: newMemberId.trim() || undefined,
        department: newMemberDept,
        abcCredits: newMemberCredits,
      });

      setNewMemberName("");
      setNewMemberId("");
      toast.success("Team member added to project roster.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to add team member");
    }
  };

  // Calculate summary stats
  const totalCompletedProjects = projects.filter(
    (p) => p.stage === "COMPLETED" || p.citizenVerificationStatus === "VERIFIED"
  ).length;

  const totalResearchers = projects.reduce(
    (acc, p) => acc + (p.teamMembers?.length || 2),
    0
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-[#f1f5f9] min-h-full text-slate-800 text-sm">
      {/* Institutional Top Bar */}
      <div className="bg-white border border-slate-200 rounded p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Higher Education Institution Portal
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            {institutionName}
          </h1>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
            <span>AISHE Code: <strong className="text-slate-700 font-mono">{aisheCode}</strong></span>
            <span>•</span>
            <span>Nodal Coordinator: <strong className="text-slate-700">{user?.name || "Institutional SPOC"}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded text-xs font-medium">
            Status: Active &amp; Accredited
          </span>
        </div>
      </div>

      {/* VIEW 1: MAIN DASHBOARD OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded p-4">
              <div className="text-xs text-slate-500 font-medium">Assigned to College</div>
              <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{routedChallenges.length}</div>
              <div className="text-xs text-slate-500 mt-1">Awaiting acceptance</div>
            </div>

            <div className="bg-white border border-slate-200 rounded p-4">
              <div className="text-xs text-slate-500 font-medium">Active Capstone Projects</div>
              <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{projects.length}</div>
              <div className="text-xs text-slate-500 mt-1">{totalCompletedProjects} completed deployments</div>
            </div>

            <div className="bg-white border border-slate-200 rounded p-4">
              <div className="text-xs text-slate-500 font-medium">Statewide Open Pool</div>
              <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{openChallenges.length}</div>
              <div className="text-xs text-slate-500 mt-1">Available to claim</div>
            </div>

            <div className="bg-white border border-slate-200 rounded p-4">
              <div className="text-xs text-slate-500 font-medium">Enrolled Researchers</div>
              <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{totalResearchers}</div>
              <div className="text-xs text-slate-500 mt-1">Faculty guides &amp; students</div>
            </div>
          </div>

          {/* Section: Pending Assigned Challenges (Only those assigned to college) */}
          <div className="bg-white border border-slate-200 rounded overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900 text-sm">Assigned Challenges (Action Required)</h2>
                <p className="text-xs text-slate-500 mt-0.5">Problems matched and assigned specifically to {institutionName}</p>
              </div>
              <span className="text-xs font-mono font-medium px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                {routedChallenges.length} Pending
              </span>
            </div>

            {routedChallenges.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No pending assigned challenges. All direct assignments have been accepted.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Ticket</th>
                    <th className="py-3 px-4">Problem Statement</th>
                    <th className="py-3 px-4">Domain</th>
                    <th className="py-3 px-4">District</th>
                    <th className="py-3 px-4">Match Basis</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {routedChallenges.slice(0, 5).map((ch) => (
                    <tr key={ch.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-medium text-slate-800">{ch.ticketId}</td>
                      <td className="py-3 px-4 font-medium text-slate-900 max-w-sm">
                        <div className="font-semibold">{ch.title}</div>
                        <div className="text-slate-500 truncate text-[11px] mt-0.5">{ch.problemSnippet}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{ch.domain}</td>
                      <td className="py-3 px-4 text-slate-600">{ch.district}</td>
                      <td className="py-3 px-4 font-medium text-slate-700">{ch.matchScore}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedChallengeForDecline(ch)}
                            className="px-2.5 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded font-medium text-xs transition-colors cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAcceptAndFormTeam(ch)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium text-xs transition-colors cursor-pointer"
                          >
                            Accept &amp; Form Team
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Section: Active Projects Progress Summary */}
          <div className="bg-white border border-slate-200 rounded overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900 text-sm">Active Projects &amp; Progress</h2>
                <p className="text-xs text-slate-500 mt-0.5">Summary of ongoing institutional R&amp;D solutions</p>
              </div>
              <span className="text-xs font-mono font-medium px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                {projects.length} Total
              </span>
            </div>

            {projects.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No active projects found. Accept an assigned challenge to initiate a project.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Project Code</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Faculty Mentor</th>
                    <th className="py-3 px-4">Current Stage</th>
                    <th className="py-3 px-4">Progress</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projects.map((proj) => (
                    <tr key={proj.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">{proj.projectCode || proj.id}</td>
                      <td className="py-3 px-4 font-medium text-slate-900 max-w-sm">
                        <div>{proj.title}</div>
                        <div className="text-slate-500 text-[11px] truncate mt-0.5">{proj.milestoneDesc}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{proj.facultyMentor}</td>
                      <td className="py-3 px-4 text-slate-800 font-medium">
                        {STAGE_LABELS[proj.stage] || proj.stage}
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-slate-800 h-2 rounded-full"
                            style={{ width: `${proj.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{proj.progress}%</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedProjectForDetail(proj)}
                          className="px-2.5 py-1 text-slate-800 hover:bg-slate-100 border border-slate-300 rounded font-bold text-xs cursor-pointer shadow-2xs"
                        >
                          Lifecycle &amp; Milestones →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: ASSIGNED CHALLENGES TAB (AI-ROUTED DIRECTLY TO COLLEGE) */}
      {activeTab === "inbox" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Assigned Institutional Challenges</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official government civic problem statements routed to {institutionName} by the State Nodal Department for university resolution and student capstones.
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg shrink-0">
              {routedChallenges.length} Challenges Assigned
            </div>
          </div>

          {routedChallenges.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-xs shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="font-semibold text-slate-700">All Assigned Challenges Processed</div>
              <p className="max-w-md mx-auto text-slate-500">
                There are no pending unaccepted challenges in your institution inbox. Check back when new citizen problems are submitted.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {routedChallenges.map((ch) => (
                <ChallengeAiDossierCard
                  key={ch.id}
                  challenge={ch}
                  onAccept={handleAcceptAndFormTeam}
                  onDecline={(challenge) => setSelectedChallengeForDecline(challenge)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: STATEWIDE CHALLENGE POOL (VIEW ALL PROBLEMS ACROSS STATE & REQUEST TO SOLVE) */}
      {activeTab === "challenges" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded p-4">
            <h2 className="font-bold text-slate-900 text-base">Statewide Civic Challenge Registry</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Browse all unassigned citizen problems across Jharkhand. If your institution has the technical capability to address a problem, click Request to Solve to submit an institutional proposal.
            </p>

            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ticket ID, keyword, or ward..."
                className="p-2 border border-slate-300 rounded bg-white text-slate-900 outline-none"
              />

              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="p-2 border border-slate-300 rounded bg-white text-slate-800 outline-none"
              >
                {SECTOR_OPTIONS.map((sec) => (
                  <option key={sec} value={sec}>{sec === "ALL" ? "All Sectors" : sec}</option>
                ))}
              </select>

              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="p-2 border border-slate-300 rounded bg-white text-slate-800 outline-none"
              >
                {JHARKHAND_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>
          </div>

          {/* List of Problems */}
          <div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 flex justify-between items-center text-xs font-medium text-slate-600">
              <span>Showing {filteredStatewideChallenges.length} open problems across Jharkhand</span>
              <span>Filter: <strong>{sectorFilter}</strong> • <strong>{districtFilter}</strong></span>
            </div>

            {filteredStatewideChallenges.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-xs bg-white border border-slate-200 rounded-xl">
                No challenges found matching the selected search and filter criteria.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredStatewideChallenges.map((item) => (
                  <ChallengeAiDossierCard
                    key={item.id}
                    challenge={item}
                    onAccept={handleAcceptAndFormTeam}
                    onDecline={(challenge) => setSelectedChallengeForDecline(challenge)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 4: ACTIVE CAPSTONE PROJECTS (PROGRESS & WHAT THINGS HAVE BEEN DONE TILL NOW) */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Active Capstone Project Progress</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitor development milestones, completed deliverables, and field testing for student and faculty R&amp;D teams.
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded">
              {projects.length} Registered Projects
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded p-12 text-center text-slate-500 text-xs">
              No active projects registered yet. Accept an assigned challenge to begin.
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((proj) => (
                <div key={proj.id} className="bg-white border border-slate-200 rounded p-5 space-y-4">
                  {/* Project Header */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {proj.projectCode || proj.id}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {proj.domain || "Applied Sciences"}
                        </span>
                        <span className="text-xs text-slate-500">
                          District: {proj.district || "Jharkhand"}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">{proj.title}</h3>
                      <div className="text-xs text-slate-600">
                        Lead Faculty: <strong>{proj.facultyMentor}</strong> • Student Lead: <strong>{proj.studentLead}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenProposalModal(proj)}
                        className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded font-medium text-xs cursor-pointer shadow-2xs"
                      >
                        Proposal &amp; Grant
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedProjectForDetail(proj)}
                        className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-900 rounded font-bold text-xs cursor-pointer shadow-2xs"
                      >
                        Milestones, TRL &amp; Deliverables →
                      </button>

                      {proj.stage !== "COMPLETED" && (
                        <button
                          type="button"
                          onClick={() => handleAdvanceStage(proj)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium text-xs cursor-pointer"
                        >
                          Advance Next Stage
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Visual Stage Progress Track */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800">{STAGE_LABELS[proj.stage]}</span>
                      <span className="font-mono text-slate-600">{proj.progress}% Completed</span>
                    </div>

                    <div className="grid grid-cols-5 gap-1">
                      {STAGE_ORDER.map((stg, idx) => {
                        const currentIdx = STAGE_ORDER.indexOf(proj.stage);
                        const isDone = idx <= currentIdx;
                        return (
                          <div key={stg} className="space-y-1">
                            <div className={`h-1.5 rounded-full ${isDone ? "bg-slate-900" : "bg-slate-200"}`} />
                            <span className={`text-[10px] font-medium block truncate ${isDone ? "text-slate-800 font-bold" : "text-slate-400"}`}>
                              {idx + 1}. {stg.replace(/_/g, " ")}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary of What Has Been Done Till Now */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded p-3 text-xs space-y-2">
                    <div className="font-semibold text-slate-800">Completed Deliverables &amp; Current Milestone:</div>
                    <p className="text-slate-600 italic">
                      &ldquo;{proj.milestoneDesc || "Milestone roadmap initiated."}&rdquo;
                    </p>
                    <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex justify-between items-center">
                      <span>Team size: {proj.teamMembers?.length || 2} researchers</span>
                      <span>
                        Field Verification Status:{" "}
                        <strong className="text-slate-800">
                          {proj.citizenVerificationStatus === "VERIFIED"
                            ? "Verified by Citizen (5.0/5.0)"
                            : proj.stage === "DEPLOYMENT_HANDOVER" || proj.stage === "COMPLETED"
                            ? "Pending Citizen Inspection"
                            : "Scheduled for Final Phase"}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 5: ACCREDITATION & NEP 2020 CREDITS */}
      {activeTab === "accreditation" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Institutional Accreditation &amp; Academic Bank of Credits (NEP 2020)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Verifiable institutional audit trails for NAAC Criteria 3.6 (Extension Activities) and NEP 2020 Academic Bank of Credits (ABC).
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsSsrModalOpen(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold cursor-pointer"
              >
                Generate Official SSR Audit Report
              </button>
            </div>
          </div>

          {/* Key Metric Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded p-4">
              <div className="text-xs font-semibold text-slate-500">NAAC Criteria 3.6 Projection</div>
              <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">98 / 100</div>
              <p className="text-xs text-slate-500 mt-1">Extension &amp; community outreach rating</p>
            </div>

            <div className="bg-white border border-slate-200 rounded p-4">
              <div className="text-xs font-semibold text-slate-500">NEP 2020 ABC Credits Disbursed</div>
              <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                {accreditation?.totalAbcCreditsDisbursed || 74}
              </div>
              <p className="text-xs text-slate-500 mt-1">Directly credited to student ABC IDs</p>
            </div>

            <div className="bg-white border border-slate-200 rounded p-4">
              <div className="text-xs font-semibold text-slate-500">Citizen Beneficiaries Impacted</div>
              <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                {accreditation?.totalCitizenBeneficiaries || 45200}
              </div>
              <p className="text-xs text-slate-500 mt-1">Across 14 municipal wards &amp; panchayats</p>
            </div>

            <div className="bg-white border border-slate-200 rounded p-4">
              <div className="text-xs font-semibold text-slate-500">Verified Field Hours Logged</div>
              <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                {accreditation?.totalCommunityHours || 3420} hrs
              </div>
              <p className="text-xs text-slate-500 mt-1">GPS &amp; civic body verified field work</p>
            </div>
          </div>

          {/* SDG Alignment Matrix */}
          <div className="bg-white border border-slate-200 rounded p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              UN Sustainable Development Goals (SDG) Alignment Matrix
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <div className="font-semibold text-slate-900">SDG 6: Clean Water</div>
                <div className="text-slate-500 text-[11px] mt-0.5">3 Active R&amp;D Projects</div>
                <span className="text-[10px] font-mono text-slate-700 bg-slate-200/80 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                  Turbidity &amp; Arsenic Filtration
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <div className="font-semibold text-slate-900">SDG 7: Affordable Energy</div>
                <div className="text-slate-500 text-[11px] mt-0.5">2 Active R&amp;D Projects</div>
                <span className="text-[10px] font-mono text-slate-700 bg-slate-200/80 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                  Solar Micro-Grid Telemetry
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <div className="font-semibold text-slate-900">SDG 11: Sustainable Cities</div>
                <div className="text-slate-500 text-[11px] mt-0.5">4 Active R&amp;D Projects</div>
                <span className="text-[10px] font-mono text-slate-700 bg-slate-200/80 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                  Civic Waste AI Segregation
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <div className="font-semibold text-slate-900">SDG 3: Good Health</div>
                <div className="text-slate-500 text-[11px] mt-0.5">2 Active R&amp;D Projects</div>
                <span className="text-[10px] font-mono text-slate-700 bg-slate-200/80 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                  Rural Telemedicine Kiosks
                </span>
              </div>
            </div>
          </div>

          {/* Student Academic Bank of Credits (ABC) Roster */}
          <div className="bg-white border border-slate-200 rounded overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Student Academic Bank of Credits (ABC) Transcript Registry
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official certificates issued under National Credit Framework (NCrF) Level 6.0 with verifiable QR credentials.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-600 bg-slate-100 px-3 py-1 rounded">
                {studentCreditRecords.length} Enrolled Student Innovators
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[750px]">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 whitespace-nowrap">Student Innovator</th>
                    <th className="py-3 px-4 whitespace-nowrap">Department / Program</th>
                    <th className="py-3 px-4 whitespace-nowrap">Project Code</th>
                    <th className="py-3 px-4 whitespace-nowrap">ABC Credits</th>
                    <th className="py-3 px-4 whitespace-nowrap">Evaluation Grade</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentCreditRecords.map((st, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{st.name}</div>
                        <div className="text-[11px] font-mono text-slate-500">{st.identifier}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">{st.department}</td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-800 whitespace-nowrap">{st.projectCode}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-indigo-900 bg-indigo-50/80 px-2 py-0.5 rounded border border-indigo-100 text-[11px]">
                          {st.abcCredits} NEP Credits
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">{st.grade}</td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForCertificate(st)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium text-xs cursor-pointer transition-colors"
                        >
                          View Verified Certificate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 6: INDUSTRY CSR HUB */}
      {activeTab === "industry" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Industry CSR Sponsorship &amp; Lab Grants Hub</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Collaborate with onboarded corporate CSR partners to secure hardware grants, sensor components, and corporate engineering mentors.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => handleOpenCsrModal()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold cursor-pointer"
              >
                + Pitch Project for CSR Grant
              </button>
            </div>
          </div>

          {/* CSR Key Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded p-4">
              <div className="text-xs font-semibold text-slate-500">Registered CSR Partners</div>
              <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{registeredPartners.length}</div>
              <p className="text-xs text-slate-500 mt-1">Active institutional co-sponsors</p>
            </div>

            <div className="bg-white border border-slate-200 rounded p-4">
              <div className="text-xs font-semibold text-slate-500">Total Pledged Grant Pool</div>
              <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">₹35,00,000</div>
              <p className="text-xs text-slate-500 mt-1">Earmarked for university projects</p>
            </div>

            <div className="bg-white border border-slate-200 rounded p-4">
              <div className="text-xs font-semibold text-slate-500">Corporate Mentors Assigned</div>
              <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">8 Mentors</div>
              <p className="text-xs text-slate-500 mt-1">Industry technical specialists</p>
            </div>

            <div className="bg-white border border-slate-200 rounded p-4">
              <div className="text-xs font-semibold text-slate-500">Institutional Pitches Filed</div>
              <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{activeCsrPitches.length}</div>
              <p className="text-xs text-slate-500 mt-1">Submitted grant proposals</p>
            </div>
          </div>

          {/* Section 1: Registered Corporate CSR Partners */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Registered Corporate CSR Partners</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Corporate partners registered on the platform. Click Reach Out to request co-funding or hardware grant.
                </p>
              </div>
            </div>

            {registeredPartners.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded p-8 text-center text-slate-500 text-xs space-y-2">
                <p className="font-bold text-slate-800 text-sm">No Registered Corporate CSR Partners Yet</p>
                <p>Newly registered Industry partners will automatically appear here once registered.</p>
                <button
                  type="button"
                  onClick={() => handleOpenCsrModal()}
                  className="mt-2 px-4 py-2 bg-slate-900 text-white font-bold rounded hover:bg-slate-800 cursor-pointer"
                >
                  + Pitch Project / Enter Partner Name
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {registeredPartners.map((partner) => (
                  <div key={partner.id} className="bg-white border border-slate-200 rounded p-4 space-y-3 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{partner.name}</h4>
                        <div className="text-slate-500 text-[11px] mt-0.5">{partner.division}</div>
                      </div>
                      <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {partner.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-slate-700">
                        <span className="text-slate-500">Grant Ceiling:</span>
                        <strong className="font-mono text-slate-900">{partner.grantCeiling}</strong>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span className="text-slate-500">Institutional Earmark:</span>
                        <strong className="font-mono text-slate-900">{partner.pledgedBudgetTotal}</strong>
                      </div>
                    </div>

                    <div className="pt-1">
                      <span className="text-slate-500 block mb-1">Priority Focus Areas:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {partner.focusAreas.map((area, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-slate-500 text-[11px] block">Designated Mentors:</span>
                        <span className="font-medium text-slate-800 text-[11px]">
                          {partner.mentors.map((m) => m.name).join(", ")}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenCsrModal(partner.name)}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold text-xs cursor-pointer"
                      >
                        Reach Out / Request Grant
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Active University CSR Pitches & Inquiries */}
          <div className="bg-white border border-slate-200 rounded overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">University Grant Pitches &amp; Inquiries</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Formal hardware and funding requisitions submitted to corporate CSR committees
                </p>
              </div>
              <span className="text-xs font-mono text-slate-600 bg-slate-100 px-3 py-1 rounded">
                {activeCsrPitches.length} Proposals Submitted
              </span>
            </div>

            {activeCsrPitches.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No active CSR pitches submitted yet. Use the Pitch Project for CSR Grant button to submit your first request.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Project Code</th>
                    <th className="py-3 px-4">Project Title</th>
                    <th className="py-3 px-4">Target CSR Sponsor</th>
                    <th className="py-3 px-4">Requested Amount</th>
                    <th className="py-3 px-4">Grant Category</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeCsrPitches.map((pitch) => (
                    <tr key={pitch.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{pitch.projectCode}</td>
                      <td className="py-3 px-4 font-medium text-slate-900 max-w-xs">{pitch.projectTitle}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{pitch.sponsorCompany}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        ₹{pitch.requestedAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{pitch.category}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded ${
                          pitch.status.includes("Approved")
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          {pitch.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Section 3: Incoming Corporate CSR Co-Funding Offers */}
          <div className="bg-white border border-slate-200 rounded p-4 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Incoming Corporate Co-Funding Offers ({industryOffers.length || 1})</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct co-sponsorship offers submitted by companies interested in deploying your student research in field pilots.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-sm">Tata Steel Foundation</span>
                  <span className="font-mono text-[11px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold">
                    Offered Grant: ₹4,00,000
                  </span>
                </div>
                <p className="text-slate-600">
                  Sponsorship for Arsenic Filtration prototype testing in 3 panchayats in Ramgarh district, including supply of telemetry modems.
                </p>
                <div className="text-[11px] text-slate-500">
                  Assigned Corporate Mentor: <strong>Dr. R. Sengupta (Chief Technologist)</strong>
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleAcceptOffer({
                      id: 101,
                      projectTitle: "Arsenic Filtration",
                      company: "Tata Steel Foundation",
                      engagementType: "CO_FUNDING",
                      offeredAmount: 400000,
                      status: "OFFERED"
                    })}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold cursor-pointer text-xs"
                  >
                    Accept Partnership &amp; Sign MoU
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 7A: TEAM ALLOCATOR */}
      {activeTab === "teams" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-950 text-base">Capstone Project Team Allocator</h2>
                <span className="px-2.5 py-0.5 text-[10.5px] font-bold uppercase bg-blue-50 text-blue-800 border border-blue-200 rounded-md whitespace-nowrap">
                  NEP 2020 Allocation
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Assign and manage institutional faculty mentors, student innovators, and research assistants across active Capstone Projects.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 whitespace-nowrap">
                <strong>{projects.length}</strong> Active Projects
              </span>
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">No Active Capstone Projects</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Accept an assigned challenge or initiate a research project to start allocating faculty guides and student innovators.
              </p>
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab("inbox")}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
                >
                  View Assigned Challenges →
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Compact Projects Selector (3 cols) */}
              <div className="lg:col-span-3 space-y-2">
                <div className="font-bold text-[11px] uppercase tracking-wider text-slate-500">
                  Select Project to Manage ({projects.length})
                </div>
                <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-0.5">
                  {projects.map((proj) => {
                    const currentSelectedId = selectedProjectIdForAllocation || projects[0]?.id;
                    const isSelected = proj.id === currentSelectedId;
                    const projAdditionalMembers = (proj.teamMembers || []).filter(
                      (m) => !(m.name === proj.facultyMentor && m.role === "FACULTY_MENTOR")
                    );
                    const teamCount = (proj.facultyMentor ? 1 : 0) + projAdditionalMembers.length;

                    return (
                      <button
                        key={proj.id}
                        type="button"
                        onClick={() => setSelectedProjectIdForAllocation(proj.id)}
                        className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer space-y-1 ${
                          isSelected
                            ? "bg-white border-blue-600 ring-1 ring-blue-600/20 shadow-2xs border-l-[3px] border-l-blue-600"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="font-mono text-[10.5px] font-bold text-slate-700 whitespace-nowrap">
                            {proj.projectCode || `PROJ-${proj.id}`}
                          </span>
                          <span className="text-[9px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 whitespace-nowrap">
                            {STAGE_LABELS[proj.stage] || proj.stage}
                          </span>
                        </div>
                        <h4 className="font-bold text-[11.5px] text-slate-900 line-clamp-1 leading-snug">
                          {proj.title}
                        </h4>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500">
                          <span className="truncate max-w-[100px]">{proj.domain || "Civic R&D"}</span>
                          <span className="font-semibold text-blue-700 whitespace-nowrap">
                            {teamCount} {teamCount === 1 ? "Member" : "Members"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Selected Project Team Roster & Allocation Form (9 cols) */}
              <div className="lg:col-span-9 space-y-5">
                {(() => {
                  const targetProj =
                    projects.find((p) => p.id === (selectedProjectIdForAllocation || projects[0]?.id)) ||
                    projects[0];

                  if (!targetProj) return null;

                  const additionalMembers = (targetProj.teamMembers || []).filter(
                    (m) => !(m.name === targetProj.facultyMentor && m.role === "FACULTY_MENTOR")
                  );
                  const totalRosterCount = (targetProj.facultyMentor ? 1 : 0) + additionalMembers.length;

                  return (
                    <div className="space-y-5">
                      {/* Project Header Summary */}
                      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                              {targetProj.projectCode || `PROJ-${targetProj.id}`} • {targetProj.district}
                            </span>
                            <h3 className="font-bold text-slate-900 text-sm mt-0.5">
                              {targetProj.title}
                            </h3>
                          </div>
                          <span className="font-mono text-xs font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 shrink-0 whitespace-nowrap">
                            Progress: {targetProj.progress}%
                          </span>
                        </div>

                        {/* Team Roster Table without horizontal scroll */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-[11px] text-slate-800 uppercase tracking-wider">
                              Assigned Research Team ({totalRosterCount})
                            </h4>
                          </div>

                          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                            <table className="w-full text-left text-xs border-collapse table-auto">
                              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[10.5px] uppercase tracking-wider">
                                <tr>
                                  <th className="py-2.5 px-3 whitespace-nowrap">Member Name</th>
                                  <th className="py-2.5 px-2.5 whitespace-nowrap">Assigned Role</th>
                                  <th className="py-2.5 px-2.5 whitespace-nowrap">Department</th>
                                  <th className="py-2.5 px-2.5 whitespace-nowrap">Roll / ID</th>
                                  <th className="py-2.5 px-2.5 whitespace-nowrap">NEP Credits</th>
                                  <th className="py-2.5 px-3 whitespace-nowrap text-right">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {/* Lead Faculty Row */}
                                {targetProj.facultyMentor && (
                                  <tr className="bg-slate-50/60 hover:bg-slate-100/60 transition-colors">
                                    <td className="py-2.5 px-3 whitespace-nowrap font-semibold text-slate-900">
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 border border-slate-200">
                                          PI
                                        </div>
                                        <span>{targetProj.facultyMentor}</span>
                                      </div>
                                    </td>
                                    <td className="py-2.5 px-2.5 whitespace-nowrap">
                                      <span className="px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-slate-100 text-slate-800 border border-slate-200 whitespace-nowrap">
                                        Lead Faculty PI
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-2.5 text-slate-700 font-medium">
                                      <span className="truncate block max-w-[140px] xl:max-w-[200px]" title={targetProj.domain ? `Dept of ${targetProj.domain}` : "Academic Faculty"}>
                                        {targetProj.domain ? (targetProj.domain.startsWith("Dept") ? targetProj.domain : `Dept of ${targetProj.domain}`) : "Academic Faculty"}
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-2.5 whitespace-nowrap font-mono text-slate-600 font-medium">
                                      <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/80 text-[10.5px]">PI-LEAD</span>
                                    </td>
                                    <td className="py-2.5 px-2.5 whitespace-nowrap text-slate-600 font-medium text-[11px]">
                                      Faculty Guide
                                    </td>
                                    <td className="py-2.5 px-3 whitespace-nowrap text-right text-slate-400 font-medium text-[10.5px]">
                                      Primary Lead
                                    </td>
                                  </tr>
                                )}

                                {/* Team Members Rows */}
                                {additionalMembers.map((member, idx) => (
                                  <tr key={member.id || idx} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-2.5 px-3 whitespace-nowrap font-semibold text-slate-900">
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 border border-slate-200">
                                          {member.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span>{member.name}</span>
                                      </div>
                                    </td>
                                    <td className="py-2.5 px-2.5 whitespace-nowrap">
                                      <span className="px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-slate-100 text-slate-800 border border-slate-200 whitespace-nowrap">
                                        {member.role === "FACULTY_MENTOR" || member.role === "CO_FACULTY_GUIDE"
                                          ? "Faculty Co-Mentor"
                                          : member.role === "LAB_TECHNICIAN"
                                          ? "Lab Technician"
                                          : member.role === "DEPARTMENT_HEAD"
                                          ? "Department Head"
                                          : "Student Innovator"}
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-2.5 text-slate-700 font-medium">
                                      <span className="truncate block max-w-[140px] xl:max-w-[200px]" title={member.department || "Engineering"}>
                                        {member.department || "Engineering"}
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-2.5 whitespace-nowrap font-mono text-slate-600 font-medium">
                                      <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/80 text-[10.5px]">
                                        {member.identifier || `22BTECH${100 + idx}`}
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-2.5 whitespace-nowrap">
                                      <span className="font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-[10.5px]">
                                        {member.abcCredits ? `${member.abcCredits} NEP Credits` : "4 NEP Credits"}
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3 whitespace-nowrap text-right">
                                      {member.id ? (
                                        <button
                                          type="button"
                                          onClick={() => handleUnassignMember(targetProj.id, member.id!, member.name)}
                                          className="px-2 py-0.5 text-rose-700 hover:text-rose-900 hover:bg-rose-50 border border-rose-200 rounded text-[10.5px] font-semibold transition-all cursor-pointer whitespace-nowrap"
                                        >
                                          Unassign
                                        </button>
                                      ) : (
                                        <span className="text-slate-400 text-[10.5px]">Assigned</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}

                                {additionalMembers.length === 0 && !targetProj.facultyMentor && (
                                  <tr>
                                    <td colSpan={6} className="py-5 px-4 text-center text-slate-500">
                                      No team members allocated to this capstone project yet.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* Quick Allocate Form Card */}
                      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3.5 shadow-xs">
                        <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                          <div>
                            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                              + Allocate Researcher to &ldquo;{targetProj.title}&rdquo;
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Register and assign a faculty guide or student innovator to this capstone project roster.
                            </p>
                          </div>
                        </div>

                        <form
                          onSubmit={(e) => handleAllocateMemberToProject(e, targetProj.id)}
                          className="space-y-3 text-xs"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block font-bold text-slate-700 mb-1 whitespace-nowrap text-[11px]">
                                Researcher / Student Name <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Vikas Mahato"
                                value={allocMemberName}
                                onChange={(e) => setAllocMemberName(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-900/10 font-medium text-slate-900 text-xs transition-all"
                              />
                            </div>

                            <div>
                              <label className="block font-bold text-slate-700 mb-1 whitespace-nowrap text-[11px]">
                                Allocation Role <span className="text-rose-500">*</span>
                              </label>
                              <select
                                value={allocMemberRole}
                                onChange={(e: any) => setAllocMemberRole(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-900/10 cursor-pointer font-medium text-slate-900 text-xs transition-all"
                              >
                                <option value="STUDENT_INNOVATOR">Student Innovator (NEP ABC Track)</option>
                                <option value="CO_FACULTY_GUIDE">Faculty Co-Guide / Mentor</option>
                                <option value="LAB_TECHNICIAN">Lab Technician / Technical Specialist</option>
                                <option value="DEPARTMENT_HEAD">Department Head / Advisor</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block font-bold text-slate-700 mb-1 whitespace-nowrap text-[11px]">
                                Academic Department
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Computer Science & Engineering"
                                value={allocMemberDept}
                                onChange={(e) => setAllocMemberDept(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-900/10 font-medium text-slate-900 text-xs transition-all"
                              />
                            </div>

                            <div>
                              <label className="block font-bold text-slate-700 mb-1 whitespace-nowrap text-[11px]">
                                Roll / Employee ID
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. 22BTECH042"
                                value={allocMemberId}
                                onChange={(e) => setAllocMemberId(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-900/10 font-medium text-slate-900 text-xs transition-all"
                              />
                            </div>

                            <div>
                              <label className="block font-bold text-slate-700 mb-1 whitespace-nowrap text-[11px]">
                                NEP 2020 ABC Credits
                              </label>
                              <input
                                type="number"
                                min={1}
                                max={12}
                                value={allocMemberCredits}
                                onChange={(e) => setAllocMemberCredits(Number(e.target.value))}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-900/10 font-bold text-slate-900 text-xs transition-all"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-end pt-1.5 border-t border-slate-100">
                            <button
                              type="submit"
                              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              <span>Allocate to Project Roster</span>
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 7B: FACULTY & STUDENT DIRECTORY */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
            <div>
              <h2 className="font-black text-slate-900 text-base">Institutional Faculty &amp; Student Accounts</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage registered institutional researchers, faculty mentors, and student capstone innovators participating in civic R&amp;D.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsAddResearcherModalOpen(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-xs"
              >
                + Add / Invite Researcher
              </button>
            </div>
          </div>

          {/* Directory Filter & Search */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setUserRoleFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                  userRoleFilter === "ALL" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All Accounts ({institutionalUsers.length})
              </button>
              <button
                type="button"
                onClick={() => setUserRoleFilter("FACULTY")}
                className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                  userRoleFilter === "FACULTY" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Faculty Guides ({institutionalUsers.filter((u) => u.role === "FACULTY_MENTOR").length})
              </button>
              <button
                type="button"
                onClick={() => setUserRoleFilter("STUDENT")}
                className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                  userRoleFilter === "STUDENT" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Student Innovators ({institutionalUsers.filter((u) => u.role === "STUDENT_INNOVATOR").length})
              </button>
            </div>

            <div className="w-full md:w-72">
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search by name, department, roll ID..."
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900 outline-none text-xs focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Directory Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            {filteredInstitutionalUsers.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-xs font-medium space-y-2">
                <p>No researcher accounts found matching your search or filters.</p>
                <button
                  type="button"
                  onClick={() => setIsAddResearcherModalOpen(true)}
                  className="px-3.5 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-lg cursor-pointer"
                >
                  + Add Researcher Now
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 whitespace-nowrap">Researcher Name</th>
                      <th className="py-3 px-4 whitespace-nowrap">Role</th>
                      <th className="py-3 px-4 whitespace-nowrap">Department</th>
                      <th className="py-3 px-4 whitespace-nowrap">Roll / Employee ID</th>
                      <th className="py-3 px-4 whitespace-nowrap">Institutional Email</th>
                      <th className="py-3 px-4 whitespace-nowrap">Assigned Project</th>
                      <th className="py-3 px-4 whitespace-nowrap">Credits / Allocation</th>
                      <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInstitutionalUsers.map((userItem, idx) => (
                      <tr key={`${userItem.id || userItem.identifier || 'usr'}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">{userItem.name}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200 whitespace-nowrap">
                            {userItem.role === "FACULTY_MENTOR" ? "Faculty Mentor" : userItem.role.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 whitespace-nowrap">{userItem.department}</td>
                        <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80 text-[11px]">
                            {userItem.identifier}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">{userItem.email}</td>
                        <td className="py-3 px-4 font-mono font-medium text-slate-800 whitespace-nowrap">
                          {userItem.assignedProjectCode || "General Pool"}
                        </td>
                        <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                          <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                            {userItem.abcCredits ? `${userItem.abcCredits} ABC Credits` : "Project Guide"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleDeleteResearcher(userItem.id)}
                            className="px-2.5 py-1 text-rose-700 hover:text-rose-900 hover:bg-rose-50 border border-rose-200 rounded-md text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 8: COMMUNICATION & MESSAGING */}
      {(activeTab === "communication" || activeTab === "messages") && (
        <CommunicationWorkspace userRole="university" />
      )}

      {/* Catch-all fallback for unrecognized university tabs */}
      {![
        "overview",
        "inbox",
        "challenges",
        "projects",
        "accreditation",
        "teams",
        "users",
        "industry",
        "communication",
        "messages",
      ].includes(activeTab) && (
        <WorkspacePlaceholderTab
          title="University Workspace Module"
          description="This institutional module is being provisioned according to platform specifications."
          role="university"
          tabId={activeTab}
          onNavigateTab={onNavigateTab}
        />
      )}

      {/* MODAL 1: ACCEPT CHALLENGE & ASSIGN TEAM */}
      {selectedChallengeForAccept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 border border-slate-300 shadow-xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Accept Challenge &amp; Form Team</h3>
                <span className="text-slate-500 font-mono text-[11px]">{selectedChallengeForAccept.ticketId}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedChallengeForAccept(null)}
                className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 bg-slate-50 p-3 rounded border border-slate-200">
              <div className="font-semibold text-slate-900">{selectedChallengeForAccept.title}</div>
              <div className="text-slate-500 text-[11px] leading-relaxed">{selectedChallengeForAccept.description}</div>
              <div className="text-[11px] text-slate-500 pt-1">
                Location: {selectedChallengeForAccept.district} • Academic Track: Capstone R&D (4 Credits)
              </div>
            </div>

            <form onSubmit={handleConfirmAccept} className="space-y-3 font-medium">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Lead Faculty Mentor Name:</label>
                <input
                  type="text"
                  required
                  value={acceptFaculty}
                  onChange={(e) => setAcceptFaculty(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Department:</label>
                <input
                  type="text"
                  value={acceptDepartment}
                  onChange={(e) => setAcceptDepartment(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Student Lead Name:</label>
                  <input
                    type="text"
                    required
                    value={acceptStudentLead}
                    onChange={(e) => setAcceptStudentLead(e.target.value)}
                    placeholder="e.g. Rahul Kumar"
                    className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Student Roll Number:</label>
                  <input
                    type="text"
                    value={acceptStudentRoll}
                    onChange={(e) => setAcceptStudentRoll(e.target.value)}
                    placeholder="e.g. 22BTECH014"
                    className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedChallengeForAccept(null)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold cursor-pointer"
                >
                  Confirm Project Activation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DECLINE ASSIGNED CHALLENGE */}
      {selectedChallengeForDecline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 border border-slate-300 shadow-xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Decline Challenge Assignment</h3>
                <span className="text-slate-500 font-mono text-[11px]">Ticket #{selectedChallengeForDecline.ticketId}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedChallengeForDecline(null)}
                className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmDecline} className="space-y-4 font-medium">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
                <div className="font-semibold text-slate-900">{selectedChallengeForDecline.title}</div>
                <div className="text-slate-600 text-[11px]">{selectedChallengeForDecline.domain} • Location: {selectedChallengeForDecline.district}</div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Reason for Declining (Optional):</label>
                <textarea
                  rows={3}
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="e.g. Domain capacity constraints, ongoing semester lab saturation, or alternative HEI specialization recommended..."
                  className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Declining returns this challenge to the Statewide Open Pool and State Nodal Triage for re-routing.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedChallengeForDecline(null)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded font-semibold cursor-pointer"
                >
                  Confirm Decline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PROPOSAL REQUISITION & GRANT ALLOCATION */}
      {selectedProjectForProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 border border-slate-300 shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Capstone Project Proposal &amp; Grant Requisition</h3>
                <span className="text-slate-500 font-mono text-[11px]">Project: {selectedProjectForProposal.projectCode || `PROJ-${selectedProjectForProposal.id}`}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProjectForProposal(null)}
                className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmProposal} className="space-y-4 font-medium">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Project / Capstone Title *</label>
                <input
                  type="text"
                  required
                  value={proposalForm.title}
                  onChange={(e) => setProposalForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Domain / Specialization</label>
                  <input
                    type="text"
                    value={proposalForm.domain}
                    onChange={(e) => setProposalForm((prev) => ({ ...prev, domain: e.target.value }))}
                    placeholder="e.g. Water Treatment & IoT Sensors"
                    className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Allocated Seed Grant (₹)</label>
                  <input
                    type="number"
                    min={50000}
                    step={10000}
                    value={proposalForm.allocatedGrant}
                    onChange={(e) => setProposalForm((prev) => ({ ...prev, allocatedGrant: Number(e.target.value) || 250000 }))}
                    className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Executive Abstract &amp; Problem Statement</label>
                <textarea
                  rows={3}
                  value={proposalForm.abstractDescription}
                  onChange={(e) => setProposalForm((prev) => ({ ...prev, abstractDescription: e.target.value }))}
                  placeholder="Detailed problem formulation and proposed technology solution..."
                  className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Technical Methodology &amp; Execution Roadmap</label>
                <textarea
                  rows={3}
                  value={proposalForm.methodology}
                  onChange={(e) => setProposalForm((prev) => ({ ...prev, methodology: e.target.value }))}
                  placeholder="Describe phase-wise prototyping steps, testing benchmarks, and expected civic outcome..."
                  className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedProjectForProposal(null)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold cursor-pointer"
                >
                  Save &amp; Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REQUEST TO SOLVE (CLAIM STATEWIDE CHALLENGE) */}
      {selectedChallengeForClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 border border-slate-300 shadow-xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Request to Solve Challenge</h3>
                <span className="text-slate-500 font-mono text-[11px]">{selectedChallengeForClaim.ticketId}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedChallengeForClaim(null)}
                className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 bg-slate-50 p-3 rounded border border-slate-200">
              <div className="font-semibold text-slate-900">{selectedChallengeForClaim.title}</div>
              <div className="text-slate-600 text-[11px] leading-relaxed">{selectedChallengeForClaim.description}</div>
              <div className="text-slate-500 text-[11px] pt-1">
                Location: {selectedChallengeForClaim.district}{selectedChallengeForClaim.block ? `, ${selectedChallengeForClaim.block}` : ""} • Sector: {selectedChallengeForClaim.domain || selectedChallengeForClaim.sector}
              </div>
            </div>

            <form onSubmit={handleConfirmClaim} className="space-y-3 font-medium">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Lead Faculty Investigator:</label>
                <input
                  type="text"
                  required
                  value={claimFaculty}
                  onChange={(e) => setClaimFaculty(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Proposed Technical Approach &amp; Facilities:</label>
                <textarea
                  rows={3}
                  required
                  value={claimApproach}
                  onChange={(e) => setClaimApproach(e.target.value)}
                  placeholder="Outline the technical methodology, lab equipment to be utilized, and field validation plan..."
                  className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Estimated Timeline (Months):</label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={claimTimelineMonths}
                  onChange={(e) => setClaimTimelineMonths(parseInt(e.target.value) || 6)}
                  className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedChallengeForClaim(null)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold cursor-pointer"
                >
                  Submit Proposal Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PROJECT LIFECYCLE, MILESTONES, DELIVERABLES, TESTING & DUAL SIGNOFF */}
      {selectedProjectForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="max-w-5xl w-full">
            <ProjectMilestoneTimeline
              project={selectedProjectForDetail}
              onClose={() => setSelectedProjectForDetail(null)}
              onProjectUpdated={(up) => {
                setSelectedProjectForDetail(up);
              }}
            />
          </div>
        </div>
      )}

      {/* MODAL 4: OFFICIAL INSTITUTIONAL SSR AUDIT REPORT */}
      {isSsrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg max-w-4xl w-full p-8 border border-slate-300 shadow-2xl space-y-6 text-xs max-h-[92vh] overflow-y-auto print:p-0 print:border-none print:shadow-none">
            {/* Header Actions */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 print:hidden">
              <div>
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                  Accreditation Audit Report • NAAC Metric 3.6 / NIRF
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Institutional Self-Study Report (SSR) - Extension Activities
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold cursor-pointer"
                >
                  Print / Export PDF
                </button>
                <button
                  type="button"
                  onClick={() => setIsSsrModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Official Report Document */}
            <div className="space-y-6 p-4 border border-slate-200 rounded bg-slate-50/50 print:border-none print:bg-white print:p-0">
              {/* Institution Header */}
              <div className="text-center pb-4 border-b border-slate-300">
                <div className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                  National Assessment and Accreditation Council (NAAC) Documentation
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-1 uppercase">
                  {institutionName}
                </h2>
                <div className="text-xs text-slate-600 mt-1">
                  AISHE Code: <span className="font-mono font-bold text-slate-800">{aisheCode}</span> • Cycle 3 Assessment (2024–2029)
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Criterion III: Research, Innovations and Extension — Metric 3.6.1 &amp; Metric 3.6.2
                </div>
              </div>

              {/* Section 1: Quantitative Audit Metrics */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b border-slate-200 pb-1">
                  1. Quantitative Impact &amp; Social Extension Metrics
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="p-3 bg-white border border-slate-200 rounded">
                    <div className="text-slate-500 text-[11px]">Civic Problems Routed</div>
                    <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                      {routedChallenges.length + projects.length}
                    </div>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded">
                    <div className="text-slate-500 text-[11px]">Deployments Handed Over</div>
                    <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                      {projects.filter(p => p.stage === "COMPLETED" || p.stage === "DEPLOYMENT_HANDOVER").length}
                    </div>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded">
                    <div className="text-slate-500 text-[11px]">Verified Field Hours</div>
                    <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                      {accreditation?.totalCommunityHours || 3420} hrs
                    </div>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded">
                    <div className="text-slate-500 text-[11px]">Beneficiaries Impacted</div>
                    <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                      {accreditation?.totalCitizenBeneficiaries || 45200}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Verified Extension Projects Table */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b border-slate-200 pb-1">
                  2. Institutional Extension &amp; Field R&amp;D Projects
                </h4>
                <table className="w-full text-left text-xs bg-white border border-slate-200 rounded">
                  <thead className="bg-slate-100 font-semibold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Project Code</th>
                      <th className="py-2.5 px-3">Problem Statement &amp; Solution</th>
                      <th className="py-2.5 px-3">District</th>
                      <th className="py-2.5 px-3">Lead Guide</th>
                      <th className="py-2.5 px-3">Citizen Verification</th>
                      <th className="py-2.5 px-3 text-right">Credits Disbursed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {projects.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{p.projectCode || p.id}</td>
                        <td className="py-2.5 px-3 max-w-xs">
                          <div className="font-semibold text-slate-900">{p.title}</div>
                          <div className="text-slate-500 text-[11px] truncate">{p.milestoneDesc}</div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">{p.district || "Jharkhand"}</td>
                        <td className="py-2.5 px-3 text-slate-800">{p.facultyMentor}</td>
                        <td className="py-2.5 px-3 text-slate-800 font-medium">
                          {p.citizenVerificationStatus === "VERIFIED" ? "Verified (5.0/5.0)" : "Field Testing"}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-right">
                          {p.teamMembers?.reduce((sum, m) => sum + (m.abcCredits || 0), 0) || 12} Credits
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Section 3: UN SDG Goals Mapped */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b border-slate-200 pb-1">
                  3. United Nations Sustainable Development Goals Alignment
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 border border-slate-200 bg-white rounded">
                    <strong>SDG 6 (Clean Water):</strong> 3 Solutions Deployed
                  </div>
                  <div className="p-2 border border-slate-200 bg-white rounded">
                    <strong>SDG 7 (Clean Energy):</strong> 2 Solar Systems
                  </div>
                  <div className="p-2 border border-slate-200 bg-white rounded">
                    <strong>SDG 11 (Sustainable Cities):</strong> 4 Civic AI Modules
                  </div>
                  <div className="p-2 border border-slate-200 bg-white rounded">
                    <strong>SDG 3 (Good Health):</strong> 2 Rural Health Kiosks
                  </div>
                </div>
              </div>

              {/* Section 4: Institutional Attestation & Sign-off */}
              <div className="pt-6 border-t border-slate-300">
                <div className="text-xs text-slate-500 mb-6 italic text-center">
                  This self-study report has been compiled directly from the digital state civic innovation repository and is certified authentic for NAAC Peer Team Review.
                </div>
                <div className="grid grid-cols-3 gap-8 text-center text-xs">
                  <div className="border-t border-slate-400 pt-2">
                    <strong className="text-slate-900 block">{user?.name || "Dr. S. K. Roy"}</strong>
                    <span className="text-slate-500 text-[11px]">Institutional Nodal SPOC</span>
                  </div>
                  <div className="border-t border-slate-400 pt-2">
                    <strong className="text-slate-900 block">Prof. (Dr.) A. Sengupta</strong>
                    <span className="text-slate-500 text-[11px]">Dean (Research &amp; Extension)</span>
                  </div>
                  <div className="border-t border-slate-400 pt-2">
                    <strong className="text-slate-900 block">Prof. (Dr.) I. Manna</strong>
                    <span className="text-slate-500 text-[11px]">Vice Chancellor / Director</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 print:hidden">
              <button
                type="button"
                onClick={() => setIsSsrModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Close Report
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold cursor-pointer"
              >
                Print / Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: NEP 2020 ACADEMIC BANK OF CREDITS CERTIFICATE */}
      {selectedStudentForCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg max-w-2xl w-full p-8 border border-slate-300 shadow-2xl space-y-6 text-xs max-h-[92vh] overflow-y-auto print:p-0 print:border-none print:shadow-none">
            {/* Header Actions */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 print:hidden">
              <span className="font-mono text-slate-500 text-[11px] uppercase tracking-wider">
                Official Credential Verification • NEP 2020 / NCrF
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold cursor-pointer"
                >
                  Print Certificate
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStudentForCertificate(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Official Certificate Card */}
            <div className="border-4 border-slate-800 p-6 rounded bg-white text-slate-900 space-y-5 relative">
              <div className="text-center space-y-1 pb-3 border-b-2 border-slate-800">
                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
                  Government of India • Ministry of Education
                </div>
                <div className="text-xs uppercase font-semibold text-slate-500">
                  National Academic Depository &amp; Academic Bank of Credits (ABC)
                </div>
                <h2 className="text-base font-black uppercase text-slate-900 tracking-wide mt-1">
                  Experiential Learning &amp; Social Innovation Credit Certificate
                </h2>
                <div className="text-[11px] text-slate-600">
                  Issued under National Credit Framework (NCrF) Level 6.0
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <p className="text-xs leading-relaxed text-slate-700">
                  This is to officially certify that the student researcher named below has successfully completed
                  the mandatory experiential community innovation internship and capstone field deployment under the
                  prescribed guidelines of the <strong>National Education Policy (NEP 2020)</strong>.
                </p>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500 text-[11px] block">Student Innovator Name:</span>
                      <strong className="text-slate-900 text-sm">{selectedStudentForCertificate.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">Roll / Registration ID:</span>
                      <strong className="font-mono text-slate-900 text-sm">{selectedStudentForCertificate.identifier || "22BTECH014"}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                    <div>
                      <span className="text-slate-500 text-[11px] block">Academic Institution:</span>
                      <strong className="text-slate-900">{institutionName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">AISHE Code:</span>
                      <strong className="font-mono text-slate-900">{aisheCode}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                    <div>
                      <span className="text-slate-500 text-[11px] block">Course Practicum:</span>
                      <strong className="text-slate-900">Civic Tech Innovation &amp; Extension (NEP-EXT-301)</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">Disbursed ABC Credits:</span>
                      <strong className="font-mono text-slate-900 text-sm">
                        {selectedStudentForCertificate.abcCredits || 4} Academic Credits (Grade O - Outstanding)
                      </strong>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-slate-200">
                    <span className="text-slate-500 text-[11px] block">Assigned Capstone Code:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {selectedStudentForCertificate.projectCode || "BIT-WATER-2024-01"} • {selectedStudentForCertificate.projectTitle || "Arsenic & Turbidity Inline Filtration Unit"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cryptographic QR Verification Badge */}
              <div className="flex items-center justify-between gap-4 p-3 border border-slate-200 rounded bg-slate-50">
                <div className="flex items-center gap-3">
                  {/* Clean SVG QR Code */}
                  <svg className="w-16 h-16 bg-white border border-slate-300 p-1 flex-shrink-0" viewBox="0 0 25 25" fill="currentColor">
                    <rect x="2" y="2" width="6" height="6" fill="#0f172a" />
                    <rect x="3" y="3" width="4" height="4" fill="#ffffff" />
                    <rect x="4" y="4" width="2" height="2" fill="#0f172a" />
                    <rect x="17" y="2" width="6" height="6" fill="#0f172a" />
                    <rect x="18" y="3" width="4" height="4" fill="#ffffff" />
                    <rect x="19" y="4" width="2" height="2" fill="#0f172a" />
                    <rect x="2" y="17" width="6" height="6" fill="#0f172a" />
                    <rect x="3" y="18" width="4" height="4" fill="#ffffff" />
                    <rect x="4" y="19" width="2" height="2" fill="#0f172a" />
                    <rect x="10" y="2" width="2" height="2" fill="#0f172a" />
                    <rect x="13" y="4" width="2" height="2" fill="#0f172a" />
                    <rect x="10" y="7" width="2" height="2" fill="#0f172a" />
                    <rect x="10" y="10" width="5" height="5" fill="#0f172a" />
                    <rect x="11" y="11" width="3" height="3" fill="#ffffff" />
                    <rect x="17" y="10" width="2" height="4" fill="#0f172a" />
                    <rect x="20" y="13" width="3" height="2" fill="#0f172a" />
                    <rect x="10" y="17" width="2" height="3" fill="#0f172a" />
                    <rect x="14" y="18" width="3" height="2" fill="#0f172a" />
                    <rect x="18" y="17" width="5" height="2" fill="#0f172a" />
                    <rect x="19" y="21" width="4" height="2" fill="#0f172a" />
                  </svg>
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 text-[11px]">Verified Academic Credential</div>
                    <div className="font-mono text-[10px] text-slate-500">
                      ID: ABC-JH-2024-{selectedStudentForCertificate.identifier || "8841"}
                    </div>
                    <div className="font-mono text-[10px] text-slate-500 truncate max-w-xs">
                      Hash: SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1f
                    </div>
                  </div>
                </div>
                <div className="text-right text-[11px] font-mono text-slate-600">
                  Status: <strong>AUTHENTIC</strong>
                </div>
              </div>

              {/* Sign-off signatures */}
              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-300 text-center text-xs">
                <div className="border-t border-slate-400 pt-1">
                  <strong className="text-slate-900 block">{user?.name || "Dr. S. K. Roy"}</strong>
                  <span className="text-slate-500 text-[11px]">Nodal Faculty Coordinator</span>
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <strong className="text-slate-900 block">Dr. S. Mukherjee</strong>
                  <span className="text-slate-500 text-[11px]">Controller of Examinations</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 print:hidden">
              <button
                type="button"
                onClick={() => setSelectedStudentForCertificate(null)}
                className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold cursor-pointer"
              >
                Print Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: ADD / INVITE RESEARCHER */}
      {isAddResearcherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-lg max-w-md w-full p-6 border border-slate-300 shadow-xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Add / Invite Researcher</h3>
                <span className="text-slate-500 text-[11px]">Register faculty mentor or student innovator account</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddResearcherModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmAddResearcher} className="space-y-3 font-medium">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Full Name:</label>
                <input
                  type="text"
                  required
                  value={newResearcherName}
                  onChange={(e) => setNewResearcherName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Verma or Priya Kumari"
                  className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Account Role:</label>
                  <select
                    value={newResearcherRole}
                    onChange={(e) => setNewResearcherRole(e.target.value as TeamMemberRole)}
                    className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 outline-none"
                  >
                    <option value="STUDENT_INNOVATOR">Student Innovator</option>
                    <option value="FACULTY_MENTOR">Faculty Mentor</option>
                    <option value="LAB_TECHNICIAN">Lab Technician</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Roll / Employee ID:</label>
                  <input
                    type="text"
                    value={newResearcherId}
                    onChange={(e) => setNewResearcherId(e.target.value)}
                    placeholder="e.g. 22BTECH045 or FAC-092"
                    className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Department:</label>
                <input
                  type="text"
                  required
                  value={newResearcherDept}
                  onChange={(e) => setNewResearcherDept(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Institutional Email:</label>
                <input
                  type="email"
                  value={newResearcherEmail}
                  onChange={(e) => setNewResearcherEmail(e.target.value)}
                  placeholder="e.g. researcher@institution.edu.in"
                  className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Assign to Project:</label>
                  <select
                    value={newResearcherProjectCode}
                    onChange={(e) => setNewResearcherProjectCode(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 outline-none"
                  >
                    <option value="">General Research Pool</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.projectCode || p.id.toString()}>
                        {p.projectCode || `Project #${p.id}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">NEP ABC Credits:</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={newResearcherCredits}
                    onChange={(e) => setNewResearcherCredits(parseInt(e.target.value) || 4)}
                    className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddResearcherModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold cursor-pointer"
                >
                  Register Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: REACH OUT / PITCH PROJECT FOR CSR GRANT */}
      {isCsrPitchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 border border-slate-300 shadow-xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Request CSR Co-Funding / Hardware Grant</h3>
                <span className="text-slate-500 text-[11px]">Submit proposal to corporate CSR committee</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCsrPitchModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmCsrPitch} className="space-y-3 font-medium">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Target CSR Partner / Registered Industry:</label>
                <select
                  value={targetPartnerForPitch}
                  onChange={(e) => setTargetPartnerForPitch(e.target.value)}
                  required
                  className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 outline-none"
                >
                  <option value="" disabled>— Select a registered company —</option>
                  {registeredIndustryList.length > 0 && (
                    <optgroup label="Registered Corporate & Industry Partners">
                      {registeredIndustryList.map((partnerName) => (
                        <option key={partnerName} value={partnerName}>
                          {partnerName}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="Other / Enter Manually">
                    <option value="CUSTOM">+ Enter Company Name Manually...</option>
                  </optgroup>
                </select>

                {registeredIndustryList.length === 0 && targetPartnerForPitch !== "CUSTOM" && (
                  <p className="text-[11px] text-amber-600 mt-1.5 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                    ⚠ No registered industry partners found. Please ask the industry to save their company profile first, or enter the company name manually using the option above.
                  </p>
                )}

                {targetPartnerForPitch === "CUSTOM" && (
                  <div className="mt-2">
                    <input
                      type="text"
                      required
                      value={customPartnerName}
                      onChange={(e) => setCustomPartnerName(e.target.value)}
                      placeholder="Enter registered Industry / Company Name (e.g. Acme Corp)"
                      className="w-full p-2 border border-indigo-400 rounded bg-indigo-50/30 text-slate-900 outline-none font-medium"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Select University Project:</label>
                <select
                  required
                  value={selectedProjectIdForPitch}
                  onChange={(e) => setSelectedProjectIdForPitch(e.target.value ? Number(e.target.value) : "")}
                  className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 outline-none"
                >
                  <option value="">Select Project to Fund...</option>
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.projectCode || proj.id} — {proj.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Grant Category:</label>
                  <select
                    value={pitchCategory}
                    onChange={(e) => setPitchCategory(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 outline-none"
                  >
                    <option value="Direct Hardware & Lab Equipment Grant">Hardware &amp; Lab Sensors</option>
                    <option value="Corporate Engineering Mentor Assignment">Corporate Mentor Assignment</option>
                    <option value="Field Pilot Testing & Deployment Co-Sponsorship">Field Pilot Sponsorship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Requested Amount (₹):</label>
                  <input
                    type="number"
                    min={25000}
                    max={1000000}
                    step={25000}
                    value={pitchAmount}
                    onChange={(e) => setPitchAmount(parseInt(e.target.value) || 250000)}
                    className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Corporate Technical Mentor Requirements:</label>
                <input
                  type="text"
                  value={pitchMentorNeeds}
                  onChange={(e) => setPitchMentorNeeds(e.target.value)}
                  placeholder="e.g. Senior IoT firmware architect for battery telemetry review"
                  className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Proposal Summary &amp; Bill of Materials Justification:</label>
                <textarea
                  rows={3}
                  required
                  value={pitchDescription}
                  onChange={(e) => setPitchDescription(e.target.value)}
                  placeholder="Detail the specific lab components, microcontrollers, or testing sites required..."
                  className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCsrPitchModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold cursor-pointer"
                >
                  Submit CSR Grant Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
