"""
DEVELOPMENT TEST SEED DATA ONLY: Step 2 Expertise Taxonomy & Aliases Seed
============================================================================
CRITICAL NOTICE:
The taxonomy domains, nodes, and aliases defined below are SYNTHETIC FIXTURES
created for local schema verification, relationship testing, and development.
THEY DO NOT REPRESENT OFFICIAL CURATED GROUND-TRUTH ACADEMIC TAXONOMIES.
DO NOT TREAT THESE AS VERIFIED PRODUCTION KNOWLEDGE-BASE DATA.
============================================================================
"""
from typing import Dict, List, Tuple
from loguru import logger
from app.infrastructure.database.client import get_db_cursor

# Domains & Sub-domains structured as (Level 1 Domain -> List of Level 2 Sub-domains)
TAXONOMY_TREE = {
    "Water Resources": [
        ("Hydrology", "Scientific study of the movement, distribution, and management of water resources."),
        ("Groundwater", "Subsurface water storage, hydrogeology, and aquifer modeling."),
        ("Water Quality", "Assessment of physical, chemical, and biological characteristics of water."),
        ("Irrigation", "Agricultural water conveyance, micro-irrigation, and watershed management.")
    ],
    "Agriculture": [
        ("Crop Science", "Agronomy, crop physiology, and cultivation techniques."),
        ("Soil Science", "Soil fertility, soil conservation, and agricultural chemistry."),
        ("Agricultural Engineering", "Farm machinery, processing, and agricultural structures."),
        ("Precision Agriculture", "Data-driven farming, sensors, and yield optimization.")
    ],
    "Healthcare": [
        ("Public Health", "Epidemiology, health policy, and community disease prevention."),
        ("Community Health", "Grassroots healthcare delivery, maternal care, and rural health clinics."),
        ("Medical Technology", "Diagnostic equipment, biomedical engineering, and tele-health.")
    ],
    "Environment": [
        ("Environmental Engineering", "Pollution remediation, waste water treatment, and effluent control."),
        ("Waste Management", "Municipal solid waste, bio-medical waste, and circular economy."),
        ("Air Quality", "Atmospheric monitoring, particulate matter control, and emission reduction."),
        ("Climate Science", "Regional climate impact, carbon sequestration, and climate adaptation.")
    ],
    "Rural Infrastructure": [
        ("Civil Engineering", "Structural design, rural bridges, embankments, and earthworks."),
        ("Transportation", "Pavement design, all-weather rural roads, and public transport access."),
        ("Rural Electrification", "Microgrids, grid distribution, and decentralised rural power.")
    ],
    "Energy": [
        ("Renewable Energy", "Clean energy generation, bio-energy, and hybrid energy systems."),
        ("Solar Energy", "Photovoltaic cells, rooftop solar, solar pump systems, and thermal collectors."),
        ("Energy Storage", "Battery technology, supercapacitors, and grid-scale energy storage.")
    ],
    "Mining": [
        ("Mining Engineering", "Surface and underground mining methods, mineral extraction, and slope stability."),
        ("Mine Safety", "Gas detection, mine ventilation, occupational hazards, and disaster mitigation."),
        ("Mineral Processing", "Beneficiation, mineral dressing, and extraction metallurgy.")
    ]
}

# Aliases / Synonyms: Subdomain -> List of (alias, normalized_alias, language_code)
TAXONOMY_ALIASES = {
    "Hydrology": [
        ("Hydrological Engineering", "hydrological engineering", "en"),
        ("Water Hydrology", "water hydrology", "en"),
        ("Surface Hydrology", "surface hydrology", "en")
    ],
    "Groundwater": [
        ("Ground Water", "ground water", "en"),
        ("Groundwater Engineering", "groundwater engineering", "en"),
        ("Hydrogeology", "hydrogeology", "en")
    ],
    "Solar Energy": [
        ("Solar Power", "solar power", "en"),
        ("Solar Technology", "solar technology", "en"),
        ("Photovoltaics", "photovoltaics", "en")
    ],
    "Waste Management": [
        ("Solid Waste Management", "solid waste management", "en"),
        ("Refuse Disposal", "refuse disposal", "en")
    ],
    "Civil Engineering": [
        ("Infrastructure Engineering", "infrastructure engineering", "en"),
        ("Structural Engineering", "structural engineering", "en")
    ]
}


def seed_taxonomy() -> Dict[str, int]:
    """Seed the Step 2 Development Test Taxonomy and Synonyms."""
    logger.info("Seeding Step 2 Development Test Taxonomy and Aliases...")
    counts = {"domains_l1": 0, "subdomains_l2": 0, "aliases": 0}

    with get_db_cursor(commit=True, dict_cursor=True) as cur:
        # Cache of node_name -> id
        node_ids: Dict[str, str] = {}

        # 1. Insert Level 1 Domains
        for domain_name in TAXONOMY_TREE.keys():
            cur.execute("""
                INSERT INTO expertise_taxonomy (name, description, parent_id, level, status)
                VALUES (%s, %s, NULL, 1, 'ACTIVE')
                ON CONFLICT (parent_id, name) DO UPDATE 
                SET description = EXCLUDED.description, updated_at = NOW()
                RETURNING id;
            """, (domain_name, f"Development test domain for {domain_name}"))
            dom_id = cur.fetchone()["id"]
            node_ids[domain_name] = dom_id
            counts["domains_l1"] += 1

        # 2. Insert Level 2 Sub-domains
        for domain_name, subdomains in TAXONOMY_TREE.items():
            parent_id = node_ids[domain_name]
            for sub_name, sub_desc in subdomains:
                cur.execute("""
                    INSERT INTO expertise_taxonomy (name, description, parent_id, level, status)
                    VALUES (%s, %s, %s, 2, 'ACTIVE')
                    ON CONFLICT (parent_id, name) DO UPDATE 
                    SET description = EXCLUDED.description, level = EXCLUDED.level, updated_at = NOW()
                    RETURNING id;
                """, (sub_name, sub_desc, parent_id))
                sub_id = cur.fetchone()["id"]
                node_ids[sub_name] = sub_id
                counts["subdomains_l2"] += 1

        # 3. Insert Taxonomy Aliases / Synonyms
        for sub_name, alias_tuples in TAXONOMY_ALIASES.items():
            if sub_name not in node_ids:
                continue
            expertise_id = node_ids[sub_name]
            for alias, norm_alias, lang in alias_tuples:
                cur.execute("""
                    INSERT INTO expertise_aliases (expertise_id, alias, normalized_alias, language_code)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (expertise_id, normalized_alias) DO UPDATE
                    SET alias = EXCLUDED.alias, language_code = EXCLUDED.language_code, updated_at = NOW();
                """, (expertise_id, alias, norm_alias, lang))
                counts["aliases"] += 1

    logger.info("Taxonomy seeding completed successfully. Counts: {}", counts)
    return counts


if __name__ == "__main__":
    res = seed_taxonomy()
    print("\n" + "="*60)
    print("  STEP 2 TAXONOMY DEVELOPMENT TEST SEED COMPLETE")
    print("="*60)
    for k, v in res.items():
        print(f"  {k:22}: {v}")
    print("="*60 + "\n")
