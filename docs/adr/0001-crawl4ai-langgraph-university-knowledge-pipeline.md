# ADR-0001: Hybrid Crawl4AI Rendering + LangGraph Extraction Pipeline for University Knowledge Base

## Status

**Accepted**

## Context

For the SIH Societal Innovation Platform, we need to build an automated, comprehensive, and fault-tolerant University Knowledge Base covering the Top 5 Premier Jharkhand Higher Education Institutions (HEIs):
1. **IIT (ISM) Dhanbad**
2. **BIT Mesra**
3. **NIT Jamshedpur**
4. **Birsa Agricultural University (BAU) Ranchi**
5. **AIIMS Deoghar**

The system must automatically ingest academic departments, faculty rosters, research centers (CoEs), technology business incubators (TBIs), and specialized testing laboratories across all 9 societal challenge domains specified in `project.md`.

University web portals in India present specific architectural challenges:
- Highly varied architectures (static HTML tables, WordPress, React/Angular SPAs, AJAX tabs, nested department subdomains).
- Complex relational hierarchies (University $\rightarrow$ Department $\rightarrow$ Faculty / Laboratory $\rightarrow$ 9-Domain Taxonomy Tags).
- Strict non-functional requirements: scraping politeness (robots.txt, $\ge 2$s delay), anti-SSRF security, deterministic change detection, markdown exports for documentation, and zero hallucination relational database storage.

## Decision Drivers

* **Must render both static and dynamic JS-rendered academic portals** (React/Angular/WordPress tabs).
* **Must guarantee relational integrity** (foreign keys across `universities`, `departments`, `faculty_profiles`, `laboratories`, `incubation_centers`).
* **Must prevent hallucinations** with strict schema validation and source URL citations.
* **Must map all extracted entities to the 9 Societal Challenge Domains** from `project.md`.
* **Must output human-readable Markdown files** into `docs/knowledge_base/universities/` and populate Postgres/Supabase tables.
* **Must generate 1024-dim BGE-M3 vector embeddings** with pgvector HNSW indexing for citizen issue semantic matching.

## Considered Options

### Option 1: Pure Scrapy / Beautiful Soup Spider
- **Pros**: Fast, lightweight, mature Python framework.
- **Cons**: Cannot render dynamic JavaScript SPAs without complex Splash/Selenium integrations; rigid XPath/CSS selectors break whenever a university redesigns its portal; lacks native LLM extraction intelligence.

### Option 2: Pure Crawl4AI with In-Scraper Extraction
- **Pros**: Excellent headless browser rendering (Playwright), clean markdown chunking, handles dynamic DOM.
- **Cons**: Single-pass extraction lacks state machine capabilities needed for relational multi-table foreign-key resolution, cross-page entity linking, and recursive multi-step domain validation.

### Option 3 (Chosen): Hybrid Crawl4AI Rendering Fetcher + LangGraph Extraction Pipeline
- **Pros**: 
  - **Crawl4AI** provides rock-solid headless rendering for dynamic/SPA academic pages and extracts pristine markdown without ads/scripts.
  - **LangGraph** provides a cyclical state machine that classifies page types, executes schema-enforced Pydantic extraction (via Gemini/Groq), maps to the 9-domain taxonomy, resolves relational foreign keys in Postgres, and triggers BGE-M3 vector embedding.
  - Generates both live Postgres/Supabase records and clean offline Markdown knowledge files in `docs/knowledge_base/universities/`.
- **Cons**: Slightly higher system complexity than a single script, requiring LLM API keys and Playwright dependencies.

## Decision

We will implement **Option 3: Hybrid Crawl4AI Rendering Fetcher + LangGraph Extraction Pipeline**.

## Architecture & Workflow

```text
[ Seed Academic URLs ] (Dept, CoE, TBI, Faculty)
          │
          ▼
┌────────────────────────────────────────────────────────┐
│ STAGE 1: CRAWL4AI / ASYNC SAFE CRAWLER                 │
│ - Playwright Headless Browser Rendering (SPA Support)  │
│ - Anti-SSRF & 2s Rate Limiter                          │
│ - Content Delta Hashing (SHA-256)                      │
│ - Trafilatura + DOM Table Extraction                   │
└──────────────────────────┬─────────────────────────────┘
                           │ Clean Markdown & Tables
                           ▼
┌────────────────────────────────────────────────────────┐
│ STAGE 2: LANGGRAPH EXTRACTION STATE MACHINE            │
│                                                        │
│  [Node 1: Page Classifier]                             │
│       │ (FACULTY | DEPARTMENT | RESEARCH_COE | TBI)    │
│       ▼                                                │
│  [Node 2: Structured Entity Extractor]                 │
│       │ (Strict Pydantic Schemas via LLM)              │
│       ▼                                                │
│  [Node 3: 9-Domain Taxonomy Mapper]                    │
│       │ (Rule + Semantic Domain Tagging)               │
│       ▼                                                │
│  [Node 4: Relational Foreign-Key Resolver]             │
│       │ (Resolves & Upserts DB Records)                │
│       ▼                                                │
│  [Node 5: BGE-M3 Vector Embedder]                      │
│         (Generates 1024-dim pgvector HNSW embeddings)  │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
┌─────────────────────────┐ ┌──────────────────────────┐
│ MARKDOWN EXPORT ENGINE  │ │ SUPABASE / POSTGRES DB   │
│ docs/knowledge_base/    │ │ - departments            │
│   universities/         │ │ - faculty_profiles       │
│   ├── IIT_ISM_DHANBAD/  │ │ - research_centers       │
│   ├── BIT_MESRA/        │ │ - incubation_centers     │
│   ├── NIT_JAMSHEDPUR/   │ │ - laboratories           │
│   ├── BAU_RANCHI/       │ │ - university_embeddings  │
│   └── AIIMS_DEOGHAR/    │ └──────────────────────────┘
└─────────────────────────┘
```

## Consequences

### Positive
- **100% Comprehensive Coverage**: Ingests all academic disciplines, labs, TBIs, and faculty profiles without being restricted to a single domain.
- **Dynamic Portals Handled**: Crawl4AI/Playwright renders modern React/Angular university portals seamlessly.
- **Relational Integrity**: LangGraph ensures professors link to existing departments, and departments link to the parent university.
- **Dual Output**: Populates the live Supabase/Postgres database while also exporting structured Markdown files directly to the codebase documentation (`docs/knowledge_base/universities/`).
- **Multilingual Semantic Retrieval**: Ready for immediate BGE-M3 vector search for citizen problem routing.

### Negative
- Requires `playwright install` browser binaries on deployment containers.
- LLM token consumption managed through SHA-256 delta hashing (pages only re-extracted when modified).

## Implementation Commands

```bash
# 1. Install headless browser dependencies
playwright install chromium

# 2. Run targeted extraction and generate Markdown knowledge base
python scripts/extract_university_knowledge.py --all --export-markdown

# 3. Ingest extracted entities into Supabase / Postgres and create embeddings
python scripts/extract_university_knowledge.py --all --sync-db

# 4. Run extraction for a single university (e.g. IIT ISM Dhanbad)
python scripts/extract_university_knowledge.py --code IIT_ISM_DHANBAD --export-markdown
```

## References
- `project.md` (9 Societal Challenge Domains and System Goals)
- `docs/fault_tolerant_university_crawler_pipeline.md`
- `ai-service/database/migrations/001_university_schema.sql`
- `ai-service/database/migrations/003_crawler_schema.sql`
- `ai-service/database/migrations/004_vector_embeddings.sql`
