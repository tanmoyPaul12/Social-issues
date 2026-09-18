# 🏛️ Senior Architect Review: Top 5 Jharkhand Universities Intelligent Pipeline

**Project:** SIH Societal Innovation & University Routing Engine  
**Review Status:** Approved for Production Implementation  
**Target Scope:** Top 5 Premier Jharkhand Academic & Research Institutions  

---

## 🎯 1. Executive Architectural Blueprint

The pipeline transforms raw, heterogeneous public university websites into a structured, evidence-backed institutional capability graph and semantic vector retrieval system to solve real-world citizen challenges (e.g., arsenic water contamination, crop failure, telemedicine access).

```
                      ┌─────────────────────────────────────────────────────────┐
                      │              ACADEMIC WEB SURFACE                       │
                      │  (IIT ISM, BIT Mesra, NIT Jsr, BAU Ranchi, AIIMS Deoghar)│
                      └─────────────────────────────────────────────────────────┘
                                                   │
                                                   ▼
                               ┌───────────────────────────────────────┐
                               │  PHASE 1: SAFE ASYNC CRAWLER ENGINE   │
                               │  - SSRF Protection (RFC 1918/3927)    │
                               │  - Robots.txt Parser & Rate Limiter   │
                               │  - URL Canonicalizer & Sitemap Scraper│
                               │  - Trafilatura Clean Markdown Parser  │
                               │  - SHA-256 + ETag Delta Change Track  │
                               └───────────────────────────────────────┘
                                                   │
                                                   ▼
                               ┌───────────────────────────────────────┐
                               │    DATABASE SINK: crawled_pages       │
                               │    (Snapshots, Hashes, Metadata)      │
                               └───────────────────────────────────────┘
                                                   │
                                                   ▼
                               ┌───────────────────────────────────────┐
                               │  PHASE 2: LANGGRAPH EXTRACTION GRAPH  │
                               │  - StateGraph Page Classifier         │
                               │  - Structured Faculty Extractor       │
                               │  - Structured Lab & Facility Extractor│
                               │  - Pydantic / Instructor Validation   │
                               └───────────────────────────────────────┘
                                                   │
                                                   ▼
                               ┌───────────────────────────────────────┐
                               │  PHASE 3: EVIDENCE & CAPABILITY GRAPH │
                               │  - Ontology Linker (3-Tier Taxonomy)  │
                               │  - Evidence Claim Provenance (>0.90)  │
                               │  - Capacity Quota Tracker             │
                               └───────────────────────────────────────┘
                                                   │
                                                   ▼
                               ┌───────────────────────────────────────┐
                               │  PHASE 4: HYBRID VECTOR & EMBEDDINGS  │
                               │  - BGE-M3 Multilingual Embeddings     │
                               │  - Supabase pgvector HNSW Indexing    │
                               │  - BM25 Full-Text Search Fusion       │
                               └───────────────────────────────────────┘
                                                   │
                                                   ▼
                               ┌───────────────────────────────────────┐
                               │  PHASE 5: DETERMINISTIC ROUTING ENGINE│
                               │  - Composite Multi-Factor Scoring     │
                               │  - Proximity Decay & Capacity Penalty │
                               │  - Explainable Evidence Dossier API   │
                               └───────────────────────────────────────┘
```

---

## 🏛️ 2. Top 5 Target Universities Profile & Ingestion Blueprint

| # | University | Code | District | Ingestion Targets & Priority Domains | Key High-Value URL Seeds |
| :-: | :--- | :--- | :--- | :--- | :--- |
| **1** | **IIT (ISM) Dhanbad** | `IIT_ISM_DHANBAD` | Dhanbad | • Environmental Science & Engg (ESE)<br>• Mining & Mineral Dressing<br>• Centre for Water Resources<br>• Robotics & Automation | `https://www.iitism.ac.in/depts/environmental-science`<br>`https://www.iitism.ac.in/depts/civil`<br>`https://www.iitism.ac.in/centres/water-centre` |
| **2** | **BIT Mesra** | `BIT_MESRA` | Ranchi | • Civil & Environmental Engg (CEE)<br>• Bio-Engineering & Biotech<br>• Remote Sensing & GIS<br>• Technology Business Incubator | `https://www.bitmesra.ac.in/cee`<br>`https://www.bitmesra.ac.in/biotech`<br>`https://www.bitmesra.ac.in/facilities` |
| **3** | **NIT Jamshedpur** | `NIT_JAMSHEDPUR` | Jamshedpur | • Civil Engineering (Soil & Structural)<br>• Metallurgical & Materials Engg<br>• Renewable Energy Research Centre | `https://www.nitjsr.ac.in/department/civil-engineering`<br>`https://www.nitjsr.ac.in/department/metallurgical-and-materials-engineering` |
| **4** | **Birsa Agricultural University** | `BAU_RANCHI` | Ranchi | • Soil Science & Agricultural Chemistry<br>• Agronomy & Crop Physiology<br>• Micro-Irrigation & Farm Machinery<br>• KVK Extension Centres | `https://www.bauranchi.org/ssac`<br>`https://www.bauranchi.org/agronomy`<br>`https://www.bauranchi.org/agri-engg` |
| **5** | **AIIMS Deoghar** | `AIIMS_DEOGHAR` | Deoghar | • Community Medicine & Public Health<br>• Microbiology & Waterborne Pathogens<br>• Diagnostic & Telemedicine Hub | `https://www.aiimsdeoghar.edu.in/departments/community-medicine`<br>`https://www.aiimsdeoghar.edu.in/facilities` |

