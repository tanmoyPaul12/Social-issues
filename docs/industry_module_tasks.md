# Industry Partnership Module — Task List

> Tasks are ordered by priority and dependency. Complete each task fully before moving to the next.
> Each task references the relevant files and is scoped to be achievable in one focused session.

---

## Phase 1A — Partner Type Differentiation (Foundational)

> **Why first:** Every other feature depends on knowing what type of partner is using the module.

- [x] **Task 1.1** — Create `PartnerCategory` enum
  - File: `[NEW]` `backend/.../industrypartnership/model/PartnerCategory.java`
  - Values: `LARGE_ENTERPRISE`, `STARTUP`, `MSME`, `CSR_ORGANIZATION`, `RESEARCH_INSTITUTION`, `INNOVATION_HUB`

- [x] **Task 1.2** — Add `partnerCategory` field to `IndustryProfile`
  - File: `[MODIFY]` `backend/.../auth/model/IndustryProfile.java`
  - Add `@Enumerated(EnumType.STRING) PartnerCategory partnerCategory`
  - Add `dpiitRecognitionNumber` (Startup), `udyamRegistrationNumber` (MSME), `taxExemptionNumber` (CSR Org/NGO 12A/80G), `institutionRegNumber` (Research Institution)
  - Make `gstin` / `cinNumber` / `csrNumber` optional (nullable) — enforced by partner category in service layer
  - Add getters/setters

- [x] **Task 1.3** — Add DB migration column
  - File: `[MODIFY]` `backend/src/main/resources/application.yml`
  - Confirm `spring.jpa.hibernate.ddl-auto` is `update` (so columns are added automatically on restart)
  - If using Flyway/Liquibase, add a migration script instead

- [x] **Task 1.4** — Expose `partnerCategory` in CompanyProfile DTO
  - File: `[MODIFY]` `backend/.../industrypartnership/dto/CompanyProfileDto.java`
  - Add `partnerCategory`, `dpiitRecognitionNumber`, `udyamRegistrationNumber`, `taxExemptionNumber`, `institutionRegNumber`

- [x] **Task 1.5** — Update `UpdateCompanyProfileRequest` to accept partner category fields
  - File: `[MODIFY]` `backend/.../industrypartnership/dto/UpdateCompanyProfileRequest.java`
  - Add the same optional fields as above

- [x] **Task 1.6** — Update `CompanySettingsServiceImpl` to map/save partner category fields
  - File: `[MODIFY]` `backend/.../industrypartnership/service/CompanySettingsServiceImpl.java`
  - Map `partnerCategory` and registration number fields in get/update profile logic

- [x] **Task 1.7** — Add partner category selector to frontend Company Profile
  - File: `[MODIFY]` `frontend/.../industry/settings/CompanyProfileSection.tsx`
  - Add a styled dropdown for `PartnerCategory` with human-readable labels
  - Show/hide relevant registration number fields based on selected category
  - Update TypeScript types in `frontend/.../modules/industry/types/companySettings.ts`

- [x] **Task 1.8** — Update `companySettingsApi.ts` to send partner category fields
  - File: `[MODIFY]` `frontend/.../modules/industry/services/companySettingsApi.ts`
  - Include `partnerCategory` and conditional registration number in `updateCompanyProfile` request body

---

## Phase 1B — Field Testbed Deployments (Model Exists, Needs Full Stack)

> **Why second:** The `TestbedSponsorship` model is already in the DB. The tab exists in routing but incorrectly renders `ActivePilotsTab`. Quick win with high visibility.

- [x] **Task 2.1** — Extend `TestbedSponsorship` model with missing fields
  - File: `[MODIFY]` `backend/.../industrypartnership/model/TestbedSponsorship.java`
  - Add: `deploymentStatus` (enum: `PLANNED`, `LIVE`, `COMPLETED`), `evidencePhotoUrls` (`TEXT` JSON array), `liveDataFeedUrl`, `beneficiaryCount`, `projectName`, `pilotPhase`
  - Add getters/setters

- [x] **Task 2.2** — Create `DeploymentStatus` enum
  - File: `[NEW]` `backend/.../industrypartnership/model/DeploymentStatus.java`
  - Values: `PLANNED`, `LIVE`, `COMPLETED`, `SUSPENDED`

- [x] **Task 2.3** — Create `TestbedSponsorshipDto` (response DTO)
  - File: `[NEW]` `backend/.../industrypartnership/dto/TestbedSponsorshipDto.java`
  - Fields: `id`, `testbedName`, `district`, `block`, `villageOrLocation`, `deploymentStatus`, `beneficiaryCount`, `pilotTitle`, `startedAt`, `completedAt`, `evidencePhotoUrls`, `liveDataFeedUrl`
  - Static `fromEntity()` factory method

