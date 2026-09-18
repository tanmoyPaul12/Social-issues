# 🕷️ Production Fault-Tolerant University Crawler: Architecture & Implementation

**Document:** Zero-Fault University Knowledge Base Crawler Specification  
**Location in Codebase:** `ai-service/app/infrastructure/crawler/`  
**Target:** 100% Complete & Fault-Free Ingestion across Departments, Research Centres, Facilities, Incubation Hubs & Faculty  

---

## ⚠️ 1. Why Standard Crawlers Fail on University Portals (and How We Prevent It)

| University Portal Challenge | Why Naive Crawlers Crash/Fail | Production Solution in our Crawler |
| :--- | :--- | :--- |
| **Heterogeneous Frameworks** | Some portals are PHP/JSP tables (BAU, VBU), others WordPress (BIT Mesra), others React/SPA (IIT ISM). | **Dual Fetch Engine:** Async `httpx` (Fast Static) + Headless `Playwright/Crawl4AI` (Dynamic JS Fallback). |
| **WAF / IP Rate Limits** | Universities block crawlers with HTTP 429 / 403 when hit too fast. | **Adaptive Rate Limiter & Backoff:** 2-second per-origin delay with exponential jitter + User-Agent rotation. |
| **Crawling Traps & Loops** | Calendar links (`?date=2026-09`), search query loops (`?page=9999`), file download loops. | **Strict Canonicalizer & Depth-3 BFS:** Strips tracking params, limits depth to 3, filters query loops. |
| **Missing Faculty / Labs** | Faculty lists inside deep sub-menus or hidden behind tabs. | **Multi-Tier Seed Targets (`crawl_targets`):** Seeds directly into Department Directories, Lab lists, and TBI hubs. |
| **Network & SSL Drops** | University servers often experience intermittent timeouts / SSL handshake failures. | **Resilient Retry Circuit Breaker:** 3-retry policy with Dead Letter Queue (DLQ) for failed pages. |
| **Server Security & SSRF** | Malicious or misconfigured university redirects pointing to internal IPs (`127.0.0.1`, `10.x.x.x`, `169.254.169.254`). | **Strict DNS Resolution Guard (`ssrf.py`):** Resolves IP before connect; blocks all private & cloud metadata IP subnets. |

---

## 🏗️ 2. The Zero-Fault 6-Layer Crawler Pipeline

```
                               ┌────────────────────────────────────────────────────────┐
                               │             TARGET SEED & SITEMAP DISCOVERY            │
                               │   (Academic Depts, Research Hubs, TBIs, Faculty Lists) │
                               └────────────────────────────────────────────────────────┘
                                                            │
                                                            ▼
                               ┌────────────────────────────────────────────────────────┐
                               │ LAYER 1: SSRF GUARD & URL NORMALIZER                   │
                               │ • Canonicalize URL (lowercase domain, sort params)     │
                               │ • Resolve DNS & Block RFC 1918 / Cloud Metadata IPs    │
                               │ • Domain Allowlists (e.g., *.iitism.ac.in only)        │
                               └────────────────────────────────────────────────────────┘
                                                            │
                                                            ▼
                               ┌────────────────────────────────────────────────────────┐
                               │ LAYER 2: POLITENESS & RATE LIMIT CONTROLLER            │
                               │ • Parse robots.txt (cache rules per host)              │
                               │ • Enforce 2-second delay per university domain         │
                               └────────────────────────────────────────────────────────┘
                                                            │
                                                            ▼
                               ┌────────────────────────────────────────────────────────┐
                               │ LAYER 3: DUAL-MODE ASYNC HTTP FETCHER                  │
                               │ • Primary: Async HTTPX (HTTP/2, Gzip/Brotli, 15s timeout)
                               │ • Secondary: Dynamic JS fallback for SPA directories   │
                               │ • Retry Circuit Breaker (3 attempts with jitter)       │
                               └────────────────────────────────────────────────────────┘
                                                            │
                                                            ▼
                               ┌────────────────────────────────────────────────────────┐
                               │ LAYER 4: DUAL-PARSER SEMANTIC EXTRACTOR                │
                               │ • Trafilatura: Main body markdown, research text       │
                               │ • BeautifulSoup4: Tabular rosters (faculty, email, lab)│
                               │ • Meta-tag Extractor: Title, author, department        │
                               └────────────────────────────────────────────────────────┘
                                                            │
                                                            ▼
                               ┌────────────────────────────────────────────────────────┐
                               │ LAYER 5: SHA-256 DELTA CHANGE DETECTOR                 │
                               │ • Compute Hash = SHA-256(cleaned_text)                 │
                               │ • Compare with DB hash: If identical -> mark UNCHANGED │
                               │ • If modified/new -> save & queue for LangGraph        │
                               └────────────────────────────────────────────────────────┘
                                                            │
                                                            ▼
                               ┌────────────────────────────────────────────────────────┐
                               │ LAYER 6: ATOMIC DATABASE PERSISTENCE                   │
                               │ • Write snapshot to Supabase `crawled_pages` table     │
                               │ • Log errors to Dead Letter Queue for zero data loss   │
                               └────────────────────────────────────────────────────────┘
```

