---
id: frontend_spec
title: "Frontend Specification & Design System"
tags:
  - docs
  - frontend
  - ui-ux
moc: [[MOC_Frontend_Next]]
---

# Frontend Application Specification
**Platform**: Societal Innovation Collaboration Portal — Jharkhand
**Status**: Planning / Pre-Development
**Last Updated**: 2026-08-27

---

## 1. Overview & Design Philosophy

The frontend is the face of the platform for citizens, government officials, university teams, and corporate CSR partners simultaneously. These four user groups have radically different technical literacy, device capabilities, and network conditions. The frontend must serve all of them without compromise.

**Design Principles**:

- **Citizens First**: The citizen submission flow is the most important flow on the platform. It must work on a mid-range Android device, on a 3G connection, and must be navigable by a user with limited literacy using voice prompts. If this flow is slow, confusing, or unavailable offline, the platform fails its primary mission.
- **Role-Aware UI**: The application should feel like a different product depending on who is logged in. A citizen should never see admin triage controls. A government official should see a dashboard-heavy, data-dense interface. The navigation, sidebar, and available actions all adapt to the authenticated role.
- **Progressive Disclosure**: Complex multi-step workflows (proposal submission, CSR commitment, team assembly) must be broken into clearly staged steps. Don't show users everything at once.
- **No Placeholder Content**: Every screen must show meaningful loading states and empty states — not spinners forever and not blank white pages. An empty triage queue should say "No pending challenges in your jurisdiction" — not a blank table.
- **Accessibility is Not Optional**: Regional government platforms serve citizens who may have disabilities. WCAG AA compliance is required. This means contrast ratios, keyboard navigation, and screen-reader-compatible ARIA structure — not just colour choices.

---

## 2. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | Next.js 16 (App Router) | Server Components reduce JS bundle size for low-end devices. Streaming SSR improves perceived performance on slow connections. |
| UI Engine | React 19 | Concurrent rendering, React Actions for form submissions without manual state management overhead. |
| Styling | Tailwind CSS v4 | Utility-first allows rapid, consistent styling without custom CSS bloat. Excellent tree-shaking keeps bundle small. |
| Icons | Lucide React | Lightweight, tree-shakeable SVG icons. Consistent visual language. |
| State (Client) | Zustand | Lightweight global store for auth state, user profile, active locale. Avoids Context prop-drilling. |
| Server State | TanStack Query v5 | Declarative server-state management. Handles caching, background refetch, optimistic updates. |
| Forms | React Hook Form + Zod | Minimal re-renders. Schema-first validation means frontend and backend validation are derived from the same type definitions. |
| Maps & GIS | Leaflet.js | Open-source, mobile-friendly, well-supported for choropleth heatmaps and pin placement. |
| i18n | next-intl | First-class Next.js App Router support. Locale routing, message extraction, RTL-ready. |
| PWA | next-pwa / Workbox | Service Worker for offline caching of citizen submission forms and static assets. |
| Charts | Recharts | Lightweight, composable chart library for the analytics dashboards. |

---

## 3. Application Route Architecture

The application uses Next.js 16 App Router with route groups to separate concerns and enable role-based layouts cleanly.

