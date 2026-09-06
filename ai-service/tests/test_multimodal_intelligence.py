"""
Comprehensive Automated Test Suite for Multimodal Preprocessing & Intelligence Architecture.
"""
import io
import asyncio
import pytest
from PIL import Image

from app.ml.providers.mock_provider import mock_ai_provider
from app.domain.preprocessing.image.image_validator import validate_image_bytes
from app.domain.preprocessing.image.image_preprocessor import ImagePreprocessor
from app.domain.preprocessing.document.document_validator import validate_document_bytes
from app.domain.preprocessing.document.document_preprocessor import DocumentPreprocessor
from app.domain.preprocessing.location.location_processor import LocationProcessor
from app.domain.intelligence.issue_context_builder import build_unified_issue_context
from app.domain.intelligence.issue_validator import evaluate_issue_validity
from app.domain.intelligence.categorization.categorizer import IssueCategorizer
from app.domain.intelligence.prioritization.priority_engine import PriorityEngine


@pytest.fixture
def sample_image_bytes():
    buf = io.BytesIO()
    img = Image.new("RGB", (800, 600), color="blue")
    img.save(buf, format="JPEG")
    return buf.getvalue()


def test_mock_ai_provider():
    async def _runner():
        trans = await mock_ai_provider.translate("Pani issue", "hi")
        assert "Translated" in trans

        img_res = await mock_ai_provider.analyze_image(b"fake", "image/jpeg", {})
        assert img_res["is_relevant"] is True
        assert "ROAD_URBAN_INFRASTRUCTURE" in img_res["suggested_categories"]

        doc_res = await mock_ai_provider.analyze_document("No water supply", {})
        assert doc_res["document_type"] == "petition"

        cat_res = await mock_ai_provider.categorize({})
        assert cat_res["primary_category"] == "WATER_MANAGEMENT"

        prio_res = await mock_ai_provider.prioritize({}, cat_res)
        assert prio_res["factors"]["essential_service_disruption"] == 9
    asyncio.run(_runner())


def test_image_validation_and_preprocessing(sample_image_bytes):
    is_valid, mime, err, w, h = validate_image_bytes(sample_image_bytes)
    assert is_valid is True
    assert mime == "image/jpeg"
    assert w == 800
    assert h == 600

    preprocessor = ImagePreprocessor(ai_provider=mock_ai_provider)
    import asyncio
    res = asyncio.run(preprocessor.process_image(sample_image_bytes, "test.jpg"))
    assert res["is_valid"] is True
    assert res["metadata"]["width"] == 800
    assert "thumbnail_b64" in res["metadata"]
    assert res["visual_analysis"]["is_relevant"] is True


def test_document_validation_and_preprocessing():
    is_valid, doc_type, err = validate_document_bytes(b"Sample plain text complaint letter", "complaint.txt")
    assert is_valid is True
    assert doc_type == "txt"

    preprocessor = DocumentPreprocessor(ai_provider=mock_ai_provider)
    import asyncio
    res = asyncio.run(preprocessor.process_document(b"Sample plain text complaint letter", "complaint.txt"))
    assert res["is_valid"] is True
    assert res["metadata"]["doc_type"] == "txt"
    assert res["document_analysis"]["document_type"] == "petition"


def test_location_processor():
    loc = LocationProcessor()
    
    # Test valid Ranchi coordinates
    res = loc.process_location(latitude=23.3441, longitude=85.3096, district="Ranchi")
    assert res["is_valid"] is True
    assert res["is_in_jharkhand"] is True
    assert res["district"] == "Ranchi"
    assert res["conflict_detected"] is False

    # Test invalid out of bounds coordinates
    res_inv = loc.process_location(latitude=999.0, longitude=85.3096)
    assert res_inv["is_valid"] is False
    assert res_inv["conflict_detected"] is True


def test_context_assembler_and_validity_guardrail():
    text_data = {
        "title": {"english_text": "Piped water pipeline broken"},
        "description": {"english_text": "Our village has had no water supply for ten days due to main line rupture."},
        "combined_english_text": "Piped water pipeline broken. Our village has had no water supply for ten days due to main line rupture."
    }
    loc_data = {
        "latitude": 23.3441,
        "longitude": 85.3096,
        "district": "Ranchi",
        "is_in_jharkhand": True
    }

    ctx = build_unified_issue_context(issue_id="ISSUE_TEST_001", text_data=text_data, location_data=loc_data)
    assert ctx["issue_id"] == "ISSUE_TEST_001"
    assert ctx["location"]["district"] == "Ranchi"

    validity = evaluate_issue_validity(ctx)
    assert validity["status"] == "VALID"
    assert validity["confidence"] > 0.8


def test_categorizer_and_priority_engine():
    async def _runner():
        categorizer = IssueCategorizer(ai_provider=mock_ai_provider)
        cat_res = await categorizer.categorize_issue({"text": {"combined_english_text": "Water pipeline burst"}})
        assert cat_res["primary_category"] in [
            "WATER_MANAGEMENT", "ROAD_URBAN_INFRASTRUCTURE", "AGRICULTURE", "HEALTHCARE",
            "EDUCATION", "SANITATION", "ENVIRONMENT", "RURAL_LIVELIHOODS", "ACCESSIBILITY",
            "ENERGY", "PUBLIC_SERVICE_DELIVERY"
        ]

        prio_engine = PriorityEngine(ai_provider=mock_ai_provider)
        prio_res = await prio_engine.prioritize_issue({}, cat_res)
        assert 0.0 <= prio_res["priority_score"] <= 100.0
        assert prio_res["urgency_level"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    asyncio.run(_runner())
