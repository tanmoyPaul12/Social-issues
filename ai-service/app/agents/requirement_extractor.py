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
    Parses a raw citizen/government problem statement into structured requirements using openai/gpt-oss-120b or dynamic NLP analysis.
    """
    user_prompt = f"Analyze the following problem statement and extract structured requirements:\n\n{problem_statement}"
    try:
        raw_dict = query_llm_json(SYSTEM_PROMPT, user_prompt)
        return ExtractedChallengeRequirements(**raw_dict)
    except Exception as e:
        logger.warning(f"Error in LLM requirement extraction, applying dynamic NLP extraction: {e}")
        
        text_lower = (problem_statement or "").lower()
        words = [w.strip(" ,.-;:!?") for w in text_lower.split() if len(w.strip(" ,.-;:!?")) > 2]
        
        # 1. Detect known Jharkhand districts
        jharkhand_districts = [
            "ranchi", "dhanbad", "deoghar", "bokaro", "jamshedpur", "east singhbhum", "west singhbhum",
            "hazaribagh", "dumka", "giridih", "ramgarh", "palamu", "chatra", "godda", "gumla",
            "khunti", "koderma", "latehar", "lohardaga", "pakur", "sahibganj", "seraikela", "simdega", "jamtara"
        ]
        matched_district = "Jharkhand"
        for dist in jharkhand_districts:
            if dist in text_lower:
                matched_district = dist.title()
                break

        # 2. Dynamic Domain & Discipline Classification
        if any(w in text_lower for w in ["crop", "farm", "paddy", "soil", "harvest", "drought", "agri", "seed", "fertilizer", "pest", "irrigation"]):
            domain = "Agriculture & Agro-Tech"
            disciplines = ["Agronomy", "Soil Science", "Plant Pathology"]
            capabilities = ["Soil testing", "Agri-biotech diagnostics", "Field trials"]
        elif any(w in text_lower for w in ["water", "fluorid", "arsenic", "well", "drinking", "drain", "sewage", "contaminat", "hydro", "flood"]):
            domain = "Water Resources & Hydrogeology"
            disciplines = ["Environmental Science", "Hydrogeology", "Public Health"]
            capabilities = ["Water quality spectrophotometry", "Arsenic nanofiltration", "Hydrological modeling"]
        elif any(w in text_lower for w in ["road", "pothole", "highway", "bridge", "asphalt", "bitumin", "traffic", "pavement", "nh-"]):
            domain = "Transportation & Pavement Engineering"
            disciplines = ["Civil Engineering", "Transportation Engineering"]
            capabilities = ["Marshall stability testing", "Pavement friction profiling", "Aggregate crushing analysis"]
        elif any(w in text_lower for w in ["health", "hospital", "clinic", "disease", "epidemic", "fever", "diarrhea", "morbidity", "telemedicine"]):
            domain = "Healthcare & Biomedical Sciences"
            disciplines = ["Community Medicine", "Public Health", "Microbiology"]
            capabilities = ["Pathogen culture", "Clinical diagnostic trials", "Epidemiological surveillance"]
        elif any(w in text_lower for w in ["mine", "mining", "coal", "subsidence", "quarry", "geology", "blasting", "seam"]):
            domain = "Mining Safety & Applied Geology"
            disciplines = ["Mining Engineering", "Applied Geology", "Rock Mechanics"]
            capabilities = ["Subsidence laser mapping", "Mine safety audits", "Slope stability analysis"]
        elif any(w in text_lower for w in ["solar", "energy", "power", "grid", "electricity", "transformer", "microgrid", "inverter"]):
            domain = "Clean Energy & Power Systems"
            disciplines = ["Electrical Engineering", "Renewable Energy"]
            capabilities = ["Smart grid simulation", "Solar inverter diagnostics", "Power reliability auditing"]
        elif any(w in text_lower for w in ["slag", "metallurg", "steel", "furnace", "alloy", "iron", "casting"]):
            domain = "Metallurgy & Materials Science"
            disciplines = ["Metallurgical and Materials Engineering", "Mechanical Engineering"]
            capabilities = ["Slag utilization testing", "Material tensile testing", "Foundry prototyping"]
        elif any(w in text_lower for w in ["waste", "plastic", "garbage", "dump", "recycl", "effluent", "landfill"]):
            domain = "Waste Management & Circular Economy"
            disciplines = ["Environmental Engineering", "Chemical Engineering"]
            capabilities = ["Solid waste characterization", "Effluent digestion", "Circular material conversion"]
        else:
            # Check if text is gibberish (high consonant density, no vowels, or very short unknown chars)
            domain = "Unclassified / Citizen Request"
            disciplines = []
            capabilities = []

        # Meaningful search keywords
        stop_words = {"this", "that", "with", "from", "have", "were", "problem", "issue", "please", "help", "very", "area"}
        keywords = [w for w in words if w not in stop_words and len(w) > 3][:8]

        return ExtractedChallengeRequirements(
            domain=domain,
            problem_summary=problem_statement[:200],
            required_disciplines=disciplines,
            expertise_keywords=keywords,
            required_capabilities=capabilities,
            prototyping_needed=bool(disciplines),
            incubation_needed=False,
            district=matched_district,
            state="Jharkhand"
        )
