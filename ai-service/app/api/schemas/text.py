"""
Text Schema: Standardized Pydantic models for single-field text processing
and combined ProcessedText payload.
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional


class TextInput(BaseModel):
    """
    Standalone text input payload for direct text preprocessing.
    """

    title: str = Field(
        ...,
        min_length=2,
        max_length=300,
        description="Problem title to preprocess.",
        examples=["  PANI   KI  BAHUTTT   BADI  PROBLEM!!! "]
    )

    description: str = Field(
        ...,
        min_length=5,
        description="Detailed problem description written by citizen.",
        examples=["   Hamare   gaon me pani nahi aa raha!!!! Pichleeee 10 din se problem hai... log bahut pareshan hain 😥😥   "]
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "title": "  PANI   KI  BAHUTTT   BADI  PROBLEM!!! ",
                "description": "   Hamare   gaon me pani nahi aa raha!!!! Pichleeee 10 din se problem hai... log bahut pareshan hain 😥😥   "
            }
        }
    )


class SingleFieldTextResult(BaseModel):
    """
    Detailed preprocessing result for an individual text field (title or description).
    """

    original_text: str = Field(..., description="Original citizen text exactly as submitted.")
    normalized_text: str = Field(..., description="Cleaned text with normalized whitespace and encoding.")
    detected_language: str = Field(..., description="ISO language code ('en', 'hi', 'sat', 'mixed', 'unknown').")
    script: str = Field(..., description="Detected script ('latin', 'devanagari', 'ol_chiki', 'mixed', 'unknown').")
    is_romanized: bool = Field(..., description="True if Indic language is written in Latin script (Hinglish).")
    language_confidence: float = Field(..., ge=0.0, le=1.0, description="Detection confidence score (0.0 to 1.0).")
    translation_required: bool = Field(..., description="True if text required translation to English.")
    transliterated_text: Optional[str] = Field(None, description="Devanagari text if transliterated from Romanized Hindi.")
    english_text: Optional[str] = Field(None, description="Standardized English representation.")
    translation_status: str = Field(..., description="Status of translation ('completed', 'not_required', 'failed', 'fallback').")
    translation_provider: Optional[str] = Field(None, description="Provider used for translation ('indictrans2', 'passthrough', null).")
    translation_error: Optional[str] = Field(None, description="Error message if translation failed.")


class ProcessedText(BaseModel):
    """
    Combined text preprocessing result for a citizen submission.
    Contains independent title and description analyses plus combined English text.
    """

    title: SingleFieldTextResult = Field(..., description="Individual preprocessing breakdown for title.")
    description: SingleFieldTextResult = Field(..., description="Individual preprocessing breakdown for description.")
    combined_english_text: str = Field(..., description="Unified standardized English text for downstream AI tasks.")
    processing_status: str = Field(..., description="Overall processing status ('completed', 'completed_with_warnings', 'failed').")

    # Backwards-compatibility properties for legacy callers expecting flat attributes
    @property
    def original_text(self) -> str:
        return self.description.original_text

    @property
    def normalized_text(self) -> str:
        return self.description.normalized_text

    @property
    def detected_language(self) -> str:
        return self.description.detected_language

    @property
    def language_confidence(self) -> float:
        return self.description.language_confidence

    @property
    def english_text(self) -> str:
        return self.combined_english_text

    @property
    def translation_required(self) -> bool:
        return self.title.translation_required or self.description.translation_required

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "title": {
                    "original_text": "  PANI   KI  BAHUTTT   BADI  PROBLEM!!! ",
                    "normalized_text": "PANI KI BAHUTTT BADI PROBLEM!!!",
                    "detected_language": "hi",
                    "script": "latin",
                    "is_romanized": True,
                    "language_confidence": 0.95,
                    "translation_required": True,
                    "transliterated_text": "पानी की बहुत बड़ी समस्या",
                    "english_text": "A very serious water problem.",
                    "translation_status": "completed",
                    "translation_provider": "indictrans2",
                    "translation_error": None
                },
                "description": {
                    "original_text": "   Hamare   gaon me pani nahi aa raha!!!! Pichleeee 10 din se problem hai... log bahut pareshan hain 😥😥   ",
                    "normalized_text": "Hamare gaon me pani nahi aa raha!!!! Pichleeee 10 din se problem hai... log bahut pareshan hain 😥😥",
                    "detected_language": "hi",
                    "script": "latin",
                    "is_romanized": True,
                    "language_confidence": 0.95,
                    "transliterated_text": "हमारे गांव में पानी नहीं आ रहा है। पिछले 10 दिन से समस्या है। लोग बहुत परेशान हैं।",
                    "english_text": "There has been no water supply in our village for the last 10 days, and people are facing serious difficulties.",
                    "translation_status": "completed",
                    "translation_provider": "indictrans2",
                    "translation_error": None
                },
                "combined_english_text": "A very serious water problem. There has been no water supply in our village for the last 10 days, and people are facing serious difficulties.",
                "processing_status": "completed"
            }
        }
    )
