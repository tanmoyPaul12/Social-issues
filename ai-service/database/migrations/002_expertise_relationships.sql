-- ============================================================================
-- University & Faculty Routing Engine - Step 2 Migration
-- Expertise Taxonomy Enhancement, Aliases, Capability Relationships & Evidence Tracing
-- ============================================================================

-- ============================================================================
-- 1. Enhance expertise_taxonomy with Constraints
-- Prevent self-parenting: parent_id != id
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_expertise_taxonomy_no_self_parent'
    ) THEN
        ALTER TABLE expertise_taxonomy 
        ADD CONSTRAINT chk_expertise_taxonomy_no_self_parent 
        CHECK (parent_id IS NULL OR parent_id != id);
    END IF;
END $$;

-- Ensure status is controlled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_expertise_taxonomy_status'
    ) THEN
        ALTER TABLE expertise_taxonomy 
        ADD CONSTRAINT chk_expertise_taxonomy_status 
        CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED'));
    END IF;
END $$;

-- ============================================================================
-- 2. Taxonomy Aliases / Synonyms Table
-- Supports multiple vernacular names, abbreviations, and normalized text
-- ============================================================================
CREATE TABLE IF NOT EXISTS expertise_aliases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expertise_id UUID NOT NULL REFERENCES expertise_taxonomy(id) ON DELETE CASCADE,
    alias VARCHAR(255) NOT NULL,
    language_code VARCHAR(10) NOT NULL DEFAULT 'en',
    normalized_alias VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_expertise_aliases_normalized UNIQUE (expertise_id, normalized_alias)
);

CREATE INDEX IF NOT EXISTS idx_expertise_aliases_expertise_id ON expertise_aliases(expertise_id);
CREATE INDEX IF NOT EXISTS idx_expertise_aliases_normalized ON expertise_aliases(normalized_alias);

-- ============================================================================
-- 3. Capability Relationship Tables (Entities <-> Expertise)
-- Supported entities:
--   1. university_expertise
--   2. department_expertise
--   3. faculty_expertise
--   4. research_centre_expertise
--   5. facility_expertise
--   6. innovation_centre_expertise
--   7. incubation_centre_expertise
-- ============================================================================

