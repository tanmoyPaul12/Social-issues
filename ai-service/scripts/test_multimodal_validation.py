#!/usr/bin/env python3
"""
Standalone Multimodal Validation & Categorization Test CLI (`scripts/test_multimodal_validation.py`).

Tests and measures performance, categorization accuracy across 10 societal domains,
severity scoring, and deduplication for problem text, attached documents, and location data.

Usage:
    cd "/home/bappaditya/coding/2026 Projects/sih project/Social-issues/ai-service"
    PYTHONPATH=. venv/bin/python3 scripts/test_multimodal_validation.py
"""

import sys
import time
import json
from pathlib import Path

# ── Robust Path Resolution ──────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).resolve().parent
AI_SERVICE_DIR = SCRIPT_DIR.parent
sys.path.insert(0, str(AI_SERVICE_DIR))

from app.agents.multimodal_validator import validate_and_classify_submission, SOCIETAL_DOMAINS
from app.services.deduplication import PriorReport

# Sample Benchmark Test Submissions across 5 different categories
BENCHMARK_SUBMISSIONS = [
    {
        "id": "CASE-01 (Water)",
        "text": "Severe arsenic and fluoride contamination in drinking tubewells in Topchanchi block, Dhanbad. Water testing shows 0.15 mg/L arsenic causing skin lesions.",
        "doc": "LAB TEST REPORT: Water Sample #DHN-891. Arsenic: 0.15 mg/L (Permissible limit: 0.01 mg/L). Fluoride: 3.5 mg/L. High risk to rural health.",
        "lat": 23.9015,
        "lon": 86.2045,
        "expected_domain": "Water Resources & Sanitation"
    },
    {
        "id": "CASE-02 (Agriculture)",
        "text": "Extensive yellow rust crop infection affecting 400 hectares of paddy fields in Govindpur. Urgent disease diagnosis, bio-pesticide, and soil health monitoring needed.",
        "doc": "AGRICULTURE EXTENSION NOTICE: Fungal spore infection detected in Kharif paddy crop. Farmers reporting 45% yield drop.",
        "lat": 23.8321,
        "lon": 86.5210,
        "expected_domain": "Agriculture & Farming Innovation"
    },
    {
        "id": "CASE-03 (Healthcare)",
        "text": "Lack of cold-chain refrigeration units and neonatal intensive care monitoring equipment at Primary Health Centre in Nirsa block, risking infant survival.",
        "doc": "DISTRICT HEALTH AUDIT REPORT: PHC Nirsa requires solar-powered vaccine refrigerators and pediatric incubators.",
        "lat": 23.7845,
        "lon": 86.7112,
        "expected_domain": "Healthcare & Public Health Infrastructure"
    },
    {
        "id": "CASE-04 (Energy)",
        "text": "Frequent 14-hour power outages disrupting rural micro-enterprises and schools. Need decentralized micro-grid solar photovoltaic power plants.",
        "doc": "VILLAGE ENERGY SURVEY: 68 households willing to adopt community solar micro-grid with battery energy storage system.",
        "lat": 23.7500,
        "lon": 86.4000,
        "expected_domain": "Energy, Solar & Clean Energy"
    },
    {
        "id": "CASE-05 (Duplicate Case)",
        "text": "Arsenic contamination in drinking tubewells in Topchanchi block, Dhanbad. People getting sick due to toxic water.",
        "doc": "Duplicate notice submitted by another villager.",
        "lat": 23.9020,
        "lon": 86.2050,
        "expected_domain": "Water Resources & Sanitation"
    }
]

# Simulated prior database reports for deduplication test
PRIOR_REPORTS = [
    PriorReport(
        report_id="REPORT-PREV-101",
        problem_text="Severe arsenic contamination in drinking tubewells in Topchanchi block Dhanbad water testing skin lesions",
        domain="Water Resources & Sanitation",
        latitude=23.9015,
        longitude=86.2045,
        district="Dhanbad",
        created_at="2026-09-10"
    )
]


