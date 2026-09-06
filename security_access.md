---
id: security_access
title: "Security & Role-Based Access Control"
tags:
  - docs
  - security
  - rbac
moc: [[MOC_System_Architecture]]
---

# Security & Access Control Specification
**Platform**: Societal Innovation Collaboration Portal — Jharkhand
**Status**: Planning / Pre-Development
**Last Updated**: 2026-08-27

---

## 1. Security Philosophy

This platform is a government-adjacent system handling citizen PII, financial commitments, legal IP agreements, and auditable government actions. Security is not a feature — it is a baseline requirement. Every design decision must consider the following threat categories:

- **Unauthorized data access**: A citizen must never be able to view another citizen's submission details or a rival university's workspace.
- **Privilege escalation**: A student must not be able to approve milestones; a CSR partner must not be able to alter a proposal's financial terms after commitment.
- **Data manipulation without audit trail**: Every state change on critical entities must be immutable and attributable to a specific authenticated actor.
- **Identity fraud**: The platform must resist fake government official accounts, fake HEI registrations, and fake corporate CSR entities.

---

## 2. Multi-Tenant Role Hierarchy

The platform operates on a **multi-tenant RBAC model**. A "tenant" in this context is the organizational entity a user belongs to — a specific government district office, a specific university, or a specific corporate entity. Users inherit permissions from their role, but their scope of action is constrained to their tenant.

### 2.1 Role Definitions

| Role | Tenant Type | Description |
|---|---|---|
| `CITIZEN` | None (individual) | Registers individually. Can only act on their own submitted challenges. |
| `NODAL_ADMIN` | Government District/Block | Validates, routes, and oversees challenges within their administrative jurisdiction only. |
| `HEI_SPOC` | University Institution | Manages the university's profile, team formation, and proposal submissions. |
| `FACULTY_MENTOR` | University Institution | Reviews team progress, approves milestone gates, advises student teams. |
| `STUDENT_INNOVATOR` | University Institution | Participates in project workspaces, uploads documents, logs progress. |
| `CSR_ADMIN` | Corporate Entity | Manages the company's marketplace activity, commits funds, signs IP agreements. |
| `INDUSTRY_MENTOR` | Corporate Entity | Reviews project milestones from an industry perspective, provides mentorship notes. |
| `PLATFORM_ADMIN` | Platform (internal) | Cross-tenant access for system administration, user management, audit review. |

### 2.2 Tenant Scoping Rules

These are non-negotiable constraints enforced at the API middleware level — not just at the UI level:

- A `NODAL_ADMIN` can only read, validate, or route challenges where the submission's `district` or `block` field matches their registered jurisdiction.
- An `HEI_SPOC` and `FACULTY_MENTOR` and `STUDENT_INNOVATOR` can only access project workspaces where the `hei_id` matches their institution.
- A `STUDENT_INNOVATOR` can only view and edit resources within projects where their `user_id` appears in the team roster.
- A `CSR_ADMIN` and `INDUSTRY_MENTOR` can browse all marketplace listings, but can only view internal details of projects they have an active commitment to.
- `PLATFORM_ADMIN` has full read access and targeted write access (user management, config changes) but **cannot** create, alter, or delete project/financial records — they can only view and export.

---

## 3. Platform Access & Authorization Matrix

### 3.1 Challenge / Submission Resources

| Action | CITIZEN | NODAL_ADMIN | HEI_SPOC | STUDENT_INNOVATOR | CSR_ADMIN | PLATFORM_ADMIN |
|---|---|---|---|---|---|---|
| Submit new challenge | ✅ Own | ✅ (on behalf of PRI/ULB) | ❌ | ❌ | ❌ | ❌ |
| Read challenge details | ✅ Own only | ✅ Jurisdiction only | ✅ Assigned to their HEI | ✅ On their team's project | ✅ Marketplace-listed only | ✅ All |
| Validate & tag challenge | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Assign to HEI | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Reject challenge | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |

### 3.2 HEI Workspace & Team Resources

| Action | CITIZEN | NODAL_ADMIN | HEI_SPOC | FACULTY_MENTOR | STUDENT_INNOVATOR | CSR_ADMIN / INDUSTRY_MENTOR |
|---|---|---|---|---|---|---|
| Create workspace | ❌ | ❌ | ✅ Own institution | ❌ | ❌ | ❌ |
| Assemble team | ❌ | ❌ | ✅ Own institution | ❌ | ❌ | ❌ |
| Submit solution proposal | ❌ | ❌ | ✅ | ✅ | ✅ (collaborative edit) | ❌ |
| Approve proposal (internal) | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Upload project documents | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |

