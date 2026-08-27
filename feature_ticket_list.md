# Feature & Ticket Specification
**Platform**: Societal Innovation Collaboration Portal — Jharkhand
**Status**: Planning / Pre-Development
**Last Updated**: 2026-08-27

---

## 1. Multi-Tier Stakeholder Onboarding

The platform supports four distinct stakeholder categories, each with a completely different onboarding path, verification mechanism, and capability set. Onboarding is not a single shared form — each tier must have tailored flows.

### 1.1 Citizens & Community Groups

**Goal**: Low-friction, mobile-first registration that works even in areas with poor literacy and low-bandwidth connectivity.

**Verification**: Phone number OTP. No email required.

**What the flow must support**:
- Language selection upfront (Hindi, English, Khortha, Nagpuri, Santhali) — persisted for the session and the account.
- Voice-guided onboarding prompts for low-literacy users.
- Optional profile enrichment: District, Block, Gram Panchayat (used later to auto-tag submitted issues to the right jurisdiction).
- No document upload required at registration.

**Edge Cases**:
- Citizens with no smartphone: WhatsApp-based OTP registration and SMS-only progress tracking must be supported as a future-phase fallback.
- One phone number may represent a community group, not just an individual — the system must allow a "community" name alongside a personal name.

---

### 1.2 Government Bodies — Panchayati Raj Institutions (PRIs) & Urban Local Bodies (ULBs)

**Goal**: Verified, jurisdiction-mapped registration for local government nodal officers who validate citizen issues and co-sign closures.

**Verification**: Official government email domain (`.gov.in`, `.nic.in`, or designated state portal domains). Manual admin approval for edge cases.

**What the flow must support**:
- Designation field (e.g., Gram Panchayat Sachiv, BDO, Municipal Commissioner).
- Jurisdiction mapping: Each account is tied to a district, block, and/or specific Panchayat — enforced at database and API level so that a BDO from Ranchi can't approve issues from Dhanbad.
- Multi-user per jurisdiction: A district office can have multiple registered nodal officers with different sub-roles (Reviewer vs. Approver).

**Edge Cases**:
- Jurisdictions change (redistricting, bifurcation) — the admin panel must allow jurisdiction reassignment without full account re-registration.

---

### 1.3 Higher Education Institutions (HEIs)

**Goal**: Structured, institution-level onboarding that enables the university to operate as a single collaborative entity while supporting fine-grained team-level access.

**Verification**: SPOC (Single Point of Contact — typically Dean R&D or Innovation Cell Head) self-registers with institutional email and submits AISHE code (All India Survey on Higher Education unique identifier) for verification. Platform admin approves.

**What the flow must support**:
- SPOC sets up the university profile: Name, AISHE code, accreditation level, active departments, affiliated research labs, and incubation centre details.
- SPOC then invites Faculty and Student members under the institutional account.
- Faculty profiles must include: Department, areas of research specialization, active projects load. This is the data the AI matchmaking engine will consume.
- Student profiles: Roll number, year, branch, active team memberships, accumulated ABC credits.
- Sub-roles within HEI: `HEI_SPOC` (Admin), `FACULTY_MENTOR`, `STUDENT_INNOVATOR`.

**Edge Cases**:
- Students graduate or faculty leave mid-project — the system must allow graceful team member handoff without breaking the project record.
- Multiple campuses under one university (e.g., BIT Mesra + BIT Sindri extension) should be representable.

---

### 1.4 Industry & CSR Partners

**Goal**: Corporate-grade registration for companies, startups, MSMEs, and innovation hubs that want to browse open challenges, commit CSR funding, and assign mentors.

**Verification**: CIN (Corporate Identification Number) or GSTIN validation via MCA/GST government APIs. No manual review required if the API confirms the entity.

**What the flow must support**:
- Entity profile: Company name, registered address, sector/domain focus tags (CleanTech, AgriTech, EdTech, HealthTech, etc.), CSR annual budget declared.
- Designation mapping: The registering user becomes `CSR_ADMIN`. They can add `INDUSTRY_MENTOR` sub-accounts for individuals from the company who will directly mentor student teams.
- Mentor profiles: LinkedIn-equivalent short bio, technical domain tags, maximum active mentorship capacity.

**Edge Cases**:
- Startups without CIN/GSTIN (pre-incorporated): Provide a self-declaration + DPIIT startup recognition number as an alternative verification path.
- CSR arms of a company may differ from the parent entity — both entities should be linkable.

---

## 2. End-to-End System Flow

This is the canonical lifecycle every societal challenge follows from first submission to final closure. All feature development must align to this flow.

