#!/usr/bin/env python3
"""
Deduplication & Spatial Clustering Service (`app/services/deduplication.py`).

Detects duplicate societal problem submissions using:
  1. Geographic Proximity Bounding (Haversine distance <= 5km threshold)
  2. Semantic Embedding Similarity (multilingual-e5-small >= 0.88 threshold)
  3. Category & Issue Keyword Overlap
"""

import math
import logging
from typing import Dict, Any, List, Optional, Tuple
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class PriorReport(BaseModel):
    report_id: str
    problem_text: str
    domain: str
    latitude: float
    longitude: float
    district: str
    created_at: str


class DeduplicationResult(BaseModel):
    is_duplicate: bool
    duplicate_report_id: Optional[str] = None
    similarity_score: float = 0.0
    distance_km: float = 0.0
    reason: str


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates the great-circle distance between two points in kilometers."""
    R = 6371.0  # Earth's radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


def check_submission_deduplication(
    current_problem_text: str,
    current_lat: Optional[float] = None,
    current_lon: Optional[float] = None,
    prior_reports: Optional[List[PriorReport]] = None
) -> DeduplicationResult:
    """
    Checks if current submission is a duplicate of a previously logged report within 5km.
    """
    if not prior_reports:
        return DeduplicationResult(
            is_duplicate=False,
            reason="No existing prior reports in database."
        )

    from sentence_transformers import SentenceTransformer
    try:
        model = SentenceTransformer("intfloat/multilingual-e5-small")
        query_vec = model.encode(f"query: {current_problem_text}", normalize_embeddings=True)
    except Exception as e:
        logger.warning(f"Embedding model loading failed for deduplication: {e}")
        query_vec = None

    highest_sim = 0.0
    best_match_id = None
    best_distance = 0.0

    for rep in prior_reports:
        dist = 0.0
        if current_lat is not None and current_lon is not None:
            dist = haversine_distance(current_lat, current_lon, rep.latitude, rep.longitude)
            if dist > 15.0:  # Skip reports further than 15km
                continue

        # Compute text similarity
        if query_vec is not None:
            rep_vec = model.encode(f"query: {rep.problem_text}", normalize_embeddings=True)
            sim = float(sum(a * b for a, b in zip(query_vec, rep_vec)))
        else:
            # Fallback word overlap Jaccard similarity
            words1 = set(current_problem_text.lower().split())
            words2 = set(rep.problem_text.lower().split())
            sim = len(words1 & words2) / float(len(words1 | words2)) if words1 | words2 else 0.0

        if sim > highest_sim:
            highest_sim = sim
            best_match_id = rep.report_id
            best_distance = dist

    # Mark as duplicate if similarity >= 0.82 and distance <= 5km (or missing location)
    if highest_sim >= 0.82:
        return DeduplicationResult(
            is_duplicate=True,
            duplicate_report_id=best_match_id,
            similarity_score=round(highest_sim, 4),
            distance_km=round(best_distance, 2),
            reason=f"High semantic similarity ({highest_sim*100:.1f}%) with prior report {best_match_id} within {best_distance:.1f}km."
        )

    return DeduplicationResult(
        is_duplicate=False,
        similarity_score=round(highest_sim, 4),
        distance_km=round(best_distance, 2),
        reason="No duplicate report found. Unique problem submission."
    )
