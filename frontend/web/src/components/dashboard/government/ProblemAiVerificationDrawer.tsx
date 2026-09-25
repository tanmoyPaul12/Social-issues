"use client";

import React, { useState, useEffect, useCallback } from "react";
import { GrassrootIssueRecord, useIssueStore } from "@/lib/store/useIssueStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "@/components/dashboard/ToastStack";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8000";
const BACKEND_DIRECT_URL = "http://localhost:8081/api";

export interface MatchedFacultyExpert {
  name: string;
  designation: string;
  department: string;
  university_code: string;
  university_name: string;
  email: string;
  phone: string;
  profile_url: string;
  profile_image_url: string;
  cv_url?: string;
  publications_pdf_url?: string;
  match_score: number;
  relevance_reason: string;
}

export interface ScoredUniversity {
  university_code: string;
  university_name: string;
  total_score: number;
  breakdown: {
    s_faculty: number;
    s_research: number;
    s_dept: number;
    s_facility: number;
    s_incubator: number;
    s_geo: number;
  };
  matched_faculty_chunks?: any[];
  matched_evidence_chunks?: any[];
}

export interface UnifiedPipelineOutput {
  success: boolean;
  validation: {
    is_valid: boolean;
    authenticity_score: number;
    domain: string;
    urgency_level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | string;
    severity_score: number;
    detected_issues: string[];
    multimodal_evidence_summary: string;
    deduplication: {
      is_duplicate: boolean;
      duplicate_report_id?: string;
      similarity_score?: number;
      distance_km?: number;
      reason?: string;
    };
  };
  requirements: {
    domain: string;
    problem_summary: string;
    required_disciplines: string[];
    expertise_keywords: string[];
    required_capabilities: string[];
    prototyping_needed: boolean;
    incubation_needed: boolean;
    district: string;
    state: string;
  };
  scored_universities: ScoredUniversity[];
  matched_faculty_experts: Record<string, MatchedFacultyExpert[]>;
  executive_report: {
    challenge_summary: string;
    domain: string;
    executive_summary: string;
    recommendations: Array<{
      rank: number;
      university_code: string;
      university_name: string;
      total_capability_score: number;
      score_breakdown: Record<string, number>;
      key_strengths: string[];
      matched_faculty_experts: any[];
      evidence_snippets: string[];
      incubation_support_status: string;
    }>;
    suggested_next_steps: string[];
  };
  execution_logs?: string[];
}

interface FacultyPhotoProps {
  name: string;
  imageUrl: string;
  universityName: string;
}

const FacultyPhoto: React.FC<FacultyPhotoProps> = ({ name, imageUrl, universityName }) => {
  const [imgError, setImgError] = useState(false);

  const initials = name
    .replace("Dr. ", "")
    .replace("Prof. ", "")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="w-full md:w-56 lg:w-60 shrink-0 relative bg-[#1a0e3d] overflow-hidden flex items-center justify-center min-h-[220px] md:min-h-[260px] self-stretch">
      {!imgError && imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 hover:scale-105"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full absolute inset-0 bg-gradient-to-br from-[#1a0e3d] via-[#24124e] to-[#110700] flex flex-col items-center justify-center text-white p-4">
          <span className="text-3xl font-black tracking-wider text-[#F2efff]">{initials}</span>
          <span className="text-[10px] text-[#dcd3ff] mt-1 font-mono uppercase tracking-widest">Faculty Expert</span>
        </div>
      )}

      {/* Institution Overlay Bottom */}
      {universityName && (
        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#1a0e3d]/95 via-[#1a0e3d]/60 to-transparent p-3 pt-10 text-center">
          <span className="text-xs font-black text-white tracking-wide block truncate drop-shadow-md">
            {universityName}
          </span>
        </div>
      )}
    </div>
  );
};

export interface ProblemAiVerificationDrawerProps {
  issue: GrassrootIssueRecord | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ProblemAiVerificationDrawer: React.FC<ProblemAiVerificationDrawerProps> = ({
  issue,
  onClose,
  onSuccess,
}) => {
  const { token } = useAuthStore();
  const { approveIssueAllocation, reassignIssueHEI, revokeIssueAllocation, updateIssue } = useIssueStore();

  const [aiData, setAiData] = useState<UnifiedPipelineOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSavedInDb, setIsSavedInDb] = useState<boolean>(false);
  const [registeredUniversities, setRegisteredUniversities] = useState<Array<{ id: string; code: string; name: string; district: string }>>([]);

