"""
Document Validation Sub-Module.
Validates uploaded document files (PDF/TXT) for structure, size limits, and format integrity.
"""
import logging
from typing import Tuple

log = logging.getLogger(__name__)

MAX_DOCUMENT_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB


def validate_document_bytes(doc_bytes: bytes, filename: str = "document.pdf") -> Tuple[bool, str, str]:
    """
    Validates raw document bytes with lenient rules for rural citizen uploads.
    Returns (is_valid, doc_type, warning_or_error_message).
    """
    if not doc_bytes or len(doc_bytes.strip()) == 0:
        return False, "empty", "Document payload is empty."

    size = len(doc_bytes)
    if size > MAX_DOCUMENT_SIZE_BYTES:
        return False, "oversized", f"Document size ({size / 1024 / 1024:.2f}MB) exceeds max 25MB limit."

    fn_lower = filename.lower()

    # PDF format check
    if doc_bytes.startswith(b"%PDF-") or fn_lower.endswith(".pdf"):
        return True, "pdf", ""

    # Plain text UTF-8 / ASCII / Latin-1 check
    try:
        doc_bytes.decode("utf-8")
        return True, "txt", ""
    except UnicodeDecodeError:
        try:
            doc_bytes.decode("latin-1")
            return True, "txt", "Non-UTF8 text encoding detected, parsed with fallback."
        except Exception:
            pass

    # Lenient Fallback: allow text extraction attempt
    return True, "doc", "Non-standard document file header; performing best-effort text extraction."
