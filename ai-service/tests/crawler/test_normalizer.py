"""
Unit tests for URL Normalizer & Academic Link Filter.
"""
from app.infrastructure.crawler.normalizer import normalize_url, is_valid_academic_link


def test_normalize_url_canonicalization():
    """Verify stripping fragments, default ports, trailing slashes, and lowercasing."""
    raw = "HTTPS://IITISM.AC.IN:443/dept/mining/#overview"
    expected = "https://iitism.ac.in/dept/mining"
    assert normalize_url(raw) == expected


def test_normalize_url_tracking_param_removal():
    """Verify tracking parameters are stripped and remaining params are sorted."""
    raw = "https://bitmesra.ac.in/faculty?utm_source=google&b=2&utm_medium=cpc&a=1"
    expected = "https://bitmesra.ac.in/faculty?a=1&b=2"
    assert normalize_url(raw) == expected


def test_is_valid_academic_link_filters_binary_assets():
    """Verify static PDFs, images, archives, and binaries are rejected."""
    allowed = ["iitism.ac.in"]
    assert is_valid_academic_link("https://iitism.ac.in/paper.pdf", allowed) is False
    assert is_valid_academic_link("https://iitism.ac.in/banner.jpg", allowed) is False
    assert is_valid_academic_link("https://iitism.ac.in/bundle.zip", allowed) is False
    assert is_valid_academic_link("https://iitism.ac.in/app.js", allowed) is False


def test_is_valid_academic_link_filters_non_academic_noise():
    """Verify tenders, fee payments, and admissions login links are rejected."""
    allowed = ["iitism.ac.in"]
    assert is_valid_academic_link("https://iitism.ac.in/tender/2026/01", allowed) is False
    assert is_valid_academic_link("https://iitism.ac.in/feepayment/student", allowed) is False
    assert is_valid_academic_link("https://iitism.ac.in/hall-ticket-download", allowed) is False
    assert is_valid_academic_link("https://iitism.ac.in/auth/login", allowed) is False


def test_is_valid_academic_link_accepts_academic_targets():
    """Verify valid academic, research, faculty, and lab pages are accepted."""
    allowed = ["iitism.ac.in", "bitmesra.ac.in"]
    assert is_valid_academic_link("https://iitism.ac.in/department/mining", allowed) is True
    assert is_valid_academic_link("https://bitmesra.ac.in/research/tbi-centre", allowed) is True
    assert is_valid_academic_link("https://iitism.ac.in/faculty/dr-sharma", allowed) is True
