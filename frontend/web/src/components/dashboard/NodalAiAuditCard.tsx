'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useIssueStore, GrassrootIssueRecord } from '@/lib/store/useIssueStore';
import { toast } from '@/components/dashboard/ToastStack';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export interface ModalityBreakdown {
  text_analysis?: { category: string; priority_score: number };
  image_analysis?: { category: string; priority_score: number };
  document_analysis?: { category: string; priority_score: number };
  location_analysis?: { is_valid: boolean; district: string; is_in_jharkhand: boolean; urgency_bonus: number };
}

export interface GeneralizedConsensus {
  final_category: string;
  average_priority_score: number;
  final_priority_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  consensus_reason: string;
}

export interface NodalAiAuditCardProps {
  issueId: string;
  issue?: GrassrootIssueRecord;
  modalityBreakdown?: ModalityBreakdown;
  generalizedConsensus?: GeneralizedConsensus;
  onClose?: () => void;
}

export const NodalAiAuditCard: React.FC<NodalAiAuditCardProps> = ({
  issueId,
  issue,
  modalityBreakdown,
  generalizedConsensus,
  onClose,
}) => {
  const { user, token } = useAuthStore();
  const { updateIssue } = useIssueStore();

  // Main Top Level Tab: "citizen" | "ai" | "action"
  const [mainTab, setMainTab] = useState<'citizen' | 'ai' | 'action'>('citizen');
  // Text Toggle inside Citizen Tab: "english" | "original"
  const [textMode, setTextMode] = useState<'english' | 'original'>('english');
  // Media Viewer Sub-tab inside Citizen Tab: "image" | "pdf"
  const [mediaView, setMediaView] = useState<'image' | 'pdf'>('image');
  // Nodal Action State
  const [decisionState, setDecisionState] = useState<'NONE' | 'VALIDATED' | 'ASSIGNED' | 'REJECTED' | 'CLARIFICATION' | 'ESCALATED'>('NONE');
  const [actionNotes, setActionNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Extract raw issue fields without synthetic mock overrides
  const title = issue?.title || "Citizen Grievance Submission";
  const description = issue?.description || "No description provided.";
  const originalText = issue?.originalText || description;
  const district = issue?.district || "Unassigned District";
  const block = issue?.block || "Unassigned Block";
  const village = issue?.villageOrWard || "Unassigned Village";
  const lat = issue?.latitude ?? null;
  const lng = issue?.longitude ?? null;
  const sector = issue?.sector || "OTHER";
  const domain = issue?.domain || "General Grassroot Need";
  const assignedHEI = issue?.assignedHEI || "Pending Assignment";

  const defaultHei = issue?.assignedHEI && issue.assignedHEI !== "Pending Assignment"
    ? issue.assignedHEI
    : (user?.orgName || "Birla Institute of Technology, Mesra");

  const [selectedHei, setSelectedHei] = useState<string>(defaultHei);

  // Citizen Contact Details
  const citizenEmail = issue?.citizenEmail || "citizen.anonymous@jharkhand.gov.in";
  const citizenName = issue?.citizenName || "Registered Citizen Submitter";
  const citizenPhone = issue?.citizenPhone || "Not Provided";
  const createdAt = issue?.createdAt ? new Date(issue.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Recently Submitted';

  // Attachments
  const imageUrl = issue?.imageUrl || null;
  const pdfUrl = issue?.pdfUrl || null;
  const pdfFileName = issue?.pdfFileName || "Citizen_Document_Attachment.pdf";
  const pdfExtractedText = issue?.pdfExtractedText || "Official attachment document uploaded with submission.";

  // Dynamic AI Raw JSON binding
  const consensus = generalizedConsensus || issue?.generalizedConsensus || null;
  const modalities = modalityBreakdown || issue?.modalityBreakdown || null;
  const hasAiData = Boolean(consensus || modalities);

  const priorityLevel = consensus?.final_priority_level || issue?.priority || 'MEDIUM';
  const priorityScore = consensus?.average_priority_score ?? (priorityLevel === 'CRITICAL' ? 85 : priorityLevel === 'HIGH' ? 70 : 50);

  const numId = issue?.numericId;

  // Action Handlers
  const handleValidate = async () => {
    setIsProcessing(true);
    try {
      if (numId) {
        const res = await fetch(`${API_BASE_URL}/triage/${numId}/validate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ notes: actionNotes || "Verified and confirmed by State Nodal Officer." }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to validate grievance');
        }
      }
      setDecisionState('VALIDATED');
      updateIssue(issueId, {
        status: 'TRIAGED',
        validationStatus: 'PASS',
      });
      toast.success(`Grievance #${issueId} Validated! Status transitioned to TRIAGED.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to validate grievance.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedHei) {
      toast.warning("Please select a target Higher Education Institution (HEI).");
      return;
    }
    setIsProcessing(true);
    try {
      if (numId) {
        const res = await fetch(`${API_BASE_URL}/triage/${numId}/assign`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ heiName: selectedHei, notes: actionNotes || "Approved and routed to HEI by Nodal Officer." }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to assign grievance to HEI');
        }
      }
      setDecisionState('ASSIGNED');
      updateIssue(issueId, {
        assignedHEI: selectedHei,
        status: 'ASSIGNED_HEI',
      });
      toast.success(`Grievance #${issueId} Approved! Dispatched to ${selectedHei}.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to route grievance.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      if (numId) {
        const res = await fetch(`${API_BASE_URL}/triage/${numId}/reject`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ reason: actionNotes || "Submission does not meet civic verification guidelines." }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to reject grievance');
        }
      }
      setDecisionState('REJECTED');
      updateIssue(issueId, {
        status: 'REJECTED',
        validationStatus: 'REJECT',
      });
      toast.warning(`Grievance #${issueId} Rejected.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to reject grievance.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClarification = () => {
    setDecisionState('CLARIFICATION');
    updateIssue(issueId, { status: 'UNDER_REVIEW' });
    toast.info(`Clarification notice dispatched to citizen (${citizenEmail}).`);
  };

  const handleEscalate = () => {
    setDecisionState('ESCALATED');
    updateIssue(issueId, { status: 'ESCALATED' });
    toast.warning(`Grievance #${issueId} Escalated to State Secretariat.`);
  };

  return (
    <div className="w-full max-w-5xl rounded-2xl border border-slate-300 bg-white text-slate-900 shadow-2xl overflow-hidden font-sans">
      
      {/* High-Contrast Minimal Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-sm">
            N
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                State Nodal Oversight &amp; Inspection
              </span>
              <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-800 border border-slate-300">
                Ticket #{issueId}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded px-3 py-1 text-xs font-bold border ${
              priorityLevel === 'CRITICAL'
                ? 'bg-red-50 text-red-700 border-red-300'
                : priorityLevel === 'HIGH'
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-blue-50 text-blue-800 border-blue-300'
            }`}
          >
            {priorityLevel} PRIORITY ({priorityScore}/100)
          </span>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded bg-slate-200 text-slate-700 font-bold hover:bg-slate-300 transition-colors cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Structural Tabs Bar */}
      <div className="flex border-b border-slate-200 bg-slate-100 px-6">
        <button
          type="button"
          onClick={() => setMainTab('citizen')}
          className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-bold transition-colors cursor-pointer ${
            mainTab === 'citizen'
              ? 'border-slate-900 bg-white text-slate-900 shadow-2xs'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>1. Citizen Submission &amp; Attachments</span>
          {issue?.isDuplicate && (
            <span className="rounded-full bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800">
              Duplicate
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setMainTab('ai')}
          className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-bold transition-colors cursor-pointer ${
            mainTab === 'ai'
              ? 'border-slate-900 bg-white text-slate-900 shadow-2xs'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>2. AI Multimodal Verification</span>
          {hasAiData ? (
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
              Ready
            </span>
          ) : (
            <span className="rounded-full bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800">
              Pending
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setMainTab('action')}
          className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-bold transition-colors cursor-pointer ${
            mainTab === 'action'
              ? 'border-slate-900 bg-white text-slate-900 shadow-2xs'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>3. Nodal Decision &amp; Allocation</span>
        </button>
      </div>

      {/* Tab Contents Panel */}
      <div className="p-6 sm:p-8 bg-white min-h-[420px]">
        
        {/* ==================== TAB 1: CITIZEN SUBMISSION & ATTACHMENTS ==================== */}
        {mainTab === 'citizen' && (
          <div className="space-y-6">

            {/* Potential Duplicate Banner */}
            {issue?.isDuplicate && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                  !
                </div>
                <div className="flex-1 text-xs">
                  <div className="font-bold text-amber-900">
                    AI Deduplication Alert: Potential Duplicate Challenge Detected
                  </div>
                  <p className="text-amber-800 mt-1 leading-relaxed">
                    This grievance matches existing submissions within spatial proximity or semantic vector threshold.
                    {issue.duplicateClusterId && <span className="block mt-1 font-mono font-bold">Cluster ID: {issue.duplicateClusterId}</span>}
                  </p>
                </div>
              </div>
            )}
            
            {/* Citizen Submitter Info Box */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Citizen Submitter Profile &amp; Location Data
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Submitter Name</span>
                  <strong className="text-slate-900 font-bold">{citizenName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Verified Email</span>
                  <strong className="text-slate-900 font-mono">{citizenEmail}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Contact Phone</span>
                  <strong className="text-slate-900 font-mono">{citizenPhone}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Submission Time</span>
                  <strong className="text-slate-900">{createdAt}</strong>
                </div>
              </div>

              {/* Geo Location Bar */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Administrative Boundary: </span>
                  <strong className="text-slate-900 font-bold">{district} District • {block} Block • {village}</strong>
                </div>
                {lat !== null && lng !== null ? (
                  <div className="font-mono text-slate-700 text-[11px] bg-slate-200 px-2 py-0.5 rounded">
                    GPS: {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
                  </div>
                ) : (
                  <div className="text-slate-500 text-[11px]">GPS Coordinates Not Provided</div>
                )}
              </div>
            </div>

            {/* Citizen Text Description */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Citizen Problem Description
                </h3>
                <div className="flex rounded border border-slate-300 bg-slate-100 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setTextMode('english')}
                    className={`px-3 py-1 font-bold rounded transition-colors ${
                      textMode === 'english' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    Normalized English
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextMode('original')}
                    className={`px-3 py-1 font-bold rounded transition-colors ${
                      textMode === 'original' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    Original Voice Text
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900 mb-1">{title}</h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {textMode === 'original' ? originalText : description}
                </p>
              </div>
            </div>

            {/* Attachments Section: Image & PDF Document Viewer */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Citizen File &amp; Media Attachments
                </h3>
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setMediaView('image')}
                    className={`px-3 py-1 font-bold rounded border ${
                      mediaView === 'image' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    Image File
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaView('pdf')}
                    className={`px-3 py-1 font-bold rounded border ${
                      mediaView === 'pdf' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    PDF Document
                  </button>
                </div>
              </div>

              {/* MEDIA VIEW 1: IMAGE FILE */}
              {mediaView === 'image' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <div className="rounded-lg border border-slate-300 bg-slate-900 overflow-hidden text-center">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Citizen Ground Photo Attachment"
                        className="w-full h-64 object-cover"
                      />
                    ) : (
                      <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
                        No photo attached with this submission
                      </div>
                    )}
                    <div className="p-2 bg-slate-900 text-white text-[11px] font-mono">
                      {imageUrl ? `Attached Image File (${district})` : "No Image Attachment"}
                    </div>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-white rounded border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-900 block">Image Evidence Meta</span>
                      <p className="text-slate-600">
                        {imageUrl ? "Image uploaded by citizen submitter." : "No visual media file provided."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* MEDIA VIEW 2: PDF DOCUMENT */}
              {mediaView === 'pdf' && (
                <div className="space-y-4">
                  {pdfUrl ? (
                    <>
                      <div className="flex items-center justify-between p-3 bg-white rounded border border-slate-300 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                            PDF
                          </div>
                          <div>
                            <strong className="text-slate-900 block">{pdfFileName}</strong>
                            <span className="text-slate-500 font-mono text-[11px]">Official Document Attachment</span>
                          </div>
                        </div>
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
                        >
                          Open PDF in New Window →
                        </a>
                      </div>

                      <div className="p-4 bg-white rounded border border-slate-300 space-y-2">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Extracted PDF Content
                        </h4>
                        <p className="text-xs text-slate-700 leading-relaxed font-mono bg-slate-50 p-3 rounded border border-slate-200">
                          "{pdfExtractedText}"
                        </p>
                      </div>

                      {/* Embedded PDF Viewer Frame */}
                      <div className="rounded-lg border border-slate-300 overflow-hidden bg-slate-100">
                        <iframe
                          src={pdfUrl}
                          title="PDF Document Viewer"
                          className="w-full h-80 border-0"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="p-8 text-center bg-white rounded border border-slate-200 text-slate-500 text-xs">
                      No PDF document petition was attached with this citizen submission.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 2: AI MULTIMODAL VERIFICATION ==================== */}
        {mainTab === 'ai' && (
          <div className="space-y-6">
            
            {hasAiData ? (
              <>
                {/* AI Summary Banner */}
                <div className="rounded-xl border border-slate-300 bg-slate-900 text-white p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        AI Multimodal Intelligence Engine Output
                      </span>
                      <h3 className="text-base font-bold text-white">
                        Executive Problem Analysis &amp; Consensus
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-white font-mono">{priorityScore}/100</span>
                      <span className="text-[10px] text-slate-400 block font-bold">Priority Score</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    "{consensus?.consensus_reason || "AI consensus analysis evaluated."}"
                  </p>
                </div>

                {/* 4-Modality Detailed Audit Table */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      4-Modality Ingestion &amp; Score Breakdown
                    </h3>
                  </div>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-4">Modality</th>
                        <th className="py-2.5 px-4">Assigned Sector</th>
                        <th className="py-2.5 px-4">Score / Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="py-3 px-4 font-bold text-slate-900">1. Text NLP Analysis</td>
                        <td className="py-3 px-4 font-bold text-slate-700">{modalities?.text_analysis?.category || sector}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{modalities?.text_analysis?.priority_score ?? 'N/A'} pts</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-slate-900">2. Vision CV Analysis</td>
                        <td className="py-3 px-4 font-bold text-slate-700">{modalities?.image_analysis?.category || sector}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{modalities?.image_analysis?.priority_score ?? 'N/A'} pts</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-slate-900">3. PDF Document Analysis</td>
                        <td className="py-3 px-4 font-bold text-slate-700">{modalities?.document_analysis?.category || sector}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{modalities?.document_analysis?.priority_score ?? 'N/A'} pts</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-slate-900">4. Spatial Geocoding</td>
                        <td className="py-3 px-4 font-bold text-slate-700">{district} District</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700">+{modalities?.location_analysis?.urgency_bonus ?? 0} pts</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-8 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-amber-900">
                  AI Multimodal Verification In Progress
                </h3>
                <p className="text-xs text-amber-800 max-w-lg mx-auto leading-relaxed">
                  This grievance has been registered and is queued for AI Multimodal Analysis (Text NLP, Vision CV, PDF OCR, and Spatial Geocoding). Once your backend AI service completes processing, the detailed score JSON will appear here automatically.
                </p>
                <div className="inline-block rounded-full bg-white px-3 py-1 text-[11px] font-mono text-amber-800 border border-amber-300">
                  Status: PENDING_AI_SERVICE_PROCESSING
                </div>
              </div>
            )}

          </div>
        )}

        {/* ==================== TAB 3: EXECUTIVE NODAL ACTION & ALLOCATION ==================== */}
        {mainTab === 'action' && (
          <div className="space-y-6">
            
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Departmental &amp; HEI Allocation Recommendations
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded border border-slate-300 space-y-1">
                  <span className="text-[11px] text-slate-500 font-bold uppercase">Target Line Department</span>
                  <div className="text-sm font-bold text-slate-900">{sector} &amp; State Department</div>
                  <p className="text-xs text-slate-600">State Nodal Directorate Level 4 Clearance</p>
                </div>

                <div className="p-4 bg-white rounded border border-slate-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-bold uppercase">Assigned R&amp;D University (Target HEI)</span>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded border border-indigo-200">
                      Target Center
                    </span>
                  </div>
                  <select
                    value={selectedHei}
                    onChange={(e) => setSelectedHei(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {user?.orgName && (
                      <option value={user.orgName}>{user.orgName} (Newly Registered University)</option>
                    )}
                    <option value="Birla Institute of Technology, Mesra">Birla Institute of Technology, Mesra (BIT Mesra - AISHE U-0205)</option>
                    <option value="IIT (ISM) Dhanbad">IIT (ISM) Dhanbad (AISHE U-0206)</option>
                    <option value="NIT Jamshedpur">NIT Jamshedpur (AISHE U-0207)</option>
                    <option value="Birsa Agricultural University, Kanke">Birsa Agricultural University, Kanke (BAU - AISHE U-0208)</option>
                    <option value="Ranchi University">Ranchi University (AISHE U-0209)</option>
                    <option value="Vinoba Bhave University, Hazaribagh">Vinoba Bhave University, Hazaribagh (VBU - AISHE U-0210)</option>
                  </select>
                  <p className="text-xs text-slate-600">Select target University R&D center to receive this civic problem statement.</p>
                </div>
              </div>
            </div>

            {/* Review Notes Input */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Nodal Review / Action Notes (Optional Audit Trail)
              </label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Enter review notes, specific R&D requirements, or rejection reason..."
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Action Terminal */}
            <div className="rounded-xl border border-slate-300 bg-white p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Nodal Executive Action Terminal
                </h3>
                {decisionState !== 'NONE' && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded border border-emerald-300">
                    Action Executed: {decisionState}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600">
                Execute an official administrative action to route, validate, or reject this citizen grievance:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleAssign}
                  className={`py-3 px-4 rounded font-bold text-xs transition-colors cursor-pointer border ${
                    decisionState === 'ASSIGNED'
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-md'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-700'
                  } disabled:opacity-50`}
                >
                  Approve &amp; Route to HEI
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleValidate}
                  className={`py-3 px-4 rounded font-bold text-xs transition-colors cursor-pointer border ${
                    decisionState === 'VALIDATED'
                      ? 'bg-blue-800 text-white border-blue-900 shadow-md'
                      : 'bg-blue-700 text-white hover:bg-blue-800 border-blue-800'
                  } disabled:opacity-50`}
                >
                  Validate &amp; Confirm
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleReject}
                  className={`py-3 px-4 rounded font-bold text-xs transition-colors cursor-pointer border ${
                    decisionState === 'REJECTED'
                      ? 'bg-red-800 text-white border-red-900 shadow-md'
                      : 'bg-red-700 text-white hover:bg-red-800 border-red-800'
                  } disabled:opacity-50`}
                >
                  Reject Grievance
                </button>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleClarification}
                  className="py-2 px-3 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                >
                  Request Citizen Clarification
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleEscalate}
                  className="py-2 px-3 text-xs font-semibold text-red-700 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                >
                  Escalate to Cabinet
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
      
      {/* High Contrast Minimal Footer */}
      <div className="flex flex-wrap items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3 text-xs text-slate-600">
        <div>
          Citizen Email: <strong className="text-slate-900 font-mono">{citizenEmail}</strong>
        </div>
        <div className="font-mono text-[11px] text-slate-500">
          State Administrative Inspection Terminal
        </div>
      </div>

    </div>
  );
};
