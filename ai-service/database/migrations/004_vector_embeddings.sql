-- ============================================================================
-- Migration: 004_vector_embeddings.sql
-- Description: pgvector schema for BGE-M3 1024-dimensional semantic embeddings
-- Step: 4/6 of University Routing Engine
-- ============================================================================

-- 1. Ensure pgvector extension is enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Embeddings Store Table
CREATE TABLE IF NOT EXISTS university_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL CHECK (
        entity_type IN ('FACULTY', 'FACILITY', 'DEPARTMENT', 'RESEARCH_CENTRE', 'INNOVATION_CENTRE', 'INCUBATION_CENTRE', 'UNIVERSITY')
    ),
    entity_id UUID NOT NULL,
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    crawled_page_id UUID REFERENCES crawled_pages(id) ON DELETE SET NULL,
    chunk_text TEXT NOT NULL,
    embedding vector(1024), -- BGE-M3 dense multilingual vector representation
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. HNSW Index for High-Performance Vector Similarity Search
CREATE INDEX IF NOT EXISTS idx_university_embeddings_hnsw 
ON university_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 4. Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_uni_embed_entity ON university_embeddings(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_uni_embed_university_id ON university_embeddings(university_id);
CREATE INDEX IF NOT EXISTS idx_uni_embed_page_id ON university_embeddings(crawled_page_id);

-- 5. Auto-update Trigger
CREATE OR REPLACE TRIGGER trg_university_embeddings_updated_at
BEFORE UPDATE ON university_embeddings
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
