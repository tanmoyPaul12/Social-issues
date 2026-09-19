-- ============================================================================
-- Migration: 003_crawler_schema.sql
-- Description: Crawler configuration, high-value seed targets, and crawled pages storage
-- Step: 3 of University Routing Engine
-- ============================================================================

-- 1. Crawl Configurations Table (Per-University Crawling Rules)
CREATE TABLE IF NOT EXISTS crawl_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    base_url VARCHAR(500) NOT NULL,
    allowed_domains TEXT[] NOT NULL,
    max_depth INT NOT NULL DEFAULT 3 CHECK (max_depth >= 1 AND max_depth <= 5),
    crawl_delay_seconds NUMERIC(4, 2) NOT NULL DEFAULT 2.00 CHECK (crawl_delay_seconds >= 0.5),
    max_pages INT NOT NULL DEFAULT 300 CHECK (max_pages >= 10 AND max_pages <= 5000),
    sitemap_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(50) NOT NULL DEFAULT 'IDLE' CHECK (status IN ('IDLE', 'RUNNING', 'COMPLETED', 'FAILED', 'PAUSED')),
    last_crawled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_crawl_config_university UNIQUE (university_id)
);

-- 2. Crawl Priority Targets Table (Designated starting seeds)
CREATE TABLE IF NOT EXISTS crawl_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    url VARCHAR(1000) NOT NULL,
    target_type VARCHAR(50) NOT NULL DEFAULT 'FACULTY_DIRECTORY' CHECK (
        target_type IN ('FACULTY_DIRECTORY', 'DEPARTMENT_LIST', 'RESEARCH_CENTRE', 'LAB_DIRECTORY', 'TBI', 'GENERAL')
    ),
    priority INT NOT NULL DEFAULT 1 CHECK (priority >= 1 AND priority <= 10),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_crawl_targets_university_url UNIQUE (university_id, url)
);

-- 3. Crawled Pages Snapshot Table
CREATE TABLE IF NOT EXISTS crawled_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    url VARCHAR(1000) NOT NULL,
    canonical_url VARCHAR(1000) NOT NULL,
    page_type VARCHAR(50) NOT NULL DEFAULT 'UNCLASSIFIED' CHECK (
        page_type IN ('FACULTY', 'DEPARTMENT', 'RESEARCH_CENTRE', 'FACILITY', 'INNOVATION_CENTRE', 'INCUBATION_CENTRE', 'UNIVERSITY_PROFILE', 'GENERAL', 'UNCLASSIFIED', 'IRRELEVANT')
    ),
    title VARCHAR(500),
    clean_text TEXT NOT NULL,
    content_hash VARCHAR(64) NOT NULL,  -- Deterministic SHA-256 for delta change detection
    etag VARCHAR(255),
    http_status INT NOT NULL DEFAULT 200,
    depth INT NOT NULL DEFAULT 0,
    extraction_status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (
        extraction_status IN ('PENDING', 'PROCESSING', 'EXTRACTED', 'FAILED', 'SKIPPED_UNCHANGED')
    ),
    error_message TEXT,
    crawled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_crawled_pages_canonical UNIQUE (university_id, canonical_url)
);

-- 4. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_crawl_config_status ON crawl_configurations(status);
CREATE INDEX IF NOT EXISTS idx_crawl_config_active ON crawl_configurations(is_active);

CREATE INDEX IF NOT EXISTS idx_crawl_targets_uni ON crawl_targets(university_id);
CREATE INDEX IF NOT EXISTS idx_crawl_targets_priority ON crawl_targets(priority DESC);

CREATE INDEX IF NOT EXISTS idx_crawled_pages_uni ON crawled_pages(university_id);
CREATE INDEX IF NOT EXISTS idx_crawled_pages_hash ON crawled_pages(content_hash);
CREATE INDEX IF NOT EXISTS idx_crawled_pages_extraction ON crawled_pages(extraction_status);
CREATE INDEX IF NOT EXISTS idx_crawled_pages_page_type ON crawled_pages(page_type);

-- 5. Trigger for updated_at timestamps
CREATE OR REPLACE TRIGGER trg_crawl_configurations_updated_at
BEFORE UPDATE ON crawl_configurations
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE OR REPLACE TRIGGER trg_crawl_targets_updated_at
BEFORE UPDATE ON crawl_targets
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE OR REPLACE TRIGGER trg_crawled_pages_updated_at
BEFORE UPDATE ON crawled_pages
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
