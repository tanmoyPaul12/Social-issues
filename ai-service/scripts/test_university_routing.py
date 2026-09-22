#!/usr/bin/env python3
"""
End-to-End University Capability Routing Test CLI (`scripts/test_university_routing.py`).

Demonstrates complete execution of the Multi-Agent University Capability Routing Engine:
  1. Requirement Extraction (openai/gpt-oss-120b)
  2. Supabase PGVector Hybrid Retrieval
  3. Deterministic 6-Factor Capability Scoring
  4. Rich Faculty Expert Reranking & Matching
  5. Evidence-Backed Explainable Report Generation

Usage:
    cd "/home/bappaditya/coding/2026 Projects/sih project/Social-issues/ai-service"
    PYTHONPATH=. venv/bin/python3 scripts/test_university_routing.py
"""

import sys
import json
import argparse
from pathlib import Path

# ── Robust Path Resolution ──────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).resolve().parent
AI_SERVICE_DIR = SCRIPT_DIR.parent
sys.path.insert(0, str(AI_SERVICE_DIR))

from app.graphs.university_routing_graph import UniversityRoutingPipeline


def main():
    parser = argparse.ArgumentParser(description="University Capability Routing CLI")
    parser.add_argument(
        "--problem",
        type=str,
        default="High arsenic, fluoride, and heavy metal contamination in rural drinking water in Dhanbad district. Need low-cost sustainable filtration technology, water quality testing laboratory facilities, prototyping, and community field deployment research team.",
        help="Problem statement query"
    )
    args = parser.parse_args()

    print("\n" + "=" * 90)
    print("🏛️  UNIVERSITY CAPABILITY INTELLIGENCE & ROUTING ENGINE")
    print("=" * 90)
    print(f"📋 PROBLEM STATEMENT:\n   {args.problem}\n")

    pipeline = UniversityRoutingPipeline()
    state = pipeline.run(args.problem)

    print("-" * 90)
    print("🎯 STEP 1: EXTRACTED TECHNICAL REQUIREMENTS")
    print("-" * 90)
    if state.requirements:
        req = state.requirements
        print(f"  • Primary Domain        : {req.domain}")
        print(f"  • Problem Summary       : {req.problem_summary}")
        print(f"  • Required Disciplines  : {', '.join(req.required_disciplines)}")
        print(f"  • Expertise Keywords    : {', '.join(req.expertise_keywords)}")
        print(f"  • Required Capabilities : {', '.join(req.required_capabilities)}")
        print(f"  • Prototyping Needed    : {req.prototyping_needed} | Incubation Needed: {req.incubation_needed}")
        print(f"  • Target Location       : {req.district}, {req.state}")

    print("\n" + "-" * 90)
    print("📊 STEP 2 & 3: RANKED UNIVERSITY CAPABILITY SCORES (6-FACTOR WEIGHTED)")
    print("-" * 90)
    for uni in state.scored_universities:
        bd = uni.breakdown
        print(f"🏆 Rank #{state.scored_universities.index(uni) + 1} | Score: {uni.total_score * 100:.1f}% ({uni.total_score:.4f})")
        print(f"   Institution : {uni.university_name} ({uni.university_code})")
        print(f"   ├── Faculty Expertise Match (30%) : {bd.s_faculty:.2f}")
        print(f"   ├── Research & Projects     (25%) : {bd.s_research:.2f}")
        print(f"   ├── Department Alignment    (15%) : {bd.s_dept:.2f}")
        print(f"   ├── Lab & Testing Facility  (15%) : {bd.s_facility:.2f}")
        print(f"   ├── Incubation Facility     (10%) : {bd.s_incubator:.2f}")
        print(f"   └── Geographic Proximity     (5%) : {bd.s_geo:.2f}\n")

    print("-" * 90)
    print("👨‍🔬 STEP 4: MATCHED PRIMARY FACULTY EXPERTS WITH RICH CONTACT CARDS")
    print("-" * 90)
    for uni_code, experts in state.matched_experts.items():
        print(f"\n📍 Matched Experts for {uni_code}:")
        for idx, exp in enumerate(experts, 1):
            print(f"   #{idx} {exp.name} ({exp.designation})")
            print(f"       Department     : {exp.department}")
            print(f"       Match Score    : {exp.match_score:.4f}")
            if exp.email:
                print(f"       Email          : {exp.email}")
            if exp.phone:
                print(f"       Phone          : {exp.phone}")
            if exp.profile_url:
                print(f"       Profile Link   : {exp.profile_url}")
            if exp.profile_image_url:
                print(f"       Profile Photo  : {exp.profile_image_url}")
            if exp.cv_url:
                print(f"       CV PDF Link    : {exp.cv_url}")
            if exp.publications_pdf_url:
                print(f"       Pubs PDF Link  : {exp.publications_pdf_url}")
            print(f"       Reason         : {exp.relevance_reason}")

    print("\n" + "-" * 90)
    print("📜 STEP 5 & 6: EXECUTIVE EXPLAINABLE REPORT FOR GOVERNMENT NODAL OFFICERS")
    print("-" * 90)
    if state.routing_report:
        report = state.routing_report
        print(f"\n💡 EXECUTIVE SUMMARY:\n   {report.executive_summary}\n")
        
        print("📌 ACTIONABLE NEXT STEPS FOR NODAL OFFICER:")
        for step in report.suggested_next_steps:
            print(f"   [ ] {step}")

    print("\n" + "=" * 90)
    print("✅ UNIVERSITY ROUTING PIPELINE EXECUTION COMPLETE!")
    print("=" * 90 + "\n")


if __name__ == "__main__":
    main()