```
[PHASE 1 — SUBMISSION]
  Citizen / PRI / ULB submits a problem via web or mobile.
  Inputs: Title, description, thematic hint (optional), geo-location (auto + manual),
          photos/video evidence (up to 3 photos, 1 video), WhatsApp contact.
       │
       ▼
[PHASE 2 — AI INGESTION & TRIAGE]
  AI Microservice processes the submission:
  • Vernacular voice transcription → structured text (if submitted via voice)
  • Semantic deduplication check against existing submissions in same geo-cluster
    → If duplicate: Merge & notify original submitter; no new ticket created
    → If unique: Proceed
  • Multi-label thematic classification (10+ domains)
  • Urgency scoring (0–100) based on population density, keyword signals, cluster count
  • HEI capability matching → top 3 ranked institutional recommendations
  Nodal Admin reviews AI output, may override tags or routing before final dispatch.
       │
       ▼
[PHASE 3 — INSTITUTIONAL ALLOCATION]
  Nodal Admin (Govt) formally assigns challenge to one HEI.
  HEI SPOC receives notification and accepts/declines within 5 working days.
  HEI SPOC then:
  • Reviews problem statement and AI analysis summary
  • Selects or creates a project workspace
  • Assembles multidisciplinary team (minimum 1 Faculty Mentor + 2 Students)
  • Submits Solution Proposal with workplan, timeline, and budget estimate.
       │
       ▼
[PHASE 4 — INDUSTRY & CSR MATCHMAKING]
  Approved proposals are published to the CSR/Industry Marketplace.
  Industry partner browses, selects a proposal, and commits:
  • CSR funding amount (partial or full)
  • Industry mentor assignment
  • IP agreement type selection (Open Source / Shared Patent / Commercial License)
  Marketplace remains open for co-funding by multiple partners on a single proposal.
       │
       ▼
[PHASE 5 — PROTOTYPING & PILOT]
  Project team works within the platform workspace:
  • Document uploads, progress notes, milestone updates
  • Stage-gated reviews: Ideation → Prototype → Sandbox Testing → Field Pilot
  • Each gate requires mentor and CSR partner sign-off to advance
  • On-ground pilot must have geo-tagged field evidence uploaded
       │
       ▼
[PHASE 6 — VALIDATION & CLOSURE]
  Pilot is presented to the original reporting Citizen and the Local Nodal Authority.
  Dual sign-off required:
  • Citizen rates impact (1–5) and provides qualitative feedback
  • Nodal Authority (PRI/ULB) issues official closure certificate (digital)
  Upon both sign-offs:
  • Ticket marked RESOLVED
  • ABC credits credited to student profiles
  • Public dashboard updated with impact metrics
  • IP transfer or open-source licensing agreement triggered
```

**Rejected / Escalated Paths** (must be designed, not just happy path):
- If HEI declines or fails to respond: Auto-reassign to second recommended institution after 5 days.
- If no funding is secured within 30 days of marketplace listing: Escalate to state nodal body for direct government grant option.
- If citizen cannot be reached for sign-off: Allow Nodal Authority sole sign-off after documented attempts.

---

## 3. Feature Tickets — Detailed Breakdown

### TICKET-001: Citizen Issue Submission

**Priority**: P0 (Critical Path)

**Description**: The primary submission interface for citizens to report societal challenges.

**Functional Requirements**:
- Geo-location picker: Auto-detect via browser GPS + manual override via map pin placement.
- Address resolution: Reverse geocode coordinates to populate District, Block, and Panchayat fields.
- Submission categories: User selects one primary domain and up to 2 secondary tags.
- Media uploads: Drag-and-drop or camera capture. Max 3 photos (5MB each), 1 video (50MB). Stored on S3 via presigned URLs.
- Voice-to-text: Record voice, transcribed server-side, auto-fills the description field. User can edit transcript before submitting.
- Offline draft: Form data cached locally via PWA service worker; submits automatically when connectivity restores.
- Ticket confirmation: Display a unique 8-character alphanumeric ticket ID. Offer WhatsApp share link and SMS send for the tracking URL.

**Acceptance Criteria**:
- Submission completes in under 3 taps/clicks after GPS permission granted.
- Offline cache preserves drafts for up to 72 hours.
- Ticket ID is generated and shown immediately upon server acknowledgment.

---

### TICKET-002: AI Triage Dashboard (Nodal Admin)

**Priority**: P0 (Critical Path)

**Description**: The primary interface for Nodal Government Officers to review, validate, and route incoming AI-processed submissions.

