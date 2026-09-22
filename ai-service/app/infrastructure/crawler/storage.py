"""
Crawler Storage Module: Manages database interactions for crawled pages,
change detection persistence, and crawl job status updates.
"""
from typing import Dict, Any, List, Optional, Tuple
from app.infrastructure.database.client import get_db_cursor
from app.utils.logger import logger


class CrawlerStorage:
    """Handles PostgreSQL persistence for crawled pages and configuration metadata."""

    @staticmethod
    def get_university_crawl_config(university_code: str) -> Optional[Dict[str, Any]]:
        """Fetches university and its crawl configuration by university code."""
        with get_db_cursor(commit=False, dict_cursor=True) as cur:
            cur.execute("""
                SELECT 
                    u.id AS university_id,
                    u.code,
                    u.name,
                    u.website,
                    cc.id AS config_id,
                    cc.base_url,
                    cc.allowed_domains,
                    cc.max_depth,
                    cc.crawl_delay_seconds,
                    cc.max_pages,
                    cc.sitemap_url,
                    cc.status AS crawl_status
                FROM universities u
                LEFT JOIN crawl_configurations cc ON cc.university_id = u.id
                WHERE u.code = %s;
            """, (university_code,))
            return cur.fetchone()

    @staticmethod
    def get_priority_targets(university_id: str) -> List[Dict[str, Any]]:
        """Fetches active priority targets for a university ordered by priority desc."""
        with get_db_cursor(commit=False, dict_cursor=True) as cur:
            cur.execute("""
                SELECT id, url, target_type, priority
                FROM crawl_targets
                WHERE university_id = %s AND is_active = TRUE
                ORDER BY priority DESC;
            """, (university_id,))
            return cur.fetchall()

    @staticmethod
    def update_crawl_status(university_id: str, status: str):
        """Updates crawl_configurations status and timestamp."""
        with get_db_cursor(commit=True, dict_cursor=True) as cur:
            cur.execute("""
                UPDATE crawl_configurations
                SET status = %s, last_crawled_at = NOW(), updated_at = NOW()
                WHERE university_id = %s;
            """, (status, university_id))

    @staticmethod
    def save_crawled_page(
        university_id: str,
        url: str,
        canonical_url: str,
        title: str,
        clean_text: str,
        content_hash: str,
        etag: Optional[str] = None,
        http_status: int = 200,
        depth: int = 0
    ) -> Tuple[str, str]:
        """
        Saves or updates a crawled page record.
        Returns Tuple: (page_id: str, action: 'NEW' | 'UPDATED' | 'UNCHANGED')
        """
        with get_db_cursor(commit=True, dict_cursor=True) as cur:
            # 1. Check existing record
            cur.execute("""
                SELECT id, content_hash
                FROM crawled_pages
                WHERE university_id = %s AND canonical_url = %s;
            """, (university_id, canonical_url))
            existing = cur.fetchone()

            if existing:
                page_id = existing["id"]
                if existing["content_hash"] == content_hash:
                    # Content unchanged -> update timestamp, skip extraction
                    cur.execute("""
                        UPDATE crawled_pages
                        SET updated_at = NOW(), http_status = %s, etag = %s
                        WHERE id = %s;
                    """, (http_status, etag, page_id))
                    return (str(page_id), "UNCHANGED")
                else:
                    # Content changed -> update clean_text and mark extraction PENDING
                    cur.execute("""
                        UPDATE crawled_pages
                        SET title = %s, clean_text = %s, content_hash = %s,
                            etag = %s, http_status = %s, extraction_status = 'PENDING',
                            updated_at = NOW()
                        WHERE id = %s;
                    """, (title, clean_text, content_hash, etag, http_status, page_id))
                    return (str(page_id), "UPDATED")
            else:
                # New page record
                cur.execute("""
                    INSERT INTO crawled_pages (
                        university_id, url, canonical_url, title, clean_text,
                        content_hash, etag, http_status, depth, extraction_status
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'PENDING')
                    RETURNING id;
                """, (
                    university_id, url, canonical_url, title, clean_text,
                    content_hash, etag, http_status, depth
                ))
                new_id = cur.fetchone()["id"]
                return (str(new_id), "NEW")

    @staticmethod
    def get_crawled_pages_summary(university_id: str) -> Dict[str, Any]:
        """Returns summary metrics of crawled pages for a university."""
        with get_db_cursor(commit=False, dict_cursor=True) as cur:
            cur.execute("""
                SELECT 
                    COUNT(*) AS total_pages,
                    COUNT(*) FILTER (WHERE extraction_status = 'PENDING') AS pending_extraction,
                    COUNT(*) FILTER (WHERE extraction_status = 'EXTRACTED') AS extracted_pages,
                    COUNT(*) FILTER (WHERE http_status = 200) AS successful_pages,
                    COUNT(*) FILTER (WHERE http_status >= 400) AS failed_pages
                FROM crawled_pages
                WHERE university_id = %s;
            """, (university_id,))
            return cur.fetchone() or {}