```
src/app/
│
├── (public)/                         # Unauthenticated routes — no auth middleware
│   ├── page.tsx                      # Landing page: mission, platform overview, stats teaser
│   ├── dashboard/
│   │   └── page.tsx                  # Public Impact Dashboard: GIS heatmap + KPIs + district drill-down
│   └── challenges/
│       ├── page.tsx                  # Public challenge browser (searchable, filterable, no PII)
│       └── [id]/
│           └── page.tsx              # Public challenge detail: status, category, district (no citizen info)
│
├── (auth)/                           # Auth flows — redirect to role dashboard if already logged in
│   ├── layout.tsx                    # Minimal layout: logo + language picker only
│   ├── login/
│   │   └── page.tsx                  # Role-selector → branch to appropriate login flow
│   ├── register/
│   │   ├── citizen/page.tsx          # OTP-based citizen onboarding
│   │   ├── government/page.tsx       # Gov official registration (email + jurisdiction)
│   │   ├── hei/page.tsx              # HEI SPOC registration (AISHE code)
│   │   └── industry/page.tsx         # CSR partner registration (CIN/GSTIN)
│   └── verify/
│       └── page.tsx                  # OTP verification step (shared across mobile-based flows)
│
├── (citizen)/                        # Role-guarded: CITIZEN only
│   ├── layout.tsx                    # Citizen layout: minimal nav, vernacular toggle, WhatsApp support link
│   ├── dashboard/page.tsx            # My submissions: list of own tickets + live status
│   ├── submit/
│   │   └── page.tsx                  # Issue submission form (full geo + media + voice flow)
│   └── tickets/
│       └── [id]/
│           └── page.tsx              # Individual ticket status: stage timeline, notifications log
│
├── (admin)/                          # Role-guarded: NODAL_ADMIN only
│   ├── layout.tsx                    # Admin layout: dense sidebar + jurisdiction banner
│   ├── dashboard/page.tsx            # Overview: pending triage count, overdue alerts, recent activity
│   ├── triage/
│   │   ├── page.tsx                  # Incoming queue: all SUBMITTED/TRIAGED challenges in jurisdiction
│   │   └── [id]/page.tsx            # Triage detail: AI output review, override controls, HEI assignment
│   ├── assignments/page.tsx          # Track all challenges assigned to HEIs in jurisdiction + status
│   └── analytics/page.tsx           # District-level analytics: submission trends, resolution rates
│
├── (hei)/                            # Role-guarded: HEI_SPOC, FACULTY_MENTOR, STUDENT_INNOVATOR
│   ├── layout.tsx                    # HEI layout: institution name banner, role-aware sidebar
│   ├── dashboard/page.tsx            # Active workspaces, pending proposals, upcoming milestones
│   ├── workspace/
│   │   ├── page.tsx                  # List of all institution's active project workspaces
│   │   └── [workspaceId]/
│   │       ├── page.tsx              # Workspace overview: problem brief + team + proposal status
│   │       ├── team/page.tsx         # Team builder interface (SPOC only: add/remove members)
│   │       ├── proposal/page.tsx     # Solution proposal form: guided multi-step submission
│   │       ├── documents/page.tsx    # Document repository with version history
│   │       ├── milestones/page.tsx   # Stage-gate board: current stage, approval actions, rollback
│   │       └── abc/page.tsx          # ABC credit ledger: per-student hours and credit summary
│   └── profile/page.tsx             # Institution profile: departments, labs, faculty list
│
├── (marketplace)/                    # Role-guarded: CSR_ADMIN, INDUSTRY_MENTOR (browse also HEI)
│   ├── layout.tsx
│   ├── page.tsx                      # Marketplace browse: filterable proposal cards
│   ├── [proposalId]/
│   │   ├── page.tsx                  # Proposal detail: full brief, team, funding gap, IP options
│   │   └── commit/page.tsx          # CSR commitment form: amount, mentor, IP type, OTP sign
│   └── my-commitments/page.tsx      # CSR Admin: all commitments + status + mentor assignments
│
├── (projects)/                       # Shared: accessible by NODAL_ADMIN, FACULTY_MENTOR, CSR roles
│   └── [projectId]/
│       └── tracker/page.tsx          # Cross-role milestone tracker + dual sign-off interface
│
└── (platform-admin)/                 # Role-guarded: PLATFORM_ADMIN only
    ├── layout.tsx
    ├── users/page.tsx                # User management: search, verify, suspend
    ├── institutions/page.tsx         # HEI approval queue + institution management
    ├── audit-logs/page.tsx           # Audit log viewer: searchable, filterable, exportable
    ├── config/page.tsx               # AI configuration: thematic labels, urgency weights
    └── reports/page.tsx              # Compliance report generation: CSV/PDF export
```

---

## 4. Component Architecture

