"""
Unit tests for Content Hashing and Delta Change Detection.
"""
from app.infrastructure.crawler.hash import compute_content_hash


def test_compute_content_hash_determinism():
    """Verify compute_content_hash produces identical SHA-256 for normalized whitespace."""
    text1 = "Department of   Computer Science and Engineering.\nResearch in AI & ML."
    text2 = "department of computer   science and engineering. Research in AI & ML."
    
    hash1 = compute_content_hash(text1)
    hash2 = compute_content_hash(text2)

    assert len(hash1) == 64  # SHA-256 is 64 hex chars
    assert hash1 == hash2


def test_compute_content_hash_detects_changes():
    """Verify different content produces different hashes."""
    text1 = "Center of Excellence in Agriculture at BAU Ranchi."
    text2 = "Center of Excellence in Renewable Energy at BIT Mesra."

    hash1 = compute_content_hash(text1)
    hash2 = compute_content_hash(text2)

    assert hash1 != hash2


def test_compute_content_hash_empty_string():
    """Verify empty string hashing."""
    hash_empty = compute_content_hash("")
    assert len(hash_empty) == 64
