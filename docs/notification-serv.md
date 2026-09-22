

## Core purpose


also the events trigger for notification service to get called should be using a queue so it can send it in background as well as notify the user through the event  so it doesnt crash during the time of many users together

Here's a practical tech stack for the notification service, sized for a hackathon build but built on approaches that scale in production too.

## In-app / real-time notifications
- **WebSockets via Socket.IO** (Node.js) — simplest for a hackathon: push live updates ("your challenge was routed to a university") straight to the browser without polling.
- **Server-Sent Events (SSE)** — lighter alternative if you only need one-way server→client updates and want to skip WebSocket setup entirely.
- **Firebase Cloud Messaging (FCM)** — if you want browser push notifications that work even when the tab is closed (needs a service worker). Free tier, fast to integrate, works for both web and mobile later.

## Email notifications
- **Nodemailer** (Node.js) with **Gmail SMTP** or **SendGrid free tier** — for approval emails, digests, formal updates. SendGrid is easier to demo reliably than raw SMTP.
- **Resend** — newer, simple API, good free tier, popular in hackathons for its clean docs.

## SMS notifications
- **Twilio** (free trial credits) — industry standard, works well for a demo.
- **MSG91** or **Fast2SMS** — India-specific providers, often better rates/delivery for Indian numbers and free trial credits, worth it since this is a Jharkhand-focused platform.

## WhatsApp (differentiator for citizen reach)
- **Twilio WhatsApp Sandbox** — free for testing, lets you demo WhatsApp notifications without a full Business API approval, which is usually enough for a hackathon.

## Backend orchestration
- **Node.js + Express**  as the notification service, exposing simple endpoints like `POST /notify`.
- **Redis Pub/Sub** or a lightweight **BullMQ** queue — decouples "event happened" from "notification sent," so a slow email/SMS call doesn't block your main app. Easy to set up locally, no need for Kafka at hackathon scale.
- **MongoDB or PostgreSQL** — store notification logs (sent/delivered/read status) and user preferences (channel, frequency).

## Suggested hackathon-scoped combo
| Need | Tool |
|---|---|
| Real-time in-app alerts | Socket.IO |
| Email | Nodemailer + SendGrid free tier |
| SMS | Twilio trial or MSG91 |
| WhatsApp | Twilio WhatsApp Sandbox | 
| Queue/decoupling | Redis + BullMQ |
| Notification log storage | MongoDB |


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



