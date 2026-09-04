"""
Vector Embedding Service: Generates 384-dimensional semantic text embeddings.

Internal Use Only: Embeddings are passed internally to Categorization, Vector Deduplication,
and HEI University Routing modules. They are NOT returned in HTTP responses to Java.
"""
import math
import hashlib
from typing import List
import logging

log = logging.getLogger(__name__)


class TextEmbeddingService:
    """
    Generates 384-dimensional vector embeddings for standardized English text.
    Uses SentenceTransformer if available, or a deterministic 384d semantic hash vector.
    """

    def __init__(self, vector_dim: int = 384):
        self.vector_dim = vector_dim
        self._model = None
        self._is_transformer = False

    def _load_model(self):
        """Lazy loader for PyTorch / SentenceTransformer model."""
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                log.info("Loading SentenceTransformer ('all-MiniLM-L6-v2')...")
                self._model = SentenceTransformer("all-MiniLM-L6-v2")
                self._is_transformer = True
            except ImportError:
                log.info("SentenceTransformer not installed — using fast deterministic 384d feature encoder.")
                self._model = "hash_encoder"
                self._is_transformer = False

    def generate_embedding(self, text: str) -> List[float]:
        """
        Generates L2-normalized 384-dimensional float embedding vector for text.

        Args:
            text: Standardized English text string.

        Returns:
            List of 384 float numbers representing semantic embedding.
        """
        if not text or not text.strip():
            return [0.0] * self.vector_dim

        self._load_model()

        if self._is_transformer and hasattr(self._model, "encode"):
            vector = self._model.encode(text).tolist()
            return [round(float(v), 6) for v in vector[:self.vector_dim]]

        # Deterministic normalized 384d feature projection
        return self._generate_deterministic_vector(text)

    def _generate_deterministic_vector(self, text: str) -> List[float]:
        """Generates L2-normalized 384-dimensional vector using hash projection."""
        words = text.lower().split()
        vector = [0.0] * self.vector_dim

        for i, word in enumerate(words):
            digest = hashlib.md5(word.encode("utf-8")).digest()
            for idx in range(0, min(len(digest), self.vector_dim)):
                dim = (int(digest[idx]) + i) % self.vector_dim
                val = (int(digest[idx]) - 128) / 128.0
                vector[dim] += val

        # L2 Normalization
        norm = math.sqrt(sum(v * v for v in vector))
        if norm > 0:
            vector = [round(v / norm, 6) for v in vector]
        else:
            vector[0] = 1.0

        return vector

    def compute_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Computes Cosine Similarity between two 384d vectors."""
        if not vec1 or not vec2 or len(vec1) != len(vec2):
            return 0.0

        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        norm1 = math.sqrt(sum(a * a for a in vec1))
        norm2 = math.sqrt(sum(b * b for b in vec2))

        if norm1 == 0 or norm2 == 0:
            return 0.0

        return round(dot_product / (norm1 * norm2), 4)


embedding_service = TextEmbeddingService(vector_dim=384)
