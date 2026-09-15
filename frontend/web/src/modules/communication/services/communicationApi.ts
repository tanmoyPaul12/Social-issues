import { extractApiErrorMessage } from "@/lib/api/apiErrorHelper";

export interface CommunicationThread {
  id: number;
  pilotId?: number;
  title: string;
  partnerName: string;
  partnerRole: string;
  sector: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  type: "PILOT" | "MARKETPLACE" | "ADVISORY";
  avatarBg: string;
  universityName?: string;
  companyName?: string;
}

export interface CommunicationMessage {
  id: number;
  senderUserId?: number;
  senderName: string;
  senderRole: "FACULTY_PI" | "INDUSTRY_SPOC" | "STUDENT_LEAD" | "TECH_MENTOR" | "SYSTEM" | string;
  message: string;
  timestamp: string;
  attachmentName?: string;
  attachmentSize?: string;
  attachmentUrl?: string;
  isCurrentUser?: boolean;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080/api";

// Shared localStorage keys for cross-portal sync
const STORAGE_KEY = "social_issues_live_discussions_v1";
const THREAD_STORAGE_KEY = "social_issues_pitched_threads_v1";

function getHeaders(token?: string | null): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  }
  return headers;
}

/**
 * LocalStorage Thread Persistence Helpers
 */
export function getLocalPitchedThreads(): CommunicationThread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(THREAD_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function registerProjectPitchThread(thread: CommunicationThread): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalPitchedThreads();
    const duplicateIdx = existing.findIndex((t) => t.id === thread.id || t.title === thread.title);
    let updated: CommunicationThread[];
    if (duplicateIdx !== -1) {
      // Update existing thread with fresh data
      updated = existing.map((t, idx) => idx === duplicateIdx ? { ...t, ...thread } : t);
    } else {
      updated = [thread, ...existing];
    }
    localStorage.setItem(THREAD_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to register project pitch thread:", err);
  }
}

/** Clear all locally stored pitch threads (for cleanup / reset) */
export function clearLocalPitchedThreads(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(THREAD_STORAGE_KEY);
  } catch {}
}

/**
 * LocalStorage Discussion Messages Persistence Helpers
 */
export function getLocalStoredMessagesMap(): Record<number, CommunicationMessage[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getLocalStoredMessages(threadId: number): CommunicationMessage[] {
  const map = getLocalStoredMessagesMap();
  // Use String key to match how JSON.parse stores numeric keys
  return (map as any)[String(threadId)] || [];
}

export function saveLocalStoredMessage(threadId: number, message: CommunicationMessage): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const map: Record<string, CommunicationMessage[]> = raw ? JSON.parse(raw) : {};
    const key = String(threadId);
    const existing: CommunicationMessage[] = map[key] || [];
    // Only deduplicate by ID
    const isDuplicate = existing.some((m) => m.id === message.id);
    if (!isDuplicate) {
      map[key] = [...existing, message];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    }
  } catch (err) {
    console.warn("Failed to persist message to localStorage:", err);
  }
}

/**
 * Compute isCurrentUser based on the viewing user's role
 */
function computeIsMe(senderRole: string, viewerRole?: string): boolean {
  const role = (senderRole || "").toUpperCase();
  const isUniViewer = viewerRole?.toUpperCase().includes("UNIVERSITY");

  if (isUniViewer) {
    return (
      role.includes("FACULTY") ||
      role.includes("STUDENT") ||
      role.includes("UNIVERSITY") ||
      role.includes("HEI")
    );
  } else {
    return (
      role.includes("INDUSTRY") ||
      role.includes("CSR") ||
      role.includes("SPOC") ||
      role.includes("PARTNER")
    );
  }
}

/**
 * Fetch project communication threads for the logged-in user.
 * Prioritizes locally pitched threads so both portals see the same channels.
 */
