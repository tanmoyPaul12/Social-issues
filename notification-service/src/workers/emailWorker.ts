import { Worker, Job } from 'bullmq';
import nodemailer, { type Transporter } from 'nodemailer';
import { NotificationJobData } from '../types.js';
import { EventTemplateEngine } from '../templates/eventTemplates.js';

export class EmailWorker {
  private worker: Worker<NotificationJobData> | null = null;
  private transporter: Transporter | null = null;

  public init(redisHost: string, redisPort: number): void {
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });
      console.log(`[EmailWorker] Configured real SMTP delivery via ${smtpHost}:${smtpPort}`);
    } else {
      console.log('[EmailWorker] SMTP credentials not set. Running in Sandbox Simulation Mode (logs rendered HTML).');
    }

    try {
      this.worker = new Worker<NotificationJobData>(
        'notifications-dispatch-queue',
        async (job: Job<NotificationJobData>) => {
          if (job.data.channel !== 'EMAIL') {
            return;
          }

          const { payload } = job.data;
          const recipientEmail = payload.recipientEmail;

          if (!recipientEmail) {
            console.log(`[EmailWorker] Skipped job #${job.id}: No recipientEmail specified in event ${payload.eventId}`);
            return { skipped: true, reason: 'NO_RECIPIENT_EMAIL' };
          }

          const rendered = EventTemplateEngine.render(payload);
          const emailSubject = rendered.emailSubject || `[Jharkhand Innovation] ${payload.title}`;
          const emailHtml = rendered.emailHtml || `<p>${payload.message}</p>`;
          const fromAddress = process.env.EMAIL_FROM || (smtpUser ? `"Jharkhand Innovation Portal" <${smtpUser}>` : '"Jharkhand Innovation Portal" <noreply@jhinov.gov.in>');

          if (this.transporter) {
            try {
              const info = await this.transporter.sendMail({
                from: fromAddress,
                to: recipientEmail,
                subject: emailSubject,
                html: emailHtml
              });
              console.log(`[EmailWorker] Email sent to ${recipientEmail}: messageId=${info.messageId}`);
              const previewUrl = nodemailer.getTestMessageUrl(info);
              if (previewUrl) {
                console.log(`[EmailWorker] 🔗 Ethereal Email Preview: ${previewUrl}`);
              }
              return { success: true, messageId: info.messageId, previewUrl: previewUrl || undefined };
            } catch (err: any) {
              console.error(`[EmailWorker] SMTP Error sending to ${recipientEmail}:`, err.message);
              throw err; // Trigger BullMQ retry
            }
          } else {
            console.log(`[EmailWorker SIMULATION] Dispatched email to: ${recipientEmail} | Subject: "${emailSubject}"`);
            return { success: true, simulated: true };
          }
        },
        {
          connection: {
            host: redisHost,
            port: redisPort,
            maxRetriesPerRequest: null,
            enableReadyCheck: false
          },
          concurrency: 5
        }
      );

      this.worker.on('completed', (job) => {
        if (job.data.channel === 'EMAIL') {
          console.log(`[EmailWorker] Completed job #${job.id}`);
        }
      });

      console.log('[EmailWorker] BullMQ Email Worker started.');
    } catch (err) {
      console.error('[EmailWorker] Failed to start EmailWorker:', err);
    }
  }

  public async close(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
    }
  }
}

export const emailWorker = new EmailWorker();
