import pytest
import asyncio
from unittest.mock import patch, AsyncMock, MagicMock
from app.domain.intelligence.pipeline.cleaner import deterministic_clean
from app.domain.intelligence.pipeline.classifier import classify_page, deterministic_classify
from app.domain.intelligence.pipeline.nodes import (
    node_load, node_check_state, node_clean, node_classify, 
    node_validate, node_write_kb, node_update_state, compute_hash
)
from app.domain.intelligence.pipeline.state import ProcessingState

def test_deterministic_cleaner():
    raw = """---
Source URL: http://test.com
---
[Home](/)
![logo](logo.png)
* |

# Faculty List
Dr. John Doe
"""
    cleaned = deterministic_clean(raw)
    assert "[Home]" not in cleaned
    assert "logo.png" not in cleaned
    assert "* |" not in cleaned
    assert "Dr. John Doe" in cleaned
    assert "Source URL: http://test.com" in cleaned

def test_deterministic_classifier():
    # Faculty rule
    cat, ptype, conf, method = deterministic_classify("http://test.com/faculty", "Dr. John")
    assert cat == "faculties"
    assert ptype == "FACULTY"
    
    # Ambiguous rule
    cat, ptype, conf, method = deterministic_classify("http://test.com/random", "Hello World")
    assert conf == 0.0
    assert cat == "UNCLASSIFIED"

@patch('app.ml.providers.gemini_provider.gemini_multimodal_provider._call_gemini_api')
def test_llm_classifier(mock_api):
    # Mock LLM success
    mock_api.return_value = '```json\n{"category": "overview", "page_type": "GENERAL", "confidence": 0.95}\n```'
    res = asyncio.run(classify_page("http://test.com/random", "Some text about university"))
    assert res["category"] == "overview"
    assert res["classification_method"] == "llm_fallback"
    
    # Mock LLM failure
    mock_api.side_effect = Exception("API Down")
    res = asyncio.run(classify_page("http://test.com/random", "Some text"))
    assert res["category"] == "UNCLASSIFIED"
    assert res["classification_method"] == "llm_failed"

def test_node_check_state_unchanged(tmp_path):
    with patch('app.domain.intelligence.pipeline.nodes.load_manifest') as mock_manifest:
        mock_manifest.return_value = {
            "http://test.com": {
                "content_hash": "hash123",
                "category": "faculties",
                "page_type": "FACULTY"
            }
        }
        
        state = ProcessingState(
            university_code="TEST",
            canonical_url="http://test.com",
            content_hash="hash123",
            force_process=False,
            processing_status="LOADED"
        )
        
        new_state = node_check_state(state)
        assert new_state["is_changed"] is False
        assert new_state["processing_status"] == "SKIPPED_UNCHANGED"
        assert new_state["category"] == "faculties"

def test_node_check_state_force(tmp_path):
    with patch('app.domain.intelligence.pipeline.nodes.load_manifest') as mock_manifest:
        mock_manifest.return_value = {
            "http://test.com": {
                "content_hash": "hash123"
            }
        }
        
        state = ProcessingState(
            university_code="TEST",
            canonical_url="http://test.com",
            content_hash="hash123",
            force_process=True,
            processing_status="LOADED"
        )
        
        new_state = node_check_state(state)
        assert new_state["is_changed"] is True
        assert new_state["processing_status"] == "LOADED"
