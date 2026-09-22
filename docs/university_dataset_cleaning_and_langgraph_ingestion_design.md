# University Dataset Cleaning & LangGraph Ingestion Design

## 1. Architectural Overview

The goal of this pipeline is to transform noisy, raw crawled web data into high-quality, structured Knowledge Base (KB) Markdown files, while simultaneously backfilling relevant metadata into the Supabase database. 

We will use **LangGraph** to orchestrate this workflow as a state machine. The pipeline consists of four main phases:

1. **Noise Reduction (Markdown Cleaning)**
2. **Content Categorization**
3. **Knowledge Base (Markdown) Storage**
4. **Structured Metadata Extraction & Supabase Backfill**

---

## 2. Phase 1: Markdown Cleaning (Noise Reduction)
Raw crawled data often contains navigation bars, footer links, inline scripts, and repetitive sidebars. 

**Approach:**
- **Heuristic Pre-processing:** Use Regex and DOM tree analysis (if using HTML) to strip obvious boilerplate (e.g., `<nav>`, `<footer>`, repeating header links).
- **LLM-Powered Cleaning Node:** Pass the raw markdown through a lightweight LLM prompt designed to "extract only the primary semantic content." 
- **Output:** A clean, readable Markdown string containing only the core content (paragraphs, lists, tables) relevant to the page's actual topic.

---

## 3. Phase 2: Content Categorization
Once the Markdown is clean, the next LangGraph node analyzes the text to determine its primary category. Based on your requirements, we will classify the content into one of **five core categories**:

1. **`overview`**: General information about the university or department, history, vision, and mission.
2. **`faculties`**: Faculty profiles, academic staff directories, and bios.
3. **`laboratory`**: Information regarding facilities, labs, equipment, and testing centers.
4. **`research`**: Research centers (CoEs), ongoing projects, publications, and patents.
5. **`inquiry`**: Incubation centers, innovation hubs, admission inquiries, and contact directories.

**Approach:**
- Use an LLM with a strict JSON output schema (or function calling) to classify the document into one of these buckets.

---

## 4. Phase 3: Knowledge Base Storage (Markdown)
After categorization, the clean Markdown is saved directly to the local file system. This acts as the vector-searchable Knowledge Base for the AI system.

**Directory Structure Design:**
```text
docs/knowledge_base/universities/
└── {UNIVERSITY_CODE}/
    ├── overview/
    │   └── department_of_computer_science.md
    ├── faculties/
    │   └── dr_john_doe_profile.md
    ├── laboratory/
    │   └── advanced_computing_lab.md
    ├── research/
    │   └── center_of_excellence_ai.md
    └── inquiry/
        └── innovation_incubation_hub.md
```
- The files will be formatted cleanly, utilizing frontmatter (YAML) for basic metadata (URL source, crawl date) and standard Markdown for the body.

---

## 5. Phase 4: Structured Data Extraction & Supabase Backfill
In parallel with saving the Markdown, the system needs to extract structured relational data to populate the Supabase backend. This ensures the frontend dashboard and relational queries have access to the metadata.

**Approach:**
- **Extraction Node:** Based on the category determined in Phase 2, the clean markdown is passed to a specific Pydantic extraction model.
  - *If `faculties`:* Extract `name`, `designation`, `email`, `profile_url`.
  - *If `laboratory`:* Extract `lab_name`, `testing_capabilities`, `key_equipment`.
  - *If `research`:* Extract `center_name`, `thrust_areas`.
- **Database Sync:** Use the existing `DatabaseClient` to perform `UPSERT` operations into the Supabase tables (`departments`, `faculty`, `facilities`, `research_centres`, `incubation_centres`).

---

## 6. LangGraph State Schema
To implement this, the LangGraph state will carry the document through the nodes:

```python
class ProcessingState(TypedDict):
    source_url: str
    raw_markdown: str
    clean_markdown: Optional[str]
    category: Optional[str]        # overview, faculties, laboratory, research, inquiry
    extracted_entities: Optional[Dict]
    status: str                    # PENDING, CLEANED, CATEGORIZED, STORED, FAILED
    error_log: Optional[str]
```

## Summary of Execution Flow
1. **Crawl Script** fetches raw HTML/Markdown.
2. Invokes **LangGraph Workflow**.
3. **Node 1 (Cleaner)** strips netbars and footers -> Updates `clean_markdown`.
4. **Node 2 (Categorizer)** classifies into the 5 categories -> Updates `category`.
5. **Node 3 (File Saver)** writes `clean_markdown` to the `docs/knowledge_base/...` hierarchy.
6. **Node 4 (Extractor & DB Sync)** extracts Pydantic metadata and runs SQL `UPSERT` to Supabase.
