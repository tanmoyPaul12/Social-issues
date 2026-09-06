"""
Unified Issue Context Builder.
Aggregates multimodal preprocessing outputs (Text, Image, Document, Location) into
a single, standardized context payload for downstream AI Intelligence engines,
including cross-modal evidence alignment and conflict detection.
"""
import uuid
from typing import Dict, Any, Optional


def build_unified_issue_context(
    issue_id: Optional[str],
    text_data: Dict[str, Any],
    image_data: Optional[Dict[str, Any]] = None,
    document_data: Optional[Dict[str, Any]] = None,
    location_data: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Assembles a standardized Unified Issue Context dictionary.
    Handles raw strings, dictionaries, or preprocessed Pydantic objects safely.
    Detects cross-modal conflicts between image evidence and text/document complaints.
    """
    cid = issue_id or f"ISSUE_{uuid.uuid4().hex[:8].upper()}"

    # Extract text content safely
    title_res = text_data.get("title", "") if isinstance(text_data, dict) else ""
    desc_res = text_data.get("description", "") if isinstance(text_data, dict) else ""

    if isinstance(title_res, dict):
        english_title = title_res.get("english_text") or title_res.get("normalized_text") or title_res.get("original_text", "")
        detected_lang_title = title_res.get("detected_language", "en")
        is_rom_title = title_res.get("is_romanized", False)
    elif isinstance(title_res, str):
        english_title = title_res.strip()
        detected_lang_title = "en"
        is_rom_title = False
    else:
        english_title = str(title_res or "").strip()
        detected_lang_title = "en"
        is_rom_title = False

    if isinstance(desc_res, dict):
        english_desc = desc_res.get("english_text") or desc_res.get("normalized_text") or desc_res.get("original_text", "")
        detected_lang_desc = desc_res.get("detected_language", "en")
        is_rom_desc = desc_res.get("is_romanized", False)
    elif isinstance(desc_res, str):
        english_desc = desc_res.strip()
        detected_lang_desc = "en"
        is_rom_desc = False
    else:
        english_desc = str(desc_res or "").strip()
        detected_lang_desc = "en"
        is_rom_desc = False

    combined_english = (
        text_data.get("combined_english_text") if isinstance(text_data, dict) else None
    ) or f"{english_title}. {english_desc}".strip()

    # Extract image analysis safely
    image_analysis = {}
    if image_data and isinstance(image_data, dict) and image_data.get("is_valid") and image_data.get("visual_analysis"):
        vis = image_data["visual_analysis"]
        image_analysis = {
            "available": True,
            "visual_summary": vis.get("visual_summary", ""),
            "detected_objects": vis.get("detected_objects", []),
            "suggested_categories": vis.get("suggested_categories", []),
            "severity_indicators": vis.get("severity_indicators", []),
            "is_relevant": vis.get("is_relevant", True)
        }
    else:
        image_analysis = {"available": False, "visual_summary": "No image attached."}

    # Extract document analysis safely
    document_analysis = {}
    if document_data and isinstance(document_data, dict) and document_data.get("is_valid") and document_data.get("document_analysis"):
        doc = document_data["document_analysis"]
        document_analysis = {
            "available": True,
            "document_summary": doc.get("document_summary", ""),
            "document_type": doc.get("document_type", ""),
            "key_facts": doc.get("key_facts", []),
            "affected_population_estimate": doc.get("affected_population_estimate", ""),
            "relevance_score": doc.get("relevance_score", 1.0)
        }
    else:
        document_analysis = {"available": False, "document_summary": "No document attached."}

    # Extract location context safely
    loc_ctx = location_data if isinstance(location_data, dict) else {}
    location_summary = {
        "latitude": loc_ctx.get("latitude"),
        "longitude": loc_ctx.get("longitude"),
        "district": loc_ctx.get("district", "Unknown"),
        "block": loc_ctx.get("block"),
        "gram_panchayat": loc_ctx.get("gram_panchayat"),
        "is_in_jharkhand": loc_ctx.get("is_in_jharkhand", False),
        "conflict_detected": loc_ctx.get("conflict_detected", False)
    }

    # Cross-Modal Conflict Detection Logic
    conflict_detected = False
    img_cats = image_analysis.get("suggested_categories", [])
    text_lower = combined_english.lower()

    if img_cats:
        if "ROAD_URBAN_INFRASTRUCTURE" in img_cats and any(kw in text_lower for kw in ["pollution", "smoke", "kiln", "emission"]):
            conflict_detected = True

    cross_modal_alignment = {
        "conflict_detected": conflict_detected,
        "primary_evidence_source": "text_and_document",
        "alignment_notes": (
            "Cross-modal variance detected: Text & Document evidence takes precedence over generic visual suggestion."
            if conflict_detected else "Multimodal evidence is aligned."
        )
    }

    return {
        "issue_id": cid,
        "text": {
            "english_title": english_title,
            "english_description": english_desc,
            "combined_english_text": combined_english,
            "detected_language": detected_lang_desc or detected_lang_title or "en",
            "is_romanized": is_rom_desc or is_rom_title or False
        },
        "image_evidence": image_analysis,
        "document_evidence": document_analysis,
        "location": location_summary,
        "cross_modal_alignment": cross_modal_alignment
    }