---

## 🎯 3. Crawling Across the 5 Mandatory Capability Domains

For each of the Top 5 Jharkhand Universities, the crawler targets specific institutional components:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 5 MANDATORY CAPABILITY DOMAINS CRAWLED                                           │
├────────────────────────┬────────────────────────┬────────────────────────┬────────────────────────┬──────────────┤
│ 1. Academic Disciplines│ 2. Research Centres    │ 3. Innovation Hubs     │ 4. Incubation (TBIs)   │ 5. Faculty   │
│    (departments)       │    & Lab Facilities    │    & Makerspaces       │    & Prototyping Cells │    Rosters   │
├────────────────────────┼────────────────────────┼────────────────────────┼────────────────────────┼──────────────┤
│ • Dept Name & Code     │ • Centre for Water Res │ • Rural Prototyping Hub│ • BIT-TBI Incubation   │ • Full Name  │
│ • Official Dept URL    │ • Mine Safety Lab      │ • Robotics Makerspace  │ • CIIE IIT ISM         │ • Designation│
│ • HoD / Chair Profile  │ • Atomic Absorption Lab│ • Student E-Cells      │ • AIC Agriculture Hub  │ • PhD Status │
│ • Mission & Focus      │ • Soil Testing Facility│ • Design Studios       │ • Startup Accelerators │ • Email/Phone│
│ • Programs & Courses   │ • XRD & Electron Micro │ • Fabrication Hubs     │ • Technology Transfer  │ • Research KW│
└────────────────────────┴────────────────────────┴────────────────────────┴────────────────────────┴──────────────┘
```

---

## 📂 4. Production Code Architecture (`ai-service`)

```text
ai-service/
├── app/
│   ├── infrastructure/
│   │   ├── crawler/
│   │   │   ├── __init__.py
│   │   │   ├── ssrf.py           # Strict DNS resolution & private IP blocker
│   │   │   ├── robots.py         # robots.txt parser & rate-limit compliance
│   │   │   ├── normalizer.py     # Canonical URL normalization & deduplication
│   │   │   ├── sitemap.py        # XML sitemap discovery & URL filtering
│   │   │   ├── client.py         # Async httpx client with backoff & User-Agent rotation
│   │   │   ├── parser.py         # Trafilatura + BeautifulSoup semantic extractor
│   │   │   ├── hash.py           # SHA-256 + Content-Hash change detection
│   │   │   ├── storage.py        # Supabase/PostgreSQL atomic page persistence
│   │   │   ├── engine.py         # Async BFS/DFS selective crawler engine
│   │   │   └── scheduler.py      # Background crawl job orchestrator
│   │   └── database/
│   │       ├── client.py         # Connection pool & query context manager
│   │       └── health.py         # Supabase connection & pgvector health check
│   │
│   ├── services/
│   │   └── crawl_service.py      # High-level trigger, progress tracking, and metrics
│   │
│   └── api/
│       └── routes/
│           └── crawl.py          # REST endpoints (/api/v1/crawl/trigger, /status, /universities)
│
├── database/
│   ├── migrations/
│   │   ├── 001_university_schema.sql
│   │   ├── 002_expertise_relationships.sql
│   │   ├── 003_crawler_schema.sql       # crawl_configurations, crawl_targets, crawled_pages
│   │   └── 004_vector_embeddings.sql    # university_embeddings with pgvector HNSW index
│   └── seed/
│       ├── taxonomy_seed.py
│       └── crawl_configuration_seed.py  # Crawl rules for Top 5 Jharkhand Universities
│
└── scripts/
    └── crawl_university.py       # CLI runner to trigger single or batch university crawl
