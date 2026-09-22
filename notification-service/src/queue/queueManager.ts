import { Queue, QueueOptions } from 'bullmq';
import { NotificationJobData, NotificationPayload, NotificationChannel } from '../types.js';

export class QueueManager {
  public notificationQueue: Queue<NotificationJobData> | null = null;
  private isInitialized = false;

  public init(redisHost: string, redisPort: number): void {
    const queueOptions: QueueOptions = {
      connection: {
        host: redisHost,
        port: redisPort,
        maxRetriesPerRequest: null,
        enableReadyCheck: false
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        },
        removeOnComplete: {
          age: 3600, // keep completed for 1 hour
          count: 500
        },
        removeOnFail: {
          age: 86400, // keep failed for 24 hours
          count: 1000
        }
      }
    };

    try {
      this.notificationQueue = new Queue<NotificationJobData>('notifications-dispatch-queue', queueOptions);
      this.isInitialized = true;
      console.log(`[QueueManager] BullMQ initialized on queue 'notifications-dispatch-queue' via redis://${redisHost}:${redisPort}`);
    } catch (err) {
      console.error('[QueueManager] Failed to initialize BullMQ Queue:', err);
    }
  }

  /**
   * Enqueue a notification payload across all its requested delivery channels
   */
  public async enqueueNotification(payload: NotificationPayload): Promise<void> {
    const channels: NotificationChannel[] = (payload.channels && payload.channels.length > 0)
      ? (payload.channels as NotificationChannel[])
      : ['IN_APP'];

    for (const channel of channels) {
      const jobData: NotificationJobData = {
        payload,
        channel,
        enqueuedAt: new Date().toISOString()
      };

      const jobName = `dispatch_${channel.toLowerCase()}_${payload.eventType || 'alert'}`;

      if (this.notificationQueue) {
        try {
          await this.notificationQueue.add(jobName, jobData, {
            jobId: `${payload.eventId || Date.now()}_${channel}`
          });
          console.log(`[QueueManager] Enqueued job '${jobName}' for channel '${channel}' (Event: ${payload.title})`);
        } catch (err) {
          console.warn(`[QueueManager] Error adding job to BullMQ queue:`, err);
        }
      }
    }
  }

  public getStatus(): { isReady: boolean; queueName: string } {
    return {
      isReady: this.isInitialized && this.notificationQueue !== null,
      queueName: 'notifications-dispatch-queue'
    };
  }
}

export const queueManager = new QueueManager();