export async function fetchCommunicationThreads(
  token?: string | null,
  userRole?: string
): Promise<CommunicationThread[]> {
  // Always start with locally pitched threads (these are shared cross-portal)
  const localThreads = getLocalPitchedThreads();

  try {
    const endpoint = userRole?.toUpperCase().includes("UNIVERSITY")
      ? `${API_BASE_URL}/university/projects`
      : `${API_BASE_URL}/industry/dashboard/pilots`;

    const response = await fetch(endpoint, {
      method: "GET",
      headers: getHeaders(token),
      cache: "no-store",
    });

    if (response.ok) {
      const data = await response.json();
      const content = Array.isArray(data) ? data : data?.content || [];
      if (Array.isArray(content) && content.length > 0) {
        const apiThreads: CommunicationThread[] = content.map((pilot: any, idx: number) => ({
          id: pilot.id || idx + 1,
          pilotId: pilot.id || idx + 1,
          title: pilot.title || pilot.projectName || `Project Pilot #${pilot.id || idx + 1}`,
          partnerName: userRole?.toUpperCase().includes("UNIVERSITY")
            ? pilot.companyName || pilot.targetSponsorCompany || "Corporate CSR Partner"
            : pilot.leadPiName || pilot.spocName || pilot.universityName || "University Project Lead",
          partnerRole: userRole?.toUpperCase().includes("UNIVERSITY")
            ? `CSR Partner • ${pilot.sector || "CSR Grant"}`
            : `Lead PI • ${pilot.universityName || "University"}`,
          sector: pilot.sector || pilot.domain || "Societal Innovation",
          lastMessage: pilot.lastActivity || "Active project discussion channel open.",
          timestamp: "Recently",
          unreadCount: 0,
          type: "PILOT" as const,
          avatarBg: idx % 2 === 0 ? "bg-indigo-600" : "bg-emerald-600",
          universityName: pilot.universityName,
          companyName: pilot.companyName,
        }));

        // Merge: local pitched threads take priority (they have correct cross-portal IDs)
        const combined = [...localThreads];
        for (const apiThread of apiThreads) {
          if (!combined.some((t) => t.id === apiThread.id)) {
            combined.push(apiThread);
          }
        }
        return combined;
      }
    }
  } catch (err) {
    console.warn("API Gateway pilot list fetch note:", err);
  }

  // Fallback: only locally pitched threads
  return localThreads;
}

/**
 * Fetch thread discussion messages — merged from API + shared localStorage.
 * Both portals read from the same localStorage key so messages sync instantly.
 */
export async function fetchThreadMessages(
  token: string | null | undefined,
  threadId: number,
  pilotId?: number,
  currentRole?: string
): Promise<CommunicationMessage[]> {
  const targetId = pilotId || threadId;
  let apiMessages: CommunicationMessage[] = [];

  try {
    const response = await fetch(
      `${API_BASE_URL}/industry/dashboard/pilots/${targetId}/discussions`,
      {
        method: "GET",
        headers: getHeaders(token),
        cache: "no-store",
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        apiMessages = data.map((msg: any) => ({
          id: msg.id || Date.now(),
          senderUserId: msg.senderUserId,
          senderName: msg.senderName || "Project Contributor",
          senderRole: msg.senderRole || "INDUSTRY_SPOC",
          message: msg.message || "",
          timestamp: msg.createdAt
            ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Recently",
          attachmentName: msg.attachmentName,
          attachmentUrl: msg.attachmentUrl,
          attachmentSize: msg.attachmentSize || (msg.attachmentUrl ? "Document" : undefined),
          isCurrentUser: computeIsMe(msg.senderRole || "", currentRole),
        }));
      }
    }
  } catch (err) {
    console.warn("API Gateway fetch discussions note:", err);
  }

  // Merge with shared localStorage messages (cross-portal sync)
  const stored = getLocalStoredMessages(threadId);
  const formattedStored = stored.map((m) => ({
    ...m,
    isCurrentUser: computeIsMe(m.senderRole || "", currentRole),
  }));

  // Deduplicate by message ID only
  const combined = [...apiMessages];
  for (const s of formattedStored) {
    if (!combined.some((a) => a.id === s.id)) {
      combined.push(s);
    }
  }

  // Sort by ID (chronological)
  combined.sort((a, b) => a.id - b.id);

  return combined;
}

/**
 * Post a new message to a discussion thread.
 * Writes to shared localStorage instantly so both portals see it via polling.
 */
export async function postThreadMessage(
  token: string | null | undefined,
  threadId: number,
  message: string,
  attachmentName?: string,
  attachmentUrl?: string,
  pilotId?: number,
  senderName?: string,
  senderRole?: string
): Promise<CommunicationMessage> {
  const targetId = pilotId || threadId;
  const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const newMsg: CommunicationMessage = {
    id: Date.now(),
    senderName: senderName || "You",
    senderRole: senderRole || "INDUSTRY_SPOC",
    message: message.trim(),
    timestamp,
    attachmentName,
    attachmentUrl,
    isCurrentUser: true,
  };

  // 1. Save to SHARED localStorage instantly — both portals poll this key
  saveLocalStoredMessage(threadId, newMsg);

  // 2. Post to API Gateway Database (best effort)
  try {
    const response = await fetch(
      `${API_BASE_URL}/industry/dashboard/pilots/${targetId}/discussions`,
      {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify({
          message,
          attachmentName,
          attachmentUrl,
          senderName: senderName || "Project Contributor",
          senderRole: senderRole || "INDUSTRY_SPOC",
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const disc = data.discussion || data;
      if (disc?.id) {
        newMsg.id = disc.id;
      }
    }
  } catch (err: any) {
    console.warn("Posting to API Gateway note:", err);
  }

  return newMsg;
}
