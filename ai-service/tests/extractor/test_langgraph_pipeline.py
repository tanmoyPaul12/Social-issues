"""
Unit tests for LangGraph Extraction Pipeline.
"""
from app.infrastructure.extractor.langgraph_pipeline import (
    map_text_to_domains,
    LangGraphExtractionEngine
)


def test_map_text_to_domains_mining():
    """Verify text containing mining keywords maps to MINING_SAFETY_GEOLOGY."""
    text = "Research on underground rock mechanics, slope stability, and coal mining excavation safety."
    domains = map_text_to_domains(text)
    assert "MINING_SAFETY_GEOLOGY" in domains


def test_map_text_to_domains_water_and_agriculture():
    """Verify text containing water and agriculture keywords maps accurately."""
    text = "Groundwater arsenic removal and drought-resistant crop irrigation for rural farmers."
    domains = map_text_to_domains(text)
    assert "WATER_QUALITY_HYDROGEOLOGY" in domains
    assert "AGRICULTURE_CLIMATE" in domains


def test_classify_page_heuristic():
    """Verify page classification heuristic."""
    engine = LangGraphExtractionEngine("IIT_ISM_DHANBAD")
    
    cls1 = engine.classify_page("Faculty Directory", "Professors and research scholars list", "https://iitism.ac.in/faculty")
    assert cls1.page_type == "FACULTY"

    cls2 = engine.classify_page("Technology Business Incubator", "Startup funding and incubation programs", "https://iitism.ac.in/tbi")
    assert cls2.page_type == "INCUBATION_TBI"

    cls3 = engine.classify_page("Testing Laboratories", "Rock Mechanics Lab and equipment testing setups", "https://iitism.ac.in/labs")
    assert cls3.page_type == "LABORATORY"


def test_extract_from_markdown_professors():
    """Verify extracting professor items from markdown roster."""
    engine = LangGraphExtractionEngine("IIT_ISM_DHANBAD")
    markdown_text = """
    # Department of Mining Engineering
    ## Faculty Members
    - Prof. V. M. S. R. Murthy, Professor & HOD, vmsrmurthy@iitism.ac.in, Rock Mechanics
    - Prof. D. C. Panigrahi, Professor, dc_panigrahi@iitism.ac.in, Mine Ventilation
    """
    extracted = engine.extract_from_markdown(markdown_text, "https://iitism.ac.in/mining/faculty", "Department of Mining Engineering")
    
    assert len(extracted["faculties"]) >= 2
    fac_names = [f.name for f in extracted["faculties"]]
    assert any("Murthy" in n for n in fac_names)
    assert any("Panigrahi" in n for n in fac_names)