### 3.3 Marketplace & Funding Resources

| Action | NODAL_ADMIN | HEI_SPOC | CSR_ADMIN | INDUSTRY_MENTOR | PLATFORM_ADMIN |
|---|---|---|---|---|---|
| View marketplace listings | Read-only | Read-only | ✅ Browse all | ✅ Browse all | ✅ All |
| Commit CSR funding | ❌ | ❌ | ✅ | ❌ | ❌ |
| Assign industry mentor | ❌ | ❌ | ✅ Own company | ❌ | ❌ |
| Sign IP agreement | ❌ | ✅ (HEI side) | ✅ (Industry side) | ❌ | ❌ |

### 3.4 Milestone & Sign-off Resources

| Action | CITIZEN | NODAL_ADMIN | FACULTY_MENTOR | STUDENT_INNOVATOR | INDUSTRY_MENTOR |
|---|---|---|---|---|---|
| Log milestone progress | ❌ | ❌ | ✅ | ✅ | ❌ |
| Approve gate advancement | ❌ | ❌ | ✅ | ❌ | ✅ (from Prototype onwards) |
| Issue resolution sign-off | ✅ Own challenge | ✅ Jurisdiction | ❌ | ❌ | ❌ |

---

## 4. Authentication Implementation Plan

### 4.1 JWT Structure & Lifecycle

All API requests to protected endpoints carry a short-lived Access Token and a long-lived Refresh Token.

**Access Token**:
- Signed with RS256 (asymmetric — public key can be distributed for verification without exposing the private signing key).
- TTL: 15 minutes.
- Payload must contain: `sub` (user UUID), `role`, `tenant_type`, `tenant_id`, `permissions[]`, `iat`, `exp`, `jti` (unique token ID for revocation tracking).

