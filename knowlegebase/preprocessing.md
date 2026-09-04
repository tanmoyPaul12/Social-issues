---
id: preprocessing
title: "AI Preprocessing Layer Architecture Plan"
tags:
  - docs
  - ai-service
  - preprocessing
moc: [[MOC_AI_Service]]
---

# Preprocessing Layer — Detailed Architecture Plan
**Service**: AI Microservice — `ai-service/`
**Layer**: 2 of 5 (Validation → **Preprocessing** → AI Features → Verification → Pipeline)
**Last Updated**: 2026-09-02
**Author**: Architecture Reference Document

---

## 1. Purpose & Philosophy

The Preprocessing Layer is the **data transformation boundary** between raw validated citizen data and AI-ready standardized input. It receives a `PASS` or `FLAG` result from the Validation Layer and converts every piece of multimodal citizen evidence into a **clean, normalized, language-agnostic, AI-consumable** format.

### Core Rule
> **Never mutate original citizen data.**
> Original text, files, and coordinates must always be preserved alongside the preprocessed version.

This is non-negotiable for:
- Government audit compliance
- Human reviewer override workflows
- AI model training datasets (future)
- Legal defensibility of AI outputs

---

## 2. Layer Position in the Full Pipeline

```
Citizen Submission
        │
        ▼
┌─────────────────────────────┐
│     VALIDATION LAYER        │  ← COMPLETED ✅
│  Text / Image / Video /     │
│  Document / Location        │
└─────────────┬───────────────┘
              │ PASS / FLAG
              ▼
┌─────────────────────────────┐
│    PREPROCESSING LAYER      │  ← THIS DOCUMENT
│  Text / Image / Video /     │
│  Document / Location        │
└─────────────┬───────────────┘
              │ Standardized AI-ready data
              ▼
┌─────────────────────────────┐
│      AI FEATURES            │
│  Categorization             │
│  Prioritization             │
│  Deduplication              │
│  University Routing         │
└─────────────────────────────┘
```

---

## 3. Module Structure

```
ai-service/app/preprocessing/
│
├── orchestrator.py           # Main coordinator — receives validated challenge, dispatches to sub-pipelines
│
├── text/
│   ├── language_detector.py  # Devanagari / Ol Chiki / Latin detection
│   ├── text_cleaner.py       # Unicode normalization, whitespace cleanup
│   ├── translator.py         # Provider-abstracted translation interface (IndicTrans2 / passthrough)
│   └── text_preprocessor.py  # Full text pipeline coordinator
│
├── image/
│   ├── image_normalizer.py   # Resize + orientation fix + format conversion
│   ├── metadata_extractor.py # EXIF, GPS, dimensions, capture timestamp
│   └── image_preprocessor.py # Full image pipeline coordinator
│
├── video/
│   ├── video_metadata.py     # Duration, FPS, resolution extraction
│   ├── frame_extractor.py    # OpenCV evenly-spaced keyframe sampler
│   └── video_preprocessor.py # Full video pipeline coordinator
│
├── document/
│   ├── document_parser.py    # Route: digital PDF vs scanned PDF vs image-doc
│   ├── pdf_extractor.py      # PyMuPDF text layer extraction
│   ├── document_renderer.py  # Render scanned PDF pages to images for OCR
│   ├── ocr_processor.py      # Tesseract / PaddleOCR text extraction
│   └── document_preprocessor.py # Full document pipeline coordinator
│
└── location/
    ├── coordinate_normalizer.py # Round, bound-check, format coordinates
    ├── reverse_geocoder.py      # Lat/Lng → State / District / Block (offline geopy)
    └── location_preprocessor.py # Full location pipeline coordinator
```

---

## 4. Sub-Pipeline Specifications

### 4.1 Text Pipeline

**Goal**: Produce a clean, English-representable text for embedding models (multilingual-E5 handles Hindi natively, so translation is optional but stored for future).

```
Original Text (title + description)
         │
         ▼
  Unicode NFKC normalization
         │
         ▼
  Whitespace / line-break cleanup
         │
         ▼
  Language Detection
  ├── Devanagari ratio > 0.4 → "hi"
  ├── Ol Chiki ratio > 0.4  → "sat"
  └── Default               → "en"
         │
         ▼
  Translation (if non-English)
  └── Provider: IndicTrans2 (future) / passthrough (now)
         │
         ▼
  Output: PreprocessedText schema
```

**Output Schema**:
```json
{
  "original_title": "पानी की समस्या",
  "original_description": "हमारे गांव में पानी नहीं आ रहा है।",
  "normalized_title": "पानी की समस्या",
  "normalized_description": "हमारे गांव में पानी नहीं आ रहा है।",
  "detected_language": "hi",
  "language_confidence": 0.97,
  "english_title": "Water problem",
  "english_description": "There is no water supply in our village.",
  "was_translated": false
}
```

