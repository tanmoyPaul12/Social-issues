"""
Hashing Utility: Computes SHA-256 and MD5 hashes for uploaded media files and text.
Used for exact duplicate content detection before running heavy AI ML models.
"""
import hashlib

def compute_text_hash(text: str) -> str:
    """Computes SHA-256 hash for normalized text."""
    normalized = text.strip().lower()
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()

def compute_file_hash(file_bytes: bytes) -> str:
    """Computes MD5 hash for binary file content (images, videos, documents)."""
    return hashlib.md5(file_bytes).hexdigest()
