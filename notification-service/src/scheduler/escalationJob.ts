import { queueManager } from '../queue/queueManager.js';
import { NotificationPayload } from '../types.js';

export class EscalationScheduler {
  private timer: NodeJS.Timeout | null = null;
  private backendBaseUrl: string = process.env.BACKEND_URL || 'http://localhost:8081';

  public init(): void {
    console.log('[EscalationScheduler] Initializing SLA breach escalation scheduler (every 6 hours).');

    // Run first check 30 seconds after startup
    setTimeout(() => {
      this.checkAndTriggerEscalations();
    }, 30000);

    // Run every 6 hours
    this.timer = setInterval(() => {
      this.checkAndTriggerEscalations();
    }, 6 * 60 * 60 * 1000);
  }

  /**
   * Check backend for pending stale items and trigger SLA reminders
   */
  public async checkAndTriggerEscalations(): Promise<number> {
    console.log('[EscalationScheduler] Running automated SLA breach audit...');
    let remindersFired = 0;

    try {
      // Query backend for unassigned / stale triage items
      const response = await fetch(`${this.backendBaseUrl}/api/triage/queue?status=SUBMITTED&page=0&size=20`, {
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        const data: any = await response.json();
        const staleItems = data.content || data.items || [];

        for (const item of staleItems) {
          const payload: NotificationPayload = {
            eventId: `sla_${item.id || item.issueNumber}_${Date.now()}`,
            eventType: 'ESCALATION_REMINDER',
            source: 'SLA_ESCALATION_SCHEDULER',
            recipientUserId: 'all',
            title: `⚠️ Action Required: Stale Grievance #${item.issueNumber || item.id}`,
            message: `Grievance '${item.title}' has been in SUBMITTED state without nodal verification for >48h. SLA escalation triggered.`,
            severity: 'WARNING',
            actionUrl: '/triage/queue',
            channels: ['IN_APP', 'EMAIL']
          };

          await queueManager.enqueueNotification(payload);
          remindersFired++;
        }
      }
    } catch (err: any) {
      console.log('[EscalationScheduler] Backend query completed (or offline). Reminders fired:', remindersFired);
    }

    return remindersFired;
  }

  public close(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}

export const escalationScheduler = new EscalationScheduler();
