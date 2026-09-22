import { NotificationPayload } from '../types.js';

export interface FormattedNotification {
  title: string;
  message: string;
  actionUrl: string;
  emailSubject?: string;
  emailHtml?: string;
  smsText?: string;
}

export class EventTemplateEngine {
  /**
   * Render notification content based on event type and payload parameters
   */
  public static render(payload: NotificationPayload): FormattedNotification {
    const {
      eventType,
      title,
      message,
      actionUrl,
      referenceEntityType,
      referenceEntityId,
      statDeltas = {}
    } = payload;

    const baseActionUrl = actionUrl || '/';

    switch (eventType) {
      case 'ISSUE_SUBMITTED': {
        const issueRef = statDeltas.issueNumber || referenceEntityId || 'New';
        const formattedTitle = title || `Challenge #${issueRef} Received`;
        const formattedMsg =
          message ||
          `Your civic grievance #${issueRef} has been recorded. It is currently being analyzed by AI multimodal deduplication and queued for State Nodal verification.`;
        return {
          title: formattedTitle,
          message: formattedMsg,
          actionUrl: baseActionUrl,
          emailSubject: `[Jharkhand Innovation] Grievance #${issueRef} Registered`,
          emailHtml: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
              <div style="background: #0f172a; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
                <h2 style="color: #38bdf8; margin: 0; font-size: 18px;">Jharkhand Grassroot Innovation Platform</h2>
              </div>
              <h3 style="color: #0f172a;">${formattedTitle}</h3>
              <p style="font-size: 15px; line-height: 1.6;">${formattedMsg}</p>
              <div style="margin: 25px 0;">
                <a href="${baseActionUrl}" style="background: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Track Grievance Status</a>
              </div>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #64748b;">Government of Jharkhand &bull; Higher & Technical Education Department</p>
            </div>
          `,
          smsText: `[JHINOV] Your issue #${issueRef} is registered. AI verification and HEI routing in progress. Track: ${baseActionUrl}`
        };
      }

      case 'ISSUE_VALIDATED': {
        const formattedTitle = title || 'Civic Issue Verified by Nodal Officer';
        const formattedMsg =
          message ||
          'Your reported challenge has been verified and approved by the State Nodal Triage Officer. It has progressed to university R&D matching.';
        return {
          title: formattedTitle,
          message: formattedMsg,
          actionUrl: baseActionUrl,
          emailSubject: `[Jharkhand Innovation] Grievance Verified by State Nodal Officer`,
          emailHtml: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
              <div style="background: #0f172a; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
                <h2 style="color: #10b981; margin: 0; font-size: 18px;">Jharkhand Grassroot Innovation Platform</h2>
              </div>
              <h3 style="color: #0f172a;">${formattedTitle}</h3>
              <p style="font-size: 15px; line-height: 1.6;">${formattedMsg}</p>
              <div style="margin: 25px 0;">
                <a href="${baseActionUrl}" style="background: #10b981; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Verified Details</a>
              </div>
            </div>
          `,
          smsText: `[JHINOV] Your issue has been verified by the State Nodal Team. Ready for HEI research matching.`
        };
      }

      case 'ISSUE_ROUTED_TO_HEI':
      case 'ISSUE_ASSIGNED_HEI':
      case 'CITIZEN_CHALLENGE_ADOPTED': {
        const heiName = statDeltas.assignedHEI || 'Partner University';
        const formattedTitle = title || `🎓 Challenge Adopted by ${heiName}`;
        const formattedMsg =
          message ||
          `Your problem statement has been assigned to ${heiName} innovation lab for research, prototype design, and field pilot execution.`;
        return {
          title: formattedTitle,
          message: formattedMsg,
          actionUrl: baseActionUrl,
          emailSubject: `[Jharkhand Innovation] Challenge Matched with ${heiName}`,
          emailHtml: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
              <div style="background: #0f172a; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
                <h2 style="color: #818cf8; margin: 0; font-size: 18px;">Higher Education Institution Collaboration</h2>
              </div>
              <h3 style="color: #0f172a;">${formattedTitle}</h3>
              <p style="font-size: 15px; line-height: 1.6;">${formattedMsg}</p>
              <div style="margin: 25px 0;">
                <a href="${baseActionUrl}" style="background: #6366f1; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View R&D Project Pipeline</a>
              </div>
            </div>
          `,
          smsText: `[JHINOV] Great news! Your challenge was adopted by ${heiName} for active R&D pilot development.`
        };
      }

      case 'MILESTONE_APPROVED': {
        const formattedTitle = title || 'Project Milestone Approved';
        const formattedMsg = message || 'Milestone deliverable has been verified and approved by the CSR industry partner.';
        return {
          title: formattedTitle,
          message: formattedMsg,
          actionUrl: baseActionUrl,
          emailSubject: `[Jharkhand Innovation] Milestone Verified & Approved`,
          emailHtml: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h3 style="color: #059669;">${formattedTitle}</h3>
              <p style="font-size: 15px; line-height: 1.6;">${formattedMsg}</p>
              <a href="${baseActionUrl}" style="background: #059669; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Project Status</a>
            </div>
          `,
          smsText: `[JHINOV] Milestone verified and approved by industry partner. Progress updated.`
        };
      }

      case 'TEST_RESULT_LOGGED': {
        const formattedTitle = title || 'TRL Test Result Logged';
        const formattedMsg = message || 'A new technical evaluation test result and telemetry metrics have been recorded.';
        return {
          title: formattedTitle,
          message: formattedMsg,
          actionUrl: baseActionUrl,
          emailSubject: `[Jharkhand Innovation] New TRL Test Benchmark Logged`,
          emailHtml: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h3 style="color: #2563eb;">${formattedTitle}</h3>
              <p style="font-size: 15px; line-height: 1.6;">${formattedMsg}</p>
              <a href="${baseActionUrl}" style="background: #2563eb; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Inspect Test Telemetry</a>
            </div>
          `,
          smsText: `[JHINOV] New TRL test result logged for your collaborative pilot project.`
        };
      }

      case 'STAGE_APPROVED': {
        const formattedTitle = title || 'Stage Gate Approved';
        const formattedMsg = message || 'Project stage has been digitally signed off by the authorized reviewer.';
        return {
          title: formattedTitle,
          message: formattedMsg,
          actionUrl: baseActionUrl,
          emailSubject: `[Jharkhand Innovation] Stage Transition Approved`,
          emailHtml: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h3 style="color: #059669;">${formattedTitle}</h3>
              <p style="font-size: 15px; line-height: 1.6;">${formattedMsg}</p>
              <a href="${baseActionUrl}" style="background: #059669; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Approval Signatures</a>
            </div>
          `,
          smsText: `[JHINOV] Stage gate approved! Project is transitioning to the next lifecycle phase.`
        };
      }

      case 'SOLUTION_DEPLOYED_RESOLVED': {
        const formattedTitle = title || '🎉 Solution Deployed & Grievance Resolved!';
        const formattedMsg =
          message ||
          'Your reported issue has been successfully resolved with an on-ground deployed solution verified by citizen and government sign-off!';
        return {
          title: formattedTitle,
          message: formattedMsg,
          actionUrl: baseActionUrl,
          emailSubject: `[Jharkhand Innovation] Resolution Complete — Issue Resolved`,
          emailHtml: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #10b981; border-radius: 8px; background: #f0fdf4;">
              <h2 style="color: #15803d; margin-top: 0;">🎉 Closed-Loop Resolution Achieved!</h2>
              <h3 style="color: #0f172a;">${formattedTitle}</h3>
              <p style="font-size: 15px; line-height: 1.6; color: #1e293b;">${formattedMsg}</p>
              <div style="margin: 25px 0;">
                <a href="${baseActionUrl}" style="background: #15803d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Closure Certificate & Feedback</a>
              </div>
            </div>
          `,
          smsText: `[JHINOV] Resolved! Your civic issue has been successfully resolved and deployed on ground.`
        };
      }

      case 'ESCALATION_REMINDER': {
        const formattedTitle = title || '⚠️ SLA Escalation Reminder';
        const formattedMsg = message || 'Action is pending on an assigned challenge exceeding the 48-hour response SLA.';
        return {
          title: formattedTitle,
          message: formattedMsg,
          actionUrl: baseActionUrl,
          emailSubject: `[Jharkhand Innovation] URGENT: Action Pending on Assigned Challenge`,
          emailHtml: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #f59e0b; border-radius: 8px; background: #fffbeb;">
              <h3 style="color: #b45309; margin-top: 0;">${formattedTitle}</h3>
              <p style="font-size: 15px; line-height: 1.6;">${formattedMsg}</p>
              <a href="${baseActionUrl}" style="background: #d97706; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Take Action Now</a>
            </div>
          `,
          smsText: `[JHINOV ALERT] Pending action on assigned challenge nearing SLA threshold. Please login: ${baseActionUrl}`
        };
      }

      default: {
        return {
          title: title || 'Jharkhand Innovation Notification',
          message: message || 'You have received a platform update.',
          actionUrl: baseActionUrl,
          emailSubject: `[Jharkhand Innovation] ${title || 'Platform Notification'}`,
          emailHtml: `<p>${message || 'You have received a platform update.'}</p>`,
          smsText: `[JHINOV] ${title || 'Platform Update'}: ${message || ''}`
        };
      }
    }
  }
}
