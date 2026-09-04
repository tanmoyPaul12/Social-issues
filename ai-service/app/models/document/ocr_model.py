"""
OCR Model Wrapper: Interface for EasyOCR / Tesseract document text recognition.
"""
class OCRModel:
    """Wrapper for OCR text extraction engine."""
    def extract_text(self, image_bytes: bytes) -> str:
        return ""

ocr_engine = OCRModel()
