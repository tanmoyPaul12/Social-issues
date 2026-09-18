

## Core purpose
Keep every stakeholder (citizen, university, industry, mentor, government) informed at each stage of a challenge's lifecycle — without anyone having to manually check the portal.

## 1. Trigger events (what fires a notification)

**Citizen-facing**
- Challenge submitted (acknowledgement + tracking ID)
- Challenge categorized/validated by AI
- Challenge routed to a university
- University accepts/rejects the challenge
- Project milestone reached (e.g. prototype ready, pilot started)
- Solution deployed / challenge marked resolved
- Request for additional info/clarification

**University-facing**
- New challenge assigned matching their domain
- Deadline reminders for proposal submission
- Industry partner expresses interest in their project
- Funding/mentorship approved
- Government review feedback received

**Industry-facing**
- New challenge available matching their sector/interest tags
- University requests mentorship or funding
- Milestone submitted for their review/approval
- IP/technology transfer document ready for signature

**Government-facing**
- Weekly/monthly summary digest (challenges received, domain-wise stats)
- Project stuck/delayed alerts (SLA breach)
- New patents or startups created (outcome milestones)

## 2. Channels to support
- In-app/push notifications (primary)
- Email (formal updates, approvals, digests)
- SMS (for citizens — especially rural users with low app engagement)
- WhatsApp integration (optional, high-reach in Jharkhand's context — strong hackathon differentiator)

## 3. Key features to build
- **Notification preferences** — let users choose channel + frequency (real-time vs daily digest)
- **Templated messages** — pre-built templates per event type, localized (Hindi/English/regional)
- **Read/unread status** and in-app notification center
- **Escalation logic** — if no action taken within X days (e.g. university hasn't responded to assigned challenge), auto-escalate to admin or send reminder
- **Broadcast/announcement mode** — for government to push policy updates or campaign calls to all universities/industry partners at once
- **Two-way communication thread** — comments/chat tied to a specific challenge/project so all stakeholders discuss in context (not just one-way alerts)

## 4. Technical components (for your architecture diagram/slide)
- **Event queue** (e.g. message broker) that listens to state changes across citizen, university, industry, and project-lifecycle modules
- **Notification service** that consumes events, applies templates, and dispatches via the right channel
- **Delivery status tracking** (sent/delivered/failed/read) for reliability
- **API/webhook layer** so each module (submission, routing, project tracking) just fires an event — decoupled from delivery logic
