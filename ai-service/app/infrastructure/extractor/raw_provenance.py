"""
Raw Knowledge Base Provenance Module.
Builds immutable provenance headers containing SHA-256 hashes, source URLs, timestamps,
and parser/extractor version tokens for auditability.
"""
import hashlib
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

class RawProvenance(BaseModel):
    university_id: str
    source_url: Optional[str] = None
    source_title: Optional[str] = None
    source_type: str = Field(default="markdown", description="markdown | html | pdf")
    crawl_path: str
    content_hash: str
    crawled_at: str
    parser_version: str = Field(default="1.0.0")
    extraction_version: str = Field(default="1.0.0")

def compute_content_hash(text_content: str) -> str:
    """Computes deterministic SHA-256 hash of raw page content."""
    clean_str = text_content.strip().encode("utf-8")
    return f"sha256:{hashlib.sha256(clean_str).hexdigest()}"

def build_provenance_header(
    university_id: str,
    crawl_path: str,
    raw_content: str,
    source_url: Optional[str] = None,
    source_title: Optional[str] = None,
    source_type: str = "markdown"
) -> RawProvenance:
    """Constructs a validated RawProvenance instance for a crawled page."""
    c_hash = compute_content_hash(raw_content)
    now_iso = datetime.now(timezone.utc).isoformat()
    return RawProvenance(
        university_id=university_id,
        source_url=source_url or "",
        source_title=source_title or "",
        source_type=source_type,
        crawl_path=crawl_path,
        content_hash=c_hash,
        crawled_at=now_iso,
        parser_version="1.0.0",
        extraction_version="1.0.0"
    )
