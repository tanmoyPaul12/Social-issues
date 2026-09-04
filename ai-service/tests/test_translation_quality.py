"""
Unit tests for app.preprocessing.text.translation_quality.
"""
from app.preprocessing.text.translation_quality import validate_translation_quality


def test_translation_quality_valid():
    res = validate_translation_quality(
        "हमारे गांव में पानी नहीं आ रहा है।",
        "There is no water supply in our village."
    )
    assert res["is_valid"] is True
    assert res["quality_score"] > 0.90


def test_translation_quality_empty_output():
    res = validate_translation_quality(
        "हमारे गांव में पानी नहीं आ रहा है।",
        ""
    )
    assert res["is_valid"] is False
    assert res["quality_score"] == 0.0


def test_translation_quality_severe_truncation():
    src = "हमारे गांव में पिछले दो सप्ताह से पानी की आपूर्ति नहीं हो रही है और 300 परिवार प्रभावित हैं।"
    res = validate_translation_quality(src, "No")
    assert res["is_valid"] is False
    assert res["quality_score"] == 0.20


def test_translation_quality_hallucination_loop():
    src = "पानी की समस्या है"
    target = "water water water water water water water"
    res = validate_translation_quality(src, target)
    assert res["is_valid"] is False
    assert "Hallucination" in res["reason"]
