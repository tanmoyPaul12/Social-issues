#!/usr/bin/env python3
"""
Master Unified Multimodal & University Routing Pipeline CLI (`scripts/test_unified_pipeline.py`).

Tests complete end-to-end execution of:
  1. Multimodal Validation, Document Verification & 10-Domain Categorization
  2. Severity & Urgency Prioritization (1.0 to 10.0)
  3. Deduplication Bounding Check
  4. Academic Requirement Extraction (openai/gpt-oss-120b)
  5. Supabase PGVector Dense Retrieval
  6. Deterministic 6-Factor Institutional Capability Scoring
  7. Matched Faculty Experts Reranking with Rich Metadata
  8. Evidence-Backed Executive Policy Report Synthesis

Usage:
    cd "/home/bappaditya/coding/2026 Projects/sih project/Social-issues/ai-service"
    PYTHONPATH=. venv/bin/python3 scripts/test_unified_pipeline.py
"""

import sys
import json
from pathlib import Path

# ── Robust Path Resolution ──────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).resolve().parent
AI_SERVICE_DIR = SCRIPT_DIR.parent
sys.path.insert(0, str(AI_SERVICE_DIR))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def main():
    print("\n" + "=" * 90)
    print("🚀 MASTER UNIFIED MULTIMODAL INTELLIGENCE & UNIVERSITY ROUTING TEST")
    print("=" * 90)

    # Test 1: Health Check
    print("\n1. Testing GET /api/v1/unified-routing/health...")
    h_resp = client.get("/api/v1/unified-routing/health")
    assert h_resp.status_code == 200, f"Health check failed: {h_resp.text}"
    print(f"   ✅ Health Response: {h_resp.json()}")

    # Test 2: Unified Master API Analysis
    print("\n2. Testing POST /api/v1/unified-routing/analyze...")
    payload = {
        "problem_text": "High arsenic, fluoride, and heavy metal contamination in rural drinking tubewells in Dhanbad district. Need low-cost sustainable filtration technology, water quality testing laboratory facilities, prototyping, and community field deployment research team.",
        "document_text": "DISTRICT WATER QUALITY REPORT #DHN-990: Arsenic concentration 0.18 mg/L (Permissible limit: 0.01 mg/L). Fluoride concentration 3.8 mg/L. High toxic health risk.",
        "latitude": 23.9015,
        "longitude": 86.2045,
        "district": "Dhanbad",
        "state": "Jharkhand"
    }

    resp = client.post("/api/v1/unified-routing/analyze", json=payload)
    assert resp.status_code == 200, f"Master Unified API failed with status {resp.status_code}: {resp.text}"

    data = resp.json()
    val = data.get("validation", {})
    req = data.get("requirements", {})
    unis = data.get("scored_universities", [])
    experts = data.get("matched_faculty_experts", {})
    report = data.get("executive_report", {})

    print("\n" + "-" * 90)
    print("🎯 PHASE 1: MULTIMODAL VALIDATION, CATEGORIZATION & PRIORITIZATION")
    print("-" * 90)
    print(f"  • Submission Validated  : {val.get('is_valid')} (Authenticity: {val.get('authenticity_score') * 100:.1f}%)")
    print(f"  • Classified Domain     : {val.get('domain')}")
    print(f"  • Urgency & Severity    : {val.get('urgency_level')} Priority | Score: {val.get('severity_score')}/10.0")
    print(f"  • Identified Issues     : {', '.join(val.get('detected_issues', []))}")
    print(f"  • Evidence Summary      : {val.get('multimodal_evidence_summary')}")
    print(f"  • Deduplication Check   : Is Duplicate = {val.get('deduplication', {}).get('is_duplicate')}")

    print("\n" + "-" * 90)
    print("📊 PHASE 2: RANKED UNIVERSITY CAPABILITY SCORES (6-FACTOR WEIGHTED)")
    print("-" * 90)
    for idx, u in enumerate(unis, 1):
        print(f"🏆 Rank #{idx} | Score: {u.get('total_score') * 100:.1f}% ({u.get('total_score')})")
        print(f"   Institution : {u.get('university_name')} ({u.get('university_code')})")

    print("\n" + "-" * 90)
    print("👨‍🔬 PHASE 2: MATCHED PRIMARY FACULTY EXPERTS WITH CONTACT METADATA")
    print("-" * 90)
    for uni_code, exp_list in experts.items():
        print(f"\n📍 Matched Experts for {uni_code}:")
        for e in exp_list[:2]:
            print(f"   • {e.get('name')} ({e.get('designation')}) | Department: {e.get('department')}")
            print(f"     Email: {e.get('email')} | Phone: {e.get('phone', 'N/A')}")
            print(f"     Profile URL: {e.get('profile_url')}")
            print(f"     Photo URL  : {e.get('profile_image_url')}")
            print(f"     Pubs PDF   : {e.get('publications_pdf_url')}")

    print("\n" + "-" * 90)
    print("📜 EXECUTIVE POLICY REPORT FOR GOVERNMENT NODAL OFFICERS")
    print("-" * 90)
    print(f"💡 EXECUTIVE SUMMARY:\n   {report.get('executive_summary')}\n")
    print("📌 ACTIONABLE NEXT STEPS:")
    for step in report.get("suggested_next_steps", []):
        print(f"   [ ] {step}")

    print("\n" + "=" * 90)
    print("✅ MASTER UNIFIED MULTIMODAL & UNIVERSITY ROUTING PIPELINE COMPLETE!")
    print("=" * 90 + "\n")


if __name__ == "__main__":
    main()
