import { extractApiErrorMessage } from "@/lib/api/apiErrorHelper";

export interface CommunicationThread {
  id: number;
  channelKey: string;
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
  universityName: string;
  companyName: string;
}

export interface CommunicationMessage {
  id: number;
  channelKey: string;
  senderUserId?: number;
  senderName: string;
  senderRole:
    | "FACULTY_PI"
    | "FACULTY_MENTOR"
    | "STUDENT_LEAD"
    | "STUDENT_INNOVATOR"
    | "INDUSTRY_SPOC"
    | "TECH_MENTOR"
    | "CSR_LEAD"
    | "SYSTEM"
    | string;
  senderPortal: "UNIVERSITY" | "INDUSTRY" | "SYSTEM";
  message: string;
  timestamp: string;
  attachmentName?: string;
  attachmentSize?: string;
  attachmentUrl?: string;
  isCurrentUser?: boolean;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080/api";

// Universal Storage Keys
export const STORAGE_CHANNELS_KEY = "social_issues_unified_channels_v2";
export const STORAGE_MESSAGES_KEY = "social_issues_unified_messages_v2";
export const BC_CHANNEL = "jharkhand_collab_chat_sync_v2";
export const CHAT_EVENT_NAME = "jharkhand_chat_local_sync_v2";

export function getCanonicalSlug(title?: string): string {
  if (!title) return "general_channel";
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

/**
 * Standard Universal Collaborative Channels seeded for all participants
 */
export const DEFAULT_UNIVERSAL_CHANNELS: CommunicationThread[] = [
  {
    id: 1,
    channelKey: "arsenic_filtration_unit",
    pilotId: 1,
    title: "Arsenic & Turbidity Inline Filtration Unit",
    partnerName: "Tata Steel CSR Foundation",
    partnerRole: "CSR Sponsor • Water & Sanitation",
    sector: "Water & Sanitation",
    lastMessage: "Prototype telemetry calibrated for Sahibganj testbed.",
    timestamp: "10:30 AM",
    unreadCount: 0,
    type: "PILOT",
    avatarBg: "bg-indigo-600",
    universityName: "Birla Institute of Technology (BIT) Mesra",
    companyName: "Tata Steel CSR Foundation",
  },
  {
    id: 2,
    channelKey: "soil_nutrient_sensing_grid",
    pilotId: 2,
    title: "IoT LoRaWAN Soil Nutrient & Moisture Sensing Grid",
    partnerName: "Coal India CSR Technology Wing",
    partnerRole: "CSR Sponsor • AgriTech & IoT",
    sector: "AgriTech & IoT",
    lastMessage: "Subsurface probe PCB schematics approved by technical mentor.",
    timestamp: "Yesterday",
    unreadCount: 0,
    type: "PILOT",
    avatarBg: "bg-emerald-600",
    universityName: "Birsa Agricultural University (BAU) Kanke",
    companyName: "Coal India CSR Technology Wing",
  },
  {
    id: 3,
    channelKey: "solar_microgrid_energy_storage",
    pilotId: 3,
    title: "Solar Microgrid & Energy Storage Optimization",
    partnerName: "Adani Foundation CSR",
    partnerRole: "CSR Sponsor • Clean Energy",
    sector: "Clean Energy",
    lastMessage: "Inverter firmware v2.4 validated in institutional lab.",
    timestamp: "Sep 14",
    unreadCount: 0,
    type: "PILOT",
    avatarBg: "bg-amber-600",
    universityName: "NIT Jamshedpur",
    companyName: "Adani Foundation CSR",
  },
  {
    id: 4,
    channelKey: "kiln_emissions_telemetry",
    pilotId: 4,
    title: "Unmonitored Industrial Kiln Particulate Emissions Telemetry",
    partnerName: "Tanmoys Firm / Corporate CSR",
    partnerRole: "CSR Sponsor • Environmental IoT",
    sector: "Environmental Monitoring",
    lastMessage: "Grant proposal pitch submitted for prototype execution.",
    timestamp: "Just now",
    unreadCount: 0,
    type: "PILOT",
    avatarBg: "bg-purple-600",
    universityName: "Birla Institute of Technology (BIT) Mesra",
    companyName: "Tanmoys Firm / Corporate CSR",
  },
];

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
 * Dispatch real-time events across all tabs (BroadcastChannel) and same-window (CustomEvent)
 */
export function broadcastChatUpdate(channelKey: string, threadId: number, threadTitle?: string): void {
  if (typeof window === "undefined") return;

  const payload = {
    channelKey,
    threadId,
    threadTitle: threadTitle || "",
    timestamp: Date.now(),
  };

  // 1. Same-window custom event
  try {
    window.dispatchEvent(new CustomEvent(CHAT_EVENT_NAME, { detail: payload }));
  } catch {}

  // 2. Cross-tab BroadcastChannel
  try {
    const bc = new BroadcastChannel(BC_CHANNEL);
    bc.postMessage(payload);
    bc.close();
  } catch {}
}

/**
 * Read all stored channels from localStorage
 */
export function getLocalStoredChannels(): CommunicationThread[] {
  if (typeof window === "undefined") return DEFAULT_UNIVERSAL_CHANNELS;
  try {
    const raw = localStorage.getItem(STORAGE_CHANNELS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_CHANNELS_KEY, JSON.stringify(DEFAULT_UNIVERSAL_CHANNELS));
      return DEFAULT_UNIVERSAL_CHANNELS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_CHANNELS_KEY, JSON.stringify(DEFAULT_UNIVERSAL_CHANNELS));
    return DEFAULT_UNIVERSAL_CHANNELS;
  } catch {
    return DEFAULT_UNIVERSAL_CHANNELS;
  }
}

/**
 * Register or update a project communication thread
 */
export function registerProjectPitchThread(thread: Partial<CommunicationThread> & { title: string }): CommunicationThread {
  const existing = getLocalStoredChannels();
  const slug = getCanonicalSlug(thread.title);

  const matchedIdx = existing.findIndex(
    (t) =>
      (thread.id && t.id === thread.id) ||
      (thread.channelKey && t.channelKey === thread.channelKey) ||
      getCanonicalSlug(t.title) === slug
  );

  const fullThread: CommunicationThread = {
    id: thread.id || (matchedIdx !== -1 ? existing[matchedIdx].id : Date.now()),
    channelKey: slug,
    pilotId: thread.pilotId || (matchedIdx !== -1 ? existing[matchedIdx].pilotId : 1),
    title: thread.title,
    partnerName: thread.partnerName || (matchedIdx !== -1 ? existing[matchedIdx].partnerName : "Corporate CSR Partner"),
    partnerRole: thread.partnerRole || "CSR Sponsor",
    sector: thread.sector || "Innovation & Prototyping",
    lastMessage: thread.lastMessage || "Channel opened.",
    timestamp: thread.timestamp || "Just now",
    unreadCount: thread.unreadCount || 0,
    type: thread.type || "PILOT",
    avatarBg: thread.avatarBg || "bg-indigo-600",
    universityName: thread.universityName || "Birla Institute of Technology (BIT) Mesra",
    companyName: thread.companyName || thread.partnerName || "Corporate CSR Partner",
  };

  let updated: CommunicationThread[];
  if (matchedIdx !== -1) {
    updated = existing.map((t, idx) => (idx === matchedIdx ? { ...t, ...fullThread } : t));
  } else {
    updated = [fullThread, ...existing];
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_CHANNELS_KEY, JSON.stringify(updated));
    } catch {}
  }

  broadcastChatUpdate(slug, fullThread.id, fullThread.title);
  return fullThread;
}