- [x] **Task 2.4** — Create request DTOs
  - File: `[NEW]` `backend/.../industrypartnership/dto/CreateTestbedRequest.java`
  - File: `[NEW]` `backend/.../industrypartnership/dto/UpdateTestbedStatusRequest.java`

- [x] **Task 2.5** — Create `FieldTestbedService` interface
  - File: `[NEW]` `backend/.../industrypartnership/service/FieldTestbedService.java`
  - Methods: `getTestbeds(userId, filters, pageable)`, `createTestbed(userId, request)`, `updateStatus(userId, id, request)`, `uploadEvidence(userId, id, files)`, `getDistrictSummary(userId)`

- [x] **Task 2.6** — Implement `FieldTestbedServiceImpl`
  - File: `[NEW]` `backend/.../industrypartnership/service/FieldTestbedServiceImpl.java`
  - Implement all methods using `TestbedSponsorshipRepository` and `IndustryProfileRepository`
  - For evidence upload: store to MinIO / local fallback, save URL to JSON array column

- [x] **Task 2.7** — Create `FieldTestbedController`
  - File: `[NEW]` `backend/.../industrypartnership/controller/FieldTestbedController.java`
  - `GET  /industry/dashboard/testbeds` — paginated list with filters (district, status)
  - `POST /industry/dashboard/testbeds` — create new testbed sponsorship
  - `PATCH /industry/dashboard/testbeds/{id}/status` — update deployment status
  - `POST /industry/dashboard/testbeds/{id}/evidence` — upload evidence photos (multipart)
  - `GET  /industry/dashboard/testbeds/district-summary` — returns `List<{district, count, beneficiaries}>`

- [x] **Task 2.8** — Add testbed types to frontend
  - File: `[NEW]` `frontend/.../modules/industry/types/testbeds.ts`
  - Interfaces: `TestbedSponsorshipDto`, `DistrictSummaryDto`, `CreateTestbedRequest`

- [x] **Task 2.9** — Create `fieldTestbedApi.ts` service
  - File: `[NEW]` `frontend/.../modules/industry/services/fieldTestbedApi.ts`
  - Functions: `getTestbeds(filters)`, `createTestbed(data)`, `updateTestbedStatus(id, status)`, `uploadEvidence(id, files)`, `getDistrictSummary()`

- [x] **Task 2.10** — Create `useFieldTestbeds.ts` hook
  - File: `[NEW]` `frontend/.../modules/industry/hooks/useFieldTestbeds.ts`
  - State: `testbeds`, `districtSummary`, `loading`, `error`, CRUD actions

- [x] **Task 2.11** — Create `FieldTestbedDeploymentTab.tsx` component
  - File: `[NEW]` `frontend/.../industry/testbeds/FieldTestbedDeploymentTab.tsx`
  - District summary cards at top (total testbeds, districts, beneficiaries)
  - Filter bar (by district, status)
  - Deployment card list: name, district/block, status badge, beneficiary count, photos, dates
  - "Add Testbed" button → `CreateTestbedModal`

- [x] **Task 2.12** — Create `CreateTestbedModal.tsx`
  - File: `[NEW]` `frontend/.../industry/testbeds/CreateTestbedModal.tsx`
  - Form: testbed name, district, block, village, link to pilot (optional), start date, status

- [x] **Task 2.13** — Fix tab routing in `IndustryDashboardView.tsx`
  - File: `[MODIFY]` `frontend/.../dashboard/IndustryDashboardView.tsx`
  - Wire `testbeds` tab → `FieldTestbedDeploymentTab` (currently wrongly shows `ActivePilotsTab`)
  - Wire `prototyping` tab → same `FieldTestbedDeploymentTab` or placeholder

---

## Phase 1C — Analytics / Impact Reports Tab

- [x] **Task 3.1** — Create analytics DTOs
  - File: `[NEW]` `backend/.../industrypartnership/dto/ImpactSummaryDto.java`
  - File: `[NEW]` `backend/.../industrypartnership/dto/QuarterlyTrendDto.java`
  - Fields for impact: `totalBeneficiaries`, `districtsCovered`, `pilotsCompleted`, `totalCsrSpend`, `patentsGenerated`, `jobsCreated`

- [x] **Task 3.2** — Create `IndustryAnalyticsService` interface + `IndustryAnalyticsServiceImpl`
  - File: `[NEW]` `backend/.../industrypartnership/service/IndustryAnalyticsService.java`
  - File: `[NEW]` `backend/.../industrypartnership/service/IndustryAnalyticsServiceImpl.java`
  - Fix the empty `buildFinancialTrend()` method — query disbursements grouped by quarter
  - Impact summary: aggregate from `CoFundedPilot`, `TestbedSponsorship` data

