"""
Unit tests for Extractor Schemas.
"""
from app.infrastructure.extractor.schemas import (
    FacultyItem,
    DepartmentItem,
    ResearchCenterItem,
    IncubationCenterItem,
    LaboratoryItem,
    UniversityKnowledgePayload
)


def test_faculty_item_validation():
    """Verify FacultyItem validation."""
    fac = FacultyItem(
        name="Prof. D. C. Panigrahi",
        designation="Professor",
        email="dc_panigrahi@iitism.ac.in",
        department_name="Department of Mining Engineering",
        research_interests=["Mine Ventilation", "Fires and Explosions"],
        specialization_domains=["MINING_SAFETY_GEOLOGY"]
    )
    assert fac.name == "Prof. D. C. Panigrahi"
    assert "MINING_SAFETY_GEOLOGY" in fac.specialization_domains
    assert fac.email == "dc_panigrahi@iitism.ac.in"


def test_university_knowledge_payload_validation():
    """Verify complete UniversityKnowledgePayload validation."""
    payload = UniversityKnowledgePayload(
        university_code="IIT_ISM_DHANBAD",
        university_name="IIT (ISM) Dhanbad",
        departments=[
            DepartmentItem(
                name="Department of Mining Engineering",
                code="DMIN",
                domain_tags=["MINING_SAFETY_GEOLOGY"]
            )
        ],
        laboratories=[
            LaboratoryItem(
                name="Rock Mechanics Laboratory",
                department_name="Department of Mining Engineering",
                testing_capabilities=["Compressive Strength"],
                key_equipment=["MTS Testing System"],
                domain_tags=["MINING_SAFETY_GEOLOGY"]
            )
        ],
        total_extracted_entities=2
    )

    assert payload.university_code == "IIT_ISM_DHANBAD"
    assert len(payload.departments) == 1
    assert len(payload.laboratories) == 1
