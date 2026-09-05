"""
Document Preprocessor Orchestrator.
Combines local PyMuPDF text extraction with AI document analysis via AIProvider.
"""
import logging
from typing import Dict, Any, Optional
try:
    import fitz as pymupdf
except ImportError:
    try:
        import pymupdf
    except ImportError:
        pymupdf = None

try:
    import pypdf
except ImportError:
    pypdf = None

from app.domain.preprocessing.document.document_validator import validate_document_bytes
from app.domain.preprocessing.text_preprocessor import text_preprocessor
from app.domain.preprocessing.translation_validator import validate_translation_quality
from app.prioritization.priority_rules import calculate_rule_based_priority
from app.ml.providers import get_ai_provider, AIProvider

log = logging.getLogger(__name__)


class DocumentPreprocessor:
    """
    Document Preprocessing, Text Extraction, Translation & Multilingual Intelligence Pipeline.
    """

    def __init__(self, ai_provider: Optional[AIProvider] = None):
        self._ai_provider = ai_provider

    @property
    def ai_provider(self) -> AIProvider:
        if self._ai_provider is None:
            self._ai_provider = get_ai_provider()
        return self._ai_provider

    def _extract_pdf_text(self, doc_bytes: bytes) -> tuple[str, int]:
        """Extracts native text content and page count from PDF using fitz/pymupdf or pypdf fallback."""
        if pymupdf is not None:
            try:
                text_chunks = []
                with pymupdf.open(stream=doc_bytes, filetype="pdf") as doc:
                    page_count = len(doc)
                    for page in doc:
                        text = page.get_text("text")
                        if text and text.strip():
                            text_chunks.append(text.strip())
                if text_chunks:
                    return "\n\n".join(text_chunks), page_count
            except Exception as e:
                log.warning(f"PyMuPDF text extraction failed: {e}. Trying pypdf fallback.")

        if pypdf is not None:
            try:
                import io
                reader = pypdf.PdfReader(io.BytesIO(doc_bytes))
                text_chunks = []
                for page in reader.pages:
                    t = page.extract_text()
                    if t and t.strip():
                        text_chunks.append(t.strip())
                if text_chunks:
                    return "\n\n".join(text_chunks), len(reader.pages)
            except Exception as e:
                log.warning(f"pypdf extraction failed: {e}")

        # Final Fallback plain text decoding
        raw_text = doc_bytes.decode("utf-8", errors="ignore")
        return raw_text, 1

    async def process_document(
        self,
        doc_bytes: bytes,
        filename: str = "petition.pdf",
        text_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Validates document, extracts text, runs language detection & translation,
        and computes categorization & prioritization.
        """
        is_valid, doc_type, warning_msg = validate_document_bytes(doc_bytes, filename)
        if not is_valid:
            log.warning(f"Document validation failed: {warning_msg}")
            return {
                "is_valid": False,
                "error_message": warning_msg,
                "metadata": {"filename": filename, "doc_type": doc_type, "size_bytes": len(doc_bytes)},
                "extracted_text": {"original_text": "", "detected_language": "unknown", "english_text": ""},
                "document_analysis": None,
                "categorization": {"category": "unknown", "confidence": 0.0},
                "prioritization": {"priority_score": 0, "priority_level": "low"}
            }

        try:
            page_count = 1
            if doc_type == "pdf":
                extracted_raw_text, page_count = self._extract_pdf_text(doc_bytes)
            else:
                extracted_raw_text = doc_bytes.decode("utf-8", errors="ignore")

            context = text_context or {}

            # Execute Multi-Paragraph Chunking & Language Translation Pipeline
            if extracted_raw_text and extracted_raw_text.strip():
                # Split lines into chunks of ~600 chars or by section headers
                lines = [l.strip() for l in extracted_raw_text.split("\n") if l.strip()]
                chunks = []
                curr_chunk = []
                curr_len = 0

                for line in lines:
                    is_header = any(line.startswith(h) for h in ["Title:", "Location:", "Background", "Problem Description", "Community Par Impact", "Previous Actions", "Requested Action", "Conclusion", "Public Issue Report"])
                    if (curr_len + len(line) > 500 or is_header) and curr_chunk:
                        chunks.append(" ".join(curr_chunk))
                        curr_chunk = [line]
                        curr_len = len(line)
                    else:
                        curr_chunk.append(line)
                        curr_len += len(line)
                if curr_chunk:
                    chunks.append(" ".join(curr_chunk))

                translated_paragraphs = []
                primary_detected_lang = "en"
                primary_script = "latin"

                for chunk in chunks:
                    if len(chunk) < 5:
                        translated_paragraphs.append(chunk)
                        continue

                    processed_res, lang_info = await text_preprocessor.process_field(chunk, field_name="para_chunk")
                    if lang_info.get("language") != "en" and primary_detected_lang == "en":
                        primary_detected_lang = lang_info.get("language", "hi")
                        primary_script = lang_info.get("script", "devanagari")
                    translated_paragraphs.append(processed_res.english_text)

                orig_text = extracted_raw_text
                english_text = "\n\n".join(translated_paragraphs)
                detected_lang = primary_detected_lang
                script = primary_script
            else:
                orig_text = ""
                detected_lang = "unknown"
                script = "unknown"
                english_text = ""

            # Translation Quality Check & Status Assignment
            is_translation_valid, translation_reason, qual_score = validate_translation_quality(
                orig_text, english_text, source_lang=detected_lang
            )
            translation_status = "completed" if is_translation_valid else "completed_with_fallback"

            # Execute AI Fact Extraction on Full English Text
            if english_text and english_text.strip():
                structured_facts = await self.ai_provider.analyze_document(english_text, context)
            else:
                structured_facts = {
                    "document_summary": "No readable text found in document.",
                    "document_type": "other",
                    "main_issue": "Unknown or empty document",
                    "affected_population_description": "Unknown",
                    "affected_population_type": "individual",
                    "duration_text": "Unknown",
                    "duration_days": None,
                    "vulnerable_groups": [],
                    "essential_service": "OTHER",
                    "impact_summary": "No readable text",
                    "financial_impact": "None reported",
                    "safety_risk_level": "low",
                    "suggested_category": "OTHER"
                }

            suggested_category = structured_facts.get("suggested_category", "URBAN_DEVELOPMENT")

            # Deterministic Rule-Based Priority Scoring Engine
            priority_result = calculate_rule_based_priority(structured_facts)

            # Clean Text Preview (first 500 chars) for responsive frontend payloads
            text_preview = orig_text[:500].strip() + ("..." if len(orig_text) > 500 else "")

            return {
                "is_valid": True,
                "warning_message": warning_msg if warning_msg else None,
                "metadata": {
                    "filename": filename,
                    "doc_type": doc_type.lower(),
                    "size_bytes": len(doc_bytes),
                    "character_count": len(extracted_raw_text),
                    "page_count": page_count
                },
                "extracted_text": {
                    "original_text_preview": text_preview,
                    "full_character_count": len(orig_text),
                    "detected_language": detected_lang,
                    "script": script,
                    "translation_status": translation_status,
                    "translation_quality_score": qual_score,
                    "english_text": english_text
                },
                "document_analysis": structured_facts,
                "categorization": {
                    "category": suggested_category,
                    "confidence": 0.95
                },
                "prioritization": priority_result
            }

        except Exception as e:
            log.error(f"Document preprocessing failed for '{filename}': {e}", exc_info=True)
            return {
                "is_valid": False,
                "error_message": f"Document processing error: {str(e)}",
                "metadata": {"filename": filename, "doc_type": doc_type, "size_bytes": len(doc_bytes)},
                "extracted_text": {
                    "original_text_preview": "",
                    "full_character_count": 0,
                    "detected_language": "unknown",
                    "translation_status": "failed",
                    "english_text": ""
                },
                "document_analysis": None,
                "categorization": {"category": "OTHER", "confidence": 0.0},
                "prioritization": {"priority_score": 0, "priority_level": "LOW"}
            }


# Global Preprocessor Instance
document_preprocessor = DocumentPreprocessor()
