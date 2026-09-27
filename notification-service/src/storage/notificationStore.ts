import { Redis } from 'ioredis';
import { NotificationPayload, NotificationRecord } from '../types.js';

export class NotificationStore {
  private redis: Redis | null = null;
  private inMemoryInbox: Map<string, NotificationRecord[]> = new Map();
  private readonly MAX_INBOX_SIZE = 500;

  public init(host: string, port: number): void {
    try {
      this.redis = new Redis({
        host,
        port,
        retryStrategy: (times) => Math.min(times * 1000, 5000),
        maxRetriesPerRequest: 3
      });
      console.log(`[NotificationStore] Initialized with dedicated Redis storage backend (redis://${host}:${port}).`);
    } catch (err) {
      console.warn('[NotificationStore] Failed to connect to Redis storage, using in-memory store:', err);
    }
  }

  /**
   * Save a notification to a specific user's persistent inbox and global broadcast inbox
   */
  public async saveNotification(payload: NotificationPayload): Promise<NotificationRecord> {
    const record: NotificationRecord = {
      ...payload,
      id: payload.eventId || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      read: false,
      createdAt: payload.timestamp || new Date().toISOString()
    };

    const recipientUserId = payload.recipientUserId?.toString() || 'all';

    // 1. Try Redis persistence
    if (this.redis) {
      try {
        const recordJson = JSON.stringify(record);
        const userKey = `notif:inbox:${recipientUserId}`;

        await this.redis.lpush(userKey, recordJson);
        await this.redis.ltrim(userKey, 0, this.MAX_INBOX_SIZE - 1);

        if (recipientUserId !== 'all') {
          // Also save in global stream
          await this.redis.lpush('notif:inbox:all', recordJson);
          await this.redis.ltrim('notif:inbox:all', 0, this.MAX_INBOX_SIZE - 1);
        }
      } catch (err) {
        console.warn('[NotificationStore] Redis write error, falling back to memory:', err);
      }
    }

    // 2. In-Memory fallback cache
    const userList = this.inMemoryInbox.get(recipientUserId) || [];
    userList.unshift(record);
    if (userList.length > this.MAX_INBOX_SIZE) {
      userList.pop();
    }
    this.inMemoryInbox.set(recipientUserId, userList);

    return record;
  }

  /**
   * Get paginated notifications for a user, computed with live read/unread status
   */
  public async getInbox(
    userId: string,
    page: number = 1,
    size: number = 20
  ): Promise<{ total: number; unreadCount: number; notifications: NotificationRecord[] }> {
    const start = (page - 1) * size;
    const end = start + size - 1;

    let rawRecords: NotificationRecord[] = [];
    let readSet: Set<string> = new Set();

    if (this.redis) {
      try {
        const userKey = `notif:inbox:${userId}`;
        const readKey = `notif:read:${userId}`;

        const [recordsJson, readIds] = await Promise.all([
          this.redis.lrange(userKey, 0, 100),
          this.redis.smembers(readKey)
        ]);

        readSet = new Set(readIds);

        // If user has no specific inbox records, try broadcast list
        if (recordsJson.length === 0 && userId !== 'all') {
          const broadcastJson = await this.redis.lrange('notif:inbox:all', 0, 100);
          rawRecords = broadcastJson.map(json => JSON.parse(json));
        } else {
          rawRecords = recordsJson.map(json => JSON.parse(json));
        }
      } catch (err) {
        console.warn('[NotificationStore] Redis read error, using in-memory list:', err);
        rawRecords = this.inMemoryInbox.get(userId) || this.inMemoryInbox.get('all') || [];
      }
    } else {
      rawRecords = this.inMemoryInbox.get(userId) || this.inMemoryInbox.get('all') || [];
    }

    // Apply read flags
    const computedRecords: NotificationRecord[] = rawRecords.map(item => ({
      ...item,
      read: readSet.has(item.id) || readSet.has(item.eventId) || item.read === true
    }));

    const unreadCount = computedRecords.filter(r => !r.read).length;
    const paginated = computedRecords.slice(start, end + 1);

    return {
      total: computedRecords.length,
      unreadCount,
      notifications: paginated
    };
  }

  /**
   * Mark a specific notification as read for a user
   */
  public async markAsRead(userId: string, eventId: string): Promise<boolean> {
    if (this.redis) {
      try {
        const readKey = `notif:read:${userId}`;
        await this.redis.sadd(readKey, eventId);
        // Expire read set after 30 days
        await this.redis.expire(readKey, 30 * 24 * 60 * 60);
        return true;
      } catch (err) {
        console.warn('[NotificationStore] Redis mark read error:', err);
      }
    }
    return true;
  }

  /**
   * Mark all notifications as read for a user
   */
  public async markAllAsRead(userId: string): Promise<number> {
    const inbox = await this.getInbox(userId, 1, 200);
    const unreadEventIds = inbox.notifications.filter(n => !n.read).map(n => n.id || n.eventId);

    if (unreadEventIds.length > 0 && this.redis) {
      try {
        const readKey = `notif:read:${userId}`;
        await this.redis.sadd(readKey, ...unreadEventIds);
        await this.redis.expire(readKey, 30 * 24 * 60 * 60);
      } catch (err) {
        console.warn('[NotificationStore] Redis mark all read error:', err);
      }
    }

    return unreadEventIds.length;
  }

  /**
   * Get unread count for a user badge
   */
  public async getUnreadCount(userId: string): Promise<number> {
    const inbox = await this.getInbox(userId, 1, 100);
    return inbox.unreadCount;
  }
}

export const notificationStore = new NotificationStore();
