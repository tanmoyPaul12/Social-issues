# 🏛️ University Intelligent Pipeline & Recommendation Engine: Production Blueprint

**Author:** Senior AI & Distributed Systems Architect  
**Project:** SIH Societal Innovation & University Routing Microservice  
**Status:** Architectural Blueprint & Implementation Specification  
**Target Region:** Jharkhand Higher Education & Research Network  

---

## 🗺️ 1. Target Top 5–6 Universities in Jharkhand (Domain Coverage Matrix)

To provide **100% comprehensive coverage** for all citizen and government problem statements (water, mining, agriculture, public health, structural/civil infrastructure, and social management), we recommend these **Top 5 (+1)** core institutions:

```
                                    ┌─────────────────────────────────────────────────────────┐
                                    │    TOP 5 (+1) JHARKHAND RESEARCH & HEI NETWORK          │
                                    └─────────────────────────────────────────────────────────┘
                                                                 │
         ┌──────────────────┬───────────────────────┬────────────┴───────┬──────────────────────┬──────────────────┐
         ▼                  ▼                       ▼                    ▼                      ▼                  ▼
┌──────────────────┐ ┌──────────────┐      ┌─────────────────┐  ┌─────────────────┐    ┌──────────────┐   ┌──────────────┐
│  IIT ISM Dhanbad │ │  BIT Mesra   │      │ NIT Jamshedpur  │  │   BAU Ranchi    │    │ AIIMS Deoghar│   │XLRI Jamshedpur
│ (Mining/Earth/Env│ │(Water/Bio/CS)│      │(Mfg/Civil/Met)  │  │ (Agro/Soil/Irr) │    │(Health/Diag) │   │(Policy/Rural)│
└──────────────────┘ └──────────────┘      └─────────────────┘  └─────────────────┘    └──────────────┘   └──────────────┘
```

| # | University / Institute | Code | District | Core Excellence & Research Capabilities | Solvable Problem Domains |
| :-: | :--- | :--- | :--- | :--- | :--- |
| **1** | **IIT (ISM) Dhanbad** | `IIT_ISM_DHANBAD` | Dhanbad | Mining, Environmental Engg, Earth Sciences, Clean Coal, Water Remediation | Toxic groundwater, mining dust, mine collapse, mineral runoff |
| **2** | **BIT Mesra** | `BIT_MESRA` | Ranchi | Water Resources, Biotechnology, Remote Sensing & GIS, Space Engineering, TBI | Water supply, disease vector modeling, drone GIS mapping, incubation |
| **3** | **NIT Jamshedpur** | `NIT_JAMSHEDPUR` | Jamshedpur | Manufacturing, Metallurgical Materials, Structural & Civil Infrastructure | Bridge fractures, dam safety, industrial effluent, metal recycling |
| **4** | **Birsa Agricultural University** | `BAU_RANCHI` | Ranchi | Agronomy, Soil Chemistry, Micro-Irrigation, Crop Protection, KVKs | Crop failure, pest attack, drought, soil acidification, livestock disease |
| **5** | **AIIMS Deoghar** | `AIIMS_DEOGHAR` | Deoghar | Rural Healthcare, Clinical Diagnostics, Waterborne Pathogens, Telemedicine | Epidemic outbreaks, maternal healthcare, malnutrition, fluoride toxicity |
| **+1** | **XLRI Jamshedpur** | `XLRI_JAMSHEDPUR` | Jamshedpur | Social Entrepreneurship, Public Policy, Rural Management, Tribal Supply Chain | Public distribution logistics, rural SHG market access, policy bottlenecks |

---

## 🏗️ 2. Full-Stack Architectural Integrity & Flow

