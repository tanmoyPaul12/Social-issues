-- ============================================================================
-- Migration: 001_university_schema.sql
-- Description: Foundation schema for University Routing Engine in Supabase PostgreSQL
-- Step: 1 of University Routing Engine
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Trigger Function for updated_at Auto-Update
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. Universities Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL DEFAULT 'Jharkhand',
    website VARCHAR(500) UNIQUE,
    latitude NUMERIC(9, 6) CHECK (latitude IS NULL OR (latitude >= -90.0 AND latitude <= 90.0)),
    longitude NUMERIC(9, 6) CHECK (longitude IS NULL OR (longitude >= -180.0 AND longitude <= 180.0)),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    max_active_challenges INT NOT NULL DEFAULT 30 CHECK (max_active_challenges >= 0),
    current_active_challenges INT NOT NULL DEFAULT 0 CHECK (current_active_challenges >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. Departments Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    website VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_departments_university_name UNIQUE (university_id, name)
);

-- ============================================================================
-- 5. Faculty Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS faculty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(150),
    email VARCHAR(255),
    phone VARCHAR(50),
    profile_url VARCHAR(500),
    has_phd BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_faculty_department_email UNIQUE (department_id, email)
);

-- ============================================================================
-- 6. Research Centres Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS research_centres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_research_centres_university_name UNIQUE (university_id, name)
);

-- ============================================================================
-- 7. Facilities / Labs Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    research_centre_id UUID REFERENCES research_centres(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_facilities_university_name UNIQUE (university_id, name)
);

-- ============================================================================
-- 8. Innovation Centres Table (Makerspaces, Incubation Hubs, E-Cells)
-- ============================================================================
CREATE TABLE IF NOT EXISTS innovation_centres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_innovation_centres_university_name UNIQUE (university_id, name)
);

-- ============================================================================
-- 9. Incubation Centres Table (e.g. TBI, Atal Incubation Centre)
-- ============================================================================
CREATE TABLE IF NOT EXISTS incubation_centres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_incubation_centres_university_name UNIQUE (university_id, name)
);

-- ============================================================================
-- 10. Expertise Taxonomy Table (Hierarchical Parent-Child Tree)
-- ============================================================================
CREATE TABLE IF NOT EXISTS expertise_taxonomy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES expertise_taxonomy(id) ON DELETE CASCADE,
    level INT NOT NULL DEFAULT 1 CHECK (level >= 1),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_expertise_taxonomy_parent_name UNIQUE NULLS NOT DISTINCT (parent_id, name)
);

-- ============================================================================
-- 11. Evidence Claims Table (Polymorphic Traceable Claims)
-- NOTE: entity_id is polymorphic (references faculty, university, facility, etc.)
-- and enforced at application/query level without fake cross-table foreign keys.
-- ============================================================================
CREATE TABLE IF NOT EXISTS evidence_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('UNIVERSITY', 'DEPARTMENT', 'FACULTY', 'RESEARCH_CENTRE', 'FACILITY', 'INNOVATION_CENTRE', 'INCUBATION_CENTRE')),
    entity_id UUID NOT NULL,
    field VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    source_url VARCHAR(1000),
    extracted_snippet TEXT,
    confidence_score NUMERIC(4, 3) NOT NULL DEFAULT 1.000 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    verification_status VARCHAR(50) NOT NULL DEFAULT 'CLAIM_EXTRACTED' CHECK (verification_status IN ('CLAIM_EXTRACTED', 'VERIFIED', 'REJECTED')),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 12. Performance & Query Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_universities_district ON universities(district);
CREATE INDEX IF NOT EXISTS idx_universities_state ON universities(state);
CREATE INDEX IF NOT EXISTS idx_universities_status ON universities(status);

CREATE INDEX IF NOT EXISTS idx_departments_university_id ON departments(university_id);
CREATE INDEX IF NOT EXISTS idx_departments_status ON departments(status);

CREATE INDEX IF NOT EXISTS idx_faculty_department_id ON faculty(department_id);
CREATE INDEX IF NOT EXISTS idx_faculty_email ON faculty(email);
CREATE INDEX IF NOT EXISTS idx_faculty_status ON faculty(status);
CREATE INDEX IF NOT EXISTS idx_faculty_is_active ON faculty(is_active);

CREATE INDEX IF NOT EXISTS idx_research_centres_university_id ON research_centres(university_id);
CREATE INDEX IF NOT EXISTS idx_facilities_university_id ON facilities(university_id);
CREATE INDEX IF NOT EXISTS idx_facilities_research_centre_id ON facilities(research_centre_id);

CREATE INDEX IF NOT EXISTS idx_innovation_centres_university_id ON innovation_centres(university_id);
CREATE INDEX IF NOT EXISTS idx_incubation_centres_university_id ON incubation_centres(university_id);

CREATE INDEX IF NOT EXISTS idx_expertise_taxonomy_parent_id ON expertise_taxonomy(parent_id);
CREATE INDEX IF NOT EXISTS idx_expertise_taxonomy_level ON expertise_taxonomy(level);

CREATE INDEX IF NOT EXISTS idx_evidence_claims_entity ON evidence_claims(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_evidence_claims_verification ON evidence_claims(verification_status);

-- ============================================================================
-- 13. Attach Automatic updated_at Triggers
-- ============================================================================
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT unnest(ARRAY[
        'universities',
        'departments',
        'faculty',
        'research_centres',
        'facilities',
        'innovation_centres',
        'incubation_centres',
        'expertise_taxonomy',
        'evidence_claims'
    ])
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS set_timestamp_%I ON %I;
            CREATE TRIGGER set_timestamp_%I
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION trigger_set_timestamp();',
            t, t, t, t
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;
