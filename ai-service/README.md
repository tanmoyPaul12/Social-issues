# AI Microservice — Societal Innovation Collaboration Portal

Modular Python/FastAPI microservice providing multi-modal validation, AI problem categorization, urgency prioritization, vector deduplication, and Higher Education Institution (HEI) university routing for grassroots societal challenges in Jharkhand.

---

## 🏗️ 4-Modality Multimodal Architecture Blueprint

```text
               CITIZEN PETITION / ISSUE SUBMISSION
                                │
   ┌────────────────────────────┼────────────────────────────┐
   ▼                            ▼                            ▼
1. TEXT PART                2. IMAGE PART               3. DOCUMENT PART            4. LOCATION PART
(Hinglish / Hindi / Eng)    (Visual Evidence / OCR)     (PDF / Petition Fact Ex)    (GIS / District Match)
   │                            │                            │                           │
   ▼                            ▼                            ▼                           ▼
Text Preprocessor           Vision Preprocessor          Document Preprocessor       Location Processor
(IndicTrans2 / NIM)         (NVIDIA NIM Vision)          (Structured Fact Ex)        (24 Districts Match)
   │                            │                            │                           │
   ▼                            ▼                            ▼                           ▼
[Text Category & Score]     [Image Category & Score]    [Doc Category & Score]      [Location Bonus]
   │                            │                            │                           │
   └────────────────────────────┴─────────────┬──────────────┴───────────────────────────┘
                                              │
                                              ▼
                             MULTIMODAL GENERALIZATION ENGINE
                             (/api/v1/intelligence/process)
                                              │
                       ┌──────────────────────┴──────────────────────┐
                       ▼                                             ▼
            WEIGHTED PRIORITY AVERAGE                     CONSENSUS CATEGORY
          Doc (35%) + Text (35%) + Img (20%)             Dominant Category Across
                + Location Bonus (10%)                         Modalities
                       │                                             │
                       └──────────────────────┬──────────────────────┘
                                              │
                                              ▼
                                NODAL OFFICER & DEPARTMENT PORTAL
                                (Detailed AI Audit & Assignee Flow)
```

---

## 🚀 Multimodal Generalization API

### `POST /api/v1/intelligence/process`

Processes 4-modality citizen submission payloads (Text, Image, Document, Location), computes individual modality scores, and generalizes them into a weighted average priority score & consensus category.

#### Request Example:

```json
{
  "issue_id": "GRI-2026-981245",
  "text": {
    "title": "Village Mein Serious Paani Ki Problem",
    "description": "Handpump is broken for 3 months affecting 300 families."
  },
  "image": {
    "is_valid": true,
    "visual_analysis": {
      "visual_summary": "Broken village handpump with rust and pipe damage.",
      "suggested_categories": ["WATER_RESOURCES"],
      "severity_score": 75
    }
  },
  "document": {
    "is_valid": true,
    "document_analysis": {
      "document_type": "public_issue_report",
      "main_issue": "Drinking water supply disruption",
      "affected_population_description": "300 families",
      "duration_days": 90,
      "essential_service": "WATER_RESOURCES",
      "suggested_category": "WATER_RESOURCES"
    }
  },
  "location": {
    "latitude": 23.654,
    "longitude": 86.154,
    "district": "Bokaro",
    "block": "Chas"
  }
}
```

#### Response Example:

```json
{
  "success": true,
  "message": "4-Modality Generalized Intelligence computed successfully.",
  "data": {
    "issue_id": "GRI-2026-981245",
    "modality_breakdown": {
      "text_analysis": {
        "category": "WATER_RESOURCES",
        "priority_score": 85
      },
      "image_analysis": {
        "category": "WATER_RESOURCES",
        "priority_score": 75
      },
      "document_analysis": {
        "category": "WATER_RESOURCES",
        "priority_score": 90
      },
      "location_analysis": {
        "is_valid": true,
        "district": "Bokaro",
        "is_in_jharkhand": true,
        "urgency_bonus": 10
      }
    },
    "generalized_consensus": {
      "final_category": "WATER_RESOURCES",
      "average_priority_score": 88,
      "final_priority_level": "CRITICAL",
      "consensus_reason": "High-confidence alignment across text, image, and document petition."
    }
  }
}
```

