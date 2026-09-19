-- ============================================================================
-- Migration: 005_vector_e5_small_and_versions.sql
-- Description: Align pgvector embedding dimensions to 384-d for multilingual-e5-small
--              and create entity_versions audit table.
-- Step: 5 of University Routing Engine
-- ============================================================================

-- 1. Ensure pgvector extension is present
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Alter embedding vector dimension to 384 in university_embeddings
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'university_embeddings' AND column_name = 'embedding'
    ) THEN
        ALTER TABLE university_embeddings ALTER COLUMN embedding TYPE vector(384);
    END IF;
END $$;

-- Re-create HNSW index for 384-d cosine similarity search
DROP INDEX IF EXISTS idx_university_embeddings_hnsw;
CREATE INDEX IF NOT EXISTS idx_university_embeddings_hnsw 
ON university_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 3. Entity Versions Audit Table
CREATE TABLE IF NOT EXISTS entity_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL CHECK (
        entity_type IN ('UNIVERSITY', 'DEPARTMENT', 'FACULTY', 'RESEARCH_CENTRE', 'FACILITY', 'INNOVATION_CENTRE', 'INCUBATION_CENTRE', 'EVIDENCE')
    ),
    entity_id UUID NOT NULL,
    version_number INT NOT NULL DEFAULT 1 CHECK (version_number >= 1),
    field_name VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    parser_version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    extraction_version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entity_versions_lookup ON entity_versions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_versions_university ON entity_versions(university_id);
