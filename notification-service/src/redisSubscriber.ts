import { Redis } from 'ioredis';
import { NotificationPayload } from './types.js';
import { sseManager } from './sseManager.js';

export class RedisSubscriber {
  private redis: Redis | null = null;
  private isConnected = false;

  private readonly channels = [
    'events:industry:notifications',
    'events:citizen:notifications',
    'events:general:notifications'
  ];

  public init(host: string, port: number): void {
    console.log(`[Redis] Connecting subscriber to redis://${host}:${port}...`);

    this.redis = new Redis({
      host,
      port,
      retryStrategy: (times) => {
        const delay = Math.min(times * 1000, 5000);
        console.log(`[Redis] Reconnecting subscriber in ${delay}ms... (attempt ${times})`);
        return delay;
      },
      maxRetriesPerRequest: null
    });

    this.redis.on('connect', () => {
      this.isConnected = true;
      console.log('[Redis] Subscriber successfully connected.');
      this.subscribeToChannels();
    });

    this.redis.on('error', (err) => {
      console.warn('[Redis] Subscriber connection warning:', err.message);
    });

    this.redis.on('message', (channel, message) => {
      this.handleMessage(channel, message);
    });
  }

  private subscribeToChannels(): void {
    if (!this.redis) return;

    this.redis.subscribe(...this.channels, (err, count) => {
      if (err) {
        console.error('[Redis] Failed to subscribe to channels:', err);
      } else {
        console.log(`[Redis] Subscribed to ${count} channel(s): ${this.channels.join(', ')}`);
      }
    });
  }

  private handleMessage(channel: string, message: string): void {
    try {
      const payload: NotificationPayload = JSON.parse(message);
      console.log(`[Redis] Received event on '${channel}': ${payload.title} (${payload.eventType})`);
      
      // Dispatch immediately to active SSE browser streams
      sseManager.dispatchNotification(payload);
    } catch (err) {
      console.error(`[Redis] Error parsing JSON from channel ${channel}:`, err);
    }
  }

  public getStatus(): { isConnected: boolean; channels: string[] } {
    return {
      isConnected: this.isConnected,
      channels: this.channels
    };
  }
}

export const redisSubscriber = new RedisSubscriber();
