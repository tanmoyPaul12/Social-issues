"""
University Embeddings: Pre-computed vector representations of HEI lab capabilities.
"""
from typing import Dict, List
from app.routing.university_profile import JHARKHAND_HEIS
from app.models.text.embedding_model import text_embedder

class UniversityEmbeddingsCache:
    """Pre-computes vector representations of HEI capabilities."""
    def __init__(self):
        self.hei_vectors: Dict[str, List[float]] = {}
        for hei in JHARKHAND_HEIS:
            desc = f"{hei['name']} {' '.join(hei['domains'])}"
            self.hei_vectors[hei["hei_id"]] = text_embedder.encode(desc)

hei_vector_cache = UniversityEmbeddingsCache()
