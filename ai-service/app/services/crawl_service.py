"""
Crawl Service: High-level business logic for triggering and managing university crawls.
"""
from typing import Dict, Any, List, Optional
from app.infrastructure.crawler.engine import UniversityCrawlerEngine
from app.infrastructure.crawler.storage import CrawlerStorage
from app.infrastructure.database.client import get_db_cursor
from app.utils.logger import logger


class CrawlService:
    """Service layer managing crawler workflows and status queries."""

    @staticmethod
    async def trigger_university_crawl(university_code: str, max_pages: Optional[int] = None) -> Dict[str, Any]:
        """Triggers crawling for a specific university."""
        engine = UniversityCrawlerEngine(university_code)
        return await engine.run(max_pages_override=max_pages)

    @staticmethod
    def list_crawl_configurations() -> List[Dict[str, Any]]:
        """Returns all configured universities and their crawl metadata."""
        with get_db_cursor(commit=False, dict_cursor=True) as cur:
            cur.execute("""
                SELECT 
                    u.code,
                    u.name,
                    u.district,
                    u.website,
                    cc.base_url,
                    cc.allowed_domains,
                    cc.max_pages,
                    cc.crawl_delay_seconds,
                    cc.status,
                    cc.last_crawled_at,
                    (SELECT COUNT(*) FROM crawled_pages cp WHERE cp.university_id = u.id) AS total_pages_crawled
                FROM universities u
                JOIN crawl_configurations cc ON cc.university_id = u.id
                ORDER BY u.name ASC;
            """)
            return cur.fetchall()

    @staticmethod
    def get_university_crawl_metrics(university_code: str) -> Dict[str, Any]:
        """Returns detailed metrics for a university crawl status."""
        config = CrawlerStorage.get_university_crawl_config(university_code)
        if not config:
            return {"error": f"University '{university_code}' not found"}

        uni_id = str(config["university_id"])
        summary = CrawlerStorage.get_crawled_pages_summary(uni_id)
        return {
            "university_code": university_code,
            "name": config["name"],
            "base_url": config["base_url"],
            "status": config["crawl_status"],
            "last_crawled_at": config.get("last_crawled_at"),
            "summary": summary
        }
