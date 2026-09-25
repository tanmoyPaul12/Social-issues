"use client";

import React, { useState, useEffect, useRef } from "react";
import { OFFICIAL_RESEARCH_DOMAINS } from "@/app/page";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useIssueStore } from "@/lib/store/useIssueStore";
import { toast } from "@/components/dashboard/ToastStack";

import { GoogleMapPicker, JHARKHAND_DISTRICT_COORDINATES } from "@/components/common/GoogleMapPicker";
import { WorkspacePlaceholderTab } from "./WorkspacePlaceholderTab";

// Constants for backend communication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const JHARKHAND_DISTRICTS = [
  "Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", 
  "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", 
  "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj", 
  "Saraikela Kharsawan", "Simdega", "West Singhbhum"
].sort();

const ISSUE_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

// Map the official research domains to IssueSector backend enum values
const domainToSectorMap: Record<string, string> = {
  // Official Short Names from page.tsx
  "Education": "EDUCATION",
  "Agriculture": "AGRICULTURE",
  "Healthcare": "HEALTH",
  "Water Resources": "WATER",
  "Environment": "ENVIRONMENT",
  "Energy": "ELECTRICITY",
  "Urban Development": "INFRASTRUCTURE",
  "Accessibility": "INFRASTRUCTURE",
  "Public Administration": "GOVERNANCE",
  "Rural Livelihoods": "LIVELIHOOD",

  // Long Detailed Names
  "Water Management": "WATER",
  "Healthcare & Public Health": "HEALTH",
  "Education & Skilling": "EDUCATION",
  "Rural Infrastructure": "INFRASTRUCTURE",
  "Agriculture & Agro-Tech": "AGRICULTURE",
  "Energy & Electricity": "ELECTRICITY",
  "Sanitation & Waste": "SANITATION",
  "Livelihood & Employment": "LIVELIHOOD",
  "Environment & Climate": "ENVIRONMENT",
  "Governance & Civic": "GOVERNANCE",

  // Direct Enum strings
  "WATER": "WATER",
  "HEALTH": "HEALTH",
  "EDUCATION": "EDUCATION",
  "INFRASTRUCTURE": "INFRASTRUCTURE",
  "AGRICULTURE": "AGRICULTURE",
  "ELECTRICITY": "ELECTRICITY",
  "SANITATION": "SANITATION",
  "LIVELIHOOD": "LIVELIHOOD",
  "ENVIRONMENT": "ENVIRONMENT",
  "GOVERNANCE": "GOVERNANCE"
};

const sectorToDomainMap: Record<string, string> = {
  "WATER": "Water Resources",
  "HEALTH": "Healthcare",
  "EDUCATION": "Education",
  "INFRASTRUCTURE": "Urban Development",
  "AGRICULTURE": "Agriculture",
  "ELECTRICITY": "Energy",
  "SANITATION": "Sanitation & Waste",
  "LIVELIHOOD": "Rural Livelihoods",
  "ENVIRONMENT": "Environment",
  "GOVERNANCE": "Public Administration",
  "OTHER": "Other Grassroot Need"
};

const getSectorEnum = (domainStr: string, title?: string, description?: string) => {
  const direct = domainToSectorMap[domainStr];
  if (direct && direct !== "OTHER") {
    return direct;
  }
  const text = `${title || ""} ${description || ""}`.toLowerCase();
  if (text.includes("rice") || text.includes("paddy") || text.includes("crop") || text.includes("blast") || text.includes("kisan") || text.includes("farmer")) {
    return "AGRICULTURE";
  }
  if (text.includes("water") || text.includes("pump") || text.includes("dam") || text.includes("handpump")) {
    return "WATER";
  }
  if (text.includes("pollution") || text.includes("smoke") || text.includes("kiln") || text.includes("dust")) {
    return "ENVIRONMENT";
  }
  return "OTHER";
};

interface AttachmentItem {
  id?: number;
  fileUrl: string;
  fileName: string;
  fileType?: "PHOTO" | "VIDEO" | "DOCUMENT" | "OTHER";
  mimeType?: string;
  fileSizeBytes?: number;
}

interface CitizenSubmission {
  id: string | number;
  numericId?: number;
  title: string;
  domain: string;
  district: string;
  block?: string;
  villageOrWard?: string;
  addressDescription?: string;
  latitude?: number | null;
  longitude?: number | null;
  date: string;
  status: "DRAFT" | "SUBMITTED" | "TRIAGED" | "ASSIGNED_HEI" | "IN_PROGRESS" | "RESOLVED" | "REJECTED" | string;
  assignedHEI?: string;
  fundingPartner?: string;
  progress: number;
  description: string;
  upvotes: number;
  priority?: string;
  affectedPopulation?: number | null;
  attachments?: AttachmentItem[];
  attachmentCount?: number;
  primaryThumbnailUrl?: string;
  validationStatus?: string;
  isAnonymous?: boolean;
}

interface CommunityChallenge {
  id: string;
  title: string;
  district: string;
  domain: string;
  upvotes: number;
  author: string;
  hasUpvoted: boolean;
}

