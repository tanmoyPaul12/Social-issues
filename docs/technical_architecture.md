---
id: technical_architecture
title: "Technical Architecture Specification"
tags:
  - docs
  - architecture
  - system-design
moc: [[MOC_System_Architecture]]
---

# Technical Architecture Specification
**Platform**: Societal Innovation Collaboration Portal — Jharkhand
**Status**: Planning / Pre-Development
**Last Updated**: 2026-08-27

---

## 1. Architectural Philosophy & Guiding Principles

This platform serves four distinct stakeholder types simultaneously — citizens in rural/low-bandwidth environments, government officials managing jurisdiction-level workflows, academic institutions running collaborative project workspaces, and corporate CSR partners making financial and legal commitments. The architecture must reflect this diversity.

**Core Design Principles**:

- **Role-Aware at Every Layer**: The JWT payload, API middleware, service logic, and database queries must all enforce tenant-scoped access. There is no single-tenant shortcut.
- **Offline-First for Citizens**: Citizens operate in districts with intermittent 2G/3G. Any citizen-facing flow (submission, progress check) must work offline with sync-on-reconnect.
- **Deferred Complexity for AI**: The AI triage engine is a recommendation layer, not a gatekeeper. A Nodal Admin always has final say. This prevents AI failure from blocking the core lifecycle.
- **Auditability is Non-Negotiable**: Every state transition, role assignment, funding commitment, and sign-off is an immutable event. The system is designed for government compliance, not convenience.
- **Stateless API Layer**: The backend API is stateless. All state is held in the database and Redis. This enables horizontal scaling without session affinity.

---

## 2. High-Level System Topology

The system is organized into five distinct layers. Each layer has a single clear responsibility, and cross-layer communication follows defined contracts.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         LAYER 1: PRESENTATION LAYER                          │
│         Next.js 16 Progressive Web App (React 19, TypeScript, Tailwind v4)  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐│
│  │   Citizen    │ │  Nodal Admin │ │  HEI Portal  │ │ CSR/Industry Portal  ││
│  │  Mobile UI   │ │  Dashboard   │ │  Workspace   │ │  Marketplace         ││
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────────────┘│
└────────────────────────────────────┬─────────────────────────────────────────┘
                                     │ HTTPS (TLS 1.3)
                                     ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                         LAYER 2: API GATEWAY                                 │
│             Spring Security Gateway — JWT Validation & Tenant Routing         │
│         Rate Limiting · CORS Policy · Request Logging · mTLS (internal)     │
└────────────────────────────────────┬─────────────────────────────────────────┘
                                     │
            ┌────────────────────────┼────────────────────────┐
            │                        │                        │
            ▼                        ▼                        ▼
┌───────────────────────┐ ┌───────────────────────┐ ┌────────────────────────┐
│  LAYER 3A             │ │  LAYER 3B             │ │  LAYER 3C              │
│  CORE BACKEND SERVICE │ │  AI MICROSERVICE      │ │  NOTIFICATION SERVICE  │
│  Java 21 + Spring     │ │  Python 3.11 +FastAPI │ │  Node.js event relay   │
│  Boot 4               │ │                       │ │                        │
│  ─────────────────    │ │  ─────────────────    │ │  ─────────────────     │
│  Auth & RBAC Engine   │ │  Voice Transcription  │ │  WhatsApp (WABA)       │
│  Challenge Registry   │ │  Deduplication Engine │ │  SMS (Gov SMSC)        │
│  HEI Workspace Mgmt   │ │  Thematic Classifier  │ │  Email (SMTP)          │
│  Marketplace Logic    │ │  HEI Match Engine     │ │  In-App Push           │
│  Milestone Tracker    │ │                       │ │                        │
│  Audit Logger         │ │                       │ │                        │
└───────────┬───────────┘ └───────────┬───────────┘ └────────────────────────┘
            │                         │ (results via REST callback)
            └─────────────────────────┘
                         │
     ┌───────────────────┼───────────────────────┐
     │                   │                       │
     ▼                   ▼                       ▼
