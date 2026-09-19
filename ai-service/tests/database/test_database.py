"""
Integration Tests for University Routing Database Foundation (Step 1).
Security & Quality Hardened.
Verifies:
- Supabase PostgreSQL connection
- pgvector extension presence
- Foundation table availability
- Relational integrity & taxonomy hierarchy
- faculty -> department -> university traversal
- updated_at trigger behavior on row update
- Constraints enforcement: coordinates, confidence_score, verification_status
- Evidence claims polymorphic storage
"""
import time
import pytest
import psycopg2
from app.infrastructure.database.client import get_db_cursor, execute_query
from app.infrastructure.database.health import check_database_connection


def test_database_connection_health():
    """Verify check_database_connection reports healthy status without leaking secrets."""
    health = check_database_connection()
    assert health["status"] == "healthy", f"Database health check failed: {health.get('error')}"
    assert health["database"] == "PostgreSQL"
    assert health["latency_ms"] > 0
    assert health["server_version"] is not None
    # Security check: ensure no password appears in health output
    assert "password" not in str(health).lower()


def test_pgvector_extension_exists():
    """Verify that the pgvector extension is installed and active."""
    with get_db_cursor(commit=False, dict_cursor=True) as cur:
        cur.execute("SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';")
        row = cur.fetchone()
        assert row is not None, "pgvector extension is not installed in database!"
        assert row["extname"] == "vector"
        assert row["extversion"] is not None