- [x] **Task 3.3** — Create `IndustryAnalyticsController`
  - File: `[NEW]` `backend/.../industrypartnership/controller/IndustryAnalyticsController.java`
  - `GET /industry/dashboard/analytics/impact-summary`
  - `GET /industry/dashboard/analytics/financial-trend`
  - `GET /industry/dashboard/analytics/domain-breakdown`

- [x] **Task 3.4** — Create `industryAnalyticsApi.ts` service
  - File: `[NEW]` `frontend/.../modules/industry/services/industryAnalyticsApi.ts`

- [x] **Task 3.5** — Create `useIndustryAnalytics.ts` hook
  - File: `[NEW]` `frontend/.../modules/industry/hooks/useIndustryAnalytics.ts`

- [x] **Task 3.6** — Create `IndustryAnalyticsTab.tsx`
  - File: `[NEW]` `frontend/.../industry/analytics/IndustryAnalyticsTab.tsx`
  - Impact metric cards: total beneficiaries, districts covered, pilots completed, CSR spend
  - Financial trend chart (recharts / SVG BarChart — committed vs. disbursed per quarter)
  - Domain engagement pie/donut chart
  - "Download Annual Impact Report" button

- [x] **Task 3.7** — Wire analytics tab in `IndustryDashboardView.tsx`
  - File: `[MODIFY]` `frontend/.../dashboard/IndustryDashboardView.tsx`
  - Replace `WorkspacePlaceholderTab` for `analytics` with `IndustryAnalyticsTab`

---

## Phase 1D — Notifications / Alerts Tab

- [x] **Task 4.1** — Create `IndustryNotificationsTab.tsx`
  - File: `[NEW]` `frontend/.../industry/notifications/IndustryNotificationsTab.tsx`
  - Reuse existing `/industry/dashboard/activities` API (already implemented)
  - Filter tabs: All / Milestone / Compliance / Matching Projects
  - Notification row: icon, title, message, time ago, mark-as-read button
  - "Mark all as read" button
  - Compliance deadline countdown cards

- [x] **Task 4.2** — Wire notifications tab in `IndustryDashboardView.tsx`
  - File: `[MODIFY]` `frontend/.../dashboard/IndustryDashboardView.tsx`
  - Add `notifications` to recognized tab IDs list
  - Wire to `IndustryNotificationsTab`

- [x] **Task 4.3** — Add unread notification badge to sidebar
  - File: `[MODIFY]` `frontend/.../dashboard/DashboardSidebar.tsx`
  - Show unread count badge on the Notifications nav item for industry role
  - Pull count from overview API (`quickActions.unreadAlerts` already returned)

---

## Phase 2A — Mentorship Lifecycle Tracking

- [x] **Task 5.1** — Create `MentorshipEngagement` model
  - File: `[NEW]` `backend/.../industrypartnership/model/MentorshipEngagement.java`
  - Fields: `id`, `marketplaceProjectId`, `industryProfileId`, `mentorName`, `mentorDesignation`, `mentorEmail`, `expertiseDomains`, `status` (`PENDING_ACCEPTANCE` | `ACTIVE` | `PAUSED` | `COMPLETED`), `sessionCount`, `nextSessionDate`, `notes`, `createdAt`

- [x] **Task 5.2** — Create `MentorshipEngagementRepository`
  - File: `[NEW]` `backend/.../industrypartnership/repository/MentorshipEngagementRepository.java`

- [x] **Task 5.3** — Create `MentorshipService` interface + `MentorshipServiceImpl`
  - File: `[NEW]` `backend/.../industrypartnership/service/MentorshipService.java`
  - File: `[NEW]` `backend/.../industrypartnership/service/MentorshipServiceImpl.java`
  - Methods: `getMentorships(userId)`, `updateStatus(userId, id, status)`, `logSession(userId, id, notes)`

- [x] **Task 5.4** — Create `MentorshipController`
  - File: `[NEW]` `backend/.../industrypartnership/controller/MentorshipController.java`
  - `GET  /industry/dashboard/mentorships`
  - `PATCH /industry/dashboard/mentorships/{id}/status`
  - `POST /industry/dashboard/mentorships/{id}/session`

- [x] **Task 5.5** — Add mentorship tracking UI to marketplace project dossier
  - File: `[MODIFY]` `frontend/.../industry/marketplace/ProjectDossierModal.tsx`
  - Add "Mentorship Status" section: current mentor, status chip, session count
  - Show only if mentorship was offered for this project
