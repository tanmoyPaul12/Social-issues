"""
University Crawler Engine: Production async BFS engine for crawling academic portals,
extracting clean markdown, detecting changes, and saving snapshots.
"""
import asyncio
from collections import deque
from typing import Dict, Any, List, Set, Optional
from app.utils.logger import logger
from .ssrf import is_safe_url
from .robots import RobotsManager
from .normalizer import normalize_url, is_valid_academic_link
from .hash import compute_content_hash
from .parser import extract_semantic_content
from .client import AsyncCrawlerClient
from .storage import CrawlerStorage


class UniversityCrawlerEngine:
    """Orchestrates safe, polite, fault-tolerant crawling for a university."""

    def __init__(self, university_code: str):
        self.university_code = university_code
        self.storage = CrawlerStorage()
        self.robots_manager = RobotsManager()

    async def run(self, max_pages_override: Optional[int] = None) -> Dict[str, Any]:
        """Executes full crawl pipeline for the university."""
        # 1. Load university config
        config = self.storage.get_university_crawl_config(self.university_code)
        if not config:
            raise ValueError(f"University '{self.university_code}' not found in database.")

        university_id = str(config["university_id"])
        base_url = config["base_url"]
        allowed_domains = config["allowed_domains"] or []
        max_depth = config.get("max_depth", 3)
        crawl_delay = float(config.get("crawl_delay_seconds", 2.0))
        max_pages = max_pages_override or config.get("max_pages", 300)

        logger.info(
            "Starting crawl for '{}' (base: {}, max_pages: {}, max_depth: {}, delay: {}s)",
            self.university_code, base_url, max_pages, max_depth, crawl_delay
        )

        # Mark as RUNNING
        self.storage.update_crawl_status(university_id, "RUNNING")

        # 2. Initialize Seed Queue
        # Queue item: (url: str, depth: int)
        queue: deque = deque()
        visited: Set[str] = set()

        # Add base URL
        norm_base = normalize_url(base_url)
        queue.append((norm_base, 0))
        visited.add(norm_base)

        # Add priority targets
        targets = self.storage.get_priority_targets(university_id)
        for t in targets:
            norm_target = normalize_url(t["url"])
            if norm_target and norm_target not in visited:
                queue.append((norm_target, 0))  # Start targets at depth 0
                visited.add(norm_target)

        stats = {
            "university_code": self.university_code,
            "pages_crawled": 0,
            "new_pages": 0,
            "updated_pages": 0,
            "unchanged_pages": 0,
            "failed_pages": 0,
            "status": "COMPLETED"
        }

        try:
            async with AsyncCrawlerClient(timeout=15.0, max_retries=3, allowed_domains=allowed_domains) as client:
                while queue and stats["pages_crawled"] < max_pages:
                    current_url, depth = queue.popleft()

                    # 1. SSRF and Domain verification
                    if not is_safe_url(current_url, allowed_domains):
                        continue

                    # 2. Check robots.txt permission
                    allowed_by_robots = await self.robots_manager.can_fetch(client._client, current_url)
                    if not allowed_by_robots:
                        logger.debug("Disallowed by robots.txt: {}", current_url)
                        continue

                    # 3. Rate limiting throttle
                    await self.robots_manager.throttle(current_url, override_delay=crawl_delay)

                    # 4. HTTP Fetch
                    status_code, html_text, final_url, etag = await client.fetch(current_url)

                    if status_code != 200 or not html_text:
                        logger.debug("Failed fetch for '{}' with status {}", current_url, status_code)
                        stats["failed_pages"] += 1
                        continue

                    # 5. Semantic Extraction
                    parsed = extract_semantic_content(html_text, final_url)
                    if not parsed.clean_markdown or len(parsed.clean_markdown.strip()) < 40:
                        # Page has no useful semantic content
                        continue

                    # 6. Delta Content Hashing
                    content_hash = compute_content_hash(parsed.clean_markdown)
                    canonical_url = normalize_url(final_url)

                    # 7. Database Persistence
                    page_id, action = self.storage.save_crawled_page(
                        university_id=university_id,
                        url=current_url,
                        canonical_url=canonical_url,
                        title=parsed.title,
                        clean_text=parsed.clean_markdown,
                        content_hash=content_hash,
                        etag=etag,
                        http_status=status_code,
                        depth=depth
                    )

                    stats["pages_crawled"] += 1
                    if action == "NEW":
                        stats["new_pages"] += 1
                    elif action == "UPDATED":
                        stats["updated_pages"] += 1
                    elif action == "UNCHANGED":
                        stats["unchanged_pages"] += 1

                    # 8. Discover New Links (if within depth limit)
                    if depth < max_depth:
                        for link in parsed.extracted_links:
                            norm_link = normalize_url(link)
                            if (
                                norm_link
                                and norm_link not in visited
                                and is_valid_academic_link(norm_link, allowed_domains)
                                and is_safe_url(norm_link, allowed_domains)
                            ):
                                visited.add(norm_link)
                                queue.append((norm_link, depth + 1))

            self.storage.update_crawl_status(university_id, "COMPLETED")
            logger.info("Crawl finished for '{}'. Final stats: {}", self.university_code, stats)

        except Exception as e:
            stats["status"] = "FAILED"
            stats["error"] = str(e)
            self.storage.update_crawl_status(university_id, "FAILED")
            logger.error("Crawl error for '{}': {}", self.university_code, str(e))

        return stats
