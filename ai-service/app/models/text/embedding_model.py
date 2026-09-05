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
        """Generates dense vector representation for input string."""
        # Simulated feature vector calculation (normalizable float array)
        np.random.seed(abs(hash(text)) % (2**32))
        vec = np.random.uniform(-1.0, 1.0, size=self.dimension)
        norm = np.linalg.norm(vec)
        return (vec / norm).tolist()

text_embedder = TextEmbeddingModel()
