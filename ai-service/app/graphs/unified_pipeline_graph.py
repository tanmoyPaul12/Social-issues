#!/usr/bin/env python3
"""
Unified Multimodal Intelligence & University Routing Pipeline Graph (`app/graphs/unified_pipeline_graph.py`).

Unifies:
  Phase 1: Multimodal Problem Validation, 10-Domain Categorization, Severity Prioritization & Deduplication
  Phase 2: University Capability Routing, 6-Factor Deterministic Scoring, Faculty Matching & Explainable Policy Report
"""

import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from app.agents.multimodal_validator import validate_and_classify_submission, MultimodalValidationResult
from app.services.deduplication import PriorReport
from app.agents.requirement_extractor import extract_challenge_requirements, ExtractedChallengeRequirements
from app.services.pgvector_retriever import retrieve_candidate_chunks
from app.services.deterministic_scorer import score_university_capabilities, UniversityCapabilityScore
from app.agents.faculty_matcher import match_faculty_experts, MatchedFacultyExpert
from app.agents.explanation_generator import generate_explainable_routing_report, ExplainableRoutingReport

logger = logging.getLogger(__name__)


class UnifiedPipelineInput(BaseModel):
    problem_text: str = Field(..., description="Raw problem text or citizen complaint")
    document_text: Optional[str] = Field(default=None, description="Extracted document text or lab test report")
    image_b64_list: Optional[List[str]] = Field(default=None, description="List of base64-encoded image strings")
    video_path_or_url: Optional[str] = Field(default=None, description="Path or URL to 1-minute video file")
    latitude: Optional[float] = Field(default=None, description="GPS latitude coordinate")
    longitude: Optional[float] = Field(default=None, description="GPS longitude coordinate")
    district: Optional[str] = Field(default="Dhanbad", description="District context")
    state: Optional[str] = Field(default="Jharkhand", description="State context")
    prior_reports: Optional[List[PriorReport]] = Field(default=None, description="List of prior database reports for deduplication")


class UnifiedPipelineOutput(BaseModel):
    success: bool = True
    validation: MultimodalValidationResult
    requirements: ExtractedChallengeRequirements
    scored_universities: List[UniversityCapabilityScore]
    matched_faculty_experts: Dict[str, List[MatchedFacultyExpert]]
    executive_report: ExplainableRoutingReport
    execution_logs: List[str] = []


class UnifiedIntelligencePipeline:
    """
    Stateful Master Pipeline uniting Multimodal Validation & University Capability Routing.
    """

    def __init__(self):
        logger.info("Initializing Master Unified Intelligence Pipeline...")

    def run(self, input_data: UnifiedPipelineInput) -> UnifiedPipelineOutput:
        logs = []

        # Step 1: Multimodal Validation, 10-Domain Categorization, Severity Prioritization & Deduplication
        logger.info("Step 1: Running Multimodal Validation, 10-Domain Categorization & Deduplication...")
        logs.append("Step 1: Running Multimodal Validation, 10-Domain Categorization & Deduplication...")
        
        validation_result = validate_and_classify_submission(
            problem_text=input_data.problem_text,
            document_text=input_data.document_text,
            image_b64_list=input_data.image_b64_list,
            video_path_or_url=input_data.video_path_or_url,
            latitude=input_data.latitude,
            longitude=input_data.longitude,
            prior_reports=input_data.prior_reports
        )
        logs.append(f"Validation Complete: Domain = '{validation_result.domain}', Urgency = {validation_result.urgency_level} ({validation_result.severity_score}/10.0), Is Duplicate = {validation_result.deduplication.is_duplicate}")

        # Step 2: Academic Requirement Extraction
        logger.info("Step 2: Extracting academic requirements using Groq API (openai/gpt-oss-120b)...")
        logs.append("Step 2: Extracting academic requirements using Groq API (openai/gpt-oss-120b)...")
        req = extract_challenge_requirements(input_data.problem_text)
        # Override domain and district with validated parameters
        req.domain = validation_result.domain
        if input_data.district:
            req.district = input_data.district

        # Step 3: PGVector Hybrid Retrieval
        logger.info("Step 3: Querying Supabase PGVector hybrid retrieval engine...")
        logs.append("Step 3: Querying Supabase PGVector hybrid retrieval engine...")
        chunks = retrieve_candidate_chunks(req, top_k=25)
        logs.append(f"Retrieved {len(chunks)} candidate institutional chunks.")

        # Step 4: Deterministic 6-Factor Capability Scoring
        logger.info("Step 4: Calculating 6-factor deterministic capability scores...")
        logs.append("Step 4: Calculating 6-factor deterministic capability scores...")
        scored_unis = score_university_capabilities(req, chunks)
        logs.append(f"Scored {len(scored_unis)} candidate universities.")

        # Step 5: Faculty Expert Matcher with Rich Metadata
        logger.info("Step 5: Reranking matched faculty experts with contact metadata...")
        logs.append("Step 5: Reranking matched faculty experts with contact metadata...")
        matched_experts = match_faculty_experts(req, scored_unis)

        # Step 6: Evidence-Backed Explainable Report Generation
        logger.info("Step 6: Synthesizing evidence-backed explainable policy report...")
        logs.append("Step 6: Synthesizing evidence-backed explainable policy report...")
        report = generate_explainable_routing_report(req, scored_unis, matched_experts)

        return UnifiedPipelineOutput(
            success=True,
            validation=validation_result,
            requirements=req,
            scored_universities=scored_unis,
            matched_faculty_experts=matched_experts,
            executive_report=report,
            execution_logs=logs
        )
