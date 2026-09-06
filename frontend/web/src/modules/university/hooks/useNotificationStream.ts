import { useState, useEffect, useCallback } from "react";
import { LiveNotificationEvent } from "../types";

const NOTIFICATION_URL =
  process.env.NEXT_PUBLIC_NOTIFICATION_URL ||
  (typeof window !== "undefined" && window.location.port === "8080"
    ? "/notifications/stream"
    : "http://localhost:8080/notifications/stream");

const INITIAL_NOTIFICATIONS: LiveNotificationEvent[] = [
  {
    eventId: "init_1",
    eventType: "AI_CHALLENGE_ROUTED",
    title: "🤖 AI Challenge Routing Match",
    message: "AI Matchmaker matched challenge #JH-2026-BOK-009 'Fluoride In Drinking Water' with BIT Mesra (96% Confidence Score).",
    severity: "INFO",
    actionUrl: "#routed",
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    eventId: "init_2",
    eventType: "CSR_OFFER_RECEIVED",
    title: "💼 Tata Steel CSR Foundation Offer",
    message: "Tata Steel CSR pledged ₹5,00,000 co-funding & 1 Senior Metallurgical Mentor for Groundwater Filtration project.",
    severity: "SUCCESS",
    actionUrl: "#projects",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    eventId: "init_3",
    eventType: "CITIZEN_VERIFIED",
    title: "✅ Citizen Verification Completed",
    message: "Ward 4 Resident Ramesh Mahato verified deployment for Solar Water Pump and rated it 5.0 ⭐.",
    severity: "SUCCESS",
    actionUrl: "#projects",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

export function useNotificationStream(userId: string = "university_coord_1") {
  const [notifications, setNotifications] = useState<LiveNotificationEvent[]>(INITIAL_NOTIFICATIONS);
  const [unreadCount, setUnreadCount] = useState<number>(2);
  const [latestToast, setLatestToast] = useState<LiveNotificationEvent | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    function connect() {
      try {
        const streamUrl = `${NOTIFICATION_URL}?userId=${encodeURIComponent(userId)}`;
        eventSource = new EventSource(streamUrl);

        eventSource.onopen = () => {
          setIsConnected(true);
        };

        eventSource.onmessage = (event) => {
          try {
            const data: LiveNotificationEvent = JSON.parse(event.data);
            setNotifications((prev) => [data, ...prev.slice(0, 49)]);
            setUnreadCount((c) => c + 1);
            setLatestToast(data);

            // Auto clear toast after 6 seconds
            setTimeout(() => {
              setLatestToast((curr) => (curr?.eventId === data.eventId ? null : curr));
            }, 6000);
          } catch (e) {
            console.error("Failed to parse SSE event data", e);
          }
        };

        eventSource.onerror = () => {
          setIsConnected(false);
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Reconnect attempt after 8 seconds
          reconnectTimeout = setTimeout(connect, 8000);
        };
      } catch (err) {
        setIsConnected(false);
        reconnectTimeout = setTimeout(connect, 8000);
      }
    }

    connect();

    return () => {
      if (eventSource) eventSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [userId]);

  const markAllAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const dismissToast = useCallback(() => {
    setLatestToast(null);
  }, []);

  const addSimulatedNotification = useCallback((notif: Omit<LiveNotificationEvent, "eventId" | "timestamp">) => {
    const newEvent: LiveNotificationEvent = {
      ...notif,
      eventId: `sim_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setNotifications((prev) => [newEvent, ...prev]);
    setUnreadCount((c) => c + 1);
    setLatestToast(newEvent);
    setTimeout(() => {
      setLatestToast((curr) => (curr?.eventId === newEvent.eventId ? null : curr));
    }, 6000);
  }, []);

  return {
    notifications,
    unreadCount,
    latestToast,
    isConnected,
    markAllAsRead,
    dismissToast,
    addSimulatedNotification,
  };
}
