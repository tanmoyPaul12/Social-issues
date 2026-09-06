"""
Enums: Shared enumeration types for the Societal Innovation AI Microservice.

These enums define all fixed-value domains used across the schema layer.
The Java/Spring Boot backend must use the same string values when sending
JSON payloads to the AI service.

Data Flow:
    Java Spring Boot Backend
            │  ChallengeInput JSON
            ▼
    Python AI Service  ←── These enums define valid field values
            │
            ▼
    Validation Layer → Preprocessing Layer → AI Triage Layer
"""
from enum import Enum


class ProblemCategory(str, Enum):
    """
    Thematic domain categories for societal challenges.
    The AI categorization module will assign one of these to each submission.

    AI-specific fallback states are included for edge cases where the
    submission cannot be confidently categorized.
    """
    EDUCATION             = "EDUCATION"
    AGRICULTURE           = "AGRICULTURE"
    HEALTHCARE            = "HEALTHCARE"
    WATER_RESOURCES       = "WATER_RESOURCES"
    ENVIRONMENT           = "ENVIRONMENT"
    ENERGY                = "ENERGY"
    URBAN_DEVELOPMENT     = "URBAN_DEVELOPMENT"
    ACCESSIBILITY         = "ACCESSIBILITY"
    PUBLIC_ADMINISTRATION = "PUBLIC_ADMINISTRATION"
    RURAL_LIVELIHOODS     = "RURAL_LIVELIHOODS"

    # AI fallback states
    OTHER                    = "OTHER"
    INSUFFICIENT_INFORMATION = "INSUFFICIENT_INFORMATION"
    NOT_A_SOCIETAL_PROBLEM   = "NOT_A_SOCIETAL_PROBLEM"


class PriorityLevel(str, Enum):
    """
    Priority tiers for societal challenges.

    IMPORTANT:
    - `reported_priority` in ChallengeInput = citizen-selected priority (subjective)
    - `ai_priority` in AI results            = model-computed priority (objective)
    - `final_priority` (future)              = admin-confirmed priority

    These must remain conceptually separate throughout the system.
    """
    LOW      = "LOW"
    MEDIUM   = "MEDIUM"
    HIGH     = "HIGH"
    CRITICAL = "CRITICAL"


class AttachmentType(str, Enum):
    """
    Type of evidence attachment submitted by the citizen.
    Used to route each file to the correct preprocessing sub-pipeline.
    """
    IMAGE    = "IMAGE"
    VIDEO    = "VIDEO"
    DOCUMENT = "DOCUMENT"


class ProcessingStatus(str, Enum):
    """
    Lifecycle status for AI processing jobs.

    State machine:
        PENDING → PROCESSING → COMPLETED
                             → PARTIAL_SUCCESS  (some attachments failed)
                             → FAILED           (critical failure)
    """
    PENDING        = "PENDING"
    PROCESSING     = "PROCESSING"
    COMPLETED      = "COMPLETED"
    PARTIAL_SUCCESS = "PARTIAL_SUCCESS"
    FAILED         = "FAILED"


class EvidenceStatus(str, Enum):
    """
    AI assessment of submitted evidence quality and relevance.
    Produced by the Evidence Verification module (future).

    RELEVANT:      Evidence clearly supports the stated problem.
    IRRELEVANT:    Evidence does not relate to the stated problem.
    INSUFFICIENT:  Evidence is too poor quality or too sparse to assess.
    SUSPICIOUS:    Evidence appears inconsistent, duplicated, or manipulated.
    """
    RELEVANT     = "RELEVANT"
    IRRELEVANT   = "IRRELEVANT"
    INSUFFICIENT = "INSUFFICIENT"
    SUSPICIOUS   = "SUSPICIOUS"


class DocumentTypeEnum(str, Enum):
    """
    Standardized classification of uploaded document types.
    """
    PUBLIC_ISSUE_REPORT  = "public_issue_report"
    CITIZEN_COMPLAINT    = "citizen_complaint"
    COMPLAINT_LETTER     = "complaint_letter"
    GOVERNMENT_NOTICE    = "government_notice"
    MEDICAL_REPORT       = "medical_report"
    INCIDENT_REPORT      = "incident_report"
    SUPPORTING_DOCUMENT  = "supporting_document"
    OTHER                = "other"
