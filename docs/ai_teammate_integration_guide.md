# 🤝 AI Teammate Integration Guide & Contract Specification

This document provides the technical contract and JSON schema specifications for integrating the **AI Service (FastAPI)**, **Java Backend (Spring Boot)**, and **Frontend (Next.js)** across the Social-Issues Platform.

---

## 🏗️ Architectural Overview

```text
[ Citizen Portal ]  ──(POST /api/issues)──►  [ Java Spring Boot ]  ──(POST /api/v1/intelligence/process)──►  [ FastAPI AI Service ]
     Next.js                                      Port 8080                                                        Port 8000
        ▲                                             │                                                                │
        │                                             ▼                                                                ▼
[ Nodal Dashboard ] ◄──(GET /api/issues)─────  Persists DB & JSON  ◄──(Returns AI JSON Response)───────────────────────┘
```

---

## 📋 1. AI Service Response Specification

When your teammate's AI microservice processes a citizen complaint (via `POST /api/v1/intelligence/process` or `POST /api/v1/preprocessing/full`), it MUST return a response payload formatted according to this schema:

```json
{
  "success": true,
  "message": "AI Multimodal Processing completed successfully.",
  "data": {
    "issue_id": "GRI-2026-981245",
    "summary": {
      "title": "Normalized Issue Title in English",
      "category": "WATER",
      "urgency_level": "CRITICAL",
      "priority_score": 88,
      "validity_status": "VALID"
    },
    "modality_breakdown": {
      "text_analysis": {
        "category": "WATER_RESOURCES",
        "priority_score": 85
      },
      "image_analysis": {
        "category": "WATER_RESOURCES",
        "priority_score": 78
      },
      "document_analysis": {
        "category": "WATER_RESOURCES",
        "priority_score": 90
      },
      "location_analysis": {
        "is_valid": true,
        "district": "Bokaro",
        "is_in_jharkhand": true,
        "urgency_bonus": 10
      }
    },
    "generalized_consensus": {
      "final_category": "WATER_RESOURCES",
      "average_priority_score": 88,
      "final_priority_level": "CRITICAL",
      "consensus_reason": "High-confidence 4-modality consensus confirms broken check-dam impacting farming community in Bokaro."
    }
  }
}
```

---

## ☕ 2. Java Backend Integration (`backend/`)

1. **Client Connector:** `com.example.social_issues.problemsubmission.service.AiServiceClient.java`
   - Calls FastAPI endpoint `http://localhost:8000/api/v1/intelligence/process`.
2. **Entity Persistence:** `com.example.social_issues.problemsubmission.model.GrassrootIssue.java`
   - Serializes the AI response into the `validationReportJson` database column.
3. **API Response DTO:** `com.example.social_issues.problemsubmission.dto.IssueResponse.java`
   - Exposes `modalityBreakdown` and `generalizedConsensus` fields directly to Next.js.

---

## 🎨 3. Next.js Frontend Integration (`frontend/web/`)

- **State Store:** `src/lib/store/useIssueStore.ts`
  - Defines `GrassrootIssueRecord` interface matching backend responses.
- **Citizen Portal:** `src/components/dashboard/CitizenDashboardView.tsx`
  - Sends raw user text, location, photo file, and PDF document.
- **Nodal Dashboard Inspection:** `src/components/dashboard/NodalAiAuditCard.tsx`
  - Inspects citizen metadata (Email, Name, Phone, GPS), photo attachments, interactive PDF viewer, and raw AI JSON output.
  - Displays a clean **"AI Multimodal Verification In Progress"** notice whenever AI JSON is pending, ensuring zero UI breakage while your teammate deploys AI pipeline updates.
