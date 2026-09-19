"""
Async HTTP Client Module: High-performance, resilient HTTP/2 client
with SSRF redirect validation, exponential backoff retries, and browser headers.
"""
import asyncio
import random
from typing import Optional, Dict, Any, List
import httpx
from app.utils.logger import logger
from .ssrf import is_safe_url

DEFAULT_USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 (SocietalInnovationBot/1.0)",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36 (SocietalInnovationBot/1.0)",
    "Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0 (SocietalInnovationBot/1.0)",
]


class AsyncCrawlerClient:
    """Resilient async HTTP client for academic web crawling."""

    def __init__(
        self,
        timeout: float = 15.0,
        max_retries: int = 3,
        allowed_domains: Optional[List[str]] = None
    ):
        self.timeout = timeout
        self.max_retries = max_retries
        self.allowed_domains = allowed_domains or []
        self._client: Optional[httpx.AsyncClient] = None

    async def __aenter__(self):
        self._client = httpx.AsyncClient(
            timeout=httpx.Timeout(self.timeout, connect=5.0),
            follow_redirects=False,  # We manually validate each redirect hop for SSRF safety
            http2=True,
            limits=httpx.Limits(max_keepalive_connections=20, max_connections=50),
            headers={
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
                "Accept-Encoding": "gzip, deflate, br",
                "User-Agent": random.choice(DEFAULT_USER_AGENTS),
            }
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self._client:
            await self._client.aclose()

    async def fetch(self, url: str) -> Tuple_Response:
        """
        Fetches a URL with SSRF validation, redirect handling (up to 5 hops),
        and exponential backoff retry.
        Returns Tuple: (status_code: int, html_text: str, final_url: str, etag: Optional[str])
        """
        current_url = url
        redirect_hops = 0
        max_redirects = 5

        while redirect_hops < max_redirects:
            # 1. SSRF Safety Check on each hop
            if not is_safe_url(current_url, self.allowed_domains):
                logger.warning("SSRF check failed for URL: {}", current_url)
                return (403, "", current_url, None)

            # 2. Attempt fetch with retries
            for attempt in range(1, self.max_retries + 1):
                try:
                    resp = await self._client.get(current_url)

                    # Handle 3xx Redirects safely
                    if resp.is_redirect and "location" in resp.headers:
                        location = resp.headers["location"]
                        redirect_hops += 1
                        # Resolve relative redirect
                        current_url = str(resp.url.join(location))
                        break  # proceed to next redirect hop

                    # Handle Success
                    if resp.status_code == 200:
                        etag = resp.headers.get("etag")
                        return (200, resp.text, str(resp.url), etag)

                    # If client error (404, 403), don't retry endlessly
                    if 400 <= resp.status_code < 500:
                        return (resp.status_code, resp.text, str(resp.url), None)

                    # If 5xx or 429, retry with backoff
                    if attempt < self.max_retries:
                        backoff = (2 ** attempt) + random.uniform(0.1, 0.5)
                        await asyncio.sleep(backoff)

                except (httpx.RequestError, httpx.TimeoutException) as e:
                    if attempt == self.max_retries:
                        logger.warning("Failed to fetch '{}' after {} attempts: {}", current_url, self.max_retries, str(e))
                        return (504, "", current_url, None)
                    await asyncio.sleep((2 ** attempt) + random.uniform(0.1, 0.5))

            else:
                # If loop completed without breaking for redirect, return failed
                return (500, "", current_url, None)

        return (310, "", current_url, None)  # Too many redirects


# Type alias for return value
Tuple_Response = tuple[int, str, str, Optional[str]]
