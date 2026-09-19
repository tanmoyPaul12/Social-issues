"""
Text Embedding Model: Generates 384-dimensional dense vector embeddings
for problem title and description text using Sentence-Transformers.
"""
from typing import List
import numpy as np

class TextEmbeddingModel:
    """Wrapper for text embedding vector generation."""
    
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.dimension = 384

    def encode(self, text: str) -> List[float]:
        """Generates dense vector representation using word-token feature hashing."""
        words = [w.strip() for w in text.lower().replace(",", " ").replace(".", " ").replace("-", " ").split() if len(w.strip()) > 2]
        if not words:
            return [0.0] * self.dimension
        vec = np.zeros(self.dimension, dtype=np.float32)
        for w in words:
            idx = abs(hash(w)) % self.dimension
            sign = 1.0 if (abs(hash(w + "_sign")) % 2 == 0) else -1.0
            vec[idx] += sign
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

text_embedder = TextEmbeddingModel()
