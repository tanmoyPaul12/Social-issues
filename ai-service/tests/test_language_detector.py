"""
Unit tests for app.preprocessing.text.language_detector.
"""
from app.preprocessing.text.language_detector import detect_language_and_script


def test_detect_pure_english():
    res = detect_language_and_script("The primary handpump in Kanke village has been broken for three weeks.")
    assert res["language"] == "en"
    assert res["script"] == "latin"
    assert res["is_romanized"] is False
    assert res["confidence"] >= 0.90


def test_detect_devanagari_hindi():
    res = detect_language_and_script("हमारे गांव में पानी की आपूर्ति नहीं हो रही है।")
    assert res["language"] == "hi"
    assert res["script"] == "devanagari"
    assert res["is_romanized"] is False
    assert res["confidence"] >= 0.90


def test_detect_ol_chiki_santali():
    # Santhali Ol Chiki unicode sequence
    res = detect_language_and_script("ᱚᱞ ᱪᱤᱠᱤ ᱥᱟᱱᱛᱟᱲᱤ ᱯᱟᱹᱨᱥᱤ")
    assert res["language"] == "sat"
    assert res["script"] == "ol_chiki"
    assert res["is_romanized"] is False


def test_detect_romanized_hindi_hinglish():
    res = detect_language_and_script("Hamare village me pani ki problem hai aur rha hai.")
    assert res["language"] == "hi"
    assert res["script"] == "latin"
    assert res["is_romanized"] is True


def test_detect_mixed_or_empty():
    res = detect_language_and_script("")
    assert res["language"] == "unknown"
    assert res["confidence"] == 0.0
