#!/usr/bin/env python3
"""
Production Deep Crawler for Premier Jharkhand Universities.
Recursively crawls university web portals, renders HTML,
converts content to clean Markdown, and saves Markdown files in:
docs/knowledge_base/crawled_raw/{UNIVERSITY_CODE}/

Supports background execution, resume, and multi-university batch runs.

Usage:
    python ai-service/scripts/deep_crawl_universities.py --all --max-pages 500 --strategy bfs
    python ai-service/scripts/deep_crawl_universities.py --code IIT_ISM_DHANBAD --max-pages 300 --strategy dfs
    python ai-service/scripts/deep_crawl_universities.py --summary
"""
import sys
import os
import re
import time
import asyncio
import hashlib
import argparse
from typing import Dict, Any, List, Set, Optional
from urllib.parse import urlparse

# Add ai-service to sys.path regardless of execution CWD
current_dir = os.path.dirname(os.path.abspath(__file__))
ai_service_root = os.path.abspath(os.path.join(current_dir, ".."))
project_root = os.path.abspath(os.path.join(ai_service_root, ".."))

if ai_service_root not in sys.path:
    sys.path.insert(0, ai_service_root)

# Try importing Crawl4AI modules
try:
    from crawl4ai import AsyncWebCrawler, CrawlerRunConfig
    from crawl4ai.deep_crawling import BFSDeepCrawlStrategy, DFSDeepCrawlStrategy
    HAS_CRAWL4AI = True
except ImportError:
    HAS_CRAWL4AI = False
    print("WARNING: crawl4ai is not installed. Native deep crawling strategies will not be available.")

# Base directory for raw Markdown document storage
RAW_MARKDOWN_BASE_DIR = os.path.join(project_root, "docs", "knowledge_base", "crawled_raw")


# Top 5 Premier University Deep Crawl Configurations
UNIVERSITIES_CONFIG = {
    "IIT_ISM_DHANBAD": {
        "name": "Indian Institute of Technology (ISM) Dhanbad",
        "base_url": "https://www.iitism.ac.in",
        "allowed_domains": ["iitism.ac.in", "www.iitism.ac.in"],
        "seed_urls": [
            "https://www.iitism.ac.in",
            "https://www.iitism.ac.in/departments",
            "https://www.iitism.ac.in/centres",
            "https://people.iitism.ac.in/~faculty/",
            "https://www.iitism.ac.in/dean-iie",
            "https://www.iitism.ac.in/staff-and-officers",
            "https://people.iitism.ac.in/~research/"
        ]
    },
    "BIT_MESRA": {
        "name": "Birla Institute of Technology (BIT) Mesra, Ranchi",
        "base_url": "https://www.bitmesra.ac.in",
        "allowed_domains": ["bitmesra.ac.in", "www.bitmesra.ac.in"],
        "seed_urls": ["https://www.bitmesra.ac.in"]
    },
    "NIT_JAMSHEDPUR": {
        "name": "National Institute of Technology (NIT) Jamshedpur",
        "base_url": "https://www.nitjsr.ac.in",
        "allowed_domains": ["nitjsr.ac.in", "www.nitjsr.ac.in"],
        "seed_urls": ["https://www.nitjsr.ac.in"]
    },
    "BAU_RANCHI": {
        "name": "Birsa Agricultural University (BAU) Ranchi",
        "base_url": "https://www.bauranchi.org",
        "allowed_domains": ["bauranchi.org", "www.bauranchi.org"],
        "seed_urls": ["https://www.bauranchi.org"]
    },
    "AIIMS_DEOGHAR": {
        "name": "All India Institute of Medical Sciences (AIIMS) Deoghar",
        "base_url": "https://www.aiimsdeoghar.edu.in",
        "allowed_domains": ["aiimsdeoghar.edu.in", "www.aiimsdeoghar.edu.in"],
        "seed_urls": ["https://www.aiimsdeoghar.edu.in"]
    }
}


def sanitize_filename(url: str) -> str:
    """Generates clean filesystem-safe filename from URL."""
    parsed = urlparse(url)
    path = parsed.path.strip("/")
    if not path:
        path = "index"
    
    clean_name = re.sub(r"[^a-zA-Z0-9_-]", "_", path)
    if len(clean_name) > 80:
        clean_name = clean_name[:80] + "_" + hashlib.md5(url.encode()).hexdigest()[:6]
    return f"{clean_name}.md"