### 4.1 Directory Structure

```
src/
├── app/                    (routes — see above)
├── components/
│   ├── ui/                 Atomic design primitives (Button, Card, Badge, Modal, Input, Textarea,
│   │                       Select, Checkbox, RadioGroup, Tabs, Tooltip, Skeleton, Alert, Drawer)
│   │
│   ├── forms/
│   │   ├── IssueSubmissionForm/     Multi-step: Category → Location → Description → Media → Voice → Review
│   │   ├── TeamBuilderForm/         Member search autocomplete + role assignment + ABC credit config
│   │   ├── ProposalForm/            Guided 5-step proposal builder with validation
│   │   ├── CSRCommitmentForm/       Amount + mentor + IP type + OTP signing step
│   │   └── MilestoneUpdateForm/     Evidence upload + progress notes + gate advancement request
│   │
│   ├── maps/
│   │   ├── SpatialHeatmap/          District-level choropleth map with clickable drill-down
│   │   └── GeoLocationPicker/       Interactive map pin placement + GPS auto-detect
│   │
│   ├── dashboards/
│   │   ├── TriageQueue/             Paginated queue with sort, filter, and batch action controls
│   │   ├── AITriageCard/            Displays AI tags, confidence scores, HEI recommendations, override form
│   │   ├── DuplicateClusterModal/   Side-by-side view of semantically similar submissions
│   │   ├── MilestoneTimeline/       Stage-gate visual timeline: completed, current, pending stages
│   │   ├── ProjectKanban/           Kanban board for milestone stage management
│   │   ├── PublicImpactMetrics/     KPI stat counters with animated number transitions
│   │   └── FundingProgressBar/      Visual funding gap indicator per marketplace proposal
│   │
│   ├── media/
│   │   ├── MediaUploader/           Drag-and-drop + camera capture + S3 presigned upload logic
│   │   └── VoiceRecorder/           Web Speech API recording interface + transcription result display
│   │
│   ├── notifications/
│   │   ├── NotificationBell/        Badge indicator + dropdown notification list
│   │   └── NotificationItem/        Individual notification rendering with action links
│   │
│   └── layout/
│       ├── MainNavbar/              Role-aware top navigation — different links per role
│       ├── RoleSidebar/             Collapsible sidebar: content adapts to role
│       ├── JurisdictionBanner/      Visible for NODAL_ADMIN: shows active district/block scope
│       └── LocaleSelector/          Language toggle: Hindi / English / Khortha / Nagpuri / Santhali
│
├── lib/
│   ├── api/                API client functions (wrappers around fetch with auth headers, error handling)
│   ├── auth/               Auth helpers: token storage, refresh logic, role guard utilities
│   ├── hooks/              Custom React hooks (useCurrentUser, useJurisdiction, useOfflineSync)
│   ├── stores/             Zustand store definitions (authStore, notificationStore, localeStore)
│   ├── schemas/            Zod validation schemas (shared with form components)
│   └── utils/              Date formatting, number formatting, geo utilities
│
└── public/
    ├── locales/            i18n message files (en, hi, khortha, nagpuri, santhali)
    └── icons/              Platform-specific SVGs
```

### 4.2 Server vs Client Component Strategy

This distinction is critical for performance — the wrong choice here balloons the JS bundle.

**Server Components** (no `"use client"` — render on server, zero JS to browser):
- All page layouts and route-level components.
- Dashboard page shells (the container, headings, metadata).
- Static content within detail pages (challenge description, proposal summary).
- Any component that only reads data and has no user interaction.

**Client Components** (add `"use client"` only when necessary):
- All form components (require event handlers and state).
- Map components (Leaflet requires browser APIs).
- Voice recorder (requires browser microphone API).
- Notification bell (requires WebSocket or polling).
- Any component with `useState`, `useEffect`, or event listeners.
- Chart components (Recharts requires browser DOM).

**Rule**: Default to Server Component. Promote to Client Component only when you hit a browser API or interactivity requirement. Keep Client Component boundaries as low in the tree as possible to minimize the client bundle.

