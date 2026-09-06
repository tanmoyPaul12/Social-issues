import { Response } from 'express';
import { NotificationPayload } from './types.js';

interface ActiveStreamClient {
  id: string;
  userId: string;
  res: Response;
  connectedAt: Date;
}

class SSEManager {
  private clients: Map<string, ActiveStreamClient> = new Map();
  private userClientMap: Map<string, Set<string>> = new Map();
  private recentHistory: NotificationPayload[] = [];
  private readonly MAX_HISTORY = 100;

  constructor() {
    // Send periodic SSE keep-alive comments every 15s to prevent proxy timeouts
    setInterval(() => {
      this.broadcastKeepAlive();
    }, 15000);
  }

  public registerClient(clientId: string, userId: string, res: Response): void {
    const client: ActiveStreamClient = {
      id: clientId,
      userId,
      res,
      connectedAt: new Date()
    };

    this.clients.set(clientId, client);

    if (!this.userClientMap.has(userId)) {
      this.userClientMap.set(userId, new Set());
    }
    this.userClientMap.get(userId)!.add(clientId);

    console.log(`[SSE] Client connected: ${clientId} (User: ${userId}). Total active: ${this.clients.size}`);

    // Send initial handshake
    this.sendToClient(res, 'connected', {
      clientId,
      userId,
      connectedAt: client.connectedAt,
      message: 'Subscribed to real-time notification stream'
    });
  }

  public removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      const userSet = this.userClientMap.get(client.userId);
      if (userSet) {
        userSet.delete(clientId);
        if (userSet.size === 0) {
          this.userClientMap.delete(client.userId);
        }
      }
      this.clients.delete(clientId);
      console.log(`[SSE] Client disconnected: ${clientId}. Remaining: ${this.clients.size}`);
    }
  }

  public dispatchNotification(notification: NotificationPayload): void {
    // Record to in-memory history
    this.recentHistory.unshift(notification);
    if (this.recentHistory.length > this.MAX_HISTORY) {
      this.recentHistory.pop();
    }

    const recipientUserId = notification.recipientUserId?.toString();

    if (recipientUserId && recipientUserId !== '0' && recipientUserId !== 'all') {
      // Direct message to specific user's open dashboard tabs
      const clientIds = this.userClientMap.get(recipientUserId);
      if (clientIds && clientIds.size > 0) {
        console.log(`[SSE] Dispatching notification to user ${recipientUserId} across ${clientIds.size} open tab(s)`);
        for (const cId of clientIds) {
          const client = this.clients.get(cId);
          if (client) {
            this.sendToClient(client.res, 'notification', notification);
          }
        }
      } else {
        console.log(`[SSE] User ${recipientUserId} is currently offline. Notification saved to history.`);
      }
    } else {
      // Broadcast to all active clients
      console.log(`[SSE] Broadcasting notification to all ${this.clients.size} connected client(s)`);
      for (const client of this.clients.values()) {
        this.sendToClient(client.res, 'notification', notification);
      }
    }
  }

  public getRecentHistory(userId?: string): NotificationPayload[] {
    if (!userId || userId === 'all') {
      return this.recentHistory.slice(0, 30);
    }
    return this.recentHistory
      .filter(item => !item.recipientUserId || item.recipientUserId.toString() === userId.toString())
      .slice(0, 30);
  }

  public getActiveCount(): number {
    return this.clients.size;
  }

  private sendToClient(res: Response, event: string, data: any): void {
    try {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (err) {
      console.warn('[SSE] Error sending data to client:', err);
    }
  }

  private broadcastKeepAlive(): void {
    const keepAliveMessage = `: heartbeat ${Date.now()}\n\n`;
    for (const client of this.clients.values()) {
      try {
        client.res.write(keepAliveMessage);
      } catch (e) {
        this.removeClient(client.id);
      }
    }
  }
}

export const sseManager = new SSEManager();
