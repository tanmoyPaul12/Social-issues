import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import {
  CommunicationThread,
  CommunicationMessage,
  fetchCommunicationThreads,
  fetchThreadMessages,
  postThreadMessage,
  getLocalStoredMessages,
  saveLocalStoredMessage,
} from "../services/communicationApi";

// BroadcastChannel name for real-time cross-tab messaging (same origin)
const BC_CHANNEL = "social_issues_chat_sync";

export function useCommunication(userRole: "industry" | "university" = "industry") {
  const { token, user } = useAuthStore();
  const [threads, setThreads] = useState<CommunicationThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<number>(0);
  const [messagesMap, setMessagesMap] = useState<Record<number, CommunicationMessage[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const threadsRef = useRef(threads);
  threadsRef.current = threads;
  const selectedThreadIdRef = useRef(selectedThreadId);
  selectedThreadIdRef.current = selectedThreadId;

  // Load messages for a thread — reads shared localStorage (works across portals)
  const loadMessages = useCallback(
    async (threadId: number) => {
      if (!threadId) return;
      try {
        const activeThread = threadsRef.current.find((t) => t.id === threadId);
        const data = await fetchThreadMessages(token, threadId, activeThread?.pilotId, userRole);
        setMessagesMap((prevMap) => ({
          ...prevMap,
          [threadId]: data,
        }));
      } catch {
        // Silent fallback — localStorage data still available
      }
    },
    [token, userRole]
  );

  // Load threads
  const loadThreads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCommunicationThreads(token, userRole);
      setThreads(data);
      if (data.length > 0) {
        setSelectedThreadId((prev) => {
          const currentValid = data.some((t) => t.id === prev);
          return currentValid ? prev : data[0].id;
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load communication channels");
    } finally {
      setIsLoading(false);
    }
  }, [token, userRole]);

  // Initial thread load
  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  // Poll threads every 5s for cross-portal thread discovery
  useEffect(() => {
    const interval = setInterval(() => loadThreads(), 5000);
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "social_issues_pitched_threads_v1") {
        loadThreads();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, [loadThreads]);

  // Message sync: poll + BroadcastChannel for real-time cross-tab delivery
  useEffect(() => {
    if (!selectedThreadId) return;

    // Initial load for selected thread
    loadMessages(selectedThreadId);

    // Poll every 1 second (fast enough for live chat feel)
    const interval = setInterval(() => {
      loadMessages(selectedThreadIdRef.current);
    }, 1000);

    // localStorage cross-tab fallback (fires in other tabs when storage changes)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "social_issues_live_discussions_v1") {
        loadMessages(selectedThreadIdRef.current);
      }
    };
    window.addEventListener("storage", handleStorage);

    // BroadcastChannel: most reliable cross-tab/window sync for same origin
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(BC_CHANNEL);
      bc.onmessage = (event) => {
        // When we receive a new message broadcast, reload immediately
        const { threadId } = event.data || {};
        if (threadId && threadId === selectedThreadIdRef.current) {
          loadMessages(selectedThreadIdRef.current);
        }
      };
    } catch {
      // BroadcastChannel not supported — fall back to polling only
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
      bc?.close();
    };
  }, [selectedThreadId, loadMessages]);

  const activeThread = threads.find((t) => t.id === selectedThreadId) || threads[0];
  const messages = messagesMap[selectedThreadId] || [];

  // Send a message — writes to shared localStorage + broadcasts to other portal
  const sendMessage = async (
    text: string,
    attachmentName?: string,
    attachmentUrl?: string
  ) => {
    const trimmedText = text.trim();
    if (!trimmedText && !attachmentName) return;

    const threadId = selectedThreadIdRef.current;
    if (!threadId) return;

    setIsSending(true);
    try {
      const currentUserRole = userRole === "university" ? "FACULTY_PI" : "INDUSTRY_SPOC";
      const currentUserName =
        user?.name || (userRole === "university" ? "Faculty Lead PI" : "Industry CSR SPOC");

      const activeThreadNow = threadsRef.current.find((t) => t.id === threadId);

      const newMsg = await postThreadMessage(
        token,
        threadId,
        trimmedText,
        attachmentName,
        attachmentUrl,
        activeThreadNow?.pilotId,
        currentUserName,
        currentUserRole
      );

      const enrichedMsg: CommunicationMessage = {
        ...newMsg,
        senderName: currentUserName,
        senderRole: currentUserRole,
        message: trimmedText || newMsg.message,
        isCurrentUser: true,
      };

      // 1. Optimistically append for sender's view (immediate feedback)
      setMessagesMap((prev) => ({
        ...prev,
        [threadId]: [...(prev[threadId] || []), enrichedMsg],
      }));

      // 2. Update thread snippet
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId
            ? { ...t, lastMessage: trimmedText || `📎 ${attachmentName}`, timestamp: "Just now" }
            : t
        )
      );

      // 3. Broadcast to other tabs/windows so they reload immediately
      try {
        const bc = new BroadcastChannel(BC_CHANNEL);
        bc.postMessage({ threadId, senderRole: currentUserRole });
        bc.close();
      } catch {}

      // 4. Also reload from localStorage after 150ms (confirms the persisted state)
      setTimeout(() => loadMessages(threadId), 150);
    } catch (err: any) {
      setError(err.message || "Failed to post message");
    } finally {
      setIsSending(false);
    }
  };

  return {
    threads,
    selectedThreadId,
    setSelectedThreadId,
    activeThread,
    messages,
    isLoading,
    isSending,
    error,
    sendMessage,
    refreshThreads: loadThreads,
    refreshMessages: () => loadMessages(selectedThreadId),
  };
}
