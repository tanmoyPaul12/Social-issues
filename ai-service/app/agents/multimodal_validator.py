#!/usr/bin/env python3
"""
Multimodal Problem Validator & Societal Domain Classifier Agent (`app/agents/multimodal_validator.py`).

Validates citizen submissions (text, documents, photographs, 1-minute video keyframes),
categorizes them across 10 Core Societal Domains, evaluates severity/urgency, and checks authenticity.
"""

import json
import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from app.core.nvidia_client import query_multimodal_llm, extract_video_keyframes
from app.services.deduplication import check_submission_deduplication, PriorReport, DeduplicationResult

logger = logging.getLogger(__name__)

SOCIETAL_DOMAINS = [
    "Agriculture & Farming Innovation",
    "Water Resources & Sanitation",
    "Environment, Forestry & Climate Action",
    "Healthcare & Public Health Infrastructure",
    "Energy, Solar & Clean Energy",
    "Urban Development & Smart Infrastructure",
    "Accessibility & Disability Welfare",
    "Public Administration & Citizen Services",
    "Education & Technical Skill Development",
    "Rural Livelihood & Economic Development"
]


class MultimodalValidationResult(BaseModel):
    is_valid: bool = Field(description="Whether the submission is authentic and technically valid")
    authenticity_score: float = Field(description="Authenticity confidence score (0.0 to 1.0)")
    domain: str = Field(description="One of the 10 Core Societal Domains")
    urgency_level: str = Field(description="HIGH, MEDIUM, or LOW")
    severity_score: float = Field(description="Numerical severity priority score from 1.0 to 10.0")
    detected_issues: List[str] = Field(description="Key technical issues identified from text/images/video")
    multimodal_evidence_summary: str = Field(description="Summary of visual and textual evidence analyzed")
    deduplication: DeduplicationResult = Field(description="Deduplication check status")


SYSTEM_PROMPT = """You are an expert AI Societal Problem Multimodal Validator & Classifier for the Government Public Issue Platform.

Your task is to analyze problem statements, documents, photographs, and video keyframes submitted by citizens or officials.

You MUST:
1. Verify if the submission describes a genuine societal/infrastructure/environmental problem (is_valid: true/false).
2. Categorize the issue into EXACTLY ONE of these 10 Core Societal Domains:
   - "Agriculture & Farming Innovation"
   - "Water Resources & Sanitation"
   - "Environment, Forestry & Climate Action"
   - "Healthcare & Public Health Infrastructure"
   - "Energy, Solar & Clean Energy"
   - "Urban Development & Smart Infrastructure"
   - "Accessibility & Disability Welfare"
   - "Public Administration & Citizen Services"
   - "Education & Technical Skill Development"
   - "Rural Livelihood & Economic Development"
3. Assign urgency_level ("HIGH", "MEDIUM", or "LOW") and severity_score (1.0 to 10.0). High urgency is for public health hazards, contaminated water, electrical hazards, or crop failures.
4. Output ONLY valid JSON matching this schema:
{
  "is_valid": true,
  "authenticity_score": 0.95,
  "domain": "Water Resources & Sanitation",
  "urgency_level": "HIGH",
  "severity_score": 9.2,
  "detected_issues": ["arsenic contamination", "lack of filtration", "public health hazard"],
  "multimodal_evidence_summary": "1-2 sentence visual and technical summary of the problem"
}"""


def validate_and_classify_submission(
    problem_text: str,
    document_text: Optional[str] = None,
    image_b64_list: Optional[List[str]] = None,
    video_path_or_url: Optional[str] = None,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    prior_reports: Optional[List[PriorReport]] = None
) -> MultimodalValidationResult:
    """
    Validates, categorizes across 10 domains, prioritizes severity, and deduplicates a citizen submission.
    """
    # Step 1: Extract 1-minute video keyframes if video is provided
    combined_images = list(image_b64_list or [])
    if video_path_or_url:
        logger.info(f"Extracting keyframes from 1-minute video: {video_path_or_url}")
        video_frames = extract_video_keyframes(video_path_or_url, max_frames=5)
        combined_images.extend(video_frames)

    # Step 2: Combine text and document content
    full_prompt_text = f"Problem Statement:\n{problem_text}"
    if document_text:
        full_prompt_text += f"\n\nAttached Document Content:\n{document_text[:1500]}"
    if latitude and longitude:
        full_prompt_text += f"\n\nLocation GPS Coordinates: Lat {latitude}, Lon {longitude}"

    # Step 3: Execute Multimodal LLM Query
    try:
        raw_json_str = query_multimodal_llm(
            SYSTEM_PROMPT,
            f"Analyze and classify this societal problem submission:\n\n{full_prompt_text}",
            image_b64_list=combined_images if combined_images else None,
            json_mode=True
        )
        parsed = json.loads(raw_json_str)
    except Exception as e:
        logger.warning(f"Multimodal vision parsing error, applying robust heuristic fallback: {e}")
        # Rule-based fallback domain detection
        text_lower = problem_text.lower()
        matched_domain = "Public Administration & Citizen Services"
        if any(w in text_lower for w in ["water", "arsenic", "fluoride", "drinking", "pipe", "well", "drainage"]):
            matched_domain = "Water Resources & Sanitation"
        elif any(w in text_lower for w in ["crop", "farm", "fertilizer", "soil", "agriculture", "pest"]):
            matched_domain = "Agriculture & Farming Innovation"
        elif any(w in text_lower for w in ["health", "hospital", "disease", "patient", "medical", "clinic"]):
            matched_domain = "Healthcare & Public Health Infrastructure"
        elif any(w in text_lower for w in ["solar", "power", "energy", "electricity", "grid"]):
            matched_domain = "Energy, Solar & Clean Energy"
        elif any(w in text_lower for w in ["pollution", "forest", "tree", "waste", "garbage", "environment", "climate"]):
            matched_domain = "Environment, Forestry & Climate Action"
        elif any(w in text_lower for w in ["road", "bridge", "urban", "traffic", "building", "smart city"]):
            matched_domain = "Urban Development & Smart Infrastructure"

        parsed = {
            "is_valid": True,
            "authenticity_score": 0.90,
            "domain": matched_domain,
            "urgency_level": "HIGH" if any(w in text_lower for w in ["contamination", "hazard", "emergency", "severe", "death", "poison"]) else "MEDIUM",
            "severity_score": 8.5 if "contamination" in text_lower else 6.5,
            "detected_issues": [w for w in text_lower.split() if len(w) > 5][:4],
            "multimodal_evidence_summary": problem_text[:200]
        }

    # Ensure domain is valid
    if parsed.get("domain") not in SOCIETAL_DOMAINS:
        parsed["domain"] = "Water Resources & Sanitation" if "water" in problem_text.lower() else "Public Administration & Citizen Services"

    # Step 4: Run Deduplication Check
    dedup_result = check_submission_deduplication(
        current_problem_text=problem_text,
        current_lat=latitude,
        current_lon=longitude,
        prior_reports=prior_reports
    )

    return MultimodalValidationResult(
        is_valid=parsed.get("is_valid", True),
        authenticity_score=float(parsed.get("authenticity_score", 0.90)),
        domain=parsed.get("domain"),
        urgency_level=parsed.get("urgency_level", "MEDIUM"),
        severity_score=float(parsed.get("severity_score", 7.0)),
        detected_issues=parsed.get("detected_issues", []),
        multimodal_evidence_summary=parsed.get("multimodal_evidence_summary", problem_text[:150]),
        deduplication=dedup_result
    )
