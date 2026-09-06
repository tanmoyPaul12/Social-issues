"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "@/components/dashboard/ToastStack";
import { useUniversity } from "@/modules/university/hooks/useUniversity";
import {
  RoutedChallenge,
  UniversityProject,
  TeamMember,
  TeamMemberRole,
  UniversityProjectStage,
} from "@/modules/university/types";

interface UniversityDashboardViewProps {
  activeTab?: string;
}

const JHARKHAND_DISTRICTS = [
  "All 24 Districts", "Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa",
  "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma",
  "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj",
  "Saraikela Kharsawan", "Simdega", "West Singhbhum"
];

const SECTOR_OPTIONS = [
  "ALL", "WATER", "AGRICULTURE", "HEALTH", "EDUCATION", "INFRASTRUCTURE", "ENVIRONMENT", "ELECTRICITY", "SANITATION"
];

export function UniversityDashboardView({ activeTab = "overview" }: UniversityDashboardViewProps) {
  const { user, token } = useAuthStore();
  const aisheCode = user?.aisheCode || "U-0205";
  const institutionName = user?.orgName || "Academic Research Institution";

  // Connect to real university backend hook
  const {
    routedChallenges,
    openChallenges,
    projects,
    industryOffers,
    isLoading,
    claimChallenge,
    createProject,
    updateStage,
    addTeamMember,
  } = useUniversity(aisheCode, token);

  // Local UI State
  const [selectedDistrict, setSelectedDistrict] = useState("All 24 Districts");
  const [selectedSector, setSelectedSector] = useState("ALL");
  const [selectedSubTab, setSelectedSubTab] = useState<"routed" | "open">("routed");
  const currentSubTab = activeTab === "challenges" ? "open" : activeTab === "inbox" ? "routed" : selectedSubTab;

  // Modals
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<RoutedChallenge | null>(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedClaimTarget, setSelectedClaimTarget] = useState<RoutedChallenge | null>(null);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [selectedProjectForRoster, setSelectedProjectForRoster] = useState<UniversityProject | null>(null);

  // Team Assignment Form State
  const defaultFaculty = user?.name ? `${user.name} (${user.designation || "Lead SPOC"})` : "Nodal Faculty Mentor";
  const [assignFaculty, setAssignFaculty] = useState(defaultFaculty);
  const [assignFacultyDept, setAssignFacultyDept] = useState("Department of Applied Sciences");
  const [assignStudentLead, setAssignStudentLead] = useState("");
  const [assignStudentRoll, setAssignStudentRoll] = useState("");
  const [assignCapstones, setAssignCapstones] = useState("");

  // Claim Form State
  const [claimFacultyName, setClaimFacultyName] = useState(user?.name || "Dr. Nodal SPOC");
  const [claimApproach, setClaimApproach] = useState("");
  const [claimTimelineMonths, setClaimTimelineMonths] = useState(6);

  // Add Member to existing project state
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<TeamMemberRole>("STUDENT_INNOVATOR");
  const [newMemberDept, setNewMemberDept] = useState("Computer Science & Engineering");
  const [newMemberId, setNewMemberId] = useState("");
  const [newMemberCredits, setNewMemberCredits] = useState(4);

  const aisheBadge = user?.aisheCode
    ? `AISHE: ${user.aisheCode} • ${institutionName}`
    : `Institution: ${institutionName}`;

  // Filter open challenges
  const filteredOpenChallenges = openChallenges.filter((ch) => {
    const matchDistrict = selectedDistrict === "All 24 Districts" || ch.district === selectedDistrict;
    const matchSector = selectedSector === "ALL" || ch.sector === selectedSector;
    return matchDistrict && matchSector;
  });

  // Handle Team Assignment & Project Creation
  const handleOpenTeamModal = (item: RoutedChallenge) => {
    setSelectedChallenge(item);
    setIsTeamModalOpen(true);
  };

  const handleConfirmTeamAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallenge) return;

    try {
      const teamList: TeamMember[] = [];
      if (assignFaculty) {
        teamList.push({
          role: "FACULTY_MENTOR",
          name: assignFaculty,
          department: assignFacultyDept,
          isLead: true,
        });
      }
      if (assignStudentLead) {
        teamList.push({
          role: "STUDENT_INNOVATOR",
          name: assignStudentLead,
          identifier: assignStudentRoll || undefined,
          department: assignFacultyDept,
          isLead: true,
          abcCredits: 6,
        });
      }

      await createProject({
        issueId: selectedChallenge.id,
        ticketId: selectedChallenge.ticketId,
        aisheCode: aisheCode,
        universityName: institutionName,
        title: selectedChallenge.title,
        abstractDescription: selectedChallenge.description,
        domain: selectedChallenge.domain,
        district: selectedChallenge.district,
        leadFacultyMentor: assignFaculty || defaultFaculty,
        leadStudentInnovator: assignStudentLead ? `${assignStudentLead} ${assignCapstones ? `+ ${assignCapstones}` : ""}` : "Student Capstone Team",
        allocatedGrant: 250000,
        csrPartner: "State Innovation Fund",
        milestoneDesc: "Multidisciplinary team assembled; drafting prototype blueprint.",
        teamMembers: teamList,
      });

      setIsTeamModalOpen(false);
      setSelectedChallenge(null);
      toast.success(`Capstone project activated for "${selectedChallenge.title}"`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create project");
    }
  };

  // Handle Claim Open Challenge
  const handleOpenClaimModal = (item: RoutedChallenge) => {
    setSelectedClaimTarget(item);
    setClaimApproach(`We propose to develop a pilot prototype using our department facilities in ${institutionName}.`);
    setIsClaimModalOpen(true);
  };

  const handleConfirmClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaimTarget) return;

    try {
      await claimChallenge({
        issueId: selectedClaimTarget.id,
        aisheCode: aisheCode,
        universityName: institutionName,
        nodalSpocName: user?.name || "SPOC Lead",
        leadFacultyName: claimFacultyName,
        proposedApproach: claimApproach,
        estimatedTimelineMonths: claimTimelineMonths,
      });

      setIsClaimModalOpen(false);
      setSelectedClaimTarget(null);
      toast.success(`Successfully claimed challenge "${selectedClaimTarget.title}". Added to your workspace.`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit claim");
    }
  };

  // Add Member to Roster
  const handleAddMemberToProject = async (e: React.FormEvent) => {
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
      toast.success("Team member added with NEP ABC credits!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to add member");
    }
  };

  const STAGE_ORDER: UniversityProjectStage[] = [
    "TEAM_FORMATION",
    "LAB_PROTOTYPING",
    "FIELD_PILOT",
    "DEPLOYMENT_HANDOVER",
    "COMPLETED"
  ];

  const STAGE_PROGRESS: Record<UniversityProjectStage, number> = {
    TEAM_FORMATION: 25,
    LAB_PROTOTYPING: 50,
    FIELD_PILOT: 75,
    DEPLOYMENT_HANDOVER: 90,
    COMPLETED: 100
  };

  const handleAdvanceStage = async (project: UniversityProject) => {
    const currentIndex = STAGE_ORDER.indexOf(project.stage);
    if (currentIndex >= STAGE_ORDER.length - 1) {
      toast.info("Project is already completed and verified!");
      return;
    }
    const nextStage = STAGE_ORDER[currentIndex + 1];
    const nextProgress = STAGE_PROGRESS[nextStage];
    const milestoneNotes = `Advanced to ${nextStage.replace(/_/g, " ")} on ${new Date().toLocaleDateString()}`;

    try {
      await updateStage(project.id, nextStage, nextProgress, milestoneNotes);
      toast.success(`Project advanced to ${nextStage.replace(/_/g, " ")} (${nextProgress}%)`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to advance stage");
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 animate-in fade-in">
      {/* Top Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            University (HEI) Academic R&amp;D Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Welcome to the central academic research portal for <strong>{institutionName}</strong>. Triage grassroots challenges, manage multidisciplinary student capstones, and allocate NEP 2020 Academic Bank of Credits (ABC).
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <span className="text-xs font-bold text-purple-900 bg-purple-50 border border-purple-200 px-3 py-1 rounded">
            {aisheBadge}
          </span>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "AI-Routed Challenges", value: routedChallenges.length },
          { label: "Open State Challenges", value: openChallenges.length },
          { label: "Active Capstone Projects", value: projects.length },
          { label: "Industry CSR Offers", value: industryOffers.length },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-300/80 p-5 rounded-sm shadow-2xs">
            <div className="text-xs font-bold text-slate-700">{stat.label}</div>
            <div className="text-3xl font-black text-slate-900 mt-2 font-mono">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Main Tabs Navigation */}
      {(activeTab === "overview" || activeTab === "challenges" || activeTab === "inbox") && (
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedSubTab("routed")}
                className={`px-3.5 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
                  currentSubTab === "routed"
                    ? "bg-purple-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                🎯 AI-Routed Challenges ({routedChallenges.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedSubTab("open")}
                className={`px-3.5 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
                  currentSubTab === "open"
                    ? "bg-purple-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                🌐 Explore All Statewide Challenges ({openChallenges.length})
              </button>
            </div>

            {currentSubTab === "open" && (
              <div className="flex items-center gap-2 text-xs">
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  aria-label="Filter challenges by sector"
                  className="p-1.5 rounded border border-slate-300 bg-white font-medium text-slate-700 outline-none"
                >
                  {SECTOR_OPTIONS.map((sec) => (
                    <option key={sec} value={sec}>{sec === "ALL" ? "All Sectors" : sec}</option>
                  ))}
                </select>

                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  aria-label="Filter challenges by district"
                  className="p-1.5 rounded border border-slate-300 bg-white font-medium text-slate-700 outline-none"
                >
                  {JHARKHAND_DISTRICTS.map((dist) => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* SubTab 1: Routed Challenges */}
          {currentSubTab === "routed" && (
            <div className="space-y-3">
              {routedChallenges.length === 0 ? (
                <div className="p-8 text-center bg-white border border-slate-200 rounded-sm shadow-2xs">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">No Pending AI-Routed Challenges</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    Grassroots problems mapped to your institutional profile will appear here. You can also explore statewide open challenges in the next tab!
                  </p>
                </div>
              ) : (
                routedChallenges.map((item) => (
                  <div key={item.id} className="p-4 bg-white border border-slate-200 rounded-sm shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {item.ticketId}
                        </span>
                        <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {item.domain}
                        </span>
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">{item.matchScore}</span>
                        <span className="text-slate-400 font-mono text-[11px]">{item.district}{item.block ? ` • ${item.block}` : ""}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                      <p className="text-xs text-slate-600">{item.problemSnippet}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenTeamModal(item)}
                        className="px-4 py-2 rounded bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        Accept &amp; Form Team →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* SubTab 2: Open Statewide Challenges Pool */}
          {currentSubTab === "open" && (
            <div className="space-y-3">
              {filteredOpenChallenges.length === 0 ? (
                <div className="p-8 text-center bg-white border border-slate-200 rounded-sm">
                  <p className="text-xs text-slate-500">No open challenges found matching the selected filters.</p>
                </div>
              ) : (
                filteredOpenChallenges.map((item) => (
                  <div key={item.id} className="p-4 bg-white border border-slate-200 rounded-sm shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {item.ticketId}
                        </span>
                        <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {item.domain || item.sector}
                        </span>
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          item.urgency === "CRITICAL" ? "bg-red-50 text-red-700" : "bg-orange-50 text-orange-700"
                        }`}>
                          {item.urgency}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">{item.district}{item.block ? ` • ${item.block}` : ""}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                      <p className="text-xs text-slate-600">{item.problemSnippet}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenClaimModal(item)}
                        className="px-4 py-2 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        Request / Claim Challenge →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Section: Projects (Active Projects tab) */}
      {(activeTab === "overview" || activeTab === "projects") && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Active University Capstone Projects ({projects.length})
              </h2>
              <p className="text-xs text-slate-500">Student &amp; Faculty R&amp;D teams solving verified challenges under NEP 2020</p>
            </div>
            <span className="text-xs text-slate-500 font-mono">NEP 2020 Capstone Registry</span>
          </div>

          {projects.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-sm shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-slate-900">No Active Capstone Projects</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Triage and claim routed grassroots challenges above or form a new student capstone team to start receiving state R&amp;D grants.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Project ID</th>
                    <th className="py-3 px-4">Title &amp; Milestone</th>
                    <th className="py-3 px-4">Faculty Mentor</th>
                    <th className="py-3 px-4">Grant Budget</th>
                    <th className="py-3 px-4">Stage &amp; Progress</th>
                    <th className="py-3 px-4 text-right">Team Roster</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {projects.map((proj) => (
                    <tr key={proj.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-purple-800">{proj.projectCode || proj.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{proj.title}</div>
                        <div className="text-[11px] text-slate-500 max-w-sm">{proj.milestoneDesc}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{proj.facultyMentor}</div>
                        <div className="text-[11px] text-slate-500">{proj.studentLead}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                        {proj.grantFunded ? `₹${(proj.grantFunded / 100000).toFixed(1)} Lakhs` : "₹2.5 Lakhs"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                          {proj.stage.replace(/_/g, " ")} ({proj.progress}%)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {proj.stage !== "COMPLETED" && (
                            <button
                              type="button"
                              onClick={() => handleAdvanceStage(proj)}
                              className="px-2.5 py-1.5 rounded bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-bold text-xs transition-colors cursor-pointer"
                              title="Advance to next development stage"
                            >
                              Advance Stage ⚡
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProjectForRoster(proj);
                              setIsRosterModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                          >
                            Manage Team ({proj.teamMembers?.length || 2}) →
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Section: Industry Offers */}
      {(activeTab === "industry" || activeTab === "overview") && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Industry &amp; CSR Co-Funding Offers ({industryOffers.length})
            </h2>
            <p className="text-xs text-slate-500">Corporate partners pledging CSR grants, sandboxes, and expert co-mentors for your projects</p>
          </div>

          {industryOffers.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-sm">
              <p className="text-xs text-slate-500">No active industry offers at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {industryOffers.map((offer) => (
                <div key={offer.id} className="p-4 bg-white border border-slate-200 rounded-sm shadow-2xs space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded">
                      {offer.company}
                    </span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      ₹{(offer.offeredAmount / 100000).toFixed(1)} Lakhs CSR Grant
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{offer.projectTitle}</h3>
                  <p className="text-slate-600">{offer.messageNotes || "Corporate co-funding and mentor support pledged."}</p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">{offer.mentorName}</div>
                      <div className="text-[11px] text-slate-500">{offer.mentorDesignation}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.success(`Partner engagement accepted with ${offer.company}!`)}
                      className="px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-bold cursor-pointer"
                    >
                      Accept Partnership
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Section: Teams & Faculty Allocator (activeTab === 'teams') */}
      {activeTab === "teams" && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Multidisciplinary Team &amp; Faculty Allocator
              </h2>
              <p className="text-xs text-slate-500">
                Manage faculty mentors, student innovator rosters, and NEP 2020 Academic Bank of Credits (ABC) across all projects
              </p>
            </div>
            <span className="text-xs text-purple-900 bg-purple-50 border border-purple-200 px-3 py-1 rounded font-bold">
              {projects.length} Multidisciplinary Teams Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj) => (
              <div key={proj.id} className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded">
                    {proj.projectCode || proj.id}
                  </span>
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {proj.stage.replace(/_/g, " ")} ({proj.progress}%)
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{proj.title}</h3>

                <div className="bg-slate-50 rounded p-3 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lead Faculty Mentor:</span>
                    <strong className="text-slate-900">{proj.facultyMentor}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Student Lead:</span>
                    <span className="text-slate-800">{proj.studentLead}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-500">Team Size:</span>
                    <span className="font-bold text-purple-900">{proj.teamMembers?.length || 2} Members</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-emerald-700 font-bold">
                    NEP ABC Credits: {(proj.teamMembers?.reduce((acc, m) => acc + (m.abcCredits || 4), 0) || 8)} Credits
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProjectForRoster(proj);
                      setIsRosterModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Manage Team Roster →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section: Institutional Users & Accounts (activeTab === 'users') */}
      {activeTab === "users" && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Institutional Users &amp; Capstone Innovators Directory
              </h2>
              <p className="text-xs text-slate-500">
                Registered SPOC, Faculty Mentors, and Student Innovators for {institutionName}
              </p>
            </div>
            <button
              type="button"
              onClick={() => toast.info("Invitation link generated. Send to institutional email to register new researchers.")}
              className="px-3 py-1.5 rounded bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs cursor-pointer"
            >
              + Invite Faculty / Student
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-sm divide-y divide-slate-100 text-xs">
            {/* SPOC */}
            <div className="p-3.5 flex justify-between items-center hover:bg-slate-50">
              <div className="space-y-0.5">
                <strong className="text-slate-900 block text-sm">{user?.name || "Nodal SPOC Lead"}</strong>
                <span className="text-slate-500">{user?.designation || "Dean R&D / Institutional SPOC"} • {institutionName}</span>
                <span className="block text-[10px] text-slate-400 font-mono">AISHE Code: {aisheCode}</span>
              </div>
              <div className="text-right">
                <span className="text-purple-900 font-bold bg-purple-50 px-2 py-0.5 rounded block text-[11px]">Primary Institutional SPOC</span>
                <span className="text-slate-400 font-mono text-[10px]">{user?.email || "spoc@institution.edu.in"}</span>
              </div>
            </div>

            {/* List all active team members across all projects */}
            {projects.flatMap(p => (p.teamMembers || []).map(m => ({ ...m, projectCode: p.projectCode, projectTitle: p.title }))).map((m, idx) => (
              <div key={idx} className="p-3.5 flex justify-between items-center hover:bg-slate-50">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900 text-sm">{m.name}</strong>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {m.role.replace(/_/g, " ")}
                    </span>
                  </div>
                  <span className="text-slate-500 block">{m.department || "Academic Department"} • Project: {m.projectCode}</span>
                  {m.identifier && <span className="text-[10px] text-slate-400 font-mono">ID: {m.identifier}</span>}
                </div>
                <div className="text-right">
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded block text-[11px]">
                    {m.abcCredits || 4} NEP ABC Credits
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">{m.email || "student@institution.edu.in"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Form Capstone Team & Activate Project */}
      {isTeamModalOpen && selectedChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-md max-w-lg w-full p-6 shadow-2xl border border-slate-300 relative max-h-[90vh] overflow-y-auto text-xs">
            <button
              type="button"
              onClick={() => setIsTeamModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-base font-black text-slate-900">Form Multidisciplinary Capstone Team</h3>
            <p className="text-slate-500 mt-1">
              Assign a Lead Faculty Mentor and student innovators for <strong>{selectedChallenge.title}</strong>.
            </p>

            <form onSubmit={handleConfirmTeamAssignment} className="mt-4 space-y-3.5 font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Lead Faculty Mentor Name:</label>
                <input
                  type="text"
                  required
                  value={assignFaculty}
                  onChange={(e) => setAssignFaculty(e.target.value)}
                  placeholder="e.g. Dr. A. K. Sinha"
                  className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Faculty Department:</label>
                <input
                  type="text"
                  value={assignFacultyDept}
                  onChange={(e) => setAssignFacultyDept(e.target.value)}
                  placeholder="e.g. Dept of Mechanical & Hydraulics"
                  className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Student Lead Innovator:</label>
                  <input
                    type="text"
                    required
                    value={assignStudentLead}
                    onChange={(e) => setAssignStudentLead(e.target.value)}
                    placeholder="e.g. Rohan Verma"
                    className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Student Roll No:</label>
                  <input
                    type="text"
                    value={assignStudentRoll}
                    onChange={(e) => setAssignStudentRoll(e.target.value)}
                    placeholder="e.g. 21BTECH042"
                    className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Additional Student Innovators &amp; ABC Credits:</label>
                <input
                  type="text"
                  value={assignCapstones}
                  onChange={(e) => setAssignCapstones(e.target.value)}
                  placeholder="e.g. 3 Final Year B.Tech Students (6 NEP ABC Credits Each)"
                  className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded bg-purple-900 hover:bg-purple-800 text-white font-bold transition-all cursor-pointer mt-2"
              >
                Confirm Project Activation →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Request / Claim Open Challenge */}
      {isClaimModalOpen && selectedClaimTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-md max-w-lg w-full p-6 shadow-2xl border border-slate-300 relative max-h-[90vh] overflow-y-auto text-xs">
            <button
              type="button"
              onClick={() => setIsClaimModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-base font-black text-slate-900">Claim Statewide Challenge</h3>
            <p className="text-slate-500 mt-1">
              Submit an institutional claim to solve <strong>{selectedClaimTarget.title}</strong> ({selectedClaimTarget.district}).
            </p>

            <form onSubmit={handleConfirmClaim} className="mt-4 space-y-3.5 font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Designated Lead Faculty:</label>
                <input
                  type="text"
                  required
                  value={claimFacultyName}
                  onChange={(e) => setClaimFacultyName(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Proposed Technical Approach &amp; Lab Resources:</label>
                <textarea
                  rows={3}
                  required
                  value={claimApproach}
                  onChange={(e) => setClaimApproach(e.target.value)}
                  placeholder="Detail your lab capabilities, proposed prototype, and field testing methodology..."
                  className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Estimated Prototype Timeline (Months):</label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={claimTimelineMonths}
                  onChange={(e) => setClaimTimelineMonths(parseInt(e.target.value) || 6)}
                  className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all cursor-pointer mt-2"
              >
                Submit Claim to State Innovation Council →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Team Roster & NEP ABC Credits */}
      {isRosterModalOpen && selectedProjectForRoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-md max-w-xl w-full p-6 shadow-2xl border border-slate-300 relative max-h-[90vh] overflow-y-auto text-xs">
            <button
              type="button"
              onClick={() => setIsRosterModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-base font-black text-slate-900">Project Team Roster &amp; NEP ABC Credits</h3>
            <p className="text-slate-500 mt-0.5">
              Project Code: <span className="font-mono font-bold text-purple-900">{selectedProjectForRoster.projectCode || selectedProjectForRoster.id}</span>
            </p>

            {/* Existing Members List */}
            <div className="mt-4 border border-slate-200 rounded-sm divide-y divide-slate-100">
              {(selectedProjectForRoster.teamMembers && selectedProjectForRoster.teamMembers.length > 0) ? (
                selectedProjectForRoster.teamMembers.map((m, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">{m.name} {m.isLead ? "(Lead)" : ""}</span>
                      <span className="text-[11px] text-slate-500">{m.role.replace(/_/g, " ")} • {m.department}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                        {m.abcCredits || 4} ABC Credits
                      </span>
                      {m.identifier && <span className="block text-[10px] text-slate-400 font-mono">{m.identifier}</span>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-400">No additional team members listed.</div>
              )}
            </div>

            {/* Add New Member Form */}
            <div className="mt-5 pt-4 border-t border-slate-200">
              <h4 className="font-bold text-slate-800 mb-2">Add Student Innovator / Faculty to Team:</h4>
              <form onSubmit={handleAddMemberToProject} className="space-y-3 font-medium">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">Member Name:</label>
                    <input
                      type="text"
                      required
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      placeholder="e.g. Priya Kumari"
                      className="w-full p-1.5 rounded border border-slate-300 bg-white text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Role:</label>
                    <select
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value as TeamMemberRole)}
                      aria-label="Select member role"
                      className="w-full p-1.5 rounded border border-slate-300 bg-white text-slate-900 outline-none"
                    >
                      <option value="STUDENT_INNOVATOR">Student Innovator</option>
                      <option value="FACULTY_MENTOR">Faculty Co-Mentor</option>
                      <option value="LAB_TECHNICIAN">Lab Technician</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">Roll / Employee ID:</label>
                    <input
                      type="text"
                      value={newMemberId}
                      onChange={(e) => setNewMemberId(e.target.value)}
                      placeholder="e.g. 22MTECH008"
                      className="w-full p-1.5 rounded border border-slate-300 bg-white text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">NEP 2020 ABC Credits:</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={newMemberCredits}
                      onChange={(e) => setNewMemberCredits(parseInt(e.target.value) || 4)}
                      className="w-full p-1.5 rounded border border-slate-300 bg-white text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 rounded bg-purple-900 hover:bg-purple-800 text-white font-bold cursor-pointer"
                >
                  + Add Member to Project Roster
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