---

## 🔒 3. Step 3 Implementation: Crawler Safety & Change Detection

### 3.1 Strict Security Architecture
1. **SSRF Guard (`ssrf.py`):**
   - Resolves target hostnames before connecting.
   - Forbids private IP subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`).
   - Forbids cloud metadata services (`169.254.169.254`, `fd00::/8`).
   - Re-evaluates redirects on every hop.
2. **Robots.txt & Politeness (`robots.py`):**
   - Enforces default 2-second crawl delay per domain.
   - Caches `robots.txt` rules per origin.
3. **Canonical Normalization (`normalizer.py`):**
   - Strips URL fragments (`#...`), tracking parameters (`utm_*`, `ref`), sorts query strings, lowercases domains.
4. **Delta Change Detection (`hash.py`):**
   - Computes `SHA-256` of clean text.
   - Compares with previous crawl snapshot. If hash matches $\rightarrow$ mark `UNCHANGED`, skip downstream LLM extraction (saves 85%+ compute and token costs).

---

## 🤖 4. Step 4 Implementation: LangGraph Extraction Graph

### 4.1 State Machine Graph
```python
from typing import TypedDict, Optional, List, Dict, Any
from langgraph.graph import StateGraph, END

class UniversityCrawlState(TypedDict):
    page_id: str
    university_code: str
    url: str
    raw_markdown: str
    page_type: Optional[str]               # FACULTY | LAB | DEPARTMENT | IRRELEVANT
    extracted_data: Optional[Dict[str, Any]]
    taxonomy_node_ids: List[str]
    evidence_claims: List[Dict[str, Any]]
    confidence_score: float
    validation_status: str

# Node Flow:
# [classify_page] -> Router -> [extract_faculty | extract_lab | extract_department]
#                            -> [map_taxonomy_ontology]
#                            -> [validate_evidence_claim]
#                            -> [persist_capability_graph] -> END
```

### 4.2 Verifiable Extraction Models
- Extracted records enforce strict **grounded truth**: every specialization or equipment entry is coupled with an exact text citation and page URL.

---

## 📐 5. Step 8 Implementation: Deterministic Multi-Criteria Routing Formula

For an incoming challenge $C$ and candidate institution $(U, D, F, L)$ (University, Department, Faculty, Lab):

$$\text{FinalRoutingScore} = w_1 S_{\text{taxonomy}} + w_2 S_{\text{vector}} + w_3 S_{\text{proximity}} + w_4 S_{\text{capacity}} + w_5 S_{\text{evidence}}$$

### Weighting Breakdown:
| Factor | Weight | Formulation / Criterion |
| :--- | :---: | :--- |
| **Taxonomy Match ($S_{\text{taxonomy}}$)** | **30%** | Exact level-3 match = `1.0`, parent sub-domain match = `0.7`, domain match = `0.4` |
| **Semantic Vector ($S_{\text{vector}}$)** | **30%** | BGE-M3 Cosine similarity between issue text and faculty/lab capability chunks |
| **Geographic Proximity ($S_{\text{proximity}}$)** | **15%** | $S_{\text{geo}} = \exp\left(-\frac{\text{Distance in km}}{120}\right)$ (Favoring local Jharkhand institutions) |
| **Capacity Availability ($S_{\text{capacity}}$)** | **15%** | $\max\left(0, 1 - \frac{\text{current\_active\_challenges}}{\text{max\_active\_challenges}}\right)$ |
| **Evidence Quality ($S_{\text{evidence}}$)** | **10%** | Average confidence score of backing `evidence_claims` ($>0.90$) |

---

## 📅 6. Phased Execution Roadmap

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: Step 3A — Crawler Infrastructure & 003 Schema         [TODAY]   │
│   • 003_crawler_schema.sql (crawl_configurations, crawled_pages)         │
│   • Seed Top 5 Jharkhand crawl configurations & seed targets             │
│   • Build ssrf.py, robots.py, normalizer.py, parser.py, engine.py        │
│   • Pilot crawl test on IIT (ISM) Dhanbad                                │
├──────────────────────────────────────────────────────────────────────────┤
│ PHASE 2: Step 3B — Batch Crawling for Top 5 Universities                 │
│   • Crawl BIT Mesra, NIT Jamshedpur, BAU Ranchi, AIIMS Deoghar           │
│   • Verify SHA-256 change detection and deduplication                   │
├──────────────────────────────────────────────────────────────────────────┤
│ PHASE 3: Step 4 — LangGraph Structured Extraction Pipeline               │
│   • Page Classifier Node + Faculty/Lab/Dept Extraction Nodes             │
│   • Grounded ontology mapping to expertise_taxonomy                      │
├──────────────────────────────────────────────────────────────────────────┤
│ PHASE 4: Step 6 & 7 — BGE-M3 Embeddings + Hybrid Routing API             │
│   • Chunking & pgvector indexing                                         │
│   • Multi-factor deterministic ranking endpoint (/api/v1/routing/match)  │
└──────────────────────────────────────────────────────────────────────────┘
```