def run_benchmark():
    print("\n" + "=" * 90)
    print("🔬 MULTIMODAL PROBLEM VALIDATOR & 10-DOMAIN CLASSIFIER BENCHMARK TEST")
    print("=" * 90)
    print(f"Supported Core Domains ({len(SOCIETAL_DOMAINS)}):\n")
    for idx, dom in enumerate(SOCIETAL_DOMAINS, 1):
        print(f"  {idx:2d}. {dom}")
    print("-" * 90)

    total_start = time.time()
    results_summary = []

    for test in BENCHMARK_SUBMISSIONS:
        print(f"\n📋 Executing Test: {test['id']}")
        print(f"   Problem Text : {test['text'][:110]}...")
        if test.get("doc"):
            print(f"   Attached Doc : {test['doc'][:110]}...")
        print(f"   Location GPS : Lat {test['lat']}, Lon {test['lon']}")

        start_time = time.time()
        res = validate_and_classify_submission(
            problem_text=test["text"],
            document_text=test.get("doc"),
            latitude=test["lat"],
            longitude=test["lon"],
            prior_reports=PRIOR_REPORTS if "Duplicate" in test["id"] else None
        )
        elapsed = time.time() - start_time

        print(f"\n   🎯 VALIDATION & CLASSIFICATION RESULT (in {elapsed:.2f}s):")
        print(f"      • Is Valid Submission : {res.is_valid} (Authenticity Score: {res.authenticity_score * 100:.1f}%)")
        print(f"      • Classified Domain   : {res.domain}")
        print(f"      • Urgency Level       : {res.urgency_level} | Severity Score: {res.severity_score}/10.0")
        print(f"      • Detected Issues     : {', '.join(res.detected_issues)}")
        print(f"      • Multimodal Summary  : {res.multimodal_evidence_summary}")
        print(f"      • Deduplication Check : Is Duplicate = {res.deduplication.is_duplicate}")
        if res.deduplication.is_duplicate:
            print(f"        └── Duplicate Of    : {res.deduplication.duplicate_report_id} ({res.deduplication.reason})")

        match_status = "✅ MATCHED" if res.domain == test["expected_domain"] else f"⚠️ EXPECTED {test['expected_domain']}"
        print(f"      • Domain Match Status : {match_status}")

        results_summary.append({
            "case": test["id"],
            "domain": res.domain,
            "expected": test["expected_domain"],
            "urgency": res.urgency_level,
            "severity": res.severity_score,
            "is_duplicate": res.deduplication.is_duplicate,
            "latency_sec": round(elapsed, 2)
        })

    total_elapsed = time.time() - total_start
    avg_latency = total_elapsed / len(BENCHMARK_SUBMISSIONS)

    print("\n" + "=" * 90)
    print("📊 BENCHMARK EVALUATION SUMMARY REPORT")
    print("=" * 90)
    print(f"  • Total Benchmark Test Cases : {len(BENCHMARK_SUBMISSIONS)}")
    print(f"  • Total Execution Time      : {total_elapsed:.2f} seconds")
    print(f"  • Average Latency Per Case  : {avg_latency:.2f} seconds")

    correct_matches = sum(1 for r in results_summary if r["domain"] == r["expected"])
    print(f"  • Domain Categorization Acc : {correct_matches}/{len(BENCHMARK_SUBMISSIONS)} ({correct_matches/len(BENCHMARK_SUBMISSIONS)*100:.1f}%)\n")

    for r in results_summary:
        print(f"  [{r['case']}] -> Domain: {r['domain']} | Urgency: {r['urgency']} ({r['severity']}/10) | Duplicate: {r['is_duplicate']} | Time: {r['latency_sec']}s")

    print("\n" + "=" * 90)
    print("✅ MULTIMODAL VALIDATION COMPONENT TEST COMPLETE!")
    print("=" * 90 + "\n")


if __name__ == "__main__":
    run_benchmark()
