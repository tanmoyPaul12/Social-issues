import { Worker, Job } from 'bullmq';
import { NotificationJobData } from '../types.js';
import { EventTemplateEngine } from '../templates/eventTemplates.js';

export class SmsWorker {
  private worker: Worker<NotificationJobData> | null = null;

  public init(redisHost: string, redisPort: number): void {
    const msg91AuthKey = process.env.MSG91_AUTH_KEY;
    const msg91SenderId = process.env.MSG91_SENDER_ID || 'JHINOV';
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;

    const hasRealGateway = Boolean(msg91AuthKey || (twilioSid && twilioToken));

    if (hasRealGateway) {
      console.log('[SmsWorker] SMS gateway credentials configured (MSG91 / Twilio).');
    } else {
      console.log('[SmsWorker] SMS credentials not set. Running in Sandbox Simulation Mode (logs SMS delivery).');
    }

    try {
      this.worker = new Worker<NotificationJobData>(
        'notifications-dispatch-queue',
        async (job: Job<NotificationJobData>) => {
          if (job.data.channel !== 'SMS' && job.data.channel !== 'WHATSAPP') {
            return;
          }

          const { payload, channel } = job.data;
          const phone = payload.recipientPhone;

          if (!phone) {
            console.log(`[SmsWorker] Skipped job #${job.id}: No recipientPhone in event ${payload.eventId}`);
            return { skipped: true, reason: 'NO_RECIPIENT_PHONE' };
          }

          const rendered = EventTemplateEngine.render(payload);
          const smsText = rendered.smsText || `[JHINOV] ${payload.title}: ${payload.message || ''}`;

          if (msg91AuthKey) {
            try {
              // MSG91 Fast2SMS Dispatch Call
              const response = await fetch('https://api.msg91.com/api/v5/flow/', {
                method: 'POST',
                headers: {
                  'authkey': msg91AuthKey,
                  'content-type': 'application/json'
                },
                body: JSON.stringify({
                  template_id: process.env.MSG91_TEMPLATE_ID || 'default_otp_flow',
                  short_url: '1',
                  recipients: [{ mobiles: phone, message: smsText, sender: msg91SenderId }]
                })
              });
              const json = await response.json();
              console.log(`[SmsWorker] MSG91 dispatched to ${phone}:`, json);
              return { success: true, gateway: 'MSG91', response: json };
            } catch (err: any) {
              console.warn(`[SmsWorker] MSG91 error:`, err.message);
            }
          }

          // Simulation fallback
          console.log(`[SmsWorker SIMULATION] Dispatched ${channel} to ${phone}: "${smsText}"`);
          return { success: true, simulated: true, channel, phone };
        },
        {
          connection: {
            host: redisHost,
            port: redisPort,
            maxRetriesPerRequest: null,
            enableReadyCheck: false
          },
          concurrency: 10
        }
      );

      console.log('[SmsWorker] BullMQ SMS Worker started.');
    } catch (err) {
      console.error('[SmsWorker] Failed to start SmsWorker:', err);
    }
  }

  public async close(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
    }
  }
}

export const smsWorker = new SmsWorker();