---

```text
ai-service/
├── app/
│   ├── main.py                  # FastAPI application entrypoint & middleware
│   ├── api/
│   │   ├── routes/              # HTTP endpoint route handlers (/analyze, /categorization, /routing, etc.)
│   │   └── schemas/             # Pydantic V2 data validation contracts
│   ├── validation/              # Content & Jharkhand GIS location validators
│   ├── preprocessing/           # Multi-modal text, image, video, and PDF processors
│   ├── models/                  # ML embedding & vision model wrappers
│   ├── categorization/          # 10 Official Jharkhand Research Domain classifiers
│   ├── prioritization/          # Urgency & social impact scoring engine
│   ├── deduplication/           # Vector & spatial radius similarity search engine
│   ├── routing/                 # HEI university matching & recommendation engine
│   ├── verification/            # Multi-modal evidence consistency engine
│   ├── pipelines/               # Unified challenge processing pipeline
│   ├── infrastructure/          # S3 object storage & pgvector database clients
│   └── utils/                   # Structured logging, MD5 hashing, and PyTorch CUDA/CPU helpers
├── Dockerfile                   # Production AWS multi-stage container build
└── requirements.txt             # Production dependencies
```

---

## 🚀 Running Locally

```bash
# 1. Navigate to AI Service directory
cd ai-service

# 2. Use Python 3.11 (required by the native IndicTransToolkit dependency)
python3.11 -m venv venv
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run development server
uvicorn app.main:app --reload --port 8000
```

Access Swagger UI interactive API documentation at: `http://localhost:8000/docs`

## IndicTrans2 translation setup

The IndicTrans2 files must be available at:

```text
models/indictrans2/indic-en
```

If the files are not present, download them once:

```bash
python scripts/setup_indictrans2.py
```

Install the dependencies and verify that the real model can translate a Hindi
sentence (the verification script must end with `Local translation inference succeeded!`):

```bash
pip install -r requirements.txt
python scripts/test_indictrans2.py
```

Python 3.14 is not recommended for local setup because IndicTransToolkit
contains a compiled extension. On Ubuntu/Debian, install the required support
first if needed:

```bash
sudo apt-get install python3.11 python3.11-venv python3.11-dev build-essential
```

The application uses `INDICTRANS_MODEL_PATH` and `TRANSLATION_DEVICE` from the
environment. For local development, the default path is relative to the
`ai-service` directory. Use an absolute path when starting the service from a
different directory.

## Docker test for the whole team

The model is copied into the image, so every developer and CI environment uses
the same model and Python dependencies. From this directory run:

```bash
docker compose up --build
```

Wait until the service is healthy, then in another terminal run:

```bash
sh scripts/test_api.sh
```

The API is available at `http://localhost:8000`, and Swagger is available at
`http://localhost:8000/docs`. Stop the container with:

```bash
docker compose down
```

The frontend or backend can call the text endpoint with:

```bash
curl -X POST http://localhost:8000/api/v1/preprocessing/text \
  -H 'Content-Type: application/json' \
  -d '{"title":"पानी की समस्या","description":"हमारे गांव में पानी की समस्या है।"}'
```

The response contains `combined_english_text`, `translation_status`, and
`translation_provider`. A successful real-model response should report
`translation_provider: "indictrans2"` and an English translation. If it reports
`translation_provider: "fallback"`, the model was not used; inspect the logs
with `docker compose logs ai-service` and fix the reported dependency or model
loading error. The fallback is only for development and does not translate
arbitrary Santali text.