-- 3.1 University-Level Institutional Expertise
CREATE TABLE IF NOT EXISTS university_expertise (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    expertise_id UUID NOT NULL REFERENCES expertise_taxonomy(id) ON DELETE CASCADE,
    confidence_score NUMERIC(4, 3) NOT NULL DEFAULT 1.000 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    verification_status VARCHAR(50) NOT NULL DEFAULT 'UNVERIFIED' CHECK (verification_status IN ('UNVERIFIED', 'PARTIAL', 'VERIFIED')),
    evidence_claim_id UUID REFERENCES evidence_claims(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_university_expertise UNIQUE (university_id, expertise_id)
);

CREATE INDEX IF NOT EXISTS idx_uni_exp_university_id ON university_expertise(university_id);
CREATE INDEX IF NOT EXISTS idx_uni_exp_expertise_id ON university_expertise(expertise_id);
CREATE INDEX IF NOT EXISTS idx_uni_exp_verification ON university_expertise(verification_status);

-- 3.2 Department-Level Expertise
CREATE TABLE IF NOT EXISTS department_expertise (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    expertise_id UUID NOT NULL REFERENCES expertise_taxonomy(id) ON DELETE CASCADE,
    confidence_score NUMERIC(4, 3) NOT NULL DEFAULT 1.000 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    verification_status VARCHAR(50) NOT NULL DEFAULT 'UNVERIFIED' CHECK (verification_status IN ('UNVERIFIED', 'PARTIAL', 'VERIFIED')),
    evidence_claim_id UUID REFERENCES evidence_claims(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_department_expertise UNIQUE (department_id, expertise_id)
);

CREATE INDEX IF NOT EXISTS idx_dept_exp_department_id ON department_expertise(department_id);
CREATE INDEX IF NOT EXISTS idx_dept_exp_expertise_id ON department_expertise(expertise_id);
CREATE INDEX IF NOT EXISTS idx_dept_exp_verification ON department_expertise(verification_status);

-- 3.3 Faculty-Level Expertise
-- NOTE: Faculty reaches university via faculty -> department -> university.
CREATE TABLE IF NOT EXISTS faculty_expertise (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    expertise_id UUID NOT NULL REFERENCES expertise_taxonomy(id) ON DELETE CASCADE,
    confidence_score NUMERIC(4, 3) NOT NULL DEFAULT 1.000 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    verification_status VARCHAR(50) NOT NULL DEFAULT 'UNVERIFIED' CHECK (verification_status IN ('UNVERIFIED', 'PARTIAL', 'VERIFIED')),
    evidence_claim_id UUID REFERENCES evidence_claims(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_faculty_expertise UNIQUE (faculty_id, expertise_id)
);

CREATE INDEX IF NOT EXISTS idx_fac_exp_faculty_id ON faculty_expertise(faculty_id);
CREATE INDEX IF NOT EXISTS idx_fac_exp_expertise_id ON faculty_expertise(expertise_id);
CREATE INDEX IF NOT EXISTS idx_fac_exp_verification ON faculty_expertise(verification_status);

-- 3.4 Research Centre Expertise
CREATE TABLE IF NOT EXISTS research_centre_expertise (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    research_centre_id UUID NOT NULL REFERENCES research_centres(id) ON DELETE CASCADE,
    expertise_id UUID NOT NULL REFERENCES expertise_taxonomy(id) ON DELETE CASCADE,
    confidence_score NUMERIC(4, 3) NOT NULL DEFAULT 1.000 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    verification_status VARCHAR(50) NOT NULL DEFAULT 'UNVERIFIED' CHECK (verification_status IN ('UNVERIFIED', 'PARTIAL', 'VERIFIED')),
    evidence_claim_id UUID REFERENCES evidence_claims(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_research_centre_expertise UNIQUE (research_centre_id, expertise_id)
);

CREATE INDEX IF NOT EXISTS idx_rc_exp_rc_id ON research_centre_expertise(research_centre_id);
CREATE INDEX IF NOT EXISTS idx_rc_exp_expertise_id ON research_centre_expertise(expertise_id);
CREATE INDEX IF NOT EXISTS idx_rc_exp_verification ON research_centre_expertise(verification_status);

-- 3.5 Facility / Lab Expertise
CREATE TABLE IF NOT EXISTS facility_expertise (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    expertise_id UUID NOT NULL REFERENCES expertise_taxonomy(id) ON DELETE CASCADE,
    confidence_score NUMERIC(4, 3) NOT NULL DEFAULT 1.000 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    verification_status VARCHAR(50) NOT NULL DEFAULT 'UNVERIFIED' CHECK (verification_status IN ('UNVERIFIED', 'PARTIAL', 'VERIFIED')),
    evidence_claim_id UUID REFERENCES evidence_claims(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_facility_expertise UNIQUE (facility_id, expertise_id)
);

CREATE INDEX IF NOT EXISTS idx_facil_exp_facility_id ON facility_expertise(facility_id);
CREATE INDEX IF NOT EXISTS idx_facil_exp_expertise_id ON facility_expertise(expertise_id);
CREATE INDEX IF NOT EXISTS idx_facil_exp_verification ON facility_expertise(verification_status);

-- 3.6 Innovation Centre Expertise
CREATE TABLE IF NOT EXISTS innovation_centre_expertise (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    innovation_centre_id UUID NOT NULL REFERENCES innovation_centres(id) ON DELETE CASCADE,
    expertise_id UUID NOT NULL REFERENCES expertise_taxonomy(id) ON DELETE CASCADE,
    confidence_score NUMERIC(4, 3) NOT NULL DEFAULT 1.000 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    verification_status VARCHAR(50) NOT NULL DEFAULT 'UNVERIFIED' CHECK (verification_status IN ('UNVERIFIED', 'PARTIAL', 'VERIFIED')),
    evidence_claim_id UUID REFERENCES evidence_claims(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_innovation_centre_expertise UNIQUE (innovation_centre_id, expertise_id)
);

CREATE INDEX IF NOT EXISTS idx_innov_exp_innov_id ON innovation_centre_expertise(innovation_centre_id);
CREATE INDEX IF NOT EXISTS idx_innov_exp_expertise_id ON innovation_centre_expertise(expertise_id);
CREATE INDEX IF NOT EXISTS idx_innov_exp_verification ON innovation_centre_expertise(verification_status);

-- 3.7 Incubation Centre Expertise
CREATE TABLE IF NOT EXISTS incubation_centre_expertise (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incubation_centre_id UUID NOT NULL REFERENCES incubation_centres(id) ON DELETE CASCADE,
    expertise_id UUID NOT NULL REFERENCES expertise_taxonomy(id) ON DELETE CASCADE,
    confidence_score NUMERIC(4, 3) NOT NULL DEFAULT 1.000 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    verification_status VARCHAR(50) NOT NULL DEFAULT 'UNVERIFIED' CHECK (verification_status IN ('UNVERIFIED', 'PARTIAL', 'VERIFIED')),
    evidence_claim_id UUID REFERENCES evidence_claims(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_incubation_centre_expertise UNIQUE (incubation_centre_id, expertise_id)
);

CREATE INDEX IF NOT EXISTS idx_incub_exp_incub_id ON incubation_centre_expertise(incubation_centre_id);
CREATE INDEX IF NOT EXISTS idx_incub_exp_expertise_id ON incubation_centre_expertise(expertise_id);
CREATE INDEX IF NOT EXISTS idx_incub_exp_verification ON incubation_centre_expertise(verification_status);

-- ============================================================================
-- 4. Attach Automatic updated_at Triggers for New Tables
-- ============================================================================
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT unnest(ARRAY[
        'expertise_aliases',
        'university_expertise',
        'department_expertise',
        'faculty_expertise',
        'research_centre_expertise',
        'facility_expertise',
        'innovation_centre_expertise',
        'incubation_centre_expertise'
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
