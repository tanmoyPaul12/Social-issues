"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ActivePilotDetail,
  Milestone,
  DisbursementTranche,
  PilotHealthStatus,
  ReviewMilestonePayload,
  ReleaseDisbursementPayload,
  PostDiscussionPayload,
  PilotDocumentType,
} from "@/modules/industry/types/activePilots";
import { ReviewMilestoneModal } from "./ReviewMilestoneModal";
import { ReleaseDisbursementModal } from "./ReleaseDisbursementModal";
import { UploadPilotDocumentModal } from "./UploadPilotDocumentModal";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "@/components/dashboard/ToastStack";
import {
  industryLifecycleApi,
  ApprovalSignoffDto,
  ApprovalStage,
  ApprovalStatus,
  SubmitSignoffRequest,
  DualClosedLoopStatusDto,
  TestResultDto,
  TestType,
  RecordTestResultRequest,
} from "@/modules/industry/services/industryLifecycleApi";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  RefreshCw,
  Loader2,
  Check,
  Activity,
  BarChart3,
  Plus,
} from "@/components/dashboard/icons";

interface PilotDetailDossierModalProps {
  detail: ActivePilotDetail;
  isOpen: boolean;
  initialTab?: "milestones" | "disbursements" | "discussions" | "documents" | "agreements" | "approvals" | "testing";
  onClose: () => void;
  onReviewMilestone: (pilotId: number, milestoneId: number, payload: ReviewMilestonePayload) => Promise<boolean>;
  onReleaseDisbursement: (pilotId: number, payload: ReleaseDisbursementPayload) => Promise<boolean>;
  onPostDiscussion: (pilotId: number, payload: PostDiscussionPayload) => Promise<any>;
  onUploadDocument: (pilotId: number, title: string, docType: PilotDocumentType, file: File) => Promise<boolean>;
  onDeleteDocument: (pilotId: number, docId: number) => Promise<boolean>;
  onUpdateHealth: (pilotId: number, health: PilotHealthStatus) => Promise<boolean>;
}

