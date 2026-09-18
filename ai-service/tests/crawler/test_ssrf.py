"""
Unit tests for SSRF Protection Module.
"""
import pytest
from app.infrastructure.crawler.ssrf import is_ip_forbidden, is_safe_url, validate_safe_url


def test_forbidden_private_ips():
    """Verify private IPv4 ranges are detected as forbidden."""
    assert is_ip_forbidden("127.0.0.1") is True
    assert is_ip_forbidden("10.0.0.1") is True
    assert is_ip_forbidden("192.168.1.100") is True
    assert is_ip_forbidden("172.16.5.20") is True
    assert is_ip_forbidden("169.254.169.254") is True  # AWS/Cloud metadata
    assert is_ip_forbidden("0.0.0.0") is True
    assert is_ip_forbidden("::1") is True  # IPv6 loopback


def test_public_ips():
    """Verify legitimate public IPs are not marked forbidden."""
    assert is_ip_forbidden("8.8.8.8") is False
    assert is_ip_forbidden("1.1.1.1") is False


def test_unsafe_url_schemes():
    """Verify non-HTTP schemes are rejected."""
    assert is_safe_url("file:///etc/passwd") is False
    assert is_safe_url("ftp://ftp.iitism.ac.in/data") is False
    assert is_safe_url("gopher://127.0.0.1:70") is False
    assert is_safe_url("javascript:alert(1)") is False
    assert is_safe_url("") is False
    assert is_safe_url(None) is False


def test_allowed_domains_whitelisting():
    """Verify URLs only match whitelisted domains or subdomains."""
    allowed = ["iitism.ac.in", "bitmesra.ac.in"]
    
    assert is_safe_url("https://iitism.ac.in/index.php", allowed) is True
    assert is_safe_url("https://cse.iitism.ac.in/faculty", allowed) is True
    assert is_safe_url("https://bitmesra.ac.in/research", allowed) is True
    assert is_safe_url("https://evil.com/attack", allowed) is False
    assert is_safe_url("https://iitism.ac.in.evil.com/hack", allowed) is False


def test_validate_safe_url_raises_on_invalid():
    """Verify validate_safe_url raises ValueError when invalid."""
    with pytest.raises(ValueError):
        validate_safe_url("http://127.0.0.1:8000/internal")

    with pytest.raises(ValueError):
        validate_safe_url("https://unauthorized.org/page", allowed_domains=["iitism.ac.in"])

    safe_url = validate_safe_url("https://iitism.ac.in/about", allowed_domains=["iitism.ac.in"])
    assert safe_url == "https://iitism.ac.in/about"
