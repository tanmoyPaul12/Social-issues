"""
Robots.txt & Politeness Module: Respects web scraping etiquette, parses robots.txt,
and manages per-domain rate limits and delays.
"""
import time
import asyncio
from typing import Dict, Optional, Tuple
from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser
import httpx
from app.utils.logger import logger


class RobotsManager:
    """Manages robots.txt caching and per-domain polite rate limiting."""

    def __init__(self, default_delay: float = 2.0, user_agent: str = "SocietalInnovationBot/1.0 (+https://sih.gov.in)"):
        self.default_delay = default_delay
        self.user_agent = user_agent
        self._parsers: Dict[str, RobotFileParser] = {}
        self._last_access: Dict[str, float] = {}
        self._lock = asyncio.Lock()

    def _get_origin(self, url: str) -> str:
        parsed = urlparse(url)
        return f"{parsed.scheme}://{parsed.netloc}".lower()

    async def fetch_and_parse(self, client: httpx.AsyncClient, url: str) -> RobotFileParser:
        """Fetches and parses robots.txt for the given origin if not already cached."""
        origin = self._get_origin(url)
        if origin in self._parsers:
            return self._parsers[origin]

        rp = RobotFileParser()
        robots_url = f"{origin}/robots.txt"
        rp.set_url(robots_url)

        try:
            resp = await client.get(robots_url, timeout=10.0, follow_redirects=True)
            if resp.status_code == 200:
                rp.parse(resp.text.splitlines())
                logger.debug("Successfully parsed robots.txt for {}", origin)
            elif resp.status_code in (401, 403):
                # If robots.txt is forbidden, disallow all
                rp.disallow_all = True
            else:
                # 404 or other errors mean allow all
                rp.allow_all = True
        except Exception as e:
            logger.debug("Could not fetch robots.txt for {}: {}. Allowing crawl.", origin, str(e))
            rp.allow_all = True

        self._parsers[origin] = rp
        return rp

    async def can_fetch(self, client: httpx.AsyncClient, url: str) -> bool:
        """Checks if the URL is allowed to be crawled according to robots.txt."""
        try:
            rp = await self.fetch_and_parse(client, url)
            return rp.can_fetch(self.user_agent, url)
        except Exception as e:
            logger.warning("Error checking robots.txt for {}: {}. Defaulting to True.", url, str(e))
            return True

    def get_crawl_delay(self, url: str) -> float:
        """Returns the crawl delay specified in robots.txt or default."""
        origin = self._get_origin(url)
        rp = self._parsers.get(origin)
        if rp:
            delay = rp.crawl_delay(self.user_agent)
            if delay and delay > 0:
                return float(delay)
        return self.default_delay

    async def throttle(self, url: str, override_delay: Optional[float] = None):
        """Enforces polite rate limiting for the origin of the URL."""
        origin = self._get_origin(url)
        delay = override_delay if override_delay is not None else self.get_crawl_delay(url)

        async with self._lock:
            now = time.time()
            last = self._last_access.get(origin, 0.0)
            elapsed = now - last
            wait_time = delay - elapsed
            if wait_time > 0:
                await asyncio.sleep(wait_time)
            self._last_access[origin] = time.time()