/**
 * Clear channels and reset to default
 */
export function clearLocalPitchedThreads(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_CHANNELS_KEY, JSON.stringify(DEFAULT_UNIVERSAL_CHANNELS));
    localStorage.removeItem(STORAGE_MESSAGES_KEY);
    broadcastChatUpdate("all", 0, "Reset");
  } catch {}
}

/**
 * Read the entire message map from storage
 */
export function getLocalMessagesMap(): Record<string, CommunicationMessage[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_MESSAGES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Retrieve messages for a given thread / channel
 */
export function getLocalStoredMessages(threadId: number | string, threadTitle?: string): CommunicationMessage[] {
  const map = getLocalMessagesMap();
  const keyId = String(threadId);
  const slug = getCanonicalSlug(threadTitle);

  const byId = map[keyId] || [];
  const bySlug = slug && map[slug] ? map[slug] : [];

  const combined = [...byId];
  for (const m of bySlug) {
    const isDup = combined.some((c) => c.id === m.id || (c.message === m.message && c.timestamp === m.timestamp && c.senderName === m.senderName));
    if (!isDup) {
      combined.push(m);
    }
  }

  combined.sort((a, b) => a.id - b.id);
  return combined;
}

/**
 * Save a message into the local discussion store
 */
export function saveLocalStoredMessage(
  threadId: number | string,
  message: CommunicationMessage,
  threadTitle?: string
): void {
  if (typeof window === "undefined") return;
  try {
    const map = getLocalMessagesMap();
    const keyId = String(threadId);
    const slug = getCanonicalSlug(threadTitle || message.channelKey);

    const append = (k: string) => {
      if (!k) return;
      const list = map[k] || [];
      const dup = list.some((m) => m.id === message.id || (m.message === message.message && m.timestamp === message.timestamp && m.senderName === message.senderName));
      if (!dup) {
        map[k] = [...list, message];
      }
    };

    append(keyId);
    if (slug) append(slug);

    localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(map));

    // Update lastMessage in channel list
    const channels = getLocalStoredChannels();
    const updatedChannels = channels.map((c) => {
      const match = String(c.id) === keyId || getCanonicalSlug(c.title) === slug;
      if (match) {
        return {
          ...c,
          lastMessage: message.message.length > 60 ? message.message.substring(0, 57) + "..." : message.message,
          timestamp: message.timestamp || "Just now",
        };
      }
      return c;
    });
    localStorage.setItem(STORAGE_CHANNELS_KEY, JSON.stringify(updatedChannels));
  } catch (err) {
    console.warn("Failed to persist message:", err);
  }
}

