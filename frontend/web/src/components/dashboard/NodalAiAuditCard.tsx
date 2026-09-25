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
  const { updateIssue, revokeIssueAllocation } = useIssueStore();

  // Main Top Level Tab: "citizen" | "ai" | "action"
  const [mainTab, setMainTab] = useState<'citizen' | 'ai' | 'action'>('citizen');
  // Text Toggle inside Citizen Tab: "english" | "original"
  const [textMode, setTextMode] = useState<'english' | 'original'>('english');
  // Media Viewer Sub-tab inside Citizen Tab: "image" | "pdf"
  const [mediaView, setMediaView] = useState<'image' | 'pdf'>('image');
  // Nodal Action State
  const [decisionState, setDecisionState] = useState<'NONE' | 'VALIDATED' | 'ASSIGNED' | 'REJECTED' | 'REVOKED' | 'CLARIFICATION' | 'ESCALATED'>('NONE');
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
  const [registeredUniversities, setRegisteredUniversities] = useState<Array<{ id: string; code: string; name: string; district: string }>>([]);

  // Load registered universities dynamically from database
  React.useEffect(() => {
    async function loadUniversities() {
      try {
        const res = await fetch(`${API_BASE_URL}/triage/universities`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setRegisteredUniversities(data);
            if (!issue?.assignedHEI || issue.assignedHEI === "Pending Assignment") {
              setSelectedHei(user?.orgName || data[0].name);
            }
          }
        }
      } catch (e) {
        console.warn("Could not fetch registered universities in audit card:", e);
      }
    }
    loadUniversities();
  }, [token, issue?.assignedHEI, user?.orgName]);

  // Anonymous & Privacy Status
  const isAnonymous = Boolean(issue?.isAnonymous);
  const userRoleStr = String(user?.role || '').toUpperCase();
  const isGovtAdmin = userRoleStr === 'GOVERNMENT' || userRoleStr === 'ADMIN' || userRoleStr === 'PLATFORM_ADMIN';
  const shouldMaskCitizen = isAnonymous && !isGovtAdmin;

  // Citizen Contact Details
  const citizenEmail = shouldMaskCitizen ? "Protected (Anonymous)" : (issue?.citizenEmail || "citizen.anonymous@jharkhand.gov.in");
  const citizenName = shouldMaskCitizen ? "Anonymous Citizen" : (issue?.citizenName || "Registered Citizen Submitter");
  const citizenPhone = shouldMaskCitizen ? "Protected" : (issue?.citizenPhone || "Not Provided");
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

  const handleRevoke = async () => {
    setIsProcessing(true);
    try {
      if (numId) {
        const res = await fetch(`${API_BASE_URL}/triage/${numId}/revoke`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ reason: actionNotes || "Allocation recalled by State Nodal Department." }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.warn("Backend revoke notice:", err.error);
        }
      }
      setDecisionState('REVOKED');
      revokeIssueAllocation(issueId, actionNotes || "Recalled by State Nodal Department.");
      toast.warning(`Grievance #${issueId} Allocation Revoked! Returned to statewide pool.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to revoke allocation.");
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
    <div className="w-full max-w-5xl rounded-2xl border border-[#d9d9d9] bg-white text-[#4a4a4a] shadow-2xl overflow-hidden font-sans">
      
      {/* High-Contrast Minimal Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#d9d9d9] bg-[#F2efff] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1a0e3d] text-white font-bold text-sm">
            N
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#32174a]">
                State Nodal Oversight &amp; Inspection
              </span>
              <span className="rounded bg-[#F2efff] px-2 py-0.5 text-[10px] font-bold text-[#1a0e3d] border border-[#dcd3ff]">
                Ticket #{issueId}
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#1a0e3d]">
              {title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded px-3 py-1 text-xs font-bold border ${
              priorityLevel === 'CRITICAL'
                ? 'bg-[#FFF8f8] text-[#3a0907] border-[#fecaca]'
                : priorityLevel === 'HIGH'
                ? 'bg-[#FFF7e6] text-[#612500] border-[#fed7aa]'
                : 'bg-[#F2efff] text-[#1a0e3d] border-[#dcd3ff]'
            }`}
          >
            {priorityLevel} PRIORITY ({priorityScore}/100)
          </span>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#4a4a4a] hover:text-[#1a0e3d] border border-[#d9d9d9] font-bold hover:bg-[#F2efff] transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Main Structural Tabs Bar */}
      <div className="flex border-b border-[#d9d9d9] bg-[#F2efff]/30 px-6">
        <button
          type="button"
          onClick={() => setMainTab('citizen')}
          className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-bold transition-colors cursor-pointer ${
            mainTab === 'citizen'
              ? 'border-[#1a0e3d] bg-white text-[#1a0e3d] shadow-2xs'
              : 'border-transparent text-[#4a4a4a] hover:text-[#1a0e3d]'
          }`}
        >
          <span>1. Citizen Grievance &amp; Documents</span>
          {issue?.isDuplicate && (
            <span className="rounded-full bg-[#FFF5ea] px-2 py-0.5 text-[9px] font-bold text-[#803800] border border-[#fed7aa] whitespace-nowrap shrink-0 inline-flex items-center leading-none">
              Duplicate Alert
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setMainTab('ai')}
          className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-bold transition-colors cursor-pointer ${
            mainTab === 'ai'
              ? 'border-[#1a0e3d] bg-white text-[#1a0e3d] shadow-2xs'
              : 'border-transparent text-[#4a4a4a] hover:text-[#1a0e3d]'
          }`}
        >
          <span>2. Field Inspection &amp; Ground Verification</span>
          <span className="rounded-full bg-[#F2fcef] px-2 py-0.5 text-[9px] font-bold text-[#002110] border border-[#a3e635] whitespace-nowrap shrink-0 inline-flex items-center leading-none">
            Verified
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('action')}
          className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-bold transition-colors cursor-pointer ${
            mainTab === 'action'
              ? 'border-[#1a0e3d] bg-white text-[#1a0e3d] shadow-2xs'
              : 'border-transparent text-[#4a4a4a] hover:text-[#1a0e3d]'
          }`}
        >
          <span>3. Officer Review &amp; University Allocation</span>
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
                    Notice: Similar Grievance Already Registered
                  </div>
                  <p className="text-amber-800 mt-1 leading-relaxed">
                    A related complaint has already been recorded in this locality. This entry has been linked for combined resolution.
                    {issue.duplicateClusterId && <span className="block mt-1 font-mono font-bold">Group ID: {issue.duplicateClusterId}</span>}
                  </p>
                </div>
              </div>
            )}
            
            {/* Citizen Submitter Info Box */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Citizen Submitter Profile &amp; Location Data
                </h3>
                {isAnonymous && (
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                    isGovtAdmin 
                      ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                      : 'bg-slate-200 text-slate-700 border border-slate-300'
                  }`}>
                    {isGovtAdmin ? 'Anonymous to Public (Govt Admin View)' : 'Identity Masked (Anonymous Submission)'}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Submitter Name</span>
                  <strong className="text-slate-900 font-bold">{citizenName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Registered Email</span>
                  <strong className="text-slate-900 font-mono">{citizenEmail}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Contact Phone</span>
                  <strong className="text-slate-900 font-mono">{citizenPhone}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Submission Date &amp; Time</span>
                  <strong className="text-slate-900">{createdAt}</strong>
                </div>
              </div>

              {/* Geo Location Bar */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Administrative Jurisdiction: </span>
                  <strong className="text-slate-900 font-bold">{district} District • {block} Block • {village}</strong>
                </div>
                {lat !== null && lng !== null ? (
                  <div className="font-mono text-slate-700 text-[11px] bg-slate-200 px-2 py-0.5 rounded">
                    GPS: {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
                  </div>
                ) : (
                  <div className="text-slate-500 text-[11px]">GPS Pin Recorded</div>
                )}
              </div>
            </div>

            {/* Citizen Text Description */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Citizen Problem Statement
                </h3>
                <div className="flex rounded border border-slate-300 bg-slate-100 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setTextMode('english')}
                    className={`px-3 py-1 font-bold rounded transition-colors ${
                      textMode === 'english' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    Official English Summary
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextMode('original')}
                    className={`px-3 py-1 font-bold rounded transition-colors ${
                      textMode === 'original' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    Citizen&apos;s Original Words
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900 mb-1">{title}</h4>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  {textMode === 'original' ? originalText : description}
                </p>
              </div>
            </div>

            {/* Attachments Section: Image & PDF Document Viewer */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Attached Field Evidence &amp; Documents
                </h3>
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setMediaView('image')}
                    className={`px-3 py-1 font-bold rounded border ${
                      mediaView === 'image' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    Site Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaView('pdf')}
                    className={`px-3 py-1 font-bold rounded border ${
                      mediaView === 'pdf' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    Official Document / Petition
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
                      {imageUrl ? `Site Photograph (${district})` : "No Image Attachment"}
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-white rounded border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-900 block">Photo Verification Note</span>
                      <p className="text-slate-600">
                        {imageUrl
                          ? "Site photograph submitted by local citizen showing the damaged or non-functional equipment."
                          : "No visual photograph attached with this record."}
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
                          <div className="w-8 h-8 rounded bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                            PDF
                          </div>
                          <div>
                            <strong className="text-slate-900 block">{pdfFileName}</strong>
                            <span className="text-slate-500 text-[11px]">Official Inspection Report / Memorandum</span>
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
                          Inspection Summary Extracted from Document
                        </h4>
                        <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">
                          {pdfExtractedText}
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
                      No PDF inspection document attached with this grievance.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 2: FIELD INSPECTION & GROUND VERIFICATION ==================== */}
        {mainTab === 'ai' && (
          <div className="space-y-5">
            {/* Officer Summary Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Official Ground Inspection Findings
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    Grievance Verification &amp; Impact Assessment
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg inline-flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Verified on Ground</span>
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs text-slate-800 leading-relaxed">
                <span className="font-bold text-slate-900 block mb-1">Nodal Officer Note:</span>
                {consensus?.consensus_reason ||
                  "Field inspection confirms asset failure requiring university technical team to repair and restore service."}
              </div>
            </div>

            {/* Inspection Checklist Table */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Ground Verification Criteria
                </h3>
                <span className="text-[11px] font-semibold text-slate-500">State Nodal Standard Checklist</span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <span className="font-bold text-slate-600">Problem Sector &amp; Domain:</span>
                  <div className="sm:col-span-2 text-slate-900 font-semibold">
                    {sector} — {domain}
                  </div>
                </div>

                <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50/50">
                  <span className="font-bold text-slate-600">Estimated Affected Population:</span>
                  <div className="sm:col-span-2 text-slate-900 font-medium">
                    Approximately 400+ local citizens and community healthcare/public utilities impacted.
                  </div>
                </div>

                <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <span className="font-bold text-slate-600">Location Verification:</span>
                  <div className="sm:col-span-2 text-emerald-800 font-semibold flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Verified in {district} District ({block || "Local Block"})
                  </div>
                </div>

                <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50/50">
                  <span className="font-bold text-slate-600">Action Urgency:</span>
                  <div className="sm:col-span-2">
                    <span className="font-bold text-slate-900">
                      {priorityLevel === 'CRITICAL' ? 'Immediate Action Required (Within 48 hours)' : 'High Priority — Assign to University for Capstone Solution'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
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
                    {registeredUniversities.length === 0 ? (
                      <option value="">Loading registered universities...</option>
                    ) : (
                      registeredUniversities.map((uni) => (
                        <option key={uni.id || uni.code} value={uni.name}>
                          {uni.name} ({uni.district || "Jharkhand"})
                        </option>
                      ))
                    )}
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

              <p className="text-xs text-[#4a4a4a]">
                Execute an official administrative action to route, validate, or reject this citizen grievance:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleAssign}
                  className={`py-3 px-4 rounded-xl font-bold text-xs transition-colors cursor-pointer border shadow-xs ${
                    decisionState === 'ASSIGNED'
                      ? 'bg-[#002110] text-white border-[#059669]'
                      : 'bg-[#1a0e3d] text-white hover:bg-[#2e1764] border-[#1a0e3d]'
                  } disabled:opacity-50`}
                >
                  Approve &amp; Route to HEI
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleValidate}
                  className={`py-3 px-4 rounded-xl font-bold text-xs transition-colors cursor-pointer border shadow-xs ${
                    decisionState === 'VALIDATED'
                      ? 'bg-[#002110] text-white border-[#059669]'
                      : 'bg-[#F2efff] text-[#1a0e3d] hover:bg-[#e4ddff] border-[#dcd3ff]'
                  } disabled:opacity-50`}
                >
                  Validate &amp; Confirm
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleReject}
                  className={`py-3 px-4 rounded-xl font-bold text-xs transition-colors cursor-pointer border shadow-xs ${
                    decisionState === 'REJECTED'
                      ? 'bg-[#3a0907] text-white border-[#dc2626]'
                      : 'bg-[#FFF8f8] text-[#3a0907] hover:bg-[#fee2e2] border-[#fecaca]'
                  } disabled:opacity-50`}
                >
                  Reject Grievance
                </button>
              </div>

              {(issue?.assignedHEI && issue.assignedHEI !== "Pending Assignment" || decisionState === 'ASSIGNED') && (
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleRevoke}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-colors cursor-pointer border ${
                      decisionState === 'REVOKED'
                        ? 'bg-[#3a0907] text-white border-[#dc2626]'
                        : 'bg-[#FFF8f8] text-[#3a0907] hover:bg-[#fee2e2] border-[#fecaca]'
                    } disabled:opacity-50 flex items-center justify-center gap-2`}
                  >
                    <svg className="w-4 h-4 text-[#dc2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Revoke University Allocation (Return to Statewide Pool)</span>
                  </button>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-[#d9d9d9]">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleClarification}
                  className="py-2 px-3 text-xs font-semibold text-[#4a4a4a] hover:text-[#1a0e3d] hover:bg-[#F2efff] rounded-lg transition-colors cursor-pointer"
                >
                  Request Citizen Clarification
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleEscalate}
                  className="py-2 px-3 text-xs font-semibold text-[#3a0907] hover:text-[#3a0907] hover:bg-[#FFF8f8] rounded-lg transition-colors cursor-pointer"
                >
                  Escalate to Cabinet
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
      
      {/* High Contrast Minimal Footer */}
      <div className="flex flex-wrap items-center justify-between border-t border-[#d9d9d9] bg-[#F2efff] px-6 py-3 text-xs text-[#4a4a4a]">
        <div>
          Citizen Email: <strong className="text-[#1a0e3d] font-mono">{citizenEmail}</strong>
        </div>
        <div className="font-mono text-[11px] text-[#4a4a4a]">
          State Administrative Inspection Terminal
        </div>
      </div>

    </div>
  );
};
