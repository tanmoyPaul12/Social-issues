"""
Unit tests for University Crawler Engine with Mocked Storage and Client.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.infrastructure.crawler.engine import UniversityCrawlerEngine


@pytest.mark.asyncio
async def test_crawler_engine_mock_run():
    """Verify crawler engine initializes queue, processes pages, and updates crawl status."""
    engine = UniversityCrawlerEngine("IIT_ISM_DHANBAD")

    # Mock storage
    mock_config = {
        "university_id": "11111111-1111-1111-1111-111111111111",
        "name": "IIT (ISM) Dhanbad",
        "base_url": "https://iitism.ac.in",
        "allowed_domains": ["iitism.ac.in"],
        "max_pages": 5,
        "max_depth": 2,
        "crawl_delay_seconds": 0.0,
        "crawl_status": "PENDING"
    }

    mock_targets = [
        {"url": "https://iitism.ac.in/dept/mining", "target_type": "DEPARTMENT", "priority": 1}
    ]

    mock_html = """
    <html>
    <head><title>Department of Mining Engineering</title></head>
    <body>
        <h1>Mining Engineering Department</h1>
        <p>Advanced research in underground safety and mineral processing.</p>
        <a href="https://iitism.ac.in/dept/mining/faculty">Faculty List</a>
    </body>
    </html>
    """

    with patch.object(engine.storage, "get_university_crawl_config", return_value=mock_config), \
         patch.object(engine.storage, "get_priority_targets", return_value=mock_targets), \
         patch.object(engine.storage, "update_crawl_status") as mock_update_status, \
         patch.object(engine.storage, "save_crawled_page", return_value=("mock-page-id", "NEW")), \
         patch("app.infrastructure.crawler.engine.AsyncCrawlerClient") as mock_client_cls:

        # Configure AsyncCrawlerClient context manager mock
        mock_client_instance = AsyncMock()
        mock_client_instance.fetch.return_value = (200, mock_html, "https://iitism.ac.in/dept/mining", "W/mock-etag")
        mock_client_cls.return_value.__aenter__.return_value = mock_client_instance

        # Run engine with max_pages override of 2
        results = await engine.run(max_pages_override=2)

        assert results["status"] == "COMPLETED"
        assert results["university_code"] == "IIT_ISM_DHANBAD"
        assert results["pages_crawled"] >= 1
        assert results["new_pages"] >= 1
        assert mock_update_status.call_count >= 2
