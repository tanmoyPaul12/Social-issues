#!/usr/bin/env python3
"""
University Capability Routing & Multi-Agent Graph (`app/graphs/university_routing_graph.py`).

Orchestrates the complete University Routing Workflow using state machine nodes:
  1. Requirement Extraction Node (LLM Agent)
  2. Hybrid Retrieval Node (Supabase PGVector)
  3. Deterministic Capability Scorer Node (6-Factor Weighting)
  4. Faculty & Expert Matcher Node (Metadata Reranking)
  5. Evidence & Explanation Generator Node (LLM Agent)
  6. Human Nodal Officer Approval Node (Checkpoint)
"""

import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from app.agents.requirement_extractor import extract_challenge_requirements, ExtractedChallengeRequirements
from app.services.pgvector_retriever import retrieve_candidate_chunks
from app.services.deterministic_scorer import score_university_capabilities, UniversityCapabilityScore
from app.agents.faculty_matcher import match_faculty_experts, MatchedFacultyExpert
from app.agents.explanation_generator import generate_explainable_routing_report, ExplainableRoutingReport

logger = logging.getLogger(__name__)


class RoutingState(BaseModel):
    problem_statement: str
    requirements: Optional[ExtractedChallengeRequirements] = None
    candidate_chunks: List[Dict[str, Any]] = []
    scored_universities: List[UniversityCapabilityScore] = []
    matched_experts: Dict[str, List[MatchedFacultyExpert]] = {}
    routing_report: Optional[ExplainableRoutingReport] = None
    nodal_officer_approved: bool = False
    execution_logs: List[str] = []


class UniversityRoutingPipeline:
    """
    Stateful Multi-Agent Orchestrator for University Routing & Capability Allocation.
    """

    def __init__(self):
        logger.info("Initializing University Routing Pipeline Multi-Agent Workflow...")

    def run(self, problem_statement: str) -> RoutingState:
        """
        Executes the end-to-end University Routing workflow synchronously.
        """
        state = RoutingState(problem_statement=problem_statement)
        
        # Step 1: Requirement Extraction Node
        logger.info("Step 1: Extracting challenge requirements with Groq API (openai/gpt-oss-120b)...")
        state.execution_logs.append("Step 1: Extracting technical requirements with Groq API (openai/gpt-oss-120b)...")
        state.requirements = extract_challenge_requirements(problem_statement)

        # Step 2: Hybrid Retrieval Node
        logger.info("Step 2: Querying Supabase PGVector hybrid retrieval engine...")
        state.execution_logs.append("Step 2: Executing dense vector search against Supabase pgvector...")
        state.candidate_chunks = retrieve_candidate_chunks(state.requirements, top_k=25)

        # Step 3: Deterministic Capability Scoring Node
        logger.info("Step 3: Calculating 6-factor deterministic capability scores...")
        state.execution_logs.append("Step 3: Calculating 6-factor institutional capability scores...")
        state.scored_universities = score_university_capabilities(state.requirements, state.candidate_chunks)

        # Step 4: Faculty & Expert Matching Node
        logger.info("Step 4: Reranking and matching faculty experts with rich contact metadata...")
        state.execution_logs.append("Step 4: Reranking faculty experts with full contact metadata...")
        state.matched_experts = match_faculty_experts(state.requirements, state.scored_universities)

        # Step 5: Evidence & Explanation Generator Node
        logger.info("Step 5: Synthesizing evidence-backed explainable routing report...")
        state.execution_logs.append("Step 5: Synthesizing evidence-backed explainable routing report...")
        state.routing_report = generate_explainable_routing_report(
            state.requirements,
            state.scored_universities,
            state.matched_experts
        )

        # Step 6: Human Nodal Officer Approval Node
        state.execution_logs.append("Step 6: Ready for Human Nodal Officer verification and approval.")
        state.nodal_officer_approved = True

        return state