┌─────────────┐   ┌─────────────┐       ┌────────────────────┐
│ LAYER 4:    │   │ LAYER 4:    │       │ LAYER 4:           │
│ PostgreSQL  │   │ Redis 7     │       │ MinIO / S3         │
│ + PostGIS   │   │             │       │ Object Storage     │
│ + pgvector  │   │ Session     │       │                    │
│             │   │ Cache       │       │ Media: Photos,     │
│ Primary +   │   │ Queue       │       │ Videos, Docs,      │
│ Read Replica│   │             │       │ IP Agreements,     │
└─────────────┘   └─────────────┘       │ ABC Certificates   │
                                        └────────────────────┘
```

---

## 3. Service-by-Service Specification

### 3.1 Core Backend Service (`backend/`)

**Technology Stack**:
- Java 21 with virtual threads (Project Loom) for high-concurrency request handling.
- Spring Boot 4.x, Spring Data JPA (Hibernate), Spring Security, Spring Batch (for scheduled jobs).
- REST API with OpenAPI 3.0 documentation (Swagger UI in non-production).

**Domain Modules (internal package structure by bounded context)**:

**`auth` module**:
- Multi-tenant JWT issuance. The token encodes `sub` (user UUID), `role`, `tenant_type`, `tenant_id`, `permissions[]`.
- OTP service for citizens: Generates OTP, stores in Redis with 5-minute TTL, validates on submission.
- Session management: Refresh token rotation. Refresh tokens stored in Redis, invalidated on logout.
- Gov credential verification: Email domain whitelist check against a configurable list maintained in the admin panel.
- CIN/GSTIN validation: External API call to MCA/GST verification endpoints. Results cached in Redis for 24 hours.

**`challenge` module**:
- Accepts incoming submissions. Validates required fields. Stores media presigned upload references.
- Coordinates with AI Microservice (async call). Stores AI response (tags, urgency score, HEI recommendations) alongside the submission.
- Implements the full state machine: `SUBMITTED → TRIAGED → VALIDATED → ASSIGNED → IN_PROGRESS → PILOT → RESOLVED` (plus `REJECTED`, `ESCALATED`).
- Every state transition is written to the `audit_logs` table before the main entity is updated. Failure to write audit log aborts the transition (transactional).

**`hei` module**:
- Institution and department CRUD. Faculty and student profile management.
- Team assembly with capacity rules enforcement (max 8 students per project).
- Solution proposal builder — structured data with required fields per stage.
- ABC credit calculation: Reads milestone completion timestamps, computes hours, writes to `abc_credit_ledger`.

**`marketplace` module**:
- Proposal publication workflow. Exposes approved proposals as browsable marketplace listings.
- CSR commitment flow: Records funding amounts, mentor assignments, and IP agreement type selections.
- Co-funding tracker: Maintains `committed_amount` vs. `required_amount` per proposal, auto-closes marketplace listing when fully funded.
- IP agreement generation: Populates a legal template (stored as a configurable template in the DB) with entity-specific details, stores the final document in S3, records the S3 key + hash in the DB.

**`milestone` module**:
- Stage gate management. Enforces sequential gate progression — no skipping allowed.
- Gate advancement requires: Document upload reference + mentor approval (stored as approval event).
- Deadline scheduler: Spring Batch job runs daily, identifies overdue milestones, triggers notification events.
- Dual sign-off coordinator: Manages the resolution request lifecycle — sends notifications, tracks acknowledgment state for both citizen and nodal authority.

**`audit` module**:
- Append-only audit log writer. All other modules call this — it never calls others.
- Stores: `actor_id`, `actor_role`, `action_type`, `entity_type`, `entity_id`, `before_state` (JSON snapshot), `after_state` (JSON snapshot), `timestamp`, `ip_address`.
- Exposed to Admin module as a read-only query endpoint.

**`admin` module**:
- Platform-level admin capabilities. User management (verify, suspend, reactivate).
- Report generation: Queries aggregated views for compliance exports. Triggered exports are themselves logged.
- AI configuration management: Allows updating thematic label sets and urgency scoring weights without code deployment — stored in a config table.

---

### 3.2 AI Microservice Engine (`ai-service/`)

**Technology Stack**:
- Python 3.11, FastAPI, Celery (async task queue backed by Redis), Sentence-Transformers, Hugging Face Transformers.
- Internal-only service — never exposed to the public internet. Only reachable by the Core Backend via internal service mesh.

**Current Status**: This service is **in planning only**. No implementation is to begin until backend data contracts are finalized. The below specifications define what the service must do — not how.

**Sub-module: `api/`** — FastAPI application. Receives ingestion requests from the Core Backend, dispatches to Celery workers, returns results via webhook callback to the backend.

**Sub-module: `deduplication/`**:
- Input: New submission text + geo-coordinates.
- Process: Generates a semantic vector embedding of the submission. Queries `pgvector` for the top-N most similar embeddings within a configurable geo-radius. Scores similarity and returns a list of potential duplicate ticket IDs with similarity confidence scores.
- Output: `{is_duplicate: bool, cluster_id: uuid | null, similar_tickets: [{id, similarity_score}]}`

**Sub-module: `classification/`**:
- Input: Submission text (post-transcription if voice input).
- Process: Multi-label classification model assigning one or more thematic domain labels. Assigns primary domain (highest confidence) and secondary domain labels above a confidence threshold.
- Output: `{primary_category: string, secondary_categories: [string], confidence_scores: {label: score}}`

**Sub-module: `routing_recommendation/`**:
- Input: Classified thematic tags + geo-district.
- Process: Queries the HEI capability index (maintained in the database — faculty research tags, lab facilities, incubation status). Ranks institutions using a weighted scoring function. Returns top 3 matches with rationale strings.
- Output: `{recommendations: [{hei_id, score, rationale_summary}]}`

**Voice Transcription** (no dedicated sub-module directory yet):
- Receives audio blobs from the backend (stored temporarily in S3).
- Runs Indic-language ASR model (Whisper fine-tuned for Hindi + Jharkhand regional dialects: Khortha, Nagpuri, Santhali, Mundari).
- Returns structured transcript text and detected language code.
- This is the highest-risk AI component — accuracy directly impacts citizen usability.

---

### 3.3 Notification Service

**Technology Stack**:
- Node.js (lightweight, I/O-optimized for high-volume notification dispatch).
- Receives notification events from the Core Backend via an internal message queue (Redis Streams or a lightweight MQ).

**Channels & Integration**:
- **WhatsApp**: Official WhatsApp Business API (WABA). Template-based messages (pre-approved by Meta for transactional use). Primary channel for Citizens — this is how most of rural Jharkhand communicates.
- **SMS**: Government SMSC gateway integration for OTP and critical alerts. Fallback for citizens without WhatsApp.
- **Email**: SMTP via SendGrid or AWS SES. Used for HEIs, Nodal Admins, and CSR Partners for non-urgent notifications.
- **In-App**: Stores notification records in the database; the frontend polls or uses WebSocket subscriptions to display the notification bell.

**Template Management**: All message templates are stored in the database with locale variants (Hindi, English). Template updates do not require code deployment.

---

### 3.4 Persistence Layer

**PostgreSQL (primary database)**:
- Version: PostgreSQL 16 with PostGIS extension (for `GEOMETRY` spatial queries on geo-tagged challenges) and `pgvector` extension (for semantic similarity search by the deduplication engine).
- Deployment: Primary + 1 Read Replica. All writes go to primary. The public impact dashboard and reporting queries hit the read replica to prevent analytics load from impacting transactional performance.
- Connection pooling: PgBouncer in transaction mode.
- Migrations: Flyway. All schema changes are versioned migration scripts — no direct DDL on production.

**Redis 7**:
- Stores: OTP tokens (TTL: 5 minutes), refresh tokens (TTL: 7 days), CIN/GSTIN verification cache (TTL: 24 hours), notification event queue (Redis Streams), AI processing job queue (Celery backend), application-level query cache for high-traffic endpoints (TTL: configurable, default 5 minutes).

**MinIO / S3-compatible Object Storage**:
- Buckets by content type: `challenge-media` (photos/videos from submissions), `project-documents` (proposal docs, lab reports, field evidence), `ip-agreements` (signed legal documents — requires immutable versioning), `abc-certificates` (PDF exports — write-once).
- Access: Never directly public. Backend generates presigned GET URLs (TTL: 1 hour) for authenticated frontend requests. Presigned POST URLs for direct client uploads (to avoid routing large files through the API server).
- Retention: `challenge-media` and `project-documents` retained for 7 years. `ip-agreements` retained indefinitely.

---

## 4. Data Flow — Critical Paths

### 4.1 Citizen Submission → AI Triage

```
Client (PWA)
  └─► POST /api/challenges (multipart form — metadata + media references)
        └─► Backend: Validate JWT (anonymous submissions allowed for citizens)
              └─► Persist challenge record (status: SUBMITTED)
                    └─► Upload media: Generate presigned S3 PUT URLs, return to client
                          └─► Client uploads media directly to S3
                                └─► Client POSTs media confirmation back to backend
                                      └─► Backend calls AI Microservice async
                                            └─► AI returns: tags, urgency, duplication result, HEI recs
                                                  └─► Backend updates challenge record (status: TRIAGED)
                                                        └─► Notification → Nodal Admin (district)
