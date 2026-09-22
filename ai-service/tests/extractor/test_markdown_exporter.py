"""
Unit tests for Markdown Knowledge Base Exporter.
"""
import os
import shutil
import tempfile
from app.infrastructure.extractor.markdown_exporter import MarkdownKnowledgeExporter
from app.infrastructure.extractor.schemas import (
    UniversityKnowledgePayload,
    DepartmentItem,
    FacultyItem,
    ResearchCenterItem,
    IncubationCenterItem,
    LaboratoryItem
)


def test_markdown_exporter_generates_all_files():
    """Verify MarkdownKnowledgeExporter creates all 6 standard markdown files."""
    temp_dir = tempfile.mkdtemp()
    try:
        exporter = MarkdownKnowledgeExporter(base_output_dir=temp_dir)

        payload = UniversityKnowledgePayload(
            university_code="TEST_UNI",
            university_name="Test University Jharkhand",
            departments=[
                DepartmentItem(name="Department of Mining", domain_tags=["MINING_SAFETY_GEOLOGY"])
            ],
            faculty_profiles=[
                FacultyItem(name="Dr. Tester", designation="Professor", email="tester@test.ac.in")
            ],
            research_centers=[
                ResearchCenterItem(name="Center for Clean Water", thrust_areas=["Water Filter"])
            ],
            incubation_centers=[
                IncubationCenterItem(name="Innovation Park", focus_sectors=["AgriTech"])
            ],
            laboratories=[
                LaboratoryItem(name="Water Lab", testing_capabilities=["pH Analysis"])
            ],
            total_extracted_entities=5
        )

        files = exporter.export_university_markdown(payload)

        assert "overview" in files
        assert "departments" in files
        assert "faculty_directory" in files
        assert "research_centers" in files
        assert "incubation_tbi" in files
        assert "laboratories" in files

        # Verify files exist on disk
        for path in files.values():
            assert os.path.exists(path)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
                assert len(content) > 20
                assert "Test University Jharkhand" in content or "TEST_UNI" in content
    finally:
        shutil.rmtree(temp_dir)
