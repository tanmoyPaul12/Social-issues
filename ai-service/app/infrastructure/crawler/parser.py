"""
Academic Semantic Parser Module: Dual-parser engine using Trafilatura for clean
markdown text + BeautifulSoup for tabular rosters, titles, and hyperlinks.
"""
from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from urllib.parse import urljoin
from bs4 import BeautifulSoup
import trafilatura
from app.utils.logger import logger


@dataclass
class ParsedPage:
    title: str
    clean_markdown: str
    meta_description: Optional[str] = None
    extracted_links: List[str] = field(default_factory=list)
    headings: List[str] = field(default_factory=list)


def extract_semantic_content(html: str, base_url: str) -> ParsedPage:
    """
    Extracts semantic content from raw HTML:
    1. Uses Trafilatura for main body academic text extraction (removing navbars/footers).
    2. Uses BeautifulSoup for title, headings, meta tags, and hyperlink extraction.
    """
    if not html or not isinstance(html, str):
        return ParsedPage(title="", clean_markdown="")

    # 1. Trafilatura semantic extraction
    clean_md = ""
    try:
        clean_md = trafilatura.extract(
            html,
            url=base_url,
            include_links=True,
            include_tables=True,
            include_images=False,
            favor_recall=True,
            output_format="txt"
        ) or ""
    except Exception as e:
        logger.debug("Trafilatura extraction fallback for {}: {}", base_url, str(e))

    # 2. BeautifulSoup metadata & links extraction
    soup = BeautifulSoup(html, "lxml")

    # If Trafilatura produced empty text (e.g. strict table page), fallback to BS4 get_text
    if not clean_md or len(clean_md.strip()) < 50:
        for tag in soup(["script", "style", "nav", "footer", "header", "noscript"]):
            tag.decompose()
        clean_md = soup.get_text(separator="\n", strip=True)

    # Title extraction
    title = ""
    if soup.title and soup.title.string:
        title = soup.title.string.strip()
    elif soup.find("h1"):
        title = soup.find("h1").get_text(strip=True)

    # Meta description
    meta_desc = None
    meta_tag = soup.find("meta", attrs={"name": "description"}) or soup.find("meta", attrs={"property": "og:description"})
    if meta_tag and meta_tag.get("content"):
        meta_desc = meta_tag["content"].strip()

    # Headings
    headings = [h.get_text(strip=True) for h in soup.find_all(["h1", "h2", "h3"]) if h.get_text(strip=True)]

    # Outgoing Links resolution
    links: List[str] = []
    for a in soup.find_all("a", href=True):
        raw_href = a["href"].strip()
        if raw_href and not raw_href.startswith(("#", "javascript:", "mailto:", "tel:")):
            absolute_url = urljoin(base_url, raw_href)
            links.append(absolute_url)

    return ParsedPage(
        title=title,
        clean_markdown=clean_md,
        meta_description=meta_desc,
        extracted_links=links,
        headings=headings[:15]
    )
