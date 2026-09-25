#!/usr/bin/env python3
"""
Evidence & Explanation Generator Agent (`app/agents/explanation_generator.py`).

Uses Groq API (openai/gpt-oss-120b) to synthesize evidence-backed, transparent,
and explainable university routing recommendations for government nodal officers.
"""

import json
import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from app.core.llm_factory import query_llm_json
from app.agents.requirement_extractor import ExtractedChallengeRequirements
from app.services.deterministic_scorer import UniversityCapabilityScore
from app.agents.faculty_matcher import MatchedFacultyExpert

logger = logging.getLogger(__name__)


class UniversityRoutingRecommendation(BaseModel):
    rank: int
    university_code: str
    university_name: str
    total_capability_score: float
    score_breakdown: Dict[str, float]
    key_strengths: List[str]
    matched_faculty_experts: List[Dict[str, Any]]
    evidence_snippets: List[str]
    incubation_support_status: str


class ExplainableRoutingReport(BaseModel):
    challenge_summary: str
    domain: str
    executive_summary: str
    recommendations: List[UniversityRoutingRecommendation]
    suggested_next_steps: List[str]


SYSTEM_PROMPT = """You are an expert AI Government Nodal Officer Technical Adviser specializing in University Capability Routing & Expert Allocation.

Your task is to analyze the candidate universities, their deterministic 6-factor capability scores, matched faculty experts, and retrieved evidence chunks, and synthesize an executive, evidence-backed, explainable routing recommendation report.

Rules:
1. Base all technical strengths and recommendations strictly on the provided evidence chunks and faculty profiles.
2. Ensure ZERO hallucination — retain verified email addresses, profile URLs, photo URLs, and PDF links.
3. Output ONLY valid JSON matching this schema:
{
  "challenge_summary": "1-2 sentence problem summary",
  "domain": "Domain Name",
  "executive_summary": "2-3 sentence executive policy recommendation for nodal officers",
  "recommendations": [
    {
      "rank": 1,
      "university_code": "CODE",
      "university_name": "Full University Name",
      "total_capability_score": 0.92,
      "score_breakdown": {
        "faculty_weight_30pct": 0.95,
        "research_weight_25pct": 0.90,
        "dept_weight_15pct": 0.88,
        "facility_weight_15pct": 0.85,
        "incubator_weight_10pct": 0.90,
        "geo_weight_5pct": 1.00
      },
      "key_strengths": ["Strength 1", "Strength 2"],
      "matched_faculty_experts": [],
      "evidence_snippets": ["Evidence snippet 1"],
      "incubation_support_status": "Description of incubation/prototyping facility"
    }
  ],
  "suggested_next_steps": ["Step 1", "Step 2"]
}"""


def generate_explainable_routing_report(
    requirements: ExtractedChallengeRequirements,
    scored_universities: List[UniversityCapabilityScore],
    matched_experts_by_uni: Dict[str, List[MatchedFacultyExpert]]
) -> ExplainableRoutingReport:
    """
    Synthesizes an explainable, evidence-backed routing report using openai/gpt-oss-120b.
    """
    # Prepare concise structured context for LLM prompt
    uni_payloads = []
    for rank, uni in enumerate(scored_universities, 1):
        experts = matched_experts_by_uni.get(uni.university_code, [])
        experts_dict = [exp.model_dump() for exp in experts]
        evidence_texts = [c.get("chunk_text", "")[:250] for c in uni.matched_evidence_chunks[:3]]

        uni_payloads.append({
            "rank": rank,
            "university_code": uni.university_code,
            "university_name": uni.university_name,
            "total_score": uni.total_score,
            "breakdown": uni.breakdown.model_dump(),
            "matched_experts": experts_dict,
            "evidence_snippets": evidence_texts
        })

    user_prompt = f"""Synthesize an Explainable University Routing Report for the following challenge:

Problem Domain: {requirements.domain}
Problem Summary: {requirements.problem_summary}
Required Disciplines: {', '.join(requirements.required_disciplines)}
Prototyping Needed: {requirements.prototyping_needed}
Incubation Needed: {requirements.incubation_needed}
District: {requirements.district}

Evaluated University Capabilities Data:
{json.dumps(uni_payloads, indent=2)}
"""

    try:
        raw_dict = query_llm_json(SYSTEM_PROMPT, user_prompt)
        return ExplainableRoutingReport(**raw_dict)
    except Exception as e:
        logger.warning(f"Error in LLM explanation generation, generating programmatic report: {e}")
        # Programmatic robust fallback
        recs = []
        for rank, uni in enumerate(scored_universities, 1):
            experts = [exp.model_dump() for exp in matched_experts_by_uni.get(uni.university_code, [])]
            snippets = [c.get("chunk_text", "")[:200] for c in uni.matched_evidence_chunks[:3]]
            recs.append(
                UniversityRoutingRecommendation(
                    rank=rank,
                    university_code=uni.university_code,
                    university_name=uni.university_name,
                    total_capability_score=uni.total_score,
                    score_breakdown={
                        "faculty_weight_30pct": uni.breakdown.s_faculty,
                        "research_weight_25pct": uni.breakdown.s_research,
                        "dept_weight_15pct": uni.breakdown.s_dept,
                        "facility_weight_15pct": uni.breakdown.s_facility,
                        "incubator_weight_10pct": uni.breakdown.s_incubator,
                        "geo_weight_5pct": uni.breakdown.s_geo
                    },
                    key_strengths=[
                        f"Strong department score of {uni.breakdown.s_dept:.2f}",
                        f"Top faculty match score of {uni.breakdown.s_faculty:.2f}"
                    ],
                    matched_faculty_experts=experts,
                    evidence_snippets=snippets,
                    incubation_support_status="State university R&D facilities and incubation support available."
                )
            )

        primary_name = scored_universities[0].university_name if scored_universities else "State Premier Academic Institutions"
        return ExplainableRoutingReport(
            challenge_summary=requirements.problem_summary,
            domain=requirements.domain,
            executive_summary=f"Based on 6-factor deterministic capability evaluation, {primary_name} is recommended as the primary university partner for this challenge.",
            recommendations=recs,
            suggested_next_steps=[
                "Issue official technical collaboration proposal to top-ranked university.",
                "Schedule technical consultation meeting with matched primary faculty experts."
            ]
        )
