"""
URL Normalizer & Academic Link Filter: Canonicalizes URLs and filters out
irrelevant links (tenders, admissions, exams, static binary assets).
"""
import re
from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode
from typing import Optional, List, Set

# Ignored query parameters that don't change content (tracking, sessions)
TRACKING_PARAMS = {
    "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
    "gclid", "fbclid", "ref", "sessionid", "session_id", "jsessionid", "phpsessid"
}

# Binary and non-HTML static file extensions to skip
STATIC_EXTENSIONS = {
    ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx",
    ".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp", ".ico",
    ".zip", ".tar", ".gz", ".7z", ".rar", ".exe", ".dmg",
    ".mp3", ".mp4", ".avi", ".mov", ".wav",
    ".css", ".js", ".json", ".xml", ".rss"
}

# Exclusion regex patterns for non-academic/irrelevant pages
EXCLUSION_PATTERN = re.compile(
    r".*(tender|fee-structure|feepayment|hall-ticket|admit-card|exam-schedule|"
    r"result|convocation|alumni-donation|sports-meet|anti-ragging|"
    r"login|signup|register|forgot-password|cart|checkout).*",
    re.IGNORECASE
)

# Academic high-value pattern regex
ACADEMIC_PATTERN = re.compile(
    r".*(faculty|department|dept|school|research|centre|center|facility|facilities|"
    r"lab|laboratory|tbi|incubation|innovation|patent|publication|project|kvk).*",
    re.IGNORECASE
)


def normalize_url(url: str) -> str:
    """
    Normalizes a URL to its canonical form:
    1. Lowercase scheme and netloc.
    2. Strip fragment (#...).
    3. Remove tracking query params and sort remaining params.
    4. Remove default ports (80 for http, 443 for https).
    5. Remove trailing slashes for consistency unless root.
    """
    if not url or not isinstance(url, str):
        return ""

    parsed = urlparse(url.strip())
    scheme = parsed.scheme.lower()
    netloc = parsed.netloc.lower()

    # Remove default port
    if scheme == "http" and netloc.endswith(":80"):
        netloc = netloc[:-3]
    elif scheme == "https" and netloc.endswith(":443"):
        netloc = netloc[:-4]

    # Clean path
    path = parsed.path or "/"
    while "//" in path:
        path = path.replace("//", "/")
    if len(path) > 1 and path.endswith("/"):
        path = path[:-1]

    # Filter and sort query params
    filtered_params = [
        (k, v) for k, v in parse_qsl(parsed.query, keep_blank_values=False)
        if k.lower() not in TRACKING_PARAMS
    ]
    filtered_params.sort(key=lambda x: x[0])
    query = urlencode(filtered_params)

    # Reconstruct without fragment
    return urlunparse((scheme, netloc, path, parsed.params, query, ""))


def is_valid_academic_link(url: str, allowed_domains: Optional[List[str]] = None) -> bool:
    """
    Evaluates whether a link is a relevant academic link for the knowledge base:
    1. Uses http/https.
    2. Belongs to allowed_domains.
    3. Is not a binary or static asset.
    4. Does not match noisy exclusion patterns (tenders, admissions, fee payments).
    """
    if not url:
        return False

    normalized = normalize_url(url)
    if not normalized:
        return False

    parsed = urlparse(normalized)
    hostname = (parsed.hostname or "").lower()

    # Check allowed domains
    if allowed_domains:
        if not any(hostname == d or hostname.endswith("." + d) for d in allowed_domains):
            return False

    # Check static extensions
    path = parsed.path.lower()
    if any(path.endswith(ext) for ext in STATIC_EXTENSIONS):
        return False

    # Check exclusion pattern
    if EXCLUSION_PATTERN.search(normalized):
        return False

    return True
