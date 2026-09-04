"""
Unit Tests for app.preprocessing.text.translator & transliterator modules.
"""
import pytest
from app.preprocessing.text.translator import indictrans2_provider, passthrough_provider
from app.preprocessing.text.transliterator import transliterate_hinglish_to_devanagari


@pytest.mark.anyio
async def test_passthrough_translator():
    res = await passthrough_provider.translate("Water problem in village", "en", "en")
    assert res == "Water problem in village"


@pytest.mark.anyio
async def test_indictrans2_hindi_devanagari_translation():
    res = await indictrans2_provider.translate("पानी की समस्या", "hi", "en")
    assert "water" in res.lower() or "problem" in res.lower()


@pytest.mark.anyio
async def test_hinglish_transliteration():
    dev = transliterate_hinglish_to_devanagari("pani ki bahuttt badi problem")
    assert dev == "पानी की बहुत बड़ी समस्या"


@pytest.mark.anyio
async def test_santali_fallback_handling():
    res = await indictrans2_provider.translate(" Santali text ", "sat", "en")
    assert res == "Santali text"
