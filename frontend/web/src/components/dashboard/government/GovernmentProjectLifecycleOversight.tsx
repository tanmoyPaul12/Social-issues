"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  Layers,
  Award,
  ShieldCheck,
  FileText,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Check,
  ChevronRight,
  Star,
  Activity,
  ArrowRight,
  Download,
  Users,
  X,
} from "@/components/dashboard/icons";
import { toast } from "@/components/dashboard/ToastStack";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { projectLifecycleApi } from "@/modules/university/services/projectLifecycleApi";
import { GovernmentPagination } from "./GovernmentPagination";
import {
  UniversityProject,
  ProjectLifecycleDossierDto,
  MilestoneDto,
  DeliverableDto,
  TestResultDto,
  ApprovalSignoffDto,
  IpRecordDto,
  ApprovalStage,
  ApprovalStatus,
  ApproverRole,
} from "@/modules/university/types";

const ALL_JHARKHAND_DISTRICTS = [
  "Ranchi",
  "Dhanbad",
  "East Singhbhum",
  "Bokaro",
  "Hazaribagh",
  "Deoghar",
  "Palamu",
  "Dumka",
  "Giridih",
  "Ramgarh",
  "West Singhbhum",
  "Latehar",
  "Sahibganj",
  "Khunti",
  "Gumla",
  "Simdega",
  "Garhwa",
  "Godda",
  "Chatra",
  "Koderma",
  "Jamtara",
  "Pakur",
  "Lohardaga",
  "Saraikela",
];

const OFFICIAL_DOMAINS = [
  "Agriculture",
  "Water Resources",
  "Healthcare",
  "Clean Energy",
  "Education",
  "Rural Infra",
  "Sanitation",
  "Environment",
  "Public Admin",
  "Livelihoods",
];

const TRL_DESCRIPTIONS: Record<number, { title: string; desc: string; phase: string }> = {
  1: { title: "Basic Principles Observed", desc: "Scientific research formulated into concept", phase: "Research" },
  2: { title: "Technology Concept Formulated", desc: "Practical application and design identified", phase: "Research" },
  3: { title: "Experimental Proof of Concept", desc: "Active R&D with lab validation", phase: "Research" },
  4: { title: "Lab Component Validation", desc: "Basic prototype assembled in lab", phase: "Prototyping" },
  5: { title: "Relevant Environment Validation", desc: "Integrated components tested in local environment", phase: "Prototyping" },
  6: { title: "System Prototype Demonstration", desc: "Prototype demonstrated in actual field conditions", phase: "Piloting" },
  7: { title: "Operational Environment Demo", desc: "Pre-commercial prototype demonstrated in field", phase: "Piloting" },
  8: { title: "System Complete & Qualified", desc: "Field tested, certified & safety compliant", phase: "Deployment" },
  9: { title: "Full Operational Deployment", desc: "Sustainably deployed & handed over", phase: "Deployment" },
};

interface GovernmentProjectLifecycleOversightProps {
  userDistrict?: string;
}