---

## 5. Key User Flow Specifications

### 5.1 Citizen Issue Submission Flow (Critical Path)

This is the most important flow on the platform. It must be polished, performant, and work under adverse conditions.

**Step 1 — Language Selection** (pre-form):
- Language picker shown before any form fields. Persisted to user profile and `localStorage`.
- All subsequent labels, placeholders, and voice prompts render in the chosen language.

**Step 2 — Category Selection**:
- Grid of category cards with icons and vernacular labels (e.g., "पानी की समस्या", "कृषि", "स्वास्थ्य").
- User picks one primary category and optionally one secondary. This pre-seeds the AI classifier's confidence before the description is even read.

**Step 3 — Location**:
- Auto-detect via `navigator.geolocation`. Show a map pin at detected location.
- Manual override: User can drag the pin or type a location name.
- Reverse geocoding resolves to District + Block + Panchayat name shown as confirmation.
- If GPS is denied: Manual address entry form with District/Block/Village dropdowns populated from a static data file (no API dependency for this fallback).

**Step 4 — Description**:
- Two input modes: Text input (typed or pasted) and Voice input.
- Voice input: Tap-to-record button. Records audio, uploads to backend, backend calls AI transcription service. Transcription result auto-fills the text field. User can edit before continuing.
- Min character requirement: 50 characters in the final text field before user can advance.

**Step 5 — Media Evidence**:
- Drag-and-drop zone or native file picker.
- Camera capture button on mobile (opens native camera).
- Limits: Max 3 images (5MB each), 1 video (50MB). Enforced client-side before upload begins.
- Uploads via S3 presigned POST URL (fetched from backend). Upload progress bar shown.
- Thumbnails displayed inline as files are added.

**Step 6 — Review & Submit**:
- Summary card showing: Category, location, description preview, media thumbnails.
- WhatsApp opt-in toggle: "Get updates on WhatsApp?" (pre-checked for likely mobile users).
- Submit button. On success: Ticket confirmation screen with unique ticket ID.
- Ticket ID displayed prominently. "Copy link" button. "Share on WhatsApp" button (opens pre-filled wa.me link).

**Offline Behaviour**:
- Form state auto-saved to `localStorage` / Cache API at every step.
- If network is lost mid-flow, the form freezes gracefully with an offline banner. Data is preserved.
- On reconnection: Draft is detected, user prompted to resume or start new.
- Submit-while-offline: If user hits Submit with no network, queues the submission in a Workbox Background Sync queue. Submits automatically when connection returns. User sees "Queued for submission" confirmation.

---

### 5.2 Nodal Admin Triage Flow

**Triage Queue View**:
- Table with columns: Ticket ID, Category (AI tag), District/Block, Urgency Score (colored badge: High/Medium/Low), Submitted At, Status.
- Sortable by urgency score and submission time.
- Filter bar: Filter by category, urgency band, status.
- Bulk actions: Select multiple tickets → Bulk assign to same HEI.

**Individual Triage View**:
- Split layout: Left panel shows full citizen submission (description, media viewer, geo pin on map). Right panel shows AI analysis output.
- AI analysis panel: Primary category + confidence %, secondary categories, urgency score with breakdown of signals, top 3 HEI recommendations with match rationale text.
- Admin can override: Click any AI tag to change it. Click a different HEI recommendation to change the assignment.
- All overrides are noted with a mandatory "reason" field (for audit).
- Duplicate cluster alert: If AI flagged potential duplicates, shows a warning banner. Admin can open the Duplicate Cluster Modal — side-by-side view of the similar submissions. Admin decides to merge, reject one, or proceed as separate.
- Action buttons: "Validate & Assign" (routes to chosen HEI), "Reject" (requires reason code selection), "Defer for More Information" (sends notification to citizen requesting clarification).

---

### 5.3 HEI Team Assembly & Proposal Flow