## Phase 2B — Co-Development Agreement Module

- [x] **Task 6.1** — Create `CoDevelopmentAgreement` model
  - File: `[NEW]` `backend/.../industrypartnership/model/CoDevelopmentAgreement.java`
  - Fields: `id`, `pilotId`, `industryProfileId`, `universityId`, `agreementTitle`, `agreementType` (LOI | MOU | TRIPARTITE), `status` (DRAFT | SENT | SIGNED_BY_INDUSTRY | FULLY_EXECUTED), `documentUrl`, `signedAt`, `expiresAt`, `ipSplitPercentIndustry`, `ipSplitPercentUniversity`

- [x] **Task 6.2** — Create `CoDevelopmentAgreementRepository`
  - File: `[NEW]` `backend/.../industrypartnership/repository/CoDevelopmentAgreementRepository.java`

- [x] **Task 6.3** — Create `CoDevelopmentService` + `CoDevelopmentServiceImpl`
  - File: `[NEW]` `backend/.../industrypartnership/service/CoDevelopmentService.java`
  - File: `[NEW]` `backend/.../industrypartnership/service/CoDevelopmentServiceImpl.java`
  - Methods: `getAgreements(userId)`, `createDraft(userId, request)`, `uploadSignedCopy(userId, id, file)`, `updateStatus(userId, id, status)`

- [x] **Task 6.4** — Create `CoDevelopmentController`
  - File: `[NEW]` `backend/.../industrypartnership/controller/CoDevelopmentController.java`
  - `GET  /industry/dashboard/agreements`
  - `POST /industry/dashboard/agreements`
  - `POST /industry/dashboard/agreements/{id}/upload`
  - `PATCH /industry/dashboard/agreements/{id}/status`

- [x] **Task 6.5** — Integrate agreements into Pilot Detail modal
  - File: `[MODIFY]` `frontend/.../industry/pilots/PilotDetailDossierModal.tsx`
  - Add "Agreements" tab section: list agreements with status, upload signed copy button, create draft button

---

## Phase 2C — Communication / Messaging Tab

- [x] **Task 7.1** — Create `IndustryCommunicationTab.tsx`
  - File: `[NEW]` `frontend/.../industry/communication/IndustryCommunicationTab.tsx`
  - Sidebar list of conversation threads (by pilot or project)
  - Main message area showing `PilotDiscussion` messages for selected pilot
  - Compose message box
  - Reuses existing `POST /industry/dashboard/pilots/{id}/discussions` and `GET` endpoints

- [x] **Task 7.2** — Wire communication tab in `IndustryDashboardView.tsx`
  - File: `[MODIFY]` `frontend/.../dashboard/IndustryDashboardView.tsx`
  - Replace `WorkspacePlaceholderTab` for `communication` / `messages` tabs with `IndustryCommunicationTab`

---

## Phase 3 — Sidebar Nav Alignment

- [x] **Task 8.1** — Verify and update industry sidebar nav items
  - File: `[MODIFY]` `frontend/.../dashboard/DashboardSidebar.tsx`
  - Ensure these tab IDs are present for industry role:
    `overview`, `marketplace`, `collaborations`, `testbeds`, `funding`, `ip`, `analytics`, `notifications`, `communication`, `settings`
  - Update nav labels:
    - `collaborations` → "My Co-Funded Projects"
    - `testbeds` → "Field Testbeds"
    - `analytics` → "Impact & Analytics"
    - `notifications` → "Notifications"
    - `communication` → "Communication"

---

## Final Verification Checklist

- [x] Backend compiles: `./mvnw test-compile` — zero errors
- [x] Frontend typechecks: `pnpm tsc --noEmit` in `frontend/web` — zero TypeScript errors
- [x] All new tabs render without blank screen or JS errors
- [x] `testbeds` tab no longer renders the pilots component
- [x] `analytics` tab shows charts with empty state when no data
- [x] `notifications` tab shows activity feed with filter tabs
- [x] Partner category dropdown visible in Company Settings profile form
- [x] `prototyping` tab routes correctly (not broken)

---

**Total Tasks: 47**
| Phase | Tasks | Priority |
|---|---|---|
| 1A Partner Types | 8 | 🔴 Highest |
| 1B Field Testbeds | 13 | 🔴 High |
| 1C Analytics | 7 | 🟡 Medium |
| 1D Notifications | 3 | 🟡 Medium |
| 2A Mentorship | 5 | 🟠 Lower |
| 2B Co-Development | 5 | 🟠 Lower |
| 2C Communication | 2 | 🟠 Lower |
| 3 Sidebar Nav | 1 | 🟢 Quick Win |
| Final Checks | 8 | — |