export function GovernmentProjectLifecycleOversight({ userDistrict }: GovernmentProjectLifecycleOversightProps = {}) {
  const { token, user } = useAuthStore();

  const rawDistrict = userDistrict || user?.district?.trim() || "";
  const isDistrictScoped = Boolean(
    rawDistrict &&
    rawDistrict.toLowerCase() !== "statewide" &&
    rawDistrict.toLowerCase() !== "all" &&
    rawDistrict.toLowerCase() !== "all 24 districts" &&
    rawDistrict.toLowerCase() !== "jharkhand"
  );

  // Project List State
  const [projects, setProjects] = useState<UniversityProject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>(
    isDistrictScoped ? rawDistrict : "All 24 Districts"
  );
  const [selectedDomain, setSelectedDomain] = useState<string>("ALL");
  const [selectedStage, setSelectedStage] = useState<string>("ALL");

  useEffect(() => {
    if (isDistrictScoped) {
      setSelectedDistrict(rawDistrict);
    }
  }, [isDistrictScoped, rawDistrict]);

  // Selected Dossier State
  const [selectedProject, setSelectedProject] = useState<UniversityProject | null>(null);
  const [dossier, setDossier] = useState<ProjectLifecycleDossierDto | null>(null);
  const [isLoadingDossier, setIsLoadingDossier] = useState<boolean>(false);
  const [dossierTab, setDossierTab] = useState<"milestones" | "testing" | "signoff" | "ip">("milestones");

  // Nodal Signoff Modal State
  const [showSignoffModal, setShowSignoffModal] = useState<boolean>(false);
  const [signoffStage, setSignoffStage] = useState<ApprovalStage>("FIELD_PILOT");
  const [signoffStatus, setSignoffStatus] = useState<ApprovalStatus>("APPROVED");
  const [signoffRemarks, setSignoffRemarks] = useState<string>("");
  const [closureCertUrl, setClosureCertUrl] = useState<string>("");
  const [isSubmittingSignoff, setIsSubmittingSignoff] = useState<boolean>(false);

  // Deliverable Review Modal State
  const [selectedDeliverable, setSelectedDeliverable] = useState<DeliverableDto | null>(null);
  const [deliverableNotes, setDeliverableNotes] = useState<string>("");
  const [isReviewingDeliverable, setIsReviewingDeliverable] = useState<boolean>(false);

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Load Projects from Real API
  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await projectLifecycleApi.getProjectsOversight(
        {
          district: selectedDistrict,
          domain: selectedDomain,
          stage: selectedStage,
          search: searchQuery,
          page,
          size: rowsPerPage,
        },
        token
      );
      setProjects(res.content || []);
      setTotalElements(res.totalElements || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      console.warn("Could not fetch projects oversight list:", err);
      setProjects([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedDistrict, selectedDomain, selectedStage, searchQuery, page, rowsPerPage, token]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadProjects();
  };

  // Open Full 360° Dossier
  const handleOpenDossier = async (proj: UniversityProject) => {
    setSelectedProject(proj);
    setIsLoadingDossier(true);
    setDossierTab("milestones");
    try {
      const d = await projectLifecycleApi.getProjectDossier(proj.id, token);
      setDossier(d);
    } catch (err: any) {
      toast.error(err.message || "Failed to load project lifecycle dossier");
      setDossier(null);
    } finally {
      setIsLoadingDossier(false);
    }
  };

  const handleCloseDossier = () => {
    setSelectedProject(null);
    setDossier(null);
  };

  // Submit Government Nodal Stage Approval
  const handleSubmitNodalSignoff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    setIsSubmittingSignoff(true);
    try {
      await projectLifecycleApi.recordNodalSignoff(
        selectedProject.id,
        {
          stage: signoffStage,
          approverRole: "NODAL_GOVT_OFFICER",
          approverName: user?.name || "State Nodal Officer",
          approvalStatus: signoffStatus,
          remarks: signoffRemarks.trim(),
          closureCertificateUrl: closureCertUrl.trim() || undefined,
        },
        token
      );

      toast.success(`Government clearance for stage ${signoffStage} recorded successfully!`);
      setShowSignoffModal(false);
      setSignoffRemarks("");
      setClosureCertUrl("");

      // Refresh Dossier and Projects list
      const updatedDossier = await projectLifecycleApi.getProjectDossier(selectedProject.id, token);
      setDossier(updatedDossier);
      loadProjects();
    } catch (err: any) {
      toast.error(err.message || "Failed to record nodal signoff");
    } finally {
      setIsSubmittingSignoff(false);
    }
  };

  // Review / Approve Deliverable Item
  const handleReviewDeliverable = async (deliverableId: number, isApproved: boolean) => {
    if (!selectedProject) return;

    setIsReviewingDeliverable(true);
    try {
      await projectLifecycleApi.reviewDeliverable(
        selectedProject.id,
        deliverableId,
        isApproved,
        deliverableNotes.trim() || undefined,
        token
      );

      toast.success(`Deliverable marked as ${isApproved ? "APPROVED" : "CHANGES REQUESTED"}`);
      setSelectedDeliverable(null);
      setDeliverableNotes("");

      // Refresh dossier
      const updatedDossier = await projectLifecycleApi.getProjectDossier(selectedProject.id, token);
      setDossier(updatedDossier);
    } catch (err: any) {
      toast.error(err.message || "Failed to review deliverable");
    } finally {
      setIsReviewingDeliverable(false);
    }
  };

  // Summary Metrics
  const totalProjects = projects.length;
  const inProgressProjects = projects.filter(
    (p) => p.stage === "LAB_PROTOTYPING" || p.stage === "FIELD_PILOT"
  ).length;
  const completedProjects = projects.filter(
    (p) => p.stage === "DEPLOYMENT_HANDOVER" || p.stage === "COMPLETED"
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-[#4a4a4a]">
      {/* ── TOP HEADER & SUMMARY CARDS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#d9d9d9] pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#F2efff] text-[#1a0e3d] text-xs font-black uppercase tracking-wider mb-1">
            <span>Statutory Lifecycle &amp; TRL Oversight</span>
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#1a0e3d] tracking-tight">
              {isDistrictScoped ? `${rawDistrict} District Project Lifecycles & Clearances` : "Statewide Project Lifecycles, Milestones & Clearances"}
            </h2>
            {isDistrictScoped && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-black bg-[#ececec] text-[#002110] border border-[#a3e635] whitespace-nowrap shrink-0 leading-none">
                {rawDistrict} Nodal Jurisdiction
              </span>
            )}
          </div>
          <p className="text-xs text-[#4a4a4a] mt-0.5">
            {isDistrictScoped
              ? `Real-time monitoring of university R&D milestones, laboratory benchmarks, and nodal clearances originating from ${rawDistrict} Collectorate.`
              : "Real-time monitoring of university R&D milestones, laboratory benchmarks, field testing outcomes, and digital nodal approvals across Jharkhand."}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-2 rounded-xl bg-white border border-[#d9d9d9] hover:border-[#1a0e3d] text-[#1a0e3d] font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#1a0e3d]" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 3 Executive Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#d9d9d9] shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[#4a4a4a] uppercase tracking-wider block">
            {isDistrictScoped ? `${rawDistrict} Active Projects` : "Total Active R&D Projects"}
          </span>
          <div className="text-3xl font-black text-[#1a0e3d] font-mono">
            {totalProjects}
          </div>
          <p className="text-[10px] text-[#64748b]">
            Under active university faculty supervision
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#d9d9d9] shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[#803800] uppercase tracking-wider block">
            Active Prototyping &amp; Field Trials
          </span>
          <div className="text-3xl font-black text-[#803800] font-mono">
            {inProgressProjects}
          </div>
          <p className="text-[10px] text-[#64748b]">
            In laboratory bench testing &amp; pilot testbeds
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#d9d9d9] shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[#002110] uppercase tracking-wider block">
            Field Deployed &amp; Handed Over
          </span>
          <div className="text-3xl font-black text-[#002110] font-mono">
            {completedProjects}
          </div>
          <p className="text-[10px] text-[#64748b]">
            Resolved challenges with field deployments
          </p>
        </div>
      </div>

      {/* ── FILTER & SEARCH BAR ── */}
      <div className="bg-white p-4 rounded-2xl border border-[#d9d9d9] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Search by project code, title, university, mentor..."
            className="w-full pl-10 pr-4 py-2 bg-[#f8fafc] border border-[#d9d9d9] rounded-xl text-xs text-[#1a0e3d] placeholder-[#64748b] outline-none focus:border-[#1a0e3d] focus:bg-white transition-all font-medium"
          />
        </div>

        {/* District Filter */}
        <select
          value={selectedDistrict}
          onChange={(e) => {
            setSelectedDistrict(e.target.value);
            setPage(0);
          }}
          disabled={isDistrictScoped}
          className={`px-3 py-2 bg-white border border-[#d9d9d9] rounded-xl text-xs font-bold text-[#1a0e3d] outline-none focus:border-[#1a0e3d] shadow-2xs ${isDistrictScoped ? "bg-[#f5f5f5] opacity-80 cursor-not-allowed" : "cursor-pointer"}`}
        >
          {isDistrictScoped ? (
            <option value={rawDistrict}>{rawDistrict} (Locked)</option>
          ) : (
            <>
              <option value="All 24 Districts">All 24 Districts</option>
              {ALL_JHARKHAND_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </>
          )}
        </select>

        {/* Domain Filter */}
        <select
          value={selectedDomain}
          onChange={(e) => {
            setSelectedDomain(e.target.value);
            setPage(0);
          }}
          className="px-3 py-2 bg-white border border-[#d9d9d9] rounded-xl text-xs font-bold text-[#1a0e3d] outline-none focus:border-[#1a0e3d] shadow-2xs"
        >
          <option value="ALL">All 10 Domains</option>
          {OFFICIAL_DOMAINS.map((dom) => (
            <option key={dom} value={dom}>{dom}</option>
          ))}
        </select>

        {/* Stage Filter */}
        <select
          value={selectedStage}
          onChange={(e) => {
            setSelectedStage(e.target.value);
            setPage(0);
          }}
          className="px-3 py-2 bg-white border border-[#d9d9d9] rounded-xl text-xs font-bold text-[#1a0e3d] outline-none focus:border-[#1a0e3d] shadow-2xs"
        >
          <option value="ALL">All Project Stages</option>
          <option value="TEAM_FORMATION">Team Formation</option>
          <option value="LAB_PROTOTYPING">Lab Prototyping</option>
          <option value="FIELD_PILOT">Field Pilot</option>
          <option value="DEPLOYMENT_HANDOVER">Deployment Handover</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* ── PROJECTS LISTING / TABLE ── */}
      {isLoading ? (
        <div className="p-12 text-center bg-white border border-[#d9d9d9] rounded-3xl space-y-3">
          <Loader2 className="w-8 h-8 text-[#1a0e3d] animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#1a0e3d]">Loading statewide projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center bg-white border border-dashed border-[#d9d9d9] rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#F2efff] text-[#1a0e3d] flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-extrabold text-[#1a0e3d]">No University Projects Found</h3>
          <p className="text-xs text-[#64748b] max-w-md mx-auto">
            No active university projects match your current filters. Projects will appear here as universities claim challenges and begin active R&amp;D.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#d9d9d9] rounded-3xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F2efff] border-b border-[#d9d9d9] text-[#1a0e3d] font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Project Code &amp; Title</th>
                  <th className="py-3 px-4">University &amp; Location</th>
                  <th className="py-3 px-4">Domain</th>
                  <th className="py-3 px-4">TRL &amp; Lifecycle Stage</th>
                  <th className="py-3 px-4">Progress %</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d9d9d9]/60 font-medium">
                {projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-[#F2efff]/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-[#1a0e3d] text-[11px] block">
                        {proj.projectCode || `JH-RND-${proj.id}`}
                      </span>
                      <div className="font-bold text-[#1a0e3d] text-xs mt-0.5 max-w-xs truncate">
                        {proj.title}
                      </div>
                      {proj.facultyMentor && (
                        <div className="text-[10px] text-[#64748b]">
                          Mentor: {proj.facultyMentor}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#1a0e3d]">{proj.universityName}</div>
                      <div className="text-[11px] text-[#64748b] font-mono">
                        {proj.district || "Jharkhand"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded bg-[#F2efff] text-[#1a0e3d] font-bold text-[10px] border border-[#dcd3ff]">
                        {proj.domain || "General R&D"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                        proj.stage === "COMPLETED" || proj.stage === "DEPLOYMENT_HANDOVER"
                          ? "bg-[#F2fcef] text-[#002110] border-[#a3e635]"
                          : proj.stage === "FIELD_PILOT"
                          ? "bg-[#FFF5ea] text-[#803800] border-[#fed7aa]"
                          : "bg-[#F2efff] text-[#1a0e3d] border-[#dcd3ff]"
                      }`}>
                        {proj.stage?.replace(/_/g, " ") || "IN PROGRESS"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="w-24">
                        <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                          <span className="text-[#1a0e3d]">{proj.progress || 20}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#e2e8f0] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#1a0e3d] rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, proj.progress || 20)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenDossier(proj)}
                        className="px-3 py-1.5 rounded-xl bg-[#1a0e3d] hover:bg-[#2e1764] text-white font-bold text-xs transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 ml-auto"
                      >
                        <span>Inspect 360° Dossier</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Bar */}
      <GovernmentPagination
        currentPage={page}
        totalPages={totalPages}
        pageSize={rowsPerPage}
        totalElements={totalElements}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newSize) => {
          setRowsPerPage(newSize);
          setPage(0);
        }}
        isLoading={isLoading}
      />

      {/* ─────────────────────────────────────────────────────────────
          MODAL / DRAWER: 360° PROJECT LIFECYCLE DOSSIER
      ───────────────────────────────────────────────────────────── */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="max-w-5xl w-full bg-white rounded-3xl border border-[#d9d9d9] shadow-2xl my-auto overflow-hidden flex flex-col max-h-[90vh]">
            {/* Dossier Header */}
            <div className="p-6 bg-[#1a0e3d] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-white font-mono">
                    {selectedProject.projectCode || `JH-RND-${selectedProject.id}`}
                  </span>
                  <span className="text-[10px] font-bold bg-[#a3e635] text-[#002110] px-2 py-0.5 rounded">
                    {selectedProject.stage?.replace(/_/g, " ")}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight">{selectedProject.title}</h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  {selectedProject.universityName} • {selectedProject.district || "Jharkhand"} • Domain: {selectedProject.domain || "General"}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowSignoffModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#a3e635] hover:bg-[#86efac] text-[#002110] font-black text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Grant Nodal Stage Approval</span>
                </button>

                <button
                  type="button"
                  onClick={handleCloseDossier}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer flex items-center justify-center"
                  aria-label="Close dossier"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Dossier Tabs Bar */}
            <div className="flex items-center gap-2 px-6 pt-4 bg-[#F2efff]/50 border-b border-[#d9d9d9] flex-shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setDossierTab("milestones")}
                className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                  dossierTab === "milestones"
                    ? "border-[#1a0e3d] text-[#1a0e3d]"
                    : "border-transparent text-[#64748b] hover:text-[#1a0e3d]"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Milestones &amp; Deliverables ({dossier?.milestones?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setDossierTab("testing")}
                className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                  dossierTab === "testing"
                    ? "border-[#1a0e3d] text-[#1a0e3d]"
                    : "border-transparent text-[#64748b] hover:text-[#1a0e3d]"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Testing Benchmarks &amp; TRL ({dossier?.testResults?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setDossierTab("signoff")}
                className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                  dossierTab === "signoff"
                    ? "border-[#1a0e3d] text-[#1a0e3d]"
                    : "border-transparent text-[#64748b] hover:text-[#1a0e3d]"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Stage Sign-offs &amp; Approvals ({dossier?.signoffs?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setDossierTab("ip")}
                className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                  dossierTab === "ip"
                    ? "border-[#1a0e3d] text-[#1a0e3d]"
                    : "border-transparent text-[#64748b] hover:text-[#1a0e3d]"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>IP &amp; Patents ({dossier?.ipRecords?.length || 0})</span>
              </button>
            </div>

            {/* Dossier Content Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {isLoadingDossier ? (
                <div className="p-12 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-[#1a0e3d] animate-spin mx-auto" />
                  <p className="text-xs font-bold text-[#1a0e3d]">Loading 360° lifecycle dossier...</p>
                </div>
              ) : !dossier ? (
                <div className="p-8 text-center text-xs text-[#64748b]">
                  Could not load dossier details.
                </div>
              ) : (
                <>
                  {/* TAB 1: MILESTONES & DELIVERABLES */}
                  {dossierTab === "milestones" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-extrabold text-[#1a0e3d] uppercase tracking-wider">
                            TRL 1-9 Milestone Roadmap &amp; Submitted Artifacts
                          </h3>
                          <p className="text-xs text-[#64748b]">
                            {dossier.approvedDeliverablesCount} of {dossier.totalDeliverablesCount} deliverables approved
                          </p>
                        </div>
                      </div>

                      {dossier.milestones.length === 0 ? (
                        <div className="p-8 text-center bg-[#f8fafc] border border-dashed border-[#d9d9d9] rounded-2xl text-xs text-[#64748b]">
                          No milestones recorded yet for this project.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {dossier.milestones.map((m, idx) => (
                            <div key={m.id || idx} className="p-4 bg-[#f8fafc] rounded-2xl border border-[#d9d9d9] space-y-3">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full bg-[#1a0e3d] text-white text-xs font-black flex items-center justify-center font-mono">
                                    {m.milestoneNumber || idx + 1}
                                  </span>
                                  <span className="font-bold text-xs text-[#1a0e3d]">{m.title}</span>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                  m.status === "APPROVED"
                                    ? "bg-[#F2fcef] text-[#002110] border-[#a3e635]"
                                    : m.status === "SUBMITTED_FOR_REVIEW"
                                    ? "bg-[#FFF5ea] text-[#803800] border-[#fed7aa]"
                                    : "bg-[#F2efff] text-[#1a0e3d] border-[#dcd3ff]"
                                }`}>
                                  {m.status?.replace(/_/g, " ") || "IN PROGRESS"}
                                </span>
                              </div>

                              {m.deliverableSummary && (
                                <p className="text-[11px] text-[#4a4a4a]">{m.deliverableSummary}</p>
                              )}

                              {/* Deliverables for this milestone */}
                              {m.deliverables && m.deliverables.length > 0 && (
                                <div className="space-y-2 pt-2 border-t border-[#e2e8f0]">
                                  <span className="text-[10px] font-bold text-[#64748b] uppercase">Submitted Artifacts</span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {m.deliverables.map((deliv) => (
                                      <div key={deliv.id} className="p-3 bg-white rounded-xl border border-[#d9d9d9] space-y-2">
                                        <div className="flex items-center justify-between gap-2">
                                          <span className="font-bold text-xs text-[#1a0e3d] truncate">{deliv.title}</span>
                                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                            deliv.isApproved
                                              ? "bg-[#F2fcef] text-[#002110]"
                                              : "bg-[#FFF5ea] text-[#803800]"
                                          }`}>
                                            {deliv.isApproved ? "APPROVED" : "PENDING REVIEW"}
                                          </span>
                                        </div>

                                        <div className="flex items-center justify-between pt-1 text-[10px]">
                                          {deliv.fileUrl ? (
                                            <a
                                              href={deliv.fileUrl}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="text-[#1a0e3d] hover:underline font-bold flex items-center gap-1"
                                            >
                                              <Download className="w-3 h-3" />
                                              <span>View Artifact</span>
                                            </a>
                                          ) : (
                                            <span className="text-[#64748b]">No file link</span>
                                          )}

                                          <div className="flex items-center gap-1">
                                            {!deliv.isApproved && (
                                              <button
                                                type="button"
                                                onClick={() => handleReviewDeliverable(deliv.id, true)}
                                                className="px-2 py-0.5 bg-[#F2fcef] text-[#002110] border border-[#a3e635] rounded text-[10px] font-bold hover:bg-[#dcfce7] cursor-pointer"
                                              >
                                                Approve
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: TESTING OUTCOMES & TRL */}
                  {dossierTab === "testing" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-extrabold text-[#1a0e3d] uppercase tracking-wider">
                            Verified Laboratory Benchmarks &amp; Field Trials
                          </h3>
                          <p className="text-xs text-[#64748b]">
                            Highest Verified Rating: <strong>TRL {dossier.highestTrl}</strong> ({TRL_DESCRIPTIONS[dossier.highestTrl]?.title || "Research"})
                          </p>
                        </div>
                        <span className="text-xs font-bold font-mono px-3 py-1 rounded-xl bg-[#F2efff] text-[#1a0e3d] border border-[#dcd3ff]">
                          TRL Level {dossier.highestTrl} / 9
                        </span>
                      </div>

                      {dossier.testResults.length === 0 ? (
                        <div className="p-8 text-center bg-[#f8fafc] border border-dashed border-[#d9d9d9] rounded-2xl text-xs text-[#64748b]">
                          No test benchmarks or trial logs recorded yet for this project.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {dossier.testResults.map((t) => (
                            <div key={t.id} className="p-4 bg-white rounded-2xl border border-[#d9d9d9] space-y-2 shadow-2xs">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs text-[#1a0e3d]">{t.testTitle}</span>
                                  <span className="text-[10px] font-mono font-bold bg-[#F2efff] text-[#1a0e3d] px-2 py-0.5 rounded">
                                    TRL {t.trlLevel}
                                  </span>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                  t.passStatus === "PASSED"
                                    ? "bg-[#F2fcef] text-[#002110] border-[#a3e635]"
                                    : "bg-[#FFF8f8] text-[#3a0907] border-[#fecaca]"
                                }`}>
                                  {t.passStatus}
                                </span>
                              </div>

                              {t.observations && (
                                <p className="text-[11px] text-[#4a4a4a]">{t.observations}</p>
                              )}

                              <div className="text-[10px] text-[#64748b] flex items-center justify-between pt-1 border-t border-[#f1f5f9]">
                                <span>Type: {t.testType?.replace(/_/g, " ")}</span>
                                {t.evidenceAttachmentUrl && (
                                  <a href={t.evidenceAttachmentUrl} target="_blank" rel="noreferrer" className="text-[#1a0e3d] font-bold hover:underline">
                                    Test Evidence Document →
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: STAGE SIGN-OFFS & DUAL CLOSED-LOOP */}
                  {dossierTab === "signoff" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-extrabold text-[#1a0e3d] uppercase tracking-wider">
                            Multi-Stakeholder Digital Approval Sign-Offs
                          </h3>
                          <p className="text-xs text-[#64748b]">
                            Dual Closed-Loop Status: {dossier.closedLoopStatus?.isFullyClosedAndResolved ? "FULLY RESOLVED" : "PENDING CLEARANCES"}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowSignoffModal(true)}
                          className="px-3 py-1.5 rounded-xl bg-[#1a0e3d] text-white font-bold text-xs hover:bg-[#2e1764] transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Record Sign-Off</span>
                        </button>
                      </div>

                      {dossier.signoffs.length === 0 ? (
                        <div className="p-8 text-center bg-[#f8fafc] border border-dashed border-[#d9d9d9] rounded-2xl text-xs text-[#64748b]">
                          No digital sign-off records registered yet.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {dossier.signoffs.map((s) => (
                            <div key={s.id} className="p-4 bg-white rounded-2xl border border-[#d9d9d9] space-y-2 shadow-2xs">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs text-[#1a0e3d]">
                                    {s.approverRole?.replace(/_/g, " ")} • Stage: {s.stage}
                                  </span>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                  s.approvalStatus === "APPROVED"
                                    ? "bg-[#F2fcef] text-[#002110] border-[#a3e635]"
                                    : "bg-[#FFF8f8] text-[#3a0907] border-[#fecaca]"
                                }`}>
                                  {s.approvalStatus}
                                </span>
                              </div>

                              {s.remarks && (
                                <p className="text-[11px] text-[#4a4a4a]">"{s.remarks}"</p>
                              )}

                              <div className="text-[10px] text-[#64748b] flex items-center justify-between pt-1 border-t border-[#f1f5f9]">
                                <span>Signer: <strong>{s.approverName || "Authorized Signer"}</strong></span>
                                <span>Date: {s.signedAt ? new Date(s.signedAt).toLocaleDateString() : "Recent"}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: IP & PATENTS */}
                  {dossierTab === "ip" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-extrabold text-[#1a0e3d] uppercase tracking-wider">
                            Intellectual Property &amp; Patent Disclosures
                          </h3>
                          <p className="text-xs text-[#64748b]">
                            Registered disclosures filed with Indian Patent Office (IPO Kolkata)
                          </p>
                        </div>
                      </div>

                      {dossier.ipRecords.length === 0 ? (
                        <div className="p-8 text-center bg-[#f8fafc] border border-dashed border-[#d9d9d9] rounded-2xl text-xs text-[#64748b]">
                          No intellectual property disclosures recorded yet for this project.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {dossier.ipRecords.map((ip) => (
                            <div key={ip.id} className="p-4 bg-white rounded-2xl border border-[#d9d9d9] space-y-2 shadow-2xs">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-xs text-[#1a0e3d]">{ip.title}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F2fcef] text-[#002110] border border-[#a3e635]">
                                  {ip.status}
                                </span>
                              </div>

                              {ip.abstractDescription && (
                                <p className="text-[11px] text-[#4a4a4a]">{ip.abstractDescription}</p>
                              )}

                              <div className="text-[10px] text-[#64748b] flex items-center justify-between pt-1 border-t border-[#f1f5f9]">
                                <span>App No: <strong>{ip.patentApplicationNumber || "Pending Number"}</strong></span>
                                <span>Type: {ip.ipType}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: GRANT GOVERNMENT NODAL STAGE APPROVAL
      ───────────────────────────────────────────────────────────── */}
      {showSignoffModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 border border-[#d9d9d9] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#d9d9d9] pb-3">
              <h3 className="text-base font-black text-[#1a0e3d]">Grant Nodal Stage Approval</h3>
              <button
                type="button"
                onClick={() => setShowSignoffModal(false)}
                className="text-[#64748b] hover:text-[#1a0e3d] p-1 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitNodalSignoff} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#1a0e3d] block">Project Milestone Stage</label>
                <select
                  value={signoffStage}
                  onChange={(e) => setSignoffStage(e.target.value as ApprovalStage)}
                  className="w-full p-2.5 bg-[#f8fafc] border border-[#d9d9d9] rounded-xl font-bold text-[#1a0e3d] outline-none"
                >
                  <option value="PROPOSAL">Proposal Stage Clearance</option>
                  <option value="PROTOTYPE">Prototype Bench Approval</option>
                  <option value="FIELD_PILOT">Field Pilot District Deployment</option>
                  <option value="DEPLOYMENT_HANDOVER">Municipal / Community Handover</option>
                  <option value="FINAL_RESOLUTION">Final Resolution (Closed-Loop)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1a0e3d] block">Approval Decision</label>
                <select
                  value={signoffStatus}
                  onChange={(e) => setSignoffStatus(e.target.value as ApprovalStatus)}
                  className="w-full p-2.5 bg-[#f8fafc] border border-[#d9d9d9] rounded-xl font-bold text-[#1a0e3d] outline-none"
                >
                  <option value="APPROVED">APPROVED (Grant Clearance)</option>
                  <option value="CHANGES_REQUESTED">CHANGES REQUESTED (Require Lab Changes)</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1a0e3d] block">Official Nodal Remarks / Statutory Clearance Notes</label>
                <textarea
                  rows={3}
                  value={signoffRemarks}
                  onChange={(e) => setSignoffRemarks(e.target.value)}
                  placeholder="Enter official government approval remarks, conditions, or testbed instructions..."
                  className="w-full p-2.5 bg-[#f8fafc] border border-[#d9d9d9] rounded-xl text-[#1a0e3d] outline-none resize-none font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1a0e3d] block">Clearance Certificate Document URL (Optional)</label>
                <input
                  type="url"
                  value={closureCertUrl}
                  onChange={(e) => setClosureCertUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-[#f8fafc] border border-[#d9d9d9] rounded-xl text-[#1a0e3d] outline-none font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#d9d9d9]">
                <button
                  type="button"
                  onClick={() => setShowSignoffModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#d9d9d9] text-[#64748b] hover:text-[#1a0e3d] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSignoff}
                  className="px-4 py-2 rounded-xl bg-[#1a0e3d] text-white font-bold hover:bg-[#2e1764] transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmittingSignoff && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Sign &amp; Issue Clearance</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
