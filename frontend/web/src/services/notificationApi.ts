export interface NotificationItem {
  id: string;
  eventId: string;
  eventType: string;
  source?: string;
  recipientUserId?: string | number;
  recipientUserType?: string;
  title: string;
  message?: string;
  severity?: 'INFO' | 'ACTION_REQUIRED' | 'SUCCESS' | 'WARNING';
  actionUrl?: string;
  channels?: string[];
  read: boolean;
  createdAt: string;
}

export interface InboxResponse {
  success: boolean;
  userId: string;
  page: number;
  size: number;
  total: number;
  unreadCount: number;
  notifications: NotificationItem[];
}

const getApiBase = (): string => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  }
  return 'http://localhost:8080';
};

export const notificationApi = {
  /**
   * Fetch paginated user inbox
   */
  async getInbox(userId: string | number = 'all', page: number = 1, size: number = 20): Promise<InboxResponse> {
    const base = getApiBase();
    try {
      const res = await fetch(`${base}/notifications/inbox?userId=${encodeURIComponent(userId)}&page=${page}&size=${size}`);
      if (!res.ok) {
        // Fallback to direct microservice port if gateway route is proxying
        const fallbackRes = await fetch(`http://localhost:8082/notifications/inbox?userId=${encodeURIComponent(userId)}&page=${page}&size=${size}`);
        return await fallbackRes.json();
      }
      return await res.json();
    } catch (e) {
      try {
        const fallbackRes = await fetch(`http://localhost:8082/notifications/inbox?userId=${encodeURIComponent(userId)}&page=${page}&size=${size}`);
        return await fallbackRes.json();
      } catch (err) {
        console.warn('Could not fetch notifications inbox:', err);
        return { success: false, userId: String(userId), page, size, total: 0, unreadCount: 0, notifications: [] };
      }
    }
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(eventId: string, userId: string | number = 'all'): Promise<{ success: boolean; unreadCount: number }> {
    const base = getApiBase();
    try {
      const res = await fetch(`${base}/notifications/${encodeURIComponent(eventId)}/read?userId=${encodeURIComponent(userId)}`, {
        method: 'POST'
      });
      if (!res.ok) {
        const fallbackRes = await fetch(`http://localhost:8082/notifications/${encodeURIComponent(eventId)}/read?userId=${encodeURIComponent(userId)}`, {
          method: 'POST'
        });
        return await fallbackRes.json();
      }
      return await res.json();
    } catch (e) {
      try {
        const fallbackRes = await fetch(`http://localhost:8082/notifications/${encodeURIComponent(eventId)}/read?userId=${encodeURIComponent(userId)}`, {
          method: 'POST'
        });
        return await fallbackRes.json();
      } catch (err) {
        return { success: false, unreadCount: 0 };
      }
    }
  },

  /**
   * Mark all notifications as read for current user
   */
  async markAllAsRead(userId: string | number = 'all'): Promise<{ success: boolean; unreadCount: number }> {
    const base = getApiBase();
    try {
      const res = await fetch(`${base}/notifications/mark-all-read?userId=${encodeURIComponent(userId)}`, {
        method: 'POST'
      });
      if (!res.ok) {
        const fallbackRes = await fetch(`http://localhost:8082/notifications/mark-all-read?userId=${encodeURIComponent(userId)}`, {
          method: 'POST'
        });
        return await fallbackRes.json();
      }
      return await res.json();
    } catch (e) {
      try {
        const fallbackRes = await fetch(`http://localhost:8082/notifications/mark-all-read?userId=${encodeURIComponent(userId)}`, {
          method: 'POST'
        });
        return await fallbackRes.json();
      } catch (err) {
        return { success: false, unreadCount: 0 };
      }
    }
  },

  /**
   * Get unread badge count
   */
  async getUnreadCount(userId: string | number = 'all'): Promise<number> {
    const base = getApiBase();
    try {
      const res = await fetch(`${base}/notifications/unread-count?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        return data.unreadCount || 0;
      }
      const fallbackRes = await fetch(`http://localhost:8082/notifications/unread-count?userId=${encodeURIComponent(userId)}`);
      const data = await fallbackRes.json();
      return data.unreadCount || 0;
    } catch (e) {
      try {
        const fallbackRes = await fetch(`http://localhost:8082/notifications/unread-count?userId=${encodeURIComponent(userId)}`);
        const data = await fallbackRes.json();
        return data.unreadCount || 0;
      } catch (err) {
        return 0;
      }
    }
  }
};
