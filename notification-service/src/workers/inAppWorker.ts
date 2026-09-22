import { Worker, Job } from 'bullmq';
import { NotificationJobData } from '../types.js';
import { sseManager } from '../sseManager.js';
import { notificationStore } from '../storage/notificationStore.js';
import { EventTemplateEngine } from '../templates/eventTemplates.js';

export class InAppWorker {
  private worker: Worker<NotificationJobData> | null = null;

  public init(redisHost: string, redisPort: number): void {
    try {
      this.worker = new Worker<NotificationJobData>(
        'notifications-dispatch-queue',
        async (job: Job<NotificationJobData>) => {
          if (job.data.channel !== 'IN_APP') {
            return; // Only process in-app channel in this worker
          }

          const { payload } = job.data;
          console.log(`[InAppWorker] Processing job #${job.id} for user ${payload.recipientUserId || 'all'}: ${payload.title}`);

          // 1. Enrich with template if text is sparse
          const rendered = EventTemplateEngine.render(payload);
          const enrichedPayload = {
            ...payload,
            title: payload.title || rendered.title,
            message: payload.message || rendered.message,
            actionUrl: payload.actionUrl || rendered.actionUrl
          };

          // 2. Persist to Redis Inbox
          await notificationStore.saveNotification(enrichedPayload);

          // 3. Dispatch to live SSE browser streams
          sseManager.dispatchNotification(enrichedPayload);

          return { success: true, deliveredAt: new Date().toISOString() };
        },
        {
          connection: {
            host: redisHost,
            port: redisPort,
            maxRetriesPerRequest: null,
            enableReadyCheck: false
          },
          concurrency: 20
        }
      );

      this.worker.on('completed', (job) => {
        if (job.data.channel === 'IN_APP') {
          console.log(`[InAppWorker] Successfully delivered in-app notification #${job.id}`);
        }
      });

      this.worker.on('failed', (job, err) => {
        if (job && job.data.channel === 'IN_APP') {
          console.error(`[InAppWorker] Failed job #${job.id}:`, err.message);
        }
      });

      console.log('[InAppWorker] BullMQ In-App Worker started with concurrency 20.');
    } catch (err) {
      console.error('[InAppWorker] Failed to start InAppWorker:', err);
    }
  }

  public async close(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
    }
  }
}

export const inAppWorker = new InAppWorker();
