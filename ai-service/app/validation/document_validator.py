"""
Document Validator: Uses PyMuPDF (fitz) for fast deterministic PDF document validation.
Checks:
- File type check (PDF, DOCX, TXT)
- Can PDF be opened? (Corruption & Encryption check)
- Page count check (Maximum 20 pages)
- Text extraction check:
  - If text is directly selectable -> PASS (🟢)
  - If no selectable text (scanned PDF/image PDF) -> FLAG (🟡) for OCR processing (PaddleOCR)
  - If corrupt / unreadable -> REJECT (🔴)

Returns 3-state status: PASS (🟢), FLAG (🟡), or REJECT (🔴).
Note: Document validation checks technical readability (Does NOT prove official government authenticity).
"""
import io
from typing import Dict, Any

VALID_DOC_MIMES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/csv"
}

def validate_document_bytes(doc_bytes: bytes, mime_type: str, file_name: str = "") -> Dict[str, Any]:
    """
    Validates PDF or text document binary content deterministically using PyMuPDF (fitz).
    """
    issues = []
    status = "PASS"
    text_extracted = ""
    page_count = 0
    requires_ocr = False
    
    # 1. MIME / Format Check
    clean_mime = mime_type.lower().strip()
    is_pdf = "pdf" in clean_mime or file_name.lower().endswith(".pdf")
    
    if not is_pdf and clean_mime not in VALID_DOC_MIMES:
        return {
            "status": "REJECT",
            "quality": 0.0,
            "issues": [f"Unsupported document format '{mime_type}'."],
            "metadata": {}
        }

    # 2. Size Limit Check (20 MB Limit)
    MAX_SIZE = 20 * 1024 * 1024
    if len(doc_bytes) > MAX_SIZE:
        return {
            "status": "REJECT",
            "quality": 0.0,
            "issues": [f"Document size ({len(doc_bytes)/(1024*1024):.1f}MB) exceeds 20MB limit."],
            "metadata": {}
        }

    # 3. PDF Inspection via PyMuPDF (fitz)
    if is_pdf:
        try:
            import fitz  # PyMuPDF
            doc = fitz.open(stream=doc_bytes, filetype="pdf")
            page_count = doc.page_count
            
            # Encrypted check
            if doc.is_encrypted:
                return {
                    "status": "REJECT",
                    "quality": 0.0,
                    "issues": ["PDF is password protected or encrypted."],
                    "metadata": {"encrypted": True}
                }

            # Page count check
            if page_count > 20:
                issues.append(f"Document contains {page_count} pages (recommended max 20 pages).")
                status = "FLAG"

            # Text extraction check across pages
            full_text_list = []
            for i in range(min(page_count, 5)):
                page = doc.load_page(i)
                txt = page.get_text()
                if txt.strip():
                    full_text_list.append(txt.strip())

            text_extracted = " ".join(full_text_list)
            doc.close()

            # No text available check -> Scanned PDF requiring OCR
            if not text_extracted or len(text_extracted) < 10:
                requires_ocr = True
                issues.append("No selectable text found in PDF (scanned document). Flagged for OCR processing.")
                status = "FLAG"

        except Exception as e:
            # Fallback if fitz module isn't loaded or PDF fails
            return {
                "status": "REJECT",
                "quality": 0.0,
                "issues": [f"Corrupted or invalid PDF file: {str(e)}"],
                "metadata": {}
            }

    quality = 0.95 if status == "PASS" else 0.70 if status == "FLAG" else 0.0

    return {
        "status": status,
        "quality": round(quality, 2),
        "issues": issues,
        "metadata": {
            "page_count": page_count,
            "text_extractable": len(text_extracted) > 0,
            "requires_ocr": requires_ocr,
            "sample_length": len(text_extracted)
        }
    }