/**
 * Helper: Determine if a message was sent by the current viewer
 */
export function computeIsMe(
  msg: CommunicationMessage,
  viewerRole: "university" | "industry" | string
): boolean {
  const isUniViewer = viewerRole?.toLowerCase().includes("university");
  if (msg.senderPortal === "SYSTEM") return false;

  if (isUniViewer) {
    return msg.senderPortal === "UNIVERSITY";
  } else {
    return msg.senderPortal === "INDUSTRY";
  }
}

/**
 * Fetch all communication channels dynamically for the dashboard
 */
export async function fetchCommunicationThreads(
  token?: string | null,
  userRole?: string
): Promise<CommunicationThread[]> {
  const isUni = userRole?.toLowerCase().includes("university");
  const localChannels = getLocalStoredChannels();
  const apiThreads: CommunicationThread[] = [];

  try {
    const endpoint = isUni
      ? `${API_BASE_URL}/university/projects`
      : `${API_BASE_URL}/industry/dashboard/pilots`;

    const res = await fetch(endpoint, {
      method: "GET",
      headers: getHeaders(token),
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      const content = Array.isArray(data) ? data : data?.content || [];
      if (Array.isArray(content)) {
        content.forEach((item: any, idx: number) => {
          const title = item.title || item.projectName || `Project #${item.id || idx + 1}`;
          const uni = item.universityName || "Birla Institute of Technology (BIT) Mesra";
          const comp = item.companyName || item.csrPartner || item.targetSponsorCompany || "Corporate CSR Partner";

          apiThreads.push({
            id: item.id || idx + 1,
            channelKey: getCanonicalSlug(title),
            pilotId: item.id || idx + 1,
            title,
            partnerName: isUni ? comp : uni,
            partnerRole: isUni ? `CSR Sponsor • ${comp}` : `Lead PI • ${uni}`,
            sector: item.sector || item.domain || "Innovation",
            lastMessage: item.currentMilestone || "Discussion channel open.",
            timestamp: "Recently",
            unreadCount: 0,
            type: "PILOT",
            avatarBg: idx % 3 === 0 ? "bg-indigo-600" : idx % 3 === 1 ? "bg-emerald-600" : "bg-amber-600",
            universityName: uni,
            companyName: comp,
          });
        });
      }
    }
  } catch (err) {
    console.warn("Live API channels notice:", err);
  }

  // Merge API channels and local channels seamlessly
  const mergedMap = new Map<string, CommunicationThread>();

  // 1. Add default & local channels
  localChannels.forEach((c) => {
    const slug = getCanonicalSlug(c.title);
    const msgs = getLocalStoredMessages(c.id, c.title);
    const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1].message : c.lastMessage;
    const lastTs = msgs.length > 0 ? msgs[msgs.length - 1].timestamp : c.timestamp;

    mergedMap.set(slug, {
      ...c,
      partnerName: isUni ? c.companyName || c.partnerName || "Corporate CSR Partner" : c.universityName || c.partnerName || "University Research Lab",
      partnerRole: isUni ? `CSR Sponsor • ${c.companyName || "Corporate Partner"}` : `Lead PI • ${c.universityName || "University Innovation Lab"}`,
      lastMessage: lastMsg.length > 60 ? lastMsg.substring(0, 57) + "..." : lastMsg,
      timestamp: lastTs,
    });
  });

  // 2. Overlay API channels
  apiThreads.forEach((api) => {
    const slug = getCanonicalSlug(api.title);
    if (mergedMap.has(slug)) {
      const existing = mergedMap.get(slug)!;
      mergedMap.set(slug, {
        ...existing,
        id: api.id,
        pilotId: api.pilotId,
      });
    } else {
      mergedMap.set(slug, api);
    }
  });

  return Array.from(mergedMap.values());
}

/**
 * Fetch thread discussion messages — combines local storage and backend persistence
 */
