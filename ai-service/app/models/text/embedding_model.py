"""
Local Fail-Safe Embedding Provider: Uses `intfloat/multilingual-e5-small` (384-d)
via sentence-transformers for zero-crash offline execution.
Includes a deterministic TF-IDF fallback if ML dependencies or memory are restricted.
"""
import hashlib
import logging
from typing import List
import numpy as np

logger = logging.getLogger(__name__)

class LocalE5Embedder:
    """Production local text embedding generator for cross-lingual search (English/Hindi/Hinglish)."""

    def __init__(self, model_name: str = "intfloat/multilingual-e5-small"):
        self.model_name = model_name
        self.dimension = 384
        self._model = None
        self._is_loaded = False
        self._init_model()

    def _init_model(self):
        """Attempts to load sentence-transformers model locally."""
        try:
            from sentence_transformers import SentenceTransformer
            # Load model onto CPU with fallback
            self._model = SentenceTransformer(self.model_name, device="cpu")
            self._is_loaded = True
            logger.info(f"Successfully loaded local embedding model: {self.model_name}")
        except Exception as e:
            logger.warning(
                f"SentenceTransformer load warning ({self.model_name}): {e}. "
                "Switching to deterministic fail-safe feature vector fallback."
            )
            self._is_loaded = False

    def encode(self, text: str, is_query: bool = False) -> List[float]:
        """
        Encodes text into a normalized 384-dimensional dense vector.
        Prefixes 'query: ' or 'passage: ' as required by e5 models.
        """
        if not text or not text.strip():
            return [0.0] * self.dimension

        formatted_text = f"query: {text}" if is_query else f"passage: {text}"

        if self._is_loaded and self._model is not None:
            try:
                embedding = self._model.encode(
                    formatted_text,
                    normalize_embeddings=True,
                    show_progress_bar=False
                )
                return embedding.tolist()
            except Exception as e:
                logger.error(f"Error during SentenceTransformer encode: {e}. Falling back.")

        # Fail-safe deterministic feature vector fallback (guarantees system NEVER crashes)
        return self._fallback_encode(text)

    def _fallback_encode(self, text: str) -> List[float]:
        """
        Deterministic hash-seeded TF-IDF feature encoder.
        Guarantees that similar strings produce close cosine similarity even without heavy models.
        """
        vec = np.zeros(self.dimension, dtype=np.float32)
        words = text.lower().split()
        if not words:
            return vec.tolist()

        for word in words:
            # Generate deterministic index and sign from word hash
            h = int(hashlib.md5(word.encode("utf-8")).hexdigest(), 16)
            idx = h % self.dimension
            sign = 1.0 if (h % 2 == 0) else -1.0
            vec[idx] += sign

        norm = np.linalg.norm(vec)
        return (vec / norm).tolist()


# Global singleton instance
local_e5_embedder = LocalE5Embedder()
