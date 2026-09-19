"""
Seed script for Top 5 Jharkhand Universities and their Crawl Configurations & Priority Targets.
Idempotent: Safe to execute multiple times.
"""
import sys
import os
from typing import Dict, List, Any

# Ensure app is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.infrastructure.database.client import get_db_cursor
from app.utils.logger import logger

TOP_5_UNIVERSITIES_DATA = [
    {
        "code": "IIT_ISM_DHANBAD",
        "name": "Indian Institute of Technology (ISM) Dhanbad",
        "district": "Dhanbad",
        "state": "Jharkhand",
        "website": "https://www.iitism.ac.in",
        "latitude": 23.8143,
        "longitude": 86.4412,
        "max_active_challenges": 50,
        "crawl_config": {
            "base_url": "https://www.iitism.ac.in",
            "allowed_domains": ["iitism.ac.in", "www.iitism.ac.in"],
            "max_depth": 3,
            "crawl_delay_seconds": 2.0,
            "max_pages": 400,
            "sitemap_url": "https://www.iitism.ac.in/sitemap.xml",
        },
        "targets": [
            {"url": "https://www.iitism.ac.in/depts/environmental-science", "type": "DEPARTMENT_LIST", "priority": 10},
            {"url": "https://www.iitism.ac.in/depts/civil", "type": "DEPARTMENT_LIST", "priority": 9},
            {"url": "https://www.iitism.ac.in/depts/mining", "type": "DEPARTMENT_LIST", "priority": 9},
            {"url": "https://www.iitism.ac.in/centres/water-centre", "type": "RESEARCH_CENTRE", "priority": 10},
            {"url": "https://www.iitism.ac.in/facilities/crf", "type": "LAB_DIRECTORY", "priority": 8},
            {"url": "https://www.iitism.ac.in/innovation/ciie", "type": "TBI", "priority": 8},
        ]
    },
    {
        "code": "BIT_MESRA",
        "name": "Birla Institute of Technology (BIT) Mesra",
        "district": "Ranchi",
        "state": "Jharkhand",
        "website": "https://www.bitmesra.ac.in",
        "latitude": 23.4123,
        "longitude": 85.4399,
        "max_active_challenges": 40,
        "crawl_config": {
            "base_url": "https://www.bitmesra.ac.in",
            "allowed_domains": ["bitmesra.ac.in", "www.bitmesra.ac.in"],
            "max_depth": 3,
            "crawl_delay_seconds": 2.0,
            "max_pages": 400,
            "sitemap_url": "https://www.bitmesra.ac.in/sitemap.xml",
        },
        "targets": [
            {"url": "https://www.bitmesra.ac.in/cee", "type": "DEPARTMENT_LIST", "priority": 10},
            {"url": "https://www.bitmesra.ac.in/biotech", "type": "DEPARTMENT_LIST", "priority": 9},
            {"url": "https://www.bitmesra.ac.in/remote-sensing", "type": "DEPARTMENT_LIST", "priority": 9},
            {"url": "https://www.bitmesra.ac.in/facilities/cif", "type": "LAB_DIRECTORY", "priority": 8},
            {"url": "https://www.bitmesra.ac.in/tbi", "type": "TBI", "priority": 9},
        ]
    },
    {
        "code": "NIT_JAMSHEDPUR",
        "name": "National Institute of Technology (NIT) Jamshedpur",
        "district": "East Singhbhum",
        "state": "Jharkhand",
        "website": "https://www.nitjsr.ac.in",
        "latitude": 22.7752,
        "longitude": 86.1438,
        "max_active_challenges": 35,
        "crawl_config": {
            "base_url": "https://www.nitjsr.ac.in",
            "allowed_domains": ["nitjsr.ac.in", "www.nitjsr.ac.in"],
            "max_depth": 3,
            "crawl_delay_seconds": 2.0,
            "max_pages": 300,
            "sitemap_url": "https://www.nitjsr.ac.in/sitemap.xml",
        },
        "targets": [
            {"url": "https://www.nitjsr.ac.in/department/civil-engineering", "type": "DEPARTMENT_LIST", "priority": 10},
            {"url": "https://www.nitjsr.ac.in/department/metallurgical-and-materials-engineering", "type": "DEPARTMENT_LIST", "priority": 9},
            {"url": "https://www.nitjsr.ac.in/research/centres/renewable-energy", "type": "RESEARCH_CENTRE", "priority": 9},
            {"url": "https://www.nitjsr.ac.in/industry-academia-relations", "type": "TBI", "priority": 7},
        ]
    },
    {
        "code": "BAU_RANCHI",
        "name": "Birsa Agricultural University",
        "district": "Ranchi",
        "state": "Jharkhand",
        "website": "https://www.bauranchi.org",
        "latitude": 23.4352,
        "longitude": 85.3211,
        "max_active_challenges": 30,
        "crawl_config": {
            "base_url": "https://www.bauranchi.org",
            "allowed_domains": ["bauranchi.org", "www.bauranchi.org"],
            "max_depth": 3,
            "crawl_delay_seconds": 2.0,
            "max_pages": 300,
            "sitemap_url": "https://www.bauranchi.org/sitemap.xml",
        },
        "targets": [
            {"url": "https://www.bauranchi.org/ssac", "type": "DEPARTMENT_LIST", "priority": 10},
            {"url": "https://www.bauranchi.org/agronomy", "type": "DEPARTMENT_LIST", "priority": 9},
            {"url": "https://www.bauranchi.org/agri-engg", "type": "DEPARTMENT_LIST", "priority": 9},
            {"url": "https://www.bauranchi.org/facilities/soil-testing-lab", "type": "LAB_DIRECTORY", "priority": 9},
            {"url": "https://www.bauranchi.org/kvk-directory", "type": "RESEARCH_CENTRE", "priority": 8},
        ]
    },
    {
        "code": "AIIMS_DEOGHAR",
        "name": "All India Institute of Medical Sciences (AIIMS) Deoghar",
        "district": "Deoghar",
        "state": "Jharkhand",
        "website": "https://www.aiimsdeoghar.edu.in",
        "latitude": 24.4826,
        "longitude": 86.7001,
        "max_active_challenges": 30,
        "crawl_config": {
            "base_url": "https://www.aiimsdeoghar.edu.in",
            "allowed_domains": ["aiimsdeoghar.edu.in", "www.aiimsdeoghar.edu.in"],
            "max_depth": 3,
            "crawl_delay_seconds": 2.0,
            "max_pages": 250,
            "sitemap_url": "https://www.aiimsdeoghar.edu.in/sitemap.xml",
        },
        "targets": [
            {"url": "https://www.aiimsdeoghar.edu.in/departments/community-medicine", "type": "DEPARTMENT_LIST", "priority": 10},
            {"url": "https://www.aiimsdeoghar.edu.in/departments/microbiology", "type": "DEPARTMENT_LIST", "priority": 9},
            {"url": "https://www.aiimsdeoghar.edu.in/facilities/telemedicine-hub", "type": "LAB_DIRECTORY", "priority": 9},
        ]
    }
]


