"""
Text Validator: Performs deterministic text validation on problem title and description.
Checks:
- Empty / Null checks
- Minimum length checks (title >= 5 chars, description >= 20 chars)
- Excessive whitespace normalization
- Script & Language detection (Devanagari vs Latin)
- Spam & meaningless content detection

Returns standardized 3-state validation output: PASS (🟢), FLAG (🟡), or REJECT (🔴).
"""
import re
from typing import Dict, Any

SPAM_KEYWORDS = {"spam", "test12345", "asdfghjk", "qwerty", "fake issue", "lorem ipsum"}

def validate_challenge_text(title: str, description: str) -> Dict[str, Any]:
    """
    Validates submission title and description.
    Returns dictionary with status ('PASS', 'FLAG', 'REJECT'), quality score (0.0 to 1.0), and issues list.
    """
    issues = []
    status = "PASS"
    
    # 1. Null / Empty Check
    if not title or not title.strip():
        return {"status": "REJECT", "quality": 0.0, "issues": ["Title cannot be empty."], "language": "Unknown"}
        
    if not description or not description.strip():
        return {"status": "REJECT", "quality": 0.0, "issues": ["Description cannot be empty."], "language": "Unknown"}

    # 2. Normalize whitespace
    clean_title = re.sub(r"\s+", " ", title.strip())
    clean_desc = re.sub(r"\s+", " ", description.strip())

    # 3. Minimum Length Check
    if len(clean_title) < 5:
        issues.append(f"Title is too short ({len(clean_title)} chars, minimum 5 required).")
        status = "REJECT"
        
    if len(clean_desc) < 20:
        issues.append(f"Description is too brief ({len(clean_desc)} chars, minimum 20 required).")
        status = "REJECT" if status == "REJECT" else "FLAG"

    # 4. Script & Language Detection (Devanagari vs Latin)
    full_text = f"{clean_title} {clean_desc}"
    has_devanagari = any("\u0900" <= char <= "\u097F" for char in full_text)
    detected_lang = "hi" if has_devanagari else "en"

    # 5. Spam / Meaningless Content Check
    lower_text = full_text.lower()
    for kw in SPAM_KEYWORDS:
        if kw in lower_text:
            issues.append(f"Spam or test phrase '{kw}' detected.")
            status = "REJECT"

    # Repetitive character spam (e.g. "aaaaaaa", "11111111")
    if re.search(r"(.)\1{6,}", lower_text):
        issues.append("Repetitive pattern or character spam detected.")
        status = "REJECT"

    # Calculate quality score
    quality = 1.0 if status == "PASS" else 0.5 if status == "FLAG" else 0.0
    
    return {
        "status": status,
        "quality": quality,
        "language": detected_lang,
        "issues": issues,
        "clean_title": clean_title,
        "clean_description": clean_desc
    }