**SPOC — Accept Assignment**:
- Notification received. Opens challenge detail in HEI portal.
- Accept or Decline buttons (decline requires mandatory reason + triggers auto-reassignment).
- On accept: Workspace created automatically.

**SPOC — Team Assembly**:
- Search bar to find registered faculty by name, department, or research tags.
- Assign one as "Lead Faculty Mentor".
- Search registered students by name, roll number, or branch.
- Add up to 8 students. Assign sub-roles if needed (Team Lead, Field Researcher, etc.).
- Team composition displayed as cards — each showing name, department, and current project load.

**Team — Proposal Builder**:
- 5-step guided form:
  1. Problem Restatement: Editable restatement of the original challenge in academic language.
  2. Proposed Approach: Rich text field describing methodology.
  3. Resources Required: Itemized list — equipment, lab access, field visits, external expertise.
  4. Timeline: Visual milestone planner — drag the expected duration for each stage gate.
  5. Budget & IP Intent: Budget table (categories + amounts) + IP type selection (Open Source / Shared Patent / Commercial License).
- Auto-save at each step. Resumable across sessions.
- Submit for internal SPOC review. SPOC sees a preview and submits to Nodal Admin for approval.
- On Nodal Admin approval: Proposal published to Marketplace.

---

### 5.4 CSR Marketplace & Commitment Flow

**Marketplace Browse**:
- Card grid with filter sidebar: Domain tags, District, Budget Range, HEI name, Funding Status (Partially Funded / Unfunded / Fully Funded).
- Each card: Challenge thumbnail category icon, challenge title, HEI name, domain tag, budget required, % funded progress bar, stage status.
- Fully funded proposals are visually deprioritized (greyed card, moved to bottom).