def seed_crawl_configurations() -> Dict[str, int]:
    """Seeds universities master records, crawl configurations, and targets."""
    counts = {"universities": 0, "crawl_configurations": 0, "crawl_targets": 0}

    with get_db_cursor(commit=True, dict_cursor=True) as cur:
        logger.info("Seeding Top 5 Jharkhand Universities and Crawl Configurations...")

        for item in TOP_5_UNIVERSITIES_DATA:
            # 1. Upsert University by code or website
            cur.execute("""
                SELECT id FROM universities WHERE code = %s OR website = %s;
            """, (item["code"], item["website"]))
            existing = cur.fetchone()

            if existing:
                uni_id = existing["id"]
                cur.execute("""
                    UPDATE universities 
                    SET code = %s, name = %s, district = %s, state = %s, website = %s, 
                        latitude = %s, longitude = %s, max_active_challenges = %s, updated_at = NOW()
                    WHERE id = %s;
                """, (
                    item["code"], item["name"], item["district"], item["state"], 
                    item["website"], item["latitude"], item["longitude"], item["max_active_challenges"], uni_id
                ))
            else:
                cur.execute("""
                    INSERT INTO universities (code, name, district, state, website, latitude, longitude, max_active_challenges, status)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'ACTIVE')
                    RETURNING id;
                """, (
                    item["code"], item["name"], item["district"], item["state"], 
                    item["website"], item["latitude"], item["longitude"], item["max_active_challenges"]
                ))
                uni_id = cur.fetchone()["id"]
            counts["universities"] += 1


            # 2. Upsert Crawl Configuration
            cfg = item["crawl_config"]
            cur.execute("""
                INSERT INTO crawl_configurations (
                    university_id, base_url, allowed_domains, max_depth, 
                    crawl_delay_seconds, max_pages, sitemap_url, is_active, status
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, TRUE, 'IDLE')
                ON CONFLICT (university_id) DO UPDATE 
                SET base_url = EXCLUDED.base_url, allowed_domains = EXCLUDED.allowed_domains,
                    max_depth = EXCLUDED.max_depth, crawl_delay_seconds = EXCLUDED.crawl_delay_seconds,
                    max_pages = EXCLUDED.max_pages, sitemap_url = EXCLUDED.sitemap_url, updated_at = NOW();
            """, (
                uni_id, cfg["base_url"], cfg["allowed_domains"], cfg["max_depth"],
                cfg["crawl_delay_seconds"], cfg["max_pages"], cfg.get("sitemap_url")
            ))
            counts["crawl_configurations"] += 1

            # 3. Upsert Priority Targets
            for target in item.get("targets", []):
                cur.execute("""
                    INSERT INTO crawl_targets (university_id, url, target_type, priority, is_active)
                    VALUES (%s, %s, %s, %s, TRUE)
                    ON CONFLICT (university_id, url) DO UPDATE 
                    SET target_type = EXCLUDED.target_type, priority = EXCLUDED.priority, updated_at = NOW();
                """, (uni_id, target["url"], target["type"], target["priority"]))
                counts["crawl_targets"] += 1

        logger.info("Crawl configurations seeded successfully: {}", counts)
        return counts



seed_all = seed_crawl_configurations


if __name__ == "__main__":
    res = seed_crawl_configurations()
    print("\n" + "=" * 60)
    print("  TOP 5 JHARKHAND CRAWL CONFIGURATIONS SEED COMPLETE")
    print("=" * 60)
    for k, v in res.items():
        print(f"  {k:24}: {v}")
    print("=" * 60 + "\n")

