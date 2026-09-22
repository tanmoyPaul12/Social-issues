"""
End-to-End Integration Test Suite for AI Service Pipeline:
1. Multimodal Validation & Preprocessing
2. Fail-Safe Local Text Embeddings (multilingual-e5-small)
3. Knowledge Base Extraction & Provenance
4. Prioritization & Deduplication
5. University & Professor Routing Engine with RRF and Evidence Citations
"""
import pytest
from app.models.text.embedding_model import local_e5_embedder
from app.infrastructure.extractor.raw_provenance import build_provenance_header
from app.infrastructure.extractor.taxonomy_normalizer import normalizer
from app.infrastructure.extractor.canonical_doc_builder import doc_builder
from app.infrastructure.extractor.schemas import FacultyItem
from app.routing.requirement_extractor import requirement_extractor
from app.routing.university_matcher import router_instance


def test_local_e5_embedder():
    """Verify local_e5_embedder produces 384-d normalized vector embeddings."""
    text = "Water quality testing and heavy metal contamination"
    vec = local_e5_embedder.encode(text, is_query=True)
    assert len(vec) == 384
    assert isinstance(vec[0], float)


def test_raw_provenance_building():
    """Verify raw provenance headers attach SHA-256 content hashes and version tokens."""
    content = "# Department of Environmental Science\nProfessor S. K. Gupta"
    prov = build_provenance_header("IIT_ISM_DHANBAD", "raw/faculty/skgupta.md", content)
    assert prov.university_id == "IIT_ISM_DHANBAD"
    assert prov.content_hash.startswith("sha256:")
    assert prov.parser_version == "1.0.0"


def test_taxonomy_normalizer():
    """Verify raw research text normalizes into canonical domain tokens while preserving raw text."""
    res = normalizer.normalize("Underground mine safety and slope stability analysis")
    assert res.raw == "Underground mine safety and slope stability analysis"
    assert "MINING_SAFETY_GEOLOGY" in res.normalized


def test_canonical_doc_builder():
    """Verify canonical document builder constructs dense semantic search text."""
    fac = FacultyItem(
        name="Prof. S. K. Gupta",
        designation="Professor & HOD",
        department_name="Environmental Science",
        email="skgupta@iitism.ac.in",
        raw_research_interests=["Water Treatment", "Arsenic Remediation"],
        specialization_domains=["WATER_QUALITY_HYDROGEOLOGY"],
        profile_url="https://iitism.ac.in/faculty/skgupta"
    )
    doc = doc_builder.build_faculty_doc(fac, "IIT (ISM) Dhanbad", "IIT_ISM_DHANBAD")
    assert "Prof. S. K. Gupta" in doc
    assert "WATER_QUALITY_HYDROGEOLOGY" in doc
    assert "IIT_ISM_DHANBAD" in doc


def test_requirement_extractor():
    """Verify challenge requirement extraction from title/description."""
    req = requirement_extractor.extract(
        challenge_id="CH-2001",
        title="High arsenic content in drinking water well",
        description="Villagers in Chas block Bokaro are facing health problems due to arsenic contamination.",
        district="Bokaro"
    )
    assert req.primary_domain == "WATER_QUALITY_HYDROGEOLOGY"
    assert req.district == "Bokaro"
    assert "water_testing_lab" in req.required_facilities


def test_university_and_professor_routing():
    """Verify full end-to-end university and professor routing engine."""
    pkg = router_instance.route_challenge(
        challenge_id="CH-3001",
        title="Arsenic pollution in Chas groundwater",
        description="Water samples show heavy metal contamination requiring immediate testing lab intervention.",
        district="Bokaro"
    )

    assert pkg.total_matches > 0
    top_uni = pkg.recommended_universities[0]
    assert top_uni.routing_score > 0.0
    assert len(top_uni.matched_professors) > 0
    
    lead_prof = top_uni.matched_professors[0]
    assert lead_prof.professor_name is not None
    assert lead_prof.match_score > 0.0
    assert len(pkg.evidence_citations) > 0