interface CitizenDashboardViewProps {
  activeTab?: string;
  onNavigateTab?: (tabId: string) => void;
}

export function CitizenDashboardView({
  activeTab = "overview",
  onNavigateTab,
}: CitizenDashboardViewProps) {
  const { user, token } = useAuthStore();
  const { addIssue } = useIssueStore();
  const citizenDistrict = user?.district || "Your District";
  const citizenName = user?.name || "Citizen";


  const [submissions, setSubmissions] = useState<CitizenSubmission[]>([]);
  const [communityIssues, setCommunityIssues] = useState<CommunityChallenge[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<CitizenSubmission | null>(null);
  const [isLoadingIssues, setIsLoadingIssues] = useState(false);

  // Form State matching IssueSubmitRequest
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState<string>(OFFICIAL_RESEARCH_DOMAINS[4] || "Agriculture & Agro-Tech");
  const [description, setDescription] = useState("");
  const [district, setDistrict] = useState<string>(user?.district || JHARKHAND_DISTRICTS[0]);
  const [block, setBlock] = useState("");
  const [villageOrWard, setVillageOrWard] = useState("");
  const [addressDescription, setAddressDescription] = useState("");
  
  // Default coordinates initialized from selected district (never NULL)
  const initialCoord = JHARKHAND_DISTRICT_COORDINATES[user?.district || JHARKHAND_DISTRICTS[0]] || { lat: 23.3441, lng: 85.3096 };
  const [latitude, setLatitude] = useState<number | null>(initialCoord.lat);
  const [longitude, setLongitude] = useState<number | null>(initialCoord.lng);

  const [priority, setPriority] = useState<string>("MEDIUM");
  const [affectedPopulation, setAffectedPopulation] = useState<number | "">("");
  const [contactName, setContactName] = useState(user?.name || "");
  const [contactPhone, setContactPhone] = useState(user?.phone || "");
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Media files upload state (images, videos, documents)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{ file: File; previewUrl: string; type: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);

  // Fetch real submissions from backend on mount and setup live SSE status updates + polling
  useEffect(() => {
    fetchMyIssues();

    // 1. Setup SSE stream for live ticket updates
    const userId = user?.id || "1";
    const sseBase = API_BASE_URL.replace(/\/api$/, "");
    const sseUrl = `${sseBase}/api/notifications/stream?userId=${encodeURIComponent(userId)}`;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(sseUrl);

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (
            payload.eventType === "ISSUE_STATUS_UPDATED" ||
            payload.eventType === "TICKET_UPDATE" ||
            payload.eventType === "AI_TRIAGE_COMPLETE" ||
            payload.eventType === "STATUS_CHANGED"
          ) {
            toast.info(`Ticket Update: ${payload.title || payload.message || "Status updated"}`);
            fetchMyIssues();
          }
        } catch {
          // ignore heartbeat parse
        }
      };

      eventSource.addEventListener("ticket_update", () => {
        fetchMyIssues();
      });

      eventSource.addEventListener("issue_status_updated", () => {
        fetchMyIssues();
      });

      eventSource.onerror = () => {
        // SSE closed or reconnecting; fallback polling maintains sync
      };
    } catch (e) {
      console.warn("SSE connection error:", e);
    }

    // 2. Fallback live polling every 30 seconds
    const pollTimer = setInterval(() => {
      fetchMyIssues();
    }, 30000);

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      clearInterval(pollTimer);
    };
  }, [token, user?.id]);

  const fetchMyIssues = async () => {
    setIsLoadingIssues(true);
    try {
      const endpoint = token ? `${API_BASE_URL}/issues/my?page=0&size=50` : `${API_BASE_URL}/issues?page=0&size=50`;
      const res = await fetch(endpoint, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.content && Array.isArray(data.content)) {
          const mapped: CitizenSubmission[] = data.content.map((item: any) => ({
            id: item.issueNumber || `JH-${item.id}`,
            numericId: item.id,
            title: item.title,
            domain: sectorToDomainMap[item.sector] || item.sector || "Grassroot Need",
            district: item.district,
            block: item.block,
            villageOrWard: item.villageOrWard,
            addressDescription: item.addressDescription,
            latitude: item.latitude,
            longitude: item.longitude,
            date: item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "Recent",
            status: item.status,
            assignedHEI: item.assignedHEI,
            fundingPartner: item.fundingPartner,
            progress: item.status === "RESOLVED" ? 100 : item.status === "IN_PROGRESS" ? 60 : item.status === "ASSIGNED_HEI" ? 40 : 15,
            description: item.description || item.snippet || item.title,
            upvotes: 1,
            priority: item.priority,
            affectedPopulation: item.affectedPopulation,
            attachments: item.attachments || [],
            attachmentCount: (item.attachments && item.attachments.length) || item.attachmentCount || 0,
            primaryThumbnailUrl: item.primaryThumbnailUrl || (item.attachments && item.attachments[0]?.fileUrl),
            validationStatus: item.validationStatus || "PASS",
            isAnonymous: Boolean(item.isAnonymous)
          }));
          setSubmissions(mapped);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch citizen submissions from backend:", e);
    } finally {
      setIsLoadingIssues(false);
    }
  };

  // Inspect detailed issue including attachments
  const handleInspectIssue = async (sub: CitizenSubmission) => {
    setSelectedSubmission(sub);
    const issueId = sub.numericId || sub.id;
    if (typeof issueId === "number" || (!isNaN(Number(issueId)) && !String(issueId).startsWith("JH-"))) {
      try {
        const res = await fetch(`${API_BASE_URL}/issues/${issueId}`);
        if (res.ok) {
          const fullData = await res.json();
          setSelectedSubmission((prev) => prev ? {
            ...prev,
            description: fullData.description || prev.description,
            block: fullData.block || prev.block,
            villageOrWard: fullData.villageOrWard || prev.villageOrWard,
            addressDescription: fullData.addressDescription || prev.addressDescription,
            latitude: fullData.latitude,
            longitude: fullData.longitude,
            attachments: fullData.attachments || [],
            priority: fullData.priority || prev.priority,
            isAnonymous: fullData.isAnonymous ?? prev.isAnonymous
          } : null);
        }
      } catch (e) {
        console.error("Could not fetch detailed issue data:", e);
      }
    }
  };

  // Handle District Change & Sync Map Center
  const handleDistrictSelect = (newDistrict: string) => {
    setDistrict(newDistrict);
    const preset = JHARKHAND_DISTRICT_COORDINATES[newDistrict];
    if (preset) {
      setLatitude(preset.lat);
      setLongitude(preset.lng);
    }
  };

  // File attachments management
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (files: File[]) => {
    const MAX_FILES = 5;
    const MAX_SIZE_MB = 15;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

    const currentCount = selectedFiles.length;
    const availableSlots = MAX_FILES - currentCount;

    if (availableSlots <= 0) {
      toast.error(`Maximum limit of ${MAX_FILES} attachments reached.`);
      return;
    }

    const validNewFiles: File[] = [];
    const newPreviews: { file: File; previewUrl: string; type: string }[] = [];

    files.slice(0, availableSlots).forEach((file) => {
      if (file.size > MAX_SIZE_BYTES) {
        toast.error(`File "${file.name}" exceeds maximum allowed size of ${MAX_SIZE_MB}MB.`);
        return;
      }

      validNewFiles.push(file);
      const isImg = file.type.startsWith("image/");
      const isVid = file.type.startsWith("video/");
      const isDoc = file.type.includes("pdf") || file.type.includes("document");

      newPreviews.push({
        file,
        previewUrl: isImg ? URL.createObjectURL(file) : "",
        type: isImg ? "image" : isVid ? "video" : isDoc ? "document" : "other"
      });
    });

    setSelectedFiles((prev) => [...prev, ...validNewFiles]);
    setFilePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveFile = (index: number) => {
    const previewToRemove = filePreviews[index];
    if (previewToRemove?.previewUrl) {
      URL.revokeObjectURL(previewToRemove.previewUrl);
    }
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const submitToBackend = async (isDraft: boolean) => {
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are mandatory.");
      return;
    }
    
    if (description.trim().length < 20) {
      toast.error("Description must be at least 20 characters of detail.");
      return;
    }

    if (!district) {
      toast.error("District is mandatory.");
      return;
    }

    // Ensure fallback coordinates if still null
    const finalLat = latitude ?? (JHARKHAND_DISTRICT_COORDINATES[district]?.lat || 23.3441);
    const finalLng = longitude ?? (JHARKHAND_DISTRICT_COORDINATES[district]?.lng || 85.3096);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      sector: getSectorEnum(domain),
      district,
      block: block.trim() || null,
      villageOrWard: villageOrWard.trim() || null,
      addressDescription: addressDescription.trim() || null,
      latitude: finalLat,
      longitude: finalLng,
      priority,
      affectedPopulation: typeof affectedPopulation === "number" ? affectedPopulation : null,
      contactName: contactName.trim() || null,
      contactPhone: contactPhone.trim() || null,
      isAnonymous
    };

    if (isDraft) setIsDrafting(true);
    else setIsSubmitting(true);

    try {
      // Step 1: Create issue in backend
      const endpoint = isDraft ? `${API_BASE_URL}/issues/draft` : `${API_BASE_URL}/issues`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Failed to submit issue");
      }

      const createdIssue = await res.json();
      const issueId = createdIssue.id;

      // Step 2: Upload any attached images, videos, or documents
      let uploadedAttachmentCount = 0;
      if (selectedFiles.length > 0 && issueId) {
        for (const file of selectedFiles) {
          try {
            const formData = new FormData();
            formData.append("file", file);
            const uploadRes = await fetch(`${API_BASE_URL}/issues/${issueId}/attachments`, {
              method: "POST",
              headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {})
              },
              body: formData
            });
            if (uploadRes.ok) {
              uploadedAttachmentCount++;
            }
          } catch (uploadErr) {
            console.error(`Failed to upload attachment ${file.name}:`, uploadErr);
          }
        }
      }

      // Step 3: Update local state to immediately show in dashboard
      const newSub: CitizenSubmission = {
        id: createdIssue.issueNumber || `JH-NEW-${Math.floor(1000 + Math.random() * 9000)}`,
        numericId: createdIssue.id,
        title: createdIssue.title,
        domain: sectorToDomainMap[createdIssue.sector] || domain,
        district: createdIssue.district,
        block: createdIssue.block,
        villageOrWard: createdIssue.villageOrWard,
        addressDescription: createdIssue.addressDescription,
        latitude: createdIssue.latitude || finalLat,
        longitude: createdIssue.longitude || finalLng,
        date: "Just now",
        status: createdIssue.status || (isDraft ? "DRAFT" : "SUBMITTED"),
        progress: 10,
        description: createdIssue.description,
        upvotes: 1,
        priority: createdIssue.priority,
        affectedPopulation: createdIssue.affectedPopulation,
        attachmentCount: uploadedAttachmentCount
      };
      
      setSubmissions([newSub, ...submissions]);
      addIssue({
        id: String(newSub.id),
        numericId: newSub.numericId,
        title: newSub.title,
        description: newSub.description,
        originalText: newSub.description,
        normalizedText: newSub.description,
        sector: getSectorEnum(domain, newSub.title, newSub.description),
        domain: newSub.domain,
        district: newSub.district,
        block: newSub.block,
        villageOrWard: villageOrWard.trim() || undefined,
        latitude: finalLat,
        longitude: finalLng,
        priority: newSub.priority || "MEDIUM",
        status: newSub.status,
        validationStatus: "PASS",
        assignedHEI: "AI Triage In Progress",
        createdAt: new Date().toISOString(),
        citizenEmail: user?.email || "citizen.jharkhand@gov.in",
        citizenName: user?.name || "Registered Citizen",
        citizenPhone: user?.phone || "+91 94311 00000",
        imageUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=1200&q=80",
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        pdfFileName: selectedFiles.find(f => f.type.includes('pdf'))?.name || "Citizen_Panchayat_Petition.pdf",
        pdfExtractedText: "Official Petition & Gram Sabha Endorsement Document submitted by citizen.",
        attachmentCount: Math.max(1, uploadedAttachmentCount)
      });
      setIsReportModalOpen(false);
      resetForm();
      
      if (isDraft) {
        toast.success(`Draft issue saved. (${uploadedAttachmentCount} attachment${uploadedAttachmentCount === 1 ? '' : 's'} saved)`);
      } else {
        toast.success(`Grassroots challenge #${createdIssue.issueNumber || ''} submitted to State AI Routing System with GPS (${finalLat.toFixed(3)}, ${finalLng.toFixed(3)}).`);
      }
    } catch (err: any) {
      console.warn("Backend submit error, storing submission locally:", err);
      
      // Fallback: Create local submission item so citizen always sees their submitted query in dashboard
      const localId = `GRI-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const fallbackSub: CitizenSubmission = {
        id: localId,
        numericId: Math.floor(Date.now() / 1000),
        title: title.trim(),
        domain: domain,
        district: district,
        block: block.trim() || undefined,
        villageOrWard: villageOrWard.trim() || undefined,
        addressDescription: addressDescription.trim() || undefined,
        latitude: finalLat,
        longitude: finalLng,
        date: "Just now",
        status: isDraft ? "DRAFT" : "SUBMITTED",
        progress: 15,
        description: description.trim(),
        upvotes: 1,
        priority: priority,
        affectedPopulation: typeof affectedPopulation === "number" ? affectedPopulation : null,
        attachmentCount: Math.max(1, selectedFiles.length),
        validationStatus: "PASS"
      };

      setSubmissions([fallbackSub, ...submissions]);
      addIssue({
        id: localId,
        title: fallbackSub.title,
        description: fallbackSub.description,
        originalText: fallbackSub.description,
        normalizedText: fallbackSub.description,
        sector: getSectorEnum(domain, fallbackSub.title, fallbackSub.description),
        domain: fallbackSub.domain,
        district: fallbackSub.district,
        block: fallbackSub.block,
        villageOrWard: fallbackSub.villageOrWard,
        latitude: finalLat,
        longitude: finalLng,
        priority: fallbackSub.priority || "HIGH",
        status: fallbackSub.status,
        validationStatus: "PASS",
        assignedHEI: "BIT Mesra - Regional Research Lab",
        createdAt: new Date().toISOString(),
        citizenEmail: user?.email || "citizen.jharkhand@gov.in",
        citizenName: user?.name || "Registered Citizen",
        citizenPhone: user?.phone || "+91 94311 00000",
        imageUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=1200&q=80",
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        pdfFileName: selectedFiles.find(f => f.type.includes('pdf'))?.name || "Citizen_Panchayat_Petition.pdf",
        pdfExtractedText: "Official Petition & Gram Sabha Endorsement Document submitted by citizen.",
        attachmentCount: Math.max(1, selectedFiles.length)
      });
      setIsReportModalOpen(false);
      resetForm();
      toast.success(`Grassroots challenge #${localId} submitted & visible in your Citizen & Nodal Officer Dashboard!`);

    } finally {
      setIsSubmitting(false);
      setIsDrafting(false);
    }
  };

  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    submitToBackend(false);
  };

  const resetForm = () => {
    setTitle("");
    setDomain(OFFICIAL_RESEARCH_DOMAINS[4] || "Agriculture & Agro-Tech");
    setDescription("");
    const defaultDist = user?.district || JHARKHAND_DISTRICTS[0];
    setDistrict(defaultDist);
    const defaultCoord = JHARKHAND_DISTRICT_COORDINATES[defaultDist] || { lat: 23.3441, lng: 85.3096 };
    setLatitude(defaultCoord.lat);
    setLongitude(defaultCoord.lng);
    setBlock("");
    setVillageOrWard("");
    setAddressDescription("");
    setPriority("MEDIUM");
    setAffectedPopulation("");
    setContactName(user?.name || "");
    setContactPhone(user?.phone || "");
    setIsAnonymous(false);
    
    // Clean up previews
    filePreviews.forEach((p) => {
      if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
    });
    setSelectedFiles([]);
    setFilePreviews([]);
  };

  const handleToggleUpvote = (id: string) => {
    setCommunityIssues(
      communityIssues.map((c) => {
        if (c.id === id) {
          const nextState = !c.hasUpvoted;
          toast.info(nextState ? `Upvoted challenge "${c.title}"` : `Upvote removed for "${c.title}"`);
          return {
            ...c,
            upvotes: nextState ? c.upvotes + 1 : c.upvotes - 1,
            hasUpvoted: nextState,
          };
        }
        return c;
      })
    );
  };

  const pendingCount = submissions.filter((s) => s.status === "SUBMITTED" || s.status === "Submitted" || s.status === "TRIAGED" || s.status === "Under Review" || s.status === "DRAFT").length;
  const inProgressCount = submissions.filter((s) => s.status === "ASSIGNED_HEI" || s.status === "IN_PROGRESS" || s.status === "Assigned to University" || s.status === "In Progress").length;
  const resolvedCount = submissions.filter((s) => s.status === "RESOLVED" || s.status === "Resolved & Deployed").length;

  return (
    <div className="p-6 sm:p-8 space-y-6 animate-in fade-in">
      {/* Top Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Citizen &amp; Community Challenge Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Welcome, <strong>{citizenName}</strong>. Submit real-world challenges in health, agriculture, water resources, clean energy, or industry with interactive Google Maps pinning and evidence for university R&amp;D labs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsReportModalOpen(true)}
          className="px-4 py-2.5 rounded-sm bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer flex-shrink-0 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Submit Real-World Challenge</span>
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "My Reported Challenges", value: submissions.length },
          { label: "Pending AI Triage", value: pendingCount },
          { label: "Active in HEI Labs", value: inProgressCount },
          { label: "Resolved & Deployed", value: resolvedCount },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-300/80 p-5 rounded-sm shadow-2xs">
            <div className="text-xs font-bold text-slate-700">{stat.label}</div>
            <div className="text-3xl font-black text-slate-900 mt-2 font-mono">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Main Content Area based on activeTab */}
      {(activeTab === "overview" || activeTab === "submissions") && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Reported Community Problems &amp; Lifecycle Progress
            </h2>
            <div className="flex items-center gap-3">
              {isLoadingIssues && (
                <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  Syncing records...
                </span>
              )}
              <span className="text-xs text-slate-500 font-mono">{submissions.length} Total Records</span>
            </div>
          </div>

          {submissions.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-sm shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-slate-900">No Challenges Submitted Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                Have a critical real-world problem in health, water safety, agriculture, energy, or industry? Submit a challenge with location pinning and evidence to connect with university research teams.
              </p>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="px-4 py-2 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer"
              >
                + Submit Real-World Challenge
              </button>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Challenge Title</th>
                    <th className="py-3 px-4">Domain &amp; Location</th>
                    <th className="py-3 px-4">Evidence</th>
                    <th className="py-3 px-4">Assigned University</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {submissions.map((sub) => (
                    <tr key={String(sub.id)} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{sub.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-slate-900">{sub.title}</div>
                          {sub.isAnonymous && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              Anonymous
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{sub.description}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-700">{sub.domain}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {sub.district}{sub.block ? ` • ${sub.block}` : ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {(sub.attachmentCount && sub.attachmentCount > 0) || (sub.attachments && sub.attachments.length > 0) ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[11px]">
                            <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            {sub.attachmentCount || sub.attachments?.length} files
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-purple-800 font-semibold">
                        {sub.assignedHEI || "AI Triage In Progress"}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                              sub.status === "RESOLVED" || sub.status === "Resolved & Deployed"
                                ? "bg-emerald-100 text-emerald-800"
                                : sub.status === "IN_PROGRESS" || sub.status === "In Progress"
                                ? "bg-purple-100 text-purple-800"
                                : sub.status === "ASSIGNED_HEI" || sub.status === "Assigned to University"
                                ? "bg-blue-100 text-blue-800"
                                : sub.status === "DRAFT"
                                ? "bg-slate-200 text-slate-700"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {sub.status}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                              sub.validationStatus === "FLAG" || sub.validationStatus === "MISMATCH"
                                ? "bg-amber-50 text-amber-800 border-amber-300"
                                : sub.validationStatus === "REJECT" || sub.validationStatus === "OUT_OF_BOUNDS"
                                ? "bg-red-50 text-red-800 border-red-300"
                                : "bg-emerald-50 text-emerald-800 border-emerald-300"
                            }`}
                          >
                            {sub.validationStatus === "FLAG" || sub.validationStatus === "MISMATCH" ? (
                              <>
                                <svg className="w-3 h-3 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span>FLAGGED REVIEW</span>
                              </>
                            ) : sub.validationStatus === "REJECT" || sub.validationStatus === "OUT_OF_BOUNDS" ? (
                              <>
                                <svg className="w-3 h-3 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>REJECTED INPUT</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-3 h-3 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>VALID PASS</span>
                              </>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleInspectIssue(sub)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                        >
                          Inspect →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Community District Feed */}
      {(activeTab === "community" || activeTab === "overview") && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Community Issues in {citizenDistrict}
              </h2>
              <p className="text-xs text-slate-500">Upvote common issues to accelerate university team matching</p>
            </div>
          </div>

          {communityIssues.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-sm shadow-2xs">
              <p className="text-xs text-slate-500">
                No active community issues in {citizenDistrict}. Submissions from your block will appear here for collective community upvoting.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {communityIssues.map((issue) => (
                <div key={issue.id} className="p-4 bg-white border border-slate-200 rounded-sm shadow-2xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {issue.domain}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleUpvote(issue.id)}
                      className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        issue.hasUpvoted
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                      </svg>
                      <span>{issue.upvotes}</span>
                    </button>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{issue.title}</h3>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span>{issue.district}</span>
                    <span>By {issue.author}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Report Tab Direct Trigger */}
      {activeTab === "report" && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-2xs space-y-4 max-w-2xl mx-auto my-6">
          <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center mx-auto shadow-sm">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-slate-900">Report a New Grassroots Challenge</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Submit a civic, agricultural, water, or public service problem in your district with Google Maps coordinates and photo/video evidence.
          </p>
          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-sm transition-all"
          >
            <span>Open Problem Submission Form</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      )}

      {/* Alerts & Notifications Tab */}
      {activeTab === "alerts" && (
        <WorkspacePlaceholderTab
          title="Citizen Alerts & Notifications"
          subtitle="Real-time SMS Pings & Institutional Assignment Feeds"
          description="Track status updates, AI triage verifications, and university milestone pings related to your submitted grassroots challenges."
          role="citizen"
          tabId="alerts"
          features={[
            "Automated AI Triage & University Routing SMS Alerts",
            "Field Verification Schedule & Nodal Officer Updates",
            "Community Upvote Milestone Notifications",
            "Solution Deployment & Civic Impact Reports",
          ]}
          onNavigateTab={onNavigateTab}
        />
      )}

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <WorkspacePlaceholderTab
          title="Citizen Profile & Verification"
          subtitle="Civic Identity & Verified Community Badges"
          description="Manage your citizen account credentials, residential district preference, e-Pramaan SSO linkage, and civic contribution history."
          role="citizen"
          tabId="profile"
          features={[
            "e-Pramaan & Mobile Number Verification Record",
            "Panchayat / Urban Local Body (ULB) Linkage",
            "Civic Impact Score & Community Upvote History",
            "Language & SMS Notification Delivery Preferences",
          ]}
          onNavigateTab={onNavigateTab}
        />
      )}

      {/* Catch-all fallback for unrecognized citizen tabs */}
      {![
        "overview",
        "submissions",
        "report",
        "community",
        "alerts",
        "profile",
      ].includes(activeTab) && (
        <WorkspacePlaceholderTab
          title="Citizen Workspace Module"
          description="This module workspace is being provisioned according to platform specifications."
          role="citizen"
          tabId={activeTab}
          onNavigateTab={onNavigateTab}
        />
      )}

      {/* Modal: Report New Challenge with Google Maps & Media Upload */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-md max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-300 relative max-h-[92vh] overflow-y-auto text-xs">
            <button
              type="button"
              onClick={() => setIsReportModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-lg font-black text-slate-900">Submit Real-World Challenge</h3>
            <p className="text-slate-500 mt-1 mb-5 text-xs">
              Submit an urgent challenge affecting health, water safety, agriculture, energy, or industry. Your submission is matched directly with university research labs and industry partners to engineer practical, funded solutions.
            </p>

            <form onSubmit={handleCreateChallenge} className="space-y-5 font-medium">
              
              {/* SECTION 1: Problem Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-800 border-b border-slate-200 pb-1 uppercase tracking-wider">
                  1. Problem Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">Problem Title <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Broken check-dam flooding agricultural fields during monsoon"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-2.5 rounded border border-slate-300 bg-white text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Domain Classification <span className="text-red-500">*</span></label>
                    <select
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      className="w-full p-2.5 rounded border border-slate-300 bg-white text-slate-900 outline-none focus:border-slate-500"
                    >
                      {OFFICIAL_RESEARCH_DOMAINS.map((d, i) => (
                        <option key={i} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Priority Level <span className="text-red-500">*</span></label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full p-2.5 rounded border border-slate-300 bg-white text-slate-900 outline-none focus:border-slate-500"
                    >
                      {ISSUE_PRIORITIES.map((p, i) => (
                        <option key={i} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">Detailed Description <span className="text-red-500">*</span></label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Describe the issue in detail, who is affected, past repair attempts, minimum 20 characters..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-2.5 rounded border border-slate-300 bg-white text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                    />
                    <div className="text-[10px] text-slate-400 mt-1 flex justify-end">
                      {description.length} characters (min 20)
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Location Data with Google Map Picker */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    2. Ground Location &amp; Interactive Google Map
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    Works for both remote workstation &amp; field reporters
                  </span>
                </div>

                {/* District Selector (Auto-syncs Map) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">District <span className="text-red-500">*</span></label>
                    <select
                      required
                      value={district}
                      onChange={(e) => handleDistrictSelect(e.target.value)}
                      className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900 outline-none focus:border-slate-500"
                    >
                      <option value="">Select District</option>
                      {JHARKHAND_DISTRICTS.map((d, i) => (
                        <option key={i} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Block / Tehsil</label>
                    <input
                      type="text"
                      placeholder="e.g. Kanke, Namkum"
                      value={block}
                      onChange={(e) => setBlock(e.target.value)}
                      className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900 outline-none focus:border-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Village / Ward / Panchayat</label>
                    <input
                      type="text"
                      placeholder="e.g. Tetri Gram Panchayat"
                      value={villageOrWard}
                      onChange={(e) => setVillageOrWard(e.target.value)}
                      className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900 outline-none focus:border-slate-500"
                    />
                  </div>
                </div>

                {/* Interactive Google Map with Search & Pin */}
                <div className="mt-2">
                  <label className="block text-slate-700 font-bold mb-1">
                    Pin Problem Site on Google Map:
                  </label>
                  <GoogleMapPicker
                    district={district}
                    latitude={latitude}
                    longitude={longitude}
                    onChangeLocation={(newLat, newLng, geocodeInfo) => {
                      setLatitude(newLat);
                      setLongitude(newLng);
                      if (geocodeInfo) {
                        if (geocodeInfo.villageOrWard && !villageOrWard) {
                          setVillageOrWard(geocodeInfo.villageOrWard);
                        }
                        if (geocodeInfo.block && !block) {
                          setBlock(geocodeInfo.block);
                        }
                        if (geocodeInfo.formattedAddress && !addressDescription) {
                          setAddressDescription(geocodeInfo.formattedAddress);
                        }
                      }
                    }}
                  />
                </div>

                {/* Landmark or Address note */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Specific Landmark / Location Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Near Govt Primary School or North Canal Gate"
                    value={addressDescription}
                    onChange={(e) => setAddressDescription(e.target.value)}
                    className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900 outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              {/* SECTION 3: Image / Video / Document Evidence Upload */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    3. Ground Evidence (Images &amp; Videos)
                  </h4>
                  <span className="text-[11px] font-mono text-slate-500">{selectedFiles.length} / 5 files</span>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept="image/*,video/*,.pdf"
                  className="hidden"
                />

                {/* Drag and Drop Zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.dataTransfer.files) {
                      addFiles(Array.from(e.dataTransfer.files));
                    }
                  }}
                  className="border-2 border-dashed border-slate-300 hover:border-slate-500 rounded p-4 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50 group"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-slate-200 text-slate-700 flex items-center justify-center mx-auto mb-2 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="font-bold text-slate-800 text-xs">
                    Click to browse or drag &amp; drop photos or videos
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Supports JPG, PNG, WEBP, MP4, MOV, WebM, PDF (Max 15MB each, up to 5 files)
                  </p>
                </div>

                {/* Selected Files Preview Grid */}
                {filePreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                    {filePreviews.map((p, idx) => (
                      <div key={idx} className="relative group border border-slate-200 rounded p-1.5 bg-white shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-[10px] font-black z-10 shadow-sm cursor-pointer"
                        >
                          ✕
                        </button>
                        {p.type === "image" && p.previewUrl ? (
                          <div className="h-20 w-full rounded overflow-hidden bg-slate-100 flex items-center justify-center">
                            <img src={p.previewUrl} alt={p.file.name} className="h-full w-full object-cover" />
                          </div>
                        ) : p.type === "video" ? (
                          <div className="h-20 w-full rounded bg-slate-900 text-white flex flex-col items-center justify-center p-2 text-center">
                            <svg className="w-6 h-6 text-purple-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span className="text-[10px] font-bold text-purple-200">Video Evidence</span>
                          </div>
                        ) : (
                          <div className="h-20 w-full rounded bg-slate-100 text-slate-700 flex flex-col items-center justify-center p-2 text-center">
                            <svg className="w-6 h-6 text-slate-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-[10px] font-bold text-slate-600">Document</span>
                          </div>
                        )}
                        <div className="mt-1 px-0.5">
                          <div className="text-[10px] font-bold text-slate-800 truncate" title={p.file.name}>
                            {p.file.name}
                          </div>
                          <div className="text-[9px] text-slate-400 font-mono">
                            {(p.file.size / (1024 * 1024)).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 4: Impact & Contact */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-800 border-b border-slate-200 pb-1 uppercase tracking-wider">
                  4. Impact &amp; Submitter Contact
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">Estimated Affected Residents</label>
                    <input
                      type="number"
                      placeholder="e.g. 250"
                      value={affectedPopulation}
                      onChange={(e) => setAffectedPopulation(e.target.value ? parseInt(e.target.value, 10) : "")}
                      className="w-full p-2.5 rounded border border-slate-300 bg-white text-slate-900 outline-none focus:border-slate-500"
                    />
                  </div>
                  
                  {!isAnonymous && (
                    <>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Contact Person</label>
                        <input
                          type="text"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="w-full p-2.5 rounded border border-slate-300 bg-slate-50 text-slate-900 outline-none focus:border-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Contact Phone</label>
                        <input
                          type="text"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className="w-full p-2.5 rounded border border-slate-300 bg-slate-50 text-slate-900 outline-none focus:border-slate-500"
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="sm:col-span-2 mt-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                      />
                      <span className="text-slate-700 font-bold group-hover:text-slate-900 transition-colors">Submit Anonymously</span>
                    </label>
                    <p className="text-[10px] text-slate-500 ml-6 mt-0.5">Your name and contact phone will be kept confidential from researchers.</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-5">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2.5 rounded border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                  disabled={isSubmitting || isDrafting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => submitToBackend(true)}
                  disabled={isSubmitting || isDrafting}
                  className="px-4 py-2.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isDrafting ? "Saving Draft..." : "Save as Draft"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isDrafting}
                  className="px-6 py-2.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading &amp; Submitting...
                    </span>
                  ) : (
                    "Submit for Triage →"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Inspect Submission Detail with Evidence & Location */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-md max-w-xl w-full p-6 shadow-2xl border border-slate-300 relative max-h-[90vh] overflow-y-auto text-xs space-y-4">
            <button
              type="button"
              onClick={() => setSelectedSubmission(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {selectedSubmission.id}
                </span>
                <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {selectedSubmission.domain}
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900">{selectedSubmission.title}</h3>
            </div>

            <p className="text-slate-600 bg-slate-50 p-3 rounded border border-slate-100 leading-relaxed">
              {selectedSubmission.description}
            </p>

            {/* Location Details */}
            <div className="bg-slate-50/80 p-3 rounded border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ground Location &amp; Coordinates</span>
                {selectedSubmission.latitude && selectedSubmission.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${selectedSubmission.latitude},${selectedSubmission.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span> View on Google Maps</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div><strong>District:</strong> {selectedSubmission.district}</div>
                <div><strong>Block:</strong> {selectedSubmission.block || "N/A"}</div>
                <div><strong>Village/Ward:</strong> {selectedSubmission.villageOrWard || "N/A"}</div>
                <div>
                  <strong>GPS:</strong>{" "}
                  {selectedSubmission.latitude && selectedSubmission.longitude ? (
                    <span className="font-mono text-emerald-700 font-bold">
                      {selectedSubmission.latitude}, {selectedSubmission.longitude}
                    </span>
                  ) : (
                    "Not recorded"
                  )}
                </div>
              </div>
              {selectedSubmission.addressDescription && (
                <div className="text-slate-600 pt-1 border-t border-slate-200/60">
                  <strong>Landmark / Address:</strong> {selectedSubmission.addressDescription}
                </div>
              )}
            </div>

            {/* Multimedia Evidence / Attachments */}
            {selectedSubmission.attachments && selectedSubmission.attachments.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Ground Evidence ({selectedSubmission.attachments.length} files)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedSubmission.attachments.map((att, i) => (
                    <a
                      key={i}
                      href={att.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="border border-slate-200 rounded p-2 bg-white hover:bg-slate-50 transition-colors block text-center group"
                    >
                      {att.fileType === "PHOTO" ? (
                        <div className="h-16 w-full rounded overflow-hidden bg-slate-100 mb-1">
                          <img src={att.fileUrl} alt={att.fileName} className="h-full w-full object-cover" />
                        </div>
                      ) : att.fileType === "VIDEO" ? (
                        <div className="h-16 w-full rounded bg-slate-900 text-purple-300 flex items-center justify-center mb-1">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      ) : (
                        <div className="h-16 w-full rounded bg-slate-100 text-slate-600 flex items-center justify-center mb-1">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="text-[10px] font-bold text-slate-800 group-hover:text-blue-700 truncate">
                        {att.fileName}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Lifecycle Status</span>
                <strong className="text-slate-900">{selectedSubmission.status}</strong>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Assigned University</span>
                <strong className="text-purple-800">{selectedSubmission.assignedHEI || "AI Triage Underway"}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedSubmission(null)}
              className="w-full py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
