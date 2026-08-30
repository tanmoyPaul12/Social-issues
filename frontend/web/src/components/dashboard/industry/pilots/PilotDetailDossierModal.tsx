"use client";

import React, { useState } from "react";
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

interface PilotDetailDossierModalProps {
  detail: ActivePilotDetail;
  isOpen: boolean;
  initialTab?: "milestones" | "disbursements" | "discussions" | "documents";
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
  const [activeTab, setActiveTab] = useState<"milestones" | "disbursements" | "discussions" | "documents">(initialTab);

  // Sub-modals
  const [reviewMilestoneTarget, setReviewMilestoneTarget] = useState<Milestone | null>(null);
  const [releaseTrancheTarget, setReleaseTrancheTarget] = useState<DisbursementTranche | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);

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
        </div>
      </div>

      {/* Sub Modals */}
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
    </div>
  );
}