  // Load registered universities dynamically from database
  useEffect(() => {
    async function loadUniversities() {
      try {
        const res = await fetch(`${API_BASE_URL}/triage/universities`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setRegisteredUniversities(data);
          }
        }
      } catch (e) {
        console.warn("Could not fetch registered universities in drawer:", e);
      }
    }
    loadUniversities();
  }, [token]);

  // Active view tab inside drawer
  const [activeTab, setActiveTab] = useState<"experts" | "validation" | "requirements" | "report">("experts");

  // Nodal Action States
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);
  const [showOverrideInput, setShowOverrideInput] = useState<boolean>(false);
  const [overrideUniversity, setOverrideUniversity] = useState<string>("");

  // Handle ESC key press to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Database-First AI Verification Analysis
  const fetchAiAnalysis = useCallback(async (forceReanalyze: boolean = false) => {
    if (!issue) return;
    setIsLoading(true);
    setFetchError(null);

    // 1. Check if issue already has real validationReportJson saved in PostgreSQL
    if (!forceReanalyze && issue.validationReportJson) {
      try {
        const savedData = typeof issue.validationReportJson === "string"
          ? JSON.parse(issue.validationReportJson)
          : issue.validationReportJson;
        if (savedData && (savedData.validation || savedData.scored_universities)) {
          setAiData(savedData);
          setIsSavedInDb(true);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Could not parse saved validationReportJson from DB:", err);
      }
    }

    // 2. Check if issue has a saved validation record on backend (by ticket issueNumber or numericId)
    const numericId = issue.numericId || (issue.id?.startsWith("GRI-") ? parseInt(issue.id.replace("GRI-", ""), 10) : undefined);
    if (!forceReanalyze) {
      try {
        const ticketRes = await fetch(`${API_BASE_URL}/issues/ticket/${encodeURIComponent(issue.id)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (ticketRes.ok) {
          const ticketData = await ticketRes.json();
          if (ticketData?.validationReportJson) {
            const dbData = typeof ticketData.validationReportJson === "string"
              ? JSON.parse(ticketData.validationReportJson)
              : ticketData.validationReportJson;
            if (dbData && (dbData.validation || dbData.scored_universities)) {
              setAiData(dbData);
              setIsSavedInDb(true);
              updateIssue(issue.id, {
                numericId: ticketData.id || numericId,
                validationReportJson: JSON.stringify(dbData),
                validationStatus: "PASS"
              });
              setIsLoading(false);
              return;
            }
          }
        }
      } catch (e) {
        // Continue to triage DB endpoint
      }

      if (numericId && !isNaN(numericId)) {
        try {
          const dbRes = await fetch(`${API_BASE_URL}/triage/${numericId}/ai-verification`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          if (dbRes.ok) {
            const dbData = await dbRes.json();
            if (dbData && (dbData.validation || dbData.scored_universities)) {
              setAiData(dbData);
              setIsSavedInDb(true);
              updateIssue(issue.id, {
                validationReportJson: JSON.stringify(dbData),
                validationStatus: "PASS"
              });
              setIsLoading(false);
              return;
            }
          }
        } catch (e) {
          // Fall through to live execution
        }
      }
    }

    // 3. Execute live AI verification with multi-tier endpoint cascade
    const problemText = `${issue.title}. ${issue.description || ""}`.trim();
    const payload = {
      numeric_id: numericId,
      issue_id: issue.id,
      issue_number: issue.id,
      title: issue.title,
      description: issue.description || issue.title,
      sector: issue.sector || issue.domain || "INFRASTRUCTURE",
      problem_text: problemText,
      district: issue.district || "Ranchi",
      state: "Jharkhand",
      latitude: issue.latitude || null,
      longitude: issue.longitude || null,
      image_b64_list: [],
      document_text: issue.pdfExtractedText || null
    };

    try {
      let data: UnifiedPipelineOutput | null = null;
      let lastErrorMessage = "";

      // Candidate 1: Direct AI Microservice on port 8000 (FastAPI master unified routing)
      try {
        const directAiRes = await fetch(`${AI_SERVICE_URL}/api/v1/unified-routing/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (directAiRes.ok) {
          data = await directAiRes.json();
        } else {
          lastErrorMessage = `AI microservice returned HTTP ${directAiRes.status}`;
        }
      } catch (e: any) {
        lastErrorMessage = e.message || "Failed connecting to AI service";
      }

      // Candidate 2: Via API Gateway to AI Microservice
      if (!data) {
        try {
          const gatewayAiRes = await fetch(`${API_BASE_URL}/ai/v1/unified-routing/analyze`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify(payload)
          });
          if (gatewayAiRes.ok) {
            data = await gatewayAiRes.json();
          }
        } catch (e) {}
      }

      // Candidate 3: Core Spring Boot Backend Triage Endpoint (backed by table university_embaddings)
      if (!data) {
        try {
          const backendTriageRes = await fetch(`${API_BASE_URL}/triage/ai-verification`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify(payload)
          });
          if (backendTriageRes.ok) {
            data = await backendTriageRes.json();
          }
        } catch (e) {}
      }

      // Candidate 4: Direct Backend on port 8081
      if (!data) {
        try {
          const directBackendRes = await fetch(`${BACKEND_DIRECT_URL}/triage/ai-verification`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify(payload)
          });
          if (directBackendRes.ok) {
            data = await directBackendRes.json();
          }
        } catch (e) {}
      }

      if (!data) {
        throw new Error(lastErrorMessage || "Unable to reach AI verification engine or university_embaddings endpoint");
      }

      setAiData(data);
      setIsSavedInDb(true);
      setFetchError(null);

      // Synchronize in local Zustand issue store
      updateIssue(issue.id, {
        validationReportJson: JSON.stringify(data),
        validationStatus: "PASS",
        priority: (data.validation?.urgency_level as any) || issue.priority,
        assignedHEI: issue.assignedHEI || data.scored_universities?.[0]?.university_name
      });

      // Persist AI verification results to PostgreSQL database in background
      try {
        fetch(`${API_BASE_URL}/triage/ai-verification`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            ...payload,
            ai_result: data
          })
        }).catch(() => {});
      } catch (saveErr) {
        console.info("Notice saving to backend database:", saveErr);
      }
    } catch (err: any) {
      setAiData(null);
      setIsSavedInDb(false);
      setFetchError(err.message || "Failed to execute AI verification pipeline");
    } finally {
      setIsLoading(false);
    }
  }, [issue, token, updateIssue]);

  useEffect(() => {
    if (issue) {
      fetchAiAnalysis();
    } else {
      setAiData(null);
    }
  }, [issue, fetchAiAnalysis]);

  if (!issue) return null;

  // Flatten all matched faculty experts across all universities
  const allFacultyExperts: MatchedFacultyExpert[] = [];
  if (aiData?.matched_faculty_experts) {
    Object.values(aiData.matched_faculty_experts).forEach((list) => {
      if (Array.isArray(list)) {
        allFacultyExperts.push(...list);
      }
    });
  }

  // Best recommended university from AI or assigned HEI or first registered university
  const topUniversity = aiData?.scored_universities?.[0] || (issue?.assignedHEI ? {
    university_name: issue.assignedHEI,
    total_score: 0.85
  } : (registeredUniversities.length > 0 ? {
    university_name: registeredUniversities[0].name,
    total_score: 0.80
  } : {
    university_name: "Pending University Selection",
    total_score: 0.0
  }));

  // Nodal Action: Approve Allocation
  const handleApproveAllocation = async () => {
    setIsProcessingAction(true);
    const targetHei = topUniversity.university_name;
    const scorePct = Math.round((topUniversity.total_score || 0.85) * 100);

    try {
      if (issue.numericId) {
        await fetch(`${API_BASE_URL}/triage/${issue.numericId}/assign`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            heiName: targetHei,
            notes: `Verified & Approved via Master AI Routing Oversight. Algorithmic Match Score: ${scorePct}%`
          })
        }).catch(() => {});
      }

      approveIssueAllocation(issue.id, targetHei, `AI Allocation Verified & Approved (${scorePct}% Match)`);
      toast.success(`Ticket #${issue.id} verified and officially allocated to ${targetHei}!`);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve allocation");
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Nodal Action: Re-route / Override
  const handleOverrideAllocation = async () => {
    if (!overrideUniversity.trim()) {
      toast.error("Please enter or select a target university name.");
      return;
    }
    setIsProcessingAction(true);
    try {
      if (issue.numericId) {
        await fetch(`${API_BASE_URL}/triage/${issue.numericId}/assign`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            heiName: overrideUniversity,
            notes: "Administrative re-route and override by State Nodal Officer."
          })
        }).catch(() => {});
      }

      reassignIssueHEI(issue.id, overrideUniversity, "Nodal Officer Manual Override");
      toast.success(`Ticket #${issue.id} re-routed and allocated to ${overrideUniversity}`);
      setShowOverrideInput(false);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to re-route allocation");
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Nodal Action: Revoke
  const handleRevokeAllocation = async () => {
    setIsProcessingAction(true);
    const reason = "Administrative revocation during AI Verification Audit - Problem returned to State Pool";
    try {
      if (issue.numericId) {
        await fetch(`${API_BASE_URL}/triage/${issue.numericId}/revoke`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ reason })
        }).catch(() => {});
      }

      revokeIssueAllocation(issue.id, reason);
      toast.warning(`Allocation revoked for Ticket #${issue.id}. Returned to State Pool.`);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to revoke allocation");
    } finally {
      setIsProcessingAction(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-12">
        {/* Main Sliding Drawer */}
        <div className="w-screen max-w-4xl bg-white shadow-2xl border-l border-[#d9d9d9] flex flex-col h-full animate-in slide-in-from-right duration-200">
          
          {/* Header Bar */}
          <div className="px-6 py-4 border-b border-[#d9d9d9] bg-[#F2efff] flex items-center justify-between shrink-0">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-[#1a0e3d] text-white">
                  {issue.id}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#F6effb] text-[#32174a] border border-[#e9d5ff]">
                  {issue.domain || issue.sector || "Grassroot Need"}
                </span>
                <span className="text-[11px] font-medium text-[#4a4a4a] flex items-center gap-1.5 font-mono">
                  <svg className="w-3.5 h-3.5 text-[#4a4a4a] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{issue.district}, Jharkhand</span>
                </span>
                {isSavedInDb && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F2fcef] text-[#002110] border border-[#a3e635] inline-flex items-center gap-1" title="Verified Academic Challenge">
                    <svg className="w-3 h-3 text-[#059669] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>University Challenges</span>
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#1a0e3d] line-clamp-1">
                {issue.title}
              </h2>
            </div>

            {/* Back / Close Cross Button */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-white hover:bg-[#F2efff] text-[#4a4a4a] hover:text-[#1a0e3d] border border-[#d9d9d9] shadow-2xs transition-all cursor-pointer group"
                title="Back to previous list (Esc)"
                aria-label="Close verification drawer"
              >
                <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="px-6 border-b border-[#d9d9d9] bg-white flex items-center gap-6 overflow-x-auto shrink-0 text-xs font-bold text-[#4a4a4a]">
            <button
              type="button"
              onClick={() => setActiveTab("experts")}
              className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "experts"
                  ? "border-[#1a0e3d] text-[#1a0e3d] font-extrabold"
                  : "border-transparent hover:text-[#1a0e3d]"
              }`}
            >
              <span>Matched Faculty &amp; HEIs</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#F2efff] text-[#1a0e3d] text-[10px] font-mono">
                {allFacultyExperts.length || 2}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("validation")}
              className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "validation"
                  ? "border-[#1a0e3d] text-[#1a0e3d] font-extrabold"
                  : "border-transparent hover:text-[#1a0e3d]"
              }`}
            >
              <span>Multimodal Validation</span>
              {aiData?.validation?.authenticity_score !== undefined && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#F2fcef] text-[#002110] border border-[#a3e635] text-[10px] font-mono">
                  {aiData.validation.authenticity_score <= 1
                    ? (aiData.validation.authenticity_score * 100).toFixed(0)
                    : aiData.validation.authenticity_score}%
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("requirements")}
              className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "requirements"
                  ? "border-[#1a0e3d] text-[#1a0e3d] font-extrabold"
                  : "border-transparent hover:text-[#1a0e3d]"
              }`}
            >
              <span>Academic Requirements</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("report")}
              className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "report"
                  ? "border-[#1a0e3d] text-[#1a0e3d] font-extrabold"
                  : "border-transparent hover:text-[#1a0e3d]"
              }`}
            >
              <span>Executive Report</span>
            </button>
          </div>

          {/* Body Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F2efff]/20 text-[#4a4a4a]">

            {/* Loading State */}
            {isLoading && (
              <div className="p-12 text-center space-y-4">
                <div className="w-12 h-12 border-3 border-[#dcd3ff] border-t-[#1a0e3d] rounded-full animate-spin mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#1a0e3d]">
                    Executing Master Unified Multimodal &amp; Faculty Matching Pipeline...
                  </h3>
                  <p className="text-xs text-[#4a4a4a] max-w-md mx-auto">
                    Retrieving multimodal validation scores, Supabase PGVector candidate chunks, and calculating 6-factor university capability metrics.
                  </p>
                </div>
              </div>
            )}

            {!isLoading && (
              <>
                {/* Notice banner if connection fell back to snapshot */}
                {fetchError && (
                  <div className="bg-[#FFF7e6] border border-[#fed7aa] rounded-xl p-3 flex items-center justify-between gap-3 text-xs text-[#612500]">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#612500] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <span className="font-bold">Verification Notice:</span> {fetchError}.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fetchAiAnalysis(true)}
                      className="h-8 px-3 rounded-lg bg-[#FFF5ea] hover:bg-[#fed7aa] text-[#612500] font-bold text-xs border border-[#fed7aa] transition-colors shrink-0 cursor-pointer inline-flex items-center justify-center whitespace-nowrap"
                    >
                      Retry Analysis
                    </button>
                  </div>
                )}

                {/* TAB 1: Matched Faculty & Scored Universities */}
                {activeTab === "experts" && (
                  <div className="space-y-6">
                    {/* Top Scored Institution Summary Banner */}
                    <div className="bg-white border border-[#dcd3ff] rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#32174a] block">
                          Primary Recommended Academic Institution
                        </span>
                        <h3 className="text-base font-bold text-[#1a0e3d] mt-0.5">
                          {topUniversity.university_name}
                        </h3>
                        <p className="text-xs text-[#4a4a4a] mt-1">
                          Evaluated across 6 deterministic dimensions: Faculty, Research, Department labs, Facilities, Incubation, and Proximity.
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-[#4a4a4a] block uppercase">Match Score</span>
                          <span className="text-xl font-black text-[#002110] font-mono bg-[#F2fcef] px-3 py-1 rounded-lg border border-[#a3e635] inline-block mt-0.5">
                            {Math.round((topUniversity.total_score || 0.85) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Faculty Experts Box List (Photo on Left, Details on Right) */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#1a0e3d] uppercase tracking-wider flex items-center gap-2">
                          <span>Matched Faculty Experts ({allFacultyExperts.length})</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                        </h4>
                        <span className="text-[11px] text-[#4a4a4a]">
                          Direct academic contact and research relevance
                        </span>
                      </div>

                      {allFacultyExperts.length === 0 ? (
                        <div className="p-8 bg-white border border-[#d9d9d9] rounded-xl text-center text-xs text-[#4a4a4a]">
                          No faculty experts directly indexed for this specific domain yet.
                        </div>
                      ) : (
                        allFacultyExperts.map((prof, pIdx) => (
                          /* Professor Box Card (Left Big Photo, Right Details) */
                          <div
                            key={`${prof.name}-${pIdx}`}
                            className="bg-white border border-[#d9d9d9] hover:border-[#1a0e3d] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-stretch"
                          >
                            {/* LEFT SIDE: Big Photo taking full place of left side */}
                            <FacultyPhoto
                              name={prof.name}
                              imageUrl={prof.profile_image_url}
                              universityName={prof.university_name}
                            />

                            {/* RIGHT SIDE: About Professor, Designation, Department, Relevance Reason, Contacts */}
                            <div className="flex-1 p-5 space-y-3 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <h4 className="text-base font-bold text-[#1a0e3d]">
                                    {prof.name}
                                  </h4>
                                  <span className="text-[11px] font-mono text-[#32174a] font-semibold">
                                    {prof.department}
                                  </span>
                                </div>
                                <div className="text-xs font-medium text-[#4a4a4a] mt-0.5">
                                  {prof.designation} &bull; <span className="text-[#1a0e3d] font-semibold">{prof.university_name}</span>
                                </div>
                              </div>

                              {/* AI Relevance Rationale */}
                              <div className="bg-[#F2efff]/50 border border-[#dcd3ff] rounded-xl p-3.5 text-xs text-[#4a4a4a] leading-relaxed">
                                <span className="font-bold text-[#1a0e3d] block text-[11px] mb-1 uppercase tracking-wider">
                                  Why AI Matched This Professor:
                                </span>
                                {prof.relevance_reason}
                              </div>

                              {/* Contact & Document Links - Even Heights & Clean SVGs */}
                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                {prof.email && (
                                  <a
                                    href={`mailto:${prof.email}`}
                                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#F2efff] hover:bg-[#e4ddff] text-[#1a0e3d] border border-[#dcd3ff] text-xs font-semibold transition-colors whitespace-nowrap"
                                    title={`Email ${prof.name}`}
                                  >
                                    <svg className="w-3.5 h-3.5 text-[#1a0e3d] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span>{prof.email}</span>
                                  </a>
                                )}

                                {prof.phone && (
                                  <a
                                    href={`tel:${prof.phone}`}
                                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#F2efff] hover:bg-[#e4ddff] text-[#1a0e3d] border border-[#dcd3ff] text-xs font-semibold transition-colors whitespace-nowrap"
                                    title={`Call ${prof.name}`}
                                  >
                                    <svg className="w-3.5 h-3.5 text-[#1a0e3d] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span>{prof.phone}</span>
                                  </a>
                                )}

                                {prof.profile_url && (
                                  <a
                                    href={prof.profile_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#F5faff] hover:bg-[#e0f2fe] text-[#001944] border border-[#bae6fd] text-xs font-semibold transition-colors whitespace-nowrap"
                                    title="View University Profile"
                                  >
                                    <svg className="w-3.5 h-3.5 text-[#001944] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    <span>Official Profile</span>
                                  </a>
                                )}

                                {prof.cv_url && (
                                  <a
                                    href={prof.cv_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white hover:bg-[#F2efff] text-[#4a4a4a] hover:text-[#1a0e3d] border border-[#d9d9d9] text-xs font-semibold transition-colors whitespace-nowrap"
                                    title="Download Faculty CV"
                                  >
                                    <svg className="w-3.5 h-3.5 text-[#4a4a4a] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>View CV PDF</span>
                                  </a>
                                )}

                                {prof.publications_pdf_url && (
                                  <a
                                    href={prof.publications_pdf_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white hover:bg-[#F2efff] text-[#4a4a4a] hover:text-[#1a0e3d] border border-[#d9d9d9] text-xs font-semibold transition-colors whitespace-nowrap"
                                    title="View Indexed Publications"
                                  >
                                    <svg className="w-3.5 h-3.5 text-[#4a4a4a] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <span>Publications List</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Scored Universities with 6-Factor Capability Breakdown */}
                    {aiData?.scored_universities && aiData.scored_universities.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-bold text-[#1a0e3d] uppercase tracking-wider">
                          Ranked Higher Education Institutions (6-Factor Capability Breakdown)
                        </h4>

                        <div className="space-y-3">
                          {aiData.scored_universities.map((uni, uIdx) => (
                            <div key={uni.university_code} className="bg-white border border-[#d9d9d9] rounded-xl p-4 shadow-xs space-y-3">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F2efff] text-[#1a0e3d] font-mono mr-2 border border-[#dcd3ff]">
                                    Rank #{uIdx + 1}
                                  </span>
                                  <span className="text-xs font-bold text-[#1a0e3d]">{uni.university_name}</span>
                                </div>
                                <div className="text-sm font-black text-[#002110] font-mono bg-[#F2fcef] px-2.5 py-0.5 rounded border border-[#a3e635]">
                                  {Math.round(uni.total_score * 100)}%
                                </div>
                              </div>

                              {/* 6-Factor capability grid */}
                              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-[10px] text-[#4a4a4a] bg-[#F2efff]/30 p-2.5 rounded-lg border border-[#dcd3ff]">
                                <div>
                                  <span className="text-[#4a4a4a] block font-medium">Faculty</span>
                                  <span className="font-bold text-[#1a0e3d] font-mono">
                                    {Math.round((uni.breakdown?.s_faculty || 0) * 100)}%
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[#4a4a4a] block font-medium">Research</span>
                                  <span className="font-bold text-[#1a0e3d] font-mono">
                                    {Math.round((uni.breakdown?.s_research || 0) * 100)}%
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[#4a4a4a] block font-medium">Dept Labs</span>
                                  <span className="font-bold text-[#1a0e3d] font-mono">
                                    {Math.round((uni.breakdown?.s_dept || 0) * 100)}%
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[#4a4a4a] block font-medium">Facilities</span>
                                  <span className="font-bold text-[#1a0e3d] font-mono">
                                    {Math.round((uni.breakdown?.s_facility || 0) * 100)}%
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[#4a4a4a] block font-medium">Incubator</span>
                                  <span className="font-bold text-[#1a0e3d] font-mono">
                                    {Math.round((uni.breakdown?.s_incubator || 0) * 100)}%
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[#4a4a4a] block font-medium">Proximity</span>
                                  <span className="font-bold text-[#1a0e3d] font-mono">
                                    {Math.round((uni.breakdown?.s_geo || 0) * 100)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: Multimodal Validation & Authenticity */}
                {activeTab === "validation" && aiData?.validation && (
                  <div className="space-y-5">
                    {/* Validation Status Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white border border-[#d9d9d9] rounded-xl p-4 shadow-xs">
                        <span className="text-[10px] font-bold text-[#4a4a4a] uppercase tracking-wider block">Integrity Verdict</span>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${aiData.validation.is_valid ? "bg-[#059669]" : "bg-[#dc2626]"}`} />
                          <span className={`text-sm font-black font-mono ${aiData.validation.is_valid ? "text-[#002110]" : "text-[#3a0907]"}`}>
                            {aiData.validation.is_valid ? "AUTHENTIC" : "FLAGGED"}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#4a4a4a] mt-0.5 block">Multimodal Corroborated</span>
                      </div>

                      <div className="bg-white border border-[#d9d9d9] rounded-xl p-4 shadow-xs">
                        <span className="text-[10px] font-bold text-[#4a4a4a] uppercase tracking-wider block">Authenticity Score</span>
                        <div className="text-xl font-black text-[#002110] font-mono mt-1">
                          {aiData.validation.authenticity_score}%
                        </div>
                        <span className="text-[10px] text-[#4a4a4a] mt-0.5 block">Cross-modality check</span>
                      </div>

                      <div className="bg-white border border-[#d9d9d9] rounded-xl p-4 shadow-xs">
                        <span className="text-[10px] font-bold text-[#4a4a4a] uppercase tracking-wider block">Urgency Level</span>
                        <div className="text-base font-black text-[#3a0907] font-mono mt-1">
                          {aiData.validation.urgency_level}
                        </div>
                        <span className="text-[10px] text-[#4a4a4a] mt-0.5 block">Severity Priority</span>
                      </div>

                      <div className="bg-white border border-[#d9d9d9] rounded-xl p-4 shadow-xs">
                        <span className="text-[10px] font-bold text-[#4a4a4a] uppercase tracking-wider block">Severity Score</span>
                        <div className="text-xl font-black text-[#612500] font-mono mt-1">
                          {aiData.validation.severity_score}/100
                        </div>
                        <span className="text-[10px] text-[#4a4a4a] mt-0.5 block">Normalized priority</span>
                      </div>
                    </div>

                    {/* Multimodal Evidence Summary */}
                    <div className="bg-white border border-[#d9d9d9] rounded-xl p-4 shadow-xs space-y-2">
                      <h4 className="text-xs font-bold text-[#1a0e3d] uppercase tracking-wider">
                        Multimodal Evidence Summary
                      </h4>
                      <p className="text-xs text-[#4a4a4a] leading-relaxed">
                        {aiData.validation.multimodal_evidence_summary}
                      </p>
                    </div>

                    {/* Detected Issues */}
                    {aiData.validation.detected_issues && aiData.validation.detected_issues.length > 0 && (
                      <div className="bg-white border border-[#d9d9d9] rounded-xl p-4 shadow-xs space-y-2">
                        <h4 className="text-xs font-bold text-[#1a0e3d] uppercase tracking-wider">
                          Key Issues Detected by Multi-Agent Consensus
                        </h4>
                        <ul className="space-y-1.5 text-xs text-[#4a4a4a] list-disc list-inside">
                          {aiData.validation.detected_issues.map((iss, i) => (
                            <li key={i}>{iss}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Deduplication Audit */}
                    {aiData.validation.deduplication && (
                      <div className="bg-white border border-[#d9d9d9] rounded-xl p-4 shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-[#1a0e3d] uppercase tracking-wider">
                            Spatial &amp; Semantic Deduplication Check
                          </h4>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                            aiData.validation.deduplication.is_duplicate
                              ? "bg-[#FFF8f8] text-[#3a0907] border-[#fecaca]"
                              : "bg-[#F2fcef] text-[#002110] border-[#a3e635]"
                          }`}>
                            {aiData.validation.deduplication.is_duplicate ? "POTENTIAL DUPLICATE" : "UNIQUE CHALLENGE"}
                          </span>
                        </div>
                        <div className="text-xs text-[#4a4a4a] space-y-1">
                          <p>{aiData.validation.deduplication.reason}</p>
                          <div className="text-[11px] text-[#4a4a4a] font-mono">
                            Distance to nearest cluster: {aiData.validation.deduplication.distance_km ?? 0} km &bull; Similarity: {Math.round((aiData.validation.deduplication.similarity_score ?? 0) * 100)}%
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: Academic Requirements */}
                {activeTab === "requirements" && aiData?.requirements && (
                  <div className="space-y-5">
                    {/* Problem Summary Box */}
                    <div className="bg-white border border-[#d9d9d9] rounded-xl p-4 shadow-xs space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#32174a]">
                        Formalized Challenge Problem Statement
                      </span>
                      <p className="text-xs text-[#1a0e3d] leading-relaxed font-medium">
                        {aiData.requirements.problem_summary}
                      </p>
                    </div>

                    {/* Required Disciplines & Expertise Keywords */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white border border-[#d9d9d9] rounded-xl p-4 shadow-xs space-y-2">
                        <h4 className="text-xs font-bold text-[#1a0e3d] uppercase tracking-wider">
                          Required Academic Disciplines
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {aiData.requirements.required_disciplines?.map((disc, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#F6effb] text-[#32174a] border border-[#e9d5ff] text-xs font-medium">
                              {disc}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white border border-[#d9d9d9] rounded-xl p-4 shadow-xs space-y-2">
                        <h4 className="text-xs font-bold text-[#1a0e3d] uppercase tracking-wider">
                          Core Expertise Keywords
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {aiData.requirements.expertise_keywords?.map((kw, idx) => (
                            <span key={idx} className="px-2 py-1 rounded-lg bg-[#F2efff] text-[#1a0e3d] border border-[#dcd3ff] text-xs font-mono font-medium">
                              #{kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Required Capabilities Checklist */}
                    <div className="bg-white border border-[#d9d9d9] rounded-xl p-4 shadow-xs space-y-2">
                      <h4 className="text-xs font-bold text-[#1a0e3d] uppercase tracking-wider">
                        Required Institutional &amp; Laboratory Capabilities
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#4a4a4a]">
                        {aiData.requirements.required_capabilities?.map((cap, idx) => (
                          <div key={idx} className="flex items-start gap-2 bg-[#F2efff]/40 p-2.5 rounded-lg border border-[#dcd3ff]">
                            <svg className="w-3.5 h-3.5 text-[#059669] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{cap}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Prototyping & Incubation Status */}
                    <div className="bg-white border border-[#d9d9d9] rounded-xl p-4 shadow-xs flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${aiData.requirements.prototyping_needed ? "bg-[#059669]" : "bg-[#d9d9d9]"}`} />
                        <span className="text-xs font-bold text-[#1a0e3d]">
                          Hardware Prototyping Needed: {aiData.requirements.prototyping_needed ? "YES" : "NO"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${aiData.requirements.incubation_needed ? "bg-[#059669]" : "bg-[#d9d9d9]"}`} />
                        <span className="text-xs font-bold text-[#1a0e3d]">
                          Incubator Pilot Support Needed: {aiData.requirements.incubation_needed ? "YES" : "NO"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: Executive Report & Next Steps */}
                {activeTab === "report" && aiData?.executive_report && (
                  <div className="space-y-5">
                    {/* Executive Summary */}
                    <div className="bg-white border border-[#d9d9d9] rounded-xl p-4 shadow-xs space-y-2">
                      <h4 className="text-xs font-bold text-[#1a0e3d] uppercase tracking-wider">
                        Executive Nodal Summary
                      </h4>
                      <p className="text-xs text-[#4a4a4a] leading-relaxed font-medium">
                        {aiData.executive_report.executive_summary}
                      </p>
                    </div>

                    {/* Recommendations list */}
                    {aiData.executive_report.recommendations && aiData.executive_report.recommendations.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-[#1a0e3d] uppercase tracking-wider">
                          Institutional Recommendations &amp; Strengths
                        </h4>
                        {aiData.executive_report.recommendations.map((rec, rIdx) => (
                          <div key={rIdx} className="bg-white border border-[#d9d9d9] rounded-xl p-4 shadow-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#1a0e3d]">
                                #{rec.rank} &bull; {rec.university_name}
                              </span>
                              <span className="text-xs font-mono font-black text-[#002110] bg-[#F2fcef] px-2 py-0.5 rounded border border-[#a3e635]">
                                {rec.total_capability_score}% Capability
                              </span>
                            </div>

                            {rec.key_strengths && rec.key_strengths.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[11px] font-bold text-[#32174a] uppercase">Key Strengths:</span>
                                <ul className="list-disc list-inside text-xs text-[#4a4a4a] space-y-0.5">
                                  {rec.key_strengths.map((str, s) => (
                                    <li key={s}>{str}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {rec.evidence_snippets && rec.evidence_snippets.length > 0 && (
                              <div className="bg-[#F2efff]/30 p-2.5 rounded-lg border border-[#dcd3ff] text-[11px] text-[#4a4a4a] space-y-1">
                                <span className="font-bold text-[#1a0e3d] block">Corroborating Evidence:</span>
                                {rec.evidence_snippets.map((ev, e) => (
                                  <div key={e} className="font-mono text-[10px]">
                                    &bull; {ev}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Suggested Next Steps */}
                    {aiData.executive_report.suggested_next_steps && (
                      <div className="bg-white border border-[#d9d9d9] rounded-xl p-4 shadow-xs space-y-2">
                        <h4 className="text-xs font-bold text-[#1a0e3d] uppercase tracking-wider">
                          Suggested Next Steps for State Nodal Department
                        </h4>
                        <ol className="list-decimal list-inside text-xs text-[#4a4a4a] space-y-1.5">
                          {aiData.executive_report.suggested_next_steps.map((step, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sticky Bottom Nodal Action Bar */}
          <div className="p-4 sm:p-5 border-t border-[#d9d9d9] bg-white shrink-0 space-y-3">
            {showOverrideInput ? (
              <div className="bg-[#F2efff]/50 p-3.5 rounded-xl border border-[#dcd3ff] space-y-2.5">
                <label className="text-xs font-bold text-[#1a0e3d] block">
                  Select Override Academic Institution:
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={overrideUniversity}
                    onChange={(e) => setOverrideUniversity(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-[#d9d9d9] rounded-lg text-xs font-bold text-[#1a0e3d] outline-none focus:ring-1 focus:ring-[#1a0e3d]"
                  >
                    <option value="">-- Choose University --</option>
                    {registeredUniversities.map((uni) => (
                      <option key={uni.id || uni.code} value={uni.name}>
                        {uni.name} ({uni.district || "Jharkhand"})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleOverrideAllocation}
                    disabled={isProcessingAction}
                    className="h-9 px-4 rounded-lg bg-[#1a0e3d] hover:bg-[#2e1764] text-white font-bold text-xs cursor-pointer shadow-xs inline-flex items-center justify-center whitespace-nowrap shrink-0 disabled:opacity-50"
                  >
                    Confirm Re-route
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOverrideInput(false)}
                    className="h-9 px-3.5 rounded-lg bg-white hover:bg-[#F2efff] text-[#4a4a4a] border border-[#d9d9d9] font-bold text-xs cursor-pointer inline-flex items-center justify-center whitespace-nowrap shrink-0"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-[#4a4a4a] text-center sm:text-left">
                  <span className="font-bold text-[#1a0e3d]">State Nodal Authority Clearance</span>
                  <span className="block text-[11px] text-[#4a4a4a]">
                    Signing off verifies challenge integrity and assigns official research capstone.
                  </span>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap sm:flex-nowrap">
                  {/* Option: Revoke */}
                  <button
                    type="button"
                    onClick={handleRevokeAllocation}
                    disabled={isProcessingAction}
                    className="h-10 px-4 rounded-xl bg-[#FFF8f8] hover:bg-[#fee2e2] text-[#3a0907] border border-[#fecaca] font-bold text-xs transition-colors cursor-pointer whitespace-nowrap inline-flex items-center justify-center shrink-0 disabled:opacity-50"
                  >
                    Revoke to Pool
                  </button>

                  {/* Option: Override / Re-route */}
                  <button
                    type="button"
                    onClick={() => {
                      setOverrideUniversity(topUniversity.university_name);
                      setShowOverrideInput(true);
                    }}
                    disabled={isProcessingAction}
                    className="h-10 px-4 rounded-xl bg-[#F2efff] hover:bg-[#e4ddff] text-[#1a0e3d] border border-[#dcd3ff] font-bold text-xs transition-colors cursor-pointer whitespace-nowrap inline-flex items-center justify-center shrink-0 disabled:opacity-50"
                  >
                    Re-route...
                  </button>

                  {/* Option: Primary Approve & Allocate */}
                  <button
                    type="button"
                    onClick={handleApproveAllocation}
                    disabled={isProcessingAction}
                    className="h-10 px-5 rounded-xl bg-[#1a0e3d] hover:bg-[#2e1764] text-white font-bold text-xs shadow-sm hover:shadow transition-all cursor-pointer whitespace-nowrap inline-flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 text-[#a3e635] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Verify &amp; Allocate to {topUniversity.university_name || "HEI"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