**Models Used**:
- Language detection: Pure regex (script analysis) — no model needed
- Translation: `IndicTrans2` (future, load-on-demand) or pass-through for now
- Embedding: `multilingual-E5-small` (loaded in AI Feature layer)

**Performance Target**: < 50ms per challenge (CPU only, no model inference here)

---

### 4.2 Image Pipeline

**Goal**: Produce a normalized, correctly-oriented, standard-format image for MobileCLIP feature extraction.

```
Original image bytes (from S3 presigned URL)
         │
         ▼
  Validate format (JPEG / PNG / WebP)
         │
         ▼
  EXIF metadata extraction
  (GPS, timestamp, device model)
         │
         ▼
  EXIF orientation correction
  (auto-rotate using Pillow)
         │
         ▼
  Convert to RGB (strip alpha, palette modes)
         │
         ▼
  Resize to (224×224) for model input
         │
         ▼
  Generate WebP thumbnail (320×240)
         │
         ▼
  Store: processed/ + thumbnails/
         │
         ▼
  Output: PreprocessedImage schema
```

**Output Schema**:
```json
{
  "original_url": "s3://challenge-media/original/CH-1001/road.jpg",
  "processed_url": "s3://challenge-media/processed/CH-1001/road.webp",
  "thumbnail_url": "s3://challenge-media/thumbnails/CH-1001/road_thumb.webp",
  "original_dimensions": [4032, 3024],
  "target_dimensions": [224, 224],
  "format": "JPEG",
  "exif_gps_available": true,
  "capture_timestamp": "2026-08-15T10:30:00"
}
```

**Models Used**:
- `Pillow` — resize, orientation, format conversion
- `piexif` — EXIF metadata read

**Performance Target**: < 200ms per image (CPU, Pillow)

---

### 4.3 Video Pipeline

**Goal**: Extract 6 representative frames from video evidence to avoid full video AI processing (preserves RTX 2050 4GB VRAM budget).

```
Original video bytes
         │
         ▼
  Metadata extraction (OpenCV)
  (duration, FPS, resolution, total frames)
         │
         ▼
  Frame interval calculation:
  interval = total_frames / 6
         │
         ▼
  Seek to: 0%, 20%, 40%, 60%, 80%, 100%
         │
         ▼
  For each frame:
  │  ├── BGR → RGB conversion
  │  ├── Resize to (224×224)
  │  └── Save as JPEG bytes
         │
         ▼
  Store frames: processed/CH-1001/frames/
         │
         ▼
  Output: PreprocessedVideo schema
```

**Output Schema**:
```json
{
  "original_url": "s3://challenge-media/original/CH-1001/evidence.mp4",
  "duration_seconds": 32.5,
  "fps": 30.0,
  "resolution": [1920, 1080],
  "total_frames": 975,
  "frames_extracted": 6,
  "frame_urls": [
    "s3://challenge-media/processed/CH-1001/frames/frame_001.jpg",
    "s3://challenge-media/processed/CH-1001/frames/frame_002.jpg"
  ]
}
```

**Models Used**:
- `opencv-python-headless` — video reading + frame extraction

**Performance Target**: < 3s for a 60-second video (CPU, sequential frame reads)

---

### 4.4 Document Pipeline

**Goal**: Extract text from PDF documents with smart fallback: try native text first, OCR only when necessary.

```
Original PDF bytes
         │
         ▼
  PyMuPDF → has_text_layer?
  │
  ├── YES (digital PDF)
  │     │
  │     ▼
  │  Extract text via PyMuPDF
  │  (fitz.page.get_text())
  │
  └── NO (scanned PDF / image-based)
        │
        ▼
     Render each page to image
     (fitz.page.get_pixmap())
        │
        ▼
     OCR via Tesseract
     (eng + hin language packs)
        │
        ▼
  Extracted text
         │
         ▼
  Run extracted text through text_cleaner.py
         │
         ▼
  Output: PreprocessedDocument schema
```

**Output Schema**:
```json
{
  "original_url": "s3://challenge-media/documents/CH-1001/report.pdf",
  "page_count": 4,
  "extraction_method": "PYMUPDF",
  "ocr_used": false,
  "extracted_text": "The road in ward 7 has developed large potholes...",
  "normalized_text": "the road in ward 7 has developed large potholes",
  "detected_language": "en"
}
```

**Models Used**:
- `PyMuPDF (fitz)` — native PDF text extraction
- `pytesseract` — OCR fallback (CPU)

**Performance Target**: < 1s for digital PDF; < 5s for scanned PDF with OCR

---

### 4.5 Location Pipeline

**Goal**: Normalize raw coordinates and produce a structured administrative geography record.

