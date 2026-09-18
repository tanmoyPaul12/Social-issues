"""
Content Hashing & Change Detection Module: Deterministic SHA-256 computation
for delta change tracking across university crawl runs.
"""
import hashlib
import re


def compute_content_hash(text: str) -> str:
    """
    Computes deterministic SHA-256 hash of cleaned text.
    Normalizes whitespace and lowercase to avoid trivial formatting false-positives.
    """
    if not text:
        return hashlib.sha256(b"").hexdigest()

    # Normalize whitespace
    normalized = re.sub(r"\s+", " ", text).strip().lower()
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()