**Functional Requirements**:
- Incoming queue: Paginated list of all submissions in `SUBMITTED` and `TRIAGED` states.
- Per-ticket triage view: Shows AI-assigned category tags, urgency score (with confidence %), and top 3 HEI recommendations with match rationale.
- Duplicate cluster view: Visual map overlay showing the duplicate cluster — how many identical or near-identical issues exist in the same geo-cluster.
- Admin override controls: Change category tags, adjust urgency, override HEI recommendation.
- Batch actions: Validate multiple tickets simultaneously, assign to same institution in bulk (useful for cluster issues).
- Rejection path: Flag a submission as invalid with a mandatory reason code (Out of Scope, Duplicate, Insufficient Information).

**Acceptance Criteria**:
- Admin can triage a single ticket from queue to assigned state in under 60 seconds.
- Overriding AI suggestions is logged in the audit trail.

---

### TICKET-003: HEI Project Workspace

**Priority**: P0 (Critical Path)

**Description**: A collaborative environment for student-faculty teams to manage their assigned challenge from proposal to pilot.

**Functional Requirements**:
- Workspace creation: Triggered when HEI SPOC accepts an assigned challenge.
- Team assembly: SPOC can search for registered Faculty and Students within the institution. Minimum team size: 1 Faculty Mentor + 2 Students. Maximum: 1 Mentor + 8 Students.
- Solution proposal builder: Guided form — Problem restatement, proposed approach, required resources, expected timeline, budget estimate, IP intentions.
- Document repository: Version-controlled uploads for proposals, reports, lab test results, field evidence.
- Milestone board: Kanban-style view of stage gates. Teams can update progress; mentors approve gate transitions.
- ABC credit ledger: Live display of credit hours each student is accumulating per milestone completed.
- Communication thread: In-platform async messaging between team members, faculty mentor, and industry mentor.

**Acceptance Criteria**:
- Proposal submission triggers notification to Nodal Admin for approval.
- Document uploads are versioned — no document can be permanently deleted, only superseded.

---

### TICKET-004: CSR / Industry Marketplace

**Priority**: P1 (High)

**Description**: An open, searchable showcase of approved solution proposals available for industry co-funding, mentorship, and partnership.

**Functional Requirements**:
- Proposal cards: Filterable by domain, district, budget required, HEI name, stage, and funding gap.
- Detail page: Full problem context, team composition (anonymized student names, faculty name visible), proposed solution summary, timeline, and funding breakdown.
- Commitment workflow: CSR partner selects funding amount (can be partial), assigns a company mentor, selects IP agreement type. Agreement is digitally signed in-platform via OTP confirmation.
- Co-funding support: Multiple industry partners can commit to a single proposal until full budget is met.
- Mentor dashboard: Industry mentors have a dedicated view of all projects they are mentoring — timeline, milestone status, upcoming review dates.

**Acceptance Criteria**:
- A CSR commitment, once submitted and OTP-confirmed, is legally binding (requires compliance review for wording).
- Funding status (% secured, remaining gap) is visible on each proposal card.

---

### TICKET-005: Project Milestone & Sign-off Tracker

**Priority**: P1 (High)

**Description**: The stage-gate management system ensuring accountability at every phase of the project lifecycle.

**Stage Gates & Definitions**:
1. **IDEATION**: Proposal accepted. Team formed. Initial research begun.
2. **PROTOTYPE**: Working prototype demonstrated. Evidence uploaded (photos/video of prototype).
3. **SANDBOX TESTING**: Prototype tested in controlled environment. Test results documented.
4. **FIELD PILOT**: On-ground deployment in target community. Geo-tagged field evidence required.
5. **RESOLVED**: Dual citizen + nodal authority sign-off complete.

**Functional Requirements**:
- Each stage gate advancement requires: Supporting documents uploaded + Faculty Mentor approval + (from Prototype onwards) Industry Mentor approval.
- Rollback: A stage can be pushed back by the mentor if quality standards aren't met — with mandatory feedback notes.
- Deadline enforcement: Each stage has a configured target duration. Overdue stages trigger automated escalation notifications (in-platform + email + WhatsApp).
- Timeline view: Gantt-style visual showing planned vs. actual progress across all gates.

---

### TICKET-006: Public Impact Dashboard

**Priority**: P1 (High)

**Description**: A publicly visible, unauthenticated dashboard showing the state of all societal innovation activity across Jharkhand.

**Functional Requirements**:
- Spatial heatmap: District-level choropleth map showing problem density, active projects, resolved issues. Clickable — drill down to district-level detail.
- Summary KPI strip: Total challenges submitted, % resolved, total CSR funding committed (₹), active HEI institutions, student teams formed.
- Domain breakdown: Pie or bar chart of challenges by thematic category.
- Leaderboard panel: Top contributing HEIs (by resolved projects), top CSR contributors (by funds committed).
- Timeline trend: Monthly submission and resolution volume over trailing 12 months.
- District detail panel: When user clicks a district, show open issues count, active projects, resolved count, and list of assigned HEIs.