```
Raw: latitude, longitude, district, block
         │
         ▼
  Round coordinates to 6 decimal places
         │
         ▼
  Bounds check (Jharkhand bounding box):
  Lat: 21.97 – 25.33
  Lng: 83.32 – 87.48
         │
         ▼
  Reverse geocoding (offline — geopy + static data)
  → State / District / Block / Village
         │
         ▼
  Cross-check with submitted district
  (if mismatch → FLAG for human review)
         │
         ▼
  Output: PreprocessedLocation schema
```

**Output Schema**:
```json
{
  "submitted_district": "Ranchi",
  "submitted_block": "Kanke",
  "latitude": 23.344100,
  "longitude": 85.309600,
  "resolved_state": "Jharkhand",
  "resolved_district": "Ranchi",
  "resolved_block": "Kanke",
  "district_match": true,
  "is_within_jharkhand": true
}
```

**Models Used**:
- `geopy` — offline reverse geocoding (Nominatim with local data)
- No ML model needed

**Performance Target**: < 100ms (offline geocoder, no external API calls)

---

## 5. Preprocessing Orchestrator

The `orchestrator.py` is the **single entry point** for the entire layer. No AI Feature module calls individual preprocessors directly — everything goes through the orchestrator.

```python
class PreprocessingOrchestrator:

    async def process(self, challenge_id: str, validated_data: dict) -> PreprocessedChallenge:
        # 1. Text
        text_result = await self._process_text(validated_data)
        
        # 2. Location  
        location_result = await self._process_location(validated_data)
        
        # 3. Attachments (dispatched by type)
        attachment_results = await self._process_attachments(validated_data.get("attachments", []))
        
        # 4. Build standardized output
        return PreprocessedChallenge(
            challenge_id=challenge_id,
            text=text_result,
            location=location_result,
            images=attachment_results["images"],
            videos=attachment_results["videos"],
            documents=attachment_results["documents"],
            preprocessing_status="COMPLETED"
        )
```

### Processing Status Machine
```
VALIDATED
    ↓
PREPROCESSING_PENDING
    ↓
PREPROCESSING_IN_PROGRESS
    ↓
PREPROCESSING_COMPLETED  ──→  AI_ANALYSIS_PENDING
    ↓ (on error)
PREPROCESSING_FAILED
```

---

## 6. Standardized Final Output Schema

```json
{
  "challenge_id": "CH-1001",
  "preprocessing_status": "COMPLETED",
  "preprocessed_at": "2026-09-02T11:30:00Z",

  "text": {
    "original_title": "Broken village handpump",
    "original_description": "The handpump has not worked for three months.",
    "normalized_title": "Broken village handpump",
    "normalized_description": "The handpump has not worked for three months.",
    "detected_language": "en",
    "language_confidence": 0.98,
    "english_title": "Broken village handpump",
    "english_description": "The handpump has not worked for three months.",
    "was_translated": false
  },

  "location": {
    "latitude": 23.669300,
    "longitude": 86.151100,
    "submitted_district": "Bokaro",
    "submitted_block": "Chas",
    "resolved_district": "Bokaro",
    "resolved_block": "Chas",
    "district_match": true,
    "is_within_jharkhand": true
  },

  "images": [
    {
      "original_url": "...",
      "processed_url": "...",
      "thumbnail_url": "...",
      "original_dimensions": [4032, 3024],
      "exif_gps_available": false,
      "capture_timestamp": null
    }
  ],

  "videos": [],

  "documents": [
    {
      "original_url": "...",
      "page_count": 2,
      "extraction_method": "PYMUPDF",
      "ocr_used": false,
      "extracted_text": "..."
    }
  ]
}
```

---

## 7. Model Resource Budget (RTX 2050 4GB VRAM)

The preprocessing layer is **model-free** (pure CPU). No GPU is consumed here.

| Pipeline | Libraries | GPU Required | Approx. Latency |
|---|---|---|---|
| Text cleaning | stdlib, unicodedata | ❌ | < 5ms |
| Language detection | regex (script analysis) | ❌ | < 5ms |
| Translation (future) | IndicTrans2 | ✅ (optional) | 200–500ms |
| Image normalization | Pillow, piexif | ❌ | < 200ms |
| Video frame extraction | OpenCV | ❌ | < 3s |
| Document extraction | PyMuPDF | ❌ | < 500ms |
| OCR fallback | pytesseract | ❌ (CPU) | 1–5s |
| Location normalization | geopy | ❌ | < 100ms |

**GPU budget is reserved entirely for the AI Feature Layer** (categorization, deduplication, routing via E5-small + MobileCLIP).

---

## 8. Storage Layout

