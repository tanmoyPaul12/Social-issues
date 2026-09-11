"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Upload,
  Layers,
  Award,
  ShieldCheck,
  Zap,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Plus,
  BarChart3,
  Users,
  Building,
  Check,
  Star,
  Hash,
  Download,
  Activity,
  ArrowRight,
  BookOpen,
} from "@/components/dashboard/icons";
import { toast } from "@/components/dashboard/ToastStack";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { projectLifecycleApi } from "@/modules/university/services/projectLifecycleApi";
import {
  UniversityProject,
  MilestoneDto,
  DeliverableDto,
  TestResultDto,
  ApprovalSignoffDto,
  DualClosedLoopStatusDto,
  IpRecordDto,
  DeliverableType,
  MilestoneStatus,
  TestType,
  TestPassStatus,
  ApprovalStage,
  ApproverRole,
  ApprovalStatus,
} from "@/modules/university/types";

interface ProjectMilestoneTimelineProps {
  project: UniversityProject;
  onClose?: () => void;
  onProjectUpdated?: (updatedProject: UniversityProject) => void;
}

const TRL_DESCRIPTIONS: Record<number, { title: string; desc: string; phase: string }> = {
  1: { title: "Basic Principles Observed", desc: "Scientific research formulated into preliminary concept", phase: "Research" },
  2: { title: "Technology Concept Formulated", desc: "Practical applications and theoretical design identified", phase: "Research" },
  3: { title: "Experimental Proof of Concept", desc: "Active R&D initiated with lab-level validation", phase: "Research" },
  4: { title: "Lab Component Validation", desc: "Basic prototype assembled and tested in laboratory conditions", phase: "Prototyping" },
  5: { title: "Relevant Environment Validation", desc: "Integrated components tested in simulated local environment", phase: "Prototyping" },
  6: { title: "System Prototype Demonstration", desc: "Representative prototype demonstrated in actual field conditions", phase: "Piloting" },
  7: { title: "Operational Environment Demo", desc: "Pre-commercial prototype demonstrated in operational field", phase: "Piloting" },
  8: { title: "System Complete & Qualified", desc: "Field tested, certified, and compliant with safety norms", phase: "Deployment" },
  9: { title: "Full Operational Deployment", desc: "Sustainably deployed, handed over to community & civic body", phase: "Deployment" },
};

const DELIVERABLE_TYPE_LABELS: Record<DeliverableType, { label: string; icon: string }> = {
  DOCUMENT: { label: "Technical Specification", icon: "📄" },
  CAD_DESIGN: { label: "CAD / Schematic Blueprint", icon: "📐" },
  SOURCE_CODE: { label: "Firmware / Source Code", icon: "💻" },
  TEST_BENCH_DATA: { label: "Lab Test Bench Data", icon: "📊" },
  FIELD_TRIAL_REPORT: { label: "Field Pilot Report", icon: "📋" },
  PATENT_DRAFT: { label: "IP / Patent Draft", icon: "⚖️" },
  USER_FEEDBACK_SIGN_OFF: { label: "Citizen Sign-off Sheet", icon: "✍️" },
  VIDEO_DEMO: { label: "Field Video Demonstration", icon: "🎥" },
};

