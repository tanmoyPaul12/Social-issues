"""
Crawler Infrastructure Package: Safe, high-performance, fault-tolerant academic web crawler.
"""
from .ssrf import is_safe_url, validate_safe_url
from .robots import RobotsManager
from .normalizer import normalize_url, is_valid_academic_link
from .hash import compute_content_hash
from .parser import extract_semantic_content, ParsedPage
from .client import AsyncCrawlerClient
from .storage import CrawlerStorage
from .engine import UniversityCrawlerEngine

__all__ = [
    "is_safe_url",
    "validate_safe_url",
    "RobotsManager",
    "normalize_url",
    "is_valid_academic_link",
    "compute_content_hash",
    "extract_semantic_content",
    "ParsedPage",
    "AsyncCrawlerClient",
    "CrawlerStorage",
    "UniversityCrawlerEngine",
]
