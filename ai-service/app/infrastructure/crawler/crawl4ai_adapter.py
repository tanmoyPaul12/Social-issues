"""
Crawl4AI & Dynamic HTML Rendering Adapter.
Fetches and extracts clean, LLM-ready markdown from JavaScript-rendered university portals.
Exclusively handles HTML web content (strictly ignoring binary/PDF downloads).
"""
import asyncio
from typing import Tuple, Optional, Dict, Any
from urllib.parse import urlparse
from app.utils.logger import logger
from .parser import extract_semantic_content, ParsedPage
from .ssrf import is_safe_url


class Crawl4AIAdapter:
    """Dynamic web crawler adapter using Crawl4AI / Playwright with async fallback."""

    def __init__(self, timeout_seconds: int = 25):
        self.timeout_seconds = timeout_seconds
        self._has_crawl4ai = False
        try:
            import crawl4ai
            self._has_crawl4ai = True
        except ImportError:
            self._has_crawl4ai = False

    async def crawl_html_page(
        self,
        url: str,
        allowed_domains: Optional[list] = None
    ) -> Tuple[int, str, ParsedPage]:
        """
        Renders HTML page and returns (status_code, raw_markdown, ParsedPage).
        Strictly ignores non-HTML binaries (.pdf, .zip, .jpg).
        """
        # Safety check
        if not is_safe_url(url, allowed_domains):
            logger.warning("Crawl4AI adapter blocked unsafe/out-of-scope URL: {}", url)
            return (403, "", ParsedPage(title="", clean_markdown=""))

        # Skip binary extensions
        path = urlparse(url).path.lower()
        if path.endswith((".pdf", ".zip", ".tar", ".gz", ".docx", ".xlsx", ".pptx", ".jpg", ".png")):
            logger.debug("Skipping binary non-HTML URL: {}", url)
            return (204, "", ParsedPage(title="", clean_markdown=""))

        # 1. Try Crawl4AI dynamic browser if installed
        if self._has_crawl4ai:
            try:
                from crawl4ai import AsyncWebCrawler
                async with AsyncWebCrawler(verbose=False) as crawler:
                    result = await crawler.arun(url=url)
                    if result.success and result.markdown:
                        parsed = extract_semantic_content(result.html or "", url)
                        if result.markdown and len(result.markdown) > len(parsed.clean_markdown):
                            parsed.clean_markdown = result.markdown
                        return (200, result.markdown, parsed)
            except Exception as e:
                logger.debug("Crawl4AI browser execution error for {}: {}. Using standard async fetcher.", url, str(e))

        # 2. Async HTTP + Semantic Parser Engine Fallback
        import httpx
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 SocietalInnovationBot/1.0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds, follow_redirects=True, verify=False) as client:
                resp = await client.get(url, headers=headers)
                if resp.status_code == 200:
                    content_type = resp.headers.get("content-type", "").lower()
                    if "text/html" not in content_type and "application/xhtml" not in content_type:
                        logger.debug("Ignoring non-HTML content type '{}' for {}", content_type, url)
                        return (204, "", ParsedPage(title="", clean_markdown=""))

                    parsed = extract_semantic_content(resp.text, str(resp.url))
                    return (200, parsed.clean_markdown, parsed)
                else:
                    return (resp.status_code, "", ParsedPage(title="", clean_markdown=""))
        except Exception as e:
            logger.warning("Error fetching HTML page {}: {}", url, str(e))
            return (500, "", ParsedPage(title="", clean_markdown=""))