```

---

## 🛡️ 5. Zero-Fault Implementation Details

### 5.1 Strict SSRF Guard (`ssrf.py`)
```python
import ipaddress
import socket
from urllib.parse import urlparse

FORBIDDEN_NETWORKS = [
    ipaddress.ip_network("127.0.0.0/8"),      # Loopback
    ipaddress.ip_network("10.0.0.0/8"),       # Private RFC 1918
    ipaddress.ip_network("172.16.0.0/12"),    # Private RFC 1918
    ipaddress.ip_network("192.168.0.0/16"),   # Private RFC 1918
    ipaddress.ip_network("169.254.0.0/16"),   # Link-local & Cloud Metadata (AWS/GCP/Azure)
    ipaddress.ip_network("::1/128"),          # IPv6 Loopback
    ipaddress.ip_network("fc00::/7"),         # IPv6 Unique Local
]

def is_safe_url(url: str, allowed_domains: list[str]) -> bool:
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        return False
    
    # Check domain allowlist
    hostname = parsed.hostname.lower() if parsed.hostname else ""
    if not any(hostname == domain or hostname.endswith("." + domain) for domain in allowed_domains):
        return False

    # Resolve IP and verify not private
    try:
        addr_info = socket.getaddrinfo(hostname, None)
        for _, _, _, _, sockaddr in addr_info:
            ip = ipaddress.ip_address(sockaddr[0])
            if any(ip in net for net in FORBIDDEN_NETWORKS):
                return False
    except socket.gaierror:
        return False

    return True
```

### 5.2 Dual-Mode HTML & Semantic Text Parser (`parser.py`)
```python
import trafilatura
from bs4 import BeautifulSoup
from typing import Dict, Any, List

def extract_page_content(html: str, url: str) -> Dict[str, Any]:
    # 1. Extract clean semantic markdown using Trafilatura (best for academic articles & bios)
    clean_markdown = trafilatura.extract(
        html,
        url=url,
        include_links=True,
        include_tables=True,
        favor_recall=True
    ) or ""

    # 2. Extract structured elements using BeautifulSoup4
    soup = BeautifulSoup(html, "lxml")
    title = soup.title.string.strip() if soup.title and soup.title.string else ""
    
    # 3. Extract internal hyperlinks matching academic patterns
    links: List[str] = []
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        if href and not href.startswith(("#", "javascript:", "mailto:", "tel:")):
            links.append(href)

    return {
        "title": title,
        "clean_text": clean_markdown,
        "raw_links": links
    }
```

### 5.3 SHA-256 Delta Change Detection (`hash.py`)
```python
import hashlib

def compute_content_hash(text: str) -> str:
    """Computes deterministic SHA-256 hash of normalized text."""
    normalized = " ".join(text.split()).strip().lower()
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()
```

---

## 🚀 6. Step 3 Execution Commands

1. **Apply Migration 003 & 004:**
   ```bash
   psql $DATABASE_URL -f database/migrations/003_crawler_schema.sql
   psql $DATABASE_URL -f database/migrations/004_vector_embeddings.sql
   ```

2. **Seed Top 5 Jharkhand Crawl Configurations:**
   ```bash
   python database/seed/crawl_configuration_seed.py
   ```

3. **Execute Pilot Crawl on IIT (ISM) Dhanbad:**
   ```bash
   python scripts/crawl_university.py --code IIT_ISM_DHANBAD --max-pages 100
   ```
