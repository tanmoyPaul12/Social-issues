#!/usr/bin/env python3
"""
Challenge Requirement Extractor Agent (`app/agents/requirement_extractor.py`).

Uses Groq API (openai/gpt-oss-120b) to analyze citizen problem statements and extract
structured academic requirements, subject expertise keywords, research capabilities,
and incubation needs for university matching.
"""

import json
import logging
from typing import Dict, Any, List
from pydantic import BaseModel, Field
from app.core.llm_factory import query_llm_json

logger = logging.getLogger(__name__)


class ExtractedChallengeRequirements(BaseModel):
    domain: str = Field(description="Primary domain of the challenge (e.g., Water Resources, Agriculture, Clean Energy)")
    problem_summary: str = Field(description="Concise 1-2 sentence technical summary")
    required_disciplines: List[str] = Field(description="Academic departments/disciplines needed (e.g. Mechanical Engineering, Civil Engineering)")
    expertise_keywords: List[str] = Field(description="Key technical specialization keywords for semantic search")
    required_capabilities: List[str] = Field(description="Institutional capabilities required (e.g. field testing, water quality testing, prototyping)")
    prototyping_needed: bool = Field(default=False, description="Whether hardware/software prototyping is required")
    incubation_needed: bool = Field(default=False, description="Whether startup incubation or commercialization support is needed")
    district: str = Field(default="Jharkhand", description="District mentioned or relevant geographic region")
    state: str = Field(default="Jharkhand", description="State context")


SYSTEM_PROMPT = """You are an expert AI University Technical Requirement Extractor for the Government Societal Problem Routing Platform.

Your task is to analyze a citizen or government problem statement and extract structured academic, research, and institutional requirements for university matching.

Output ONLY valid JSON matching this schema:
{
  "domain": "Primary domain name",
  "problem_summary": "1-2 sentence technical summary",
  "required_disciplines": ["Discipline 1", "Discipline 2"],
  "expertise_keywords": ["keyword1", "keyword2", "keyword3"],
  "required_capabilities": ["capability1", "capability2"],
  "prototyping_needed": true/false,
  "incubation_needed": true/false,
  "district": "District Name or Unknown",
  "state": "State Name (e.g. Jharkhand)"
}"""


def extract_challenge_requirements(problem_statement: str) -> ExtractedChallengeRequirements:
    """
    Parses a raw citizen/government problem statement into structured requirements using openai/gpt-oss-120b.
    """
    user_prompt = f"Analyze the following problem statement and extract structured requirements:\n\n{problem_statement}"
    try:
        raw_dict = query_llm_json(SYSTEM_PROMPT, user_prompt)
        return ExtractedChallengeRequirements(**raw_dict)
    except Exception as e:
        logger.warning(f"Error in LLM requirement extraction, falling back to heuristic parsing: {e}")
        # Robust heuristic fallback
        return ExtractedChallengeRequirements(
            domain="General Engineering & Science",
            problem_summary=problem_statement[:200],
            required_disciplines=["Mechanical Engineering", "Civil Engineering"],
            expertise_keywords=[w.strip().lower() for w in problem_statement.split() if len(w) > 4][:6],
            required_capabilities=["field research", "prototyping"],
            prototyping_needed=True,
            incubation_needed=False,
            district="Dhanbad",
            state="Jharkhand"
        )