**Acceptance Criteria**:
- All data is aggregated/anonymized — no citizen PII is exposed on the public dashboard.
- Dashboard refreshes in near-real-time (max 15-minute cache for aggregated data).

---

### TICKET-007: Notification & Communication System

**Priority**: P1 (High)

**Description**: Multi-channel communication layer keeping all stakeholders informed at every lifecycle event.

**Channels**:
- In-platform notifications (persistent bell icon with notification centre).
- Email notifications (transactional via SMTP / SendGrid).
- WhatsApp notifications (Twilio or official WABA integration) — primary for Citizens.
- SMS fallback for citizens without WhatsApp.

**Key Notification Events**:

| Trigger Event | Notified Stakeholders |
|---|---|
| New ticket submitted | Nodal Admin of relevant district |
| Ticket validated & assigned to HEI | HEI SPOC |
| Proposal submitted by HEI | Nodal Admin |
| Proposal published to marketplace | All registered CSR Partners in matching domain |
| CSR commitment confirmed | HEI SPOC, Faculty Mentor |
| Milestone gate advanced | All project stakeholders |
| Milestone overdue | Team + Faculty Mentor + Platform Admin |
| Dual sign-off request | Reporting Citizen + Nodal Authority |
| Ticket resolved | All project stakeholders + Citizen |

---

### TICKET-008: Admin & Platform Management Panel

**Priority**: P2 (Medium)

**Description**: Back-office capabilities for platform administrators to manage the overall ecosystem.

**Functional Requirements**:
- User management: Search, verify, suspend, reactivate any account. View role history.
- Institution management: Approve new HEI registrations, manage jurisdiction assignments for Nodal Officers.
- AI configuration panel: View/adjust thematic classification labels, urgency scoring weights, matchmaking parameters (for future tuning without code deployment).
- Audit log viewer: Full tamper-proof event log searchable by user, timestamp, action type, and entity ID.
- Report generation: Exportable CSV/PDF reports for government compliance — submission volumes, resolution rates, fund disbursements, HEI participation.
- System health view: Service uptime indicators for Backend API, AI Microservice, and storage.

---

## 4. Governance & Verification Lifecycle

### 4.1 Closed-Loop Issue Resolution

A project ticket **cannot** be marked `RESOLVED` by the executing team alone. The resolution pipeline enforces:

1. Team submits completion claim with all field evidence.
2. Faculty Mentor reviews and endorses.
3. Industry Mentor reviews and endorses.
4. Platform sends resolution request to both the **reporting Citizen** and the **Local Nodal Authority**.
5. Both must provide digital acknowledgment within 14 days.
6. Only after both confirmations does the system transition the ticket to `RESOLVED`.

If the citizen is unreachable after documented notification attempts (3 attempts over 14 days), the Nodal Authority can provide a sole sign-off after submitting a waiver reason — this must be auditable.

### 4.2 Experiential Learning & ABC Credit Alignment

All student participation must map to NEP 2020 Academic Bank of Credits (ABC) requirements:

- Platform tracks hours per stage gate completed, field deployments, and documented technical contributions.
- At project closure, the system auto-generates an ABC Credit Certificate for each student with: Institution, project name, role, hours, credits earned, and Faculty Mentor endorsement.
- These certificates must be exportable as PDF and shareable via DigiLocker integration (future phase).

### 4.3 IP & Technology Transfer Framework

Before any solution proposal is published to the marketplace, the HEI team must select an IP intention:

- **Open Source / Public Domain**: Solution is published under Creative Commons or MIT license for public use by government bodies.
- **Shared Patent**: Patent is co-owned between the HEI and the funding Industry Partner. Commercial use requires revenue sharing.
- **Commercial License**: Exclusive commercial rights granted to Industry Partner. HEI receives royalty arrangement.

Platform provides pre-configured legal template agreements for each path. Final agreement requires:
- HEI SPOC signature (on behalf of institution).
- Industry Partner CSR Admin signature.
- Notarized digital execution (future phase integration with NeSL or equivalent).

### 4.4 Data Retention & Audit Compliance

- All platform activity is immutably logged. Logs may not be deleted — only archived after 7 years per government data retention guidelines.
- Personally identifiable citizen data (phone, name) is encrypted at rest.
- Public dashboard shows only aggregated, anonymized data.
- Any data export by an Admin is itself logged with a justification reason field.