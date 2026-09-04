"""
Category Embeddings: Pre-computed domain taxonomy vector embeddings for zero-shot text classification.
"""
from typing import Dict, List
from app.categorization.category_definitions import OFFICIAL_DOMAINS
from app.models.text.embedding_model import text_embedder

class CategoryEmbeddings:
    """Pre-computes embeddings for domain keywords and titles."""
    def __init__ (self):
        self.domain_vectors: Dict[str, List[float]] = {}
        for key, name in OFFICIAL_DOMAINS.items():
            self.domain_vectors[key] = text_embedder.encode(name)

category_vector_cache = CategoryEmbeddings()