class DeepUniversityCrawler:
    """Recursively deep crawls university portals using native crawl4ai strategies."""

    def __init__(self, code: str, strategy_name: str = "bfs", max_pages: int = 300, max_depth: int = 4):
        self.code = code.upper()
        self.config = UNIVERSITIES_CONFIG.get(self.code)
        if not self.config:
            raise ValueError(f"Unknown university code: {self.code}")

        self.strategy_name = strategy_name.lower()
        self.max_pages = max_pages
        self.max_depth = max_depth

        self.output_dir = os.path.join(RAW_MARKDOWN_BASE_DIR, self.code)
        os.makedirs(self.output_dir, exist_ok=True)
        self.log_file = os.path.join(self.output_dir, "url_discovery_log.txt")

    async def crawl_portal(self) -> Dict[str, Any]:
        """Executes deep crawling using crawl4ai BFS/DFS strategy."""
        
        stats = {
            "university_code": self.code,
            "university_name": self.config["name"],
            "pages_crawled": 0,
            "markdown_files_saved": 0,
            "start_time": time.strftime("%Y-%m-%d %H:%M:%S")
        }

        print("\n" + "=" * 80)
        print(f"🚀 STARTING {self.strategy_name.upper()} DEEP CRAWL: {self.config['name']} ({self.code})")
        print(f"Target Max Pages: {self.max_pages} | Max Depth: {self.max_depth}")
        print(f"Markdown Output: {self.output_dir}")
        print("=" * 80)
        
        if not HAS_CRAWL4AI:
            print("ERROR: crawl4ai is missing. Cannot proceed with native BFS/DFS.")
            return stats
            
        # Select strategy
        if self.strategy_name == "dfs":
            strategy = DFSDeepCrawlStrategy(
                max_depth=self.max_depth,
                include_external=False,
                max_pages=self.max_pages,
            )
        else:
            strategy = BFSDeepCrawlStrategy(
                max_depth=self.max_depth,
                include_external=False,
                max_pages=self.max_pages,
            )
            
        run_config = CrawlerRunConfig(deep_crawl_strategy=strategy)

        # Open log file to append discovered URLs
        with open(self.log_file, "a", encoding="utf-8") as f_log:
            f_log.write(f"\n--- Crawl Session Started: {time.strftime('%Y-%m-%d %H:%M:%S')} (Strategy: {self.strategy_name.upper()}) ---\n")
        
            async with AsyncWebCrawler(verbose=True) as crawler:
                for seed_url in self.config["seed_urls"]:
                    print(f"[*] Starting deep crawl for seed: {seed_url}")
                    
                    try:
                        results = await crawler.arun(url=seed_url, config=run_config)
                        
                        if not isinstance(results, list):
                            results = [results]
                            
                        for result in results:
                            stats["pages_crawled"] += 1
                            url = result.url
                            
                            # Log the discovered URL
                            f_log.write(f"[DEPTH UNKNOWN] {url}\n")
                            
                            if result.success and result.markdown:
                                filename = sanitize_filename(url)
                                file_path = os.path.join(self.output_dir, filename)
                                
                                md_document = f"""---
university_code: {self.code}
university_name: "{self.config['name']}"
source_url: "{url}"
title: "Crawled Page"
crawled_at: "{time.strftime('%Y-%m-%d %H:%M:%S')}"
---

# {self.config['name']}

> **Source URL**: [{url}]({url})  
> **Crawled At**: {time.strftime('%Y-%m-%d %H:%M:%S')}

{result.markdown}
"""
                                with open(file_path, "w", encoding="utf-8") as f:
                                    f.write(md_document)
                                
                                stats["markdown_files_saved"] += 1
                                print(f"  [SAVED] {filename}")
                            else:
                                print(f"  [FAILED/EMPTY] {url}")
                                
                    except Exception as e:
                        print(f"Error crawling seed {seed_url}: {str(e)}")

        stats["end_time"] = time.strftime("%Y-%m-%d %H:%M:%S")
        print("\n" + "=" * 80)
        print(f"✅ DEEP CRAWL COMPLETE: {self.code}")
        print(f"Total Pages Processed:        {stats['pages_crawled']}")
        print(f"Markdown Files Saved:         {stats['markdown_files_saved']}")
        print(f"URL Log Saved:                {self.log_file}")
        print("=" * 80 + "\n")

        return stats

def print_summary():
    print("\n" + "=" * 85)
    print(f"{'UNIVERSITY CODE':<20} | {'UNIVERSITY NAME':<40} | {'RAW MARKDOWN PAGES'}")
    print("-" * 85)
    total_files = 0
    for code, cfg in UNIVERSITIES_CONFIG.items():
        uni_raw_dir = os.path.join(RAW_MARKDOWN_BASE_DIR, code)
        count = 0
        if os.path.exists(uni_raw_dir):
            count = len([f for f in os.listdir(uni_raw_dir) if f.endswith(".md")])
        total_files += count
        print(f"{code:<20} | {cfg['name'][:38]:<40} | {count:<6}")
    print("-" * 85)
    print(f"{'TOTAL DOWNLOADED MARKDOWN PAGES':<63} | {total_files:<6}")
    print("=" * 85 + "\n")


async def main_async():
    parser = argparse.ArgumentParser(description="SIH Premier University Deep HTML Crawler & Markdown Downloader")
    parser.add_argument("--code", type=str, help="University code (IIT_ISM_DHANBAD, BIT_MESRA, NIT_JAMSHEDPUR, BAU_RANCHI, AIIMS_DEOGHAR)")
    parser.add_argument("--all", action="store_true", help="Deep crawl all 5 premier universities")
    parser.add_argument("--max-pages", type=int, default=100, help="Maximum HTML pages per university (default: 100)")
    parser.add_argument("--max-depth", type=int, default=4, help="Maximum crawling depth limit (default: 4)")
    parser.add_argument("--strategy", type=str, choices=["bfs", "dfs"], default="bfs", help="Deep crawl strategy (bfs or dfs)")
    parser.add_argument("--summary", action="store_true", help="Display summary count of downloaded markdown pages")

    args = parser.parse_args()

    if args.summary:
        print_summary()
        return

    if args.all:
        for code in UNIVERSITIES_CONFIG.keys():
            crawler = DeepUniversityCrawler(code, strategy_name=args.strategy, max_pages=args.max_pages, max_depth=args.max_depth)
            await crawler.crawl_portal()
        print_summary()
        return

    if args.code:
        crawler = DeepUniversityCrawler(args.code.upper(), strategy_name=args.strategy, max_pages=args.max_pages, max_depth=args.max_depth)
        await crawler.crawl_portal()
        print_summary()
        return

    parser.print_help()


if __name__ == "__main__":
    asyncio.run(main_async())
