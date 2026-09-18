#!/usr/bin/env python3
"""
FastAPI Router for University Capability Intelligence & Routing (`app/api/university_routing.py`).

Exposes REST API endpoints for multi-agent university capability routing, requirement extraction,
deterministic 6-factor capability scoring, faculty matching, and explainable report generation.
"""

import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.graphs.university_routing_graph import UniversityRoutingPipeline

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/university-routing",
    tags=["University Routing Engine"]
)

# Global pipeline instance
_pipeline = UniversityRoutingPipeline()


class UniversityRoutingRequest(BaseModel):
    problem_statement: str = Field(
        ...,
        description="Detailed societal problem statement or citizen challenge description",
        example="High arsenic, fluoride, and heavy metal contamination in rural drinking water in Dhanbad district. Need low-cost sustainable filtration technology, water quality testing lab facilities, prototyping, and community field deployment research team."
    )
    district: Optional[str] = Field(default="Dhanbad", description="Target district context")
    state: Optional[str] = Field(default="Jharkhand", description="Target state context")


class UniversityRoutingResponse(BaseModel):
    success: bool = True
    problem_statement: str
    requirements: Dict[str, Any]
    scored_universities: List[Dict[str, Any]]
    matched_faculty_experts: Dict[str, List[Dict[str, Any]]]
    executive_report: Dict[str, Any]
    execution_logs: List[str]


@router.post("/route", response_model=UniversityRoutingResponse, status_code=status.HTTP_200_OK)
async def route_university_capabilities(request: UniversityRoutingRequest):
    """
    Executes the End-to-End University Capability Intelligence & Routing Pipeline:
      1. Requirement Extraction Agent (openai/gpt-oss-120b)
      2. Supabase PGVector Hybrid Retrieval
      3. Deterministic 6-Factor Capability Scoring
      4. Rich Faculty Expert Contact Card Reranking
      5. Evidence-Backed Explainable Report Generation
    """
    try:
        logger.info(f"Received University Routing API request for problem statement length {len(request.problem_statement)}")
        
        # Execute pipeline
        state = _pipeline.run(request.problem_statement)

        requirements_dict = state.requirements.model_dump() if state.requirements else {}
        scored_unis_dict = [uni.model_dump() for uni in state.scored_universities]
        matched_experts_dict = {
            uni_code: [exp.model_dump() for exp in experts]
            for uni_code, experts in state.matched_experts.items()
        }
        report_dict = state.routing_report.model_dump() if state.routing_report else {}

        return UniversityRoutingResponse(
            success=True,
            problem_statement=request.problem_statement,
            requirements=requirements_dict,
            scored_universities=scored_unis_dict,
            matched_faculty_experts=matched_experts_dict,
            executive_report=report_dict,
            execution_logs=state.execution_logs
        )

    except Exception as e:
        logger.error(f"Error executing University Routing API: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"University routing execution failed: {str(e)}"
        )


@router.get("/health", status_code=status.HTTP_200_OK)
async def university_routing_health():
    """Health check endpoint for University Routing Engine service."""
    return {
        "status": "healthy",
        "service": "University Capability Intelligence & Routing Engine",
        "llm_provider": "Groq API (openai/gpt-oss-120b)",
        "vector_db": "Supabase PGVector (multilingual-e5-small)"
    }