export function PilotDetailDossierModal({
  detail,
  isOpen,
  initialTab = "milestones",
  onClose,
  onReviewMilestone,
  onReleaseDisbursement,
  onPostDiscussion,
  onUploadDocument,
  onDeleteDocument,
  onUpdateHealth,
}: PilotDetailDossierModalProps) {
  const { token, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<
    "milestones" | "disbursements" | "discussions" | "documents" | "agreements" | "approvals" | "testing"
  >(initialTab);

  // Sub-modals
  const [reviewMilestoneTarget, setReviewMilestoneTarget] = useState<Milestone | null>(null);
  const [releaseTrancheTarget, setReleaseTrancheTarget] = useState<DisbursementTranche | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);

  // Stage Approvals & Closed-Loop State
  const [signoffs, setSignoffs] = useState<ApprovalSignoffDto[]>([]);
  const [closedLoopStatus, setClosedLoopStatus] = useState<DualClosedLoopStatusDto | null>(null);
  const [isLoadingSignoffs, setIsLoadingSignoffs] = useState<boolean>(false);
  const [isSubmittingSignoff, setIsSubmittingSignoff] = useState<boolean>(false);

  const [signoffModalTarget, setSignoffModalTarget] = useState<{
    stage: ApprovalStage;
    stageTitle: string;
    action: "APPROVE" | "REQUEST_REVISION" | "REJECT";
  } | null>(null);
  const [signoffRemarks, setSignoffRemarks] = useState<string>("");
  const [signoffAcknowledged, setSignoffAcknowledged] = useState<boolean>(false);

  // Testing & TRL Progression State
  const [testResults, setTestResults] = useState<TestResultDto[]>([]);
  const [highestTrl, setHighestTrl] = useState<number>(1);
  const [isLoadingTests, setIsLoadingTests] = useState<boolean>(false);
  const [isSubmittingTest, setIsSubmittingTest] = useState<boolean>(false);
  const [isLogTestModalOpen, setIsLogTestModalOpen] = useState<boolean>(false);

  // Log Test Form State
  const [newTestTitle, setNewTestTitle] = useState<string>("");
  const [newTestType, setNewTestType] = useState<TestType>("LAB_BENCH_TEST");
  const [newTrlLevel, setNewTrlLevel] = useState<number>(4);
  const [newPassStatus, setNewPassStatus] = useState<boolean>(true);
  const [newTestDate, setNewTestDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [newTestLocation, setNewTestLocation] = useState<string>(
    detail.project.targetDistrict ? `${detail.project.targetDistrict} Innovation Testbed` : "Institutional R&D Lab"
  );
  const [newObservations, setNewObservations] = useState<string>("");
  const [newMetricsJson, setNewMetricsJson] = useState<string>("");
  const [newTestReportUrl, setNewTestReportUrl] = useState<string>("");

  // Agreements State
  const [agreements, setAgreements] = useState<Array<{
    id: number;
    agreementTitle: string;
    agreementType: "LOI" | "MOU" | "TRIPARTITE" | "IP_LICENSING";
    status: "DRAFT" | "SENT" | "SIGNED_BY_INDUSTRY" | "FULLY_EXECUTED";
    ipSplitIndustry: number;
    ipSplitUniversity: number;
    documentUrl?: string;
    documentFileName?: string;
    signedAt?: string;
    scopeDescription?: string;
  }>>([
    {
      id: 1,
      agreementTitle: "Co-Development & IP Co-Ownership Memorandum",
      agreementType: "MOU",
      status: "SIGNED_BY_INDUSTRY",
      ipSplitIndustry: 60,
      ipSplitUniversity: 40,
      documentUrl: "#",
      documentFileName: "MOU_Executed_Signed.pdf",
      signedAt: "2026-03-01",
      scopeDescription: "Joint prototyping, algorithm optimization, and state field testbed deployment.",
    },
  ]);
  const [isCreateAgreementOpen, setIsCreateAgreementOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftType, setDraftType] = useState<"LOI" | "MOU" | "TRIPARTITE" | "IP_LICENSING">("MOU");
  const [draftIndustrySplit, setDraftIndustrySplit] = useState(50);
  const [draftScope, setDraftScope] = useState("");

  // Message chat input
  const [chatMessage, setChatMessage] = useState<string>("");
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);

  // Doc filter
  const [selectedDocType, setSelectedDocType] = useState<string>("ALL");

  if (!isOpen) return null;

  const pilot = detail.project;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    setIsSendingMessage(true);
    const msg = chatMessage.trim();
    setChatMessage("");
    await onPostDiscussion(pilot.id, { message: msg });
    setIsSendingMessage(false);
  };

  const projectId = detail.projectId || detail.project.projectId || detail.project.id;

  const loadSignoffs = useCallback(async () => {
    if (!projectId) return;
    setIsLoadingSignoffs(true);
    try {
      const [signoffsData, loopData] = await Promise.all([
        industryLifecycleApi.getSignoffs(projectId, token).catch(() => []),
        industryLifecycleApi.getDualClosedLoopStatus(projectId, token).catch(() => null),
      ]);
      setSignoffs(Array.isArray(signoffsData) ? signoffsData : []);
      setClosedLoopStatus(loopData);
    } catch (e) {
      console.warn("Could not load signoffs:", e);
    } finally {
      setIsLoadingSignoffs(false);
    }
  }, [projectId, token]);

  useEffect(() => {
    if (isOpen) {
      loadSignoffs();
    }
  }, [isOpen, loadSignoffs]);

  const handleSubmitSignoff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signoffModalTarget) return;

    if (
      (signoffModalTarget.action === "REQUEST_REVISION" || signoffModalTarget.action === "REJECT") &&
      !signoffRemarks.trim()
    ) {
      toast.error("Please provide review feedback / remarks explaining the requested changes.");
      return;
    }

    const approvalStatus: ApprovalStatus =
      signoffModalTarget.action === "APPROVE"
        ? "APPROVED"
        : signoffModalTarget.action === "REQUEST_REVISION"
        ? "CHANGES_REQUESTED"
        : "REJECTED";

    try {
      setIsSubmittingSignoff(true);
      const req: SubmitSignoffRequest = {
        stage: signoffModalTarget.stage,
        approverRole: "INDUSTRY_CSR_ADMIN",
        approverName: user?.name || user?.orgName || "Industry CSR Partner",
        approvalStatus,
        remarks: signoffRemarks.trim() || undefined,
        digitalSignatureHash: `SIG-${Date.now().toString(16).toUpperCase()}`,
      };

      await industryLifecycleApi.submitSignoff(projectId, req, token);
      toast.success(
        signoffModalTarget.action === "APPROVE"
          ? `Stage "${signoffModalTarget.stageTitle}" has been APPROVED!`
          : `Feedback recorded for stage "${signoffModalTarget.stageTitle}".`
      );
      setSignoffModalTarget(null);
      setSignoffRemarks("");
      setSignoffAcknowledged(false);
      await loadSignoffs();
    } catch (err: any) {
      console.error("Signoff submission failed:", err);
      toast.error(err?.message || "Failed to submit stage sign-off");
    } finally {
      setIsSubmittingSignoff(false);
    }
  };

  const loadTestResults = useCallback(async () => {
    if (!projectId) return;
    setIsLoadingTests(true);
    try {
      const [results, maxTrl] = await Promise.all([
        industryLifecycleApi.getTestResults(projectId, token).catch(() => []),
        industryLifecycleApi.getHighestTrl(projectId, token).catch(() => 1),
      ]);
      setTestResults(Array.isArray(results) ? results : []);
      setHighestTrl(typeof maxTrl === "number" ? maxTrl : 1);
    } catch (e) {
      console.warn("Could not load test results:", e);
    } finally {
      setIsLoadingTests(false);
    }
  }, [projectId, token]);

  useEffect(() => {
    if (isOpen) {
      loadSignoffs();
      loadTestResults();
    }
  }, [isOpen, loadSignoffs, loadTestResults]);

  const resetTestForm = () => {
    setNewTestTitle("");
    setNewTestType("LAB_BENCH_TEST");
    setNewTrlLevel(4);
    setNewPassStatus(true);
    setNewTestDate(new Date().toISOString().split("T")[0]);
    setNewTestLocation(
      detail.project.targetDistrict ? `${detail.project.targetDistrict} Innovation Testbed` : "Institutional R&D Lab"
    );
    setNewObservations("");
    setNewMetricsJson("");
    setNewTestReportUrl("");
  };

  const handleLogTestResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestTitle.trim()) {
      toast.error("Please provide a Test Title.");
      return;
    }

    try {
      setIsSubmittingTest(true);
      const req: RecordTestResultRequest = {
        testTitle: newTestTitle.trim(),
        testType: newTestType,
        trlLevel: Number(newTrlLevel),
        passStatus: newPassStatus,
        testDate: newTestDate || undefined,
        testLocation: newTestLocation.trim() || undefined,
        observationsNotes: newObservations.trim() || undefined,
        metricsDataJson: newMetricsJson.trim() || undefined,
        testReportDocumentUrl: newTestReportUrl.trim() || undefined,
      };

      await industryLifecycleApi.recordTestResult(projectId, req, token);
      toast.success(`Test outcome "${newTestTitle}" recorded (TRL ${newTrlLevel})!`);
      setIsLogTestModalOpen(false);
      resetTestForm();
      await loadTestResults();
    } catch (err: any) {
      console.error("Failed to log test result:", err);
      toast.error(err?.message || "Failed to log test outcome");
    } finally {
      setIsSubmittingTest(false);
    }
  };

  const filteredDocs =
    selectedDocType === "ALL"
      ? detail.documents
      : detail.documents.filter((d) => d.docType === selectedDocType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-5xl w-full h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-xs">
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex-shrink-0 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold text-[10px] border border-indigo-400/30">
                  {pilot.sectorName}
                </span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 text-[10px]">
                  {pilot.stageLabel}
                </span>
                {pilot.targetDistrict && (
                  <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 text-[10px]">
                     {pilot.targetDistrict}
                  </span>
                )}
              </div>
              <h1 className="text-base sm:text-lg font-black text-white mt-1.5 leading-snug">
                {pilot.title}
              </h1>
              <p className="text-slate-400 text-xs mt-0.5">
                {pilot.universityName} • Lead PI: {pilot.facultyLeadName || "Faculty Guide"}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Health status quick changer */}
              <select
                value={pilot.healthStatus}
                onChange={(e) => onUpdateHealth(pilot.id, e.target.value as PilotHealthStatus)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-bold text-xs outline-none cursor-pointer"
              >
                <option value="ON_TRACK">On Track</option>
                <option value="DELAYED">Delayed</option>
                <option value="AT_RISK">At Risk</option>
                <option value="COMPLETED">Completed</option>
              </select>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Progress</span>
              <strong className="text-white font-mono text-xs">{pilot.progressPercentage}%</strong>
              <span className="text-slate-400 text-[10px] ml-1">({detail.completedMilestonesCount}/{detail.totalMilestonesCount} Milestones)</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Total Committed</span>
              <strong className="text-white font-mono text-xs">{detail.totalCommittedFormatted}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Disbursed</span>
              <strong className="text-emerald-400 font-mono text-xs">{detail.totalDisbursedFormatted}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Remaining</span>
              <strong className="text-indigo-300 font-mono text-xs">{detail.remainingFormatted}</strong>
            </div>
          </div>
        </div>

        {/* Workspace Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 overflow-x-auto select-none flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("milestones")}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "milestones"
                ? "border-slate-900 text-slate-900 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Milestone Pipeline &amp; Reviews</span>
            {detail.pendingReviewMilestonesCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-black rounded-full text-[10px]">
                {detail.pendingReviewMilestonesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("disbursements")}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "disbursements"
                ? "border-slate-900 text-slate-900 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Disbursement &amp; Tranche Ledger</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("discussions")}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "discussions"
                ? "border-slate-900 text-slate-900 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Team Collaboration Thread</span>
            <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 font-bold rounded-full text-[10px]">
              {detail.recentDiscussions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("documents")}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "documents"
                ? "border-slate-900 text-slate-900 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Document &amp; Evidence Vault</span>
            <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 font-bold rounded-full text-[10px]">
              {detail.documents.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("agreements")}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "agreements"
                ? "border-slate-900 text-slate-900 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Legal Agreements &amp; IP MOUs</span>
            <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-800 font-bold rounded-full text-[10px]">
              {agreements.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("approvals")}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "approvals"
                ? "border-slate-900 text-slate-900 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Stage Approvals &amp; Signoffs</span>
            {signoffs.length > 0 && (
              <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                {signoffs.filter((s) => s.approvalStatus === "APPROVED").length}/4
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("testing")}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "testing"
                ? "border-slate-900 text-slate-900 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>Testing &amp; TRL Progression</span>
            <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 font-bold rounded-full text-[10px]">
              TRL {highestTrl}
            </span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-white">
          {/* TAB 1: MILESTONE PIPELINE */}
          {activeTab === "milestones" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Project Deliverables &amp; Milestone Timeline</h2>
                  <p className="text-xs text-slate-500">
                    Review academic testbed outputs to verify completion before unlocking tranche release.
                  </p>
                </div>
              </div>

              <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6">
                {detail.milestones.map((m) => {
                  const isApproved = m.status === "APPROVED";
                  const isSubmitted = m.status === "SUBMITTED_FOR_REVIEW";
                  const isRevision = m.status === "REVISION_REQUESTED";
                  const isInProgress = m.status === "IN_PROGRESS";

                  return (
                    <div key={m.id} className="relative group">
                      {/* Timeline Dot */}
                      <div
                        className={`absolute -left-[33px] top-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center font-bold text-[10px] ${
                          isApproved
                            ? "bg-emerald-600 text-white"
                            : isSubmitted
                            ? "bg-amber-500 text-white animate-pulse"
                            : isRevision
                            ? "bg-rose-500 text-white"
                            : isInProgress
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-300 text-slate-700"
                        }`}
                      >
                        {isApproved ? (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          m.milestoneNumber
                        )}
                      </div>

                      {/* Milestone Card */}
                      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">
                                Milestone {m.milestoneNumber}: {m.title}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isApproved
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                    : isSubmitted
                                    ? "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse"
                                    : isRevision
                                    ? "bg-rose-50 text-rose-800 border border-rose-200"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {m.statusLabel}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 mt-0.5 block">
                              Target Date: <strong>{m.targetDate || "TBD"}</strong>
                              {m.completedDate && ` • Completed: ${m.completedDate}`}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right font-mono">
                              <span className="text-[10px] text-slate-400 block uppercase">Tranche Value</span>
                              <span className="font-bold text-emerald-700 text-xs">{m.trancheAmountFormatted}</span>
                            </div>

                            {isSubmitted && (
                              <button
                                type="button"
                                onClick={() => setReviewMilestoneTarget(m)}
                                className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-2xs"
                              >
                                Review Deliverable
                              </button>
                            )}

                            {isApproved && (
                              <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                                Approved
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          {m.deliverableSummary}
                        </p>

                        {/* Submission & Review Remarks */}
                        {m.submissionRemarks && (
                          <div className="text-xs bg-amber-50/60 p-2.5 rounded-lg border border-amber-100">
                            <span className="text-[10px] font-bold uppercase text-amber-800 block">Faculty Submission Notes:</span>
                            <span className="text-amber-950 italic mt-0.5 block">"{m.submissionRemarks}"</span>
                          </div>
                        )}

                        {m.reviewRemarks && (
                          <div className="text-xs bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
                            <span className="text-[10px] font-bold uppercase text-emerald-800 block">Corporate Review Verdict:</span>
                            <span className="text-emerald-950 mt-0.5 block">"{m.reviewRemarks}"</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: DISBURSEMENT LEDGER */}
          {activeTab === "disbursements" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Grant Tranches &amp; Bank Disbursement Ledger</h2>
                  <p className="text-xs text-slate-500">
                    Track tranche releases, record bank UTR numbers, and generate CSR audit records.
                  </p>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Tranche</th>
                      <th className="py-3 px-4">Reference</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Scheduled / Disbursed</th>
                      <th className="py-3 px-4">Payment &amp; UTR</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detail.disbursements.map((d) => {
                      const isDisbursed = d.status === "DISBURSED";

                      return (
                        <tr key={d.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            Tranche #{d.trancheNumber}
                            <span className="text-slate-400 block font-normal text-[10px]">{d.trancheLabel}</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">{d.disbursementReference}</td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{d.amountFormatted}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isDisbursed
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : "bg-amber-50 text-amber-800 border border-amber-200"
                              }`}
                            >
                              {d.statusLabel}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                            {isDisbursed ? `Disbursed: ${d.disbursedDate}` : `Target: ${d.scheduledDate || "Immediate"}`}
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                            {d.utrNumber ? (
                              <div>
                                <span className="font-bold text-slate-800 block">{d.utrNumber}</span>
                                <span className="text-slate-400 text-[10px]">{d.paymentMethod}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {!isDisbursed ? (
                              <button
                                type="button"
                                onClick={() => setReleaseTrancheTarget(d)}
                                className="py-1 px-2.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-all cursor-pointer"
                              >
                                Release Tranche
                              </button>
                            ) : (
                              <span className="text-emerald-700 font-bold text-[11px]">Paid</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: TEAM DISCUSSION */}
          {activeTab === "discussions" && (
            <div className="flex flex-col h-[520px] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">Research &amp; Mentorship Thread</h3>
                  <p className="text-[11px] text-slate-500">Live communication with {pilot.universityName}</p>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync Active
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {detail.recentDiscussions.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <p className="text-xs">No discussion messages yet.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Start the conversation with the academic team below.</p>
                  </div>
                ) : (
                  detail.recentDiscussions.map((msg) => {
                    const isCorporate = msg.senderRole === "INDUSTRY_PARTNER";

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[80%] ${
                          isCorporate ? "ml-auto items-end" : "mr-auto items-start"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                          <span className="font-bold text-slate-700">{msg.senderName}</span>
                          <span>•</span>
                          <span className="uppercase text-[9px] font-semibold text-slate-500">
                            {msg.senderRole.replace("_", " ")}
                          </span>
                          {msg.isPinned && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">Pinned</span>
                          )}
                        </div>

                        <div
                          className={`p-3 rounded-xl text-xs leading-relaxed ${
                            isCorporate
                              ? "bg-slate-900 text-white rounded-tr-none"
                              : "bg-white border border-slate-200 text-slate-900 rounded-tl-none shadow-2xs"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.message}</p>

                          {msg.attachmentUrl && (
                            <a
                              href={msg.attachmentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className={`mt-2 flex items-center gap-1 font-bold underline text-[11px] ${
                                isCorporate ? "text-indigo-300 hover:text-white" : "text-indigo-600 hover:text-indigo-800"
                              }`}
                            >
                              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              <span>{msg.attachmentName || "Attached Document"}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type message to faculty lead and student researchers..."
                  className="flex-1 p-2.5 rounded-lg border border-slate-300 text-xs outline-none focus:border-slate-500"
                />
                <button
                  type="submit"
                  disabled={isSendingMessage || !chatMessage.trim()}
                  className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  Send
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: DOCUMENT REPOSITORY */}
          {activeTab === "documents" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Project Artifact &amp; Evidence Repository</h2>
                  <p className="text-xs text-slate-500">
                    Proposals, WBS blueprints, lab testbed datasets, and audited utilization certificates.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedDocType}
                    onChange={(e) => setSelectedDocType(e.target.value)}
                    className="p-2 rounded-lg border border-slate-300 text-xs outline-none cursor-pointer"
                  >
                    <option value="ALL">All Document Types</option>
                    <option value="PROJECT_PROPOSAL">Project Proposals</option>
                    <option value="LAB_REPORT">Lab Reports</option>
                    <option value="TESTBED_EVALUATION">Testbed Datasets</option>
                    <option value="UTILIZATION_CERTIFICATE">Utilization Certificates</option>
                    <option value="MOU_AGREEMENT">MoU Agreements</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(true)}
                    className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>Upload Artifact</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredDocs.length === 0 ? (
                  <div className="col-span-2 text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                    No documents matching selected filter.
                  </div>
                ) : (
                  filteredDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all flex items-start justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 uppercase">
                            {doc.docTypeLabel}
                          </span>
                          <h4 className="font-bold text-slate-900 text-xs mt-1">{doc.title}</h4>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {doc.fileSizeFormatted} • Uploaded by {doc.uploadedByName || "Team"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Download Document"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                        <button
                          type="button"
                          onClick={() => onDeleteDocument(pilot.id, doc.id)}
                          className="p-1.5 rounded hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                          title="Delete Document"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: LEGAL AGREEMENTS & IP MOUs */}
          {activeTab === "agreements" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Co-Development Agreements &amp; IP Protection</h2>
                  <p className="text-xs text-slate-500">
                    Manage institutional MOUs, IP ownership ratios, and signed legal instruments for this pilot.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDraftTitle(`Joint Co-Development MOU - ${pilot.title}`);
                    setIsCreateAgreementOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Draft New Agreement</span>
                </button>
              </div>

              {/* Agreements List */}
              <div className="space-y-4">
                {agreements.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                    No agreements drafted yet for this pilot.
                  </div>
                ) : (
                  agreements.map((agreement) => (
                    <div
                      key={agreement.id}
                      className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-slate-300 transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {agreement.agreementType}
                          </span>
                          <h3 className="font-bold text-slate-900 text-sm">{agreement.agreementTitle}</h3>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold self-start sm:self-auto ${
                            agreement.status === "FULLY_EXECUTED"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : agreement.status === "SIGNED_BY_INDUSTRY"
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : agreement.status === "SENT"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {agreement.status.replace(/_/g, " ")}
                        </span>
                      </div>

                      {/* IP Split Breakdown */}
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-2 text-xs">
                        <div className="flex justify-between font-semibold text-slate-700">
                          <span>Industry IP Share: <strong>{agreement.ipSplitIndustry}%</strong></span>
                          <span>University IP Share: <strong>{agreement.ipSplitUniversity}%</strong></span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
                          <div
                            className="bg-indigo-600 h-2"
                            style={{ width: `${agreement.ipSplitIndustry}%` }}
                            title={`Industry: ${agreement.ipSplitIndustry}%`}
                          />
                          <div
                            className="bg-emerald-500 h-2"
                            style={{ width: `${agreement.ipSplitUniversity}%` }}
                            title={`University: ${agreement.ipSplitUniversity}%`}
                          />
                        </div>
                      </div>

                      {agreement.scopeDescription && (
                        <p className="text-xs text-slate-600 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                          <strong>Scope: </strong>{agreement.scopeDescription}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                        <div className="text-[11px] text-slate-400">
                          {agreement.signedAt ? `Signed on ${agreement.signedAt}` : "Pending signature execution"}
                          {agreement.documentFileName && ` • ${agreement.documentFileName}`}
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer transition-colors flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span>Upload Signed Copy</span>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setAgreements(prev => prev.map(a => a.id === agreement.id ? {
                                    ...a,
                                    status: "SIGNED_BY_INDUSTRY",
                                    documentFileName: file.name,
                                    signedAt: new Date().toISOString().split("T")[0]
                                  } : a));
                                  alert(`Uploaded signed copy: ${file.name}`);
                                }
                              }}
                            />
                          </label>

                          {agreement.status !== "FULLY_EXECUTED" && (
                            <button
                              type="button"
                              onClick={() => {
                                setAgreements(prev => prev.map(a => a.id === agreement.id ? { ...a, status: "FULLY_EXECUTED" } : a));
                              }}
                              className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition-colors"
                            >
                              Mark Fully Executed
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: STAGE APPROVALS & CLOSED-LOOP SIGNOFFS */}
          {activeTab === "approvals" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-900">
                      Stage Gate Approvals &amp; Dual Closed-Loop Signoff
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Live Gatekeeper
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Authorize project progression from Prototype to Field Pilot to Handover, and review final resolution digital signatures.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadSignoffs}
                  disabled={isLoadingSignoffs}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors shrink-0 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSignoffs ? "animate-spin" : ""}`} />
                  <span>Refresh Gates</span>
                </button>
              </div>

              {/* Dual Closed-Loop Status Summary Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-800/40 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                      Dual Closed-Loop Resolution Protocol
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      closedLoopStatus?.bothPartiesSigned
                        ? "bg-emerald-500 text-white font-black"
                        : "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                    }`}
                  >
                    {closedLoopStatus?.bothPartiesSigned ? "Fully Resolved & Closed" : "Verification In Progress"}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Per Jharkhand Innovation Policy, full problem resolution requires bilateral digital sign-offs from both the affected Citizen/Panchayat reporter and the Nodal Government Officer before final grant completion.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10 text-xs">
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">1. Citizen Reporter Sign-off</span>
                      <span className="font-bold text-white mt-0.5 block">
                        {closedLoopStatus?.citizenReporterName || "Grassroots Community Reporter"}
                      </span>
                      {closedLoopStatus?.citizenReporterSignedAt && (
                        <span className="text-[10px] text-slate-400">Signed: {new Date(closedLoopStatus.citizenReporterSignedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                    {closedLoopStatus?.citizenReporterSigned ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                        <Clock className="w-3.5 h-3.5" /> Pending
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">2. Nodal Government Officer Sign-off</span>
                      <span className="font-bold text-white mt-0.5 block">
                        {closedLoopStatus?.nodalOfficerName || "Designated District Nodal Officer"}
                      </span>
                      {closedLoopStatus?.nodalOfficerSignedAt && (
                        <span className="text-[10px] text-slate-400">Signed: {new Date(closedLoopStatus.nodalOfficerSignedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                    {closedLoopStatus?.nodalOfficerSigned ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Certified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                        <Clock className="w-3.5 h-3.5" /> Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 4-Stage Progression Gateways */}
              {isLoadingSignoffs ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                  <span>Loading stage verification gates...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    {
                      key: "PROTOTYPE" as ApprovalStage,
                      stepNumber: 1,
                      title: "Prototype Development & Lab Validation",
                      badgeTrl: "TRL 4–5",
                      description: "Fabrication of hardware/software prototype, bench testing calibration, and academic milestone sign-off.",
                    },
                    {
                      key: "FIELD_PILOT" as ApprovalStage,
                      stepNumber: 2,
                      title: "Field Pilot & Testbed Trial",
                      badgeTrl: "TRL 6–7",
                      description: "Live deployment in rural/urban testbed, IoT telemetry streaming, and corporate mentor field audit.",
                    },
                    {
                      key: "DEPLOYMENT_HANDOVER" as ApprovalStage,
                      stepNumber: 3,
                      title: "Scale Deployment & Handover",
                      badgeTrl: "TRL 8–9",
                      description: "Institutional IP licensing execution, department integration, and commercial scaling handover.",
                    },
                    {
                      key: "FINAL_RESOLUTION" as ApprovalStage,
                      stepNumber: 4,
                      title: "Dual Closed-Loop Resolution",
                      badgeTrl: "Resolution",
                      description: "Citizen reporter satisfaction rating and nodal department closure certificate sign-off.",
                    },
                  ].map((stageDef) => {
                    const stageSignoffs = signoffs.filter((s) => s.stage === stageDef.key);
                    const industrySignoff = stageSignoffs.find((s) => s.approverRole === "INDUSTRY_CSR_ADMIN");
                    const isApproved = industrySignoff?.approvalStatus === "APPROVED";
                    const isRevision = industrySignoff?.approvalStatus === "CHANGES_REQUESTED";
                    const isRejected = industrySignoff?.approvalStatus === "REJECTED";

                    return (
                      <div
                        key={stageDef.key}
                        className={`p-5 rounded-xl border transition-all space-y-4 ${
                          isApproved
                            ? "bg-emerald-50/30 border-emerald-200"
                            : isRevision
                            ? "bg-amber-50/30 border-amber-200"
                            : isRejected
                            ? "bg-rose-50/30 border-rose-200"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {/* Stage Card Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                              {stageDef.stepNumber}
                            </span>
                            <h3 className="font-black text-slate-900 text-sm">{stageDef.title}</h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {stageDef.badgeTrl}
                            </span>
                          </div>

                          {/* Industry Verdict Badge */}
                          <div className="flex items-center gap-2">
                            {isApproved && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> CSR Signoff Approved
                              </span>
                            )}
                            {isRevision && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-700" /> Revision Requested
                              </span>
                            )}
                            {isRejected && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-700" /> Rejected
                              </span>
                            )}
                            {!industrySignoff && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300">
                                <Clock className="w-3.5 h-3.5 text-slate-500" /> Pending Evaluation
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">{stageDef.description}</p>

                        {/* Existing Signoffs for this stage */}
                        {stageSignoffs.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-slate-100">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">
                              Recorded Digital Signatures ({stageSignoffs.length})
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {stageSignoffs.map((s) => (
                                <div
                                  key={s.id}
                                  className="p-3 bg-white rounded-lg border border-slate-200/80 shadow-2xs space-y-1.5 text-xs"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-900">{s.approverName || "Authorized Signer"}</span>
                                    <span
                                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                        s.approvalStatus === "APPROVED"
                                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                          : s.approvalStatus === "CHANGES_REQUESTED"
                                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                                          : "bg-rose-50 text-rose-700 border border-rose-200"
                                      }`}
                                    >
                                      {s.approvalStatus.replace(/_/g, " ")}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-mono">
                                    Role: {s.approverRole.replace(/_/g, " ")}
                                    {s.signedAt && ` • ${new Date(s.signedAt).toLocaleDateString()}`}
                                  </div>
                                  {s.remarks && (
                                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 italic">
                                      "{s.remarks}"
                                    </p>
                                  )}
                                  {s.digitalSignatureHash && (
                                    <div className="text-[9px] font-mono text-slate-400">
                                      Hash: {s.digitalSignatureHash}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Industry Action Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200/60">
                          <span className="text-[11px] text-slate-500 font-medium">
                            {isApproved
                              ? "You have already authorized this stage. You may update your sign-off or revision request at any time."
                              : "Review technical evidence and submit corporate CSR evaluation verdict:"}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSignoffModalTarget({
                                  stage: stageDef.key,
                                  stageTitle: stageDef.title,
                                  action: "APPROVE",
                                });
                                setSignoffRemarks("Technical deliverables for this stage have been satisfactorily verified.");
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>{isApproved ? "Update Approval" : "Approve Stage"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSignoffModalTarget({
                                  stage: stageDef.key,
                                  stageTitle: stageDef.title,
                                  action: "REQUEST_REVISION",
                                });
                                setSignoffRemarks("");
                              }}
                              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs rounded-lg transition-all cursor-pointer"
                            >
                              Request Changes
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSignoffModalTarget({
                                  stage: stageDef.key,
                                  stageTitle: stageDef.title,
                                  action: "REJECT",
                                });
                                setSignoffRemarks("");
                              }}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-lg transition-all cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: TESTING OUTCOMES & TRL PROGRESSION */}
          {activeTab === "testing" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-900">
                      Laboratory &amp; Field Test Outcomes (TRL 1–9)
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 border border-blue-300">
                      Live Testbed Registry
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Record bench calibrations, stress tests, simulation models, and field trials across Jharkhand blocks.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={loadTestResults}
                    disabled={isLoadingTests}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTests ? "animate-spin" : ""}`} />
                    <span>Refresh Tests</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      resetTestForm();
                      setIsLogTestModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Log Test Result</span>
                  </button>
                </div>
              </div>

              {/* TRL Progression Meter Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white border border-blue-800/40 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
                      Technology Readiness Level (TRL) Maturity Ladder
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 rounded-full font-mono text-xs font-bold">
                    <span>Highest Verified:</span>
                    <strong className="text-white text-sm">TRL {highestTrl} / 9</strong>
                  </div>
                </div>

                {/* Interactive TRL Level Steps */}
                <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5 pt-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => {
                    const isReached = lvl <= highestTrl;
                    const isCurrent = lvl === highestTrl;
                    return (
                      <div
                        key={lvl}
                        className={`p-2 rounded-lg text-center transition-all ${
                          isCurrent
                            ? "bg-cyan-500 text-slate-950 font-black shadow-md ring-2 ring-cyan-300"
                            : isReached
                            ? "bg-white/20 text-white font-bold"
                            : "bg-white/5 text-slate-500 border border-white/5"
                        }`}
                      >
                        <div className="text-[10px] uppercase block opacity-80">TRL</div>
                        <div className="text-sm font-mono font-black">{lvl}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-[11px] text-slate-300">
                  <span>TRL 1–3: Basic Research &amp; Concept</span>
                  <span>TRL 4–5: Lab Validation</span>
                  <span>TRL 6–7: Testbed Field Pilot</span>
                  <span>TRL 8–9: Commercial Handover</span>
                </div>
              </div>

              {/* Test Outcomes List */}
              {isLoadingTests ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span>Loading recorded testing outcomes...</span>
                </div>
              ) : testResults.length === 0 ? (
                <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">No test outcomes logged yet for this project</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Click <strong>"Log Test Result"</strong> to record laboratory calibrations, stress analysis, or rural field trial benchmarks.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {testResults.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-slate-300 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.passStatus
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                                : "bg-rose-50 text-rose-800 border border-rose-300"
                            }`}
                          >
                            {t.passStatus ? "✓ PASSED / VERIFIED" : "✕ FAILED / REVISION"}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            TRL Level {t.trlLevel}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {t.testType.replace(/_/g, " ")}
                          </span>
                        </div>

                        <span className="text-slate-400 font-mono text-[11px]">
                          {t.testDate ? `Test Date: ${new Date(t.testDate).toLocaleDateString()}` : "Date: Pending"}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{t.testTitle}</h3>
                        {t.testLocation && (
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Testbed Location: <strong>{t.testLocation}</strong>
                            {t.testerName && ` • Evaluator: ${t.testerName}`}
                          </div>
                        )}
                      </div>

                      {t.observationsNotes && (
                        <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 text-slate-700">
                          <strong className="text-slate-900 block mb-0.5">Technical Observations:</strong>
                          <p className="leading-relaxed">{t.observationsNotes}</p>
                        </div>
                      )}

                      {t.metricsDataJson && (
                        <div className="text-[11px] font-mono bg-slate-900 text-emerald-400 p-2.5 rounded-lg overflow-x-auto">
                          <span className="text-[9px] text-slate-400 uppercase block mb-1">Telemetry &amp; Sensor Metrics Data:</span>
                          <pre className="whitespace-pre-wrap">{t.metricsDataJson}</pre>
                        </div>
                      )}

                      {t.testReportDocumentUrl && (
                        <div className="pt-2 border-t border-slate-100 text-xs">
                          <a
                            href={t.testReportDocumentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1"
                          >
                            <span>View Full Verification Lab Report ↗</span>
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sub Modals */}
      {isLogTestModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-300 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">Log Test Outcome &amp; TRL Verification</h3>
                <p className="text-xs text-slate-500 mt-0.5">Record lab benchmark or field testbed trial performance data.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsLogTestModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLogTestResult} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Test Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Subsurface LoRaWAN SNR & Soil Moisture Calibration Test"
                  value={newTestTitle}
                  onChange={(e) => setNewTestTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Test Category</label>
                  <select
                    value={newTestType}
                    onChange={(e) => setNewTestType(e.target.value as TestType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-white text-slate-800 font-medium"
                  >
                    <option value="LAB_BENCH_TEST">Lab Bench Test</option>
                    <option value="SIMULATION_ANALYSIS">Simulation Analysis</option>
                    <option value="CONTROLLED_FIELD_TRIAL">Controlled Field Trial</option>
                    <option value="STRESS_LOAD_TEST">Stress &amp; Load Test</option>
                    <option value="USER_ACCEPTANCE_TEST">User Acceptance Test</option>
                    <option value="SAFETY_COMPLIANCE_AUDIT">Safety Compliance Audit</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Verification Outcome</label>
                  <select
                    value={newPassStatus ? "PASS" : "FAIL"}
                    onChange={(e) => setNewPassStatus(e.target.value === "PASS")}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-white font-bold text-slate-800"
                  >
                    <option value="PASS">✓ PASSED / VERIFIED</option>
                    <option value="FAIL">✕ FAILED / REVISION NEEDED</option>
                  </select>
                </div>
              </div>

              {/* TRL Level Slider */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Assigned TRL Level:</span>
                  <span className="font-mono font-black text-sm text-blue-700">TRL {newTrlLevel} / 9</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="9"
                  step="1"
                  value={newTrlLevel}
                  onChange={(e) => setNewTrlLevel(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="text-[11px] text-slate-600 italic">
                  {newTrlLevel <= 3
                    ? "TRL 1–3: Analytical & experimental proof of concept"
                    : newTrlLevel <= 5
                    ? "TRL 4–5: Component validation in simulated lab environment"
                    : newTrlLevel <= 7
                    ? "TRL 6–7: Prototype demonstration in live rural/urban testbed"
                    : "TRL 8–9: Actual system qualified and commercially deployable"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Test Date</label>
                  <input
                    type="date"
                    value={newTestDate}
                    onChange={(e) => setNewTestDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Testbed Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Khunti Millet Cluster"
                    value={newTestLocation}
                    onChange={(e) => setNewTestLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Technical Observations &amp; Notes</label>
                <textarea
                  rows={3}
                  placeholder="Summarize calibration values, sensor accuracy, packet loss ratios, or test anomalies..."
                  value={newObservations}
                  onChange={(e) => setNewObservations(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Telemetry Metrics JSON (Optional)</label>
                <input
                  type="text"
                  placeholder='e.g. {"packetLoss": "0.2%", "batteryVoltage": "3.6V", "snr": "+9.4dB"}'
                  value={newMetricsJson}
                  onChange={(e) => setNewMetricsJson(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Test Report URL / Storage Link (Optional)</label>
                <input
                  type="text"
                  placeholder="https://jharkhand.gov.in/reports/testbed-report-01.pdf"
                  value={newTestReportUrl}
                  onChange={(e) => setNewTestReportUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsLogTestModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTest}
                  className="px-5 py-2 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {isSubmittingTest && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmittingTest ? "Saving Result..." : "Save Test Outcome"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {signoffModalTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-300 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900">
                    {signoffModalTarget.action === "APPROVE"
                      ? "Authorize Stage Approval"
                      : signoffModalTarget.action === "REQUEST_REVISION"
                      ? "Request Revision / Changes"
                      : "Reject Stage Deliverables"}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-bold">
                  {signoffModalTarget.stageTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSignoffModalTarget(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitSignoff} className="space-y-4">
              {/* Signer Identity Badge */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Signer Authority</span>
                <div className="font-bold text-slate-900">
                  {user?.name || "Corporate Lead"} • {user?.orgName || "Industry CSR Partner"}
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  Role: INDUSTRY_CSR_ADMIN • Stage: {signoffModalTarget.stage}
                </div>
              </div>

              {/* Action Verdict Banner */}
              <div
                className={`p-3 rounded-lg border text-xs ${
                  signoffModalTarget.action === "APPROVE"
                    ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                    : signoffModalTarget.action === "REQUEST_REVISION"
                    ? "bg-amber-50 text-amber-900 border-amber-200"
                    : "bg-rose-50 text-rose-900 border-rose-200"
                }`}
              >
                <strong>Decision Verdict: </strong>
                {signoffModalTarget.action === "APPROVE"
                  ? "APPROVE — Deliverables meet industry milestones."
                  : signoffModalTarget.action === "REQUEST_REVISION"
                  ? "CHANGES REQUESTED — Requires modifications before next tranche unlock."
                  : "REJECTED — Deliverables fail acceptance criteria."}
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Evaluation Remarks / Technical Feedback{" "}
                  {signoffModalTarget.action !== "APPROVE" ? "*" : "(Optional)"}
                </label>
                <textarea
                  rows={4}
                  required={signoffModalTarget.action !== "APPROVE"}
                  placeholder={
                    signoffModalTarget.action === "APPROVE"
                      ? "Add verification notes or tranche release authorization remarks..."
                      : "Describe specific shortcomings, needed lab tests, or documentation required..."
                  }
                  value={signoffRemarks}
                  onChange={(e) => setSignoffRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-emerald-500 text-slate-900"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={signoffAcknowledged}
                    onChange={(e) => setSignoffAcknowledged(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] text-slate-600 leading-snug">
                    I certify that I am authorized by <strong>{user?.orgName || "my enterprise"}</strong> to execute this digital lifecycle sign-off for Jharkhand CSR State Innovation Portal.
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSignoffModalTarget(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSignoff || !signoffAcknowledged}
                  className={`px-5 py-2 rounded-lg font-bold text-white shadow-xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 ${
                    signoffModalTarget.action === "APPROVE"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : signoffModalTarget.action === "REQUEST_REVISION"
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {isSubmittingSignoff && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>
                    {isSubmittingSignoff
                      ? "Digitally Signing..."
                      : signoffModalTarget.action === "APPROVE"
                      ? "Confirm & Sign Approval"
                      : "Submit Evaluation"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {reviewMilestoneTarget && (
        <ReviewMilestoneModal
          milestone={reviewMilestoneTarget}
          pilotTitle={pilot.title}
          universityName={pilot.universityName}
          isOpen={true}
          onClose={() => setReviewMilestoneTarget(null)}
          onSubmit={(payload) => onReviewMilestone(pilot.id, reviewMilestoneTarget.id, payload)}
        />
      )}

      {releaseTrancheTarget && (
        <ReleaseDisbursementModal
          disbursement={releaseTrancheTarget}
          pilotTitle={pilot.title}
          universityName={pilot.universityName}
          isOpen={true}
          onClose={() => setReleaseTrancheTarget(null)}
          onSubmit={(payload) => onReleaseDisbursement(pilot.id, payload)}
        />
      )}

      {isUploadOpen && (
        <UploadPilotDocumentModal
          pilotId={pilot.id}
          pilotTitle={pilot.title}
          isOpen={true}
          onClose={() => setIsUploadOpen(false)}
          onUpload={onUploadDocument}
        />
      )}

      {/* Draft Agreement Modal */}
      {isCreateAgreementOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-300 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-black text-slate-900">Draft New Co-Development Agreement</h3>
              <button
                type="button"
                onClick={() => setIsCreateAgreementOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Agreement Title</label>
                <input
                  type="text"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Agreement Type</label>
                  <select
                    value={draftType}
                    onChange={(e) => setDraftType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold outline-none focus:border-indigo-500"
                  >
                    <option value="MOU">MOU (Memorandum of Understanding)</option>
                    <option value="LOI">LOI (Letter of Intent)</option>
                    <option value="TRIPARTITE">Tripartite Agreement</option>
                    <option value="IP_LICENSING">IP Licensing Instrument</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Industry IP Share: {draftIndustrySplit}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={draftIndustrySplit}
                    onChange={(e) => setDraftIndustrySplit(Number(e.target.value))}
                    className="w-full mt-2"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Industry: {draftIndustrySplit}%</span>
                    <span>Univ: {100 - draftIndustrySplit}%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Scope &amp; Technology Deliverables</label>
                <textarea
                  rows={3}
                  value={draftScope}
                  onChange={(e) => setDraftScope(e.target.value)}
                  placeholder="Define scope of joint testing, IP co-ownership, and publication rights..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-normal outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsCreateAgreementOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!draftTitle.trim()) {
                    alert("Please enter agreement title");
                    return;
                  }
                  const newAgreement = {
                    id: Date.now(),
                    agreementTitle: draftTitle,
                    agreementType: draftType,
                    status: "DRAFT" as const,
                    ipSplitIndustry: draftIndustrySplit,
                    ipSplitUniversity: 100 - draftIndustrySplit,
                    scopeDescription: draftScope,
                  };
                  setAgreements(prev => [newAgreement, ...prev]);
                  setIsCreateAgreementOpen(false);
                  setDraftScope("");
                }}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-bold text-white shadow-xs cursor-pointer"
              >
                Create Agreement Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