**Refresh Token**:
- Stored server-side in Redis, keyed by `user_id`.
- TTL: 7 days (sliding — refreshed on each use).
- On logout: Redis entry is deleted. Old refresh tokens immediately invalid.
- Rotation policy: Each refresh token use issues a new refresh token. Old one is immediately revoked. This detects token theft (if stolen token is used, the legitimate user's next request will fail and trigger re-authentication).

### 4.2 Authentication Flows by Stakeholder Type

**Citizens (OTP-based)**:
1. User enters phone number.
2. Backend generates 6-digit OTP, stores in Redis with 5-minute TTL.
3. OTP sent via SMS (and WhatsApp if phone has WABA-registered number).
4. User enters OTP. Backend validates against Redis value.
5. On success: Access Token + Refresh Token issued. Redis OTP entry deleted.
6. Max 3 OTP attempts before 15-minute lockout (tracked in Redis by phone number + IP).

**Government Officials (Credential-based)**:
1. Email + password authentication.
2. Email domain validated against government domain whitelist.
3. New accounts require Platform Admin approval before first login is permitted.
4. MFA enforced: TOTP (Google Authenticator / Authy) required after first login setup.

**HEI & Industry Partners (Credential-based + Institutional Verification)**:
1. Email + password for the SPOC or CSR Admin.
2. At registration: AISHE code (HEI) or CIN/GSTIN (Industry) submitted.
3. Verification API call made during registration (not at login). Result stored — account activated only on verified identity.
4. MFA: Encouraged but not mandatory in Phase 1. Mandatory for CSR Admins who can sign financial commitments.

---

## 5. Backend Authorization Middleware Design

### 5.1 Middleware Pipeline (per request)

Every protected API request passes through this sequence before reaching any business logic:

```
Incoming Request
  → JWT Extraction & Validation (signature, expiry, jti not revoked)
  → Role Extraction → Permission Set Assembly
  → Tenant Scope Extraction (tenant_id, tenant_type, jurisdiction from token)
  → Route-Level Permission Check (does this role have permission for this endpoint + HTTP method?)
  → Resource-Level Scope Check (does the resource being accessed belong to this actor's tenant scope?)
  → Proceed to Controller / Reject with 403
```

Any failure in this pipeline returns a structured error response. The system logs the failed authorization attempt with actor, resource, timestamp, and reason — including for legitimate users who hit permission boundaries (not just attackers).

### 5.2 Contextual Authorization (Beyond Static Roles)

Static role checks are insufficient for this platform. Several resources require contextual authorization:

- **Student updating a project document**: Even if the user has `STUDENT_INNOVATOR` role, the request is only authorized if their `user_id` is present in the `team_roster` of the specific project being modified.
- **Faculty Mentor approving a gate**: Valid only if their `user_id` is listed as the designated mentor of that specific project workspace.
- **CSR Admin signing an IP agreement**: Valid only if their `tenant_id` (company) has an active, unsigned commitment record for that specific proposal.
- **Nodal Admin validating a challenge**: Valid only if the challenge's `district` field matches the admin's registered `jurisdiction`.

These contextual checks must be implemented as reusable authorization components in the backend — not scattered inline in controller code.

### 5.3 Token Revocation

The system must support immediate token revocation for:
- Password change.
- Account suspension by Platform Admin.
- Logout from all devices.
- Detection of refresh token reuse (theft detection).

Implementation: A `revoked_tokens` set in Redis, keyed by `jti` (JWT ID). All access token validations check this set. TTL of revoked entry matches the token's `exp` — after that, the token would have expired anyway.

---

## 6. API Security Requirements

### 6.1 Transport Security

- TLS 1.3 minimum for all external traffic. TLS 1.2 as a legacy fallback only (to be deprecated at next major release).
- mTLS for all internal service-to-service communication (Backend ↔ AI Microservice, Backend ↔ Notification Service).
- Certificate rotation managed via Let's Encrypt (external) and a private CA (internal service mesh).

### 6.2 Input Validation & Injection Prevention

- All API inputs validated at the controller layer against strict schemas (bean validation annotations in Spring). Invalid inputs rejected with 400 before reaching service logic.
- All database queries use parameterized queries / JPA criteria API. No string-interpolated SQL anywhere.
- File uploads: File type validated by reading MIME magic bytes — not by trusting the client-supplied `Content-Type` header. Uploaded files are virus-scanned before being accessible via presigned URL.
- Rich text fields (submission descriptions) sanitized server-side to strip any HTML/script content.

### 6.3 Rate Limiting

Applied at the API Gateway level:

| Endpoint Category | Limit |
|---|---|
| OTP generation | 3 requests per phone per 15 minutes |
| Login attempts | 5 failed attempts → 15-minute account lockout |
| Submission endpoints | 10 submissions per hour per authenticated user |
| Marketplace browsing | 100 requests per minute per IP (unauthenticated) |
| AI triage trigger | 1 per challenge (idempotent, subsequent calls ignored) |

### 6.4 CORS Policy

- Production: Strict origin whitelist (only the official frontend domain).
- Staging: Frontend staging domain + localhost:3000 (developer machines).
- Never: Wildcard `*` origin in any environment.

---

## 7. Audit Logging Specification

### 7.1 What Must Be Logged

Every action that changes the state of a resource must generate an audit log entry. This is non-negotiable for compliance.

**Minimum set of logged events**:
- User account creation, modification, suspension, reactivation.
- Login success and failure (with IP address).
- Password or phone number change.
- Challenge state transition (every status change).
- HEI team assembly or modification.
- Proposal submission, approval, rejection.
- CSR commitment creation, signing, modification.
- Milestone gate approval or rollback.
- IP agreement generation and signing.
- Resolution sign-off (both citizen and nodal authority).
- Any admin action on any entity.
- Any data export by any user.

### 7.2 Log Entry Structure

Each log entry records: who did it (`actor_id`, `actor_role`, `actor_ip`), what was done (`action_type`, `entity_type`, `entity_id`), and the state change (`before_state` as JSON snapshot, `after_state` as JSON snapshot), plus `timestamp` (UTC, with milliseconds).

### 7.3 Log Integrity

- Audit logs are append-only. No `UPDATE` or `DELETE` operations exist on the audit log table.
- Logs are archived to cold storage after 2 years but remain queryable.
- Retained for 7 years minimum per government compliance requirements.
- Periodic integrity checks: A scheduled job computes and stores a hash of log entries per day. Hash chain allows detection of tampering.

---

## 8. Data Privacy & PII Handling

- **PII in submissions**: Citizen phone, name, and address are stored encrypted at rest using AES-256. They are never included in the data that feeds the public dashboard.
- **Public dashboard**: All data shown publicly is pre-aggregated at district level. Individual issue details, citizen identities, and student names are never exposed.
- **Media access**: Uploaded photos and videos are never publicly accessible by direct URL. Only authenticated users with appropriate access rights can retrieve presigned download URLs, and those URLs expire in 1 hour.
- **Data minimization**: The platform collects only what is needed for operational purposes. No behavioral analytics, ad tracking, or third-party data sharing.
- **Right to erasure**: Citizens can request deletion of their account and associated PII. The platform must anonymize the citizen's identity in their submitted challenges (preserve the challenge data for policy purposes, remove the personal linkage). IP agreements and audit logs cannot be modified — these are legal and compliance records.