export async function fetchThreadMessages(
  token: string | null | undefined,
  threadId: number | string,
  pilotId?: number,
  currentRole?: string,
  threadTitle?: string
): Promise<CommunicationMessage[]> {
  const isUni = currentRole?.toLowerCase().includes("university");
  const targetId = pilotId || (typeof threadId === "number" ? threadId : 1);
  let apiMessages: CommunicationMessage[] = [];

  try {
    const endpoint = isUni
      ? `${API_BASE_URL}/university/projects/${targetId}/discussions`
      : `${API_BASE_URL}/industry/dashboard/pilots/${targetId}/discussions`;

    const res = await fetch(endpoint, {
      method: "GET",
      headers: getHeaders(token),
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        apiMessages = data.map((msg: any) => {
          const role = (msg.senderRole || "").toUpperCase();
          const isUniSender = role.includes("FACULTY") || role.includes("STUDENT") || role.includes("UNIVERSITY");
          const portal: "UNIVERSITY" | "INDUSTRY" = isUniSender ? "UNIVERSITY" : "INDUSTRY";

          const newMsg: CommunicationMessage = {
            id: msg.id || Date.now(),
            channelKey: getCanonicalSlug(threadTitle),
            senderUserId: msg.senderUserId,
            senderName: msg.senderName || (isUniSender ? "University Lead PI" : "Industry CSR SPOC"),
            senderRole: msg.senderRole || (isUniSender ? "FACULTY_PI" : "INDUSTRY_SPOC"),
            senderPortal: portal,
            message: msg.message || "",
            timestamp: msg.createdAt
              ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "Recently",
            attachmentName: msg.attachmentName,
            attachmentUrl: msg.attachmentUrl,
          };
          newMsg.isCurrentUser = computeIsMe(newMsg, currentRole || "industry");
          return newMsg;
        });
      }
    }
  } catch (err) {
    console.warn("Live API fetch messages notice:", err);
  }

  // Local stored messages
  const localMsgs = getLocalStoredMessages(threadId, threadTitle);
  const formattedLocal = localMsgs.map((m) => ({
    ...m,
    isCurrentUser: computeIsMe(m, currentRole || "industry"),
  }));

  // Merge and deduplicate
  const merged = [...apiMessages];
  for (const loc of formattedLocal) {
    const exists = merged.some(
      (m) =>
        m.id === loc.id ||
        (m.message === loc.message && m.timestamp === loc.timestamp && m.senderName === loc.senderName)
    );
    if (!exists) {
      merged.push(loc);
    }
  }

  merged.sort((a, b) => a.id - b.id);
  return merged;
}

/**
 * Post a new message to a collaborative discussion thread
 */
export async function postThreadMessage(
  token: string | null | undefined,
  threadId: number | string,
  message: string,
  attachmentName?: string,
  attachmentUrl?: string,
  pilotId?: number,
  senderName?: string,
  senderRole?: string,
  threadTitle?: string,
  senderPortal?: "UNIVERSITY" | "INDUSTRY"
): Promise<CommunicationMessage> {
  const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const slug = getCanonicalSlug(threadTitle);

  const role = senderRole || (senderPortal === "UNIVERSITY" ? "FACULTY_PI" : "INDUSTRY_SPOC");
  const portal = senderPortal || (role.includes("FACULTY") || role.includes("STUDENT") ? "UNIVERSITY" : "INDUSTRY");
  const name = senderName || (portal === "UNIVERSITY" ? "Faculty Lead PI" : "Industry CSR SPOC");

  const newMsg: CommunicationMessage = {
    id: Date.now(),
    channelKey: slug,
    senderName: name,
    senderRole: role,
    senderPortal: portal,
    message: message.trim(),
    timestamp,
    attachmentName,
    attachmentUrl,
    isCurrentUser: true,
  };

  // 1. Save to local multi-key storage immediately
  saveLocalStoredMessage(threadId, newMsg, threadTitle);

  // 2. Broadcast immediately across all open tabs/windows in 0ms
  broadcastChatUpdate(slug, typeof threadId === "number" ? threadId : Date.now(), threadTitle);

  // 3. Post to backend Postgres database asynchronously
  try {
    const targetId = pilotId || (typeof threadId === "number" ? threadId : 1);
    const endpoint =
      portal === "UNIVERSITY"
        ? `${API_BASE_URL}/university/projects/${targetId}/discussions`
        : `${API_BASE_URL}/industry/dashboard/pilots/${targetId}/discussions`;

    fetch(endpoint, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify({
        message: message.trim(),
        attachmentName,
        attachmentUrl,
        senderName: name,
        senderRole: role,
      }),
    }).catch(() => {});
  } catch {}

  return newMsg;
}
