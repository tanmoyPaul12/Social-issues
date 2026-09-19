"""
Unit tests for Robots.txt & Rate Limiting Module.
"""
import pytest
import time
from unittest.mock import AsyncMock, MagicMock
import httpx
from app.infrastructure.crawler.robots import RobotsManager


@pytest.mark.asyncio
async def test_robots_allow_and_disallow():
    """Verify parsing robots.txt rules correctly allows and disallows paths."""
    manager = RobotsManager(user_agent="SocietalInnovationBot")

    robots_content = """
User-agent: *
Disallow: /admin/
Disallow: /private/
Allow: /
Crawl-delay: 3
    """

    mock_response = MagicMock(spec=httpx.Response)
    mock_response.status_code = 200
    mock_response.text = robots_content

    mock_client = AsyncMock(spec=httpx.AsyncClient)
    mock_client.get.return_value = mock_response

    # Allowed URLs
    allowed = await manager.can_fetch(mock_client, "https://iitism.ac.in/departments/mining")
    assert allowed is True

    # Disallowed URLs
    disallowed = await manager.can_fetch(mock_client, "https://iitism.ac.in/admin/dashboard")
    assert disallowed is False


@pytest.mark.asyncio
async def test_robots_crawl_delay():
    """Verify crawl-delay extraction from robots.txt."""
    manager = RobotsManager(default_delay=2.0, user_agent="SocietalInnovationBot")

    robots_content = """
User-agent: SocietalInnovationBot
Crawl-delay: 5
    """

    mock_response = MagicMock(spec=httpx.Response)
    mock_response.status_code = 200
    mock_response.text = robots_content

    mock_client = AsyncMock(spec=httpx.AsyncClient)
    mock_client.get.return_value = mock_response

    await manager.fetch_and_parse(mock_client, "https://bitmesra.ac.in/test")
    delay = manager.get_crawl_delay("https://bitmesra.ac.in/test")
    assert delay == 5.0


@pytest.mark.asyncio
async def test_robots_throttle():
    """Verify throttle respects delay interval."""
    manager = RobotsManager(default_delay=0.1)  # small delay for fast test
    
    start = time.time()
    await manager.throttle("https://nitjsr.ac.in/page1", override_delay=0.1)
    await manager.throttle("https://nitjsr.ac.in/page2", override_delay=0.1)
    elapsed = time.time() - start
    
    assert elapsed >= 0.08  # Account for slight timing jitter