```
Object Storage (MinIO / Azure Blob / S3)
│
├── challenge-media/
│   ├── original/
│   │   └── CH-1001/
│   │       ├── road.jpg           ← Never deleted
│   │       ├── evidence.mp4       ← Never deleted
│   │       └── report.pdf         ← Never deleted
│   │
│   ├── processed/
│   │   └── CH-1001/
│   │       ├── road_normalized.webp
│   │       ├── frames/
│   │       │   ├── frame_001.jpg
│   │       │   └── frame_006.jpg
│   │       └── report_extracted.json
│   │
│   └── thumbnails/
│       └── CH-1001/
│           └── road_thumb.webp
```

---

## 9. Implementation Phases

### Phase 1 — Schemas First ✅ Target
Define Pydantic input/output schemas before writing any logic.

Files to create:
- `api/schemas/preprocessing.py` — `PreprocessingRequest`, `PreprocessedChallenge`
- `api/schemas/evidence.py` — `PreprocessedImage`, `PreprocessedVideo`, `PreprocessedDocument`

### Phase 2 — Text Pipeline
Files:
- `preprocessing/text/text_cleaner.py`
- `preprocessing/text/language_detector.py` (upgrade existing stub)
- `preprocessing/text/translator.py` (provider interface + passthrough impl)
- `preprocessing/text/text_preprocessor.py` (coordinator)

### Phase 3 — Location Pipeline
Files:
- `preprocessing/location/coordinate_normalizer.py`
- `preprocessing/location/reverse_geocoder.py`
- `preprocessing/location/location_preprocessor.py`

### Phase 4 — Image Pipeline
Files:
- `preprocessing/image/metadata_extractor.py`
- `preprocessing/image/image_normalizer.py`
- `preprocessing/image/image_preprocessor.py`

### Phase 5 — Document Pipeline
Files:
- `preprocessing/document/document_parser.py`
- `preprocessing/document/pdf_extractor.py` (upgrade existing stub)
- `preprocessing/document/document_renderer.py`
- `preprocessing/document/ocr_processor.py` (upgrade existing stub)
- `preprocessing/document/document_preprocessor.py`

### Phase 6 — Video Pipeline
Files:
- `preprocessing/video/video_metadata.py`
- `preprocessing/video/frame_extractor.py` (upgrade existing stub)
- `preprocessing/video/video_preprocessor.py`

### Phase 7 — Preprocessing Orchestrator
File:
- `preprocessing/orchestrator.py`

### Phase 8 — API Route
File:
- `api/routes/preprocess.py` — `POST /api/v1/preprocess`

---

## 10. Cloud-Portability Design Rules

All preprocessing code must follow these rules to remain cloud-portable:

1. **No hardcoded storage paths** — all file I/O goes through `infrastructure/storage.py` abstraction.
2. **No hardcoded connection strings** — loaded from environment variables via `pydantic-settings`.
3. **No direct Azure/AWS SDK calls in business logic** — only in `infrastructure/` layer.
4. **Async-first** — all I/O-bound operations (file reads, S3 fetches) use `async/await`.
5. **Config-driven** — target sizes, frame counts, OCR thresholds all in `.env` or config, never hardcoded.

### Storage Abstraction Interface
```python
# infrastructure/storage.py
class StorageProvider(ABC):
    async def upload(self, key: str, data: bytes, content_type: str) -> str: ...
    async def download(self, key: str) -> bytes: ...
    async def get_presigned_url(self, key: str, expiry_seconds: int) -> str: ...

class LocalStorageProvider(StorageProvider): ...     # Development
class MinIOStorageProvider(StorageProvider): ...     # Staging
class AzureBlobStorageProvider(StorageProvider): ... # Production Azure
```

---

## 11. Testing Plan

```
tests/preprocessing/
├── test_text_preprocessor.py       ← Hindi, English, Santali, Romanized Hindi
├── test_image_preprocessor.py      ← Valid JPEG, corrupt file, EXIF GPS present
├── test_video_preprocessor.py      ← 30-sec MP4, short video, corrupt file
├── test_document_preprocessor.py   ← Digital PDF, scanned PDF, empty PDF
├── test_location_preprocessor.py   ← In-bounds, out-of-bounds, district mismatch
└── test_orchestrator.py            ← Full integration: text + image + location
```

Each test asserts:
1. Output schema matches `PreprocessedChallenge` exactly
2. Original data is preserved unchanged
3. Edge cases (empty text, corrupt file, missing GPS) return graceful errors

---

## 12. Dependencies to Add

```
# requirements.txt additions
piexif>=1.1.3          # EXIF metadata extraction
pytesseract>=0.3.10    # OCR fallback
# opencv-python-headless  ← already in requirements.txt
# PyMuPDF               ← already in requirements.txt
# Pillow                ← already in requirements.txt
# geopy                 ← already in requirements.txt
```

---

*This document is the single source of truth for the Preprocessing Layer architecture.*
*Update this document when any design decision changes.*
