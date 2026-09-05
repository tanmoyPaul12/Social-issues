"""
Duplicate Checker Engine: Evaluates semantic similarity and spatial distance radius
to identify potential duplicate grassroots challenge submissions.
"""
from app.api.schemas.challenge import ChallengeInput
from app.api.schemas.duplicate import DuplicateResult, DuplicateMatch
from app.models.text.embedding_model import text_embedder
from app.deduplication.similarity import cosine_similarity, haversine_distance_km

def check_for_duplicates(challenge: ChallengeInput) -> DuplicateResult:
    """Detects if an identical or near-duplicate challenge exists within 5km radius."""
    query_vector = text_embedder.encode(f"{challenge.title} {challenge.description}")
    
    # In production, query pgvector for existing ticket embeddings
    # Simulated check result:
    matches = []
    
    return DuplicateResult(
        is_duplicate=len(matches) > 0,
        cluster_id=None,
        potential_duplicates=matches
    )
