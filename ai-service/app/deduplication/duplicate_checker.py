"""
Duplicate Checker Engine: Evaluates semantic similarity and spatial distance radius
to identify potential duplicate grassroots challenge submissions.
"""
from typing import List, Dict, Any
from app.api.schemas.challenge import ChallengeInput
from app.api.schemas.duplicate import DuplicateResult, DuplicateMatch
from app.models.text.embedding_model import text_embedder
from app.deduplication.similarity import cosine_similarity, haversine_distance_km

# In-memory registry for dynamic vector and spatial comparison across challenge submissions
_CHALLENGE_REGISTRY: List[Dict[str, Any]] = []

def check_for_duplicates(challenge: ChallengeInput) -> DuplicateResult:
    """Detects if an identical or near-duplicate challenge exists within spatial distance & vector threshold."""
    combined_text = f"{challenge.title} {challenge.description}".strip()
    query_vector = text_embedder.encode(combined_text)
    
    matches: List[DuplicateMatch] = []
    
    for existing in _CHALLENGE_REGISTRY:
        # Don't match against self
        if existing.get("challenge_id") == challenge.challenge_id:
            continue
            
        sim = cosine_similarity(query_vector, existing["vector"])
        dist_km = haversine_distance_km(
            challenge.latitude, challenge.longitude,
            existing["latitude"], existing["longitude"]
        )
        
        # Word overlap check
        title_lower = challenge.title.lower()
        existing_title_lower = existing["title"].lower()
        district_match = (challenge.district.lower() == existing["district"].lower()) if challenge.district and existing.get("district") else False
        
        is_semantic_duplicate = sim >= 0.85
        is_spatial_duplicate = (sim >= 0.65 or title_lower in existing_title_lower or existing_title_lower in title_lower) and dist_km <= 25.0
        
        if is_semantic_duplicate or (district_match and is_spatial_duplicate):
            matches.append(DuplicateMatch(
                issue_number=existing["challenge_id"],
                similarity_score=round(float(sim), 2),
                distance_km=round(float(dist_km), 2)
            ))
            
    # Sort matches by similarity score descending
    matches.sort(key=lambda m: m.similarity_score, reverse=True)
    
    is_duplicate = len(matches) > 0
    cluster_id = f"CLUST-{matches[0].issue_number}" if is_duplicate else None
    
    # Register current challenge in registry
    _CHALLENGE_REGISTRY.append({
        "challenge_id": challenge.challenge_id,
        "title": challenge.title,
        "description": challenge.description,
        "district": challenge.district,
        "latitude": challenge.latitude,
        "longitude": challenge.longitude,
        "vector": query_vector
    })
    
    # Cap registry size to prevent unbounded memory growth
    if len(_CHALLENGE_REGISTRY) > 1000:
        _CHALLENGE_REGISTRY.pop(0)
        
    return DuplicateResult(
        is_duplicate=is_duplicate,
        cluster_id=cluster_id,
        potential_duplicates=matches
    )
