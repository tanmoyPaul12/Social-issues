import asyncio
import os
import httpx
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from app.utils.logger import logger

try:
    from crawl4ai import AsyncWebCrawler
except ImportError:
    logger.error("Crawl4AI not installed. Please install it to use this crawler.")
    AsyncWebCrawler = None

class FacultyCrawler:
    """
    Surgical Faculty-only crawler using Crawl4AI.
    Specifically crawls https://www.iitism.ac.in/all-faculty and all individual profiles.
    """
    
    SEED_URL = "https://www.iitism.ac.in/all-faculty"
    BASE_DOMAIN = "https://www.iitism.ac.in"
    PROFILE_PATTERN = "/faculty-details?faculty="
    
    def __init__(self, output_dir: str = "../docs/knowledge_base/crawled_raw/IIT_ISM_DHANBAD/faculty"):
        self.output_dir = os.path.abspath(output_dir)
        os.makedirs(self.output_dir, exist_ok=True)



    async def run(self, max_profiles: int = None):
        if not AsyncWebCrawler:
            logger.error("Cannot run FacultyCrawler without Crawl4AI.")
            return {"status": "FAILED", "error": "Crawl4AI not installed"}
            
        logger.info(f"Starting Faculty Crawler from {self.SEED_URL}")
        
        # We use playwright to render the dynamic all-faculty page
        async with AsyncWebCrawler(verbose=False) as crawler:
            logger.info("Fetching seed page...")
            seed_result = await crawler.arun(url=self.SEED_URL)
            if not seed_result.success:
                logger.error(f"Failed to fetch seed URL: {self.SEED_URL}")
                return {"status": "FAILED", "error": "Failed to fetch seed"}

            # Extract faculty profile links
            soup = BeautifulSoup(seed_result.html, "html.parser")
            profile_links = []
            for a in soup.find_all("a", href=True):
                href = a["href"].strip()
                if self.PROFILE_PATTERN in href:
                    full_url = urljoin(self.BASE_DOMAIN, href)
                    if full_url not in profile_links:
                        profile_links.append(full_url)
                        
            logger.info(f"Discovered {len(profile_links)} faculty profiles.")
            
            if max_profiles:
                profile_links = profile_links[:max_profiles]
                logger.info(f"Limiting to {max_profiles} profiles.")

            stats = {
                "total_profiles_found": len(profile_links),
                "profiles_crawled": 0,
                "pdfs_downloaded": 0,
                "status": "RUNNING"
            }

            for url in profile_links:
                logger.info(f"Crawling faculty profile: {url}")
                profile_result = await crawler.arun(url=url)
                
                if profile_result.success and profile_result.markdown:
                    # Save markdown
                    parsed_url = urlparse(url)
                    faculty_id = parsed_url.query.replace("faculty=", "")
                    if not faculty_id:
                        faculty_id = "unknown_faculty"
                    
                    import re
                    faculty_id = re.sub(r'[^a-zA-Z0-9_\-]', '_', faculty_id)
                        
                    md_path = os.path.join(self.output_dir, f"{faculty_id}.md")
                    os.makedirs(os.path.dirname(md_path), exist_ok=True)
                    with open(md_path, "w", encoding="utf-8") as f:
                        f.write(profile_result.markdown)
                    
                    stats["profiles_crawled"] += 1
                    

                
                # Small delay to be polite
                await asyncio.sleep(1.0)
                
            stats["status"] = "COMPLETED"
            logger.info(f"Faculty Crawl Completed. Stats: {stats}")
            return stats
