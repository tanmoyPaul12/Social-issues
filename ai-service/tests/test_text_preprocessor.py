"""
Unit & Integration tests for app.domain.preprocessing.text_preprocessor.
"""
import asyncio
import pytest
from app.domain.preprocessing.text_preprocessor import DomainTextPreprocessor
from app.ml.translation.mock_provider import MockTranslator

mock_preprocessor = DomainTextPreprocessor(translator=MockTranslator())


def test_english_text_passthrough_with_extra_whitespace():
    async def _runner():
        title = "   Drinking    Water    Supply    Issue   "
        desc = "   There has been no water supply in our village for ten days.   "
        res = await mock_preprocessor.process(title, desc)

        assert res.title.original_text == title
        assert res.title.normalized_text == "Drinking Water Supply Issue"
        assert res.title.english_text == "Drinking Water Supply Issue"
        assert res.title.translation_required is False
        assert res.title.translation_status in ["not_required", "completed", "skipped"]

        assert res.description.original_text == desc
        assert res.description.normalized_text == "There has been no water supply in our village for ten days."
        assert res.description.english_text == "There has been no water supply in our village for ten days."

        assert res.combined_english_text == "Drinking Water Supply Issue. There has been no water supply in our village for ten days."
        assert res.processing_status == "completed"

    asyncio.run(_runner())


def test_hindi_devanagari_input_translation():
    async def _runner():
        title = "पानी की समस्या"
        desc = "हमारे गांव में पानी की समस्या है।"
        res = await mock_preprocessor.process(title, desc)

        assert res.title.detected_language == "hi"
        assert res.title.script == "devanagari"
        assert res.title.is_romanized is False
        assert res.title.translation_required is True
        assert res.title.translation_status == "completed"
        assert "पानी की समस्या" in res.title.english_text

    asyncio.run(_runner())


def test_romanized_hindi_hinglish_translation():
    async def _runner():
        title = "  PANI   KI  BAHUTTT   BADI  PROBLEM!!! "
        desc = "   Hamare   gaon me pani nahi aa raha!!!! Pichleeee 10 din se problem hai... log bahut pareshan hain 😥😥   "
        res = await mock_preprocessor.process(title, desc)

        # Title check
        assert res.title.original_text == title
        assert res.title.normalized_text == "PANI KI BAHUTTT BADI PROBLEM!!!"
        assert res.title.detected_language == "hi"
        assert res.title.script == "latin"
        assert res.title.is_romanized is True

        # Combined check
        assert res.combined_english_text != ""
        assert res.processing_status == "completed"

    asyncio.run(_runner())


def test_santali_input_preservation():
    async def _runner():
        title = "Santali Title"
        desc = "Santali citizen problem description"
        res = await mock_preprocessor.process(title, desc)

        assert res.title.original_text == title
        assert res.description.original_text == desc

    asyncio.run(_runner())


def test_original_text_immutable_audit():
    async def _runner():
        raw_title = "  पानी   "
        raw_desc = "  हमारे   गांव   में   पानी   नहीं   है   "
        res = await mock_preprocessor.process(raw_title, raw_desc)

        assert res.title.original_text == raw_title
        assert res.description.original_text == raw_desc
        assert res.title.normalized_text == "पानी"

    asyncio.run(_runner())