**Proposal Detail Page**:
- Full problem description, proposed solution summary, timeline preview, HEI department, team composition (faculty name visible, students anonymized to "Team of N").
- IP options explained: Each IP type shown with a brief plain-language explanation.
- Funding history: If other CSR partners have already committed partial funding, their commitment amounts (but not company names unless they've opted in) are shown.

**Commitment Flow**:
- Step 1: Enter commitment amount (cannot exceed remaining funding gap).
- Step 2: Assign an Industry Mentor from your company's registered mentors.
- Step 3: Select IP Agreement type. View the auto-generated agreement draft. Checkbox: "I have reviewed the agreement."
- Step 4: OTP sent to CSR Admin's registered phone. Enter OTP to digitally sign and confirm.
- On completion: Commitment confirmed. Agreement PDF stored. Notification sent to HEI SPOC and Faculty Mentor.

---

### 5.5 Dual Sign-off & Resolution Flow

**Citizen Side**:
- Citizen receives WhatsApp/SMS notification: "Your issue has been resolved. Please confirm."
- Link opens the citizen portal's ticket detail page.
- Shows: Summary of the solution implemented, field evidence photos uploaded by the team, pilot outcome summary.
- Action: Star rating (1–5) + qualitative feedback text field + "Confirm Resolution" button.

**Nodal Authority Side**:
- Nodal Admin receives in-platform notification + email.
- Opens the project tracker for the ticket.
- Reviews the same evidence as the citizen.
- Action: "Issue Official Closure" button → Generates a digital closure certificate (PDF) with their designation and timestamp.
- On both confirmations: Ticket transitions to RESOLVED.

---

## 6. Public Impact Dashboard Specification

This page is unauthenticated and must be fast. It is the primary accountability and transparency surface for government officials, journalists, and the public.

**Above-the-fold content**:
- KPI strip: Total challenges submitted, total resolved, total funding committed (₹), active universities, student teams formed.
- These numbers animate in on page load (count-up effect).

**Primary visualization — State Map**:
- Jharkhand district-level choropleth map.
- Colour intensity represents problem density (challenges submitted per district per 10,000 population).
- Hovering a district shows a tooltip: District name, challenges submitted, resolved, active.
- Clicking a district opens a slide-over panel with district-level details: Category breakdown chart, top 3 most active HEIs, list of open challenges (no PII).

**Secondary visualizations**:
- Domain breakdown: Donut chart of challenges by thematic category.
- Monthly trend: Line chart of submission volume and resolution volume over trailing 12 months.
- HEI Leaderboard: Top 5 universities by resolved projects this year.
- CSR Contribution Leaderboard: Top 5 contributors by committed amount (only shown if company has opted into public recognition).

**Performance requirements**:
- Aggregated data is served from Redis cache (refreshed every 15 minutes from a background job — not on request).
- Page must achieve Lighthouse Performance score ≥ 90 on mobile.
- Map tiles served from a CDN-backed tile server, not real-time API calls.

---

## 7. Localization & Vernacular Strategy

The platform serves five language groups. Localization is not just translation — it is a design consideration.

**Languages**:
- English (default fallback for HEIs and industry partners).
- Hindi (primary for citizens and government officials).
- Khortha, Nagpuri, Santhali, Mundari — regional vernacular for rural citizens.

**Implementation approach with `next-intl`**:
- All user-facing strings are externalized into per-locale JSON message files. No hardcoded UI text anywhere in components.
- Locale is detected from user profile preference first, then browser `Accept-Language`, then defaults to Hindi.
- Route prefix strategy: `/en/dashboard`, `/hi/dashboard`, etc. — enables proper SEO and caching per locale.
- Right-to-left: No current requirement, but the CSS and component structure should not assume LTR.

**Voice interface for vernacular users**:
- The voice recorder on the citizen submission form should display a language-specific prompt: "बोलिए, आपकी समस्या क्या है?" (Hindi) or equivalent vernacular.
- After transcription, the result is shown in the same language as the recording.
- If the system cannot confidently transcribe (low confidence score returned), it shows: "हम समझ नहीं पाए। क्या आप लिखकर बता सकते हैं?" with a fallback to text entry.

---

## 8. PWA & Offline Strategy

Given rural district usage, offline support for citizens is a hard requirement.

**What must work offline**:
- Viewing previously loaded ticket status pages (cached on first load).
- Drafting a new issue submission (all form steps).
- The app shell (navbar, routing — no blank screen on load).

**What requires connectivity**:
- Final submission of an issue.
- Loading the GIS map tiles.
- Media uploads.
- Real-time notification count.

**Implementation plan (Workbox)**:
- Cache-first strategy for the app shell (HTML, CSS, JS bundles, icon assets).
- Stale-while-revalidate for the public dashboard data (show cached version instantly, update in background).
- Background Sync for queued issue submissions (triggered when connectivity restores).
- Network-first for authenticated API requests (always try fresh data; fallback to cache for read operations).

---

## 9. Performance Targets

| Metric | Target | Priority |
|---|---|---|
| LCP (Largest Contentful Paint) — Citizen Submit page | < 2.5s on 3G | P0 |
| LCP — Public Dashboard | < 2.0s on broadband | P1 |
| INP (Interaction to Next Paint) | < 200ms | P1 |
| CLS (Cumulative Layout Shift) | < 0.1 | P1 |
| JS Bundle Size (initial) | < 100KB gzipped | P0 |
| Time to Interactive — Citizen page | < 4s on 3G | P0 |
| Lighthouse Performance Score (mobile) | ≥ 85 | P1 |

---

## 10. Accessibility Requirements

- **WCAG 2.1 Level AA** compliance is required for all routes.
- Colour contrast ratio minimum 4.5:1 for body text, 3:1 for large text.
- All interactive elements reachable and operable by keyboard alone.
- All images, icons, and media have descriptive `alt` text or `aria-label`.
- Form fields have associated `<label>` elements. Error messages are linked via `aria-describedby`.
- Modal dialogs trap focus while open and return focus on close.
- Map component must have a non-visual text summary of key data for screen-reader users (e.g., "24 open challenges across 3 most affected districts: Ranchi, Giridih, Dhanbad").
- All timed interactions (OTP expiry, session timeout) provide advance warnings.
