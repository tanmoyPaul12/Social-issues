"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import {
  CommunicationThread,
  CommunicationMessage,
  fetchCommunicationThreads,
  fetchThreadMessages,
  postThreadMessage,
  getCanonicalSlug,
  BC_CHANNEL,
  CHAT_EVENT_NAME,
  STORAGE_CHANNELS_KEY,
  STORAGE_MESSAGES_KEY,
} from "../services/communicationApi";

export function useCommunication(userRole: "industry" | "university" = "industry") {
  const { token, user } = useAuthStore();
  const [threads, setThreads] = useState<CommunicationThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<number>(1);
  const [messagesMap, setMessagesMap] = useState<Record<number, CommunicationMessage[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const threadsRef = useRef(threads);
  threadsRef.current = threads;
  const selectedThreadIdRef = useRef(selectedThreadId);
  selectedThreadIdRef.current = selectedThreadId;

  // Load messages for a thread
  const loadMessages = useCallback(
    async (threadId: number) => {
      if (!threadId) return;
      try {
        const activeThread = threadsRef.current.find((t) => t.id === threadId);
        const data = await fetchThreadMessages(
          token,
          threadId,
          activeThread?.pilotId,
          userRole,
          activeThread?.title
        );
        setMessagesMap((prev) => ({
          ...prev,
          [threadId]: data,
        }));
      } catch (err) {
        console.warn("Load messages notice:", err);
      }
    },
    [token, userRole]
  );

  // Load threads
  const loadThreads = useCallback(
    async (isBackground = false) => {
      if (!isBackground) setIsLoading(true);
      setError(null);
      try {
        const list = await fetchCommunicationThreads(token, userRole);
        setThreads(list);
        if (list.length > 0) {
          setSelectedThreadId((prev) => {
            const valid = list.some((t) => t.id === prev);
            return valid && prev !== 0 ? prev : list[0].id;
          });
        }
      } catch (err: any) {
        if (!isBackground) {
          setError(err.message || "Failed to load communication channels");
        }
      } finally {
        if (!isBackground) setIsLoading(false);
      }
    },
    [token, userRole]
  );

  // Initial load
  useEffect(() => {
    loadThreads(false);
  }, [loadThreads]);

  // Real-time synchronization listeners
  useEffect(() => {
    if (!selectedThreadId) return;

    // 1. Initial messages fetch for active thread
    loadMessages(selectedThreadId);

    // 2. High-speed heartbeat poll (every 800ms) for instant responsiveness
    const heartbeat = setInterval(() => {
      if (selectedThreadIdRef.current) {
        loadMessages(selectedThreadIdRef.current);
      }
    }, 800);

    // Helper to check if event targets currently viewed thread
    const isTargetThread = (channelKey?: string, threadId?: number, threadTitle?: string) => {
      const currId = selectedThreadIdRef.current;
      if (!currId) return false;
      if (threadId && threadId === currId) return true;

      const active = threadsRef.current.find((t) => t.id === currId);
      if (!active) return false;

      if (channelKey && (active.channelKey === channelKey || getCanonicalSlug(active.title) === channelKey)) {
        return true;
      }
      if (threadTitle && getCanonicalSlug(active.title) === getCanonicalSlug(threadTitle)) {
        return true;
      }
      return false;
    };

    // 3. Same-tab DOM Custom Event
    const handleLocalSync = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      if (isTargetThread(detail.channelKey, detail.threadId, detail.threadTitle)) {
        loadMessages(selectedThreadIdRef.current);
      }
      loadThreads(true);
    };
    window.addEventListener(CHAT_EVENT_NAME, handleLocalSync);

    // 4. Cross-tab StorageEvent
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_CHANNELS_KEY || e.key === STORAGE_MESSAGES_KEY) {
        if (selectedThreadIdRef.current) {
          loadMessages(selectedThreadIdRef.current);
        }
        loadThreads(true);
      }
    };
    window.addEventListener("storage", handleStorage);

    // 5. Cross-tab BroadcastChannel
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(BC_CHANNEL);
      bc.onmessage = (event) => {
        const { channelKey, threadId, threadTitle } = event.data || {};
        if (isTargetThread(channelKey, threadId, threadTitle)) {
          loadMessages(selectedThreadIdRef.current);
        }
        loadThreads(true);
      };
    } catch {}

    return () => {
      clearInterval(heartbeat);
      window.removeEventListener(CHAT_EVENT_NAME, handleLocalSync);
      window.removeEventListener("storage", handleStorage);
      bc?.close();
    };
  }, [selectedThreadId, loadMessages, loadThreads]);

  const activeThread = threads.find((t) => t.id === selectedThreadId) || threads[0];
  const messages = messagesMap[selectedThreadId] || [];

  // Post new message
  const sendMessage = async (
    text: string,
    attachmentName?: string,
    attachmentUrl?: string
  ) => {
    const trimmed = text.trim();
    if (!trimmed && !attachmentName) return;

    const threadId = selectedThreadIdRef.current;
    if (!threadId) return;

    setIsSending(true);
    try {
      const isUni = userRole === "university";
      const senderPortal: "UNIVERSITY" | "INDUSTRY" = isUni ? "UNIVERSITY" : "INDUSTRY";
      const senderRole = isUni ? "FACULTY_PI" : "INDUSTRY_SPOC";
      const senderName = user?.name || (isUni ? "University Lead PI" : "Industry CSR SPOC");

      const active = threadsRef.current.find((t) => t.id === threadId);

      const newMsg = await postThreadMessage(
        token,
        threadId,
        trimmed,
        attachmentName,
        attachmentUrl,
        active?.pilotId,
        senderName,
        senderRole,
        active?.title,
        senderPortal
      );

      // Optimistic instant state update
      setMessagesMap((prev) => ({
        ...prev,
        [threadId]: [...(prev[threadId] || []), { ...newMsg, isCurrentUser: true }],
      }));

      // Update sidebar snippet
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId
            ? {
                ...t,
                lastMessage: trimmed || `📎 ${attachmentName || "Document"}`,
                timestamp: "Just now",
              }
            : t
        )
      );

      // Confirm persistence
      setTimeout(() => {
        if (selectedThreadIdRef.current === threadId) {
          loadMessages(threadId);
        }
      }, 100);
    } catch (err: any) {
      setError(err?.message || "Failed to send message");
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
    refreshThreads: () => loadThreads(false),
    refreshMessages: () => loadMessages(selectedThreadId),
  };
}
