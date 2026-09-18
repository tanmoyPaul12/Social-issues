#!/usr/bin/env python3
"""
URL Discovery Script for IIT ISM Dhanbad
Traverses given seed URLs using BFS or DFS and generates a hierarchical list of discovered URLs.
Does NOT download markdown or heavy rendering, only extracts and maps URLs.
"""

import sys
import os
import argparse
import asyncio
import httpx
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

# Define the base and seed URLs
BASE_DOMAIN = "iitism.ac.in"
SEED_URLS = [
    "https://www.iitism.ac.in/",
    "https://www.iitism.ac.in/center",
    "https://www.iitism.ac.in/departments",
    "https://people.iitism.ac.in/~faculty/",
    "https://www.iitism.ac.in/dean-iie",
    "https://www.iitism.ac.in/staff-and-officers",
    "https://people.iitism.ac.in/~research/"
]

def is_internal(url: str) -> bool:
    parsed = urlparse(url)
    return BASE_DOMAIN in parsed.netloc

async def fetch_links(client, url: str) -> list:
    try:
        response = await client.get(url, timeout=10.0, follow_redirects=True)
        if response.status_code != 200:
            return []
        
        soup = BeautifulSoup(response.text, "html.parser")
        links = set()
        for a_tag in soup.find_all("a", href=True):
            href = a_tag["href"]
            full_url = urljoin(url, href)
            # Clean up URL (remove fragments)
            full_url = full_url.split("#")[0]
            if full_url.startswith("http") and is_internal(full_url):
                links.add(full_url)
        return list(links)
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return []

async def crawl_seed(client, seed_url: str, max_depth: int, strategy: str, f_out) -> None:
    visited = set()
    # Queue or Stack based on strategy: (url, depth, parent_url)
    collection = [(seed_url, 0, None)]
    
    f_out.write(f"\n======================================================\n")
    f_out.write(f"SEED: {seed_url}\n")
    f_out.write(f"======================================================\n")

    while collection:
        if strategy == "bfs":
            current_url, depth, parent = collection.pop(0)  # Queue
        else:
            current_url, depth, parent = collection.pop()   # Stack
            
        if current_url in visited:
            continue
            
        visited.add(current_url)
        
        # Indent based on depth
        indent = "  " * depth
        if parent:
            f_out.write(f"{indent}- {current_url} (Found in: {parent})\n")
        else:
            f_out.write(f"{indent}- {current_url}\n")
            
        if depth < max_depth:
            links = await fetch_links(client, current_url)
            # Add new links to collection
            for link in links:
                if link not in visited:
                    collection.append((link, depth + 1, current_url))

async def main():
    parser = argparse.ArgumentParser(description="Discover URLs via BFS/DFS without downloading full content.")
    parser.add_argument("--strategy", choices=["bfs", "dfs"], default="bfs", help="Traversal strategy")
    parser.add_argument("--depth", type=int, default=2, help="Maximum depth to crawl")
    parser.add_argument("--output", type=str, default="url_list_iit_dhanbad.txt", help="Output text file")
    
    args = parser.parse_args()
    
    print(f"Starting {args.strategy.upper()} URL discovery for IIT Dhanbad up to depth {args.depth}...")
    
    async with httpx.AsyncClient(verify=False) as client:
        with open(args.output, "w", encoding="utf-8") as f_out:
            for seed in SEED_URLS:
                print(f"Processing seed: {seed}")
                await crawl_seed(client, seed, args.depth, args.strategy, f_out)
                
    print(f"\nFinished! All discovered URLs have been written to: {os.path.abspath(args.output)}")

if __name__ == "__main__":
    asyncio.run(main())