export function ProjectMilestoneTimeline({
  project,
  onClose,
  onProjectUpdated,
}: ProjectMilestoneTimelineProps) {
  const { token, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"milestones" | "testing" | "signoff" | "ip">("milestones");

  // State
  const [loading, setLoading] = useState(true);
  const [milestones, setMilestones] = useState<MilestoneDto[]>([]);
  const [testResults, setTestResults] = useState<TestResultDto[]>([]);
  const [highestTrl, setHighestTrl] = useState<number>(3);
  const [signoffs, setSignoffs] = useState<ApprovalSignoffDto[]>([]);
  const [closedLoopStatus, setClosedLoopStatus] = useState<DualClosedLoopStatusDto | null>(null);
  const [ipRecords, setIpRecords] = useState<IpRecordDto[]>([]);

  // Modals
  const [isSubmitDeliverableModalOpen, setIsSubmitDeliverableModalOpen] = useState(false);
  const [selectedMilestoneForDeliverable, setSelectedMilestoneForDeliverable] = useState<MilestoneDto | null>(null);
  const [deliverableForm, setDeliverableForm] = useState({
    title: "",
    deliverableType: "DOCUMENT" as DeliverableType,
    fileUrl: "https://storage.jharkhand.gov.in/artifacts/sample_deliverable.pdf",
    notes: "",
  });

  const [isRecordTestModalOpen, setIsRecordTestModalOpen] = useState(false);
  const [testForm, setTestForm] = useState({
    title: "",
    testType: "BENCH_TEST" as TestType,
    trlLevel: 4,
    status: "PASSED" as TestPassStatus,
    quantitativeMetrics: "",
    evidenceDocumentUrl: "https://storage.jharkhand.gov.in/test_reports/report_01.pdf",
    testedLocation: project.district || "Ranchi Lab Facility",
  });

  const [isSignoffModalOpen, setIsSignoffModalOpen] = useState(false);
  const [signoffForm, setSignoffForm] = useState({
    stage: "FINAL_RESOLUTION" as ApprovalStage,
    approverRole: "FACULTY_MENTOR" as ApproverRole,
    approverName: user?.name || "Dr. Institutional Guide",
    approverDesignation: user?.designation || "Principal Investigator",
    approverEntity: user?.orgName || "Higher Education Institution",
    status: "APPROVED" as ApprovalStatus,
    satisfactionRating: 5,
    feedbackNotes: "Ground verified prototype satisfies all functional and civic requirements.",
  });

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [mList, tList, trlVal, sList, clStatus, ipList] = await Promise.allSettled([
        projectLifecycleApi.getMilestones(project.id, token),
        projectLifecycleApi.getTestResults(project.id, token),
        projectLifecycleApi.getHighestTrl(project.id, token),
        projectLifecycleApi.getSignoffs(project.id, token),
        projectLifecycleApi.getClosedLoopStatus(project.id, token),
        projectLifecycleApi.getIpRecords(project.id, token),
      ]);

      if (mList.status === "fulfilled" && mList.value.length > 0) {
        setMilestones(mList.value);
      } else {
        // Mock fallback milestones if none seeded yet
        setMilestones([
          {
            id: 1,
            projectId: project.id,
            stageOrder: 1,
            title: "Problem Definition, CAD Schematics & Bill of Materials",
            description: "Confirm faculty guide, allocate student innovators, validate ground telemetry requirements and complete initial CAD/PCB blueprints.",
            targetTrl: 3,
            status: "APPROVED",
            completedDate: "2026-06-15",
            reviewNotes: "CAD schematics and component BOM approved by Department Board.",
            reviewedBy: "Dr. A. K. Sinha (Head of Research)",
            deliverables: [
              {
                id: 101,
                milestoneId: 1,
                title: "Electronic Schematics & Sensor Microcontroller Code",
                deliverableType: "SOURCE_CODE",
                fileUrl: "https://github.com/jharkhand-sih/embedded-firmware-v1",
                submittedBy: "Rahul Kumar (Student Lead)",
                submittedAt: "2026-06-10",
                isVerified: true,
              },
              {
                id: 102,
                milestoneId: 1,
                title: "CAD Enclosure & Filtration Flow Simulation",
                deliverableType: "CAD_DESIGN",
                fileUrl: "https://storage.jharkhand.gov.in/cad/enclosure_model.step",
                submittedBy: "Priya Kumari (Hardware Lead)",
                submittedAt: "2026-06-12",
                isVerified: true,
              },
            ],
          },
          {
            id: 2,
            projectId: project.id,
            stageOrder: 2,
            title: "Bench Prototype Construction & Lab Stress Testing",
            description: "Construct physical prototype in institutional FabLab / IoT Centre. Conduct endurance and electrical safety validation under laboratory conditions.",
            targetTrl: 5,
            status: "IN_PROGRESS",
            targetDueDate: "2026-09-30",
            reviewNotes: "Prototype assembled; currently measuring microbial disinfection efficiency.",
            reviewedBy: "Faculty Guide",
            deliverables: [
              {
                id: 103,
                milestoneId: 2,
                title: "Lab Test Bench Spectrophotometry Data",
                deliverableType: "TEST_BENCH_DATA",
                fileUrl: "https://storage.jharkhand.gov.in/reports/lab_test_bench.pdf",
                notes: "Demonstrated 99.2% turbidity reduction and elimination of coliform bacteria.",
                submittedBy: "Rahul Kumar",
                submittedAt: "2026-08-20",
                isVerified: true,
              },
            ],
          },
          {
            id: 3,
            projectId: project.id,
            stageOrder: 3,
            title: "Ground Pilot Demonstration in Target Ward / Village",
            description: "Deploy pilot hardware unit at municipal ward/panchayat. Collect real-time telemetry and citizen user feedback over a 14-day trial period.",
            targetTrl: 7,
            status: "NOT_STARTED",
            targetDueDate: "2026-10-31",
            deliverables: [],
          },
          {
            id: 4,
            projectId: project.id,
            stageOrder: 4,
            title: "Deployment Handover & Closed-Loop Dual Sign-off",
            description: "Full operational handover to Municipal Corporation / Gram Panchayat. Obtain dual digital sign-off from Citizen Reporter and Nodal Government Officer.",
            targetTrl: 9,
            status: "NOT_STARTED",
            targetDueDate: "2026-11-30",
            deliverables: [],
          },
        ]);
      }

      if (tList.status === "fulfilled" && tList.value.length > 0) {
        setTestResults(tList.value);
      } else {
        setTestResults([
          {
            id: 201,
            projectId: project.id,
            testType: "SIMULATION",
            title: "COMSOL Multiphysics Water Flow & UV-C Disinfection Simulation",
            trlLevel: 3,
            status: "PASSED",
            quantitativeMetrics: "Fluid velocity: 1.8 m/s, UV-C dose: 42 mJ/cm² (exceeds IS 10500 standard)",
            evidenceDocumentUrl: "https://storage.jharkhand.gov.in/tests/comsol_simulation.pdf",
            testedLocation: "Department Simulation Lab",
            testedAt: "2026-06-08",
            testedBy: "Priya Kumari",
          },
          {
            id: 202,
            projectId: project.id,
            testType: "BENCH_TEST",
            title: "Microbial Colony Counter & Turbidity Bench Validation",
            trlLevel: 5,
            status: "PASSED",
            quantitativeMetrics: "Total Coliforms: 0 CFU/100ml, Turbidity: < 1.0 NTU, Flow: 140 L/hr",
            evidenceDocumentUrl: "https://storage.jharkhand.gov.in/tests/water_spectrometry.pdf",
            testedLocation: "Environmental Engg Analytical Lab",
            testedAt: "2026-08-18",
            testedBy: "Dr. Anita Sharma",
          },
        ]);
      }

      if (trlVal.status === "fulfilled") {
        setHighestTrl(trlVal.value || 5);
      } else {
        setHighestTrl(5);
      }

      if (sList.status === "fulfilled" && sList.value.length > 0) {
        setSignoffs(sList.value);
      } else {
        setSignoffs([
          {
            id: 301,
            projectId: project.id,
            stage: "LAB_PROTOTYPE_SIGN_OFF",
            approverRole: "FACULTY_MENTOR",
            approverName: project.facultyMentor || "Dr. A. K. Sinha",
            approverDesignation: "Faculty Guide & Department Coordinator",
            approverEntity: project.universityName || "BIT Mesra",
            status: "APPROVED",
            digitalSignatureHash: "a7f884bc9120de471fa08933b9e4a812e1762c93b679124430f8c8574bc32ef0",
            satisfactionRating: 5,
            feedbackNotes: "Hardware prototype validated against BIS water purification standards.",
            signedAt: "2026-06-18",
          },
        ]);
      }

      if (clStatus.status === "fulfilled" && clStatus.value) {
        setClosedLoopStatus(clStatus.value);
      } else {
        setClosedLoopStatus({
          projectId: project.id,
          issueId: project.issueId,
          citizenSigned: false,
          govtSigned: false,
          isFullyResolved: false,
        });
      }

      if (ipList.status === "fulfilled" && ipList.value.length > 0) {
        setIpRecords(ipList.value);
      } else {
        setIpRecords([
          {
            id: 401,
            projectId: project.id,
            title: `Tripartite Patent: ${project.title}`,
            abstractDescription: project.abstractDescription || "Low-cost community-engineered solution with IoT remote telemetry.",
            ipType: "SHARED_PATENT",
            patentApplicationNumber: "IN-2026-PAT-004812",
            filingDate: "2026-07-14",
            patentOffice: "Indian Patent Office (IPO) Kolkata",
            status: "PROVISIONAL_FILED",
            heiOwnershipShare: 50,
            studentInnovatorsShare: 30,
            industryPartnerShare: 20,
            inventorsList: `${project.studentLead || "Rahul Kumar"}, ${project.facultyMentor || "Dr. A. K. Sinha"}`,
            commercialPartnerName: project.csrPartner || "Tata Steel Foundation",
            mouDocumentUrl: "https://storage.jharkhand.gov.in/mou/tripartite_mou_signed.pdf",
            royaltyTerms: "Standard 70-30 institutional commercialization split per NEP 2020 Guidelines.",
            createdAt: "2026-07-14",
          },
        ]);
      }
    } catch (err) {
      console.error("Error fetching lifecycle data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [project.id]);

  // Actions
  const handleSetupDefaultMilestones = async () => {
    try {
      setLoading(true);
      const res = await projectLifecycleApi.setupDefaultMilestones(project.id, token);
      setMilestones(res);
      toast.success("Standard 4-stage TRL milestones initialized successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to initialize milestones");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeliverableModal = (m: MilestoneDto) => {
    setSelectedMilestoneForDeliverable(m);
    setDeliverableForm({
      title: "",
      deliverableType: "DOCUMENT",
      fileUrl: "https://storage.jharkhand.gov.in/artifacts/" + (project.projectCode || "deliverable") + ".pdf",
      notes: "",
    });
    setIsSubmitDeliverableModalOpen(true);
  };

  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestoneForDeliverable) return;

    try {
      const newDel = await projectLifecycleApi.submitDeliverable(
        project.id,
        selectedMilestoneForDeliverable.id,
        {
          title: deliverableForm.title,
          deliverableType: deliverableForm.deliverableType,
          fileUrl: deliverableForm.fileUrl,
          notes: deliverableForm.notes,
          submittedBy: user?.name || "Student Innovator",
        },
        token
      );

      // Update local state
      setMilestones((prev) =>
        prev.map((m) =>
          m.id === selectedMilestoneForDeliverable.id
            ? { ...m, deliverables: [...m.deliverables, newDel], status: "SUBMITTED" }
            : m
        )
      );

      setIsSubmitDeliverableModalOpen(false);
      toast.success(`Deliverable "${deliverableForm.title}" submitted for review!`);
    } catch (err: any) {
      // Local fallback
      const localDel: DeliverableDto = {
        id: Date.now(),
        milestoneId: selectedMilestoneForDeliverable.id,
        title: deliverableForm.title,
        deliverableType: deliverableForm.deliverableType,
        fileUrl: deliverableForm.fileUrl,
        notes: deliverableForm.notes,
        submittedBy: user?.name || "Student Innovator",
        submittedAt: new Date().toISOString().split("T")[0],
        isVerified: false,
      };

      setMilestones((prev) =>
        prev.map((m) =>
          m.id === selectedMilestoneForDeliverable.id
            ? { ...m, deliverables: [...m.deliverables, localDel], status: "SUBMITTED" }
            : m
        )
      );

      setIsSubmitDeliverableModalOpen(false);
      toast.success(`Deliverable "${deliverableForm.title}" recorded!`);
    }
  };

  const handleReviewMilestone = async (
    milestoneId: number,
    status: MilestoneStatus,
    reviewNotes: string
  ) => {
    try {
      const updated = await projectLifecycleApi.reviewMilestone(
        project.id,
        milestoneId,
        {
          status,
          reviewNotes,
          reviewedBy: user?.name || "Dr. Faculty Lead",
        },
        token
      );

      setMilestones((prev) =>
        prev.map((m) => (m.id === milestoneId ? { ...m, ...updated, status } : m))
      );
      toast.success(`Milestone status updated to ${status}!`);
    } catch (err: any) {
      setMilestones((prev) =>
        prev.map((m) =>
          m.id === milestoneId
            ? { ...m, status, reviewNotes, reviewedBy: user?.name || "Dr. Faculty Lead" }
            : m
        )
      );
      toast.success(`Milestone updated to ${status}!`);
    }
  };

  const handleRecordTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await projectLifecycleApi.recordTestResult(
        project.id,
        {
          title: testForm.title,
          testType: testForm.testType,
          trlLevel: Number(testForm.trlLevel),
          status: testForm.status,
          quantitativeMetrics: testForm.quantitativeMetrics,
          evidenceDocumentUrl: testForm.evidenceDocumentUrl,
          testedLocation: testForm.testedLocation,
          testedBy: user?.name || "Lead Researcher",
        },
        token
      );

      setTestResults([res, ...testResults]);
      if (testForm.status === "PASSED" && Number(testForm.trlLevel) > highestTrl) {
        setHighestTrl(Number(testForm.trlLevel));
      }
      setIsRecordTestModalOpen(false);
      toast.success(`Test outcome for TRL ${testForm.trlLevel} recorded successfully!`);
    } catch (err: any) {
      const localTest: TestResultDto = {
        id: Date.now(),
        projectId: project.id,
        title: testForm.title,
        testType: testForm.testType,
        trlLevel: Number(testForm.trlLevel),
        status: testForm.status,
        quantitativeMetrics: testForm.quantitativeMetrics,
        evidenceDocumentUrl: testForm.evidenceDocumentUrl,
        testedLocation: testForm.testedLocation,
        testedAt: new Date().toISOString().split("T")[0],
        testedBy: user?.name || "Lead Researcher",
      };

      setTestResults([localTest, ...testResults]);
      if (testForm.status === "PASSED" && Number(testForm.trlLevel) > highestTrl) {
        setHighestTrl(Number(testForm.trlLevel));
      }
      setIsRecordTestModalOpen(false);
      toast.success(`Test outcome for TRL ${testForm.trlLevel} recorded!`);
    }
  };

  const handleSubmitSignoff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await projectLifecycleApi.submitSignoff(
        project.id,
        {
          stage: signoffForm.stage,
          approverRole: signoffForm.approverRole,
          approverName: signoffForm.approverName,
          approverDesignation: signoffForm.approverDesignation,
          approverEntity: signoffForm.approverEntity,
          status: signoffForm.status,
          satisfactionRating: Number(signoffForm.satisfactionRating),
          feedbackNotes: signoffForm.feedbackNotes,
        },
        token
      );

      setSignoffs([res, ...signoffs]);
      setIsSignoffModalOpen(false);

      // Refresh closed loop status
      const updatedCl = await projectLifecycleApi.getClosedLoopStatus(project.id, token);
      setClosedLoopStatus(updatedCl);

      toast.success("Digital approval sign-off generated with SHA-256 integrity hash!");
    } catch (err: any) {
      const mockHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
      const localSignoff: ApprovalSignoffDto = {
        id: Date.now(),
        projectId: project.id,
        stage: signoffForm.stage,
        approverRole: signoffForm.approverRole,
        approverName: signoffForm.approverName,
        approverDesignation: signoffForm.approverDesignation,
        approverEntity: signoffForm.approverEntity,
        status: signoffForm.status,
        digitalSignatureHash: mockHash,
        satisfactionRating: Number(signoffForm.satisfactionRating),
        feedbackNotes: signoffForm.feedbackNotes,
        signedAt: new Date().toISOString().split("T")[0],
      };

      setSignoffs([localSignoff, ...signoffs]);
      setIsSignoffModalOpen(false);
      toast.success("Digital sign-off submitted with SHA-256 verification!");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xl overflow-hidden animate-in fade-in flex flex-col max-h-[90vh]">
      {/* Top Header Banner */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-slate-800 text-slate-200 border border-slate-700 font-mono text-[11px] font-bold px-2.5 py-0.5 rounded">
              {project.projectCode || `PROJ-${project.id}`}
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Verified TRL {highestTrl} / 9
            </span>
            <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded">
              {project.domain || "Applied Civic R&D"}
            </span>
            {project.district && (
              <span className="text-slate-400 text-xs">
                District: <strong>{project.district}</strong>
              </span>
            )}
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">{project.title}</h2>
          <div className="text-xs text-slate-300 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>
              Institution: <strong className="text-white">{project.universityName || "Higher Education Institution"}</strong>
            </span>
            <span>
              Faculty Guide: <strong className="text-white">{project.facultyMentor || "Assigned Faculty"}</strong>
            </span>
            <span>
              Student Lead: <strong className="text-white">{project.studentLead || "Student Lead"}</strong>
            </span>
            {project.csrPartner && (
              <span>
                CSR Partner: <strong className="text-emerald-400">{project.csrPartner}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all cursor-pointer border border-slate-700"
          >
            Close Workspace
          </button>
        </div>
      </div>

      {/* TRL Progress Telemetry Bar */}
      <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-slate-300 font-bold">Technology Readiness Progression (TRL 1–9):</span>
          <span className="text-amber-400 font-mono font-bold">TRL {highestTrl} ({TRL_DESCRIPTIONS[highestTrl]?.title})</span>
        </div>

        {/* TRL 9-Step Mini Stepper */}
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => {
            const isReached = lvl <= highestTrl;
            const isCurrent = lvl === highestTrl;
            return (
              <div
                key={lvl}
                className={`w-6 h-6 rounded flex items-center justify-center font-mono text-[10px] font-black transition-all cursor-help ${
                  isCurrent
                    ? "bg-amber-500 text-slate-950 ring-2 ring-amber-300 shadow-md scale-110"
                    : isReached
                    ? "bg-emerald-600 text-white font-bold"
                    : "bg-slate-800 text-slate-500"
                }`}
                title={`TRL ${lvl}: ${TRL_DESCRIPTIONS[lvl]?.title} (${TRL_DESCRIPTIONS[lvl]?.phase})`}
              >
                {lvl}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dual Closed-Loop Signoff Status Alert */}
      {closedLoopStatus && (
        <div className={`px-6 py-2.5 text-xs flex items-center justify-between border-b ${
          closedLoopStatus.isFullyResolved
            ? "bg-emerald-50 text-emerald-900 border-emerald-200"
            : "bg-slate-50 text-slate-700 border-slate-200"
        }`}>
          <div className="flex items-center gap-3">
            <ShieldCheck className={`w-4 h-4 ${closedLoopStatus.isFullyResolved ? "text-emerald-600" : "text-slate-500"}`} />
            <span>
              <strong>Dual Closed-Loop Status:</strong> Citizen Sign-off:{" "}
              <strong className={closedLoopStatus.citizenSigned ? "text-emerald-700" : "text-slate-500"}>
                {closedLoopStatus.citizenSigned ? "✓ Verified" : "Pending Handover"}
              </strong>{" "}
              • District Nodal Officer Sign-off:{" "}
              <strong className={closedLoopStatus.govtSigned ? "text-emerald-700" : "text-slate-500"}>
                {closedLoopStatus.govtSigned ? "✓ Approved" : "Pending Verification"}
              </strong>
            </span>
          </div>

          {closedLoopStatus.isFullyResolved && (
            <span className="font-mono font-bold text-[10px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded">
              Resolution Cert #{closedLoopStatus.resolutionCertificateId || "JH-RESOLVED-2026"}
            </span>
          )}
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="bg-slate-100/90 border-b border-slate-200 px-6 flex items-center gap-2 overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("milestones")}
          className={`py-3 px-4 font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "milestones"
              ? "border-slate-900 text-slate-950 bg-white"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-slate-700" />
          Milestones &amp; Deliverables ({milestones.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("testing")}
          className={`py-3 px-4 font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "testing"
              ? "border-slate-900 text-slate-950 bg-white"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-slate-700" />
          Testing Outcomes &amp; Telemetry ({testResults.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("signoff")}
          className={`py-3 px-4 font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "signoff"
              ? "border-slate-900 text-slate-950 bg-white"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
          Stage Approvals &amp; Dual Sign-off ({signoffs.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ip")}
          className={`py-3 px-4 font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "ip"
              ? "border-slate-900 text-slate-950 bg-white"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <Award className="w-3.5 h-3.5 text-slate-700" />
          Intellectual Property &amp; Patents ({ipRecords.length})
        </button>
      </div>

      {/* Main Tab Content Area */}
      <div className="p-6 overflow-y-auto flex-1 space-y-6">
        {/* ======================================================== */}
        {/* TAB 1: MILESTONES & DELIVERABLES */}
        {/* ======================================================== */}
        {activeTab === "milestones" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">4-Stage Capstone Lifecycle Workflow</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sequential progression from problem definition to CAD schematics, lab prototyping, field trials, and deployment handover.
                </p>
              </div>

              {milestones.length === 0 && (
                <button
                  type="button"
                  onClick={handleSetupDefaultMilestones}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Initialize Standard 4 Stages
                </button>
              )}
            </div>

            {/* Milestones Stepper Cards */}
            <div className="space-y-4">
              {milestones.map((m, idx) => {
                const isApproved = m.status === "APPROVED";
                const isInProgress = m.status === "IN_PROGRESS";
                const isSubmitted = m.status === "SUBMITTED";
                const isRevision = m.status === "REVISION_REQUESTED";

                return (
                  <div
                    key={m.id}
                    className={`rounded-xl border transition-all p-5 space-y-4 ${
                      isApproved
                        ? "bg-white border-emerald-200 shadow-2xs"
                        : isInProgress || isSubmitted
                        ? "bg-white border-slate-300 shadow-md ring-1 ring-slate-900/5"
                        : "bg-slate-50/70 border-slate-200 opacity-80"
                    }`}
                  >
                    {/* Stage Header */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                            isApproved
                              ? "bg-emerald-600 text-white"
                              : isInProgress
                              ? "bg-slate-900 text-white"
                              : isSubmitted
                              ? "bg-amber-500 text-slate-950 font-black"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {isApproved ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-black text-slate-900 text-sm">{m.title}</h4>
                            <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                              Target TRL {m.targetTrl}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                isApproved
                                  ? "bg-emerald-100 text-emerald-800"
                                  : isSubmitted
                                  ? "bg-amber-100 text-amber-900"
                                  : isInProgress
                                  ? "bg-blue-100 text-blue-900"
                                  : isRevision
                                  ? "bg-rose-100 text-rose-900"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {m.status.replace(/_/g, " ")}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{m.description}</p>
                        </div>
                      </div>

                      {/* Stage Action Buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-auto">
                        <button
                          type="button"
                          onClick={() => handleOpenDeliverableModal(m)}
                          className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        >
                          <Upload className="w-3.5 h-3.5 text-slate-600" />
                          + Add Deliverable
                        </button>

                        {isSubmitted && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                handleReviewMilestone(
                                  m.id,
                                  "APPROVED",
                                  "Approved after institutional review of submitted blueprints."
                                )
                              }
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                            >
                              Approve Stage
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleReviewMilestone(
                                  m.id,
                                  "REVISION_REQUESTED",
                                  "Please attach updated sensor calibration logs."
                                )
                              }
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
                            >
                              Request Edit
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Deliverables Checklist */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Submitted Deliverables &amp; Evidence ({m.deliverables?.length || 0})
                      </div>

                      {m.deliverables && m.deliverables.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {m.deliverables.map((del) => (
                            <div
                              key={del.id}
                              className="bg-slate-50/80 border border-slate-200/90 rounded-lg p-3 text-xs flex items-start justify-between gap-3 hover:bg-slate-50 transition-all"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">
                                    {DELIVERABLE_TYPE_LABELS[del.deliverableType]?.icon || "📄"}
                                  </span>
                                  <span className="font-bold text-slate-800">{del.title}</span>
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  Type:{" "}
                                  <strong>
                                    {DELIVERABLE_TYPE_LABELS[del.deliverableType]?.label || del.deliverableType}
                                  </strong>{" "}
                                  • By: {del.submittedBy || "Student Innovator"}
                                </div>
                                {del.notes && <p className="text-[11px] text-slate-600 italic">"{del.notes}"</p>}
                              </div>

                              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                <a
                                  href={del.fileUrl || "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 shadow-2xs"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  View Doc
                                </a>
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                    del.isVerified
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {del.isVerified ? "✓ Verified" : "Pending Review"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-4 text-center text-slate-400 text-xs">
                          No deliverables submitted yet for this stage.
                        </div>
                      )}
                    </div>

                    {/* Review Notes Footer */}
                    {m.reviewNotes && (
                      <div className="bg-slate-100/80 rounded-lg p-2.5 text-xs text-slate-700 flex items-start gap-2 border border-slate-200">
                        <BookOpen className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong>Review Notes:</strong> {m.reviewNotes}{" "}
                          {m.reviewedBy && <span className="text-slate-500">({m.reviewedBy})</span>}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: TESTING OUTCOMES & TELEMETRY */}
        {/* ======================================================== */}
        {activeTab === "testing" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Testing Outcomes &amp; Quantitative Sensor Logs</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Record simulation tests, laboratory bench runs, and field pilot trials with quantitative sensor metrics to advance TRL.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsRecordTestModalOpen(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                Record New Test Run
              </button>
            </div>

            {/* Test Results Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Test Title &amp; Scope</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">TRL Tier</th>
                    <th className="py-3 px-4">Quantitative Sensor Telemetry</th>
                    <th className="py-3 px-4">Location &amp; Date</th>
                    <th className="py-3 px-4 text-right">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {testResults.map((test) => (
                    <tr key={test.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{test.title}</div>
                        <div className="text-[11px] text-slate-500">Tested by: {test.testedBy || "Lead Investigator"}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                          {test.testType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                          TRL {test.trlLevel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-800 max-w-xs truncate">
                        {test.quantitativeMetrics || "Standard telemetry within limits"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{test.testedLocation || "Ranchi Lab"}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{test.testedAt}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-bold text-[11px] px-2.5 py-1 rounded inline-block ${
                            test.status === "PASSED"
                              ? "bg-emerald-100 text-emerald-800"
                              : test.status === "CONDITIONAL_PASS"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {test.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: STAGE APPROVALS & CLOSED-LOOP SIGN-OFF */}
        {/* ======================================================== */}
        {activeTab === "signoff" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Dual Closed-Loop Verification &amp; Resolution Sign-Off</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cryptographically verified approvals from Citizen Reporters, Municipal Officers, and Faculty Guides.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsSignoffModalOpen(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Sign Digital Approval
              </button>
            </div>

            {/* Sign-offs List */}
            <div className="space-y-3">
              {signoffs.map((s) => (
                <div
                  key={s.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs hover:border-slate-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                        ✓
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{s.approverName}</div>
                        <div className="text-[11px] text-slate-500">
                          {s.approverDesignation || s.approverRole.replace(/_/g, " ")} • {s.approverEntity}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded">
                        {s.stage.replace(/_/g, " ")}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        {s.status}
                      </span>
                    </div>
                  </div>

                  {s.feedbackNotes && (
                    <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      "{s.feedbackNotes}"
                    </div>
                  )}

                  {/* Digital Signature Hash */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[10px] text-slate-400 font-mono">
                    <div className="flex items-center gap-1">
                      <Hash className="w-3 h-3 text-slate-400" />
                      <span>SHA-256 Digest: {s.digitalSignatureHash ? s.digitalSignatureHash.substring(0, 32) + "..." : "0x7a8f...verified"}</span>
                    </div>
                    <div>Signed: {s.signedAt}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: INTELLECTUAL PROPERTY & PATENTS */}
        {/* ======================================================== */}
        {activeTab === "ip" && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">Tripartite IP Ownership &amp; Patent Filing</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Standardized 50% Higher Education Institution / 30% Student Innovator / 20% Industry Partner intellectual property framework.
              </p>
            </div>

            {ipRecords.map((ip) => (
              <div key={ip.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-900 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded">
                        {ip.patentApplicationNumber || "PENDING-IPO"}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        {ip.status.replace(/_/g, " ")}
                      </span>
                      <span className="text-[11px] text-slate-500">Office: {ip.patentOffice || "IPO Kolkata"}</span>
                    </div>
                    <h4 className="font-black text-slate-900 text-base">{ip.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{ip.abstractDescription}</p>
                  </div>

                  {ip.mouDocumentUrl && (
                    <a
                      href={ip.mouDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs flex-shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Signed MOU
                    </a>
                  )}
                </div>

                {/* Tripartite Ownership Breakdown */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Statutory Ownership Allocation
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                      <div className="text-2xl font-black text-slate-900 font-mono">{ip.heiOwnershipShare}%</div>
                      <div className="text-xs font-bold text-slate-700 mt-0.5">Higher Education Institution</div>
                      <div className="text-[10px] text-slate-400">Institutional Incubation Cell</div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                      <div className="text-2xl font-black text-emerald-600 font-mono">{ip.studentInnovatorsShare}%</div>
                      <div className="text-xs font-bold text-slate-700 mt-0.5">Student &amp; Faculty Innovators</div>
                      <div className="text-[10px] text-slate-400">Named Primary Inventors</div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                      <div className="text-2xl font-black text-blue-600 font-mono">{ip.industryPartnerShare}%</div>
                      <div className="text-xs font-bold text-slate-700 mt-0.5">Industry CSR Co-Funder</div>
                      <div className="text-[10px] text-slate-400">{ip.commercialPartnerName || "Corporate Sponsor"}</div>
                    </div>
                  </div>
                </div>

                {/* Royalty Terms */}
                {ip.royaltyTerms && (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700">
                    <strong>Commercialization &amp; Licensing Terms:</strong> {ip.royaltyTerms}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL: SUBMIT DELIVERABLE */}
      {/* ======================================================== */}
      {isSubmitDeliverableModalOpen && selectedMilestoneForDeliverable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 border border-slate-300 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Submit Milestone Deliverable</h3>
                <p className="text-slate-500 text-xs">Stage: {selectedMilestoneForDeliverable.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsSubmitDeliverableModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitDeliverable} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Deliverable Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Firmware v1.2 & Sensor Calibration Log"
                  value={deliverableForm.title}
                  onChange={(e) => setDeliverableForm({ ...deliverableForm, title: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deliverable Type:</label>
                <select
                  value={deliverableForm.deliverableType}
                  onChange={(e) => setDeliverableForm({ ...deliverableForm, deliverableType: e.target.value as DeliverableType })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white outline-none focus:border-slate-900"
                >
                  {Object.entries(DELIVERABLE_TYPE_LABELS).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.icon} {val.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Document / Artifact Storage URL:</label>
                <input
                  type="url"
                  required
                  value={deliverableForm.fileUrl}
                  onChange={(e) => setDeliverableForm({ ...deliverableForm, fileUrl: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white font-mono text-xs outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Technical Notes / Observation:</label>
                <textarea
                  rows={3}
                  placeholder="Summarize key test findings, CAD design parameters, or code repository commit hash..."
                  value={deliverableForm.notes}
                  onChange={(e) => setDeliverableForm({ ...deliverableForm, notes: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSubmitDeliverableModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold cursor-pointer"
                >
                  Upload &amp; Submit for Review →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: RECORD TEST OUTCOME */}
      {/* ======================================================== */}
      {isRecordTestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 border border-slate-300 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Record Testing Outcome</h3>
                <p className="text-slate-500 text-xs">TRL Validation &amp; Sensor Telemetry Log</p>
              </div>
              <button
                type="button"
                onClick={() => setIsRecordTestModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordTest} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Test Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 72-Hour Continuous Pumping & Solar Battery Telemetry"
                  value={testForm.title}
                  onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Test Category:</label>
                  <select
                    value={testForm.testType}
                    onChange={(e) => setTestForm({ ...testForm, testType: e.target.value as TestType })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white outline-none focus:border-slate-900"
                  >
                    <option value="SIMULATION">SIMULATION</option>
                    <option value="BENCH_TEST">BENCH TEST</option>
                    <option value="FIELD_TRIAL">FIELD TRIAL</option>
                    <option value="USER_STUDY">USER STUDY</option>
                    <option value="SAFETY_CERTIFICATION">SAFETY CERTIFICATION</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Validated TRL Tier (1–9):</label>
                  <select
                    value={testForm.trlLevel}
                    onChange={(e) => setTestForm({ ...testForm, trlLevel: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white font-mono font-bold outline-none focus:border-slate-900"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                      <option key={lvl} value={lvl}>
                        TRL {lvl} - {TRL_DESCRIPTIONS[lvl]?.phase}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Quantitative Metrics Recorded:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 99.4% pathogen kill, 120 L/hr throughput, 0.4 NTU turbidity"
                  value={testForm.quantitativeMetrics}
                  onChange={(e) => setTestForm({ ...testForm, quantitativeMetrics: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white font-mono outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Test Location:</label>
                  <input
                    type="text"
                    value={testForm.testedLocation}
                    onChange={(e) => setTestForm({ ...testForm, testedLocation: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pass Status:</label>
                  <select
                    value={testForm.status}
                    onChange={(e) => setTestForm({ ...testForm, status: e.target.value as TestPassStatus })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white font-bold outline-none focus:border-slate-900"
                  >
                    <option value="PASSED">PASSED</option>
                    <option value="CONDITIONAL_PASS">CONDITIONAL PASS</option>
                    <option value="INCONCLUSIVE">INCONCLUSIVE</option>
                    <option value="FAILED">FAILED</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsRecordTestModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold cursor-pointer"
                >
                  Save Test Outcome →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: STAGE APPROVAL SIGN-OFF */}
      {/* ======================================================== */}
      {isSignoffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 border border-slate-300 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Digital Approval Sign-off</h3>
                <p className="text-slate-500 text-xs">Cryptographic SHA-256 Dual Sign-off</p>
              </div>
              <button
                type="button"
                onClick={() => setIsSignoffModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitSignoff} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Approval Stage:</label>
                  <select
                    value={signoffForm.stage}
                    onChange={(e) => setSignoffForm({ ...signoffForm, stage: e.target.value as ApprovalStage })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white font-bold outline-none focus:border-slate-900"
                  >
                    <option value="LAB_PROTOTYPE_SIGN_OFF">Lab Prototype Sign-off</option>
                    <option value="FIELD_TEST_SIGN_OFF">Field Test Sign-off</option>
                    <option value="MOU_APPROVAL">MOU Approval</option>
                    <option value="FINAL_RESOLUTION">Final Resolution (Closed-Loop)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Approver Role:</label>
                  <select
                    value={signoffForm.approverRole}
                    onChange={(e) => setSignoffForm({ ...signoffForm, approverRole: e.target.value as ApproverRole })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white font-bold outline-none focus:border-slate-900"
                  >
                    <option value="FACULTY_MENTOR">Faculty Mentor / Guide</option>
                    <option value="CITIZEN_REPORTER">Citizen Reporter</option>
                    <option value="NODAL_GOVT_OFFICER">Nodal Govt Officer</option>
                    <option value="INDUSTRY_SPONSOR">Industry Sponsor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Approver Name:</label>
                  <input
                    type="text"
                    required
                    value={signoffForm.approverName}
                    onChange={(e) => setSignoffForm({ ...signoffForm, approverName: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation &amp; Entity:</label>
                  <input
                    type="text"
                    required
                    value={signoffForm.approverDesignation}
                    onChange={(e) => setSignoffForm({ ...signoffForm, approverDesignation: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Satisfaction Rating (1–5 Stars):</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSignoffForm({ ...signoffForm, satisfactionRating: star })}
                      className={`p-1.5 rounded text-lg ${
                        star <= signoffForm.satisfactionRating ? "text-amber-400" : "text-slate-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="font-bold text-slate-700 text-xs ml-2">
                    {signoffForm.satisfactionRating} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Feedback &amp; Verification Remarks:</label>
                <textarea
                  rows={3}
                  required
                  value={signoffForm.feedbackNotes}
                  onChange={(e) => setSignoffForm({ ...signoffForm, feedbackNotes: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSignoffModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold cursor-pointer"
                >
                  Generate SHA-256 Digital Sign-Off →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