```
[ Frontend: Next.js 16 ]
       │
       │ (1. POST /api/issues or Search Query)
       ▼
[ Edge Gateway: Spring Cloud Gateway (Port 8080) ]
       │
       ├─────────────────────────────────┐
       │ (2A. Route to Spring Boot)      │ (2B. Direct /api/ai/** route)
       ▼                                 ▼
[ Backend: Java Spring Boot (Port 8080) ] [ FastAPI AI Microservice (Port 8000/8002) ]
       │                                              ▲
       │ (3. POST /api/v1/routing/recommend)         │
       └──────────────────────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
[ Supabase PostgreSQL (Relational) ]   [ pgvector (Vector Embeddings) ]
 • universities, departments, faculty   • BGE-M3 (1024-dim dense vectors)
 • facilities, research/incubation hubs • HNSW index (Cosine distance)
 • expertise_taxonomy, evidence_claims  • Chunk metadata & entity mapping
```

### Component Integrity Matrix:
1. **Frontend (`frontend/web`):** Next.js 16 (Turbopack) provides citizen issue submission forms and interactive University Routing Dossiers with evidence badges.
2. **API Gateway (`api-gateway`):** Routes edge requests, handles CORS, rate-limiting, and forwards `/api/ai/**` directly to the AI service or via Spring Boot.
3. **Backend Service (`backend`):** `AiServiceClient.java` triggers the intelligence processing and routes verified challenges to academic institutions.
4. **AI Microservice (`ai-service`):** FastAPI asynchronous service running the Crawler, LangGraph Extractor, BGE-M3 Embedder, and Multi-Factor Routing Engine.

---

## 🗄️ 3. Database Architecture: Relational vs Vector Format in Supabase

Your database utilizes **Hybrid Relational + Vector Storage**:

### 3.1 Relational Core (Already Built in Migrations 001 & 002)
- **Entities:** `universities`, `departments`, `faculty`, `research_centres`, `facilities`, `innovation_centres`, `incubation_centres`.
- **Ontology Tree:** `expertise_taxonomy` (3-tier self-referencing tree) + `expertise_aliases`.
- **Capability Graph (7 Junction Tables):** `faculty_expertise`, `facility_expertise`, `department_expertise`, `university_expertise`, `research_centre_expertise`, `innovation_centre_expertise`, `incubation_centre_expertise`.
- **Audit & Provenance:** `evidence_claims` (Stores verbatim quotes, URLs, verification status, and confidence scores).

### 3.2 Crawler & Storage Tables (Migration 003 — Required)
```sql
-- Per-University Crawl Configuration
CREATE TABLE IF NOT EXISTS crawl_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    base_url VARCHAR(500) NOT NULL,
    allowed_domains TEXT[] NOT NULL,
    max_depth INT NOT NULL DEFAULT 3,
    crawl_delay_seconds INT NOT NULL DEFAULT 2,
    max_pages INT NOT NULL DEFAULT 300,
    sitemap_url VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Priority Seeds (Faculty lists, lab directories, department hubs)
CREATE TABLE IF NOT EXISTS crawl_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    url VARCHAR(1000) NOT NULL,
    target_type VARCHAR(50) NOT NULL CHECK (target_type IN ('FACULTY_DIRECTORY', 'DEPARTMENT_LIST', 'RESEARCH_CENTRE', 'LAB_DIRECTORY', 'TBI')),
    priority INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crawled Page Snapshots & Hashes
CREATE TABLE IF NOT EXISTS crawled_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    url VARCHAR(1000) NOT NULL,
    canonical_url VARCHAR(1000) NOT NULL,
    page_type VARCHAR(50) NOT NULL DEFAULT 'UNCLASSIFIED',
    title VARCHAR(500),
    clean_text TEXT NOT NULL,
    content_hash VARCHAR(64) NOT NULL,  -- SHA-256 for delta change detection
    etag VARCHAR(255),
    http_status INT NOT NULL DEFAULT 200,
    extraction_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    crawled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_crawled_pages_url UNIQUE (university_id, canonical_url)
);
```