```

### 4.2 CSR Funding Commitment

```
CSR Partner (browser)
  └─► GET /api/marketplace/proposals (filtered by domain, district, funding gap)
        └─► Select proposal → GET /api/proposals/:id (full detail view)
              └─► POST /api/proposals/:id/commitments (amount, mentor_id, ip_type)
                    └─► Backend: Validate CSR Partner role, validate proposal status is ACTIVE
                          └─► Generate IP agreement document from template → Upload to S3
                                └─► Record commitment (status: PENDING_SIGNATURE)
                                      └─► Send OTP to CSR Admin for digital signature confirmation
                                            └─► POST /api/commitments/:id/sign (OTP)
                                                  └─► Update commitment (status: CONFIRMED)
                                                        └─► Update proposal funding_secured amount
                                                              └─► Notify HEI SPOC + Faculty Mentor
```

---

## 5. API Design Conventions

- **Base URL**: `/api/v1/` for all versioned endpoints.
- **Authentication**: `Authorization: Bearer <JWT>` on all protected routes. Unauthenticated access limited to public dashboard endpoints and submission (citizens without accounts, if supported in Phase 2).
- **Error Response Format**: Consistent error envelope `{error: {code: string, message: string, details: object|null}}`. Never expose stack traces in production.
- **Pagination**: All list endpoints use cursor-based pagination (`?after=<cursor>&limit=<n>`). Avoid offset pagination — it degrades on large datasets.
- **Idempotency**: All POST endpoints that trigger financial or legal actions (CSR commitment, sign-off) accept an `Idempotency-Key` header. Duplicate requests with the same key return the original response.
- **Webhook Callbacks (AI Microservice → Backend)**: AI results are delivered via a POST callback to `/internal/ai/triage-result`. This endpoint is not exposed externally — only reachable from within the internal service mesh. Authenticated via shared secret header.

---

## 6. Deployment Architecture

**Environment Strategy**:
- `development`: Local Docker Compose stack. All services containerized. Mock AI responses for fast iteration.
- `staging`: Full stack deployment on cloud (AWS/GCP) with real AI models. Seeded with anonymized test data. Connected to sandbox versions of WhatsApp and payment APIs.
- `production`: Multi-AZ deployment. Read replicas active. CDN in front of the Next.js app. All secrets in Secrets Manager.

**Containerization**:
- All services are containerized with Docker. Images stored in a private registry.
- No service runs as root inside its container.
- All environment-specific config is injected via environment variables — no config files committed to the repository with secrets.

**CI/CD Pipeline**:
- Pull Request: Lint + unit tests must pass before merge.
- Merge to `main`: Triggers build, integration tests, and deploy to staging.
- Production deploy: Manual promotion from staging. Requires two-person approval.
- Database migrations: Run automatically pre-deploy by the CI pipeline via Flyway. Migrations must be backward-compatible with the running previous version (Blue/Green safe).

---

## 7. Non-Functional Requirements

| Requirement | Target |
|---|---|
| API response time (p95) | < 200ms for CRUD endpoints |
| AI triage processing time | < 10 seconds end-to-end |
| Public dashboard page load (LCP) | < 2.5 seconds (Core Web Vitals Good) |
| System availability | 99.5% monthly uptime |
| Data encryption at rest | AES-256 for all PII and legal documents |
| Data encryption in transit | TLS 1.3 minimum |
| Offline support | Citizen submission drafts preserved for 72 hours |
| Concurrent users (initial) | 500 concurrent (scale horizontally as needed) |
| Audit log retention | 7 years minimum |
| Media storage retention | 7 years (legal documents: indefinite) |