def test_required_foundation_tables_exist():
    """Verify all 9 foundation tables exist in the public schema."""
    expected_tables = [
        "universities",
        "departments",
        "faculty",
        "research_centres",
        "facilities",
        "innovation_centres",
        "incubation_centres",
        "expertise_taxonomy",
        "evidence_claims"
    ]

    with get_db_cursor(commit=False, dict_cursor=True) as cur:
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
              AND table_name = ANY(%s);
        """, (expected_tables,))
        found_tables = {row["table_name"] for row in cur.fetchall()}

    for table in expected_tables:
        assert table in found_tables, f"Expected table '{table}' does not exist in database!"


def test_faculty_department_university_relationship():
    """
    Verify faculty reaches its university strictly through:
    faculty -> department -> university (NO direct university_id on faculty).
    """
    rows = execute_query("""
        SELECT 
            f.id AS faculty_id,
            f.name AS faculty_name,
            d.id AS department_id,
            d.name AS department_name,
            u.id AS university_id,
            u.name AS university_name,
            u.code AS university_code
        FROM faculty f
        JOIN departments d ON f.department_id = d.id
        JOIN universities u ON d.university_id = u.id
        WHERE u.code = 'TEST_BIT_MESRA';
    """)
    assert len(rows) >= 1, "Should traverse faculty -> department -> university."
    rec = rows[0]
    assert rec["university_code"] == "TEST_BIT_MESRA"
    assert rec["faculty_name"] is not None
    assert rec["department_name"] is not None


def test_expertise_taxonomy_hierarchical_structure():
    """Verify parent-child relationships in the expertise_taxonomy table."""
    rows = execute_query("""
        SELECT parent.name AS parent_name, child.name AS child_name, child.level
        FROM expertise_taxonomy child
        JOIN expertise_taxonomy parent ON child.parent_id = parent.id
        WHERE child.name = 'Groundwater Systems & Hydrogeology';
    """)
    assert len(rows) == 1, "Groundwater Systems should have a parent taxonomy node."
    assert rows[0]["parent_name"] == "Water Resources & Environmental Engineering"
    assert rows[0]["level"] == 2


def test_evidence_claims_polymorphic_referencing():
    """Verify evidence claims correctly store polymorphic entity references."""
    claims = execute_query("""
        SELECT entity_type, field, confidence_score, verification_status, value
        FROM evidence_claims
        WHERE verification_status = 'VERIFIED';
    """)
    assert len(claims) >= 2, "There should be at least two verified claims seeded."
    types = {c["entity_type"] for c in claims}
    assert "FACULTY" in types, "Evidence claim for FACULTY must exist."
    assert "FACILITY" in types, "Evidence claim for FACILITY must exist."


def test_updated_at_trigger_advances_on_update():
    """Verify that updated_at trigger automatically advances when a row is updated."""
    with get_db_cursor(commit=True, dict_cursor=True) as cur:
        # 1. Fetch initial timestamps
        cur.execute("SELECT id, created_at, updated_at FROM universities WHERE code = 'TEST_BIT_MESRA';")
        before = cur.fetchone()
        assert before is not None, "TEST_BIT_MESRA university must exist."
        
        # 2. Update a field after a small pause
        time.sleep(0.05)
        cur.execute("""
            UPDATE universities 
            SET current_active_challenges = current_active_challenges + 1
            WHERE id = %s
            RETURNING updated_at;
        """, (before["id"],))
        after = cur.fetchone()
        
        # 3. Check updated_at advanced
        assert after["updated_at"] > before["updated_at"], "updated_at must advance upon UPDATE."


def test_constraints_prevent_invalid_latitude():
    """Verify check constraint rejects latitude outside [-90, 90]."""
    with pytest.raises(psycopg2.IntegrityError):
        with get_db_cursor(commit=True) as cur:
            cur.execute("""
                INSERT INTO universities (name, code, district, latitude, longitude)
                VALUES ('[TEST] Bad Lat', 'TEST_BAD_LAT', 'Ranchi', 120.0, 85.0);
            """)


def test_constraints_prevent_invalid_longitude():
    """Verify check constraint rejects longitude outside [-180, 180]."""
    with pytest.raises(psycopg2.IntegrityError):
        with get_db_cursor(commit=True) as cur:
            cur.execute("""
                INSERT INTO universities (name, code, district, latitude, longitude)
                VALUES ('[TEST] Bad Lon', 'TEST_BAD_LON', 'Ranchi', 23.4, 250.0);
            """)


def test_constraints_prevent_invalid_confidence_score():
    """Verify check constraint rejects confidence_score outside [0.0, 1.0]."""
    with pytest.raises(psycopg2.IntegrityError):
        with get_db_cursor(commit=True) as cur:
            cur.execute("""
                INSERT INTO evidence_claims (
                    entity_type, entity_id, field, value, confidence_score
                )
                VALUES (
                    'FACULTY', gen_random_uuid(), 'test_field', 'test_val', 1.850
                );
            """)


def test_constraints_prevent_invalid_verification_status():
    """Verify check constraint rejects non-allowed verification_status enum strings."""
    with pytest.raises(psycopg2.IntegrityError):
        with get_db_cursor(commit=True) as cur:
            cur.execute("""
                INSERT INTO evidence_claims (
                    entity_type, entity_id, field, value, verification_status
                )
                VALUES (
                    'FACULTY', gen_random_uuid(), 'test_field', 'test_val', 'UNAUTHORIZED_STATUS'
                );
            """)


# ============================================================================
# Step 2 Tests: Expertise Taxonomy, Aliases, Capability Relationships & Evidence
# ============================================================================

def test_taxonomy_parent_child_relationship():
    """Verify taxonomy parent-child relationship query traverses correctly."""
    rows = execute_query("""
        SELECT p.name AS domain, c.name AS subdomain, c.level
        FROM expertise_taxonomy c
        JOIN expertise_taxonomy p ON c.parent_id = p.id
        WHERE c.name = 'Hydrology';
    """)
    assert len(rows) == 1, "Hydrology must have a parent domain."
    assert rows[0]["domain"] == "Water Resources"
    assert rows[0]["level"] == 2


def test_taxonomy_sibling_uniqueness():
    """Verify unique constraint prevents duplicate sibling nodes under same parent."""
    # Find Water Resources parent id
    rows = execute_query("SELECT id FROM expertise_taxonomy WHERE name = 'Water Resources' AND parent_id IS NULL;")
    assert len(rows) == 1
    parent_id = rows[0]["id"]

    with pytest.raises(psycopg2.IntegrityError):
        with get_db_cursor(commit=True) as cur:
            cur.execute("""
                INSERT INTO expertise_taxonomy (name, parent_id, level)
                VALUES ('Hydrology', %s, 2);
            """, (parent_id,))


def test_taxonomy_self_parent_prevention():
    """Verify check constraint prevents a taxonomy node from being its own parent."""
    with pytest.raises(psycopg2.IntegrityError):
        with get_db_cursor(commit=True) as cur:
            # Create a test node first
            cur.execute("""
                INSERT INTO expertise_taxonomy (name, level)
                VALUES ('[TEST] Self Node', 1)
                RETURNING id;
            """)
            node_id = cur.fetchone()["id"]
            # Try to set its parent to itself
            cur.execute("""
                UPDATE expertise_taxonomy 
                SET parent_id = %s 
                WHERE id = %s;
            """, (node_id, node_id))


def test_taxonomy_alias_uniqueness():
    """Verify alias uniqueness constraint per expertise node."""
    rows = execute_query("SELECT id FROM expertise_taxonomy WHERE name = 'Hydrology';")
    assert len(rows) >= 1
    hydrology_id = rows[0]["id"]

    with pytest.raises(psycopg2.IntegrityError):
        with get_db_cursor(commit=True) as cur:
            cur.execute("""
                INSERT INTO expertise_aliases (expertise_id, alias, normalized_alias, language_code)
                VALUES (%s, 'Water Hydrology Dupe', 'water hydrology', 'en');
            """, (hydrology_id,))


def test_faculty_expertise_relationship():
    """Verify creating and retrieving faculty -> expertise capability link."""
    fac = execute_query("SELECT id FROM faculty WHERE name LIKE %s LIMIT 1;", ('[TEST] Dr. Test Faculty A%',))
    exp = execute_query("SELECT id FROM expertise_taxonomy WHERE name = 'Groundwater' LIMIT 1;")
    assert len(fac) == 1 and len(exp) == 1

    fac_id, exp_id = fac[0]["id"], exp[0]["id"]

    with get_db_cursor(commit=True, dict_cursor=True) as cur:
        cur.execute("""
            INSERT INTO faculty_expertise (faculty_id, expertise_id, confidence_score, verification_status)
            VALUES (%s, %s, 0.950, 'VERIFIED')
            ON CONFLICT (faculty_id, expertise_id) DO UPDATE SET confidence_score = EXCLUDED.confidence_score
            RETURNING id, confidence_score, verification_status;
        """, (fac_id, exp_id))
        rec = cur.fetchone()
        assert float(rec["confidence_score"]) == 0.950
        assert rec["verification_status"] == "VERIFIED"

    # Traversal test: faculty -> department -> university linked to expertise
    rows = execute_query("""
        SELECT f.name AS faculty_name, d.name AS dept_name, u.name AS uni_name, e.name AS expertise_name
        FROM faculty_expertise fe
        JOIN faculty f ON fe.faculty_id = f.id
        JOIN departments d ON f.department_id = d.id
        JOIN universities u ON d.university_id = u.id
        JOIN expertise_taxonomy e ON fe.expertise_id = e.id
        WHERE f.id = %s;
    """, (fac_id,))
    assert len(rows) >= 1
    exp_names = {r["expertise_name"] for r in rows}
    assert "Groundwater" in exp_names


def test_department_expertise_relationship():
    """Verify creating and retrieving department -> expertise capability link."""
    dept = execute_query("SELECT id FROM departments WHERE code = 'CEE' LIMIT 1;")
    exp = execute_query("SELECT id FROM expertise_taxonomy WHERE name = 'Water Resources' LIMIT 1;")
    assert len(dept) == 1 and len(exp) == 1

    dept_id, exp_id = dept[0]["id"], exp[0]["id"]
    with get_db_cursor(commit=True, dict_cursor=True) as cur:
        cur.execute("""
            INSERT INTO department_expertise (department_id, expertise_id, confidence_score, verification_status)
            VALUES (%s, %s, 0.900, 'VERIFIED')
            ON CONFLICT (department_id, expertise_id) DO NOTHING
            RETURNING id;
        """, (dept_id, exp_id))

    rows = execute_query("""
        SELECT d.name AS dept_name, e.name AS expertise_name
        FROM department_expertise de
        JOIN departments d ON de.department_id = d.id
        JOIN expertise_taxonomy e ON de.expertise_id = e.id
        WHERE d.id = %s;
    """, (dept_id,))
    assert len(rows) >= 1
    assert rows[0]["expertise_name"] == "Water Resources"


def test_university_expertise_relationship():
    """Verify creating and retrieving university -> expertise capability link."""
    uni = execute_query("SELECT id FROM universities WHERE code = 'TEST_BIT_MESRA' LIMIT 1;")
    exp = execute_query("SELECT id FROM expertise_taxonomy WHERE name = 'Water Resources' LIMIT 1;")
    assert len(uni) == 1 and len(exp) == 1

    uni_id, exp_id = uni[0]["id"], exp[0]["id"]
    with get_db_cursor(commit=True, dict_cursor=True) as cur:
        cur.execute("""
            INSERT INTO university_expertise (university_id, expertise_id, confidence_score, verification_status)
            VALUES (%s, %s, 0.850, 'PARTIAL')
            ON CONFLICT (university_id, expertise_id) DO NOTHING
            RETURNING id;
        """, (uni_id, exp_id))

    rows = execute_query("""
        SELECT u.name AS uni_name, e.name AS expertise_name, ue.verification_status
        FROM university_expertise ue
        JOIN universities u ON ue.university_id = u.id
        JOIN expertise_taxonomy e ON ue.expertise_id = e.id
        WHERE u.id = %s;
    """, (uni_id,))
    assert len(rows) >= 1
    assert rows[0]["verification_status"] == "PARTIAL"


def test_research_centre_expertise_relationship():
    """Verify creating and retrieving research_centres -> expertise capability link."""
    rc = execute_query("SELECT id FROM research_centres WHERE name LIKE %s LIMIT 1;", ('[TEST]%',))
    exp = execute_query("SELECT id FROM expertise_taxonomy WHERE name = 'Water Quality' LIMIT 1;")
    assert len(rc) == 1 and len(exp) == 1

    rc_id, exp_id = rc[0]["id"], exp[0]["id"]
    with get_db_cursor(commit=True) as cur:
        cur.execute("""
            INSERT INTO research_centre_expertise (research_centre_id, expertise_id, confidence_score, verification_status)
            VALUES (%s, %s, 0.920, 'VERIFIED')
            ON CONFLICT (research_centre_id, expertise_id) DO NOTHING;
        """, (rc_id, exp_id))

    rows = execute_query("""
        SELECT rc.name, e.name AS exp_name 
        FROM research_centre_expertise rce
        JOIN research_centres rc ON rce.research_centre_id = rc.id
        JOIN expertise_taxonomy e ON rce.expertise_id = e.id
        WHERE rc.id = %s;
    """, (rc_id,))
    assert len(rows) >= 1
    assert rows[0]["exp_name"] == "Water Quality"


def test_facility_expertise_relationship():
    """Verify creating and retrieving facilities -> expertise capability link."""
    facil = execute_query("SELECT id FROM facilities WHERE name LIKE %s LIMIT 1;", ('[TEST]%',))
    exp = execute_query("SELECT id FROM expertise_taxonomy WHERE name = 'Water Quality' LIMIT 1;")
    assert len(facil) == 1 and len(exp) == 1

    facil_id, exp_id = facil[0]["id"], exp[0]["id"]
    with get_db_cursor(commit=True) as cur:
        cur.execute("""
            INSERT INTO facility_expertise (facility_id, expertise_id, confidence_score, verification_status)
            VALUES (%s, %s, 0.980, 'VERIFIED')
            ON CONFLICT (facility_id, expertise_id) DO NOTHING;
        """, (facil_id, exp_id))

    rows = execute_query("""
        SELECT f.name, e.name AS exp_name 
        FROM facility_expertise fe
        JOIN facilities f ON fe.facility_id = f.id
        JOIN expertise_taxonomy e ON fe.expertise_id = e.id
        WHERE f.id = %s;
    """, (facil_id,))
    assert len(rows) >= 1
    assert rows[0]["exp_name"] == "Water Quality"


def test_innovation_centre_expertise_relationship():
    """Verify creating and retrieving innovation_centres -> expertise capability link."""
    innov = execute_query("SELECT id FROM innovation_centres WHERE name LIKE %s LIMIT 1;", ('[TEST]%',))
    exp = execute_query("SELECT id FROM expertise_taxonomy WHERE name = 'Rural Infrastructure' LIMIT 1;")
    assert len(innov) == 1 and len(exp) == 1

    innov_id, exp_id = innov[0]["id"], exp[0]["id"]
    with get_db_cursor(commit=True) as cur:
        cur.execute("""
            INSERT INTO innovation_centre_expertise (innovation_centre_id, expertise_id, confidence_score, verification_status)
            VALUES (%s, %s, 0.880, 'PARTIAL')
            ON CONFLICT (innovation_centre_id, expertise_id) DO NOTHING;
        """, (innov_id, exp_id))

    rows = execute_query("""
        SELECT ic.name, e.name AS exp_name 
        FROM innovation_centre_expertise ice
        JOIN innovation_centres ic ON ice.innovation_centre_id = ic.id
        JOIN expertise_taxonomy e ON ice.expertise_id = e.id
        WHERE ic.id = %s;
    """, (innov_id,))
    assert len(rows) >= 1
    assert rows[0]["exp_name"] == "Rural Infrastructure"


def test_incubation_centre_expertise_relationship():
    """Verify creating and retrieving incubation_centres -> expertise capability link."""
    incub = execute_query("SELECT id FROM incubation_centres WHERE name LIKE %s LIMIT 1;", ('[TEST]%',))
    exp = execute_query("SELECT id FROM expertise_taxonomy WHERE name = 'Renewable Energy' LIMIT 1;")
    assert len(incub) == 1 and len(exp) == 1

    incub_id, exp_id = incub[0]["id"], exp[0]["id"]
    with get_db_cursor(commit=True) as cur:
        cur.execute("""
            INSERT INTO incubation_centre_expertise (incubation_centre_id, expertise_id, confidence_score, verification_status)
            VALUES (%s, %s, 0.820, 'UNVERIFIED')
            ON CONFLICT (incubation_centre_id, expertise_id) DO NOTHING;
        """, (incub_id, exp_id))

    rows = execute_query("""
        SELECT ic.name, e.name AS exp_name, ice.verification_status 
        FROM incubation_centre_expertise ice
        JOIN incubation_centres ic ON ice.incubation_centre_id = ic.id
        JOIN expertise_taxonomy e ON ice.expertise_id = e.id
        WHERE ic.id = %s;
    """, (incub_id,))
    assert len(rows) >= 1
    assert rows[0]["verification_status"] == "UNVERIFIED"


def test_expertise_relationship_rejects_invalid_confidence_score():
    """Verify check constraint rejects confidence score outside [0, 1]."""
    fac = execute_query("SELECT id FROM faculty LIMIT 1;")[0]["id"]
    exp = execute_query("SELECT id FROM expertise_taxonomy LIMIT 1;")[0]["id"]

    with pytest.raises(psycopg2.IntegrityError):
        with get_db_cursor(commit=True) as cur:
            cur.execute("""
                INSERT INTO faculty_expertise (faculty_id, expertise_id, confidence_score)
                VALUES (%s, %s, 1.500);
            """, (fac, exp))


def test_expertise_relationship_rejects_invalid_verification_status():
    """Verify check constraint rejects verification_status outside allowed values."""
    fac = execute_query("SELECT id FROM faculty LIMIT 1;")[0]["id"]
    exp = execute_query("SELECT id FROM expertise_taxonomy LIMIT 1;")[0]["id"]

    with pytest.raises(psycopg2.IntegrityError):
        with get_db_cursor(commit=True) as cur:
            cur.execute("""
                INSERT INTO faculty_expertise (faculty_id, expertise_id, verification_status)
                VALUES (%s, %s, 'INVALID_STATUS');
            """, (fac, exp))


def test_expertise_relationship_duplicate_rejected():
    """Verify composite unique constraint prevents duplicate entity-expertise links."""
    fac = execute_query("SELECT id FROM faculty LIMIT 1;")[0]["id"]
    exp = execute_query("SELECT id FROM expertise_taxonomy LIMIT 1;")[0]["id"]

    # First insert or ensure exists
    with get_db_cursor(commit=True) as cur:
        cur.execute("""
            INSERT INTO faculty_expertise (faculty_id, expertise_id, confidence_score)
            VALUES (%s, %s, 0.700)
            ON CONFLICT (faculty_id, expertise_id) DO NOTHING;
        """, (fac, exp))

    # Duplicate raw insert should raise IntegrityError
    with pytest.raises(psycopg2.IntegrityError):
        with get_db_cursor(commit=True) as cur:
            cur.execute("""
                INSERT INTO faculty_expertise (faculty_id, expertise_id, confidence_score)
                VALUES (%s, %s, 0.800);
            """, (fac, exp))


def test_expertise_relationship_foreign_key_integrity():
    """Verify foreign key integrity prevents referencing non-existent entity or expertise."""
    real_exp = execute_query("SELECT id FROM expertise_taxonomy LIMIT 1;")[0]["id"]
    fake_id = "00000000-0000-0000-0000-000000000000"

    with pytest.raises(psycopg2.IntegrityError):
        with get_db_cursor(commit=True) as cur:
            cur.execute("""
                INSERT INTO faculty_expertise (faculty_id, expertise_id)
                VALUES (%s, %s);
            """, (fake_id, real_exp))
