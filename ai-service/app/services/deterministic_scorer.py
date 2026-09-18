#!/usr/bin/env python3
"""
Deterministic Institutional Capability Scorer (`app/services/deterministic_scorer.py`).

Implements the 6-Factor Deterministic Institutional Weighting Algorithm:
  Final Score = 0.30 * S_faculty + 0.25 * S_research + 0.15 * S_dept
              + 0.15 * S_facility + 0.10 * S_incubator + 0.05 * S_geo
"""

import logging
from typing import Dict, Any, List
from pydantic import BaseModel, Field
from app.agents.requirement_extractor import ExtractedChallengeRequirements

logger = logging.getLogger(__name__)


class ScoreBreakdown(BaseModel):
    s_faculty: float = Field(description="Faculty expertise match score (30% weight)")
    s_research: float = Field(description="Research projects & publications score (25% weight)")
    s_dept: float = Field(description="Academic department alignment score (15% weight)")
    s_facility: float = Field(description="Laboratory & prototyping facility score (15% weight)")
    s_incubator: float = Field(description="Incubation & startup center score (10% weight)")
    s_geo: float = Field(description="Geographic proximity score (5% weight)")


class UniversityCapabilityScore(BaseModel):
    university_code: str
    university_name: str
    total_score: float
    breakdown: ScoreBreakdown
    matched_faculty_chunks: List[Dict[str, Any]] = Field(default_factory=list)
    matched_evidence_chunks: List[Dict[str, Any]] = Field(default_factory=list)


def score_university_capabilities(
    requirements: ExtractedChallengeRequirements,
    candidate_chunks: List[Dict[str, Any]]
) -> List[UniversityCapabilityScore]:
    """
    Evaluates and ranks candidate universities using deterministic 6-factor weighting.
    """
    if not candidate_chunks:
        logger.warning("No candidate chunks provided to deterministic scorer.")
        return []

    # Group candidate chunks by university code
    uni_chunks: Dict[str, List[Dict[str, Any]]] = {}
    uni_names: Dict[str, str] = {}

    for chunk in candidate_chunks:
        code = chunk.get("university_code", "UNKNOWN")
        uni_chunks.setdefault(code, []).append(chunk)
        if code not in uni_names:
            uni_names[code] = chunk.get("university_name", code)

    scored_universities: List[UniversityCapabilityScore] = []

    for code, chunks in uni_chunks.items():
        name = uni_names[code]

        faculty_scores = [c["similarity_score"] for c in chunks if c.get("entity_type") == "FACULTY"]
        dept_scores = [c["similarity_score"] for c in chunks if c.get("entity_type") == "DEPARTMENT"]
        incubator_scores = [c["similarity_score"] for c in chunks if c.get("entity_type") == "INCUBATION_CENTRE"]
        research_scores = [c["similarity_score"] for c in chunks if c.get("entity_type") in ("RESEARCH_CENTRE", "FACULTY")]
        facility_scores = [c["similarity_score"] for c in chunks if any(k in c.get("chunk_text", "").lower() for k in ["lab", "facility", "testing", "center", "equipment", "prototyping"])]

        # Factor 1: Faculty Score (Max score + bonus for high relevance)
        s_faculty = max(faculty_scores) if faculty_scores else 0.50

        # Factor 2: Research & Projects Score
        s_research = (sum(research_scores[:3]) / len(research_scores[:3])) if research_scores else 0.45

        # Factor 3: Department Alignment Score
        s_dept = max(dept_scores) if dept_scores else 0.50

        # Factor 4: Laboratory / Facility Score
        s_facility = max(facility_scores) if facility_scores else 0.40

        # Factor 5: Incubator Score
        if requirements.incubation_needed:
            s_incubator = max(incubator_scores) if incubator_scores else 0.20
        else:
            s_incubator = max(incubator_scores) if incubator_scores else 0.80

        # Factor 6: Geographic Proximity Score
        # Match district or state
        target_dist = requirements.district.lower()
        if "dhanbad" in target_dist and "ISM" in code:
            s_geo = 1.00
        elif "ranchi" in target_dist and "MESRA" in code:
            s_geo = 1.00
        else:
            s_geo = 0.85  # State level match within Jharkhand

        # Calculate Total Deterministic Weighted Score
        total_score = (
            0.30 * s_faculty +
            0.25 * s_research +
            0.15 * s_dept +
            0.15 * s_facility +
            0.10 * s_incubator +
            0.05 * s_geo
        )

        # Extract top faculty chunks
        matched_faculty = [c for c in chunks if c.get("entity_type") == "FACULTY"]
        matched_faculty.sort(key=lambda x: x["similarity_score"], reverse=True)

        # Extract top institutional evidence chunks
        matched_evidence = [c for c in chunks if c.get("entity_type") != "FACULTY"]
        matched_evidence.sort(key=lambda x: x["similarity_score"], reverse=True)

        scored_universities.append(
            UniversityCapabilityScore(
                university_code=code,
                university_name=name,
                total_score=round(total_score, 4),
                breakdown=ScoreBreakdown(
                    s_faculty=round(s_faculty, 4),
                    s_research=round(s_research, 4),
                    s_dept=round(s_dept, 4),
                    s_facility=round(s_facility, 4),
                    s_incubator=round(s_incubator, 4),
                    s_geo=round(s_geo, 4)
                ),
                matched_faculty_chunks=matched_faculty[:5],
                matched_evidence_chunks=matched_evidence[:5]
            )
        )

    # Sort universities by total score descending
    scored_universities.sort(key=lambda u: u.total_score, reverse=True)
    return scored_universities