### 3.3 Vector Embeddings Store (Migration 004 — Required)
```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS university_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('FACULTY', 'FACILITY', 'DEPARTMENT', 'RESEARCH_CENTRE', 'INCUBATION_CENTRE')),
    entity_id UUID NOT NULL,
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    chunk_text TEXT NOT NULL,
    embedding vector(1024),  -- BGE-M3 dense vector dimensionality
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- HNSW Cosine Index for Sub-Millisecond Vector Retrieval
CREATE INDEX IF NOT EXISTS idx_uni_embeddings_hnsw 
ON university_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

---

## ⚙️ 4. End-to-End Crawler & Ingestion Pipeline

```
[ Target Seeds (Top 5 Univs) ]
               │
               ▼
   [ Safe Async Crawler ] ────► SSRF Guard (Block RFC 1918 & Cloud Metadata)
               │          ────► Robots.txt Politeness (2-sec delay)
               │          ────► Trafilatura Cleaner (HTML -> Semantic Markdown)
               ▼
    [ crawled_pages Table ] ──► SHA-256 Hash Comparison (Skip if unchanged)
               │
               ▼
  [ LangGraph Extraction ] ───► Page Classifier (FACULTY, LAB, DEPT)
               │          ───► Pydantic / Instructor Structured Extractor
               │          ───► Ontology Linker (Links to 3-tier Taxonomy)
               ▼
[ Capability Graph & Claims] ─► faculty, facilities, evidence_claims tables
               │
               ▼
  [ BGE-M3 Vector Store ] ────► pgvector embeddings_store with HNSW index
```

---

## 🧠 5. Multi-Criteria University Recommendation Engine

When a citizen query is received (e.g., *"Handpump arsenic poisoning and turbidity in Bokaro rural sector"*):

### Multi-Criteria Scoring Formula:
$$\text{Score}(U, F, L) = 0.30 \cdot S_{\text{taxonomy}} + 0.30 \cdot S_{\text{vector}} + 0.15 \cdot S_{\text{proximity}} + 0.15 \cdot S_{\text{capacity}} + 0.10 \cdot S_{\text{evidence}}$$

1. **Taxonomy Match ($30\%$):** Matches `Water Resources -> Groundwater -> Arsenic Remediation`.
2. **Vector Similarity ($30\%$):** Cosine match against faculty publication summaries & laboratory equipment capabilities in `pgvector`.
3. **Geographic Proximity ($15\%$):** Proximity decay favoring institutions close to Bokaro (IIT ISM Dhanbad = 42 km).
4. **Capacity Quota ($15\%$):** $\max\left(0, 1 - \frac{\text{current\_active}}{\text{max\_active}}\right)$.
5. **Evidence Provenance ($10\%$):** Requires official source URL, verbatim text snippet, and $>0.90$ confidence score.

---

## 🚀 6. Step-by-Step Implementation Roadmap

```text
┌───────────────────────────────────────────────────────────────────────────┐
│ STEP 1: Database Foundation & Capability Graph                  [DONE ✅] │
├───────────────────────────────────────────────────────────────────────────┤
│ STEP 2: Expertise Taxonomy & Synonyms                           [DONE ✅] │
├───────────────────────────────────────────────────────────────────────────┤
│ STEP 3: Crawler Schema (003) & Top 5 University Seed            [CURRENT] │
│   • Apply 003_crawler_schema.sql & 004_vector_embeddings.sql              │
│   • Seed crawl configs for IIT ISM, BIT Mesra, NIT Jsr, BAU, AIIMS        │
│   • Build safe crawler (ssrf.py, robots.py, normalizer.py, parser.py)     │
├───────────────────────────────────────────────────────────────────────────┤
│ STEP 4: LangGraph Extraction & Ontology Linking Engine          [NEXT]    │
├───────────────────────────────────────────────────────────────────────────┤
│ STEP 5: BGE-M3 Vector Embedding & pgvector Hybrid Retrieval     [NEXT]    │
├───────────────────────────────────────────────────────────────────────────┤
│ STEP 6: Multi-Criteria Recommendation API (/api/v1/routing/match) [FINAL] │
└───────────────────────────────────────────────────────────────────────────┘
```
